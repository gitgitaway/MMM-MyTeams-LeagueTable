# Configuration User Guide

The **MMM-MyTeams-LeagueTable** module is highly configurable. This guide covers all available options and provides recommended setups for different use cases.

## Core Options

| Option | Default | Description |
|:--- |:--- |:--- |
| `updateInterval` | `1800000` (30m) | How often to refresh data from sources (in milliseconds). |
| `animationSpeed` | `2000` | Speed of the transition animation (in milliseconds). |
| `selectedLeagues` | `["SCOTLAND_PREMIERSHIP"]` | Array of league codes to display. (See [Available Leagues](#available-leagues)). |
| `autoCycle` | `false` | If true, the module automatically rotates through selected leagues. |
| `cycleInterval` | `15000` (15s) | Time to display each league during auto-cycling. |
| `maxTeams` | `36` | Maximum number of teams to show (0 for all). |
| `highlightTeams` | `[]` | Array of team names to visually emphasize (e.g., `["Celtic", "Liverpool","Real Madrid", "Inter Milan"]`). |

## Display Toggles

| Option | Default | Description |
|:--- |:--- |:--- |
| `showTeamLogos` | `true` | Show/hide team crests. |
| `showPosition` | `true` | Show/hide league rank. |
| `showForm` | `true` | Show/hide recent match results (W/D/L). |
| `formMaxGames` | `6` | Number of recent games to show in the form column. |
| `showLeagueButtons` | `true` | Show/hide the interactive tabs in the header. |
| `colored` | `true` | Color-code rows (Promotion/UEFA/Relegation zones). |

## Available Leagues

Use these codes in your `selectedLeagues` array:

*   **UK**: `SCOTLAND_PREMIERSHIP`, `SCOTLAND_CHAMPIONSHIP`, `ENGLAND_PREMIER_LEAGUE`
*   **Europe**: `GERMANY_BUNDESLIGA`, `SPAIN_LA_LIGA`, `ITALY_SERIE_A`, `FRANCE_LIGUE1`, `NETHERLANDS_EREDIVISIE`, `PORTUGAL_PRIMEIRA_LIGA`, `BELGIUM_PRO_LEAGUE`, `TURKEY_SUPER_LIG`, `GREECE_SUPER_LEAGUE`, `AUSTRIA_BUNDESLIGA`, `DENMARK_SUPERLIGAEN`, `NORWAY_ELITESERIEN`, `SWEDEN_ALLSVENSKAN`, `SWITZERLAND_SUPER_LEAGUE`
*   **International/UEFA**: `UEFA_CHAMPIONS_LEAGUE`, `UEFA_EUROPA_LEAGUE`, `UEFA_EUROPA_CONFERENCE_LEAGUE`, `WORLD_CUP_2026`

---

## Configuration Examples

### 1. Minimal Configuration (Single Leauge Only)
The simplest setup to get started.

```javascript
{
    module: "MMM-MyTeams-LeagueTable",
    position: "top_right",
    config: {
        selectedLeagues: ["SCOTLAND_PREMIERSHIP"]
    }
}
```

### 2. Major European Leagues (Auto-Cycling)
Rotates between the top 5 European leagues every 20 seconds.

```javascript
{
    module: "MMM-MyTeams-LeagueTable",
    position: "top_right",
    config: {
        selectedLeagues: [
            "ENGLAND_PREMIER_LEAGUE", 
            "SPAIN_LA_LIGA", 
            "GERMANY_BUNDESLIGA", 
            "ITALY_SERIE_A", 
            "FRANCE_LIGUE1"
        ],
        autoCycle: true,
        cycleInterval: 20000
    }
}
```

### 3. UEFA Competitions Focus
Focuses on the European knockout stages with specific tab visibility.

```javascript
{
    module: "MMM-MyTeams-LeagueTable",
    position: "top_right",
    config: {
        selectedLeagues: ["UEFA_CHAMPIONS_LEAGUE", "UEFA_EUROPA_LEAGUE"],
        showUEFAleagues: true,
        showUEFAnockouts: ["Rd16", "QF", "SF", "Final"],
        autoFocusRelevantSubTab: true
    }
}
```

### 4. FIFA World Cup 2026 (Tournament Mode)
Optimized view for the upcoming World Cup.

```javascript
{
    module: "MMM-MyTeams-LeagueTable",
    position: "top_right",
    config: {
        selectedLeagues: ["WORLD_CUP_2026"],
        onlyShowWorldCup2026: true,
        showWC2026Groups: ["A", "B", "C"], // Focus only on specific groups
        autoCycleWcSubtabs: true
    }
}
```

### 5. Full Recommended Configuration (The "Power User" Setup)
Enables all leagues, auto-cycling, high contrast, and manual overrides.

```javascript
{
    module: "MMM-MyTeams-LeagueTable",
    position: "top_right",
    config: {
        selectedLeagues: [
            "SCOTLAND_PREMIERSHIP", 
            "ENGLAND_PREMIER_LEAGUE", 
            "SPAIN_LA_LIGA", 
            "GERMANY_BUNDESLIGA", 
            "ITALY_SERIE_A", 
            "FRANCE_LIGUE1"
            "UEFA_CHAMPIONS_LEAGUE", 
            "WORLD_CUP_2026"
        ],
        autoCycle: true,
        cycleInterval: 15000,
        highlightTeams: ["Celtic", "Scotland", "Liverpool"],
        maxTeams: 12, // Show only the top 12 for compactness
        showForm: true,
        formMaxGames: 6,
        updateInterval: 600000, // Refresh every 10 minutes
        debug: false
    }
}
```
