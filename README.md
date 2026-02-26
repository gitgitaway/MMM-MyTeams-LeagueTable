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

## 🆕 Recent Updates (v2.2.0 - 2026-02-24)

**Security, Accessibility & Performance:**

- ♿ **Focus management (A11Y-08)** - Keyboard focus is preserved across table refreshes using `data-team-name` anchors and WCAG 2.1 SC 2.4.3 compliant restore logic
- 🛡️ **CSP documentation (SEC-06)** - Full Content Security Policy guide added for enterprise/kiosk deployments
- 🧪 **Security test suite (SEC-10)** - 17 automated Mocha regression tests covering DOM safety, input validation, debug guards, and more
- ⚡ **Dynamic logo loading (PERF-09)** - `team-logo-mappings.js` (102KB) now loaded asynchronously; table renders immediately, logos populate after

**Previous: v2.1.0 (Phase 4 - 2026-02-23):**

**🚀 Advanced Power-User Features:**

- ✨ **Configurable table density** - Choose compact, normal, or comfortable spacing
- 🎨 **Full light/dark mode** - Auto, light, or dark themes with complete CSS variable system
- 📅 **Fixture date filtering** - Show only today's, this week's, or custom date ranges
- 🎨 **Team color customization** - Apply custom hex colors to specific team rows
- ⚡ **Virtual scrolling** - Performance optimizations for tables with 30+ rows
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

3. Install dependencies:
```bash
cd modules/MMM-MyTeams-LeagueTable
npm install
```

## Update

