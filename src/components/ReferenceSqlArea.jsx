import { useState } from 'react';

function ReferenceSqlArea({ value, onChange }) {
    const handleChange = (event) => {
        onChange?.(event.target.value);
    };

    return (
        <div>
            <h2>Input</h2>
            <textarea
                id="referenced-sql"
                name="content"
                value={value}
                onChange={handleChange}
                placeholder="SQL before compilation"
                cols="80"
                rows="40"
            />
        </div>
    );
};

export default ReferenceSqlArea;