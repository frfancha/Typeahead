import React, { useState } from "react";
const Typeahead = props => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState({});
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
                foundSuggestions = result.work.map(v => v.titleAuth);
              } else if (result.work.titleAuth) {
                // or a single item
                foundSuggestions = [result.work.titleAuth];
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
  return (
    <div>
      <input value={inputValue} onChange={onChange} />
      {suggestions[inputValue]
        ? suggestions[inputValue].map((s, i) => <div key={i}>{s}</div>)
        : null}
    </div>
  );
};
export default Typeahead;
