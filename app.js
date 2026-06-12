const state = {
  sweep: [],
  odds: new Map(),
  sort: "odds",
  search: ""
};

const defaultSweep = [
  { id: "argentina", country: "Argentina", owner: "Alex" },
  { id: "brazil", country: "Brazil", owner: "Beth" },
  { id: "england", country: "England", owner: "Chris" },
  { id: "france", country: "France", owner: "Dana" },
  { id: "germany", country: "Germany", owner: "Elliot" },
  { id: "portugal", country: "Portugal", owner: "Fran" },
  { id: "spain", country: "Spain", owner: "Grace" },
  { id: "usa", country: "United States", owner: "Harper" },
  { id: "canada", country: "Canada", owner: "Ishaan" },
  { id: "mexico", country: "Mexico", owner: "Jo" }
];

const els = {
  rows: document.querySelector("#teamRows"),
  search: document.querySelector("#searchInput"),
  sortButtons: document.querySelectorAll(".sort-button"),
  lastUpdated: document.querySelector("#lastUpdated"),
  teamCount: document.querySelector("#teamCount"),
  pricedCount: document.querySelector("#pricedCount"),
  favouriteName: document.querySelector("#favouriteName")
};

async function loadJson(path, fallback) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path} returned ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(error);
    return fallback;
  }
}

function decimalToFraction(decimal) {
  if (!decimal || Number.isNaN(decimal)) return "TBC";
  const value = decimal - 1;
  const denominator = 10;
  const numerator = Math.round(value * denominator);
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
}

function gcd(a, b) {
  return b ? gcd(b, a % b) : Math.abs(a);
}

function impliedChance(decimal) {
  if (!decimal || Number.isNaN(decimal)) return "TBC";
  return `${((1 / decimal) * 100).toFixed(1)}%`;
}

function getTeamOdds(team) {
  return state.odds.get(team.id) || null;
}

function render() {
  const search = state.search.trim().toLowerCase();
  const rows = state.sweep
    .filter((team) => {
      return !search ||
        team.country.toLowerCase().includes(search) ||
        team.owner.toLowerCase().includes(search);
    })
    .sort((a, b) => {
      if (state.sort === "odds") {
        const aOdds = getTeamOdds(a)?.decimalOdds ?? Number.POSITIVE_INFINITY;
        const bOdds = getTeamOdds(b)?.decimalOdds ?? Number.POSITIVE_INFINITY;
        return aOdds - bOdds || a.country.localeCompare(b.country);
      }
      return a.country.localeCompare(b.country);
    });

  els.rows.innerHTML = rows.map((team) => {
    const odds = getTeamOdds(team);
    const decimal = odds?.decimalOdds;
    const oddsLabel = odds?.fractionalOdds || decimalToFraction(decimal);
    return `
      <tr>
        <td class="country">${team.country}</td>
        <td class="owner">${team.owner || "Unassigned"}</td>
        <td><span class="odds ${decimal ? "" : "missing"}">${oddsLabel}</span></td>
        <td>${impliedChance(decimal)}</td>
      </tr>
    `;
  }).join("");

  const priced = state.sweep
    .map((team) => ({ team, odds: getTeamOdds(team) }))
    .filter((entry) => entry.odds?.decimalOdds)
    .sort((a, b) => a.odds.decimalOdds - b.odds.decimalOdds);

  els.teamCount.textContent = state.sweep.length;
  els.pricedCount.textContent = priced.length;
  els.favouriteName.textContent = priced[0]?.team.country || "-";
}

function bindEvents() {
  els.search.addEventListener("input", (event) => {
    state.search = event.target.value;
    render();
  });

  els.sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.sort = button.dataset.sort;
      els.sortButtons.forEach((item) => item.classList.toggle("active", item === button));
      render();
    });
  });
}

async function init() {
  const [sweep, oddsPayload] = await Promise.all([
    loadJson("data/sweep.json", defaultSweep),
    loadJson("data/odds.json", { updatedAt: null, source: "manual", teams: [] })
  ]);

  state.sweep = sweep;
  state.odds = new Map((oddsPayload.teams || []).map((team) => [team.id, team]));

els.lastUpdated.textContent = oddsPayload.updatedAt
  ? `Odds updated ${new Date(oddsPayload.updatedAt).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })}`
  : "Odds awaiting live feed";

  bindEvents();
  render();
}

init();
