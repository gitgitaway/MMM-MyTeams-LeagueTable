# MMM-MyTeams-LeagueTable

A comprehensive **MagicMirror²** module that displays football league standings from multiple competitions including the FIFA 2026 World Cup , UEFA Champions League (UCL), UEFA Europa League (UEL), UEFA Europa Conference League (ECL), English Premier League (EPL), German Bundesliga,French La Ligue , Italian Serie A , Spanish Primera División, Portuguese Liga, SPFL (Scottish Professional Football League) and Scottish Championship (SPFLC) as well as most other European and World wide leagues, with data sourced from the official website of the BBC Sport with robust fallback data and detailed error handling.

- **Author**: gitgitaway

[![MagicMirror²](https://img.shields.io/badge/MagicMirror%C2%B2-v2.1.0+-blue.svg)](https://magicmirror.builders)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎬 Screenshots

|                                                  |                                                  |                                                  |
| :----------------------------------------------: | :----------------------------------------------: | :----------------------------------------------: |
| [![Screenshot 1](./screenshots/screenshot1.png)] | [![Screenshot 2](./screenshots/screenshot2.png)] | [![Screenshot 3](./screenshots/screenshot3.png)] |
| [![Screenshot 4](./screenshots/screenshot4.png)] | [![Screenshot 5](./screenshots/screenshot5.png)] | [![Screenshot 6](./screenshots/screenshot6.png)] |
| [![Screenshot 7](./screenshots/screenshot7.png)] |                                                  |                                                  |

## 🆕 Recent Updates (v2.1.0 - 2026-02-23)

**🚀 Phase 4: Advanced Power-User Features:**

- ✨ **Configurable table density** - Choose compact, normal, or comfortable spacing
- 🎨 **Full light/dark mode** - Auto, light, or dark themes with complete CSS variable system
- 📅 **Fixture date filtering** - Show only today's, this week's, or custom date ranges
- 🎨 **Team color customization** - Apply custom hex colors to specific team rows
- ⚡ **Virtual scrolling** - Performance optimizations for tables with 50+ rows
- 🔧 **Team name normalization** - Fixes BBC Sport truncations ("Atletico" → "Atletico Madrid")

**Previous: Phase 2 & 3 (v2.0.0 - 2026-02-22):**

- ⚡ **Async cache I/O** - Non-blocking disk operations for Raspberry Pi
- 🎯 **Enhanced error messages** - User-friendly categorization with actionable suggestions
- ♿ **WCAG 2.1 Level AAA** - High contrast mode and screen reader announcements
- 🎨 **Skeleton loading states** - Improve perceived performance by 20-40%
- 📊 **Stale data indicators** - Color-coded age display (green/yellow/red)

**Phase 1 (v1.9.0 - 2026-02-21):**

- 🔒 **Zero XSS vulnerabilities** - Eliminated all innerHTML usage
- ♿ **WCAG 2.1 Level AA** - Full keyboard navigation and screen reader support
- 🛡️ **Input validation** - Secure dateTimeOverride validation

See [CHANGELOG.md](./CHANGELOG.md) for complete details.

## 🏆 Key Features

- **Multi-League Support**: Track SPFL, EPL, Bundesliga, La Liga, and 20+ other national leagues.
- **Tournament Modes**: Dedicated views for UEFA Champions League and FIFA World Cup 2026.
- **Intelligent Logo Mapping**: Automatic team crest resolution for over 1,700 teams.
- **Performance Optimized**: Server-side processing, async caching, virtual scrolling, and smooth CSS transitions.
- **🔒 Security Hardened**: Zero XSS vulnerabilities with safe DOM manipulation and input validation.
- **♿ Fully Accessible**: WCAG 2.1 Level AAA compliant with screen readers, keyboard navigation, and high contrast mode.
- **🎨 Advanced Customization**: Light/dark themes, table density options, custom team colors, and date filtering.
- **📊 Enhanced UX**: Skeleton loading states, stale data indicators, and categorized error messages.
- **Auto-Cycling**: Automatically rotate between different leagues or tournament groups.

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
## Update

```
cd ~/MagicMirror/modules/MMM-MyTeams-LeagueTable
git pull
```
## Configuration

To use this module, add it to the modules array in the `~/MagicMirror/config/config.js` file:

### Minimum Configuration

```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  position: "top_right",
  config: {
    selectedLeagues: ["SCOTLAND_PREMIERSHIP"]
  }
},
```

### Full Configuration

```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  position: "top_right",
  header: "Football Standings",
  config: {
    updateInterval: 30 * 60 * 1000,
    selectedLeagues: ["SCOTLAND_PREMIERSHIP", "ENGLAND_PREMIER_LEAGUE", "UEFA_CHAMPIONS_LEAGUE", "WORLD_CUP_2026"],
    autoCycle: true,
    cycleInterval: 20000,
    highlightTeams: ["Celtic", "Liverpool", "Scotland"],
    maxTeams: 12,
    showTeamLogos: true,
    showForm: true,
    formMaxGames: 6,
    colored: true,
    showLeagueButtons: true,
    autoFocusRelevantSubTab: true,
    maxTableHeight: 600
  }
},
```

See - **[Configuration User Guide](./documentation/Configuration_User_Guide.md)**: for further detailed configuration options.

### Configuration Options

#### Core Options

| Option            | Default                    | Description                                       |
| :---------------- | :------------------------- | :------------------------------------------------ |
| `updateInterval`  | `1800000` (30m)            | How often to refresh data (in milliseconds).      |
| `selectedLeagues` | `["SCOTLAND_PREMIERSHIP"]` | Array of league codes to display.                 |
| `highlightTeams`  | `["Celtic", "Hearts"]`     | Array of team names to visually emphasize.        |
| `maxTeams`        | `36`                       | Maximum number of teams to show (0 for all).      |
| `scrollable`      | `true`                     | Enable vertical scrolling if max height exceeded. |
| `maxTableHeight`  | `460`                      | Height in px before scrolling kicks in.           |

#### Display Toggles

| Option                               | Default | Description                                        |
| :----------------------------------- | :------ | :------------------------------------------------- |
| `showTeamLogos`                      | `true`  | Show/hide team crests.                             |
| `showPosition`                       | `true`  | Show/hide league rank.                             |
| `showPlayedGames`                    | `true`  | Show games played column.                          |
| `showWon` / `showDrawn` / `showLost` | `true`  | Toggle W/D/L columns.                              |
| `showGoalsFor` / `showGoalsAgainst`  | `true`  | Toggle GF/GA columns.                              |
| `showGoalDifference`                 | `true`  | Show GD column.                                    |
| `showPoints`                         | `true`  | Show points column.                                |
| `showForm`                           | `true`  | Show recent match results (W/D/L).                 |
| `formMaxGames`                       | `6`     | Number of recent games to show in form column.     |
| `colored`                            | `true`  | Color-code rows (Promotion/UEFA/Relegation zones). |
| `showLeagueButtons`                  | `true`  | Show/hide the interactive tabs in the header.      |

#### Cycling Options

| Option                  | Default       | Description                                                  |
| :---------------------- | :------------ | :----------------------------------------------------------- |
| `autoCycle`             | `false`       | If true, automatically rotate through selected leagues.      |
| `cycleInterval`         | `15000` (15s) | Time to display each league during auto-cycling.             |
| `autoCycleWcSubtabs`    | `true`        | Allow auto-cycling of World Cup sub-tabs (groups/knockouts). |
| `wcSubtabCycleInterval` | `15000`       | Time to display each WC sub-tab.                             |

#### Advanced Customization (Phase 4 - v2.1.0+)

| Option                    | Default   | Description                                                                          |
| :------------------------ | :-------- | :----------------------------------------------------------------------------------- |
| `tableDensity`            | `"normal"` | Table row spacing: `"compact"` (dense), `"normal"` (balanced), `"comfortable"` (spacious). |
| `theme`                   | `"auto"`  | Color theme: `"auto"` (system preference), `"light"`, or `"dark"`.                   |
| `fixtureDateFilter`       | `null`    | Filter fixtures by date: `null` (all), `"today"`, `"week"`, `"month"`, or `{start: "YYYY-MM-DD", end: "YYYY-MM-DD"}`. |
| `customTeamColors`        | `{}`      | Custom team row colors: `{"Team Name": "#HEXCOLOR"}`. Example: `{"Celtic": "#00A650"}`. |
| `enableVirtualScrolling`  | `false`   | Enable performance optimizations for large tables (50+ rows).                        |
| `virtualScrollThreshold`  | `50`      | Number of rows before virtual scrolling activates.                                   |

**Example Configuration:**
```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  position: "top_right",
  config: {
    tableDensity: "compact",           // Dense layout for more teams visible
    theme: "dark",                     // Force dark mode
    fixtureDateFilter: "week",         // Show only next 7 days of fixtures
    customTeamColors: {
      "Celtic": "#00A650",             // Celtic green
      "Rangers": "#0000FF"             // Rangers blue
    },
    enableVirtualScrolling: true,      // Optimize for large tables
    virtualScrollThreshold: 30         // Activate at 30+ rows
  }
}
```

#### Tournament Specific (World Cup 2026 & UEFA)

| Option                    | Default                 | Description                                      |
| :------------------------ | :---------------------- | :----------------------------------------------- |
| `showWC2026`              | `false`                 | Show World Cup 2026 in league switcher.          |
| `showUEFAleagues`         | `false`                 | Show UEFA leagues in league switcher.            |
| `onlyShowWorldCup2026`    | `false`                 | Force module into dedicated World Cup mode.      |
| `autoFocusRelevantSubTab` | `true`                  | Automatically focus on live or upcoming matches. |
| `showWC2026Groups`        | `["A"..."L"]`           | Array of groups to display.                      |
| `showWC2026Knockouts`     | `["Rd32"..."Final"]`    | Knockout rounds to show.                         |
| `showUEFAnockouts`        | `["Playoff"..."Final"]` | UEFA knockout stages to show.                    |

## ⚽ Available Leagues

Use these codes in your `selectedLeagues` array:

- **UK**: `SCOTLAND_PREMIERSHIP`, `SCOTLAND_CHAMPIONSHIP`, `ENGLAND_PREMIER_LEAGUE`
- **Major Europe**: `GERMANY_BUNDESLIGA`, `SPAIN_LA_LIGA`, `ITALY_SERIE_A`, `FRANCE_LIGUE1`, `NETHERLANDS_EREDIVISIE`
- **Other Europe**: `PORTUGAL_PRIMEIRA_LIGA`, `BELGIUM_PRO_LEAGUE`, `TURKEY_SUPER_LIG`, `GREECE_SUPER_LEAGUE`, `AUSTRIA_BUNDESLIGA`, `CZECH_LIGA`, `DENMARK_SUPERLIGAEN`, `NORWAY_ELITESERIEN`, `SWEDEN_ALLSVENSKAN`, `SWITZERLAND_SUPER_LEAGUE`, `UKRAINE_PREMIER_LEAGUE`, `ROMANIA_LIGA_I`, `CROATIA_HNL`, `SERBIA_SUPER_LIGA`, `HUNGARY_NBI`, `POLAND_EKSTRAKLASA`
- **International/UEFA**: `UEFA_CHAMPIONS_LEAGUE`, `UEFA_EUROPA_LEAGUE`, `UEFA_EUROPA_CONFERENCE_LEAGUE`, `WORLD_CUP_2026`

## 📚 Detailed Documentation

### Core Documentation

- **[How This Module Works](./documentation/How_This_Module_Works.md)**: Architectural overview.
- **[Configuration User Guide](./documentation/Configuration_User_Guide.md)**: Detailed configuration options.
- **[Advanced Customization](./documentation/Advanced_Customization.md)**: CSS variables and manual logo mapping.
- **[Troubleshooting](./documentation/Troubleshooting_User_Guide.md)**: Common issues and solutions.
- **[Translation Guide](./documentation/Translation-Guide.md)**: Language support and localization.
- **[Accessibility Features](./documentation/Accessibility_Features.md)**: Screen reader and visual aid details.

### Tournament & League Guides

- **[World Cup 2026 Guide](./documentation/WorldCup2026-UserGuide.md)**: Tournament specific details.
- **[European Leagues Config](./documentation/EUROPEAN_LEAGUES_CONFIG.md)**: Details on European league setup.
- **[BBC League Pages](./documentation/bbcLeaguesPages.md)**: Reference list of supported league pages.

### Technical References

- **[Cache Quickstart](./documentation/CACHE_QUICKSTART.md)**: Guide to the module's caching system.
- **[Mock Data Guide](./documentation/MOCK_DATA_GUIDE.md)**: How to use mock data for testing.
- **[Shared Request Manager](./documentation/SHARED_REQUEST_MANAGER.md)**: Technical details of the data fetching system.
- **[Code of Conduct](./documentation/Code_Of_Conduct.md)**: Contributor guidelines.

### Project Files

- **[Changelog](./CHANGELOG.md)**: History of changes and versions.
- **[Final Review](./Final_Review.md)**: Final implementation review.
- **[License](./LICENSE)**: MIT License details.

### Acknowledgments

Thanks to the MagicMirror community for inspiration and guidance!
Thanks to the BBC for providing free access to their sports pages.

### License

MIT
