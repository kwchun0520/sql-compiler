# SQL Compiler for DataForm (React + Vite)

A small React app that normalizes and formats SQL for DataForm-like workflows. It provides a 3-column layout: input, transform action, and compiled output.

## Features
- Three-column layout: Reference SQL | Transform | Compiled SQL
- One-click Transform:
  - Whitespace cleanup and token-safe capitalization
  - Optional ${ref({ database, schema, name })} -> database.schema.name replacement for Google DataForm compatibility
    - Missing database falls back to a default project 
  - Data type capitalization (standalone tokens only)
  - Pretty formatting via sql-formatter
- Dark/Light mode toggle (top-right) that sets html[data-theme]
- Read-only output areas with monospace styling

## Tech Stack
- React + Vite
- sql-formatter
- MUI Switch (for the dark mode toggle)
- Plain CSS (CSS Grid for layout)

# SQL Compiler for DataForm (React + Vite)

A modern React application that transforms SQL between referenced and compiled formats for DataForm-like workflows. Features a sleek dark theme interface with toggle-based transformation modes.

## ✨ Features

### 🎨 Modern UI Design
- **Dark Theme Interface**: Professional dark theme with custom CSS variables
- **Responsive Layout**: Two-column layout on desktop, single-column on mobile
- **Modern Typography**: Space Grotesk and Noto Sans font stack
- **Material Icons**: Clean iconography throughout the interface

### 🔄 SQL Transformation Modes
- **Referenced → Compiled**: Transform `${ref({ database, schema, name })}` patterns to `database.schema.name`
- **Compiled → Referenced**: Reverse transformation from compiled SQL back to referenced format
- **Toggle Switch**: Easy mode switching between forward and reverse transformations
- **Run Button**: Manual trigger for transformations with visual feedback

### ⚙️ Advanced Features
- **Text Replacement (JSON)**: Custom find-and-replace patterns using JSON configuration
- **Default Project Configuration**: Configurable default project for database references
- **SQL Formatting**: Pretty formatting via sql-formatter with BigQuery syntax support
- **Keyword Normalization**: Smart capitalization of SQL keywords and data types
- **Comment Preservation**: Maintains SQL comments through transformations

## 🛠️ Tech Stack
- **React 19** + **Vite 7** (Latest versions)
- **Tailwind CSS** + Custom CSS Variables
- **sql-formatter** (v15.6.6)
- **Material Symbols** (Google Icons)
- **Modern ES6+** JavaScript

## 🚀 Quick Start
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

## 📖 Usage

### Interface Layout
1. **Header**: Contains project settings, mode toggle, and run button
2. **Text Replacement**: JSON-based find-and-replace configuration
3. **Referenced SQL**: Input area for SQL with `${ref()}` patterns
4. **Compiled SQL**: Output area for transformed SQL

### Transform Modes
- **Ref Mode** (default): Referenced → Compiled transformation
- **Comp Mode**: Compiled → Referenced transformation
- Use the toggle switch in the header to change modes
- Click **Run** to execute the transformation

### Configuration Options
- **Default Project**: Set the fallback database name for references
- **Text Replacement**: JSON object for custom string replacements
  ```json
  {
    "old_text": "new_text",
    "find_this": "replace_with_this"
  }
  ```

## 🔧 How Transformations Work

### Referenced → Compiled Mode
1. Strips config blocks from SQL
2. Normalizes SQL keywords and data types
3. Converts `${ref({ database: "db", schema: "sch", name: "tbl" })}` → `` `db.sch.tbl` ``
4. Applies custom text replacements
5. Formats with sql-formatter (BigQuery dialect)

### Compiled → Referenced Mode
1. Normalizes SQL syntax
2. Converts `` `database.schema.table` `` → `${ref({ database: "database", schema: "schema", name: "table" })}`
3. Applies custom text replacements
4. Formats and returns referenced SQL

## 🎨 Styling & Theming

### CSS Architecture
- **CSS Variables**: Consistent theming with custom properties
- **Tailwind Integration**: Utility-first styling with custom extensions
- **Component Styles**: Modular CSS organization
- **Responsive Design**: Mobile-first responsive breakpoints

