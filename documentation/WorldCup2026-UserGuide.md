# FIFA World Cup 2026 User Guide

Welcome to the **FIFA World Cup 2026** edition of the `MMM-MyTeams-LeagueTable` module. This guide provides a comprehensive overview of the tournament participants, group structures, and qualification details.

## New: Automatic Sub-tab Cycling and Stage Progression

This module now supports automatic cycling of World Cup sub-tabs and dynamic progression between stages.

### How It Works

- When WORLD_CUP_2026 is the active league and auto-cycling is enabled:
  - The default group (config: `defaultWCSubTab`, usually "A") displays for one interval
  - Then the module cycles groups A → L, changing every `wcSubtabCycleInterval` ms
  - When all group standings A–L are complete, group cycling stops and the view switches to "Rd32"
  - During knockout rounds, the module automatically advances the sub-tab once a stage completes, in order:
    Rd32 → Rd16 → QF → SF → TP → Final

### Optimized Fixture Viewing (Rd32)

- **Height Restriction**: For the Round of 32, the fixture list is restricted to show 8 matches at a time. This keeps the module compact while allowing you to scroll through the full 16-match bracket.
- **Intelligent Auto-Scroll**: Once all of the first 8 matches in the Round of 32 are complete (FT), the module automatically scrolls the 9th fixture to the top of the view.

### Configuration Options

- `autoCycle: true`
- `wcSubtabCycleInterval: 15000` (milliseconds; default)
- `defaultWCSubTab: "A"`
- Ensure `showWC2026: true` or include `"WORLD_CUP_2026"` in `selectedLeagues`

Example config snippet:

```
{
  module: "MMM-MyTeams-LeagueTable",
  position: "top_right",
  config: {
    autoCycle: true,
    wcSubtabCycleInterval: 15000,
    showWC2026: true,
    selectedLeagues: ["WORLD_CUP_2026", "ENGLAND_PREMIER_LEAGUE"],
    legacyLeagueToggle: false,
    defaultWCSubTab: "A"
  }
}
```

### Stage Completion Criteria (Heuristics)

- Groups complete when each of groups A–L exists and within each group, all teams have a non-zero `played` count and the `played` values are equal across all teams in that group.
- A knockout stage (Rd32, Rd16, QF, SF, TP, Final) is complete when all fixtures for that stage have a final result indicator in the score string: one of `(FT)`, `(AET)`, or `(PEN)`.

When a stage is complete, the module advances the displayed sub-tab to the next stage automatically.

### Interactions & Tips

- Manual clicking on a sub-tab will immediately switch the displayed content and reset the sub-tab cycling timer.
- If you have multiple leagues enabled and league auto-cycling is on, league cycling continues separately; sub-tab cycling is active only while the World Cup league is showing.
- If `onlyShowWorldCup2026: true`, league cycling is irrelevant and only sub-tabs cycle.
- To pause sub-tab cycling, disable `autoCycle` in your config (cycling obeys the same flag).

### Troubleshooting

- Sub-tabs do not cycle: verify `autoCycle: true` and that WORLD_CUP_2026 is currently displayed. Check `wcSubtabCycleInterval` is set to a sensible value (e.g., 15000).
- Stage does not advance: confirm the data includes final statuses in the score strings for all fixtures in the stage (FT/AET/PEN) and that your data has refreshed since matches ended.
- Cycling too fast/slow: adjust `wcSubtabCycleInterval` to your preference.

---

## Tournament Overview

The 2026 FIFA World Cup will be the first edition to feature **48 nations**, organized into **12 groups of 4 teams each**. The top two teams from each group, along with the eight best third-placed teams, will advance to the new Round of 32.

## Group Stage Participants (A-L)

The following table details the 48 participants as organized by their respective groups.

| Group | Team 1                   | Team 2       | Team 3       | Team 4              |
| :---: | :----------------------- | :----------- | :----------- | :------------------ |
| **A** | Mexico (Host)            | South Africa | South Korea  | _Play-Off D Winner_ |
| **B** | Canada (Host)            | Qatar        | Switzerland  | _Play-Off A Winner_ |
| **C** | Brazil                   | Morocco      | Haiti        | Scotland            |
| **D** | United States (Host)     | Paraguay     | Australia    | _Play-Off C Winner_ |
| **E** | Germany                  | Curaçao      | Ivory Coast  | Ecuador             |
| **F** | Netherlands              | Japan        | Tunisia      | _Play-Off B Winner_ |
| **G** | Belgium                  | Egypt        | IR Iran      | New Zealand         |
| **H** | Spain                    | Cape Verde   | Saudi Arabia | Uruguay             |
| **I** | France                   | Senegal      | Norway       | _Play-Off 2 Winner_ |
| **J** | Argentina (Title Holder) | Algeria      | Austria      | Jordan              |
| **K** | Portugal                 | Uzbekistan   | Colombia     | _Play-Off 1 Winner_ |
| **L** | England                  | Croatia      | Ghana        | Panama              |

