import React, { useState } from "react";
const Typeahead = props => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const onChange = e => {
    const value = e.target.value;
    setInputValue(value);
    if (value) {
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
            // if we have a work property
            if (result.work.length) {
              // is this an array?
              // use the titleAuth as display
              setSuggestions(result.work.map(v => v.titleAuth));
            } else if (result.work.titleAuth) {
              // or a single item
              setSuggestions([result.work.titleAuth]);
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
  };
  return (
    <div>
      <input value={inputValue} onChange={onChange} />
      {suggestions.map((s, i) => (
        <div key={i}>{s}</div>
      ))}
    </div>
  );
};
export default Typeahead;
