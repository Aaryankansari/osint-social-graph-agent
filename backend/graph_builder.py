from .search import search_web, search_news
from .nlp import extract_entities
import networkx as nx

def build_graph(person_name):
    """
    Search web/news, extract entities, build graph data.
    """
    web_results = search_web(person_name, max_results=20)
    news_results = search_news(person_name, max_results=10)
    all_results = web_results + news_results

    nodes = []
    edges = []
    
    # Track existing nodes to avoid duplicates
    node_ids = set()
    node_ids.add(person_name.lower())

    # Add central node
    nodes.append({
        "data": {
            "id": person_name,
            "label": person_name,
            "type": "Central"
        }
    })

    edge_id_counter = 0

    for res in all_results:
        snippet = res.get("body", "") or res.get("snippet", "")
        source_url = res.get("href", "")
        title = res.get("title", "")
        
        entities = extract_entities(snippet)
        
        for ent in entities:
            ent_text = ent["text"]
            ent_label = ent["label"]
            
            # Skip if entity is too similar to the search query itself
            if person_name.lower() in ent_text.lower() or ent_text.lower() in person_name.lower():
                continue

            if ent_text.lower() not in node_ids:
                nodes.append({
                    "data": {
                        "id": ent_text,
                        "label": ent_text,
                        "type": ent_label
                    }
                })
                node_ids.add(ent_text.lower())
            
            # Create edge from Central Person to Entity
            # We use a simple strategy: if they appear in the same snippet, they are related.
            edges.append({
                "data": {
                    "id": f"e{edge_id_counter}",
                    "source": person_name,
                    "target": ent_text,
                    "label": "MENTIONED_WITH",
                    "snippet": snippet[:100] + "...",
                    "url": source_url,
                    "title": title
                }
            })
            edge_id_counter += 1

    return {
        "elements": nodes + edges
    }
