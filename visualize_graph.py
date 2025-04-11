# visualize_graph.py

from pyvis.network import Network
from neo4j import GraphDatabase
from config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

def fetch_graph_data(tx):
    # Return node names, their labels (type), and relationships
    query = """
    MATCH (n)-[r]->(m)
    RETURN 
      id(n) AS from_id, n.name AS from_name, labels(n)[0] AS from_type,
      type(r) AS relation,
      id(m) AS to_id, m.name AS to_name, labels(m)[0] AS to_type
    """
    return [record.data() for record in tx.run(query)]

def visualize_neo4j_graph():
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    net = Network(
        height="750px", width="100%",
        directed=True,
        notebook=False,
        bgcolor="#ffffff",
        font_color="black"
    )
    net.barnes_hut()  # better physics layout

    with driver.session() as session:
        records = session.execute_read(fetch_graph_data)

    # Keep track of added nodes to avoid duplicates
    added = set()

    for rec in records:
        # Extract data
        fid, fname, ftype = rec["from_id"], rec["from_name"], rec["from_type"]
        tid, tname, ttype = rec["to_id"], rec["to_name"], rec["to_type"]
        rel = rec["relation"]

        # Style tiers vs features
        def style(node_type):
            if node_type == "SubscriptionTier":
                return {"color": "#4caf50", "shape": "box"}
            elif node_type == "Feature":
                return {"color": "#2196f3", "shape": "ellipse"}
            else:
                return {"color": "#9e9e9e", "shape": "dot"}

        # Add 'from' node
        if fid not in added:
            st = style(ftype)
            net.add_node(fid, label=fname, title=ftype, **st)
            added.add(fid)

        # Add 'to' node
        if tid not in added:
            st = style(ttype)
            net.add_node(tid, label=tname, title=ttype, **st)
            added.add(tid)

        # Add edge
        net.add_edge(fid, tid, label=rel, arrows="to")

    # Save the interactive HTML
    net.show("graph_visualization.html")
    print("✅ Enhanced graph saved to graph_visualization.html")
    driver.close()

if __name__ == "__main__":
    visualize_neo4j_graph()
