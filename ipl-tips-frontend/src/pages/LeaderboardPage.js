import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../components/Logo";

axios.defaults.withCredentials = true;

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/leaderboard`)
      .then(res => setLeaderboard(res.data))
      .catch(err => console.error("Failed to load leaderboard", err));
  }, []);

  const page = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "1rem",
    background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    fontFamily: "Arial, sans-serif",
  };

  const card = {
    width: "100%",
    maxWidth: "600px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    padding: "2rem",
    textAlign: "center",
  };

  return (
    <div style={page}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo size={60} />
          <button onClick={logout} style={{ padding: "0.4rem 0.8rem", border: "none", borderRadius: "8px", color: "#fff", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", cursor: "pointer", fontWeight: "bold" }}>Logout</button>
        </div>
        <h2 style={{
            marginBottom: "1.5rem",
            fontSize: "2rem",
            color: "#333"
          }}>🏆 Illawarra Tips Leaderboard</h2>
      <ol style={{
        listStyle: "none",
        padding: 0,
        margin: 0
      }}>
        {leaderboard.map((user, idx) => (
          <li key={idx} style={{
            backgroundColor: idx === 0 ? "#ffd700" : idx === 1 ? "#c0c0c0" : idx === 2 ? "#cd7f32" : "#fff",
            color: idx <= 2 ? "#000" : "#333",
            marginBottom: "0.75rem",
            borderRadius: "8px",
            padding: "0.75rem",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: idx <= 2 ? "bold" : "normal",
            fontSize: idx === 0 ? "1.25rem" : "1rem"
          }}>
            <span>
              {idx <= 2 ? (idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉") : `#${idx + 1}`} {user.username}
            </span>
            <span>{user.score} pts</span>
          </li>
        ))}
      </ol>
        </div>
      </div>
  );
}
