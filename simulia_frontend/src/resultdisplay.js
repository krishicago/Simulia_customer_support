import React from "react";

export default function ResultDisplay({ answer }) {
  if (answer == null) return null;
  return (
    <div>
      <h3>Answer:</h3>
      <p>{answer}</p>
    </div>
  );
}
