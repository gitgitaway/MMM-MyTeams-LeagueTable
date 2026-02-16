# European Leagues Configuration Guide

## Overview

The **MMM-MyTeams-LeagueTable** module now supports configurable selection of **any European nation's top-tier men's professional football league**, plus UEFA competitions. Users can easily enable/disable specific leagues via configuration.

## Quick Start

### Method 1: New Configuration System (Recommended)

The recommended approach uses the `selectedLeagues` array to specify which leagues to display:

```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  position: "top_left",
  header: "Football Standings",
  config: {
    // ===== NEW: Use selectedLeagues array =====
    selectedLeagues: [
      "SCOTLAND_PREMIERSHIP",
      "GERMANY_BUNDESLIGA",
      "FRANCE_LIGUE1",
      "SPAIN_LA_LIGA",
      "ITALY_SERIE_A"
    ],
    
    // Display options (same as before)
    maxTeams: 20,
    showTeamLogos: true,
    showForm: true,
    autoCycle: true,
    cycleInterval: 15 * 1000
  }
}
```

**Why use this method?**
- ✅ Simple, declarative configuration
- ✅ Easy to add/remove leagues
- ✅ No legacy cruft
- ✅ Supports any number of leagues
- ✅ Future-proof

### Method 2: Legacy Configuration (Backward Compatible)

For existing configurations, the module still supports the old `showXXX` toggles:

```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  position: "top_left",
  config: {
    // Keep legacy mode enabled (default: true)
    legacyLeagueToggle: true,
    
    // Old configuration style still works
    showSPFL: true,
    showEPL: false,
    showUCL: true,
    showUEL: true,
    showECL: false
  }
}
```

**Note:** If you provide `selectedLeagues` with non-empty values, the legacy toggles are ignored.

---

## Available League Codes

### All Supported Leagues

| Country | League Code | Display Name | Region |
|---------|-------------|--------------|--------|
| **Scandinavia** |
| Norway | `NORWAY_ELITESERIEN` | Eliteserien | Scandinavia |
| Sweden | `SWEDEN_ALLSVENSKAN` | Allsvenskan | Scandinavia |
| Denmark | `DENMARK_SUPERLIGAEN` | Superligaen | Scandinavia |
| **Central Europe** |
| Germany | `GERMANY_BUNDESLIGA` | Bundesliga | Central Europe |
| Austria | `AUSTRIA_BUNDESLIGA` | Austrian Bundesliga | Central Europe |
| Czech Republic | `CZECH_LIGA` | Czech Liga | Central Europe |
| Hungary | `HUNGARY_NBI` | Hungarian NB I | Central Europe |
| Poland | `POLAND_EKSTRAKLASA` | Ekstraklasa | Central Europe |
| Switzerland | `SWITZERLAND_SUPER_LEAGUE` | Swiss Super League | Central Europe |
| **Western Europe** |
| France | `FRANCE_LIGUE1` | Ligue 1 | Western Europe |
| Netherlands | `NETHERLANDS_EREDIVISIE` | Eredivisie | Western Europe |
| Belgium | `BELGIUM_PRO_LEAGUE` | Belgian Pro League | Western Europe |
| **Southern Europe** |
| Spain | `SPAIN_LA_LIGA` | La Liga | Southern Europe |
| Italy | `ITALY_SERIE_A` | Serie A | Southern Europe |
| Portugal | `PORTUGAL_PRIMEIRA_LIGA` | Primeira Liga | Southern Europe |
| **Eastern Europe** |
| Ukraine | `UKRAINE_PREMIER_LEAGUE` | Ukrainian Premier League | Eastern Europe |
| Romania | `ROMANIA_LIGA_I` | Liga I | Eastern Europe |
| Croatia | `CROATIA_HNL` | Croatian HNL | Eastern Europe |
| Serbia | `SERBIA_SUPER_LIGA` | Serbian Super Liga | Eastern Europe |
| **Mediterranean** |
| Greece | `GREECE_SUPER_LEAGUE` | Greek Super League | Mediterranean |
| Turkey | `TURKEY_SUPER_LIG` | Turkish Super Lig | Mediterranean |
| **United Kingdom** |
| Scotland | `SCOTLAND_PREMIERSHIP` | Scottish Premiership | UK |
| Scotland | `SCOTLAND_CHAMPIONSHIP` | Scottish Championship | UK |
| England | `ENGLAND_PREMIER_LEAGUE` | English Premier League | UK |
| **UEFA Competitions** |
| Europe | `UEFA_CHAMPIONS_LEAGUE` | UEFA Champions League | Europe |
| Europe | `UEFA_EUROPA_LEAGUE` | UEFA Europa League | Europe |
| Europe | `UEFA_EUROPA_CONFERENCE_LEAGUE` | UEFA Europa Conference League | Europe |

---

## Configuration Examples

### Example 1: Top 5 European Leagues

Display the "Big Five" European football leagues:

