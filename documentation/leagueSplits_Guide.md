# European Football League Split Formats — MMM-MyTeams-LeagueTable Guide

This document lists those European Tier 1 and Tier 2 football leagues that employ a mid-season split to maintain competitive balance or manage match calendars. It explains how the module detects, parses, and displays each league's split structure.

---

## 1. Core Mechanics of the Split System

Most leagues following this format use a two-stage approach:

- **Regular Season**: All teams first play each other in a standard round-robin (typically 2 or 3 times).
- **Post-Split Phase**: The table is cut (usually at the midway point) into mini-leagues:
  - **Championship Group**: Compete for the league title and European qualification.
  - **Relegation Group**: Compete to avoid demotion to the lower tier.
- **The Glass Ceiling**: Once the split occurs, teams cannot leave their assigned half. A team in the bottom group can finish with more points than a team in the top group but will still be ranked lower in the final official standings.

---

## 2. Tier 1 (Top Flight) League Formats

| Country | League Name | Regular Season Games | Post-Split Groups | Points Carrying Over | Total Games | Module Status |
|---------|-------------|----------------------|-------------------|----------------------|-------------|---------------|
| Scotland | Scottish Premiership | 33 (12 teams, 3×) | Top 6 / Bottom 6 | All points carry over | 38 | ✅ Configured |
| Romania | Liga I | 30 (16 teams, 2×) | Top 6 / Bottom 10 | Halved (rounded up/down) | 40 (Top) / 39 (Bot) | ✅ Configured |
| Austria | Bundesliga | 22 (12 teams, 2×) | Top 6 / Bottom 6 | Halved (rounded down) | 32 | ✅ Configured |
| Belgium\* | Pro League | 30 (16 teams, 2×) | Top 6 / Mid 6 / Bot 4 | Halved (rounded up) | 40 (Top) / 36 (Bot) | ✅ Configured |
| Switzerland | Super League | 33 (12 teams, 3×) | Top 6 / Bottom 6 | All points carry over | 38 | ✅ Configured |
| Denmark | Superligaen | 22 (12 teams, 2×) | Top 6 / Bottom 6 | All points carry over | 32 | ✅ Configured |
| Serbia | Super Liga | 30 (16 teams, 2×) | Top 8 / Bottom 8 | All points carry over | 37 | ✅ Configured |
| Greece\*\* | Super League | 26 (14 teams, 2×) | Top 4 / Mid 4 / Bot 6 | Mixed (see notes) | 32 (Top/Mid) / 36 (Bot) | ✅ Configured |
| Cyprus | First Division | 26 (14 teams, 2×) | Top 6 / Bottom 8 | All points carry over | 36 (Top) / 33 (Bot) | ✅ Configured |
| Israel | Premier League | 26 (14 teams, 2×) | Top 6 / Bottom 8 | All points carry over | 36 (Top) / 33 (Bot) | ✅ Configured |
| Wales | Cymru Premier | 22 (12 teams, 2×) | Top 6 / Bottom 6 | All points carry over | 32 | ✅ Configured |

\*Note: Belgium is scheduled to abolish the split system and move to an 18-team round-robin starting in the 2026/27 season.

\*\*Note: Greece Super League uses a unique **three-group** Phase 2 format (2025/26):
- **Championship play-offs** (top 4): 6 additional games in a double round-robin. All regular-season points carry over.
- **Europe play-offs** (5th–8th, 4 teams): 6 additional games in a double round-robin. Regular-season points are **halved** (rounded up) before Phase 2 begins.
- **Relegation play-outs** (9th–14th, 6 teams): 10 additional games in a double round-robin. All regular-season points carry over.

The bottom two teams in the Relegation play-outs are relegated.

---

## 3. Tier 2 League Formats

Many nations apply similar logic to their second divisions to manage promotion and relegation drama.

| Country | League Name | Regular Season Games | Post-Split Groups | Points Carrying Over | Total Games |
|---------|-------------|----------------------|-------------------|----------------------|-------------|
| Romania | Liga II | — | Top 6 (Promotion) / Two Bottom 7s (Relegation) | All points carry over | — |
| Israel | Liga Leumit | — | Top 8 / Bottom 8 | Halved | — |
| Belgium | Challenger Pro | — | Promotion Play-offs / Relegation Play-offs | All points carry over | — |
| Bulgaria | Vtora Liga | — | Single table (no split for 2025/26) | N/A | — |

