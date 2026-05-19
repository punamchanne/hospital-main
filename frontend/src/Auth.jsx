import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Auth = ({ setAuthUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const endpoint = isLogin ? "/login" : "/signup";
    try {
      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        email,
        password,
      });
      
      if (isLogin) {
        setAuthUser(response.data.email);
        localStorage.setItem("user", response.data.email);
        navigate("/dashboard");
      } else {
        setMessage("✅ Registration Successful! Please Login.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials or server error.");
    }
  };

  const containerStyle = {
    background: '#f0f4f8',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  };

  const loginBoxStyle = {
    background: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    marginBottom: '5px',
    color: '#34495e',
    fontWeight: '600',
    textAlign: 'left'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #dcdde1',
    border_radius: '6px',
    outline: 'none',
    marginBottom: '20px'
  };

  const btnStyle = {
    width: '100%',
    padding: '12px',
    background: '#3498db',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    font_size: '16px',
    font_weight: 'bold',
    cursor: 'pointer',
    transition: '0.3s'
  };

  return (
    <div style={containerStyle}>
      <div style={loginBoxStyle}>
        <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>
          Health Monitor <span style={{ color: '#3498db' }}>IoT</span>
        </h2>
        <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '30px' }}>
          {isLogin ? "Welcome back! Please login to your account." : "Create your account."}
        </p>

        {error && <div style={{ color: '#e74c3c', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
        {message && <div style={{ color: '#27ae60', fontSize: '13px', marginBottom: '15px' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'left' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="iotprojects@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <button type="submit" style={btnStyle}>
            {isLogin ? "Login to Dashboard" : "Register Now"}
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '13px' }}>
          <a href="#" style={{ color: '#3498db', textDecoration: 'none' }}>Forgot Password?</a>
          <p style={{ marginTop: '10px', color: '#7f8c8d' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              onClick={() => { setIsLogin(!isLogin); setError(""); setMessage(""); }} 
              style={{ color: '#3498db', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
