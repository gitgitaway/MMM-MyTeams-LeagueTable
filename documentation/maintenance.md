# Module Maintenance Guide

Maintaining the **MMM-MyTeams-LeagueTable** module ensures data accuracy and stability throughout the football season. This guide covers essential housekeeping tasks and the critical seasonal updates required before each new season.

---

## 1. Seasonal URL Updates (Critical)

Maintenance timing depends on the league type:
- **August–May Leagues (e.g., EPL, SPFL, La Liga):** Update between **July and August**.
- **Spring–Autumn Leagues (e.g., Norway, Sweden):** Update in **January/February** before their March/April start.

Some providers use season-specific URLs that will break or show old data if not updated.

> **Automated tool available:** Run [`tools/update_season_urls.py`](../tools/update_season_urls.py) from the module root to apply all Wikipedia, Google, and Soccerway year updates in a single step:
> ```
> python tools/update_season_urls.py
> ```
> Then follow the manual steps below for Soccerway `r#####` IDs, which cannot be computed automatically.

All URL maps are centralised in **[`src/league-configs.js`](../src/league-configs.js)**.

---

### A. Wikipedia URLs

Wikipedia articles are titled by the season (e.g., `2026–27 Premier League`).

- **Format (Aug–May leagues):** Uses an en-dash encoded as `%E2%80%93` (e.g., `2026%E2%80%9327`).
- **Calendar-year leagues** (Estonia, Finland, Iceland, Republic of Ireland, Japan, Kazakhstan, Latvia, Lithuania, Moldova, South Korea, Brazil, MLS/Canada/USA, China): use a single year (e.g., `2026`).
- **Spring–Autumn calendar-year leagues** (Norway Eliteserien, Sweden Allsvenskan): These leagues typically run from **March/April to November**. While most European leagues transition in July, these are in mid-season. Ensure their URLs use the current calendar year (e.g., `2026`).

**Action:** Update the `WIKIPEDIA_URL_MAP` in [`src/league-configs.js`](../src/league-configs.js). Verify the en-dash encoding is correct for August-May leagues to avoid 404 errors.

**Cross-reference:** The human-readable list of all Wikipedia URLs is in [`documentation/wikipediaLeaguesPages.md`](wikipediaLeaguesPages.md).

---

### B. Soccerway URLs

Soccerway uses a unique season ID for each league and year (`r#####`). These IDs **cannot** be derived algorithmically.