---

## 4. Notable Country Profiles

### Romania (Liga I & II)

**Tier 1:**

- After 30 rounds, the top 6 enter a double round-robin (10 games), while the bottom 10 play a single round-robin (9 games).
- Points are halved before the split; if a team had an odd number of points, the rounded-up half acts as the first tiebreaker at season's end.

**Tier 2:**

- Uses a unique three-way split.
- The top six play 10 additional games for promotion, while the bottom 14 are split into two separate groups of seven (Group A and Group B) to determine relegation.

### Scotland (Premiership)

The SPFL split occurs after 33 games.

- **Fixture Challenges**: To ensure every team plays 19 home and 19 away games, the league uses "seeding" based on previous seasons' standings.
- This occasionally results in teams playing certain opponents three times at home and only once away.

### Austria (Bundesliga)

The most aggressive point-reduction system.

- Halving points after 22 games ensures that even a 10-point lead can be cut to 5 overnight, often keeping the title race alive until the final day.

### Switzerland (Super League)

12 teams play each other 2.5 times (33 games) in Phase 1. The top 6 enter the Meisterrunde (Championship Group) and bottom 6 enter the Abstiegsrunde (Relegation Group) for 5 further games each. All points carry over.

### Serbia (Super Liga)

16 teams play each other home and away twice (30 games) in Phase 1. The top 8 enter the Championship Group and bottom 8 enter the Relegation Group for 7 further games each. All points carry over.

### Greece (Super League)

14 teams play a double round-robin (26 games). Phase 2 splits into three groups — see footnote \*\* in the table above. The mixed points-carryover rule (halved only for the Europe play-offs group) is unique among European top flights.

### Cyprus (First Division)

14 teams play a double round-robin (26 games). Top 6 enter the Championship Round; bottom 8 enter the Relegation Round. All points carry over into Phase 2.

### Israel (Premier League)

Identical format to Cyprus First Division. 14 teams, 26-game Phase 1, then top 6 Championship Round and bottom 8 Relegation Round. All points carry over.

### Ukraine (Premier League)

While historical formats included a 6/6 split, the 2025/26 season operates with 16 teams in a standard 30-game double round-robin format **without** a mid-season split.

---

## 5. Module Implementation Details

The module handles split-league seasons using the `LEAGUE_SPLITS` configuration object inside `MMM-MyTeams-LeagueTable.js`. Key properties for each entry:

| Property | Purpose |
|----------|---------|
| `regularSeasonGames` | Total games played in Phase 1 before the split triggers |
| `championshipSize` | Number of teams in the top/Championship group |
| `relegationSize` | Number of teams in the bottom/Relegation group |
| `pointsCarryover` | `"all"`, `"halved"`, or `"mixed"` — how points transfer to Phase 2 |
| `showAllGroups` | When `true`, renders all groups side-by-side in the UI |
| `groups` | Array of group definitions with labels and keyword matchers |
| `championshipKeywords` | Keywords used to identify the Championship group table heading |
| `relegationKeywords` | Keywords used to identify the Relegation group table heading |
| `preferGroup` | Which group to prefer when only one can be shown |

### Awaiting Split Detection

When the module detects that Phase 1 is complete (games played ≥ `regularSeasonGames`) but no split group headings have been found yet (the league has not yet published Phase 2 assignments), it sets an `awaitingSplit` flag on the data object. The UI then displays an **⏳ AWAITING SPLIT** badge in the header instead of showing a data error.

### Parsing Robustness (v2.6.0 Update)

To handle the complexity of modern sports sites (especially BBC Sport), the parsing engine includes several resilience features:

