import React from 'react';

function OutputSqlArea({ value, onChange }) {
  return (
    <div>
      <h2>Output SQL</h2>
      <textarea
        id="output-sql"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Output SQL will appear here..."
        className="form-control font-monospace"
        readOnly
      />
    </div>
  );
}

export default OutputSqlArea;