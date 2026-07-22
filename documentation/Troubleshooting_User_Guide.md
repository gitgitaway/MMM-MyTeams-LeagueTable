# Troubleshooting User Guide

This guide helps you resolve common issues with the **MMM-MyTeams-LeagueTable** module.

## Common Issues

### 1. Module Displays "Loading..." Indefinitely
*   **Cause**: The module is having trouble fetching data from BBC Sport or FIFA.
*   **Solution**: 
    *   Check your internet connection.
    *   Check the MagicMirror logs (`pm2 logs` or npm start output) for "FETCH_ERROR".
    *   Ensure the league you selected is currently active (some leagues don't have tables in the off-season).
    *   Try clearing the cache by clicking the **square (dashed border)** trash icon in the module header (if enabled).

### 2. Team Logos are Missing (404 Not Found)
*   **Cause**: The module cannot find the image file for a specific team.
*   **Solution**:
    *   Check the browser console (F12 in Chrome/Edge) for 404 errors.
    *   Verify the logo exists in `images/crests/[Country]/[team-name].png`.
    *   Team names must match the BBC Sport names exactly (normalized to lowercase with hyphens for the filename).
    *   Use the `teamLogoMap` configuration option to manually map a team to a specific image.

### 3. "Some specific league data not parsed from website"
*   **Cause**: The BBC Sport website structure might have changed, or the league is currently in a state where no table is displayed.
*   **Solution**:
    *   Verify the league page on BBC Sport.
    *   If the website structure has changed, please report an issue on GitHub.
    *   The module includes a fallback cache; it will display the last successful data if available.

### 4. Module Fails to Load / Blank Screen
*   **Cause**: Likely a syntax error in your `config.js` or a missing dependency.
*   **Solution**:
    *   Run `npm run lint` in the module directory to check for code errors.
    *   Ensure you ran `npm install` in the `MMM-MyTeams-LeagueTable` directory.
    *   Check for "Refused to apply style" errors in the console, which might indicate a path issue or a server configuration problem.

### 5. "STALE" Indicator is Visible
*   **Cause**: The module failed to fetch live data and is showing cached results instead.
*   **Solution**: 
    *   This is an automated safety feature. It will disappear once a live fetch succeeds.
    *   If it persists, check if the BBC Sport URL for that league is accessible from your network.

### 6. Duplicate Fixtures Appearing in UEFA Competitions
*   **Status**: ✅ **FIXED in v1.8.3** (2026-02-19)
*   **Cause**: BBC Sport HTML sometimes contains truncated or corrupted team names (e.g., "Ferencv" instead of "Ferencváros", "ystok" instead of "Jagiellonia Białystok")
*   **Solution**: 
    *   The module now includes fuzzy matching deduplication that automatically detects and removes duplicates
    *   Deduplication prioritizes the version with longer (more complete) team names
    *   Check the browser console for `[BBCParser-DEDUP]` logs showing which duplicates were removed

### 7. Same Team Playing Against Itself (e.g., "Dortmund vs Borussia Dortmund")
*   **Status**: ✅ **FIXED in v1.8.3** (2026-02-19)
*   **Cause**: BBC Sport occasionally serves corrupted fixture data with the same team twice
*   **Solution**: 
    *   The module now automatically detects corrupted fixtures and repairs them using counterpart fixtures from the two-legged tie
    *   Check the browser console for `[BBCParser-CORRUPTION]` logs showing repairs (e.g., "Fixed first leg: Borussia Dortmund vs Atalanta")

### 8. Upcoming Fixtures Showing "0-0" Instead of Kick-off Time
*   **Status**: ✅ **FIXED in v1.8.3** (2026-02-19)
*   **Cause**: BBC Sport sometimes sends 0-0 scores for scheduled fixtures before kickoff
*   **Solution**: 
    *   The module now ignores score data for non-live fixtures and displays kick-off time (e.g., "17:45", "20:00") instead
    *   Once matches go live, the display automatically switches to showing actual scores
    *   Check the browser console for `[FIXTURE-DEBUG]` logs showing fixture status and display decisions for today's matches

### 9. Missing Second Leg Fixtures in UEFA Playoff Tab
*   **Status**: ✅ **FIXED in v1.8.3** (2026-02-19)
*   **Solution**: 
    *   The module now displays three sections in UEFA Playoff tabs: "RESULTS" (completed), "TODAYS FIXTURES" (live/today), and "UPCOMING FIXTURES" (future, including Feb 26th second legs)
    *   All fixtures are sorted chronologically within each section

### 10. Only One Group (e.g. Top 6) Visible for a Split League
*   **Status**: ✅ **FIXED in v2.5.0** (2026-04-09)
*   **Cause**: Providers like BBC Sport often show only the Championship group once a league splits. Previous versions only rendered the first group found.
*   **Solution**: 
    *   The module now supports multi-group rendering (Championship + Relegation simultaneously).
    *   If the primary source is missing groups, the module automatically escalates to Wikipedia.
    *   Ensure your `wikipediaUrlMap` in `MMM-MyTeams-LeagueTable.js` is correct for the current season.
    *   Check for `[Multi-group]` logs in the terminal to verify Wikipedia parsing success.

### 11. Module Fails to Load with `TypeError: Cannot read properties of undefined (reading 'length')`
*   **Status**: ✅ **FIXED in v2.5.2** (2026-04-14)
*   **Cause**: The `this.currentLeague` assignment in `start()` referenced `this.enabledLeagueCodes.length` before `determineEnabledLeagues()` had been called to populate the array.
*   **Solution**: Fixed in v2.5.2. If you see this error, ensure you are on the latest version (`git pull`).

### 12. `UnhandledPromiseRejectionWarning: ReferenceError: chainInfo is not defined` in Terminal
*   **Status**: ✅ **FIXED in v2.5.2** (2026-04-14)
*   **Cause**: A variable `chainInfo` used in a debug log statement inside `fetchLeagueData()` in `node_helper.js` was never declared — a leftover from a prior refactor. This caused repeated unhandled rejections on every data fetch cycle.
*   **Solution**: Fixed in v2.5.2. Update to the latest version.

### 13. Module Silently Loads but Displays No Data / Console Shows `Uncaught SyntaxError`
*   **Status**: ✅ **FIXED in v2.5.2** (2026-04-14)
*   **Cause**: A space in the object key `NORTH MACEDONIA_FIRST_LEAGUE` (should be `NORTH_MACEDONIA_FIRST_LEAGUE`) in `european-leagues.js` caused the entire script to fail to parse, silently breaking module initialisation.
*   **Solution**: Fixed in v2.5.2. Check the browser console (F12) for `Uncaught SyntaxError` errors pointing to `european-leagues.js` if you suspect this issue.

### 14. League Shows "Could not find URL for league code: DENMARK_SUPERLIGA" (or FINLAND_VEIKKAUSLIIGA)
*   **Status**: ✅ **FIXED in v2.5.2** (2026-04-14)
*   **Cause**: The internal URL provider maps used inconsistent keys (`DENMARK_SUPERLIGAEN`, `FINLAND_PREMIER_LEAGUE`) that did not match the canonical codes expected by the config system (`DENMARK_SUPERLIGA`, `FINLAND_VEIKKAUSLIIGA`).
*   **Solution**: Fixed in v2.5.2. All five provider maps now use identical canonical keys. Update to the latest version.

## Diagnostic Steps

1.  **Enable Debug Mode**: Set `debug: true` in your module configuration. This will output detailed logs to the browser console and the Node.js console.
2.  **Check Logs**: Look at both the MagicMirror terminal (server-side) and the browser console (client-side).
3.  **Clear Cache**: Delete the `.cache` folder inside the module directory to force a fresh fetch.

## Reporting Issues
If you cannot resolve the issue, please open an issue on the GitHub repository and include:
1.  Your `config.js` snippet for this module (remove sensitive info).
2.  Errors from the browser console.
3.  Errors from the MagicMirror terminal logs.
