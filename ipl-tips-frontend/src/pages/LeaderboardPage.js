import { useEffect, useState } from "react";
import axios from "axios";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/api/users/leaderboard")
      .then(res => setLeaderboard(res.data))
      .catch(err => console.error("Failed to load leaderboard", err));
  }, []);

  return (
    <div style={{
      maxWidth: "600px",
      margin: "2rem auto",
      backgroundColor: "#f5f5f5",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
      padding: "2rem",
      fontFamily: "Arial, sans-serif",
      textAlign: "center"
    }}>
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
  );
}
