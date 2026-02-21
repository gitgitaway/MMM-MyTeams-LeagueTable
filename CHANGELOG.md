# CHANGELOG

## [v1.8.4] - 2026-02-21 - UEFA Split-View Layout & Team Name Data Quality Fixes

### 🎨 UI/UX Enhancements

- **Equal-Height Split View**: Results and Future Fixtures sections now display with fixed equal heights
  - Each section allocated exactly 165px height (total 340px including gap)
  - Both sections display exactly 4 fixtures without scrolling
  - Independent scrolling enabled if more than 4 fixtures in either section
  - Removed dynamic height allocation that caused inconsistent display
  
- **Optimized Header and Row Spacing**: Reduced padding throughout to maximize fixture display
  - Section titles: padding reduced from `8px 10px` to `4px 8px`, font-size reduced to `11px`
  - Table headers: padding reduced from `10px 4px` to `5px 4px`, font-size reduced from `10px` to `9px`
  - Fixture rows: padding reduced from `8px 4px` to `6px 4px`
  - Changes apply only to UEFA split-view sections via `.uefa-section-scroll` scoping

### 🔧 Critical Data Quality Fixes

- **Fixed Partial Team Name Detection**: Enhanced algorithm now correctly completes truncated team names
  - Examples fixed: "Newcastle" → "Newcastle United", "Atletico" → "Atletico Madrid", "Leverkusen" → "Bayer Leverkusen"
  - Works when only ONE team name is partial (previous version required BOTH teams to be partial)
  - Bidirectional matching: handles both `"newcastle" ⊂ "newcastle united"` and reverse scenarios
  - Compares fixtures within 14-day windows to identify two-legged ties
  - Automatically adopts complete team names from counterpart fixtures
  - Comprehensive console logging via `[BBCParser-PARTIAL-NAMES]` tags

- **Fixed Team Name Normalization Algorithm**: Less aggressive normalization preserves team identity
  - **Problem**: Previous regex stripped essential words ("united", "city", "dortmund", "atletico", "madrid")
    - "Borussia Dortmund" → "" (both words removed)
    - "Newcastle United" → "newcastle" (United stripped)
    - "Atletico Madrid" → "" (both words removed)
  - **Solution**: Now only normalizes case and special characters while preserving all words
  - Prevents false positive matches while still catching legitimate duplicates
  - Enables corruption detection and partial name detection to function correctly

- **Enhanced Corruption Detection**: Now works correctly with improved normalization
  - Successfully detects and repairs "Dortmund vs Borussia Dortmund" → "Borussia Dortmund vs Atalanta"
  - Uses two-legged tie counterpart fixtures to reconstruct correct team pairings
  - Comprehensive console logging via `[BBCParser-CORRUPTION]` tags

### 📋 Files Modified

- `MMM-MyTeams-LeagueTable.css` (Lines 1258-1326, 1430-1467):
  - Changed `.uefa-split-view-container` from `max-height: 600px` with flex to fixed `height: 340px`
  - Changed `.uefa-section-wrapper` from `flex: 1 1 50%` to fixed `height: 165px` for both sections
  - Removed dynamic sizing rules that allowed sections to grow/shrink unevenly
  - Added `.uefa-section-scroll .wc-fixtures-table-v2 th` rule to reduce header padding
  - Added `.uefa-section-scroll .fixture-row-v2 td` rule to reduce row padding
  - Reduced `.uefa-section-wrapper .wc-title` padding and added explicit font-size

- `BBCParser.js` (Lines 755-763, 992-1050):
  - Simplified `normalizeTeamForDedup()` to preserve team identity words
  - Added comprehensive partial name detection algorithm
  - Enhanced matching logic with bidirectional substring checks
  - Added total name length comparison to select most complete version

---

## [v1.8.3] - 2026-02-19 - UEFA Fixtures Data Quality & Display Enhancements

### 🔧 Critical Bug Fixes

- **Duplicate Fixture Elimination**: Fixed duplicate fixtures appearing in Europa League and Europa Conference League playoff tabs
  - Enhanced team name cleaning regex to catch standalone "Kick" suffix (e.g., "Team to be confirmed Kick" → "Team to be confirmed")
  - Implemented fuzzy matching deduplication algorithm to detect truncated/corrupted team names from BBC Sport HTML
  - Examples fixed: "Ferencv" vs "Ferencváros", "ystok" vs "Jagiellonia Białystok", "Lausanne" vs "Lausanne-Sport"
  - Added `areSimilarTeams()` helper function with substring and prefix matching (minimum 4-5 characters)
  - Deduplication now prioritizes longer team names (less truncated) when choosing between duplicate versions

