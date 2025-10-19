import React, { useState, useEffect } from 'react';
import './FindSchools.css';
export default function FindSchools({ onSchools }) {
  const [school, setSchool] = useState(''); 
  const [data, setData] = useState(null);   
  const [submitted, setSubmitted] = useState(false); 
  const [chatReply, setChatReply] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSchools(school)) {
      setSubmitted(true); 
    }

  };
  const saveSchool = async()=>{
    let stateInOut = "";
    const tutionstate = document.getElementById("tution");
    if(tutionstate == "inState"){
      stateInOut = "In-State:" ;
    }
    else{
      stateInOut = "Out of State:";
    }
    const newSchool = {
      "name" : school.name,
        "state" : school.state,
        "city" : school.city,
        "tution" : `${stateInOut} ${school.tution}`
    }
    await fetch('http://localhost:5000/api/append-school', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newSchool),
  });
  }
  const askChatGPT = async (prompt) => {
    setLoadingChat(true);
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
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    if (!submitted) return;

    fetch(`http://localhost:5000/get-school?name=${school}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        askChatGPT(`Give me the least and most expensive meal plans at ${school} just make it two bullet points`);
      })
      .catch((err) => console.error(err));

  }, [submitted, school]);

  return (
    <div className = "card">
      <div className = "flex-center">
        <div className = "grid">
      <h2 >Enter the College of your choice</h2>
      <input
        type="text"
        value={school}
        id = "input-box"
        onChange={(e) => setSchool(e.target.value)}
      />
      <label ><p>In-State or Out of State</p></label>
      <select class = "tuition" id  = "tuition">
      <option value = ""></option>
      <option value = "inState">In-State</option>
      <option value = "outState">Out of State</option>
      </select>
      <button id = "school-button"onClick={handleSubmit} className="btn btn-primary">
        Get Cost Rates
      </button>
      </div>
         
      {data && (
        <div>
          <div>
            <h2>School Info:</h2>
            <h3>Name : {data.school.name}</h3>
            <h3>State : {data.school.state}</h3>
            <h3>City : {data.school.city}</h3>
            <h3>Average Tuition :</h3>
            <h4>{data.school.tution.instate}</h4>
            <h4>{data.school.tution.outofstate}</h4>
          </div>

          <div>
            <h2>Additional Costs</h2>
            <h3>Meal Plans</h3>
            {loadingChat && <p>Loading ChatGPT response...</p>}
            {chatReply && <p>{chatReply}</p>}
          </div>
          <button onClick = {saveSchool()} id = "save">Save Results</button>
        </div>
      )}
      </div>
    </div>
  );
}