- **2000-Character Heading Lookback**: The parser scans up to 2000 characters of HTML preceding a table to find group labels, ensuring labels are found even when buried behind complex navigation menus or ARIA wrappers.
- **Strategy Supplementing**: If traditional HTML `<table>` elements only provide partial data (common in Belgium), the module automatically supplements the results by scanning for modern div-based ARIA row structures.
- **Size-Based Partitioning**: As a final fallback, if heading detection fails but the total number of teams found matches the expected split configuration exactly (e.g., 6+6+4 for Belgium), the module partitions the teams sequentially based on configured group sizes.
- **Form-Token Bypass**: Split-phase data is marked as complete even if it lacks form tokens (W/D/L bubbles), as many providers omit these on Phase 2 sub-pages.

---

## 6. Promotion/Relegation Play-offs

This section details how split systems above culminate in Promotion/Relegation Play-offs, where Tier 1 and Tier 2 teams often face off directly to decide who stays up and who goes down.

### 6.1 The Tier 1 vs. Tier 2 "Battle"

Most of these countries do not use a simple "bottom three down, top three up" rule. Instead, the final spot is often decided by a high-stakes playoff.

| Country | Tier 1 Position | Tier 2 Position | Playoff Format |
|---------|-----------------|-----------------|----------------|
| Germany | 16th (of 18) | 3rd (of 18) | Two-legged home & away playoff |
| Scotland | 11th (of 12) | 2nd, 3rd, 4th | Tier 2 mini-tournament; winner plays Tier 1 |
| Austria | 12th (last) | 1st | Direct swap (no playoff) |
| Belgium | 13th & 14th | 3rd (via playoffs) | Tier 1 team faces Tier 2 playoff winner |
| Romania | 13th & 14th | 3rd & 4th | Two separate two-legged playoffs |

### 6.2 Specific Country Breakdowns

#### Scotland — The "Gauntlet" System

The Scottish Premiership uses a knockout ladder:

1. **Quarter-final**: 3rd in Tier 2 vs. 4th in Tier 2.
2. **Semi-final**: Winner of above vs. 2nd in Tier 2.
3. **Final**: Winner of above vs. 11th in Tier 1 (Premiership).

> Note: This heavily favours the Tier 1 team, as the Tier 2 challenger often plays 4 games in 10 days before the final.

#### Romania — The Mixed Play-off

Because the Tier 1 "Relegation Group" has 10 teams:

- The bottom two (15th and 16th) are relegated instantly.
- The 13th and 14th placed teams enter a two-legged playoff against the 3rd and 4th placed teams from Tier 2.

#### Belgium — The "Challenger" Path

Belgium's system is notoriously complex:

- The bottom four of Tier 1 play a "Relegation Play-off" mini-league.
- The survivor of that group often faces the winner of the Tier 2 (Challenger Pro League) promotion playoffs to secure their spot for the next season.

#### Austria — The European "Wildcard"

While the bottom team is relegated directly, Austria uses the split to give bottom-half teams a chance at Europe:

- The winner of the Relegation Group (7th place) plays a knockout match against the lowest European-qualified team from the Championship Group.
- The winner gets the final UEFA Conference League spot.

### 6.3 Key Rules to Remember

- **Away Goals**: Most European leagues have abolished the away goals rule in these playoffs (matching UEFA's 2021 decision). If tied after two legs, they go straight to extra time and penalties.
- **VAR**: In many countries (like Scotland and Romania), VAR is implemented for the Play-off Finals even if it wasn't used throughout the regular Tier 2 season.

---

## 7. Screenshots

> Screenshots showing the module during and after a split are stored in the `screenshots/` directory at the module root.

| Screenshot | Description |
|------------|-------------|
| `screenshots/split-championship-group.png` | Module displaying the Championship group table after the Scottish Premiership split |
| `screenshots/split-relegation-group.png` | Module displaying the Relegation group table |
| `screenshots/split-both-groups.png` | Both groups displayed simultaneously with labelled separators (`showAllGroups: true`) |
| `screenshots/awaiting-split-badge.png` | The **⏳ AWAITING SPLIT** badge shown in the header when Phase 1 is complete but Phase 2 has not yet been announced |
| `screenshots/greece-three-groups.png` | Greece Super League's unique three-group Phase 2 view (Championship + Europe + Relegation) |

---

*Last updated: 2026-04-16 — reflects module v2.6.x and above.*
