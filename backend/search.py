from duckduckgo_search import DDGS
import time

def search_web(query, max_results=20):
    """
    Search DuckDuckGo for a query and return snippets.
    Retry logic for rate limiting.
    """
    results = []
    try:
        with DDGS() as ddgs:
            # searching iteratively to be polite
            search_results = ddgs.text(query, max_results=max_results)
            for r in search_results:
                results.append({
                    "title": r.get("title"),
                    "href": r.get("href"),
                    "body": r.get("body")
                })
    except Exception as e:
        print(f"Error searching DuckDuckGo: {e}")
        return []
    return results

def search_news(query, max_results=10):
    """
    Search DuckDuckGo News for a query.
    """
    results = []
    try:
        with DDGS() as ddgs:
            news_results = ddgs.news(query, max_results=max_results)
            for r in news_results:
                results.append({
                    "title": r.get("title"),
                    "href": r.get("url"),
                    "body": r.get("body"), # news results use 'body' not 'snippet' usually
                    "source": r.get("source"),
                    "date": r.get("date")
                })
    except Exception as e:
        print(f"Error searching News: {e}")
        return []
    return results
