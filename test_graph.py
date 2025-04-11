from graph.build_graph import load_graph

def test_load_graph():
    # Define the paths to your entity and relationship JSON files
    entity_path = 'data/entities.json'
    relationship_path = 'data/relationships.json'

    # Load the graph
    graph = load_graph(entity_path, relationship_path)

    # Test: Print the structure of a few entities and their relationships
    print("Graph Structure (Sample Test):")
    
    # Test for a specific tier (e.g., "Basic")
    tier = "Basic"
    if tier in graph:
        print(f"\nDetails for {tier} tier:")
        print("Features:", graph[tier]["features"])
        print("Limitations:", graph[tier]["limitations"])
        print("Support:", graph[tier]["support"])
        print("Upgrades:", graph[tier]["upgrades"])
        print("Linked Upgrades:", graph[tier].get("linked_upgrades", "No linked upgrades"))

    else:
        print(f"\nEntity '{tier}' not found in graph!")

    # You can add more tests for other tiers here (e.g., "Standard", "Premium")

if __name__ == "__main__":
    test_load_graph()
