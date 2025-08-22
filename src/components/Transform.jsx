import '../styles/Transform.css';
import { format } from 'sql-formatter';
import { useState } from 'react';
import ReplaceArea from './ReplaceArea';

function Transform({
    referencedSql = '',
    compiledSql = '',
    onCompiled,
    onReverted,
    // received from App (ReplaceArea)
    defaultProject = 'defaultproject',
    revertMappingText = '',
    setRevertMappingError,
}) {
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
                const val = (m[2] ?? m[3] ?? m[4] ?? m[5] ?? '');
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
        input = input.replace(/\`/g, '');
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
        let out = input.replace(/(^|\n)\s*config\s*\{[\s\S]*?\}\s*(?=\n|$)/gi, '$1');
        out = out.replace(/\bconfig\s*\{[\s\S]*?\}\s*;?/gi, '');
        return out;
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
            const escapedPlaceholder = comment.placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const placeholderRegex = new RegExp(escapedPlaceholder, 'g');
            finalSql = finalSql.replace(placeholderRegex, comment.content);
        });

        return finalSql;
    }

    // Helpers for mapping
    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function parseMapping(text) {
        if (!text || !text.trim()) {
            setRevertMappingError?.('');
            return null;
        }
        try {
            const obj = JSON.parse(text);
            if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                setRevertMappingError?.('');
                return obj;
            }
            setRevertMappingError?.('Mapping must be a JSON object of { "find": "replace", ... }');
            return null;
        } catch (e) {
            setRevertMappingError?.('Invalid JSON');
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
        const sql = referencedSql ?? '';
        if (!sql) {
            onCompiled?.('');
            return;
        }
        const withoutConfig = stripConfigBlocks(sql);
        const normalized = normalizeSql(withoutConfig);
        const compiled = replaceRefObjectPatterns(normalized, defaultProject);

        let formatted = compiled;
        try {
            formatted = formatSqlWithComments(formatted, (s) =>
                format(s, { language: 'bigquery', uppercase: true, indent: '  ', linesBetweenQueries: 1 })
            );
        } catch (e) {
            console.error('SQL format error:', e);
        }

        // Apply JSON mapping (key -> value) before returning compiled SQL
        const mapping = parseMapping(revertMappingText);
        if (mapping) {
            formatted = applyObjectMapping(formatted, mapping);
        }

        onCompiled?.(formatted);
    };

    function revertSql() {
        const sql = compiledSql ?? '';
        if (!sql) {
            onReverted?.('');
            return;
        }
        const normalized = normalizeSql(sql);

        // Format (preserving comments)
        let formatted = normalized;
        try {
            formatted = formatSqlWithComments(formatted, (s) =>
                format(s, { language: 'bigquery', uppercase: true, indent: '  ', linesBetweenQueries: 1 })
            );
        } catch (e) {
            console.error('SQL format error:', e);
        }

        // Revert project.schema.name -> ${ref({...})}
        let reverted = revertRefObjectPatterns(formatted, defaultProject);

        // Apply JSON mapping (key -> value) before returning reverted SQL
        const mapping = parseMapping(revertMappingText);
        if (mapping) {
            reverted = applyObjectMapping(reverted, mapping);
        }

        onReverted?.(reverted);
    }

    return (
        <div className="transform">
            <div
                className="actions"
                style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}
            >
                <button className="compile-btn" onClick={compileSql}>Compile</button>
                <button className="revert-btn" onClick={revertSql}>Revert</button>
            </div>
        </div>
    );
}

export default Transform;