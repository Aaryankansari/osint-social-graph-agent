import { saveGraphToCloud } from './firebase_config.js';

let cy;
let currentGraphData = null;

// Initialize Cytoscape
document.addEventListener('DOMContentLoaded', () => {
    cy = cytoscape({
        container: document.getElementById('cy'),
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#666',
                    'label': 'data(label)',
                    'color': '#fff',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '12px'
                }
            },
            {
                selector: 'node[type="Central"]',
                style: {
                    'background-color': '#ff0055',
                    'width': 60,
                    'height': 60,
                    'font-size': '16px',
                    'font-weight': 'bold'
                }
            },
            {
                selector: 'node[type="ORG"]',
                style: {
                    'background-color': '#00ddeb',
                    'shape': 'square'
                }
            },
            {
                selector: 'node[type="GPE"]',
                style: {
                    'background-color': '#00ff00',
                    'shape': 'triangle'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#555',
                    'target-arrow-color': '#555',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            },
            {
                selector: ':selected',
                style: {
                    'border-width': 4,
                    'border-color': '#fff'
                }
            }
        ],
        layout: {
            name: 'cose',
            animate: true
        }
    });

    cy.on('tap', 'node', function (evt) {
        const node = evt.target;
        const data = node.data();
        document.getElementById('nodeInfo').innerHTML = `
            <strong>${data.label}</strong><br>
            Type: ${data.type}<br>
            ${data.snippet ? `<small>${data.snippet}</small>` : ''}
        `;
    });

    cy.on('tap', 'edge', function (evt) {
        const edge = evt.target;
        const data = edge.data();
        document.getElementById('nodeInfo').innerHTML = `
            <strong>Relationship</strong><br>
            Source: ${data.source}<br>
            Target: ${data.target}<br>
            Notes: ${data.snippet || 'Co-occurrence'}
        `;
    });
});

async function performSearch() {
    const query = document.getElementById('searchInput').value;
    if (!query) return;

    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');

    try {
        const response = await fetch(`/api/graph?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        currentGraphData = data;

        cy.elements().remove();
        cy.add(data.elements);

        cy.layout({
            name: 'cose',
            animate: true,
            randomize: false,
            componentSpacing: 100,
            nodeRepulsion: 400000,
            edgeElasticity: 100,
            nestingFactor: 5,
        }).run();

    } catch (err) {
        alert("Search failed: " + err);
    } finally {
        loader.classList.add('hidden');
    }
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
    const selected = cy.$(':selected');
    if (selected.length === 0) {
        alert("Select a node first");
        return;
    }
    const note = document.getElementById('annotationInput').value;
    selected.data('annotation', note);
    alert("Annotation saved to node!");
}

function exportReport() {
    if (!currentGraphData) {
        alert("No graph to export");
        return;
    }

    let report = "OSINT Graph Report\n==================\n\n";
    report += "Nodes:\n";
    cy.nodes().forEach(n => {
        const d = n.data();
        report += `- ${d.label} (${d.type})\n`;
        if (d.annotation) report += `  Note: ${d.annotation}\n`;
    });

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graph_report.md';
    a.click();
}

function exportImage() {
    const png = cy.png({ full: true, bg: '#121212' });
    const a = document.createElement('a');
    a.href = png;
    a.download = 'social_graph.png';
    a.click();
}

async function saveToCloud() {
    const query = document.getElementById('searchInput').value;
    if (!query || !currentGraphData) {
        alert("Nothing to save!");
        return;
    }
    // Also capture current annotations
    const graphSnapshot = cy.json();
    await saveGraphToCloud(query, graphSnapshot);
    alert("Saved!");
}

// Global exposure for HTML buttons
window.performSearch = performSearch;
window.filterGraph = filterGraph;
window.saveAnnotation = saveAnnotation;
window.exportReport = exportReport;
window.exportImage = exportImage;
window.saveToCloud = saveToCloud;
