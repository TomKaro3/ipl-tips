const User = require("../schemas/User");
const puppeteer = require("puppeteer");

async function launchBrowser() {
  return await puppeteer.launch({
    headless: "new",
    executablePath: puppeteer.executablePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

async function calculateScores(roundNumber) {
  const url = `https://mc-api.dribl.com/api/results?league=gld4J2geNW&type_round=roundrobin_${roundNumber}`;

  // Launch Puppeteer and fetch results JSON text
  const browser = await launchBrowser();
  const page = await browser.newPage();

  // Set user agent to look like a normal browser
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/117.0.0.0 Safari/537.36'
  );

  const response = await page.goto(url, { waitUntil: 'networkidle2' });

  if (!response || response.status() !== 200) {
    await browser.close();
    throw new Error(`Failed to load results page, status: ${response ? response.status() : 'no response'}`);
  }

  // Get the page text content (the JSON response)
  const bodyText = await page.evaluate(() => document.body.innerText);
  await browser.close();

  let parsed;
  try {
    parsed = JSON.parse(bodyText);
  } catch (err) {
    throw new Error(`Failed to parse results JSON: ${err.message}`);
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