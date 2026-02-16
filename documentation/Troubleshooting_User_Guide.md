# Troubleshooting User Guide

This guide helps you resolve common issues with the **MMM-MyTeams-LeagueTable** module.

## Common Issues

### 1. Module Displays "Loading..." Indefinitely
*   **Cause**: The module is having trouble fetching data from BBC Sport or FIFA.
*   **Solution**: 
    *   Check your internet connection.
    *   Check the MagicMirror logs (`pm2 logs` or npm start output) for "FETCH_ERROR".
    *   Ensure the league you selected is currently active (some leagues don't have tables in the off-season).
    *   Try clearing the cache by clicking the trash icon in the module header (if enabled).

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

## Diagnostic Steps

1.  **Enable Debug Mode**: Set `debug: true` in your module configuration. This will output detailed logs to the browser console and the Node.js console.
2.  **Check Logs**: Look at both the MagicMirror terminal (server-side) and the browser console (client-side).
3.  **Clear Cache**: Delete the `.cache` folder inside the module directory to force a fresh fetch.

## Reporting Issues
If you cannot resolve the issue, please open an issue on the GitHub repository and include:
1.  Your `config.js` snippet for this module (remove sensitive info).
2.  Errors from the browser console.
3.  Errors from the MagicMirror terminal logs.
