# MMM-MyTeams-LeagueTable

A MagicMirror² module that displays the current SPFL (Scottish Professional Football League) standings sourced from BBC Sport with robust fallback data.

## Features

- **Real-time Data**: Fetches SPFL Premiership standings from BBC Sport
- **Customizable Display**: Toggle columns (position, team, played, W/D/L, F/A, GD, Pts, form)
- **Team Logos**: Optional club crests from `modules/MMM-MyTeams-LeagueTable/images/` when `showTeamLogos: true`
- **Centered Form Tokens**: W/D/L shown as centered, color-coded tokens for better readability
- **Visual Indicators**: Color-coded rows for Champions League, Europa League, and relegation
- **Team Highlighting**: Highlight specific teams
- **Responsive Design**: Works on different screen sizes
- **Error Handling**: Retries and fallback data when live parsing fails
- **Multi-language Support**: EN, DE, ES, FR

## Installation

1. Go to your MagicMirror modules folder.
2. Clone or copy this module into `MagicMirror/modules/MMM-MyTeams-LeagueTable`.
3. Restart MagicMirror.

## Configuration

Add to `~/MagicMirror/config/config.js`:

```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  position: "top_left",
  header: "SPFL - 2025/6",
  config: {
    updateInterval: 30 * 60 * 1000,
    retryDelay: 15000,
    maxRetries: 3,
    animationSpeed: 2000,
    showPosition: true,
    showTeamLogos: true, // Looks for images in modules/MMM-MyTeams-LeagueTable/images/
    showPoints: true,
    showGoalDifference: true,
    showPlayedGames: true,
    showWon: true,
    showDrawn: true,
    showLost: true,
    showGoalsFor: true,
    showGoalsAgainst: true,
    showForm: false,
    maxTeams: 12,
    highlightTeams: ["Celtic"],
    tableHeader: "SPFL Premiership",
    fadeSpeed: 4000,
    colored: true,
    debug: false
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
| `showPosition` | Boolean | `true` | Show position column |
| `showTeamLogos` | Boolean | `false` | Display team crests from `modules/MMM-MyTeams-LeagueTable/images/` (slugified team names, e.g., `st-mirren.png`) |
| `teamLogoMap` | Object | `{}` | Optional per-team overrides for logo filename, e.g., `{ "Hearts": "heart-of-midlothian.png" }` |
| `showPoints` | Boolean | `true` | Show points column |
| `showGoalDifference` | Boolean | `true` | Show goal difference column |
| `showPlayedGames` | Boolean | `true` | Show played column |
| `showWon` | Boolean | `true` | Show won column |
| `showDrawn` | Boolean | `true` | Show drawn column |
| `showLost` | Boolean | `true` | Show lost column |
| `showGoalsFor` | Boolean | `true` | Show goals for column |
| `showGoalsAgainst` | Boolean | `true` | Show goals against column |
| `showForm` | Boolean | `false` | Show recent form (if available) |
| `maxTeams` | Number | `12` | Max teams to display (0 = all) |
| `highlightTeams` | Array | `[]` | Team names to highlight |
| `tableHeader` | String | none | Optional table caption |
| `fadeSpeed` | Number | `4000` | Fade animation speed (ms) |
| `colored` | Boolean | `true` | Position-based row coloring |
| `debug` | Boolean | `false` | Verbose logging in both module and helper |

## Translations

- EN, DE, ES, FR via `translations/*.json`

## Troubleshooting

- Enable debug: set `debug: true` and check browser console + server logs.
- If live parsing fails, fallback data is shown; see server log message.
- Ensure the module name in config.js is exactly `MMM-MyTeams-LeagueTable`.

## Notes

- Data source: https://www.bbc.co.uk/sport/football/scottish-premiership/table
- Logos: Place PNG files in `modules/MMM-MyTeams-LeagueTable/images/` named after team slug (lowercase, non-alphanumeric -> `-`). Examples: `celtic.png`, `rangers.png`, `st-mirren.png`, `heart-of-midlothian.png`.
- Form: W/D/L tokens are centered and color-coded; if no form is available, a dash is shown.
- This project uses no external runtime dependencies.