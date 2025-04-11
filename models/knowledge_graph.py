import json

def load_graph(entity_path, relationship_path):
    """
    Load entities and relationships from JSON files and build a simple knowledge graph.
    """
    with open(entity_path, 'r') as file:
        entities = json.load(file)

    with open(relationship_path, 'r') as file:
        relationships = json.load(file)

    graph = {}

    for entity in entities["SubscriptionTiers"]:
        graph[entity] = {
            "features": entities["Features"].get(entity, []),
            "limitations": entities["Limitations"].get(entity, []),
            "support": entities["SupportLevels"].get(entity, ""),
            "upgrades": relationships["Upgrades"].get(entity, [])
        }

    return graph
