import React, { useState, useEffect } from "react";
import "./FindSchools.css";

export default function FindSchools() {
  const [schoolName, setSchoolName] = useState("");      // input value
  const [data, setData] = useState(null);               // API response
  const [submitted, setSubmitted] = useState(false);    // has user submitted
  const [tuitionType, setTuitionType] = useState("");   // inState/outState
  const [chatReply, setChatReply] = useState("");       // ChatGPT meal plan
  const [loading, setLoading] = useState(false);        // API loading
  const [loadingChat, setLoadingChat] = useState(false);

  // Fetch school info when submitted
  useEffect(() => {
    if (!submitted || !schoolName) return;

    const fetchSchool = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/tuition?name=${encodeURIComponent(schoolName)}`
        );
        if (!res.ok) throw new Error("School not found");
        const json = await res.json();
        setData(json);

        // Ask ChatGPT for meal plans
        setLoadingChat(true);
        const chatRes = await fetch("http://localhost:5000/ask-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Give me the least and most expensive meal plans at ${schoolName} just make it two bullet points`
          })
        });
        const chatJson = await chatRes.json();
        setChatReply(chatJson.reply);
      } catch (err) {
        console.error(err);
        setData(null);
        setChatReply("");
      } finally {
        setLoading(false);
        setLoadingChat(false);
      }
    };

    fetchSchool();
  }, [submitted, schoolName]);

  // Save school to backend
  const saveSchool = async () => {
    if (!data) return;
    const stateInOut = tuitionType === "inState" ? "In-State" : "Out of State";
    const newSchool = {
      name: data.name,
      state: data.state,
      city: data.city,
      tution: `${stateInOut}: ${
        tuitionType === "inState"
          ? data.tuition.in_state
          : data.tuition.out_of_state
      }`
    };
    try {
      await fetch("http://localhost:5000/api/append-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchool)
      });
      alert("School saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save school.");
    }
  };

  return (
    <div className="card">
      <div className="flex-center">
        <div className="grid">
          <h2>Enter the College of your choice</h2>
          <input
            type="text"
            value={schoolName}
            placeholder="UNC Charlotte"
            onChange={(e) => setSchoolName(e.target.value)}
          />
          <label>
            <p>In-State or Out of State</p>
          </label>
          <select
            value={tuitionType}
            onChange={(e) => setTuitionType(e.target.value)}
          >
            <option value=""></option>
            <option value="inState">In-State</option>
            <option value="outState">Out of State</option>
          </select>
          <button
            onClick={() => setSubmitted(true)}
            className="btn btn-primary"
          >
            Get Cost Rates
          </button>

          {loading && <p>Loading school data...</p>}

          {data && (
            <div className="school-info">
              <h2>School Info:</h2>
              <h3>Name: {data.name}</h3>
              <h3>State: {data.state}</h3>
              <h3>City: {data.city}</h3>
              <h3>
                Tuition:{" "}
                {tuitionType === "inState"
                  ? data.tuition.in_state
                  : data.tuition.out_of_state}
              </h3>

              <div className="meal-plans">
                <h3>Meal Plans</h3>
                {loadingChat && <p>Loading ChatGPT response...</p>}
                {chatReply && <p>{chatReply}</p>}
              </div>

              <button onClick={saveSchool} className="btn btn-secondary">
                Save Results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
