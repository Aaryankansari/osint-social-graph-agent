# OSINT Social Graph Agent

A lightweight, free-to-use OSINT tool that reconstructs social graphs from public web data.

## Features
- **Public Data Collection**: Uses DuckDuckGo for search results (no API keys required).
- **NLP Analysis**: Extracts entities (People, Organizations, Locations) using spaCy.
- **Graph Visualization**: Interactive graph using Cytoscape.js.
- **Filters**: Toggle node types (Person, Org, GPE).
- **Export**: Save graph as PNG or Markdown report.
- **Privacy**: Runs locally, no data is stored on external servers unless configured.

## Tech Stack
- **Backend**: FastAPI, spaCy, NetworkX, DuckDuckGo Search
- **Frontend**: HTML5, CSS3 (Glassmorphism), Cytoscape.js
- **Deployment**: Ready for Render/Vercel

## Setup & Run

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Download NLP Model**
   ```bash
   python -m spacy download en_core_web_sm
   ```

3. **Run the Application**
   ```bash
   uvicorn backend.main:app --reload
   ```

4. **Access**
   Open [http://localhost:8000](http://localhost:8000) in your browser.

## Deployment to GitHub Pages / Render
- **Frontend**: Can be hosted on GitHub Pages (requires API URL configuration).
- **Backend**: Can be hosted on Render (Free Tier) or Vercel (using Python runtime).

## Disclaimer
This tool is for educational and research purposes only. Ensure you respect privacy laws and terms of service of data sources.
