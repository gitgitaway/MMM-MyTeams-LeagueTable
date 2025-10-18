# MMM-MyTeams-LeagueTable

A MagicMirror² module that displays football league standings from multiple competitions including SPFL (Scottish Professional Football League), UEFA Champions League (UCL), UEFA Europa League (UEL), UEFA Europa Conference League (ECL), English Premier League (EPL), and Scottish Championship (SPFLC), and a number of other European and Workd wide leagues sourced from the official website of the BBC Sport with robust fallback data and detailed error handling.

## Features

- **Multiple Competitions**: Toggle between SPFL, UCL, UEL, ECL, EPL, and SPFLC standings with on-screen buttons
- **Auto-Cycling**: Optional automatically rotating between enabled leagues at configurable intervals
- **Periodic Data Fetch**: Pulls standings from BBC Sport at a configurable interval
- **Customizable Display**: Toggle columns (position, team, played, W/D/L, F/A, GD, Pts, form)
- **Team Logos**: Optional add your own team logos or official club crests to `modules/MMM-MyTeams-LeagueTable/images/`
- **Centered Form Tokens**: W/D/L shown as centered, color‑coded tokens for quick scanning
- **Visual Indicators**: Color-coded rows for Champions League, Europa League, and relegation
- **Team Highlighting**: Emphasize specific teams
- **Responsive Design**: Works on different screen sizes
- **Enhanced Scrolling**: Sticky headers/footers and "Back to Top" button for tables with many teams
- **Resilient Parsing**: Multiple parsing strategies and safe fallbacks if live HTML changes
- **Error Handling & Logging**: Retries with backoff and clear messages on both client and server sides
- **Multi-language Support**: EN, DE, ES, FR

## Requirements & Dependencies

- **MagicMirror²**: v2.1.0 or newer (tested on 2.32.0)
- **Node.js**: v14+ (tested on v22.14.0)
- **Network access**: HTTPS egress to `www.bbc.co.uk`
- **Runtime NPM dependencies**: None (uses Node core modules and MagicMirror core only)
- **Optional Dev Tools** (for local lint/format only; not required to run):
  - `eslint` ^8
  - `prettier` ^2

## Installation

1. Navigate to your MagicMirror's modules folder:
```bash
cd ~/MagicMirror/modules/
```

2. Clone this repository:
```bash
git clone https://github.com/gitgitaway/MMM-MyTeams-LeagueTable.git
```

## Configuration

Add to `~/MagicMirror/config/config.js`:

