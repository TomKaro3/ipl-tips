import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
axios.defaults.withCredentials = true;

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = () => {
    if (!username || !password) return alert("Enter both username and password");
    axios.post(`${process.env.REACT_APP_API_BASE_URL}/users/signup`, { username, password })
      .then(() => {
        localStorage.setItem("username", username);
        navigate("/tips");
      })
      .catch(() => {
        alert("Signup failed. Try a different username.");
      });
  };

  return (
    <div style={{ maxWidth: 400, margin: "3rem auto", padding: "1rem", textAlign: "center", border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Create your account</h2>
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
      <button onClick={handleSignup} style={{ width: "100%", padding: "0.75rem", marginBottom: "1rem" }}>Sign Up</button>
      <p>Already have an account? <Link to="/">Log in here</Link></p>
    </div>
  );
}
