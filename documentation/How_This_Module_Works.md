# How This Module Works

The **MMM-MyTeams-LeagueTable** is a comprehensive football data module for MagicMirror². It uses a distributed architecture to provide live updates while remaining efficient on low-power devices.

## 1. Architecture: The Backend (node_helper.js)
The core logic resides in the `node_helper.js`. This is the "brain" of the module that runs on your MagicMirror server (e.g., Raspberry Pi).

*   **Fetching**: The module uses a **Shared Request Manager** to fetch HTML from BBC Sport and FIFA. It includes "jitter" and rate-limiting to comply with fair-use policies and avoid being blocked.
*   **Parsing**: Instead of relying on expensive APIs, it uses specialized parsers (`BBCParser.js`, `FIFAParser.js`) to extract league standings, fixtures, and results directly from website HTML using high-performance regular expressions.
*   **Logo Resolution**: Over 1,700 team logos are managed on the backend. When data is parsed, the helper automatically attaches the correct local image path for each team, saving your browser from doing thousands of string lookups.
*   **World Cup Engine**: A dynamic resolution engine converts tournament placeholders (like "Winner Group A") into real team names as results come in.

## 2. Smart Caching System
To ensure speed and reliability, the module implements a multi-tier caching strategy:
*   **Memory Cache**: Data is stored in RAM for near-instant access during league switching.
*   **Disk Persistence**: Data is saved to the `.cache/` folder. If your mirror restarts or loses internet, it can load the last known standings immediately.
*   **Proactive Caching**: When you switch leagues, the module serves the cached version *first* so you see data instantly, then fetches a live update in the background.
*   **Stale Fallback**: If a live update fails, the module continues to display the cached data but adds a "STALE" indicator to the header.

## 3. Architecture: The Frontend (MMM-MyTeams-LeagueTable.js)
The frontend is responsible for the visual presentation and user interaction.

*   **DOM Batching**: It uses `DocumentFragment` to update the screen in one go, preventing flickering and reducing CPU usage.
*   **Responsive UI**: The layout adapts to your mirror's size using CSS `clamp()` for fluid typography and flexible containers.
*   **Interactivity**: The module supports touch and mouse interaction for switching leagues, viewing fixtures, and manual refreshing.
*   **Auto-Cycling**: If configured, the module automatically rotates through your selected leagues at a set interval.

## 4. Logo Mapping Logic
Team crests are resolved using a multi-step process:
1.  **Direct Map**: Check the pre-defined `team-logo-mappings.js`.
2.  **Normalized Match**: Case-insensitive matching (e.g., "St Mirren" matches "st-mirren.png").
3.  **Diacritic Removal**: Handles accented characters (e.g., "Bodø" matches "bodo").
4.  **Alphanumeric Stripping**: Removes special characters to find the best match.

## 5. Security & Stability
*   **Sanitization**: All dynamic data is sanitized before being displayed to prevent security vulnerabilities.
*   **Rate Limiting**: The module intelligently backs off if it encounters errors or high latency from data sources.
*   **ReDoS Protection**: All regular expressions are audited to ensure they cannot cause "Regular Expression Denial of Service" when processing large amounts of data.
