from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "neo4j123"))

with driver.session() as session:
    result = session.run("RETURN 'Neo4j is working!' AS message")
    print(result.single()["message"])
