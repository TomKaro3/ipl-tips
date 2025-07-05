import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username || !password) return alert("Enter both username and password");
    setLoading(true);
    axios
      .post(`${process.env.REACT_APP_API_BASE_URL}/users/login`, { username, password })
      .then(() => {
        localStorage.setItem("username", username);
        navigate("/tips");
      })
      .catch(() => {
        alert("Login failed. Check username and password.");
      })
      .finally(() => setLoading(false));
  };

  const page = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
    background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    background: "linear-gradient(135deg, #4b6cb7, #182848)",
    fontFamily: "Arial, sans-serif",
  };

  const card = {
    width: "100%",
    maxWidth: "360px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  };

  const button = {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    background: "linear-gradient(135deg, #ff416c, #ff4b2b)",

  };

  const buttonDisabled = {
    ...button,
    background: "#d3d3d3",
    cursor: "not-allowed",
  };

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={{ margin: 0, textAlign: "center", color: "#333" }}>IPL Tips</h1>
        <h2
          style={{
            margin: "0 0 0.5rem 0",
            textAlign: "center",
            color: "#333",
            fontWeight: "normal",
          }}
        >
          Welcome back
        </h2>

        <h1 style={{ margin: 0, textAlign: "center", color: "#333" }}>Welcome Back</h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          style={inputStyle}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          style={loading ? buttonDisabled : button}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
        <p style={{ textAlign: "center", fontSize: "0.9rem" }}>
          Don’t have an account?{' '}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
