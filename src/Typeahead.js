import React, { useState } from "react";
const Typeahead = props => {
  const [inputValue, setInputValue] = useState("");
  const onChange = e => {
    setInputValue(e.target.value);
  };
  return (
    <div>
      <input value={inputValue} onChange={onChange} />
    </div>
  );
};
export default Typeahead;