```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  position: "top_left",
  header: "Top 5 European Leagues",
  config: {
    selectedLeagues: [
      "ENGLAND_PREMIER_LEAGUE",
      "SPAIN_LA_LIGA",
      "FRANCE_LIGUE1",
      "ITALY_SERIE_A",
      "GERMANY_BUNDESLIGA"
    ],
    autoCycle: true,
    cycleInterval: 20 * 1000,
    maxTeams: 10,
    showForm: true
  }
}
```

### Example 2: Scandinavia Focus

Display Nordic leagues:

```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  position: "top_left",
  header: "Nordic Football",
  config: {
    selectedLeagues: [
      "NORWAY_ELITESERIEN",
      "SWEDEN_ALLSVENSKAN",
      "DENMARK_SUPERLIGAEN"
    ],
    autoCycle: true,
    cycleInterval: 18 * 1000
  }
}
```

### Example 3: Mixed Domestic + European

Show specific leagues plus UEFA competitions:

```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  position: "top_left",
  header: "Football Standings",
  config: {
    selectedLeagues: [
      "SCOTLAND_PREMIERSHIP",
      "ENGLAND_PREMIER_LEAGUE",
      "UEFA_CHAMPIONS_LEAGUE",
      "UEFA_EUROPA_LEAGUE"
    ],
    autoCycle: true,
    cycleInterval: 12 * 1000,
    highlightTeams: ["Celtic", "Rangers", "Liverpool"]
  }
}
```

#### UEFA Competition Features
The module includes specialized logic for UEFA Champions League, Europa League, and Conference League:
- **Knockout Stage Navigation**: Automatically separates fixtures into "Playoff" (February) and "Rd16" (March) sub-tabs.
- **Off-Season Detection**: Automatically displays **"awaiting competition draw"** during the summer break (July to late August) when no live data is available.
- **Aggregate Scores**: Automatically displays aggregate totals for second-leg knockout matches.
- **Centered Layout**: Professional fixture presentation with team logos and centered scores.

### Example 4: Central European Leagues

Display Central/Eastern European leagues:

```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  position: "top_left",
  header: "Central European Football",
  config: {
    selectedLeagues: [
      "GERMANY_BUNDESLIGA",
      "AUSTRIA_BUNDESLIGA",
      "CZECH_LIGA",
      "POLAND_EKSTRAKLASA",
      "HUNGARY_NBI"
    ],
    maxTeams: 18,
    autoCycle: true
  }
}
```

---

## Advanced Configuration

### Full Configuration with All Options

```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  position: "top_left",
  header: "Football Standings",
  config: {
    // ===== League Selection =====
    selectedLeagues: [
      "SCOTLAND_PREMIERSHIP",
      "ENGLAND_PREMIER_LEAGUE",
      "GERMANY_BUNDESLIGA",
      "FRANCE_LIGUE1"
    ],
    legacyLeagueToggle: false,  // Disable legacy mode if using selectedLeagues
    
    // ===== Update & Performance =====
    updateInterval: 30 * 60 * 1000,      // Refresh every 30 minutes
    retryDelay: 15000,                   // Retry after 15 seconds on error
    maxRetries: 3,                       // Stop after 3 failed attempts
    
    // ===== Display Customization =====
    maxTeams: 20,                        // Show top 20 teams (0 = show all)
    highlightTeams: ["Celtic", "Hearts"], // Highlight specific teams
    colored: true,                       // Color rows by standing
    scrollable: true,                    // Enable scrolling for long tables
    
    // ===== Animation & Styling =====
    animationSpeed: 2000,                // DOM update animation (ms)
    fadeSpeed: 4000,                     // Fade animation (ms)
    darkMode: null,                      // null=auto, true=force dark, false=force light
    fontColorOverride: "#FFFFFF",        // Override font color
    opacityOverride: null,               // null=auto, set to 1.0 for full opacity
    
    // ===== Column Display Options =====
    showPosition: true,                  // Position number
    showTeamLogos: true,                 // Team logos/crests
    showPlayedGames: true,               // Games played
    showWon: true,                       // Wins
    showDrawn: true,                     // Draws
    showLost: true,                      // Losses
    showGoalsFor: true,                  // Goals for
    showGoalsAgainst: true,              // Goals against
    showGoalDifference: true,            // Goal difference
    showPoints: true,                    // Points
    showForm: true,                      // Recent form (W/D/L)
    formMaxGames: 5,                     // Show last 5 games
    
    // ===== Auto-Cycling (rotate through leagues) =====
    autoCycle: true,                     // Enable cycling
    cycleInterval: 15 * 1000,            // Display each league for 15 seconds
    
    // ===== Team Logo Customization =====
    teamLogoMap: {
      // Add custom mappings - these override default mappings
      "My Team": "my-team-logo.png"
    },
    
    // ===== Debugging =====
    debug: false                         // Set to true for console logging
  }
}
```

---

## Troubleshooting

### Issue: Leagues not showing up

**Solution:** Check that:
1. League codes are spelled correctly (case-sensitive)
2. `selectedLeagues` is an array, not a string
3. If using legacy mode, set `legacyLeagueToggle: true`
4. Enable debug mode: `debug: true` to see what's happening