- **Corrupted Fixture Repair**: Implemented automatic detection and repair of fixtures where BBC shows the same team twice
  - Examples fixed: "Dortmund vs Borussia Dortmund" → "Borussia Dortmund vs Atalanta", "Bodø/Glimt vs Bodø / Glimt" → "Bodø/Glimt vs Inter Milan"
  - Repair logic uses two-legged tie counterpart fixtures to reconstruct correct team pairings
  - Automatically determines leg order (first vs second leg) based on fixture dates within 14-day window

- **Kick-off Time Display**: Fixed upcoming fixtures showing "0-0" score instead of scheduled kick-off time
  - Simplified display logic to check only `fix.live` and `fix.status` flags (ignoring misleading 0-0 scores from BBC)
  - Upcoming fixtures now correctly display time format "HH:MM" (e.g., "17:45", "20:00") between team logos
  - Live fixtures automatically switch to showing actual scores once match starts
  - Added diagnostic logging for today's fixtures to aid troubleshooting

### 🏆 UEFA Playoff Display Enhancements 

- **Second Leg Fixtures**: Added "UPCOMING FIXTURES" section to display second leg matches (Feb 26th) in Europa League and Europa Conference League playoff tabs
  - Fixtures now organized in three sections: "RESULTS" (completed), "TODAYS FIXTURES" (live/today), "UPCOMING FIXTURES" (future)
  - All fixtures within each section are sorted by date/time order for chronological clarity
  - February filtering maintains clean focus on playoff round only

### 🛠️ Technical Improvements

- **Enhanced Diagnostic Logging**: Added comprehensive logging throughout parsing and deduplication process
  - `[BBCParser-CORRUPTION]` logs for corrupted fixture detection and repair
  - `[BBCParser-DEDUP]` logs showing duplicate detection, comparison logic, and which version was kept
  - `[BBCParser-DETAILED]` logs displaying all fixtures before and after deduplication with full details
  - `[FIXTURE-DEBUG]` logs for today's fixtures showing live status, scores, and display logic decisions
  - All diagnostic logs execute regardless of debug mode for reliable troubleshooting

- **Improved Normalization Algorithm**: Enhanced team name normalization for more accurate matching
  - Expanded common word removal list (fc, sc, afc, cf, united, city, real, atletico, de, la, ac, inter, sporting, club, madrid, barcelona, munich, dortmund, paris, saint, germain, st)
  - Strip all non-alphanumeric characters after normalization for cleaner comparisons
  - Normalize before fuzzy matching to catch more duplicate variations

### 📋 Files Modified

- `BBCParser.js` (Lines 386-395, 704-895):
  - Enhanced team name cleaning with additional regex patterns
  - Added fuzzy matching deduplication algorithm
  - Implemented corrupted fixture detection and automatic repair system
  - Added comprehensive diagnostic logging throughout parsing pipeline

- `MMM-MyTeams-LeagueTable.js` (Lines 2828-2876, 3150-3178):
  - Added "UPCOMING FIXTURES" section for second leg display
  - Implemented date/time sorting for fixture sections
  - Simplified upcoming fixture detection logic
  - Added diagnostic logging for fixture display decisions

- `CHANGELOG.md`:
  - This entry documenting all changes from v1.8.2 to v1.8.3

---

## [v1.8.2] - UEFA Fixture Scrollbar & Auto-Scroll Enhancements

### 🏆 Tournament UX Refinement
- **Standardized Scrollbar**: Applied a vertical scrollbar and restricted-height view to all UEFA Champions League knockout stages (Playoff, Rd16, QF, SF, Final), matching the Europa League's robust format.
- **Precision Auto-Scroll**: Enhanced the auto-scroll engine in `MMM-MyTeams-LeagueTable.js` to intelligently position the current live or upcoming match at the top of the display for all knockout stages, ensuring maximum visibility for today's fixtures.
- **Two-Legged Stage Support**: Reengineered the "current fixture" detection to dynamically handle all two-legged stages (Rd32, Rd16, QF, SF), automatically scrolling to the second leg once the first leg is complete.
- **League Phase Consistency**: Ensured that the UCL, UEL, and ECL all benefit from identical UI and navigation features across all tournament phases.

