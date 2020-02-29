import React from "react";
import "./App.css";
import Typeahead from "./Typeahead";

function App() {
  return (
    <div className="App">
      <label>Un typeahead:</label>
      <Typeahead></Typeahead>
      <label>Et un deuxième:</label>
      <Typeahead></Typeahead>
    </div>
  );
}

export default App;
