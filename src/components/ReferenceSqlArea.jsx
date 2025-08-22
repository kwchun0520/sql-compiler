import { useState } from 'react';

function ReferenceSqlArea({ value, onChange }) {
    const handleChange = (event) => {
        onChange?.(event.target.value);
    };

    return (
        <div>
            <h2>Before Compile</h2>
            <textarea
                id="referenced-sql"
                name="content"
                value={value}
                onChange={handleChange}
                placeholder="SQL before compilation"
                rows="50"
                // cols="80"
                // rows="40"
            />
        </div>
    );
};

export default ReferenceSqlArea;