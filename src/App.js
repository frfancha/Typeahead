import React from "react";
import "./App.css";
import Typeahead from "./Typeahead";

function App() {
  const result2suggestions = result => {
    let suggestions;
    if (result.work) {
      // if we have a work property
      if (result.work.length) {
        // is this an array?
        suggestions = result.work;
      } else if (result.work.titleAuth) {
        // or a single item
        suggestions = [result.work];
      }
    }
    return suggestions;
  };
  return (
    <div className="App">
      <label>Un typeahead:</label>
      <Typeahead
        search2url={v => "/resources/works?search=" + encodeURIComponent(v)}
        result2suggestions={result2suggestions}
        suggestion2display={v => v.titleAuth}
      ></Typeahead>
      <label>Et un deuxième:</label>
      <Typeahead
        search2url={v => "/resources/works?search=" + encodeURIComponent(v)}
        result2suggestions={result2suggestions}
        suggestion2display={v => v.titleAuth}
      ></Typeahead>
    </div>
  );
}

export default App;
