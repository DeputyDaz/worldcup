# 2026 World Cup Sweep

A static GitHub Pages site for a World Cup sweepstake: country, sweep owner, and outright winner odds.

## How it works

- `data/sweep.json` is the editable list of teams and sweep owners.
- `data/odds.json` is the public odds file used by the site.
- `scripts/fetch-odds.js` is designed to run in GitHub Actions and refresh `data/odds.json`.
- `.github/workflows/update-odds.yml` runs that updater every 6 hours.

## GitHub setup

1. Create a new GitHub repository.
2. Upload these files to it.
3. In the repo, open **Settings > Pages**.
4. Set the source to your main branch and root folder.
5. Add repository secrets:
   - `ODDS_API_URL`
   - `ODDS_API_KEY`
6. Edit `scripts/fetch-odds.js` so the mapper matches your odds provider's response.

GitHub Pages is static, so the API key must stay in GitHub Actions secrets. Do not put an odds API key in `app.js`.
