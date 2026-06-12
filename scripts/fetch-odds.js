
  /*

const fs = require("node:fs/promises");

const apiKey = process.env.ODDS_API_KEY;
const sport = process.env.ODDS_API_SPORT || "soccer_fifa_world_cup";
const regions = process.env.ODDS_API_REGIONS || "uk";
const market = process.env.ODDS_API_MARKET || "outrights";
const preferredBookmaker = (process.env.ODDS_BOOKMAKER || "betfair").toLowerCase();

if (!apiKey) {
  throw new Error("Set ODDS_API_KEY in GitHub Actions secrets.");
}

const url = new URL(`https://api.the-odds-api.com/v4/sports/${sport}/odds/`);
url.searchParams.set("apiKey", apiKey);
url.searchParams.set("regions", regions);
url.searchParams.set("markets", market);
url.searchParams.set("oddsFormat", "decimal");

const response = await fetch(url);

if (!response.ok) {
  throw new Error(`The Odds API returned ${response.status}: ${await response.text()}`);
}

const payload = await response.json();
const bookmaker = findBookmaker(payload);
const outcomes = findOutcomes(bookmaker);

if (!outcomes.length) {
  throw new Error(`No ${market} outcomes found in The Odds API response.`);
}

const teams = outcomes
  .filter((outcome) => outcome.name && Number.isFinite(Number(outcome.price)))
  .map((outcome) => {
    const decimalOdds = Number(outcome.price);

    return {
      id: toId(outcome.name),
      decimalOdds,
      fractionalOdds: decimalToFractional(decimalOdds)
    };
  })
  .sort((a, b) => a.decimalOdds - b.decimalOdds || a.id.localeCompare(b.id));

await fs.writeFile(
  "data/odds.json",
  JSON.stringify({
    updatedAt: new Date().toISOString(),
    source: "The Odds API",
    bookmaker: bookmaker?.title || bookmaker?.key || "unknown",
    teams
  }, null, 2) + "\n"
);

function findBookmaker(events) {
  const bookmakers = events.flatMap((event) => event.bookmakers || []);

  return bookmakers.find((book) => {
    const key = String(book.key || "").toLowerCase();
    const title = String(book.title || "").toLowerCase();
    return key.includes(preferredBookmaker) || title.includes(preferredBookmaker);
  }) || bookmakers[0];
}

function findOutcomes(bookmaker) {
  return (bookmaker?.markets || [])
    .filter((item) => item.key === market)
    .flatMap((item) => item.outcomes || []);
}

function toId(name) {
  const aliases = {
    "bosnia and herzegovina": "bosnia_and_herzegovina",
    "cote d ivoire": "ivory_coast",
    "cote d'ivoire": "ivory_coast",
    "curacao": "curacao",
    "dr congo": "dr_congo",
    "korea republic": "south_korea",
    "south korea": "south_korea",
    "turkey": "turkiye",
    "turkiye": "turkiye",
    "united states": "usa",
    "usa": "usa"
  };

  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  return aliases[normalized] || normalized.replace(/\s+/g, "_");
}

function decimalToFractional(decimalOdds) {
  const value = decimalOdds - 1;
  const denominator = 100;
  const numerator = Math.round(value * denominator);
  const divisor = gcd(numerator, denominator);

  return `${numerator / divisor}/${denominator / divisor}`;
}

function gcd(a, b) {
  return b ? gcd(b, a % b) : Math.abs(a);
}