```bash
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
   position: "top_left",
   header: "League Standings", // Set to null  or  "League Standings",
   config: {
    updateInterval: 30 * 60 * 1000, // How often to refresh (ms) – default: 30 min
    retryDelay: 15000, // Delay between retry attempts after an error (ms)
    maxRetries: 3, // Stop retrying after this many failures
    animationSpeed: 2000, // DOM update animation speed (ms)
    fadeSpeed: 4000, // Fade animation speed (ms)
    colored: true, // Color rows by standing (top/UEFA/relegation)
    maxTeams: 36, // 0 = show all teams
    highlightTeams: ["Celtic", "Hearts"], // Emphasize teams by exact name e.g. ["Celtic", "Hearts"],
    scrollable: true, // Enable vertical scrolling if max height exceeded

    // ===== NEW: League Selection System (replaces old individual toggles) =====
    // Method 1: Use selectedLeagues array to choose specific leagues by code
    // Leave empty to use legacy showXXX options, or populate with league codes
    // Example: Scottish Premiership enabled by default
    // Add more league codes here, e.g., "ENGLAND_PREMIER_LEAGUE", "GERMANY_BUNDESLIGA", etc.
    selectedLeagues: [
    "SCOTLAND_PREMIERSHIP",
    "ENGLAND_PREMIER_LEAGUE",
    "GERMANY_BUNDESLIGA",
    "FRANCE_LIGUE1",
    "SPAIN_LA_LIGA",
    "ITALY_SERIE_A",
    "PORTUGAL_PRIMEIRA_LIGA",
    "BELGIUM_PRO_LEAGUE",
    "NETHERLANDS_EREDIVISIE",
    "UEFA_EUROPA_CONFERENCE_LEAGUE",
    "UEFA_EUROPA_LEAGUE",
    "UEFA_CHAMPIONS_LEAGUE",
    "WORLD_CUP_2026" // Enable during World Cup 2026
    ],

    // Method 2: Use legacyLeagueToggle = true to enable old config style (for backward compatibility)
    legacyLeagueToggle: false, // If true, uses showSPFL, showEPL, etc. from config
          
    // ===== LEGACY League toggles (used if legacyLeagueToggle: true) =====  // Set true to show, false to hide
    showSPFL: true, // Show Scottish Premiership
    showSPFLC: false, // Show Scottish Championship
    showEPL: false, // Show English Premier League
    showUCL: false, // Show UEFA Champions League
    showUEL: false, // Show UEFA Europa League
    showECL: false, // Show UEFA Europa Conference League
    
    // ===== NEW: Automatic button generation from selectedLeagues =====
    autoGenerateButtons: true, // Auto-create buttons for all leagues in selectedLeagues
    showLeagueButtons: true, // Show/hide league selector buttons in header
    autoFocusRelevantSubTab: true, // Automatically focus on the sub-tab with live or upcoming matches

    // ===== NEW: UEFA League Competitions Specific Options =====
    showUEFAleagues: true, // Set to true to show UEFA leagues in league switcher
    showUEFAnockouts: ["Playoff", "Rd16", "QF", "SF", "Final"], // UEFA knockout stages to show

    // ===== NEW: FIFA World Cup 2026 Specific Options =====
    showWC2026: true, // Set to true to show World Cup 2026 in league switcher
    onlyShowWorldCup2026: false, // If true, only shows World Cup 2026 view
    showWC2026Groups: ["A","B","C","D","E","F","G","H","I","J","K","L"], // Groups to show
    showWC2026Knockouts: ["Rd32", "Rd16", "QF", "SF", "TP", "Final"], // Knockout rounds to show
    defaultWCSubTab: "C", // Default tab to focus on start-up (e.g., "C", "Final", etc.)
    displayAllTabs: true, // Override to show all tabs regardless of stage completion
    useMockData: true, // For testing use only (only for World Cup 2026) for when data not available - Swet to false before competion begins

    // ===== Display Options =====
    showPosition: true, // Show table position
    showTeamLogos: true, // Show team logos
    showPlayedGames: true, // Show games played
    showWon: true, // Show wins
    showDrawn: true, // Show draws
    showLost: true, // Show losses
    showGoalsFor: true, // Show goals for
    showGoalsAgainst: true, // Show goals against
    showGoalDifference: true, // Show goal difference
    showPoints: true, // Show points
    showForm: true, // Show recent form tokens (W/D/L)
    formMaxGames: 6, // Max number of form games to display
    enhancedIndicatorShapes: true, // true = shape-coded tokens (circle/square/triangle); false = colored text only, no background
    firstPlaceColor: "rgb(190, 245, 190)", // Color for the team in first position
    highlightedColor: "rgba(255, 255, 255, 0.1)", // Color for highlighted teams
    
    // ===== UX Options (Phase 4) =====
    tableDensity: "normal", // Table row density: "compact", "normal", "comfortable"
    fixtureDateFilter: null, // Filter fixtures by date range: null (show all), "today", "week", "month", or {start: "YYYY-MM-DD", end: "YYYY-MM-DD"}
    enableVirtualScrolling: true, // Enable virtual scrolling for large tables (>50 rows)
    virtualScrollThreshold: 10, // Number of rows before virtual scrolling activates

    
    // ===== Auto-cycling options =====
    autoCycle: true, // Enable auto-cycling between leagues
    cycleInterval: 15 * 1000, // Time to display each league (15 seconds)
    wcSubtabCycleInterval: 20 * 1000, // Time to display each WC sub-tab (groups/knockouts)
    autoCycleWcSubtabs: true, // Allow auto-cycling of World Cup sub-tabs

    
    // Theme overrides
    darkMode: true, // null=auto, true=force dark, false=force light
    fontColorOverride: "#FFFFFF", // Set to "null" for your existing css colour scheme or override all font colors "#FFFFFF" to force white text
    opacityOverride: null, // null=auto,  set to  1.0 to force full opacity
    
    // ===== Theme Options (Phase 4) =====
    theme: "auto", // Color theme: "auto" (follows system), "light", "dark"
    customTeamColors: {"Celtic": "#018749", "Hearts": "#ea00ff86"}, // Custom colors for specific teams: {"Team Name": "#HEXCOLOR"}
    
    // Debug
    debug: true, // Set to true to enable console logging
    dateTimeOverride: null, // Override system date/time for testing. Use ISO date format (e.g., "2026-01-15" or "2026-01-15T14:30:00Z"). null = use system date

    // Cache controls
    clearCacheButton: true,    // Allows user to clear cache from the display
    clearCacheOnStart: false, // Set to true to force-clear ALL caches (disk, fixture, logo) on every module start - useful for development and troubleshooting
    maxTableHeight: 460 // Height in px to show 12 teams
   }
  }
```

See - **[Configuration User Guide](./documentation/Configuration_User_Guide.md)**: for further detailed configuration options.

### Configuration Options

#### Core Options