### Issue: Team logos not displaying

**Solution:**
1. Ensure images exist in `modules/MMM-MyTeams-LeagueTable/images/`
2. Use `teamLogoMap` to map team names to image filenames
3. Check browser console (F12) for image loading errors
4. Fallback placeholder should show if image not found

### Issue: Data not updating

**Solution:**
1. Check internet connection
2. Verify BBC Sport URLs are accessible
3. Increase `updateInterval` if network is slow
4. Enable debug mode and check console for errors
5. Check that selected league codes are valid

### Issue: Module doesn't start

**Solution:**
1. Check module syntax (JavaScript errors in config.js)
2. Verify module path: `modules/MMM-MyTeams-LeagueTable/`
3. Run `npm install` in module directory
4. Restart MagicMirror
5. Check browser console for errors (F12)

---

## Performance Tips

### For Multiple Leagues

- **Use reasonable `maxTeams`:** Fewer teams = faster rendering
- **Extend `updateInterval`:** Reduce server load (30-60 minutes is good)
- **Disable unused features:** Turn off `showForm`, logos, etc. if not needed
- **Use `autoCycle`:** Display changes without fetching new data

### For Slow Networks

- **Increase `retryDelay` and `maxRetries`:** Give BBC more time to respond
- **Increase `updateInterval`:** Less frequent updates
- **Disable `showTeamLogos`:** Images take bandwidth
- **Reduce `maxTeams`:** Smaller tables load faster

---

## Migration from Legacy Config

### Before (Old Style)

```javascript
config: {
  showSPFL: true,
  showEPL: false,
  showUCL: true,
  showUEL: true,
  showECL: false
}
```

### After (New Style)

```javascript
config: {
  selectedLeagues: [
    "SCOTLAND_PREMIERSHIP",
    "UEFA_CHAMPIONS_LEAGUE",
    "UEFA_EUROPA_LEAGUE"
  ]
}
```

**The module automatically supports both formats**, so upgrading is optional. However, the new format is recommended for future-proofing.

---

## API Reference

### League Code Format

League codes follow the pattern:
```
COUNTRY_COMPETITION
```

Examples:
- `SCOTLAND_PREMIERSHIP` - Scottish Premiership
- `GERMANY_BUNDESLIGA` - German Bundesliga
- `FRANCE_LIGUE1` - French Ligue 1
- `UEFA_CHAMPIONS_LEAGUE` - UEFA Champions League

### Data Flow

1. **User Config** → `selectedLeagues: ["SCOTLAND_PREMIERSHIP", ...]`
2. **Module Initialization** → `determineEnabledLeagues()` parses config
3. **URL Resolution** → `getLeagueUrl()` maps codes to BBC Sport URLs
4. **Data Request** → `requestAllLeagueData()` fetches from Node Helper
5. **Parsing** → Node Helper parses HTML and returns standings
6. **Rendering** → Module displays standings with optional cycling

### Helper Functions

#### `determineEnabledLeagues()`
- **Called:** During module startup
- **Purpose:** Parse config and populate `enabledLeagueCodes` array
- **Priority:** selectedLeagues > legacy toggles > default

#### `getLeagueUrl(leagueCode)`
- **Parameter:** League code string
- **Returns:** BBC Sport URL or null
- **Used by:** requestAllLeagueData()

#### `normalizeLeagueCode(code)`
- **Parameter:** Any league code (legacy or new format)
- **Returns:** Standardized league code or null
- **Purpose:** Support both old and new code formats

---

## Contributing

To add support for additional leagues:

1. **Update `european-leagues.js`:**
   - Add league definition with BBC Sport URL
   - Add to appropriate region

2. **Update league URLs in `MMM-MyTeams-LeagueTable.js`:**
   - Add new entry to `urlMap` in `getLeagueUrl()`

3. **Update team logos in `team-logo-mappings.js`:**
   - Add team name → image mappings for new league

4. **Test thoroughly:**
   - Verify data fetches correctly
   - Check HTML parsing works
   - Validate team names and logos

---

## FAQ

**Q: Can I display all European leagues at once?**  
A: Yes, but not recommended - would be very large. Better to use `autoCycle` or select a subset.

**Q: Do I need to edit code to add a league?**  
A: No, all URLs are pre-configured. Just add the league code to `selectedLeagues`.

**Q: Can I use custom team logos?**  
A: Yes, use `teamLogoMap` to override default mappings, or add PNG/SVG files to `images/` directory.

**Q: Is there a limit to how many leagues I can show?**  
A: No hard limit, but performance degrades with many leagues. Recommended: 3-5 leagues.

**Q: How often should I update?**  
A: BBC data updates daily. 30-60 minute intervals recommended to avoid server overload.

**Q: Can I highlight specific teams across multiple leagues?**  
A: Yes, use `highlightTeams` array. Teams are matched by exact name.

---

## Version History

- **v2.0.0** - Added European leagues configuration system
- **v1.0.0** - Initial release (SPFL, EPL, UCL, UEL, ECL only)