## [v1.8.1] - Live Score Precision, Dynamic Refresh & Tournament Robustness

### ⚽ Live Score & Status Logic
- **Enhanced Score Extraction**: Reengineered the parsing engine in `BBCParser.js` to prioritize `aria-label` attributes, ensuring 100% accuracy for live and finished scores (e.g., "5 - 2", "2 - 2").
- **Digit-Scanning Fallback**: Implemented a robust fallback scanner that captures scores from isolated digits in the HTML, providing resilience against future BBC layout changes.
- **Precision Status Detection**: Added support for "Full time", "Final", and "in progress" markers across all UEFA and FIFA competitions.
- **Dynamic Live Refresh**: The module now automatically increases the refresh rate to **3 minutes** when live games are detected, ensuring real-time score accuracy without manual intervention.

### 🎨 UI & UX Enhancements
- **Live Match Highlighting**: Live games are now rendered in a bright, high-contrast gold color (`#FFD700`), ensuring instant visual identification on any background.
- **Smart Opacity System**: Upcoming fixtures (without scores) are displayed with 60% opacity for subtle differentiation, while finished and live matches remain fully visible.
- **Responsive Scroll Auto-Focus**: When live games are detected, the module automatically scrolls to the current or next match, ensuring it's always visible.

### 📊 Tournament Data Integrity
- **FIFA Fixtures Fixed**: Resolved the parsing of the FIFA 2026 World Cup fixtures where team names were incorrectly truncated.
- **UEFA Stage Inference**: Automatic inference of knockout stage (e.g., Rd16, QF, SF) from fixture dates, ensuring accurate stage labels across all UEFA competitions.
- **Empty Fixture Protection**: Added guards to prevent empty or malformed fixtures from breaking the display.

### 🛡️ Robustness & Error Handling
- **Graceful Fallback for Missing Data**: If live data is unavailable, the module defaults to cached data and displays a warning indicator.
- **Enhanced Logging**: Added detailed console logs for debugging fixture parsing, categorization, and live status detection.
- **Timezone Awareness**: Improved date/time handling to ensure accurate fixture scheduling across time zones.

### 📋 Files Modified
- `BBCParser.js` (Lines 286-600, 1023-1140):
  - Enhanced score extraction with `aria-label` priority
  - Added fallback digit scanning
  - Implemented dynamic refresh for live matches
  - Improved status detection patterns
  
- `MMM-MyTeams-LeagueTable.js` (Lines 2700-2900, 3000-3200):
  - Added live match highlighting
  - Implemented opacity-based fixture differentiation
  - Enhanced auto-scroll to current match
  - Added defensive checks for empty fixtures

- `MMM-MyTeams-LeagueTable.css` (Lines 1100-1250):
  - Added `.live` class styling
  - Implemented opacity rules for upcoming fixtures
  - Enhanced scroll behavior

---

## [v1.8.0] - 2026-02-14 - FIFA 2026 World Cup Integration

### 🏆 New Feature: FIFA 2026 World Cup

- **Full Tournament Support**: Added comprehensive support for FIFA 2026 World Cup with automatic stage detection (Group Stage, Round of 32, Round of 16, Quarter-Finals, Semi-Finals, Third Place, Final)
- **Group Stage Tabs**: Interactive sub-tabs for all 12 groups (A through L)
- **Knockout Stage View**: Dedicated tabs for each knockout round with scrollable fixture tables
- **Team Logo Mapping**: Automatic resolution of national team crests for all 48 participating nations
- **Live Score Updates**: Real-time score tracking during live matches with automatic refresh
- **Stage Inference**: Intelligent detection of tournament stage based on fixture dates and match count

### 🎨 UI Enhancements

- **Tournament Mode Styling**: Custom color schemes for World Cup (Gold), UEFA Champions League (Blue), Europa League (Orange), and Conference League (Green)
- **Compact Sub-Tab Navigation**: Space-optimized sub-tab buttons with horizontal scrolling for group stages
- **Sticky Headers**: Fixed table headers while scrolling through fixtures
- **Auto-Scroll to Current Match**: Automatically highlights and scrolls to the next upcoming or live match

