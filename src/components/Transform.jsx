import { format } from 'sql-formatter';
import { useImperativeHandle, forwardRef } from 'react';

const QUERY_LABEL_REGEX = /SET\s+@@query_label\s*=\s*["']([^"']+)["']/i;
const QUERY_LABEL_FIELD_REGEX = {
    dataset: /dataset\s*:\s*([^,]+)/i,
    output: /output\s*:\s*([^,]+)/i,
};

function extractQueryLabelMetadata(sql) {
    const match = QUERY_LABEL_REGEX.exec(sql);
    if (!match) return {};

    const labelContent = match[1];
    const metadata = {};

    Object.entries(QUERY_LABEL_FIELD_REGEX).forEach(([key, fieldRegex]) => {
        const fieldMatch = fieldRegex.exec(labelContent);
        if (fieldMatch) {
            // Strip potential quotes and trim
            metadata[key] = fieldMatch[1].replace(/["']/g, '').trim();
        }
    });

    return metadata;
}

function replaceSelfReferences(input, project, metadata = {}) {
    const sanitizedProject = project?.trim();
    if (!sanitizedProject) return input;

    const dataset = metadata.dataset?.trim();
    const output = metadata.output?.trim();
    if (!dataset || !output) return input;

    const replacement = `\`${sanitizedProject}.${dataset}.${output}\``;
    return input.replace(/\$\{self\(\)\}/g, replacement);
}

const Transform = forwardRef(function Transform(
    {
        inputSql = '',
        defaultProject = 'defaultproject',
        replaceMapping = '',
        isReverseMode = false,
        onCompiled,
        onReverted,
    },
    ref
) {
    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        runTransform: () => {
            if (isReverseMode) {
                revertSql();
            } else {
                compileSql();
            }
        }
    }));

    function normalizeSql(s) {
        let r = s;

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
            'money','char','nchar','varchar','varchar2','nvarchar','text','uuid','json','jsonb','xml','date','time'
        ];

        for (const t of KEYWORDS_MULTI) r = boundaryReplace(r, t, t);
        for (const t of KEYWORDS_SINGLE) r = boundaryReplace(r, t, t);
        for (const t of TYPES_MULTI) r = boundaryReplace(r, t, t);
        for (const t of TYPES_SINGLE) r = boundaryReplace(r, t, t);

        return r;
    }

    function stripConfigBlocks(sql) {
        // More robust stripping that handles nested braces
        let result = sql;
        const configRegex = /^\s*config\s*\{/gmi;
        let match;
        while ((match = configRegex.exec(result)) !== null) {
            const start = match.index;
            let braceCount = 1;
            let end = -1;
            for (let i = start + match[0].length; i < result.length; i++) {
                if (result[i] === '{') braceCount++;
                else if (result[i] === '}') braceCount--;
                if (braceCount === 0) {
                    end = i;
                    break;
                }
            }
            if (end !== -1) {
                result = result.substring(0, start) + result.substring(end + 1);
                configRegex.lastIndex = 0; // Reset as string changed
            } else {
                break; // Unclosed brace, stop trying to avoid infinite loop
            }
        }
        return result;
    }

    function replaceRefObjectPatterns(input, defaultProject = 'defaultproject') {
        let r = input;
        
        // 1. Handle object pattern: ${ref({ schema: "s", name: "n" })}
        const outer = /\$\{ref\(\s*\{\s*([^}]*)\}\s*\)\}/gi;
        r = r.replace(outer, (full, objBody) => {
            const kvRe = /\b(database|schema|name)\b\s*:\s*(?:"([^"]+)"|'([^']+)'|`([^`]+)`|([A-Za-z_][\w$.-]*))/gi;

            let db, sch, nm, m;
            while ((m = kvRe.exec(objBody)) !== null) {
                const key = m[1].toLowerCase();
                const val = (m[2] ?? m[3] ?? m[4] ?? m[5] ?? '');
                if (key === 'database') db = val;
                else if (key === 'schema') sch = val;
                else if (key === 'name') nm = val;
            }

            if (!nm) return full;
            const project = db && db.length ? db : defaultProject;
            if (sch) return `\`${project}.${sch}.${nm}\``;
            return `\`${project}.${nm}\``; // fallback for 2-part if schema missing
        });

        // 2. Handle positional patterns: ${ref("dataset", "table")} or ${ref("table")}
        // Matches 1, 2 or 3 string arguments
        const posRef = /\$\{ref\(\s*([^)]+)\)\}/gi;
        r = r.replace(posRef, (full, args) => {
            if (args.trim().startsWith('{')) return full; // Skip object pattern already handled
            
            const argArray = args.split(',').map(arg => {
                const match = arg.trim().match(/^(?:"([^"]+)"|'([^']+)'|`([^`]+)`|([A-Za-z_][\w$.-]*))$/);
                return match ? (match[1] ?? match[2] ?? match[3] ?? match[4]) : null;
            }).filter(a => a !== null);

            if (argArray.length === 1) {
                // ${ref("table")} -> `defaultProject.table` (Dataform usually uses schema-less refs for same-dataset)
                // But in BigQuery compilation we usually need at least dataset.
                return `\`${defaultProject}.${argArray[0]}\``;
            } else if (argArray.length === 2) {
                // ${ref("dataset", "table")} -> `defaultProject.dataset.table`
                return `\`${defaultProject}.${argArray[0]}.${argArray[1]}\``;
            } else if (argArray.length === 3) {
                // ${ref("project", "dataset", "table")}
                return `\`${argArray[0]}.${argArray[1]}.${argArray[2]}\``;
            }
            return full;
        });

        return r;
    }

    function revertRefObjectPatterns(input, defaultProject = 'defaultproject', metadata = {}) {
        // Matches `project.dataset.table` or `dataset.table`
        const tableRegex = /`([^`]+)`/g;
        const selfDataset = metadata.dataset?.trim();
        const selfOutput = metadata.output?.trim();
        
        return input.replace(tableRegex, (match, fullName) => {
            const parts = fullName.split('.');
            if (parts.length < 2 || parts.length > 3) return match;

            const database = parts.length === 3 ? parts[0] : defaultProject;
            const schema = parts.length === 3 ? parts[1] : parts[0];
            const name = parts[parts.length - 1];

            if (selfDataset && selfOutput && schema === selfDataset && name === selfOutput) {
                return '${self()}';
            }

            if (parts.length === 2 && schema === 'dataset' && name === 'table') {
                // Avoid reverting generic names if not intended? But usually safe.
            }

            const db = database === defaultProject ? '' : database;
            const p = [];
            if (db) p.push(`database: "${db}"`);
            p.push(`schema: "${schema}"`);
            p.push(`name: "${name}"`);
            
            return `\${ref({ ${p.join(', ')} })}`;
        });
    }

    function formatSqlWithComments(sql, formatterFn) {
        const comments = [];
        const commentRegex = /\/\*[\s\S]*?\*\/(?:[ \t]*\r?\n)?|--[^\n\r]*(?:\r?\n|$)/g;
        const placeholderPrefix = "__COMMENT_PLACEHOLDER_";
        let placeholderIndex = 0;

        const sqlWithoutComments = sql.replace(commentRegex, (match) => {
            comments.push({
                content: match,
                placeholder: `${placeholderPrefix}${placeholderIndex}__`,
            });
            return comments[placeholderIndex++].placeholder;
        });

        const formattedSqlWithoutComments = formatterFn(sqlWithoutComments);

        let finalSql = formattedSqlWithoutComments;
        comments.forEach((comment) => {
            const escapedPlaceholder = comment.placeholder.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            const placeholderRegex = new RegExp(escapedPlaceholder, 'g');
            finalSql = finalSql.replace(placeholderRegex, comment.content);
        });

        return finalSql;
    }

    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function parseMapping(text) {
        if (!text || !text.trim()) return null;
        try {
            const obj = JSON.parse(text);
            if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                return obj;
            }
            return null;
        } catch {
            return null;
        }
    }

    function applyObjectMapping(input, mapObj) {
        if (!mapObj) return input;
        let out = input;
        for (const [k, v] of Object.entries(mapObj)) {
            const re = new RegExp(escapeRegExp(String(k)), 'g');
            out = out.replace(re, String(v));
        }
        return out;
    }

    function compileSql() {
        const sql = inputSql ?? '';
        if (!sql) {
            onCompiled?.('');
            return;
        }
        
        const queryLabelMetadata = extractQueryLabelMetadata(sql);
        const resolvedProject = defaultProject?.trim() || 'defaultproject';
        
        const withoutConfig = stripConfigBlocks(sql);
        const normalized = normalizeSql(withoutConfig);
        const compiled = replaceRefObjectPatterns(normalized, resolvedProject);

        let formatted = compiled;
        try {
            formatted = formatSqlWithComments(formatted, (s) =>
                format(s, { language: 'bigquery', uppercase: true, indent: '  ', linesBetweenQueries: 1 })
            );
        } catch (e) {
            console.error('SQL format error:', e);
        }

        formatted = replaceSelfReferences(formatted, resolvedProject, queryLabelMetadata);

        const mapping = parseMapping(replaceMapping);
        if (mapping) {
            formatted = applyObjectMapping(formatted, mapping);
        }

        onCompiled?.(formatted);
    }

    function revertSql() {
        const sql = inputSql ?? '';
        if (!sql) {
            onReverted?.('');
            return;
        }
        
        const queryLabelMetadata = extractQueryLabelMetadata(sql);
        const resolvedProject = defaultProject?.trim() || 'defaultproject';
        const normalized = normalizeSql(sql);

        let formatted = normalized;
        try {
            formatted = formatSqlWithComments(formatted, (s) =>
                format(s, { language: 'bigquery', uppercase: true, indent: '  ', linesBetweenQueries: 1 })
            );
        } catch (e) {
            console.error('SQL format error:', e);
        }

        let reverted = revertRefObjectPatterns(formatted, resolvedProject, queryLabelMetadata).trim();

        const mapping = parseMapping(replaceMapping);
        if (mapping) {
            reverted = applyObjectMapping(reverted, mapping);
        }

        onReverted?.(reverted);
    }

    // This component now works behind the scenes
    return null;
});

export default Transform;
