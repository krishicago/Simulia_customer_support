# app.py
from flask import Flask, request, jsonify, make_response
from functools import wraps
import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import LLM modules - for Mistral integration
try:
    from llama_cpp import Llama
    HAS_LLAMA_CPP = True
except ImportError:
    HAS_LLAMA_CPP = False
    print("Warning: llama_cpp not found. LLM functionality will use mock responses.")

app = Flask(__name__)

# Custom CORS handling
def cors_enabled(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Create response object
        if request.method == 'OPTIONS':
            response = make_response()
        else:
            response = make_response(f(*args, **kwargs))
            
        # Add CORS headers
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        
        return response
    return decorated_function

# Sample data for testing
SUBSCRIPTION_DATA = {
    "Features": {
        "Basic": [
            "Single-Physics Simulation",
            "Basic Geometry Handling"
        ],
        "Standard": [
            "Multi-Physics Simulation",
            "Parametric Sweeps",
            "Advanced Meshing Toolkit"
        ],
        "Premium": [
            "High-Performance Computing Integration",
            "Co-Simulation with External Tools",
            "Full Geometry Optimization Suite"
        ]
    },
    "Limitations": {
        "Basic": [
            "Max 500k Degrees of Freedom",
            "No HPC Cluster Access"
        ],
        "Standard": [
            "Max 2 Million Degrees of Freedom",
            "Limited HPC Nodes (Up to 2)"
        ],
        "Premium": []
    },
    "SupportLevels": {
        "Basic": [
            "Email Support (Next-Business-Day Response)"
        ],
        "Standard": [
            "Email Support (Business Hours)",
            "Live Chat (Business Hours)"
        ],
        "Premium": [
            "Phone Support (24/7)",
            "Live Chat (24/7)",
            "Dedicated Engineer"
        ]
    },
    "Relationships": {
        "Upgrades": {
            "Basic": ["Standard", "Premium"],
            "Standard": ["Premium"],
            "Premium": []
        },
        "SUPPORTS": {
            "Basic": ["Email Support (Next-Business-Day Response)"],
            "Standard": ["Email Support (Business Hours)", "Live Chat (Business Hours)"],
            "Premium": ["Phone Support (24/7)", "Live Chat (24/7)", "Dedicated Engineer"]
        }
    }
}

# LLM setup
MODEL_PATH = "models/mistral-7b-instruct-v0.1.Q4_K_M.gguf"
llm = None

if HAS_LLAMA_CPP and os.path.exists(MODEL_PATH):
    try:
        llm = Llama(
            model_path=MODEL_PATH,
            n_ctx=2048,  # Context window size
            n_batch=512  # Batch size
        )
        print(f"Successfully loaded Mistral model from {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading Mistral model: {e}")
        llm = None
else:
    if not HAS_LLAMA_CPP:
        print("llama_cpp not installed. Install with: pip install llama-cpp-python")
    else:
        print(f"Model file not found at {MODEL_PATH}")

def get_subscriptions_graph():
    """Create a graph representation for visualization from subscription data."""
    nodes = []
    links = []
    tiers = ["Basic", "Standard", "Premium"]
    
    # Add tier nodes
    for tier in tiers:
        nodes.append({
            "id": tier,
            "group": "Tier",
            "label": tier,
            "color": "#4299E1" if tier == "Basic" else "#38B2AC" if tier == "Standard" else "#805AD5"
        })
    
    # Add feature nodes and connections
    for tier, features in SUBSCRIPTION_DATA["Features"].items():
        for feature in features:
            feature_id = f"Feature_{feature.replace(' ', '_')}"
            
            # Check if node already exists
            if not any(node["id"] == feature_id for node in nodes):
                nodes.append({
                    "id": feature_id,
                    "group": "Feature",
                    "label": feature,
                    "color": "#F6AD55"
                })
            
            links.append({
                "source": tier,
                "target": feature_id,
                "label": "HAS_FEATURE"
            })
    
    # Add limitation nodes and connections
    for tier, limitations in SUBSCRIPTION_DATA["Limitations"].items():
        for limitation in limitations:
            limitation_id = f"Limitation_{limitation.replace(' ', '_')}"
            
            if not any(node["id"] == limitation_id for node in nodes):
                nodes.append({
                    "id": limitation_id,
                    "group": "Limitation",
                    "label": limitation,
                    "color": "#FC8181"
                })
            
            links.append({
                "source": tier,
                "target": limitation_id,
                "label": "HAS_LIMITATION"
            })
    
    # Add support level nodes and connections
    for tier, supports in SUBSCRIPTION_DATA["SupportLevels"].items():
        for support in supports:
            support_id = f"Support_{support.replace(' ', '_')}"
            
            if not any(node["id"] == support_id for node in nodes):
                nodes.append({
                    "id": support_id,
                    "group": "Support",
                    "label": support,
                    "color": "#68D391"
                })
            
            links.append({
                "source": tier,
                "target": support_id,
                "label": "PROVIDES"
            })
    
    # Add upgrade relationships
    for tier, upgrades in SUBSCRIPTION_DATA["Relationships"]["Upgrades"].items():
        for upgrade in upgrades:
            links.append({
                "source": tier,
                "target": upgrade,
                "label": "UPGRADES_TO"
            })
    
    return {"nodes": nodes, "links": links}

def get_data_for_tier(tier):
    """Get graph data filtered for a specific tier."""
    full_graph = get_subscriptions_graph()
    
    # Get all links connected to the tier
    tier_links = [link for link in full_graph["links"] if link["source"] == tier or link["target"] == tier]
    
    # Get all nodes connected to the tier
    connected_node_ids = {tier}
    
    for link in tier_links:
        source = link["source"]
        target = link["target"]
        
        if isinstance(source, dict):
            source = source["id"]
        if isinstance(target, dict):
            target = target["id"]
            
        connected_node_ids.add(source)
        connected_node_ids.add(target)
    
    filtered_nodes = [node for node in full_graph["nodes"] if node["id"] in connected_node_ids]
    
    return {"nodes": filtered_nodes, "links": tier_links}

def get_answer_for_query(query):
    """Get answer from LLM based on query - will use Mistral model if available, otherwise mock responses."""
    if llm is not None:
        try:
            # System context with subscription information
            system_prompt = """You are an assistant for SIMULIA subscription services.
            You help users understand the differences between Basic, Standard, and Premium tiers.
            Basic tier includes: Single-Physics Simulation, Basic Geometry Handling
            Standard tier includes: Multi-Physics Simulation, Parametric Sweeps, Advanced Meshing Toolkit, plus all Basic features
            Premium tier includes: High-Performance Computing Integration, Co-Simulation with External Tools, Full Geometry Optimization Suite, plus all Standard features
            Basic limitations: Max 500k Degrees of Freedom, No HPC Cluster Access
            Standard limitations: Max 2 Million Degrees of Freedom, Limited HPC Nodes (Up to 2)
            Premium has no limitations.
            Basic support: Email Support (Next-Business-Day Response)
            Standard support: Email Support (Business Hours), Live Chat (Business Hours)
            Premium support: Phone Support (24/7), Live Chat (24/7), Dedicated Engineer
            Users can upgrade from any tier to any higher tier.
            Always provide clear, concise, and accurate information."""
            
            # Format prompt for Mistral
            prompt = f"<s>[INST] {system_prompt}\n\nUser: {query} [/INST]"
            
            # Generate response
            response = llm(
                prompt,
                max_tokens=512,
                stop=["</s>", "[INST]"],
                echo=False
            )
            
            # Extract and clean up the generated text
            answer = response['choices'][0]['text'].strip()
            return answer
        except Exception as e:
            print(f"Error generating LLM response: {e}")
            # Fallback to mock responses
            return get_mock_answer(query)
    else:
        # Use mock responses if LLM is not available
        return get_mock_answer(query)

def get_mock_answer(query):
    """Provide mock answers based on query content."""
    query = query.lower()
    
    if "premium" in query and "feature" in query:
        return "The Premium tier includes these advanced features:\n\n• High-Performance Computing Integration\n• Co-Simulation with External Tools\n• Full Geometry Optimization Suite\n\nPlus all features from the Standard and Basic tiers."
    
    elif "basic" in query and "limitation" in query:
        return "The Basic tier has these limitations:\n\n• Maximum of 500,000 Degrees of Freedom\n• No access to HPC clusters\n\nYou might want to consider upgrading to Standard or Premium if these limitations affect your workflow."
    
    elif ("standard" in query and "premium" in query and "support" in query) or ("compare" in query and "support" in query):
        return "Support comparison between Standard and Premium tiers:\n\nStandard Support:\n• Email Support (Business Hours)\n• Live Chat (Business Hours)\n\nPremium Support:\n• Phone Support (24/7)\n• Live Chat (24/7)\n• Dedicated Engineer\n\nThe Premium tier offers round-the-clock support and a dedicated engineer for your projects."
    
    elif "upgrade" in query:
        return "Yes, you can upgrade from Basic to Premium directly. Our flexible licensing structure allows you to upgrade from any tier to any higher tier at any time. The cost will be prorated based on your current subscription."
    
    else:
        return "I'm here to help with questions about SIMULIA subscription tiers, features, limitations, and support options. You can ask me specific questions about any of our tiers: Basic, Standard, or Premium."

@app.route('/api/graph', methods=['GET', 'POST', 'OPTIONS'])
@cors_enabled
def get_graph_data():
    """Endpoint to retrieve knowledge graph data."""
    if request.method == 'OPTIONS':
        return ''
        
    # Get tier parameter from request
    if request.method == 'POST':
        data = request.json
        tier = data.get('tier', None)
    else:
        tier = request.args.get('tier', None)
    
    # Get graph data based on tier
    if tier:
        graph_data = get_data_for_tier(tier)
    else:
        graph_data = get_subscriptions_graph()
    
    return jsonify(graph_data)

@app.route('/api/query', methods=['POST', 'OPTIONS'])
@cors_enabled
def query_llm():
    """Endpoint to query the LLM for answers."""
    if request.method == 'OPTIONS':
        return ''
        
    data = request.json
    query = data.get('query', '')
    
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    # Get answer from LLM
    answer = get_answer_for_query(query)
    
    return jsonify({'answer': answer})

@app.route('/api/test', methods=['GET', 'OPTIONS'])
@cors_enabled
def test_endpoint():
    """Test endpoint to verify API is working."""
    if request.method == 'OPTIONS':
        return ''
    return jsonify({"status": "API is working", "llm_available": llm is not None})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050, debug=False)
