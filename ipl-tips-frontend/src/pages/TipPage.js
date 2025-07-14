import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../components/Logo";

axios.defaults.withCredentials = true;

function TipPage() {
  const [matches, setMatches] = useState([]);
  const [tips, setTips] = useState({});
  const [lockedMatches, setLockedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  const username = localStorage.getItem("username");

  const cleanTeamName = (name) => name.replace("First Grade Male", "").trim();

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/matches/rounds`);
        const sortedRounds = res.data
          .filter((val, idx, arr) => arr.indexOf(val) === idx)
          .sort((a, b) => {
            const parse = (r) => r.replace("R", "").split(".").map(Number);
            const [aMain, aSub = 0] = parse(a);
            const [bMain, bSub = 0] = parse(b);
            return aMain === bMain ? aSub - bSub : aMain - bMain;
          });
        setRounds(sortedRounds);

        for (const roundStr of sortedRounds) {
          const matchRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/matches?round=${roundStr}`);
          const matches = matchRes.data;
          const now = new Date();
          const hasFutureMatch = matches.some((match) => new Date(match.date) > now);
          if (hasFutureMatch) {
            setRound(roundStr);
            return;
          }
        }

        setRound(sortedRounds[sortedRounds.length - 1]);
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
          `${process.env.REACT_APP_API_BASE_URL}/matches?round=${round}`
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
        setSubmitted(Object.keys(userTips).length > 0); // ✅ if tips exist, mark as submitted
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
        setSubmitted(true); // ✅ flag as submitted
      })
      .catch((err) => {
        console.error("Submit tips error:", err);
        alert(err.response?.data?.message || "❌ Failed to save tips");
      });
  };

  if (loading) return <p>⏳ Loading matches...</p>;
  if (!round) return <p>⚠️ No rounds available</p>;

  const currentIndex = rounds.indexOf(round);
  const isFirstRound = currentIndex <= 0;
  const isLastRound = currentIndex >= rounds.length - 1;

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

  return (
    <div style={page}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo size={100} />
          <button
            onClick={logout}
            style={{
              padding: "0.4rem 0.8rem",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Logout
          </button>
        </div>
        <h2 style={header}>📜 Submit Your Tips — Round {round}</h2>

        <div style={navBar}>
          <button
            style={isFirstRound ? buttonDisabled : button}
            onClick={() => {
              if (currentIndex > 0) setRound(rounds[currentIndex - 1]);
            }}
            disabled={isFirstRound}
          >
            ⬅️ Previous Round
          </button>

          <select
            value={round}
            onChange={(e) => setRound(e.target.value)}
            style={selectStyle}
          >
            {rounds.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <button
            style={isLastRound ? buttonDisabled : button}
            onClick={() => {
              if (currentIndex < rounds.length - 1) setRound(rounds[currentIndex + 1]);
            }}
            disabled={isLastRound}
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
            const isLocked = lockedMatches.includes(match.match_id);
            const userTip = tips[match.match_id];
            const hasScore =
              match.home_score !== null &&
              match.away_score !== null;

            let actualResult = null;
            if (hasScore) {
              if (match.home_score > match.away_score) actualResult = "home";
              else if (match.home_score < match.away_score) actualResult = "away";
              else actualResult = "draw";
            }

            const getBoxStyle = (type) => {
              const isCorrect = hasScore && actualResult === type;
              const isUser = userTip === type;
              return {
                flex: 1,
                padding: "0.9rem",
                textAlign: "center",
                borderRadius: "8px",
                border: isCorrect ? "2px solid #28a745" : isUser ? "2px solid #0e52e6" : "1px solid #ccc",
                backgroundColor: isCorrect
                  ? "#eafbea"
                  : isUser
                  ? "#eef3fe"
                  : "#fff",
                color: isCorrect ? "#2e7d32" : isUser ? "#0e52e6" : "#333",
                fontWeight: "600",
                cursor: isLocked ? "not-allowed" : "pointer",
                opacity: isLocked ? 0.6 : 1,
                boxShadow: isCorrect
                  ? "0 0 10px rgba(40, 167, 69, 0.2)"
                  : isUser
                  ? "0 0 6px rgba(14, 82, 230, 0.2)"
                  : "none",
                transition: "all 0.2s ease-in-out",
                pointerEvents: isLocked ? "none" : "auto",
              };
            };

            const kickoffTime = new Date(match.date).toLocaleString("en-AU", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={match.match_id} style={{
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "12px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                backgroundColor: "#f9f9f9"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem"
                }}>
                  <div style={{ fontWeight: "700", fontSize: "1rem", color: "#0e52e6" }}>
                    {cleanTeamName(match.home_team_name)} vs {cleanTeamName(match.away_team_name)}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#666" }}>
                    🕒 {kickoffTime}
                  </div>
                </div>

                {hasScore && (
                  <div style={{ marginBottom: "0.7rem", fontWeight: "600", color: "#28a745" }}>
                    Final Score: {match.home_score} - {match.away_score}
                  </div>
                )}

                <div style={{ display: "flex", gap: "1rem" }}>
                  <div
                    style={getBoxStyle("home")}
                    onClick={() => handleTip(match.match_id, "home")}
                  >
                    🏠 Home<br />{cleanTeamName(match.home_team_name)}
                  </div>
                  <div
                    style={getBoxStyle("draw")}
                    onClick={() => handleTip(match.match_id, "draw")}
                  >
                    ⚖️ Draw
                  </div>
                  <div
                    style={getBoxStyle("away")}
                    onClick={() => handleTip(match.match_id, "away")}
                  >
                    🚌 Away<br />{cleanTeamName(match.away_team_name)}
                  </div>
                </div>

                <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#555" }}>
                  ✅ Your Tip: <strong>{userTip || "None"}</strong>
                  {hasScore && userTip === actualResult && (
                    <span style={{ color: "#28a745", marginLeft: "0.5rem" }}>✔️ Correct</span>
                  )}
                  {hasScore && userTip && userTip !== actualResult && (
                    <span style={{ color: "#dc3545", marginLeft: "0.5rem" }}>❌ Wrong</span>
                  )}
                </div>
              </div>
            );
          })
        )}

        <button
          onClick={submitTips}
          disabled={Object.keys(tips).length < matches.length}
          style={{
            display: "block",
            width: "100%",
            padding: "0.9rem",
            backgroundColor: Object.keys(tips).length < matches.length ? "#ccc" : "#28a745",
            color: "#fff",
            fontSize: "1.25rem",
            fontWeight: "700",
            border: "none",
            borderRadius: "10px",
            marginTop: "1.8rem",
            boxShadow: Object.keys(tips).length < matches.length
              ? "none"
              : "0 6px 16px rgba(40, 167, 69, 0.6)",
            cursor: Object.keys(tips).length < matches.length ? "not-allowed" : "pointer",
            transition: "background-color 0.3s ease, transform 0.15s ease",
          }}
          onMouseDown={(e) => {
            if (Object.keys(tips).length === matches.length) {
              e.currentTarget.style.transform = "scale(0.95)";
            }
          }}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {submitted ? "🔄 Change Tips" : "💾 Save All Tips"}
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
