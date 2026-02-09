import { saveGraphToCloud } from './firebase_config.js';

// --- Globals ---
let cy;
let currentGraphData = null;

// --- Colors for Graph ---
const COLORS = {
    background: '#0a0a0f',
    person: '#00f0ff', // Cyan
    org: '#ff0055',    // Pink
    gpe: '#00ff9d',    // Green
    edge: '#333344',
    edgeHover: '#ffffff',
    text: '#ffffff'
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initGraph();
    setupEventListeners();
});

function initGraph() {
    cy = cytoscape({
        container: document.getElementById('cy'),
        style: [
            // Core Node Style
            {
                selector: 'node',
                style: {
                    'background-color': '#444',
                    'label': 'data(label)',
                    'color': '#fff',
                    'font-family': 'Inter',
                    'font-size': '10px',
                    'text-valign': 'bottom',
                    'text-halign': 'center',
                    'text-margin-y': 4,
                    'width': 20,
                    'height': 20,
                    'overlay-opacity': 0,
                    'transition-property': 'background-color, width, height, border-width',
                    'transition-duration': '0.3s'
                }
            },
            // Node Types
            {
                selector: 'node[type="Central"]', // Central person
                style: {
                    'background-color': COLORS.person,
                    'width': 45,
                    'height': 45,
                    'font-size': '14px',
                    'font-weight': 'bold',
                    'border-width': 4,
                    'border-color': 'rgba(255,255,255,0.2)',
                    'shadow-blur': 15,
                    'shadow-color': COLORS.person,
                    'shadow-opacity': 0.6
                }
            },
            {
                selector: 'node[type="PERSON"]',
                style: {
                    'background-color': COLORS.person,
                    'width': 25,
                    'height': 25
                }
            },
            {
                selector: 'node[type="ORG"]',
                style: {
                    'background-color': COLORS.org,
                    'width': 25,
                    'height': 25,
                    'shape': 'round-rectangle'
                }
            },
            {
                selector: 'node[type="GPE"]', // Location
                style: {
                    'background-color': COLORS.gpe,
                    'width': 25,
                    'height': 25,
                    'shape': 'diamond'
                }
            },
            // Edge Style
            {
                selector: 'edge',
                style: {
                    'width': 1.5,
                    'line-color': COLORS.edge,
                    'target-arrow-color': COLORS.edge,
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'opacity': 0.6
                }
            },
            // Interaction Styles
            {
                selector: 'node:selected',
                style: {
                    'border-width': 2,
                    'border-color': '#fff',
                    'background-color': '#fff',
                    'shadow-blur': 20,
                    'shadow-color': '#fff',
                    'shadow-opacity': 0.8
                }
            },
            {
                selector: 'edge:selected',
                style: {
                    'line-color': '#fff',
                    'target-arrow-color': '#fff',
                    'width': 3,
                    'opacity': 1
                }
            }
        ],
        layout: {
            name: 'grid' // Default until data loads
        },
        minZoom: 0.2,
        maxZoom: 3,
        wheelSensitivity: 0.2
    });

    // --- Graph Interaction Events ---

    // Tap Node: Show Details & Highlight Neighbors
    cy.on('tap', 'node', function (evt) {
        const node = evt.target;
        showNodeDetails(node.data());

        // Highlight logic could be added here (dim others)
    });

    // Tap Edge: Show Edge Details
    cy.on('tap', 'edge', function (evt) {
        const edge = evt.target;
        showEdgeDetails(edge.data());
    });

    // Tap Background: Hide Details
    cy.on('tap', function (evt) {
        if (evt.target === cy) {
            hideDetails();
        }
    });
}

