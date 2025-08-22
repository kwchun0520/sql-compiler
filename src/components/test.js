import { format } from 'sql-formatter';

/**
 * A utility function to handle SQL comments by temporarily removing them for
 * formatting and then re-inserting them. This is useful for formatters that
 * break when encountering comments.
 *
 * @param {string} sql The raw SQL query string with comments.
 * @param {function(string): string} formatterFn The formatting function that
 * will format the SQL without comments. This function must return the formatted string.
 * @returns {string} The formatted SQL string with the original comments restored.
 */
function formatSqlWithComments(sql, formatterFn) {
  const comments = [];

  // Capture:
  // - Block comments, plus optional trailing spaces and a newline if present
  // - Line comments, including their trailing newline
  const commentRegex = /\/\*[\s\S]*?\*\/(?:[ \t]*\r?\n)?|--[^\n\r]*(?:\r?\n|$)/g;

  const placeholderPrefix = "__COMMENT_PLACEHOLDER_";
  let placeholderIndex = 0;

  const sqlWithoutComments = sql.replace(commentRegex, (match) => {
    comments.push({
      content: match, // includes newline for -- and for block comments if present
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

// === Example Usage ===

// Example SQL query with both types of comments.
const sqlQuery = `
--------------
/*sdfsafdsdf
safdsdf
----------
asdfsdfsd

*/
--------------


--------------
insert into table
with tmp as (select 1 )
  SELECT T1.col1, -- This is a single line comment
    T1.col2, /* This is a block comment
              that spans multiple lines */
    T2.col3 -- not use
  FROM table1 T1 JOIN table2 T2 ON T1.id = T2.id WHERE T1.col1 = 'value'
`;

// Use the main function with the imported `format` function.
const finalOutput = formatSqlWithComments(sqlQuery, (s) =>
  format(s, { language: 'bigquery', uppercase: true, indent: '  ', linesBetweenQueries: 1 })
);

// Log the result to the console.
console.log("Original Query:");
console.log(sqlQuery);
console.log("\nFormatted Query with Comments Restored:");
console.log(finalOutput);
