# Simulia_customer_support

# SIMULIA Subscription Assistant

An intelligent customer support system powered by a knowledge graph and a local large language model (LLM) to help users explore SIMULIA subscription tiers, features, limitations, and support options. Users can interact through an intuitive UI, ask questions in plain English, and receive accurate answers grounded in structured knowledge.

---

## 🎯 Features

- **Interactive Knowledge Graph**: Visualize the relationships between subscription tiers, features, limitations, and support levels.
- **Comparison View**: Side-by-side comparison of different subscription tiers.
- **Chat Interface**: Ask questions about subscription details and get instant answers using a connected LLM.
- **Tier Filtering**: Focus on specific subscription tiers to understand their offerings better.
- **LLM Integration**: Converts user questions into graph-aware queries and generates natural-sounding answers.
- **Multi-hop Reasoning**: Supports chained queries like upgrade paths and their associated benefits.

---

## 🧰 Technologies Used

### 🖥️ Frontend

- **React** – Component-based UI library
- **Tailwind CSS** – Utility-first CSS framework for styling
- **Recharts** – For charting and tier comparisons
- **D3.js** – For knowledge graph visualization
- **Lucide React** – Icon set for UI consistency

### 🧠 Backend / Graph Intelligence

- **Neo4j** – Graph database to store and query subscription tiers, features, limitations, and support levels
- **Cypher** – Query language for Neo4j
- **LangChain** – Framework for integrating LLMs with external knowledge sources like graphs
- **Mistral 7B (GGUF)** – Open-source LLM used for parsing user questions and generating answers
- **Python** – Backend language for data loading, query engine, and app logic
- **Streamlit** – Optional minimal frontend for rapid QA testing and demos

---

## 🚀 Installation

### Frontend Setup

```bash
git clone https://github.com/your-username/simulia-subscription-assistant.git
cd simulia-subscription-assistant
npm install
npm start

### Backend Setup
Ensure Neo4j is installed and running locally (use Neo4j Desktop or Docker)

Navigate to the backend and install Python dependencies:

pip install -r requirements.txt
Configure Neo4j connection credentials in config.py:

# config.py
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "neo4j123"  # Replace with your actual Neo4j password
Load the knowledge graph into Neo4j:


Building the Neo4j graph:
python graph/build_graph.py

