import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username || !password) return alert("Enter both username and password");
    axios.post("http://localhost:3000/api/users/login", { username, password })
      .then(() => {
        localStorage.setItem("username", username);
        navigate("/tips");
      })
      .catch(() => {
        alert("Login failed. Check username and password.");
      });
  };

  return (
    <div style={{ maxWidth: 400, margin: "3rem auto", padding: "1rem", textAlign: "center", border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Login to Illawarra Tips</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />
      <button onClick={handleLogin} style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem" }}>Login</button>
      <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
    </div>
  );
}
