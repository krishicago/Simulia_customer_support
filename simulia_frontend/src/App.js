import React, { useState } from "react";
import QuestionForm from "./questionform";
import ResultDisplay from "./resultdisplay";

function App() {
  const [answer, setAnswer] = useState(null);
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>Subscription Tier Q&A</h1>
      <QuestionForm onAnswer={setAnswer} />
      <ResultDisplay answer={answer} />
    </div>
  );
}

export default App;