| Option                    | Default                    | Description                                                                                    |
| :------------------------ | :------------------------- | :--------------------------------------------------------------------------------------------- |
| `updateInterval`          | `1800000` (30m)            | How often to refresh data (milliseconds).                                                      |
| `retryDelay`              | `15000`                    | Delay between retry attempts after a fetch error (ms).                                         |
| `maxRetries`              | `3`                        | Maximum fetch retry attempts before giving up.                                                 |
| `animationSpeed`          | `2000`                     | DOM update animation speed (ms).                                                               |
| `fadeSpeed`               | `4000`                     | Fade transition speed (ms).                                                                    |
| `selectedLeagues`         | `["SCOTLAND_PREMIERSHIP"]` | Array of league codes to display.                                                              |
| `highlightTeams`          | `["Celtic", "Hearts"]`     | Team names to visually emphasize.                                                              |
| `maxTeams`                | `36`                       | Maximum teams per table (0 = all).                                                             |
| `scrollable`              | `true`                     | Enable vertical scrolling when max height is exceeded.                                         |
| `maxTableHeight`          | `460`                      | Pixel height before vertical scrolling activates.                                              |
| `autoGenerateButtons`     | `true`                     | Auto-create league switcher buttons from `selectedLeagues`.                                    |
| `showLeagueButtons`       | `true`                     | Show or hide league switcher tabs in the header.                                               |
| `autoFocusRelevantSubTab` | `true`                     | Automatically focus the tab showing live or upcoming matches.                                  |
| `legacyLeagueToggle`      | `true`                     | If `true`, uses legacy `showSPFL` / `showEPL` toggles instead of `selectedLeagues`.           |
| `clearCacheButton`        | `true`                     | Display the Clear Cache button on the module.                                                  |
| `clearCacheOnStart`       | `false`                    | Force-clear all caches on every module start (useful for troubleshooting).                     |
| `debug`                   | `false`                    | Enable verbose console logging. Disable in production on Raspberry Pi.                         |
| `dateTimeOverride`        | `null`                     | Override system date/time for testing. ISO format e.g. `"2026-06-15T14:00:00Z"`.              |

#### Display Toggles & Display Options

| Option               | Default                     | Description                                                         |
| :------------------- | :-------------------------- | :------------------------------------------------------------------ |
| `showPosition`       | `true`                      | Show league rank column.                                            |
| `showTeamLogos`      | `true`                      | Show team crest images.                                             |
| `showPlayedGames`    | `true`                      | Show games played column.                                           |
| `showWon`            | `true`                      | Show wins column.                                                   |
| `showDrawn`          | `true`                      | Show draws column.                                                  |
| `showLost`           | `true`                      | Show losses column.                                                 |
| `showGoalsFor`       | `true`                      | Show goals for column.                                              |
| `showGoalsAgainst`   | `true`                      | Show goals against column.                                          |
| `showGoalDifference` | `true`                      | Show goal difference column.                                        |
| `showPoints`         | `true`                      | Show points column.                                                 |
| `showForm`           | `true`                      | Show recent form tokens (W/D/L).                                    |
| `formMaxGames`       | `6`                         | Number of recent games shown in the form column.                    |
| `colored`            | `true`                      | Color-code rows by zone (promotion / UEFA / relegation).            |
| `highlightedColor`   | `"rgba(255,255,255,0.1)"`   | Background color applied to highlighted team rows.                  |
| `fontColorOverride`  | `"#FFFFFF"`                 | Override all font colors. Set to `null` to use existing CSS scheme. |
| `darkMode`           | `null`                      | `null` = auto, `true` = force dark, `false` = force light.          |
| `opacityOverride`    | `null`                      | Override table opacity. Set to `1.0` for full opacity.              |

#### Cycling Options

| Option                  | Default       | Description                                                     |
| :---------------------- | :------------ | :-------------------------------------------------------------- |
| `autoCycle`             | `false`       | Automatically rotate through selected leagues.                  |
| `cycleInterval`         | `15000` (15s) | Time (ms) to display each league when cycling.                  |
| `autoCycleWcSubtabs`    | `true`        | Auto-cycle through World Cup sub-tabs (groups / knockouts).     |
| `wcSubtabCycleInterval` | `15000`       | Time (ms) to display each World Cup sub-tab.                    |

#### Tournament Specific (UEFA European League Competitions)

| Option            | Default                                   | Description                                         |
| :---------------- | :---------------------------------------- | :-------------------------------------------------- |
| `showUEFAleagues` | `false`                                   | Show UEFA competition tabs in the league switcher.  |
| `showUEFAnockouts`| `["Playoff","Rd16","QF","SF","Final"]`    | UEFA knockout stages to display.                    |

#### Tournament Specific (World Cup 2026)

