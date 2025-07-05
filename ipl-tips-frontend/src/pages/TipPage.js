import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
axios.defaults.withCredentials = true;

function TipPage() {
  const [matches, setMatches] = useState([]);
  const [tips, setTips] = useState({});
  const [lockedMatches, setLockedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(null);
  const [rounds, setRounds] = useState([]);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/matches/rounds`);
        const fetchedRounds = res.data.sort(
          (a, b) => Number(a.replace("R", "")) - Number(b.replace("R", ""))
        );
        setRounds(fetchedRounds);
        if (fetchedRounds.length > 0) {
          setRound(Number(fetchedRounds[0].replace("R", "")));
        }
      } catch (err) {
        console.error("Failed to load rounds:", err);
      }
    };
    fetchRounds();
  }, []);

  useEffect(() => {
    if (!round || !username) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const matchesRes = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/matches?round=R${round}`
        );
        const matchData = matchesRes.data;

        const now = new Date();
        const locked = matchData
          .filter((match) => new Date(match.date) <= now)
          .map((match) => match.match_id);

        setMatches(matchData);
        setLockedMatches(locked);

        const userRes = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/users/${username}`
        );
        const roundKey = `round${round}`;
        const userTips = userRes.data.tips?.[roundKey] || {};
        setTips(userTips);
      } catch (err) {
        console.error("Error loading data:", err);
        alert("⚠️ Failed to load matches or user data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [round, username]);

  const handleTip = (matchId, choice) => {
    if (lockedMatches.includes(matchId)) {
      alert("⛔ This match has started. You can't change your tip.");
      return;
    }
    setTips((prev) => ({ ...prev, [matchId]: choice }));
  };

  const submitTips = () => {
    const roundKey = `round${round}`;
    axios
      .post(`${process.env.REACT_APP_API_BASE_URL}/users/tip`, {
        username,
        round: roundKey,
        tips,
      })
      .then((res) => {
        alert(res.data.message || "✅ Tips saved!");
      })
      .catch((err) => {
        console.error("Submit tips error:", err);
        alert(err.response?.data?.message || "❌ Failed to save tips");
      });
  };

  if (loading) return <p>⏳ Loading matches...</p>;
  if (!round) return <p>⚠️ No rounds available</p>;

  const roundNumbers = rounds.map((r) => Number(r.replace("R", "")));
  const minRound = Math.min(...roundNumbers);
  const maxRound = Math.max(...roundNumbers);

  // --- STYLES ---
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
    maxWidth: "700px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    padding: "2rem",
  };

  const header = {
    textAlign: "center",
    marginBottom: "1.5rem",
    color: "#0e52e6",
    fontWeight: "700",
    fontSize: "1.8rem",
    letterSpacing: "1px",
    textShadow: "0 1px 3px rgba(14, 82, 230, 0.5)",
  };

  const navBar = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.8rem",
  };

  const selectStyle = {
    fontSize: "1.1rem",
    padding: "0.3rem 0.8rem",
    borderRadius: "8px",
    border: "1.5px solid #0e52e6",
    cursor: "pointer",
    fontWeight: "600",
    color: "#0e52e6",
    background: "white",
    boxShadow: "0 2px 6px rgba(14, 82, 230, 0.2)",
    transition: "all 0.25s ease",
  };

  const button = {
    padding: "0.5rem 1.2rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "1.05rem",
    color: "white",
    backgroundColor: "#0e52e6",
    boxShadow: "0 5px 15px rgba(14, 82, 230, 0.4)",
    transition: "background-color 0.3s ease, transform 0.2s ease",
  };

  const buttonDisabled = {
    ...button,
    backgroundColor: "#a0b6ff",
    cursor: "not-allowed",
    boxShadow: "none",
  };

  const matchCard = (locked) => ({
    borderRadius: "12px",
    padding: "1rem",
    marginBottom: "1rem",
    boxShadow: locked
      ? "inset 0 0 10px #e26a6a"
      : "0 4px 12px rgba(14, 82, 230, 0.15)",
    backgroundColor: locked ? "#fee6e6" : "#f0f7ff",
    transition: "background-color 0.3s ease",
  });

  const tipButton = (active) => ({
    backgroundColor: active ? "#0e52e6" : "#d6e0ff",
    color: active ? "white" : "#0e52e6",
    border: "none",
    padding: "0.5rem 0.9rem",
    borderRadius: "6px",
    marginRight: "0.6rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: active
      ? "0 3px 8px rgba(14, 82, 230, 0.7)"
      : "0 2px 5px rgba(14, 82, 230, 0.35)",
    transition: "all 0.3s ease",
  });

  const lockedLabel = {
    marginTop: "0.5rem",
    color: "#c93e3e",
    fontWeight: "700",
    fontSize: "0.9rem",
    backgroundColor: "#fddede",
    padding: "0.25rem 0.6rem",
    borderRadius: "6px",
    display: "inline-block",
    boxShadow: "0 0 6px #d24949",
  };

  return (
    <div style={page}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={header}>📜 Submit Your Tips — Round {round}</h2>
          <button onClick={logout} style={{ padding: "0.4rem 0.8rem", border: "none", borderRadius: "8px", color: "#fff", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", cursor: "pointer", fontWeight: "bold" }}>Logout</button>
        </div>

      {/* Round selection + navigation */}
      <div style={navBar}>
        <button
          style={round <= minRound ? buttonDisabled : button}
          onClick={() => setRound((prev) => Math.max(minRound, prev - 1))}
          disabled={round <= minRound}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          ⬅️ Previous Round
        </button>

        <select
          value={round}
          onChange={(e) => setRound(Number(e.target.value))}
          style={selectStyle}
        >
          {rounds.map((r) => {
            const roundNum = Number(r.replace("R", ""));
            return (
              <option key={r} value={roundNum}>
                {r}
              </option>
            );
          })}
        </select>

        <button
          style={round >= maxRound ? buttonDisabled : button}
          onClick={() => setRound((prev) => Math.min(maxRound, prev + 1))}
          disabled={round >= maxRound}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          Next Round ➡️
        </button>
      </div>

      {matches.length === 0 ? (
        <p style={{ textAlign: "center", color: "#555", fontWeight: "600" }}>
          No matches found for Round {round}.
        </p>
      ) : (
        matches.map((match) => {
          const kickoffTime = new Date(match.date).toLocaleString("en-AU", {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          const isLocked = lockedMatches.includes(match.match_id);
          const userTip = tips[match.match_id];

          return (
            <div key={match.match_id} style={matchCard(isLocked)}>
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "1.1rem",
                  marginBottom: "0.3rem",
                  color: "#0e52e6",
                  textShadow: "0 1px 2px rgba(14,82,230,0.4)",
                }}
              >
                {match.home_team} 🆚 {match.away_team}
              </div>
              <div
                style={{
                  color: "#333",
                  fontWeight: "600",
                  marginBottom: "0.6rem",
                  fontSize: "0.85rem",
                }}
              >
                🕒 Kickoff: {kickoffTime}
              </div>

              {isLocked ? (
                <div style={lockedLabel}>⛔ Tipping Closed</div>
              ) : (
                <div style={{ marginBottom: "0.7rem" }}>
                  <button
                    onClick={() => handleTip(match.match_id, "home")}
                    style={tipButton(userTip === "home")}
                  >
                    🏠 Home
                  </button>
                  <button
                    onClick={() => handleTip(match.match_id, "draw")}
                    style={tipButton(userTip === "draw")}
                  >
                    ⚖️ Draw
                  </button>
                  <button
                    onClick={() => handleTip(match.match_id, "away")}
                    style={tipButton(userTip === "away")}
                  >
                    🚌 Away
                  </button>
                </div>
              )}

              <div
                style={{
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  color: "#444",
                }}
              >
                ✅ Your Tip: <strong>{userTip || "None"}</strong>
              </div>
            </div>
          );
        })
      )}

      <button
        onClick={submitTips}
        style={{
          display: "block",
          width: "100%",
          padding: "0.9rem",
          backgroundColor: "#28a745",
          color: "#fff",
          fontSize: "1.25rem",
          fontWeight: "700",
          border: "none",
          borderRadius: "10px",
          marginTop: "1.8rem",
          boxShadow: "0 6px 16px rgba(40, 167, 69, 0.6)",
          cursor: "pointer",
          transition: "background-color 0.3s ease, transform 0.15s ease",
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        💾 Save All Tips
      </button>

      <p
        style={{
          textAlign: "center",
          marginTop: "2rem",
          fontWeight: "600",
          fontSize: "1.1rem",
        }}
      >
        <a
          href="/leaderboard"
          style={{
            textDecoration: "none",
            color: "#0e52e6",
            fontWeight: "700",
            transition: "color 0.25s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#0744b8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#0e52e6")}
        >
          🏆 View Leaderboard
        </a>
      </p>
        </div>
      </div>
  );
}

export default TipPage;