### Color Scheme
```css
:root {
  --primary-color: #0d78f2;      /* Blue accent */
  --background-color: #111827;    /* Dark background */
  --surface-color: #1f2937;       /* Card/input background */
  --text-primary: #f9fafb;        /* Primary text */
  --text-secondary: #9ca3af;      /* Secondary text */
  --border-color: #374151;        /* Borders */
}
```

## 📁 Project Structure
```
sql-compiler/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Main header with controls
│   │   ├── Footer.jsx          # Simple footer
│   │   ├── Transform.jsx       # Core transformation logic
│   │   └── [legacy components] # Restored component files
│   ├── styles/
│   │   ├── index.css           # Combined base + custom styles
│   │   └── [other CSS files]   # Component-specific styles
│   ├── App.jsx                 # Main application component
│   └── index.jsx               # React entry point
├── index.html                  # HTML template
├── package.json               # Dependencies and scripts
├── vite.config.js            # Vite configuration
└── docker-compose.yaml       # Container setup
```

## 🔧 Configuration

### Default Project Settings
Edit the `defaultProject` state in `App.jsx` or use the header input field.

### Custom Text Replacements
Use the JSON textarea in the interface:
```json
{
  "old_database_name": "new_database_name",
  "legacy_schema": "modern_schema"
}
```

### SQL Formatter Settings
Modify `Transform.jsx` to adjust sql-formatter options:
```javascript
format(sql, { 
  language: 'bigquery', 
  uppercase: true, 
  indent: '  ', 
  linesBetweenQueries: 1 
})
```

## 🚢 Docker Deployment

### Single Container
```bash
docker build -t sql-compiler .
docker run --rm -p 5173:80 sql-compiler
```

### Docker Compose
```bash
docker compose up --build
```

The container includes:
- **Multi-stage build**: Node.js build → Nginx serving
- **SPA routing**: Proper handling of client-side routes
- **Production optimization**: Minified assets and efficient serving

## 🛠️ Scripts
- `npm run dev` - Start development server with HMR
- `npm run build` - Production build with optimization
- `npm run preview` - Preview production build locally
- `npm run lint` - Code linting with ESLint

## 🐛 Troubleshooting

### Common Issues
- **Blank page**: Ensure React root element exists in `index.html`
- **Styles not loading**: Check CSS file imports in components
- **Transformations not working**: Verify JSON syntax in text replacement field
- **Toggle not responding**: Check browser console for JavaScript errors

### Development Tips
- Use browser dev tools to inspect CSS variables
- Check the Network tab for asset loading issues
- React DevTools extension helps debug component state
- Vite HMR provides instant feedback during development

## 📝 License
This project is open source and available under standard licensing terms.

## Usage
- Left panel: paste or type your SQL (ReferenceSqlArea)
- Middle panel: click Transform to normalize and format, and the default project configuration
- Right panel: view the compiled/pretty SQL (CompiledSqlArea)
- Toggle Dark mode using the switch in the top-right corner

## How It Works (Transform)
- Normalizes spacing and punctuation
- Capitalizes only standalone keywords and data types (not substrings)
- Optionally converts ${ref({ database: "...", schema: "...", name: "..." })} to database.schema.name for Google DataForm compatibility
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

## Docker
This repo includes a production-ready container setup:
- `Dockerfile`: multi-stage build (Node to build, Nginx to serve static files)
- `nginx.conf`: configures SPA routing (serves `index.html` for unknown routes)
- `docker-compose.yaml`: convenience for build/run with port mapping

### Build and run with Docker
```bash
docker build -t sql-compiler .
docker run --rm -p 5173:80 sql-compiler
```
Then open http://localhost:5173

### Using Docker Compose
```bash
docker compose up --build
```
By default this maps container port 80 to host port 5173, matching the dev port for convenience. The Nginx config uses:

```
location / {
  try_files $uri $uri/ /index.html;
}
```

This enables client-side routing (React Router) to work when refreshing or deep-linking.
