import React from 'react';

function InputSqlArea({ value, onChange }) {
  return (
    <div>
      <h2>Input SQL</h2>
      <textarea
        id="input-sql"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Enter your SQL here..."
        className="form-control font-monospace"
      />
    </div>
  );
}

export default InputSqlArea;
