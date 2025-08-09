import '../styles/Transform.css';
import { format } from 'sql-formatter';

function Transform({ inputSql = '', onTransformed }) {
    function transformSql() {
        const sql = inputSql ?? '';
        if (!sql.trim()) {
        onTransformed?.('');
        return;
        }

        const normalized = (function normalizeSql(s) {
        let r = s
            .replace(/\s+/g, ' ')
            .replace(/\s*,\s*/g, ', ')
            .replace(/\s*\(\s*/g, '(')
            .replace(/\s*\)\s*/g, ')')
            .replace(/\s*;\s*$/, ';')
            .replace(/\s*:\s*/g, ': ')
            .trim();

        // Replace token only when it’s standalone (preceded by start/space/(,/= and followed by end/space/)/, /; /=)
        const boundaryReplace = (str, token, replacement) => {
            const tokenPattern = token.replace(/\s+/g, '\\s+'); // tolerate single spaces inside token
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
        })(sql); 

        // ${ref({ database: "...", schema: "...", name: "..." })} -> project.schema.name
        function replaceRefObjectPatterns(input, defaultProject = 'defaultproject') {
        // Capture the object body inside ${ref({ ... })}
            const outer = /\$\{ref\(\s*\{\s*([^}]*)\}\s*\)\}/gi;

            return input.replace(outer, (full, objBody) => {
                // Extract database|schema|name regardless of order and quoting
                const kvRe = /\b(database|schema|name)\b\s*:\s*(?:"([^"]+)"|'([^']+)'|`([^`]+)`|([A-Za-z_][\w$.-]*))/gi;

                let db, sch, nm, m;
                while ((m = kvRe.exec(objBody)) !== null) {
                const key = m[1].toLowerCase();
                const val = (m[2] ?? m[3] ?? m[4] ?? m[5] ?? '').trim();
                if (key === 'database') db = val;
                else if (key === 'schema') sch = val;
                else if (key === 'name') nm = val;
                }

                // Require schema and name; use default for missing database
                if (!sch || !nm) return full;
                const project = db && db.length ? db : defaultProject;
                return `${project}.${sch}.${nm}`;
            });
            };
        function revertRefObjectPatterns(input, defaultProject = "defaultproject") {
            const dotPattern = /\b([A-Za-z_][\w.-]*)\.([A-Za-z_][\w.-]*)\.([A-Za-z_][\w.-]*)\b/g;

            return input.replace(dotPattern, (full, project, schema, name) => {
                // If project is the default, omit the database field
                if (project === defaultProject) {
                return `\${ref({schema:"${schema}", name:"${name}"})}`;
                }
                return `\${ref({database:"${project}", schema:"${schema}", name:"${name}"})}`;
            });
            }

        const normalizedCompile = replaceRefObjectPatterns(normalized, 'defaultproject');

    let formatted = normalizedCompile;
    try {
      formatted = format(normalizedCompile, {
        language: 'sql',
        uppercase: true,
        indent: '  ',
        linesBetweenQueries: 1
      });
    } catch (e) {
      console.error('SQL format error:', e);
    }

    onTransformed?.(formatted);
  }

  return (
    <div className="transform">
      <button className="transform-btn" onClick={transformSql}>Transform</button>
    </div>
  );
}

export default Transform;