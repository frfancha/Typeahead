import "./Typeahead.css";
import React, { useState, useRef, useEffect } from "react";
const highlight = (display, search) => {
  const f = [];
  let j = -1;
  let i = display.toUpperCase().indexOf(search.toUpperCase());
  while (j < display.length) {
    if (i === -1) {
      f.push(<span key={j + 1}>{display.slice(j + 1)}</span>);
      j = display.length;
    } else {
      if (i > j + 1) {
        f.push(<span key={j + 1}>{display.slice(j + 1, i)}</span>);
      }
      f.push(<b key={i}>{display.slice(i, i + search.length)}</b>);
      j = i + search.length - 1;
      i = display.toUpperCase().indexOf(search.toUpperCase(), j + 1);
    }
  }
  return f;
};
const Typeahead = ({ search2url, result2suggestions, suggestion2display }) => {
  const abortControllerRef = useRef();
  if (!abortControllerRef.current) {
    abortControllerRef.current = new AbortController();
  }
  useEffect(
    () => () => {
      abortControllerRef.current.abort();
    },
    []
  );
  const [changed, setChanged] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState({});
  const [error, setError] = useState(false);
  const ignoreBlurRef = useRef(false);
  const onChange = e => {
    setChanged(true);
    const value = e.target.value;
    setInputValue(value);
    if (value) {
      // undefined = no search has ever been made on that string
      if (suggestions[value] === undefined) {
        // mark null to avoid launching another search on same key
        suggestions[value] = null;
        const f = async () => {
          let query = search2url(value);
          try {
            const fetchResult = await fetch(query, {
              signal: abortControllerRef.current.signal,
              headers: {
                Accept: "application/json"
              }
            });
            const result = await fetchResult.json();
            const rows = result2suggestions(result);
            if (rows) {
              rows.forEach(v => {
                v.display = suggestion2display(v);
                v.html = highlight(v.display, value);
              });
              setSuggestions(v => ({
                ...v,
                [value]: { rows: rows, selected: rows[0] }
              }));
            }
          } catch (err) {
            if (err.name === "AbortError") {
              console.log(value + " Request was canceled via controller.abort");
              return;
            }
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
    abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    if (ignoreBlurRef.current) {
      return;
    }
    if (sugg) {
      setInputValue(sugg.selected.display);
      setChanged(false);
    } else {
      if (inputValue && changed) {
        setError(true);
      }
    }
    setSuggestions({});
  };
  const onFocus = () => {
    setError(false);
  };
  return (
    <div>
      <input
        value={inputValue}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className={error ? "error" : null}
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
                  setChanged(false);
                  setSuggestions({});
                }}
              >
                {s.html}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default Typeahead;
