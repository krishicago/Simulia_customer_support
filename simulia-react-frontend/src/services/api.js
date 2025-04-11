// src/services/api.js

// Use the explicit Flask server URL
const API_BASE_URL = 'http://localhost:5050/api';

// Create mock subscription data
const subscriptionData = {
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
};

// Convert subscription data to graph format for visualization
const createGraphData = () => {
  const nodes = [];
  const links = [];
  const tiers = ["Basic", "Standard", "Premium"];
  
  // Add tier nodes
  tiers.forEach(tier => {
    nodes.push({
      id: tier,
      group: 'Tier',
      label: tier,
      color: tier === 'Basic' ? '#4299E1' : tier === 'Standard' ? '#38B2AC' : '#805AD5'
    });
  });
  
  // Add feature nodes and connections
  Object.entries(subscriptionData.Features).forEach(([tier, features]) => {
    features.forEach(feature => {
      const featureId = `Feature_${feature.replace(/\s+/g, '_')}`;
      
      // Check if node already exists to avoid duplicates
      if (!nodes.find(node => node.id === featureId)) {
        nodes.push({
          id: featureId,
          group: 'Feature',
          label: feature,
          color: '#F6AD55'
        });
      }
      
      links.push({
        source: tier,
        target: featureId,
        label: 'HAS_FEATURE'
      });
    });
  });
  
  // Add limitation nodes and connections
  Object.entries(subscriptionData.Limitations).forEach(([tier, limitations]) => {
    limitations.forEach(limitation => {
      const limitationId = `Limitation_${limitation.replace(/\s+/g, '_')}`;
      
      if (!nodes.find(node => node.id === limitationId)) {
        nodes.push({
          id: limitationId,
          group: 'Limitation',
          label: limitation,
          color: '#FC8181'
        });
      }
      
      links.push({
        source: tier,
        target: limitationId,
        label: 'HAS_LIMITATION'
      });
    });
  });
  
  // Add support level nodes and connections
  Object.entries(subscriptionData.SupportLevels).forEach(([tier, supports]) => {
    supports.forEach(support => {
      const supportId = `Support_${support.replace(/\s+/g, '_')}`;
      
      if (!nodes.find(node => node.id === supportId)) {
        nodes.push({
          id: supportId,
          group: 'Support',
          label: support,
          color: '#68D391'
        });
      }
      
      links.push({
        source: tier,
        target: supportId,
        label: 'PROVIDES'
      });
    });
  });
  
  // Add upgrade relationships
  Object.entries(subscriptionData.Relationships.Upgrades).forEach(([tier, upgrades]) => {
    upgrades.forEach(upgrade => {
      links.push({
        source: tier,
        target: upgrade,
        label: 'UPGRADES_TO'
      });
    });
  });
  
  return { nodes, links };
};

// Filter graph data for a specific tier
const filterGraphByTier = (tier) => {
  if (!tier) {
    return createGraphData();
  }
  
  const fullGraph = createGraphData();
  
  // Get all links connected to the tier
  const tierLinks = fullGraph.links.filter(link => 
    (typeof link.source === 'object' ? link.source.id : link.source) === tier || 
    (typeof link.target === 'object' ? link.target.id : link.target) === tier
  );
  
  // Get all nodes connected to the tier
  const connectedNodeIds = new Set();
  connectedNodeIds.add(tier);
  
  tierLinks.forEach(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    connectedNodeIds.add(sourceId);
    connectedNodeIds.add(targetId);
  });
  
  const filteredNodes = fullGraph.nodes.filter(node => connectedNodeIds.has(node.id));
  
  return {
    nodes: filteredNodes,
    links: tierLinks
  };
};

// Function to fetch graph data from backend with fallback to mock data
export const fetchGraphData = async (tier = null) => {
  try {
    // Use the full URL
    const endpoint = tier ? `${API_BASE_URL}/graph?tier=${tier}` : `${API_BASE_URL}/graph`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Successfully fetched graph data from backend");
    return data;
  } catch (error) {
    console.log("Using mock data - backend connection issue:", error.message);
    
    // Return filtered or full mock data based on tier
    if (tier) {
      return filterGraphByTier(tier);
    } else {
      return createGraphData();
    }
  }
};

// Helper function for mock answers
const getMockAnswer = (query) => {
  query = query.toLowerCase();
  
  if (query.includes('premium') && query.includes('feature')) {
    return "The Premium tier includes these advanced features:\n\n• High-Performance Computing Integration\n• Co-Simulation with External Tools\n• Full Geometry Optimization Suite\n\nPlus all features from the Standard and Basic tiers.";
  } 
  else if (query.includes('basic') && query.includes('limitation')) {
    return "The Basic tier has these limitations:\n\n• Maximum of 500,000 Degrees of Freedom\n• No access to HPC clusters\n\nYou might want to consider upgrading to Standard or Premium if these limitations affect your workflow.";
  }
  else if (query.includes('standard') && query.includes('premium') && query.includes('support')) {
    return "Support comparison between Standard and Premium tiers:\n\nStandard Support:\n• Email Support (Business Hours)\n• Live Chat (Business Hours)\n\nPremium Support:\n• Phone Support (24/7)\n• Live Chat (24/7)\n• Dedicated Engineer\n\nThe Premium tier offers round-the-clock support and a dedicated engineer for your projects.";
  }
  else if (query.includes('upgrade')) {
    return "Yes, you can upgrade from Basic to Premium directly. Our flexible licensing structure allows you to upgrade from any tier to any higher tier at any time. The cost will be prorated based on your current subscription.";
  }
  else {
    return "I'm here to help with questions about SIMULIA subscription tiers, features, limitations, and support options. You can ask me specific questions about any of our tiers: Basic, Standard, or Premium.";
  }
};

// Function to get answer from LLM with fallback to mock answers
export const getAnswer = async (query) => {
  try {
    // Use the full URL
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Successfully received LLM response from backend");
    return data.answer;
  } catch (error) {
    console.error('Error getting answer:', error);
    // Fallback to mock answers
    console.log("Falling back to mock LLM responses due to error");
    return getMockAnswer(query);
  }
};