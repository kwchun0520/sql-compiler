import '../styles/Transform.css';
import { format } from 'sql-formatter';
import { useState } from 'react';

function Transform({ referencedSql = '', compiledSql = '', onCompiled, onReverted }) {
    // Allow user to override the default project used in ref replacements
    const [defaultProject, setDefaultProject] = useState('defaultproject');

    function normalizeSql(s) {
        let r = s
            .replace(/\s+/g, ' ')
            .replace(/\s*,\s*/g, ', ')
            .replace(/\s*\(\s*/g, '(')
            .replace(/\s*\)\s*/g, ')')
            .replace(/\s*;\s*$/, ';')
            .replace(/\s*:\s*/g, ': ')
            .trim();

        const boundaryReplace = (str, token, replacement) => {
            const tokenPattern = token.replace(/\s+/g, '\\s+');
            const re = new RegExp(`(^|[\\s(,=])${tokenPattern}(?=($|[\\s),;=]))`, 'gi');
            return str.replace(re, (_, p1) => `${p1}${replacement}`);
        };

        const KEYWORDS_MULTI = [
            'INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL JOIN','GROUP BY','ORDER BY',
            'UNION ALL','UNION DISTINCT','INTERSECT ALL','INTERSECT DISTINCT','EXCEPT ALL','EXCEPT DISTINCT',
            'CREATE TABLE','CREATE TEMP TABLE','CREATE TEMPORARY TABLE','CREATE VIEW','CREATE INDEX','CREATE UNIQUE INDEX',
            'DROP TABLE','DROP VIEW','DROP INDEX','ALTER TABLE','ALTER VIEW','ALTER INDEX',
            'INSERT INTO','INSERT INTO TEMP TABLE','INSERT INTO TEMPORARY TABLE',
            'DELETE FROM','TRUNCATE TABLE','MERGE INTO','CASE WHEN','PARTITION BY'
        ];

        const KEYWORDS_SINGLE = [
            'SELECT','DISTINCT','FROM','WHERE','JOIN','ON','HAVING','ASC','DESC','LIMIT','OFFSET','WITH',
            'AS','INTO','VALUES','SET','AND','OR','NOT','IS','LIKE','ILIKE','SIMILAR TO','REGEXP','BETWEEN',
            'EXISTS','ALL','ANY','SOME','IF','THEN','ELSE','END','RETURNING','USING','FOR','BY','RANGE','ROWS','OVER',
            'UPDATE','UPSERT','REPLACE','CALL','EXECUTE','EXEC','PREPARE','QUALIFY'
        ];

        const TYPES_MULTI = ['DOUBLE PRECISION','TIMESTAMP WITH TIME ZONE','TIMESTAMP WITHOUT TIME ZONE'];
        const TYPES_SINGLE = [
            'int','int64','integer','bigint','smallint','tinyint','serial','bigserial','decimal','numeric','real','float','float64',
            'money','char','nchar','varchar','varchar2','nvarchar','text','uuid','json','jsonb','xml','date','time',
            'datetime','timestamp','timestamptz','bool','boolean','blob','clob'
        ];

        for (const t of KEYWORDS_MULTI) r = boundaryReplace(r, t, t);
        for (const t of KEYWORDS_SINGLE) r = boundaryReplace(r, t, t);
        for (const t of TYPES_MULTI) r = boundaryReplace(r, t, t);
        for (const t of TYPES_SINGLE) r = boundaryReplace(r, t, t.toUpperCase());

        return r;
    };

    // ${ref({ database: "...", schema: "...", name: "..." })} -> project.schema.name
    function replaceRefObjectPatterns(input, defaultProject = 'defaultproject') {
        const outer = /\$\{ref\(\s*\{\s*([^}]*)\}\s*\)\}/gi;

        return input.replace(outer, (full, objBody) => {
            const kvRe = /\b(database|schema|name)\b\s*:\s*(?:"([^"]+)"|'([^']+)'|`([^`]+)`|([A-Za-z_][\w$.-]*))/gi;

            let db, sch, nm, m;
            while ((m = kvRe.exec(objBody)) !== null) {
                const key = m[1].toLowerCase();
                const val = (m[2] ?? m[3] ?? m[4] ?? m[5] ?? '').trim();
                if (key === 'database') db = val;
                else if (key === 'schema') sch = val;
                else if (key === 'name') nm = val;
            }

            if (!sch || !nm) return full;
            const project = db && db.length ? db : defaultProject;
            return `\`${project}.${sch}.${nm}\``;
        });
    };

    // project.schema.name -> ${ref({...})}
    function revertRefObjectPatterns(input, defaultProject = 'defaultproject') {
        const dotPattern = /\b([A-Za-z_][\w.-]*)\.([A-Za-z_][\w.-]*)\.([A-Za-z_][\w.-]*)\b/g;
        input = input.replace(/\`/g, '').trim();
        return input.replace(dotPattern, (full, project, schema, name) => {
            if (project === defaultProject) {
                return `\${ref({schema:"${schema}", name:"${name}"})}`;
            }
            return `\${ref({database:"${project}", schema:"${schema}", name:"${name}"})}`;
        });
    };

    // Remove Dataform-like config blocks: config { ... }
    function stripConfigBlocks(input) {
        if (!input) return input;
        // Prefer matches that start at line starts, then a broader fallback
        let out = input.replace(/(^|\n)\s*config\s*\{[\s\S]*?\}\s*(?=\n|$)/gi, '$1');
        out = out.replace(/\bconfig\s*\{[\s\S]*?\}\s*;?/gi, '');
        return out.trim();
    }

    function compileSql() {
        const sql = referencedSql ?? '';
        if (!sql.trim()) {
            onCompiled?.('');
            return;
        }
        // Strip config { ... } blocks before normalization/formatting
        const withoutConfig = stripConfigBlocks(sql);
        const normalized = normalizeSql(withoutConfig);
        const compiled = replaceRefObjectPatterns(normalized, defaultProject);

        let formatted = compiled;
        try {
            formatted = format(compiled, {
                language: 'sql',
                uppercase: true,
                indent: '  ',
                linesBetweenQueries: 1
            });
        } catch (e) {
            console.error('SQL format error:', e);
        }
        onCompiled?.(formatted);
    };

    function revertSql() {
        const sql = compiledSql ?? '';
        if (!sql.trim()) {
            onReverted?.('');
            return;
        }
        const normalized = normalizeSql(sql);

        let formatted = normalized;
        try {
            formatted = format(normalized, {
                language: 'sql',
                uppercase: true,
                indent: '  ',
                linesBetweenQueries: 1
            });
        } catch (e) {
            console.error('SQL format error:', e);
        }
        const revertedFormatted = revertRefObjectPatterns(formatted, defaultProject); 
        onReverted?.(revertedFormatted);
    }

    return (
        <div>
            <div className="transform">
                {/* Default project input */}
                <div className="default-project-input-group">
                    <label htmlFor="default-project" style={{ marginBottom: 4 }}>Default project</label>
                    <input
                        id="default-project"
                        type="text"
                        value={defaultProject}
                        onChange={(e) => setDefaultProject(e.target.value)}
                        placeholder="defaultproject"
                        style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc' }}
                    />
                </div>
                {/* Action buttons */}
                <button className="compile-btn" onClick={compileSql}>Compile</button>
                <button className="revert-btn" onClick={revertSql}>Revert</button>
            </div>
            <div></div>
        </div>
    );
}

export default Transform;