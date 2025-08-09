# SQL Compiler for DataForm (React + Vite)

A small React app that normalizes and formats SQL for DataForm-like workflows. It provides a 3-column layout: input, transform action, and compiled output.

## Features
- Three-column layout: Reference SQL | Transform | Compiled SQL
- One-click Transform:
  - Whitespace cleanup and token-safe capitalization
  - Optional ${ref({ database, schema, name })} -> project.schema.name replacement
  - Data type capitalization (standalone tokens only)
  - Pretty formatting via sql-formatter
- Dark/Light mode toggle (top-right) that sets html[data-theme]
- Read-only output areas with monospace styling

## Tech Stack
- React + Vite
- sql-formatter
- MUI Switch (for the dark mode toggle)
- Plain CSS (CSS Grid for layout)

## Quick Start
```bash
# Install dependencies
npm install

# Start dev server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

Open http://localhost:5173 in your browser (default Vite port).

## Usage
- Left panel: paste or type your SQL (ReferenceSqlArea)
- Middle panel: click Transform to normalize and format
- Right panel: view the compiled/pretty SQL (read-only)
- Toggle Dark mode using the switch in the top-right corner

## How It Works (Transform)
- Normalizes spacing and punctuation
- Capitalizes only standalone keywords and data types (not substrings)
- Optionally converts ${ref({ database: "...", schema: "...", name: "..." })} to project.schema.name
  - Missing database falls back to a default project
- Formats with sql-formatter for readability

## Configuration
- Default project for ref replacement: change the defaultProject argument in Transform.jsx’s replaceRefObjectPatterns if needed.
- Column widths: edit grid-template-columns in src/styles/App.css (.three-col-grid).

## Troubleshooting
- Blank page: ensure index.html contains a root element:
  ```html
  <div id="root"></div>
  ```
- Dark mode not applying: the app sets html[data-theme] via useEffect. Verify your CSS uses CSS variables tied to data-theme (see src/styles/index.css and src/styles/App.css).
- Formatting issues: sql-formatter supports multiple dialects. Adjust the language option in Transform.jsx if your SQL dialect differs.

## Scripts
- dev: start Vite dev server
- build: production build
- preview: preview the build locally