- **Action:**
  1. Visit [int.soccerway.com](https://int.soccerway.com) for each league listed in `SOCCERWAY_URL_MAP`.
  2. Navigate to the **current season's Table** page.
  3. Copy the full URL — it contains a path like `/20262027/regular-season/r#####/`.
  4. Update `SOCCERWAY_URL_MAP` in [`src/league-configs.js`](../src/league-configs.js) with the new `r#####` ID.

> **Note:** `update_season_urls.py` sets the `r#####` field to `r00000` as a placeholder when it increments the year segment. You will see HTTP errors in the log until the correct IDs are filled in.

**Cross-reference:** The human-readable list of all Soccerway URLs is in [`documentation/soccerwayLeaguesPages.md`](soccerwayLeaguesPages.md).

---

### C. Google URLs

Google search query strings contain season year tokens for relevance (e.g., `2026-27`).

- **Action:** The `update_season_urls.py` script handles these automatically. No manual step is needed unless a league changes its name or competition format.

**Cross-reference:** Reference list in [`documentation/googleLeaguePages.md`](googleLeaguePages.md).

---

### D. ESPN & BBC Sport

- **ESPN:** Path-based URLs (e.g., `/soccer/standings/_/league/eng.1`). These **do not change between seasons** — no action required.
- **BBC Sport:** Path-based (e.g., `/sport/football/premier-league/table`). These also rarely change. However, during pre-season transitions, the BBC may show "transitional stubs" (concatenated empty tables). The module is designed to handle this, but if data looks wrong, clearing the cache is the first step.

**Cross-reference:** Reference list in [`documentation/bbcLeaguesPages.md`](bbcLeaguesPages.md).

---

## 2. League Split Verification

Leagues with mid-season splits (Romania, Scotland, Belgium, Greece, Cyprus, Israel, Austria, Denmark, Switzerland, Serbia) may change their format or keyword naming on Wikipedia each season.

- **Check `LEAGUE_SPLITS`** in [`src/league-configs.js`](../src/league-configs.js).
- **Verify keywords:** Ensure the `keywords` arrays in each group definition (and `championshipKeywords` / `relegationKeywords`) match the actual `<h2>`–`<h4>` headings used in the new season's Wikipedia article (e.g., "Championship round" vs. "Play-off Round").
- **Verify group sizes:** Confirm the number of teams in each group has not changed (e.g., Belgium occasionally alters group sizes).
- **Verify `regularSeasonGames`:** Confirm the count is correct for the new season's format — this value controls when the module switches from single-table to multi-group rendering.
- **Logo/name sync:** Some leagues rename themselves between seasons. Ensure `LEAGUE_SPLITS` keys remain synchronised with `WIKIPEDIA_URL_MAP` keys.

**Reference guide:** [`documentation/leagueSplits_Guide.md`](leagueSplits_Guide.md)

**Automation tool:** [`tools/fix_splits.py`](../tools/fix_splits.py) — adds new split-league configurations and registers them across all URL maps.

---

## 3. Regular Housekeeping

### A. Cache Management

The module auto-cleans expired cache files, but manual maintenance is sometimes needed:

- **Clear All Cache:** Use the "Clear All Cache" button in the module footer, or manually delete files inside `.cache/`.
- **Disk Usage:** Periodically check `.cache/` to confirm auto-cleanup is working.

### B. Logo Mapping

New teams are promoted to top-tier leagues every season.

- **Identify missing logos:** Watch terminal logs for `[LogoResolver] NO LOGO FOUND` warnings.
- **Update mappings:** Add new team name → image path entries in [`team-logo-mappings.js`](../team-logo-mappings.js).
- **Add images:** Place the corresponding `.png` crest in the appropriate `images/crests/<Country>/` subfolder.

**Reference guide:** [`documentation/BASH-GUIDE -TeamLogoMappings.md`](../tools/BASH-GUIDE%20-TeamLogoMappings.md) (PowerShell/Bash helper scripts for bulk logo mapping are in [`tools/`](../tools/)).

---

## 4. Automated Maintenance Tools

All scripts live in the [`tools/`](../tools/) directory and resolve paths relative to their own location — they work on Windows, Raspberry Pi, and Mac without modification.

| Script | Purpose | Usage |
|--------|---------|-------|
| [`tools/update_season_urls.py`](../tools/update_season_urls.py) | Updates Wikipedia, Google, and Soccerway year tokens in `src/league-configs.js` and fixes `fix_splits.py` anchors | `python tools/update_season_urls.py` |
| [`tools/fix_splits.py`](../tools/fix_splits.py) | Adds new split-league entries to `LEAGUE_SPLITS` and registers them in the URL maps | `python tools/fix_splits.py` |
| [`tools/fix_docs.py`](../tools/fix_docs.py) | Updates `leagueSplits_Guide.md` after adding new split leagues | `python tools/fix_docs.py` |
| [`tools/Check-UEFA-Images.ps1`](../tools/Check-UEFA-Images.ps1) | Checks for missing UEFA team crest images and copies available ones | `.\tools\Check-UEFA-Images.ps1` |

---

## 5. Security & Performance Review

- **Linting:** Run `npm run lint` regularly to ensure code quality.
- **Dependencies:** Run `npm audit` to check for security vulnerabilities in `node-fetch` and other packages.
- **Logs:** Monitor `~/.pm2/logs/` or terminal output for `[SharedRequestManager]` errors, which indicate provider rate-limiting.

---

## 6. Pre-Season Maintenance Checklist

Complete this checklist for **August–May leagues** each July/August before the new season begins:

1. [ ] Run **`python tools/update_season_urls.py`** to advance all Wikipedia and Google year tokens and reset Soccerway year segments.
2. [ ] Update all **Soccerway `r#####` IDs** in [`src/league-configs.js`](../src/league-configs.js) by visiting each league page on [int.soccerway.com](https://int.soccerway.com).
3. [ ] Verify **`LEAGUE_SPLITS` keywords** in [`src/league-configs.js`](../src/league-configs.js) against the current season's Wikipedia headings for each split league.
4. [ ] Identify promoted teams and add their **logos** to [`images/crests/`](../images/crests/) and [`team-logo-mappings.js`](../team-logo-mappings.js).
5. [ ] Clear the **`.cache/`** directory to prevent stale previous-season data from being served.
6. [ ] Run **`npm run lint`** and **`npm test`** to verify stability.
7. [ ] Update the season year in **[`documentation/wikipediaLeaguesPages.md`](wikipediaLeaguesPages.md)**, **[`documentation/soccerwayLeaguesPages.md`](soccerwayLeaguesPages.md)**, and **[`documentation/bbcLeaguesPages.md`](bbcLeaguesPages.md)** to reflect the new season (or re-run `python tools/fix_docs.py` after updating `leagueSplits_Guide.md`).

Complete this checklist for **Spring–Autumn leagues** each January/February:

1. [ ] Update Wikipedia, Google, and Soccerway URLs to the **new calendar year**.
2. [ ] Follow the Soccerway manual ID update process above.
3. [ ] Clear cache for the affected leagues.