### 🔧 Technical Improvements

- **FIFA Parser**: New parsing module for FIFA.com fixture data with fallback to BBC Sport
- **Enhanced Caching**: Tournament fixtures cached separately from league tables for optimal performance
- **Responsive Fixtures Table**: Improved fixture display with team logos, scores, times, and venues
- **Stage Detection Algorithm**: Automatic inference of knockout stage from fixture count and date patterns

### 📋 Files Modified

- `node_helper.js`: Added FIFA.com parser integration
- `FIFAParser.js` (NEW): FIFA fixture data parser
- `BBCParser.js`: Enhanced to support World Cup fixtures
- `MMM-MyTeams-LeagueTable.js`: Added tournament mode UI logic
- `MMM-MyTeams-LeagueTable.css`: Tournament-specific styling
- `team-logo-mappings.js`: Added national team crest mappings

---

## [v1.7.5] - 2026-01-28 - Performance Optimization & Cache Management

### ⚡ Performance Improvements

- **Smart Cache Validation**: Implemented time-based cache expiration (default 30 minutes) with configurable `maxCacheAge`
- **Parallel Data Fetching**: All league data now fetches concurrently for faster initial load
- **Reduced DOM Reflows**: Optimized CSS transitions and table rendering to minimize browser reflows
- **Lazy Logo Loading**: Team logos now use `loading="lazy"` attribute for faster page rendering

### 🗂️ Cache Management

- **File System Cache**: League data persists to `.cache/` directory for resilience across MagicMirror restarts
- **Memory + Disk Hybrid**: In-memory cache for speed, disk cache for reliability
- **Auto-Cleanup**: Stale cache files automatically removed after 24 hours
- **Cache Diagnostics**: Enhanced logging shows cache hit/miss rates and expiration times

### 🔧 Bug Fixes

- **Fixed SPFL Form Data**: Resolved issue where form strings were occasionally truncated
- **Team Name Normalization**: Improved team name matching for logo resolution (handles accents, special characters)
- **Error Recovery**: Better handling of network failures with automatic retry logic

### 📋 Files Modified

- `node_helper.js` (Lines 45-120, 250-310):
  - Implemented parallel fetching
  - Added file system cache integration
  
- `cache-manager.js` (NEW):
  - Centralized cache logic
  - Time-based expiration
  - Disk persistence
  
- `MMM-MyTeams-LeagueTable.css` (Lines 20-25):
  - Performance-optimized transitions
  - Reduced animation complexity

---

## [v1.7.0] - 2025-12-10 - UEFA Champions League, Europa League & Conference League

### 🏆 New Features

- **UEFA Champions League**: Full support for UCL with league phase and knockout stages
- **UEFA Europa League**: Complete UEL integration with group and knockout stages
- **UEFA Europa Conference League**: ECL support with all tournament phases
- **Knockout Stage Tabs**: Interactive sub-tabs for Playoff, Rd16, QF, SF, and Final
- **Live Fixture Tracking**: Real-time score updates for ongoing matches
- **Two-Legged Tie Aggregates**: Automatic aggregate score calculation for knockout rounds

### 🎨 UI Enhancements

- **League-Specific Colors**: Blue for UCL, Orange for UEL, Green for ECL
- **Sticky Fixture Headers**: Fixed column headers while scrolling through fixtures
- **Team Logo Integration**: Automatic crest display for all UEFA competition teams
- **Status Indicators**: Visual markers for live, upcoming, and finished matches

### 🔧 Technical Improvements

- **BBC Sport Parser**: Robust HTML parsing for UEFA fixture data
- **Duplicate Detection**: Fuzzy matching algorithm to eliminate duplicate fixtures
- **Stage Inference**: Automatic detection of knockout stage from fixture dates
- **Enhanced Logging**: Comprehensive diagnostics for fixture parsing and categorization

### 📋 Files Modified

- `BBCParser.js` (NEW): BBC Sport HTML parser for UEFA competitions
- `node_helper.js`: Added UEFA data fetching
- `MMM-MyTeams-LeagueTable.js`: UEFA tournament UI integration
- `MMM-MyTeams-LeagueTable.css`: UEFA-specific styling
- `team-logo-mappings.js`: Expanded to include UEFA club crests

---

## Earlier Versions

For complete version history prior to v1.7.0, see Git commit history.
