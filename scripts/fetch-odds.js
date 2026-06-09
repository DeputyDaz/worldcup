const fs = require("node:fs/promises");

const apiUrl = process.env.ODDS_API_URL;
const apiKey = process.env.ODDS_API_KEY;

if (!apiUrl || !apiKey) {
  throw new Error("Set ODDS_API_URL and ODDS_API_KEY in GitHub Actions secrets.");
}

const response = await fetch(apiUrl, {
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "x-api-key": apiKey
  }
});

if (!response.ok) {
  throw new Error(`Odds API returned ${response.status}: ${await response.text()}`);
}

const raw = await response.json();

// Expected normalized shape:
// [
//   { "id": "england", "decimalOdds": 7.5, "fractionalOdds": "13/2" }
// ]
// Adjust this mapper to match your chosen odds provider.
const teams = Array.isArray(raw.teams) ? raw.teams : raw;

await fs.writeFile(
  "data/odds.json",
  JSON.stringify({
    updatedAt: new Date().toISOString(),
    source: apiUrl,
    teams
  }, null, 2) + "\n"
);
