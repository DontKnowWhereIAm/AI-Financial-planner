import React, { useState, useEffect } from 'react';

export default function FindSchools({ onSchools }) {
  const [school, setSchool] = useState(''); 
  const [data, setData] = useState(null);   
  const [submitted, setSubmitted] = useState(false); 
    const [chatReply, setChatReply] = useState('');
    
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSchools(school)) {
      setSubmitted(true); 
    }
  };
  const askChatGPT = async (prompt) => {
  try {
    const res = await fetch(`http://localhost:5000/ask-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    setChatReply(data.reply);
  } catch (err) {
    console.error(err);
  }
};
  useEffect(() => {
    if (!submitted) return;

    fetch(`http://localhost:5000/get-school?name=${school}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      askChatGPT(`Give me the least and most expensive meal plans at ${school} just make it two bullet points `);

  }, [submitted, school]); 

  return (
    <div>
      <h2>Enter the College of your choice</h2>
      <input
        type="text"
        value={school}
        onChange={(e) => setSchool(e.target.value)}
      />
      <button onClick={handleSubmit} className="btn btn-primary">
        Get Cost Rates
      </button>

      {}
      {data && (
        <div>
            <div>
          <h2>School Info:</h2>
            <h3>Name : {data.school.name}</h3>
            <h3>State : {data.school.state}</h3>
            <h3>City : {data.school.city}</h3>
            <h3>Average Tution : {data.school.tution}</h3>
            </div>
            
            <div>
            <h2>Additional Costs</h2>
            <h3>Meal Plans</h3>
            {chatReply && (
                <div>
                    <p>{chatReply}</p>
                </div>)}
                </div>
        </div>
        
      )}
    </div>
  );
}