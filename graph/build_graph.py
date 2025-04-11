# graph/build_graph.py

import sys, os, json
from graph.neo4j_connector import Neo4jConnector
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

# Ensure project root is importable
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

class KnowledgeGraphBuilder:
    def __init__(self, uri, user, password):
        self.connector = Neo4jConnector(uri, user, password)

    def build_graph(self, entities_path, relationships_path):
        # Clear existing data
        self.connector.run_query("MATCH (n) DETACH DELETE n")

        # Load JSON
        with open(entities_path) as ef, open(relationships_path) as rf:
            entities     = json.load(ef)
            relationships = json.load(rf)

        # Create tiers, features, and support channels
        for tier, features in entities["Features"].items():
            limitations = entities["Limitations"].get(tier, [])
            # Merge SubscriptionTier node
            self.connector.run_query(
                """
                MERGE (t:SubscriptionTier {name: $tier})
                SET t.limitations = $limitations
                """,
                {"tier": tier, "limitations": limitations}
            )
            # Merge features
            for feat in features:
                self.connector.run_query(
                    """
                    MERGE (f:Feature {name: $feat})
                    MERGE (t:SubscriptionTier {name: $tier})
                    MERGE (t)-[:INCLUDES]->(f)
                    """,
                    {"feat": feat, "tier": tier}
                )
            # Merge support channels
            for support_item in entities["SupportLevels"].get(tier, []):
                self.connector.run_query(
                    """
                    MERGE (s:SupportChannel {name: $support})
                    MERGE (t:SubscriptionTier {name: $tier})
                    MERGE (t)-[:SUPPORTS]->(s)
                    """,
                    {"support": support_item, "tier": tier}
                )

        # Create upgrade relationships
        for src, dests in relationships.get("Upgrades", {}).items():
            for dst in dests:
                self.connector.run_query(
                    """
                    MATCH (a:SubscriptionTier {name: $src})
                    MATCH (b:SubscriptionTier {name: $dst})
                    MERGE (a)-[:CAN_UPGRADE_TO]->(b)
                    """,
                    {"src": src, "dst": dst}
                )

        print("✅ Graph successfully built and pushed to Neo4j.")

    def close(self):
        self.connector.close()

if __name__ == "__main__":
    builder = KnowledgeGraphBuilder(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
    builder.build_graph("data/entities.json", "data/relationships.json")
    builder.close()
