# MMM-MyTeams-LeagueTable Mock Data Guide

This guide explains how to use the mock data functionality in the **MMM-MyTeams-LeagueTable** module. This feature is primarily used for testing UI layouts, verifying tournament stage transitions (like World Cup knockouts), and debugging when live data sources are unavailable or when the play off qualifier are not yet fullt determined.

## Configuration Flags

To enable mock data, add the following flags to your module configuration in `config.js`:

```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  position: "top_right",
  config: {
    useMockData: true,      // Enables mock data generation for test purposes only- set to false when data fully available
    displayAllTabs: true,   // Forces all tournament tabs (GS, Rd32, Rd16, QF, SF, Final) to be visible
    debug: true             // Optional: provides detailed logs in the console
    // ... other config
  }
}
```

## How It Works

### 1. FIFA World Cup 2026
When `useMockData: true` is set, the module ignores live BBC/FIFA feeds for the World Cup and generates a complete tournament structure programmatically:
- **Groups**: All 12 groups (A-L) are populated with mock teams and zeroed statistics.
- **Fixtures**: A full set of 104 tournament fixtures is generated, including:
  - Group Stage (GS)
  - Round of 32 (Rd32)
  - Round of 16 (Rd16)
  - Quarter-Finals (QF)
  - Semi-Finals (SF)
  - Third Place Play-off (TP)
  - Final
- **Timestamps**: All fixtures are assigned timestamps for June/July 2026.

### 2. Other Leagues (EPL, SPFL, UCL, etc.)
For standard leagues, the mock system acts as a "Cache Simulation":
- If `useMockData` is enabled, the module attempts to serve the latest cached data for that league immediately.
- It marks the data with an `isMock: true` flag.
- This allows you to view the module layout even if you are offline or if the live scraper is blocked.

### 3. Tab Visibility (`displayAllTabs`)
By default, the module only shows tournament stages that are currently active or have upcoming matches. Setting `displayAllTabs: true` overrides this logic:
- It forces all knockout stage tabs to appear in the UI.
- This is extremely useful for verifying that the "Round of 32" or "Quarter-Finals" layouts look correct on your MagicMirror screen before the actual tournament begins.

## Use Cases

- **Development**: Testing CSS changes across different tournament views without waiting for live data updates.
- **Layout Verification**: Ensuring that long team names or complex group tables fit within your mirror's specific resolution.
- **Offline Demo**: Showing off the module's capabilities in environments without internet access.

## Disabling Mock Data
To return to live data, simply set `useMockData: false` (or remove the line) in your `config.js`. The module will then resume fetching real-time scores and standings from BBC Sport and FIFA.
