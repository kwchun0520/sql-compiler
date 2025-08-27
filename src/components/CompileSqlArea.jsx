import React from 'react';

function CompileSqlArea({ value, onChange }) {
  return (
    <div>
      <h2>Compiled SQL</h2>
      <textarea
        id="compiled-sql"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Compiled SQL will appear here..."
        className="form-control font-monospace"
        readOnly
      />
    </div>
  );
}

export default CompileSqlArea;
