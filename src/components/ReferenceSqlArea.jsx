import React from 'react';

function ReferenceSqlArea({ value, onChange }) {
  return (
    <div>
      <h2>Reference SQL</h2>
      <textarea
        id="referenced-sql"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Enter your SQL here..."
        className="form-control font-monospace"
      />
    </div>
  );
}

export default ReferenceSqlArea;