| Option                 | Default                                      | Description                                                     |
| :--------------------- | :------------------------------------------- | :-------------------------------------------------------------- |
| `showWC2026`           | `false`                                      | Show World Cup 2026 in the league switcher.                     |
| `onlyShowWorldCup2026` | `false`                                      | Force the module into dedicated World Cup-only mode.            |
| `showWC2026Groups`     | `["A","B","C","D","E","F","G","H","I","J","K","L"]` | Array of group letters to display.                       |
| `showWC2026Knockouts`  | `["Rd32","Rd16","QF","SF","TP","Final"]`     | Knockout rounds to show.                                        |
| `defaultWCSubTab`      | `"A"`                                        | Tab to focus on at start-up (e.g. `"A"`, `"Final"`).           |
| `displayAllTabs`       | `false`                                      | Show all tabs regardless of stage completion.                   |
| `useMockData`          | `false`                                      | Use built-in mock data for testing (World Cup 2026 only).       |

#### Accessibility Options

| Option                    | Default | Description                                                                                                                                   |
| :------------------------ | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `enhancedIndicatorShapes` | `true`  | `true` = shape-coded form tokens (circle = W, square = D, triangle = L). `false` = no background; colored text only (W = green, D = grey, L = red). |

#### Advanced Customization Options

| Option                   | Default    | Description                                                                                                         |
| :----------------------- | :--------- | :------------------------------------------------------------------------------------------------------------------ |
| `tableDensity`           | `"normal"` | Row spacing: `"compact"` (dense), `"normal"` (balanced), or `"comfortable"` (spacious).                            |
| `theme`                  | `"auto"`   | Color theme: `"auto"` (system preference), `"light"`, or `"dark"`.                                                 |
| `fixtureDateFilter`      | `null`     | Filter fixtures by date: `null` (all), `"today"`, `"week"`, `"month"`, or `{start: "YYYY-MM-DD", end: "YYYY-MM-DD"}`. |
| `customTeamColors`       | `{}`       | Custom row background colors per team: `{"Celtic": "#00A650"}`.                                                     |
| `enableVirtualScrolling` | `false`    | Performance optimisation for large tables (30+ rows).                                                               |
| `virtualScrollThreshold` | `30`       | Row count before virtual scrolling activates.                                                                       |

## ⚽ Available Leagues

Use these codes in your `selectedLeagues` array:

- **UK**: `SCOTLAND_PREMIERSHIP`, `SCOTLAND_CHAMPIONSHIP`, `ENGLAND_PREMIER_LEAGUE`
- **Major Europe**: `GERMANY_BUNDESLIGA`, `SPAIN_LA_LIGA`, `ITALY_SERIE_A`, `FRANCE_LIGUE1`, `NETHERLANDS_EREDIVISIE`
- **Other Europe**: `PORTUGAL_PRIMEIRA_LIGA`, `BELGIUM_PRO_LEAGUE`, `TURKEY_SUPER_LIG`, `GREECE_SUPER_LEAGUE`, `AUSTRIA_BUNDESLIGA`, `CZECH_LIGA`, `DENMARK_SUPERLIGAEN`, `NORWAY_ELITESERIEN`, `SWEDEN_ALLSVENSKAN`, `SWITZERLAND_SUPER_LEAGUE`, `UKRAINE_PREMIER_LEAGUE`, `ROMANIA_LIGA_I`, `CROATIA_HNL`, `SERBIA_SUPER_LIGA`, `HUNGARY_NBI`, `POLAND_EKSTRAKLASA`
- **International/UEFA**: `UEFA_CHAMPIONS_LEAGUE`, `UEFA_EUROPA_LEAGUE`, `UEFA_EUROPA_CONFERENCE_LEAGUE`, `WORLD_CUP_2026`

## 🛡️ Security: Content Security Policy (CSP)

For MagicMirror deployments running in security-restricted environments (enterprise kiosks, embedded displays), add these CSP directives:

| Directive | Value |
| :-------- | :---- |
| `script-src` | `'self'` |
| `img-src` | `'self' data:` |
| `connect-src` | `'self' https://www.bbc.co.uk https://www.fifa.com` |
| `style-src` | `'self' 'unsafe-inline'` |

```
Content-Security-Policy: default-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self' https://www.bbc.co.uk https://www.fifa.com; style-src 'self' 'unsafe-inline';
```

> **Note**: All network requests are made server-side by `node_helper.js`. No external scripts or fonts are loaded by this module. See [Advanced Customization](./documentation/Advanced_Customization.md) for full CSP details.

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
- **[Final Review](./Final_Review.md)**: Final implementation review. ( Not yet compliled)
- **[License](./LICENSE)**: MIT License details.

### Acknowledgments

Thanks to the MagicMirror community for inspiration and guidance!
Thanks to the BBC for providing free access to their sports pages.

### License

MIT
