# graph/query_engine.py

from graph.neo4j_connector import Neo4jConnector
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

class QueryEngine:
    def __init__(self):
        self.conn = Neo4jConnector(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)

    def get_tier_features(self, tier):
        records = self.conn.run_query(
            """
            MATCH (t:SubscriptionTier {name: $tier})-[:INCLUDES]->(f:Feature)
            RETURN f.name AS feature
            """,
            {"tier": tier}
        )
        return [r["feature"] for r in records]

    def get_tier_limitations(self, tier):
        records = self.conn.run_query(
            """
            MATCH (t:SubscriptionTier {name: $tier})
            RETURN t.limitations AS limitations
            """,
            {"tier": tier}
        )
        return records[0]["limitations"] if records else []

    def get_tier_support(self, tier):
        records = self.conn.run_query(
            """
            MATCH (t:SubscriptionTier {name: $tier})-[:SUPPORTS]->(s:SupportChannel)
            RETURN s.name AS support
            """,
            {"tier": tier}
        )
        return [r["support"] for r in records]

    def get_upgradable_tiers(self, tier):
        records = self.conn.run_query(
            """
            MATCH (t:SubscriptionTier {name: $tier})-[:CAN_UPGRADE_TO]->(u:SubscriptionTier)
            RETURN u.name AS upgrade
            """,
            {"tier": tier}
        )
        return [r["upgrade"] for r in records]

    def get_features_after_upgrade(self, from_tier, to_tier):
        records = self.conn.run_query(
            """
            MATCH (a:SubscriptionTier {name:$from})-[:CAN_UPGRADE_TO*1..]->(b:SubscriptionTier {name:$to})
            MATCH (b)-[:INCLUDES]->(f:Feature)
            RETURN DISTINCT f.name AS feature
            """,
            {"from": from_tier, "to": to_tier}
        )
        return [r["feature"] for r in records]

    def close(self):
        self.conn.close()
