# SQL Compiler for DataForm (React + Vite)

A modern React application that transforms SQL between referenced and compiled formats for DataForm-like workflows. Features a sleek dark theme interface with toggle-based transformation modes and seamless Google Cloud deployment.

## ✨ Features

### 🎨 Modern UI Design
- **Dark Theme Interface**: Professional dark theme with custom CSS variables.
- **Responsive Layout**: Two-column layout on desktop, single-column on mobile.
- **Modern Typography**: Space Grotesk and Noto Sans font stack.
- **Material Symbols**: Clean iconography throughout the interface.

### 🔄 SQL Transformation Modes
- **Referenced → Compiled**: 
  - Converts `${ref({ database: "db", schema: "sch", name: "tbl" })}` → `` `db.sch.tbl` ``.
  - Supports `${self()}` pattern conversion.
  - Strips DataForm config blocks.
- **Compiled → Referenced**: 
  - Reverse transformation from compiled SQL back to referenced format.
  - Converts `` `database.schema.table` `` → `${ref({ database: "database", schema: "schema", name: "table" })}`.
- **Toggle Switch**: Easy mode switching between forward and reverse transformations.
- **Run Button**: Manual trigger for transformations with visual feedback.

### ⚙️ Advanced Features
- **Text Replacement (JSON)**: Custom find-and-replace patterns using JSON configuration.
- **Default Project Configuration**: Configurable default project for database references.
- **SQL Formatting**: Pretty formatting via `sql-formatter` with BigQuery syntax support.
- **Keyword Normalization**: Smart capitalization of SQL keywords and data types.
- **Comment Preservation**: Maintains SQL comments through transformations.

## 🛠️ Tech Stack
- **React 19** + **Vite 7**
- **Tailwind CSS** + Custom CSS Variables
- **sql-formatter** (v15.6.6)
- **Material Symbols** (Google Icons)
- **Docker** (Multi-stage build with Nginx)
- **Google Cloud Platform** (Artifact Registry & Cloud Run)

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start dev server with HMR
npm run dev

# Build for production
npm run build
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Docker (Local)
```bash
# Using Docker Compose
docker compose up --build

# Using Docker directly
docker build -t sql-compiler .
docker run --rm -p 8080:8080 sql-compiler
```

## 🚢 Deployment (Google Cloud)

The project includes a comprehensive `deploy.sh` script to automate deployment to Google Cloud Run via Artifact Registry.

### Prerequisites
- Google Cloud SDK (`gcloud`) installed and authenticated.
- A GCP Project ID set (`gcloud config set project [PROJECT_ID]`).

### Deploying
```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

The script will:
1.  Verify your GCP project.
2.  Enable necessary APIs (Artifact Registry, Cloud Build).
3.  Create an Artifact Registry repository if it doesn't exist.
4.  Build the image (locally or via Cloud Build).
5.  Push the image to Artifact Registry.
6.  Deploy the service to Google Cloud Run.

## 🔧 Configuration

### Default Project Settings
Set the fallback database name for references using the "Default Project" field in the header.

### Custom Text Replacements
Use the JSON textarea in the interface to define custom mappings:
```json
{
  "old_database_name": "new_database_name",
  "legacy_schema": "modern_schema"
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
│   │   ├── ReplaceArea.jsx     # JSON replacement configuration
│   │   └── ...
│   ├── styles/
│   │   └── index.css           # Global styles and variables
│   ├── App.jsx                 # Main application component
│   └── index.jsx               # React entry point
├── deploy.sh                   # GCP deployment script
├── cloudbuild.yaml             # Google Cloud Build configuration
├── Dockerfile                  # Multi-stage Docker build
├── nginx.conf                  # Nginx configuration for Cloud Run
└── docker-compose.yaml         # Local container setup
```