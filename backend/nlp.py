import spacy

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Downloading language model 'en_core_web_sm'...")
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def extract_entities(text):
    """
    Extract named entities (PERSON, ORG, GPE) from text using spaCy.
    """
    doc = nlp(text)
    entities = []
    for ent in doc.ents:
        if ent.label_ in ["PERSON", "ORG", "GPE", "LOC"]:
            entities.append({
                "text": ent.text,
                "label": ent.label_
            })
    return entities
