# graph/neo4j_connector.py
from neo4j import GraphDatabase

class Neo4jConnector:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def run_query(self, query, params=None):
        with self.driver.session() as session:
            result = session.run(query, params or {})
            # consume all records into a list
            records = list(result)
            return [record.data() for record in records]

    def close(self):
        self.driver.close()
