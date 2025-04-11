// src/components/SimuliaKnowledgeAssistant.js
import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, HelpCircle, ArrowRightCircle, Settings, RefreshCw, Zap, Shield, Phone, X, Info, Check } from 'lucide-react';
import { fetchGraphData, getAnswer } from '../services/api';
import { GraphVisualizer } from './GraphVisualizer';
// You'll need to import your PNG file - adjust the path as needed
// For example, if your image is in the 'src/assets' folder:
import SimuliaIcon from '../simulia.png';

// SIMULIA Subscription Knowledge Graph data (fallback data)
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

export const SimuliaKnowledgeAssistant = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { 
      role: 'system', 
      content: 'Welcome to SIMULIA Subscription Assistant! Ask me questions about our subscription tiers, features, limitations, and support options.'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [showGraphView, setShowGraphView] = useState(false);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [activeTier, setActiveTier] = useState(null);
  const [activeView, setActiveView] = useState('comparison');
  const [suggestions, setSuggestions] = useState([
    "What features are included in the Premium tier?",
    "What are the limitations of the Basic tier?",
    "How does Standard support compare to Premium?",
    "Can I upgrade from Basic to Premium directly?"
  ]);
  const [error, setError] = useState(null);
  
  // Reference for the chat messages container
  const messagesEndRef = useRef(null);

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch graph data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchGraphData();
        if (data && data.nodes && data.links) {
          setGraphData(data);
        } else {
          // Fallback to client-side graph generation
          setGraphData(createGraphData());
        }
      } catch (err) {
        console.error("Error fetching graph data:", err);
        setError("Failed to fetch graph data. Using local data instead.");
        setGraphData(createGraphData());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to filter graph data based on selected tier
  const filterGraphByTier = async (tier) => {
    setLoading(true);
    
    try {
      if (!tier) {
        // No tier selected, fetch all data
        const data = await fetchGraphData();
        setGraphData(data);
      } else {
        // Tier selected, filter data
        const data = await fetchGraphData(tier);
        setGraphData(data);
      }
    } catch (err) {
      console.error("Error filtering graph by tier:", err);
      setError(`Failed to filter graph for tier: ${tier}`);
      
      // Fallback to client-side filtering
      if (!tier) {
        setGraphData(createGraphData());
      } else {
        const fullGraph = createGraphData();
        
        // Get all links connected to the tier
        const tierLinks = fullGraph.links.filter(link => 
          link.source === tier || link.target === tier
        );
        
        // Get all nodes connected to the tier
        const connectedNodeIds = new Set();
        connectedNodeIds.add(tier);
        
        tierLinks.forEach(link => {
          connectedNodeIds.add(typeof link.source === 'object' ? link.source.id : link.source);
          connectedNodeIds.add(typeof link.target === 'object' ? link.target.id : link.target);
        });
        
        const filteredNodes = fullGraph.nodes.filter(node => connectedNodeIds.has(node.id));
        
        setGraphData({
          nodes: filteredNodes,
          links: tierLinks
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler for tier selection
  const handleTierSelect = (tier) => {
    setActiveTier(tier === activeTier ? null : tier);
    filterGraphByTier(tier === activeTier ? null : tier);
  };

  // Function to send query to LLM and get answer
  const handleGetAnswer = async (queryText) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAnswer(queryText);
      
      setMessages([...messages, 
        { role: 'user', content: queryText },
        { role: 'assistant', content: response }
      ]);
      
      setQuery('');
    } catch (err) {
      console.error("Error getting answer from LLM:", err);
      setError("Failed to get an answer. Please try again.");
      
      setMessages([...messages,
        { role: 'user', content: queryText },
        { role: 'assistant', content: "I'm sorry, but I'm having trouble processing your question at the moment. Please try again later." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() === '') return;
    
    handleGetAnswer(query);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleGetAnswer(suggestion);
  };

  // Tier comparison component
  const TierComparison = () => {
    return (
      <div className="w-full overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-blue-600">Basic</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-teal-600">Standard</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">Premium</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Features Row */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">Features</td>
              <td className="px-4 py-3 text-sm text-gray-700">
                <ul className="list-disc pl-5 space-y-1">
                  {subscriptionData.Features.Basic.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                <ul className="list-disc pl-5 space-y-1">
                  {subscriptionData.Features.Standard.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                  <li className="text-gray-400">+ All Basic features</li>
                </ul>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                <ul className="list-disc pl-5 space-y-1">
                  {subscriptionData.Features.Premium.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                  <li className="text-gray-400">+ All Standard features</li>
                </ul>
              </td>
            </tr>
            
            {/* Limitations Row */}
            <tr className="bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">Limitations</td>
              <td className="px-4 py-3 text-sm text-gray-700">
                <ul className="list-disc pl-5 space-y-1">
                  {subscriptionData.Limitations.Basic.map((limitation, idx) => (
                    <li key={idx} className="text-red-600">{limitation}</li>
                  ))}
                </ul>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                <ul className="list-disc pl-5 space-y-1">
                  {subscriptionData.Limitations.Standard.map((limitation, idx) => (
                    <li key={idx} className="text-red-600">{limitation}</li>
                  ))}
                </ul>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                <ul className="list-disc pl-5 space-y-1">
                  {subscriptionData.Limitations.Premium.length === 0 ? (
                    <li className="text-green-600">No limitations</li>
                  ) : (
                    subscriptionData.Limitations.Premium.map((limitation, idx) => (
                      <li key={idx} className="text-red-600">{limitation}</li>
                    ))
                  )}
                </ul>
              </td>
            </tr>
            
            {/* Support Row */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">Support</td>
              <td className="px-4 py-3 text-sm text-gray-700">
                <ul className="list-disc pl-5 space-y-1">
                  {subscriptionData.SupportLevels.Basic.map((support, idx) => (
                    <li key={idx}>{support}</li>
                  ))}
                </ul>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                <ul className="list-disc pl-5 space-y-1">
                  {subscriptionData.SupportLevels.Standard.map((support, idx) => (
                    <li key={idx}>{support}</li>
                  ))}
                </ul>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                <ul className="list-disc pl-5 space-y-1">
                  {subscriptionData.SupportLevels.Premium.map((support, idx) => (
                    <li key={idx} className="font-medium">{support}</li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Feature Cards component for individual tier view
  const FeatureCards = ({ tier }) => {
    if (!tier) return null;
    
    const tierColor = tier === 'Basic' ? 'blue' : tier === 'Standard' ? 'teal' : 'purple';
    
    return (
      <div className="space-y-6">
        <h2 className={`text-xl font-bold text-${tierColor}-600`}>{tier} Tier</h2>
        
        {/* Features */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-medium flex items-center text-gray-800 mb-3">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            Features
          </h3>
          <ul className="space-y-2 pl-7">
            {subscriptionData.Features[tier].map((feature, idx) => (
              <li key={idx} className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
            {tier === 'Standard' && (
              <li className="text-gray-500 italic mt-2">+ All Basic features</li>
            )}
            {tier === 'Premium' && (
              <li className="text-gray-500 italic mt-2">+ All Standard and Basic features</li>
            )}
          </ul>
        </div>
        
        {/* Limitations */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-medium flex items-center text-gray-800 mb-3">
            <Shield className="w-5 h-5 mr-2 text-red-500" />
            Limitations
          </h3>
          <ul className="space-y-2 pl-7">
            {subscriptionData.Limitations[tier].length > 0 ? (
              subscriptionData.Limitations[tier].map((limitation, idx) => (
                <li key={idx} className="flex items-start">
                  <X className="w-4 h-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                  <span>{limitation}</span>
                </li>
              ))
            ) : (
              <li className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>No limitations</span>
              </li>
            )}
          </ul>
        </div>
        
        {/* Support */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-medium flex items-center text-gray-800 mb-3">
            <Phone className="w-5 h-5 mr-2 text-green-500" />
            Support
          </h3>
          <ul className="space-y-2 pl-7">
            {subscriptionData.SupportLevels[tier].map((support, idx) => (
              <li key={idx} className="flex items-start">
                <Check className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>{support}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Upgrade Paths */}
        {subscriptionData.Relationships.Upgrades[tier].length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-medium flex items-center text-gray-800 mb-3">
              <ArrowRightCircle className="w-5 h-5 mr-2 text-blue-500" />
              Upgrade Paths
            </h3>
            <ul className="space-y-2 pl-7">
              {subscriptionData.Relationships.Upgrades[tier].map((upgrade, idx) => (
                <li key={idx} className="flex items-start">
                  <Info className="w-4 h-4 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Can upgrade to {upgrade}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm py-2 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Replace Database icon with PNG image */}
            <img 
              src={SimuliaIcon} 
              alt="Database Icon" 
              className="h-6 w-6" 
            />
            <h1 className="text-xl font-bold text-gray-800">SIMULIA Subscription Assistant</h1>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveView('comparison')}
              className={`px-3 py-1 rounded text-sm ${activeView === 'comparison' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Comparison
            </button>
            <button 
              onClick={() => setActiveView('graph')}
              className={`px-3 py-1 rounded text-sm ${activeView === 'graph' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Knowledge Graph
            </button>
            <button 
              onClick={() => setActiveView('chat')}
              className={`px-3 py-1 rounded text-sm ${activeView === 'chat' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Chat
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 flex">
        {/* Left sidebar - Tier selection */}
        <div className="w-48 flex-shrink-0 mr-4">
          <h2 className="text-base font-medium text-gray-700 mb-2">Subscription Tiers</h2>
          <div className="space-y-1">
            <button
              onClick={() => handleTierSelect('Basic')}
              className={`w-full flex items-center p-2 rounded-lg shadow-sm ${
                activeTier === 'Basic' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
              <span className="font-medium">Basic</span>
            </button>
            
            <button
              onClick={() => handleTierSelect('Standard')}
              className={`w-full flex items-center p-2 rounded-lg shadow-sm ${
                activeTier === 'Standard' 
                  ? 'bg-teal-100 text-teal-700 border border-teal-300' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <span className="h-3 w-3 rounded-full bg-teal-500 mr-2"></span>
              <span className="font-medium">Standard</span>
            </button>
            
            <button
              onClick={() => handleTierSelect('Premium')}
              className={`w-full flex items-center p-2 rounded-lg shadow-sm ${
                activeTier === 'Premium' 
                  ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <span className="h-3 w-3 rounded-full bg-purple-500 mr-2"></span>
              <span className="font-medium">Premium</span>
            </button>
          </div>
          
          {activeView === 'comparison' && (
            <div className="mt-4">
              <h2 className="text-base font-medium text-gray-700 mb-2">Legend</h2>
              <div className="bg-white p-2 rounded-lg shadow-sm space-y-1">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-sm">Features</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm">Limitations</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm">Support</span>
                </div>
                <div className="flex items-center">
                  <ArrowRightCircle className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm">Upgrades</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Main content area */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6">
          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-500">
                <X size={18} />
              </button>
            </div>
          )}
        
          
          {!loading && activeView === 'comparison' && (
            activeTier ? <FeatureCards tier={activeTier} /> : <TierComparison />
          )}
          
          {!loading && activeView === 'graph' && (
            <div className="h-72">
              <GraphVisualizer graphData={graphData} activeTier={activeTier} />
            </div>
          )}
          
          {activeView === 'chat' && (
            <>
              {/* Chat messages */}
              <div className="h-72 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-3xl rounded-lg px-4 py-2 ${
                      msg.role === 'user' 
                        ? 'bg-blue-100 text-gray-800' 
                        : msg.role === 'system'
                        ? 'bg-gray-100 text-gray-700 border border-gray-200'
                        : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                    }`}>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                )}
                {/* This empty div serves as a reference point for scrolling */}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Suggested questions */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Suggested questions:</h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700"
                      disabled={loading}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Input form */}
              <form onSubmit={handleSubmit} className="flex items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about SIMULIA subscription tiers..."
                    className="w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                </div>
                <button
                  type="submit"
                  disabled={loading || query.trim() === ''}
                  className={`ml-2 bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center ${
                    loading || query.trim() === '' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
};