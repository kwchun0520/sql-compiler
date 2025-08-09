import { useState } from 'react';



function CompileSqlArea({ value }) {
    return (
        <div>
            <h2>Output</h2>
            <textarea
                id="compiled-sql"
                name="content"
                value={value}
                placeholder="SQL after compilation"
                cols="80"
                rows="40"
                readOnly
            />
        </div>
    );
};

export default CompileSqlArea;