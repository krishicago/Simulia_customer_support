import React, { useState } from "react";

export default function QuestionForm({ onAnswer }) {
  const [question, setQuestion] = useState("");
  const [tier, setTier] = useState("Basic");
  const [infoType, setInfoType] = useState("features");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    onAnswer(null);

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, tier_name: tier, info_type: infoType })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unknown error");
      onAnswer(data.answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Question:</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Tier:</label>
        <select value={tier} onChange={(e) => setTier(e.target.value)}>
          <option>Basic</option>
          <option>Standard</option>
          <option>Premium</option>
        </select>
      </div>
      <div>
        <label>Info Type:</label>
        <select value={infoType} onChange={(e) => setInfoType(e.target.value)}>
          <option value="features">Features</option>
          <option value="limitations">Limitations</option>
          <option value="support">Support</option>
          <option value="upgrades">Upgrades</option>
        </select>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Ask"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
