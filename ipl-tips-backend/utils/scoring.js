const User = require("../schemas/User");
const axios = require("axios");

const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/117.0.0.0 Safari/537.36",
};

async function calculateScores(roundNumber) {
  const url = `https://mc-api.dribl.com/api/results?league=gld4J2geNW&type_round=roundrobin_${roundNumber}`;

  let parsed;
  try {
    const { data } = await axios.get(url, { headers: REQUEST_HEADERS });
    parsed = data;
  } catch (err) {
    throw new Error(`Failed to fetch results: ${err.message}`);
  }

  const matches = parsed.data; // your JSON has results under data

  const users = await User.find();

  for (const user of users) {
    let roundScore = 0;
    const userTips = user.tips?.[`round${roundNumber}`];
    if (!userTips) continue; // user didn't tip this round

    for (const match of matches) {
      const matchId = match.hash_id;  // your matches use hash_id
      const attr = match.attributes;
      const result = getMatchResult(attr);

      if (userTips[matchId] === result) {
        roundScore += 1;
      }
    }

    // 🛡 Prevent double-counting
    const prevRoundScore = user.roundScores?.get(`round${roundNumber}`) || 0;
    const scoreAdjustment = roundScore - prevRoundScore;

    user.score += scoreAdjustment; // Adjust total score
    user.roundScores.set(`round${roundNumber}`, roundScore); // Save round score
    await user.save();

    console.log(`✅ Updated ${user.username}: Round ${roundNumber} = ${roundScore} pts (Δ${scoreAdjustment})`);
  }

  console.log("🏆 Leaderboard updated!");
}

function getMatchResult(match) {
  if (match.home_score > match.away_score) return "home";
  if (match.home_score < match.away_score) return "away";
  return "draw";
}

module.exports = calculateScores;
