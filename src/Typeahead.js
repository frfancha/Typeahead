import "./Typeahead.css";
import React, { useState, useRef } from "react";
const Typeahead = props => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState({});
  const ignoreBlurRef = useRef(false);
  const onChange = e => {
    const value = e.target.value;
    setInputValue(value);
    // console log the current "state" of the suggestions:
    console.log(
      "already searched: " +
        Object.keys(suggestions)
          .map(
            k =>
              k + "(" + (suggestions[k] ? suggestions[k].length : "null") + ")"
          )
          .join(", ")
    );
    if (value) {
      // undefined = no search has ever been made on that string
      if (suggestions[value] === undefined) {
        // just to check that we fetch only once by text:
        console.log("search for " + value);
        // mark null to avoid launching another search on same key
        suggestions[value] = null;
        const f = async () => {
          let query = "/resources/works?search=" + encodeURIComponent(value);
          try {
            const fetchResult = await fetch(query, {
              headers: {
                Accept: "application/json"
              }
            });
            const result = await fetchResult.json();
            if (result.work) {
              let foundSuggestions;
              // if we have a work property
              if (result.work.length) {
                // is this an array?
                // use the titleAuth as display
                result.work.forEach(v => {
                  v.display = v.titleAuth;
                });
                foundSuggestions = {
                  selected: result.work[0],
                  rows: result.work
                };
              } else if (result.work.titleAuth) {
                // or a single item
                result.work.display = result.work.titleAuth;
                foundSuggestions = {
                  selected: result.work,
                  rows: [result.work]
                };
              }
              if (foundSuggestions) {
                setSuggestions(v => ({ ...v, [value]: foundSuggestions }));
              }
            }
          } catch (err) {
            // handle other errors here
            console.error(err);
            return;
          }
        };
        f();
      }
    }
  };
  const sugg = suggestions[inputValue];
  const onKeyDown = e => {
    if (e.keyCode === 9 || e.key === "Tab") {
      ignoreBlurRef.current = false;
      return;
    }
    if (sugg) {
      let selectedIndex = sugg.rows.indexOf(sugg.selected);
      let newSelectedIndex = selectedIndex;
      if (e.keyCode === 38 || e.key === "ArrowUp") {
        newSelectedIndex -= 1;
        if (newSelectedIndex < 0) {
          newSelectedIndex = sugg.rows.length - 1;
        }
      }
      if (e.keyCode === 40 || e.key === "ArrowDown") {
        newSelectedIndex += 1;
        if (newSelectedIndex > sugg.rows.length - 1) {
          newSelectedIndex = 0;
        }
      }
      if (e.keyCode === 36 || e.key === "Home") {
        newSelectedIndex = 0;
      }
      if (e.keyCode === 35 || e.key === "End") {
        newSelectedIndex = sugg.rows.length - 1;
      }
      if (newSelectedIndex !== selectedIndex) {
        setSuggestions(v => {
          return {
            ...v,
            [inputValue]: {
              rows: sugg.rows,
              selected: sugg.rows[newSelectedIndex]
            }
          };
        });
      }
    }
  };
  const onBlur = () => {
    if (ignoreBlurRef.current) {
      return;
    }
    if (sugg) {
      setInputValue(sugg.selected.display);
    }
    setSuggestions({});
  };
  return (
    <div>
      <input
        value={inputValue}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      />
      {sugg ? (
        <div style={{ position: "relative" }}>
          <div className="suggestions">
            {sugg.rows.map((s, i) => (
              <div
                className={
                  s === sugg.selected ? "suggestion selected" : "suggestion"
                }
                key={i}
                onMouseEnter={() => {
                  ignoreBlurRef.current = true;
                }}
                onMouseLeave={() => {
                  ignoreBlurRef.current = false;
                }}
                onClick={() => {
                  setInputValue(s.display);
                  setSuggestions({});
                }}
              >
                {s.display}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default Typeahead;