```javascript
// MMM-MyTeams-LeagueTable configuration block
{
  module: "MMM-MyTeams-LeagueTable",           // Must match the folder/module name
  position: "top_left",                        // Choose your preferred region
  header: "Football Standings",                // Optional UI header text
  config: {
    updateInterval: 30 * 60 * 1000,            // How often to refresh (ms) – default: 30 min
    retryDelay: 15000,                         // Delay between retry attempts after an error (ms)
    maxRetries: 3,                             // Stop retrying after this many failures
    animationSpeed: 2000,                      // DOM update animation speed (ms)

    // League options
    showSPFL: true,                            // Show Scottish Premier League
    showUCL: true,                             // Show UEFA Champions League
    showUEL: true,                             // Show UEFA Europa League
    showECL: true,                             // Show UEFA Europa Conference League
    showEPL: false,                            // Show English Premier League
    showSPFLC: false,                          // Show Scottish Championship
    
    // Auto-cycling options
    autoCycle: true,                           // Enable auto-cycling between leagues
    cycleInterval: 15 * 1000,                  // Time to display each league (15 seconds)
    
    // League headers
    leagueHeaders: {
      "SPFL": "SPFL Premiership",
      "UCL": "UEFA Champions League",
      "UEL": "UEFA Europa League",
      "ECL": "UEFA Europa Conference League",
      "EPL": "English Premier League",
      "SPFLC": "Scottish Championship"
    },

    showPosition: true,                         // Show table position
    showTeamLogos: true,                        // If true, looks for PNG/SVG in images/ (see notes below)
    teamLogoMap: {                              // Optional per-team filename overrides
      // "Hearts": "heart-of-midlothian.png"
    },

    showPoints: true,
    showGoalDifference: true,
    showPlayedGames: true,
    showWon: true,
    showDrawn: true,
    showLost: true,
    showGoalsFor: true,
    showGoalsAgainst: true,

    showForm: false,                            // Show recent form tokens (W/D/L)
    maxTeams: 16,                               // 0 = show all teams
    highlightTeams: ["Celtic", "Hearts"],       // Emphasize teams by exact name
    fadeSpeed: 4000,                            // Fade animation speed (ms)
    colored: true,                              // Color rows by standing (top/UEFA/relegation)

    debug: false,                               // Set to true for verbose client+server logs
    
    // Theme overrides
    darkMode: null,                             // null=auto, true=force dark, false=force light
    fontColorOverride: null,                    // e.g., "#FFFFFF" to force white text
    opacityOverride: null                       // e.g., 1.0 to force full opacity
  }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `updateInterval` | Number | `1800000` | How often to fetch new data (ms) |
| `retryDelay` | Number | `15000` | Delay between retry attempts (ms) |
| `maxRetries` | Number | `3` | Max retry attempts before showing error |
| `animationSpeed` | Number | `2000` | DOM update animation speed (ms) |
| **League Options** |
| `showSPFL` | Boolean | `true` | Show Scottish Premier League button and data |
| `showUCL` | Boolean | `false` | Show UEFA Champions League button and data |
| `showUEL` | Boolean | `false` | Show UEFA Europa League button and data |
| `showECL` | Boolean | `false` | Show UEFA Europa Conference League button and data |
| `showEPL` | Boolean | `false` | Show English Premier League button and data |
| `showSPFLC` | Boolean | `false` | Show Scottish Championship button and data |
| **Auto-cycling Options** |
| `autoCycle` | Boolean | `false` | Enable auto-cycling between enabled leagues |
| `cycleInterval` | Number | `15000` | Time to display each league before cycling (ms) |
| **League Headers** |
| `leagueHeaders` | Object | `{}` | Custom headers for each league type |
| **Display Options** |
| `showPosition` | Boolean | `true` | Show position column |
| `showTeamLogos` | Boolean | `true` | Display team crests from `modules/MMM-MyTeams-LeagueTable/images/` (slug or mapped name) |
| `teamLogoMap` | Object | `{}` | Per-team overrides for logo filename, e.g., `{ "Hearts": "heart-of-midlothian.png" }` |
| `showPoints` | Boolean | `true` | Show points column |
| `showGoalDifference` | Boolean | `true` | Show goal difference column |
| `showPlayedGames` | Boolean | `true` | Show played column |
| `showWon` | Boolean | `true` | Show won column |
| `showDrawn` | Boolean | `true` | Show drawn column |
| `showLost` | Boolean | `true` | Show lost column |
| `showGoalsFor` | Boolean | `true` | Show goals for column |
| `showGoalsAgainst` | Boolean | `true` | Show goals against column |
| `showForm` | Boolean | `false` | Show recent form (if available) |
| `maxTeams` | Number | `16` | Max teams to display (0 = all) |
| `highlightTeams` | Array | `[]` | Team names to highlight |
| `fadeSpeed` | Number | `4000` | Fade animation speed (ms) |
| `colored` | Boolean | `true` | Position-based row coloring |
| `debug` | Boolean | `true` | Verbose logging in both module and helper (set `false` to reduce noise) |

## Translations

- EN, DE, ES, FR via `translations/*.json`

## How It Works (high level)

- The browser module requests data from its `node_helper` over a socket.
- The helper fetches the BBC SPFL table page via HTTPS using Node’s core modules.
- A resilient parser extracts team rows; if the format changes, an alternative parser and a **safe fallback dataset** keep the module functional.
- Errors are surfaced to the UI (with retry messages) and logged to the server console when `debug` is enabled.

# How to add your teams national league

- Further details of te relevant URL and show league codes for most major leagues can be found in the modules "usefull_Info/bbcLeaguePages" document.
If its not listed search the BBC Sports pages for your league or use a local site.
- Add the league code to the config file under "League Options".
- You will need to create a new translation file for your language. See translations/en.json for an example.
- Add the league name to the translations file you created above.
- Add the league code to the config file under "League Headers".
- Restart MagicMirror and enjoy!

## Troubleshooting

- Further details of how to add yor teams national league can be found in the modules "usefull_Info/bbcLeaguePages" document.
- Enable verbose logs: set `debug: true` and watch both the browser console and the MagicMirror server logs.
- If live parsing fails, the helper emits a clear error and the module either retries (up to `maxRetries`) or shows fallback data.
- Confirm the module name in `config.js` is exactly `MMM-MyTeams-LeagueTable`.
- Ensure outbound HTTPS to `www.bbc.co.uk` is allowed by your network.

## Team Logos

- Place PNG or SVG files in `modules/MMM-MyTeams-LeagueTable/images/`
- Default filename is derived from a slug of the team name (lowercase, non‑alphanumeric → `-`). Examples: `celtic.png`, `rangers.svg`, `st-mirren.png`, `heart-of-midlothian.png`
- Use `teamLogoMap` to override specific filenames when needed

## Notes

This is the 2nd module in my Celtic‑themed man‑cave MagicMirror.
- ![Screenshot 1](./screenshots/screenshot-1.png)

Other related modules:
- MMM-MyTeams-Clock  https://github.com/gitgitaway/MMM-MyTeams-Clock
- MMM-MyTeams-Fixtures  https://github.com/gitgitaway/MMM-MyTeams-Fixtures
- MMM-JukeBox  https://github.com/gitgitaway/MMM-JukeBox
- MMM-Celtic-OnThisDay  https://github.com/gitgitaway/MMM-Celtic-OnThisDay
- MMM-MyTeams-Honours  https://github.com/gitgitaway/MMM-MyTeams-Honours

---
## Acknowledgments
Thanks to the MagicMirror community for inspiration and guidance! Special thanks to @jasonacox for work on MMM-MusicPlayer which served as a starting point.
Thanks to the BBC for providing free access to their sports pages.

## License
MIT

