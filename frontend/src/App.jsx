// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Auth from "./Auth";
import "./index.css";

const Dashboard = ({ user }) => {
  const [activePanel, setActivePanel] = useState("hospital");

  const defaultHInfo = {
    name: "City Life Multi-Specialty",
    addr: "78 Health St, Medical District",
    contact: "+91 9900-1122",
    erBeds: "03",
    o2Level: "88"
  };

  const defaultDocs = [
    { name: "Dr. Kapoor (Cardio)", status: "Available" },
    { name: "Dr. Verma (Neuro)", status: "04:00 PM" }
  ];

  const [hInfo, setHInfo] = useState(() => {
    const saved = localStorage.getItem(`hInfo_${user}`);
    return saved ? JSON.parse(saved) : defaultHInfo;
  });

  const [docs, setDocs] = useState(() => {
    const saved = localStorage.getItem(`docs_${user}`);
    return saved ? JSON.parse(saved) : defaultDocs;
  });

  const [vitals, setVitals] = useState({ heart: 72, spo2: 98, temp: 36.5, status: "NORMAL" });
  const [predictionData, setPredictionData] = useState({
    age: "", sex: "", cp: "", trestbps: "", chol: "", fbs: "", thalach: ""
  });
  const [predictResult, setPredictResult] = useState(null);
  const [predictError, setPredictError] = useState("");
  const [logs, setLogs] = useState([]);

  // Fetch Dashboard Data from Backend
  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/dashboard-data/${user}`);
      if (response.data && response.data.h_info && response.data.docs) {
        setHInfo(response.data.h_info);
        setDocs(response.data.docs);
        localStorage.setItem(`hInfo_${user}`, JSON.stringify(response.data.h_info));
        localStorage.setItem(`docs_${user}`, JSON.stringify(response.data.docs));
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data from backend", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Fetch History Logs from Backend
  const fetchLogs = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/logs/${user}`);
      setLogs(response.data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  useEffect(() => {
    if (activePanel === "logs") fetchLogs();
  }, [activePanel]);

  const handleSaveDashboard = async () => {
    // 1. Save to LocalStorage immediately
    localStorage.setItem(`hInfo_${user}`, JSON.stringify(hInfo));
    localStorage.setItem(`docs_${user}`, JSON.stringify(docs));

    // 2. Save to backend database
    try {
      await axios.post("http://localhost:5000/dashboard-data", {
        email: user,
        h_info: hInfo,
        docs: docs
      });
      alert("Dashboard updated and saved successfully!");
    } catch (err) {
      console.error("Failed to sync dashboard data with server", err);
      alert("Dashboard updated locally, but failed to sync with server.");
    }
    setActivePanel("hospital");
  };

  // Simulation for Patient Vitals (Heart Beat, SpO2)
  useEffect(() => {
    const interval = setInterval(() => {
      const heart = Math.floor(Math.random() * (110 - 65)) + 65;
      const spo2 = Math.floor(Math.random() * (100 - 90)) + 90;
      let status = (heart > 100 || spo2 < 92) ? "CRITICAL" : "NORMAL";
      setVitals(prev => ({ ...prev, heart, spo2, status }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const openDevicePage = () => {
    window.open('http://192.168.4.1', '_blank');
  };

  // Sidebar Menu Items
  const menuItems = [
    { id: "hospital", label: "Hospital Dash", icon: "🏥" },
    { id: "patient", label: "Patient Portal", icon: "👤" },
    { id: "predict", label: "AI Prediction", icon: "❤️" },
    { id: "logs", label: "History Logs", icon: "📊" },
    { id: "admin", label: "Manage Data", icon: "⚙️" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handlePredictSubmit = async (e) => {
    e.preventDefault();
    setPredictError(""); setPredictResult(null);
    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: Object.values(predictionData).map(Number) }),
      });
      const data = await response.json();
      if (response.ok) {
        const prob = data.probability * 100;
        let resText = "";
        
        if (prob >= 50) {
          resText = "⚠️ High Risk (Heart Disease Detected)";
        } else if (prob >= 30) {
          resText = "🟠 Moderate Risk (Caution Advised)";
        } else {
          resText = "✅ Low Risk (Heart Disease Not Detected)";
        }
        
        setPredictResult(resText);
        
        // Save Log to Backend
        await axios.post("http://localhost:5000/logs", {
          email: user,
          result: resText,
          timestamp: new Date().toLocaleString()
        });
        fetchLogs(); 
      } else {
        setPredictError(data.error);
      }
    } catch (err) {
      setPredictError("Server connection failed.");
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>HEALTH IOT <span>PRO</span></h2>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map(item => (
            <li 
              key={item.id} 
              className={activePanel === item.id ? "active" : ""}
              onClick={() => setActivePanel(item.id)}
            >
              <span className="icon">{item.icon}</span> {item.label}
            </li>
          ))}
          <li className="logout-menu-item" onClick={handleLogout}>
            <span className="icon">🚪</span> Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-container">
        <div className="top-navbar">
          <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
             <h3>{menuItems.find(m => m.id === activePanel)?.label}</h3>
             <button onClick={openDevicePage} className="btn-device">Open Device Page (ESP32)</button>
          </div>
          <div className="nav-user">
            <span className="status-dot">● ESP32 Connected</span>
            <strong>{user}</strong>
          </div>
        </div>

        <div className="panel-content">
          {/* Hospital Panel */}
          {activePanel === "hospital" && (
            <div className="panel-fade">
              <div className="dashboard-grid">
                <div className="card full-width">
                  <h3>Hospital Information</h3>
                  <div className="info-flex">
                    <p><strong>Name:</strong> {hInfo.name}</p>
                    <span className="badge success">Premium Provider</span>
                  </div>
                  <p><strong>Address:</strong> {hInfo.addr}</p>
                  <p><strong>Contact:</strong> {hInfo.contact}</p>
                </div>
                <div className="card">
                  <h3>Oxygen Supply (O2)</h3>
                  <div className="big-value">{hInfo.o2Level} <small>PSI</small></div>
                  <div className="meter-bg"><div className="meter-fill" style={{width: `${hInfo.o2Level}%`}}></div></div>
                  <p className="subtext">Status: High Pressure</p>
                </div>
                <div className="card danger-border">
                  <h3>Emergency Room (ER)</h3>
                  <div className="big-value">{hInfo.erBeds} <small>Free Beds</small></div>
                  <p className="danger-text">Status: Critical Load</p>
                </div>
                <div className="card">
                  <h3>👨‍⚕️ Available Doctors</h3>
                  <div className="docs-list">
                    {docs.map((d, i) => (
                      <div className="info-row" key={i}>
                        <span>{d.name}</span>
                        <b style={{color: d.status === 'Available' ? 'var(--success)' : 'var(--warning)'}}>{d.status}</b>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Patient Portal Panel */}
          {activePanel === "patient" && (
            <div className="panel-fade">
              <div className="dashboard-grid">
                <div className="card">
                  <h3>Heart Beat</h3>
                  <div className="big-value danger-text">{vitals.heart} <small>BPM</small></div>
                </div>
                <div className="card">
                  <h3>SpO2 (Oxygen)</h3>
                  <div className="big-value accent-text">{vitals.spo2} <small>%</small></div>
                </div>
                <div className="card">
                  <h3>Body Temp</h3>
                  <div className="big-value warning-text">{vitals.temp} <small>°C</small></div>
                </div>
                <div className={`card full-width ${vitals.status === "CRITICAL" ? "critical-alert" : "stable-alert"}`}>
                   <h3>Condition: {vitals.status}</h3>
                   <p>{vitals.status === "CRITICAL" ? `⚠️ Action Required: Nearest hospital: ${hInfo.name}` : "Patient is stable. All vitals are within normal range."}</p>
                </div>
              </div>
            </div>
          )}


          {/* Predict Panel */}
          {activePanel === "predict" && (
            <div className="panel-fade">
              <div className="card prediction-card">
                <h3>Heart Disease Risk Prediction (AI)</h3>
                <form onSubmit={handlePredictSubmit} className="form-grid-predict">
                  <div className="input-group-predict">
                    <label>AGE</label>
                    <input type="number" value={predictionData.age} onChange={(e) => setPredictionData({...predictionData, age: e.target.value})} required />
                  </div>
                  <div className="input-group-predict">
                    <label>SEX</label>
                    <select value={predictionData.sex} onChange={(e) => setPredictionData({...predictionData, sex: e.target.value})} required>
                      <option value="">Select Sex</option>
                      <option value="1">Male</option>
                      <option value="0">Female</option>
                    </select>
                  </div>
                  <div className="input-group-predict">
                    <label>CHEST PAIN (CP)</label>
                    <select value={predictionData.cp} onChange={(e) => setPredictionData({...predictionData, cp: e.target.value})} required>
                      <option value="0">Typical Angina (0)</option>
                      <option value="1">Atypical Angina (1)</option>
                      <option value="2">Non-anginal Pain (2)</option>
                      <option value="3">Asymptomatic (3)</option>
                    </select>
                  </div>
                  <div className="input-group-predict">
                    <label>RESTING BP (TRESTBPS)</label>
                    <input type="number" value={predictionData.trestbps} onChange={(e) => setPredictionData({...predictionData, trestbps: e.target.value})} required />
                  </div>
                  <div className="input-group-predict">
                    <label>CHOLESTEROL (CHOL)</label>
                    <input type="number" value={predictionData.chol} onChange={(e) => setPredictionData({...predictionData, chol: e.target.value})} required />
                  </div>
                  <div className="input-group-predict">
                    <label>FASTING BLOOD SUGAR (FBS)</label>
                    <select value={predictionData.fbs} onChange={(e) => setPredictionData({...predictionData, fbs: e.target.value})} required>
                      <option value="0">Lower than 120 mg/dl (0)</option>
                      <option value="1">Higher than 120 mg/dl (1)</option>
                    </select>
                  </div>
                  <div className="input-group-predict">
                    <label>MAX HEART RATE (THALACH)</label>
                    <input type="number" value={predictionData.thalach} onChange={(e) => setPredictionData({...predictionData, thalach: e.target.value})} required />
                  </div>
                  <button type="submit" className="btn-primary">Analyze Health Data</button>
                </form>
                {predictResult && (
                  <div className={`result-box ${
                    predictResult.includes('High') ? 'critical' : 
                    predictResult.includes('Moderate') ? 'moderate' : 'stable'
                  }`}>
                    {predictResult}
                  </div>
                )}
                {predictError && <div className="result-box critical">{predictError}</div>}
              </div>
            </div>
          )}

          {/* Logs Panel */}
          {activePanel === "logs" && (
            <div className="panel-fade">
              <div className="card full-width">
                <h3>Patient Medical Logs</h3>
                <table className="logs-table">
                  <thead>
                    <tr><th>Time</th><th>Prediction Result</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index}>
                        <td>{log.timestamp}</td>
                        <td>{log.result}</td>
                        <td><span className={`badge ${log.result.includes('High') ? 'danger' : 'success'}`}>Logged</span></td>
                      </tr>
                    ))}
                    {logs.length === 0 && <tr><td colSpan="3">No persistent logs found in history.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admin Panel */}
          {activePanel === "admin" && (
            <div className="panel-fade">
              <div className="dashboard-grid">
                <div className="card">
                  <h3>Edit Hospital Info</h3>
                  <div className="admin-form">
                    <label>Hospital Name</label>
                    <input type="text" value={hInfo.name} onChange={(e) => setHInfo({...hInfo, name: e.target.value})} />
                    <label>Address</label>
                    <input type="text" value={hInfo.addr} onChange={(e) => setHInfo({...hInfo, addr: e.target.value})} />
                    <label>Contact</label>
                    <input type="text" value={hInfo.contact} onChange={(e) => setHInfo({...hInfo, contact: e.target.value})} />
                  </div>
                </div>
                <div className="card danger-border">
                  <h3>Edit ER & Oxygen</h3>
                  <div className="admin-form">
                    <label>Available ER Beds</label>
                    <input type="number" value={hInfo.erBeds} onChange={(e) => setHInfo({...hInfo, erBeds: e.target.value})} />
                    <label>Oxygen Level (0-100 PSI)</label>
                    <input type="number" value={hInfo.o2Level} onChange={(e) => setHInfo({...hInfo, o2Level: e.target.value})} />
                  </div>
                </div>
                <div className="card accent-border">
                  <h3>Edit Doctor Status</h3>
                  <div className="admin-form">
                    {docs.map((d, i) => (
                      <div key={i} style={{marginBottom: '10px'}}>
                        <input 
                          type="text" 
                          value={d.name} 
                          onChange={(e) => {
                            const newDocs = [...docs];
                            newDocs[i].name = e.target.value;
                            setDocs(newDocs);
                          }} 
                          placeholder="Doctor Name"
                          style={{marginBottom: '5px'}}
                        />
                        <input 
                          type="text" 
                          value={d.status} 
                          onChange={(e) => {
                            const newDocs = [...docs];
                            newDocs[i].status = e.target.value;
                            setDocs(newDocs);
                          }} 
                          placeholder="Status (Available / Time)"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" onClick={handleSaveDashboard}>
                  💾 SAVE & UPDATE DASHBOARD
                </button>
              </div>
            </div>
          )}

          {activePanel === "patient" && (
            <div className="panel-fade card">
              <h3>Patient Portal</h3>
              <p>Real-time patient monitoring data from ESP32 sensors.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [authUser, setAuthUser] = useState(localStorage.getItem("user"));

  return (
    <Router>
      <div className="app-root">
        <Routes>
          <Route path="/" element={!authUser ? <Auth setAuthUser={setAuthUser} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={authUser ? <Dashboard user={authUser} /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