## Inter-Confederation Play-offs

Six slots in the final tournament are subject to qualification via the inter-confederation play-offs. These slots are represented by placeholders in the group tables above. 
Playoff qualifies will be updated on completion of the playoff phase.



| Placeholder    | Playoff Pathways     | Participating Countries                                                        | Successor Group | Qualification Date |
| :------------- | :------------------- | :----------------------------------------------------------------------------- | :-------------: | :----------------- |
| **Play-Off A** | CONCACAF / OFC / AFC | Jamaica, New Caledonia, Iraq                                                   |   **Group B**   | March 2026         |
| **Play-Off B** | CONMEBOL / CAF / AFC | Bolivia, DR Congo, Iraq                                                        |   **Group F**   | March 2026         |
| **Play-Off C** | CONCACAF / CONMEBOL  | Jamaica, Bolivia, Suriname                                                     |   **Group D**   | March 2026         |
| **Play-Off D** | CAF / AFC / OFC      | DR Congo, Iraq, New Caledonia                                                  |   **Group A**   | March 2026         |
| **Play-Off 1** | UEFA Path 1          | Italy, Wales, Sweden, Poland, Turkey, Hungary, Ukraine, Greece                 |   **Group K**   | March 2026         |
| **Play-Off 2** | UEFA Path 2          | Denmark, Serbia, Romania, Slovenia, Czech Republic, Slovakia, Albania, Finland |   **Group I**   | March 2026         |

_Note: The inter-confederation play-off tournament will involve six teams (one from each confederation except UEFA, plus one additional team from the host confederation CONCACAF)._

## Module Features for World Cup 2026

The `MMM-MyTeams-LeagueTable` module provides specialized features for tracking the World Cup:

### 1. Dedicated World Cup Mode

Enable the dedicated view in your `config.js`:, this will display only the World Cup 2026 with all other leagues not displayed.

```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  config: {
    onlyShowWorldCup2026: true,
    showWC2026Groups: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"], 
    showWC2026Knockouts: ["Rd32", "Rd16", "QF", "SF", "TP", "Final"]
  }
}
```

### 2. Intelligent Caching

The module employs a **Stale-While-Revalidate** caching strategy. This ensures that group standings, match fixtures, and results are served instantly from the local cache while the background process fetches fresh data from FIFA and BBC Sport.

### 3. Automated Team Mapping

Team logos (crests) are automatically mapped to participating nations, including handling for various naming conventions (e.g., "South Korea" vs "Republic of Korea").

### 4. Real-time Fixtures & Results

Live scores and upcoming fixtures are updated automatically according to your `updateInterval` settings. Fixtures are presented in a professional 3-column centered layout:
- **Date Blocks**: Matches are grouped by date with a dedicated header.
- **Centered Alignment**: Team names and logos are centered around the score or kick-off time.
- **Venue Tracking**: Venue cities are displayed for all World Cup matches, right-aligned to the module's edge with optimized (50% reduced) horizontal padding for better readability on smaller screens.

## Summary of Qualified Nations by Confederation

- **AFC (8.5 Slots)**: Australia, Iran, Japan, Jordan, Qatar, Saudi Arabia, South Korea, Uzbekistan.
- **CAF (9.5 Slots)**: Algeria, Cape Verde, Egypt, Ghana, Ivory Coast, Morocco, Senegal, South Africa, Tunisia.
- **CONCACAF (6.5 Slots)**: Canada (Host), Mexico (Host), United States (Host), Curaçao, Haiti, Panama.
- **CONMEBOL (6.5 Slots)**: Argentina, Brazil, Colombia, Ecuador, Paraguay, Uruguay.
- **OFC (1.5 Slots)**: New Zealand.
- **UEFA (16 Slots)**: Austria, Belgium, Croatia, England, France, Germany, Netherlands, Norway, Portugal, Scotland, Spain, Switzerland.

---

_This guide is maintained automatically based on the latest tournament data._