function setupEventListeners() {
    // Enter key support for search
    document.getElementById('searchInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// --- Core Functions ---

async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    // Show Loader
    const loader = document.querySelector('.loader-overlay');
    loader.classList.remove('hidden');

    try {
        const response = await fetch(`/api/graph?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error(`Server API Error: ${response.status}`);
        }

        const data = await response.json();
        currentGraphData = data;

        // Clear & Update Graph
        cy.elements().remove();
        cy.add(data.elements);

        // Layout Algorithm
        updateLayout();

        // Update Stats
        updateStats();

    } catch (err) {
        console.error(err);
        alert("Search failed. Ensure backend is running.\nError: " + err.message);
    } finally {
        // Hide Loader
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 500); // Small delay for smooth exit
    }
}

function updateLayout() {
    // Use 'cose' (Compound Spring Embedder) for organic layout
    const layout = cy.layout({
        name: 'cose',
        animate: true,
        animationDuration: 1000,
        randomize: false,
        componentSpacing: 120,
        nodeRepulsion: 450000,
        edgeElasticity: 50,
        nestingFactor: 5,
        idealEdgeLength: 80,
        gravity: 0.25,
        numIter: 1000
    });
    layout.run();
}

function updateStats() {
    const nodes = cy.nodes().length;
    const edges = cy.edges().length;
    document.getElementById('nodeCount').innerText = nodes;
    document.getElementById('edgeCount').innerText = edges;
}

// --- UI Logic ---

function showNodeDetails(data) {
    const panel = document.getElementById('details-panel');
    const title = document.getElementById('details-title');
    const content = document.getElementById('details-content');
    const noteInput = document.getElementById('annotationInput');

    panel.classList.remove('hidden');
    title.innerText = data.label;

    let html = `
        <div style="margin-bottom:8px">
            <span style="background:${getColorForType(data.type)}; padding:2px 6px; border-radius:4px; color:#000; font-weight:bold; font-size:0.7rem;">
                ${data.type}
            </span>
        </div>
    `;

    if (data.snippet) {
        html += `<p style="font-size:0.8rem; opacity:0.8;">"${data.snippet}"</p>`;
    }

    content.innerHTML = html;
    noteInput.value = data.annotation || '';
}

function showEdgeDetails(data) {
    const panel = document.getElementById('details-panel');
    const title = document.getElementById('details-title');
    const content = document.getElementById('details-content');

    panel.classList.remove('hidden');
    title.innerText = "Connection";

    let html = `
        <div style="margin-bottom:8px; font-size: 0.8rem; color: #aaa;">
            ${data.source} <i class="fa-solid fa-arrow-right"></i> ${data.target}
        </div>
    `;

    if (data.snippet) html += `<p style="font-size:0.8rem; opacity:0.8; margin-bottom:8px;">"${data.snippet}"</p>`;
    if (data.url) html += `<a href="${data.url}" target="_blank" style="color:var(--accent-primary); font-size:0.75rem;"><i class="fa-solid fa-link"></i> Source Link</a>`;

    content.innerHTML = html;
    document.getElementById('annotationInput').value = ''; // Reset notes for edges for simplicity or add support later
}

function hideDetails() {
    // Optional: Hide panel
    // document.getElementById('details-panel').classList.add('hidden');
    // For now we keep it open but reset content
    // document.getElementById('details-content').innerHTML = '<p class="placeholder-text">Select a node to view details.</p>';
}

function getColorForType(type) {
    if (type === 'Central' || type === 'PERSON') return COLORS.person;
    if (type === 'ORG') return COLORS.org;
    if (type === 'GPE') return COLORS.gpe;
    return '#888';
}

function filterGraph(type, checkbox) {
    const nodes = cy.nodes(`[type="${type}"]`);
    if (checkbox.checked) {
        nodes.style('display', 'element');
    } else {
        nodes.style('display', 'none');
    }
}

function saveAnnotation() {
    const selected = cy.$('node:selected');
    if (selected.length === 0) {
        alert("Please select a node to save a note.");
        return;
    }
    const note = document.getElementById('annotationInput').value;
    selected.data('annotation', note);

    // flash the button to show saved
    const btn = document.querySelector('.save-note-btn');
    const originalText = btn.innerText;
    btn.innerText = "Saved!";
    setTimeout(() => btn.innerText = originalText, 1500);
}

function exportReport() {
    if (!currentGraphData) {
        alert("No graph to export. Perform a search first.");
        return;
    }

    let report = "# OSINT Graph Report\nGenerated by AI Agent\n\n";
    report += `## Target: ${document.getElementById('searchInput').value}\n\n`;
    report += "### Nodes Found:\n";

    cy.nodes().forEach(n => {
        const d = n.data();
        if (d.type === 'Central') return; // Skip central node in list
        report += `- **${d.label}** (${d.type})\n`;
        if (d.annotation) report += `  - Note: ${d.annotation}\n`;
    });

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graph_report_${document.getElementById('searchInput').value}.md`;
    a.click();
}

function exportImage() {
    const png = cy.png({ full: true, bg: '#0a0a0f', quality: 1, scale: 2 });
    const a = document.createElement('a');
    a.href = png;
    a.download = 'social_graph_snapshot.png';
    a.click();
}

async function saveToCloud() {
    const query = document.getElementById('searchInput').value;
    if (!query || !currentGraphData) {
        alert("No data to save.");
        return;
    }
    const graphSnapshot = cy.json();
    await saveGraphToCloud(query, graphSnapshot);
}

// Expose to window for HTML onClick
window.performSearch = performSearch;
window.filterGraph = filterGraph;
window.saveAnnotation = saveAnnotation;
window.exportReport = exportReport;
window.exportImage = exportImage;
window.saveToCloud = saveToCloud;
window.closeDetails = () => document.getElementById('details-panel').classList.add('hidden');
