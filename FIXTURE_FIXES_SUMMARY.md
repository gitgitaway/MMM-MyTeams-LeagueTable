# UEFA Fixture Display Fixes - Complete Summary

**Last Updated**: 2026-02-21 (v1.8.4)

## Recent Updates (v1.8.4)

### 6. Equal-Height Split View Display
**Problem**: Results and Future Fixtures sections had dynamic heights, causing only 3 of 8 second leg fixtures to be visible without scrolling.

**Root Cause**: Sections used flexible heights (`flex: 1 1 50%`) that adjusted based on content, and headers/rows used excessive padding that limited visible fixtures.

**Solution**: 
- Fixed both sections to exactly 165px height (340px total)
- Each section now displays exactly 4 fixtures without scrolling
- Reduced section title padding from `8px 10px` to `4px 8px` and font-size to `11px`
- Reduced table header padding from `10px 4px` to `5px 4px` and font-size from `10px` to `9px`
- Reduced fixture row padding from `8px 4px` to `6px 4px`
- Independent scrolling available if more than 4 fixtures exist

**File Modified**: `MMM-MyTeams-LeagueTable.css` (Lines 1258-1326, 1430-1467)

### 7. Partial Team Names Not Completed
**Problem**: Fixtures showing incomplete team names like "Newcastle" instead of "Newcastle United", "Atletico" instead of "Atletico Madrid", "Leverkusen" instead of "Bayer Leverkusen".

**Root Cause**: Previous partial name detection required BOTH teams to be partial. Didn't handle cases where only ONE team was incomplete.

**Solution**:
- Enhanced detection algorithm with bidirectional matching (checks both `A ⊂ B` and `B ⊃ A`)
- Works when only one team is partial (other can be exact match)
- Compares all fixtures within 14-day windows to identify two-legged ties
- Selects version with longer total team name length (more complete)
- Examples fixed:
  - "Qarabag vs Newcastle" → "Qarabag vs Newcastle United"
  - "Club Brugge vs Atletico" → "Club Brugge vs Atletico Madrid"
  - "Olympiakos vs Leverkusen" → "Olympiakos vs Bayer Leverkusen"

**File Modified**: `BBCParser.js` (Lines 992-1050)

### 8. Team Name Normalization Too Aggressive
**Problem**: The `normalizeTeamForDedup()` function stripped essential team identity words, making teams unidentifiable:
- "Borussia Dortmund" → "" (both words removed)
- "Newcastle United" → "newcastle" (United stripped)
- "Atletico Madrid" → "" (both words removed)

**Root Cause**: Regex pattern removed common words like "united", "city", "dortmund", "atletico", "madrid" that are essential for team identity.

**Solution**:
- Simplified normalization to only handle:
  - HTML entities (`&amp;` → `&`)
  - Special characters (keeping letters, numbers, spaces)
  - Whitespace normalization
- Preserves all team name words while still enabling comparison
- Enables corruption detection and partial name detection to work correctly

**File Modified**: `BBCParser.js` (Lines 755-763)

---

## Issues Fixed (v1.8.3 and earlier)

### 1. Future Fixtures Appearing in Results Section
**Problem**: Second leg fixtures scheduled for future dates were appearing in the Results section with aggregate scores instead of in the Future Fixtures section with kickoff times.

**Root Cause**: Categorization logic was checking if `homeScore`/`awayScore` fields were defined, but these fields contained aggregate scores for upcoming second leg fixtures, causing incorrect categorization.

**Solution**: Changed categorization to use match status (FT/PEN/AET/LIVE) instead of score presence.

### 2. Fixtures Showing "0-0" Before Kickoff
**Problem**: Upcoming fixtures were displaying "0-0" score before the match started instead of showing the kickoff time.

**Root Cause**: Same as #1 - presence of scores (even if 0-0) triggered Results categorization.

**Solution**: Display logic now checks match status to determine if fixture is upcoming and shows kickoff time for all upcoming fixtures.

### 3. No Live Minutes Displayed
**Problem**: Live matches weren't showing minute markers (e.g., "45'", "HT", "90+2'").

**Root Cause**: Insufficient pattern matching for live minute extraction from BBC HTML.

**Solution**: Enhanced live status detection with multiple fallback patterns to capture minute markers.

### 4. Scores Not Updating During Live Matches
**Problem**: Live scores weren't updating or displaying properly.

**Root Cause**: Live match detection was inconsistent.

**Solution**: Improved `isLive` flag assignment and status detection logic.

### 5. Aggregate Scores Not Showing for Future Second Legs
**Problem**: Second leg fixtures in the Future section didn't display aggregate scores from the first leg.

**Root Cause**: Aggregate score calculation was conditional and didn't always populate the field.

**Solution**: Enhanced calculation logic with fallback to compute aggregate on-the-fly if missing.

---

## Files Modified

### 1. BBCParser.js

#### Change 1: Fixture Categorization Logic (Lines 948-994)
**Before:**
```javascript
const stage1 = dedupedFixtures.filter(f => (f.homeScore !== undefined && f.awayScore !== undefined) || f.live);
const stage2 = dedupedFixtures.filter(f => f.date === today && !stage1.includes(f));
const stage3 = dedupedFixtures.filter(f => f.date > today && !stage1.includes(f));
```

**After:**
```javascript
// Stage 1: Finished matches only (status = FT/PEN/AET)
const stage1 = dedupedFixtures.filter(f => {
    const status = (f.status || "").toUpperCase();
    return status === "FT" || status === "PEN" || status === "AET";
});

// Stage 1b: Live matches (detected by live flag or minute markers)
const stageLive = dedupedFixtures.filter(f => {
    if (f.live === true) return true;
    const status = (f.status || "").toUpperCase();
    return /\d+'|HT|LIVE/i.test(status);
});

// Stage 2: Today's fixtures (not yet started)
const stage2 = dedupedFixtures.filter(f => {
    if (f.date !== today) return false;
    if (stage1.includes(f) || stageLive.includes(f)) return false;
    const status = (f.status || "").toUpperCase();
    const isFinishedOrLive = status === "FT" || status === "PEN" || status === "AET" || 
                            status === "LIVE" || f.live || /\d+'|HT/i.test(status);
    return !isFinishedOrLive;
});

// Stage 3: Future fixtures (scheduled for future dates, not started)
const stage3 = dedupedFixtures.filter(f => {
    if (f.date <= today) return false;
    if (stage1.includes(f) || stageLive.includes(f)) return false;
    const status = (f.status || "").toUpperCase();
    const isFinishedOrLive = status === "FT" || status === "PEN" || status === "AET" || 
                            status === "LIVE" || f.live || /\d+'|HT/i.test(status);
    return !isFinishedOrLive;
});

// Combine finished and live matches for results section
const combinedResults = [...stageLive, ...stage1];
```

#### Change 2: Enhanced Live Match Detection (Lines 450-497)
Added multiple fallback patterns to capture live minute markers:
- Pattern 1: "45'" or "90+3'" (standard minute markers)
- Pattern 2: "HT" or "AET" (half-time, extra time)
- Pattern 3: "X minutes, in progress"
- Pattern 4: Minute numbers near "Live" text
- Added explicit `isLive` flag for better tracking

#### Change 3: Second Leg Aggregate Score Handling (Lines 925-997)
**Key Improvements:**
- Calculates `aggregateScore` field from first leg results
- **CRITICAL**: Clears `homeScore`/`awayScore` fields from upcoming second leg fixtures to prevent misclassification
- Only preserves match scores if the second leg has actually started (has status)
- Adds console logging to track when premature scores are cleared

**Logic:**
```javascript
if (!hasStarted && fixture.homeScore !== undefined && fixture.awayScore !== undefined) {
    // This is an upcoming second leg with scores (likely aggregate being misapplied)
    // Clear the scores to prevent incorrect categorization
    console.log(`[BBCParser] Clearing premature scores from upcoming 2nd leg: ${fixture.homeTeam} vs ${fixture.awayTeam} (${fixture.date})`);
    delete fixture.homeScore;
    delete fixture.awayScore;
    fixture.score = "vs";
}
```

#### Change 4: Updated Data Structure (Lines 996-1009)
Changed `uefaStages.results` to use `combinedResults` (live + finished matches).

---

### 2. MMM-MyTeams-LeagueTable.js

#### Change 1: Extended Staged Approach to All Knockout Rounds (Lines 2814-2893)
**Before**: Only applied to Playoff stage  
**After**: Applied to Playoff, Rd16, QF, and SF stages

**Stage-Month Mapping:**
- Playoff: February (month "02")
- Rd16: March (month "03")
- QF: April (month "04")
- SF: May (month "05")

**Benefits:**
- All UEFA knockout stages now use Results/Today/Future categorization
- Each stage filters fixtures by appropriate month
- Second leg fixtures appear in correct section based on date and status

#### Change 2: Enhanced Aggregate Score Display (Lines 3199-3228)
**Improvements:**
- Shows aggregate score with "agg" prefix: `(agg 2-1)`
- Displays below kickoff time for upcoming fixtures
- Displays below current score for live/finished fixtures
- Adds `upcoming-agg` CSS class for upcoming fixtures (for styling flexibility)
- **Fallback logic**: Calculates aggregate on-the-fly if missing but `isSecondLeg` and `firstLegFixture` data are available

**Display Structure:**
```
Upcoming:
  17:45
  (agg 2-1)

Live:
  3 - 1
  67'
  (agg 5-2)

Finished:
  3 - 1
  FT
  (agg 5-2)
```

---

## How It Works: Complete Flow

### For Upcoming Second Leg Fixtures (e.g., Feb 26, Mar 12):

1. **Parser (BBCParser.js)**:
   - Detects second leg by matching teams within 14 days
   - Calculates `aggregateScore` from first leg result
   - **Clears** `homeScore`/`awayScore` fields if fixture hasn't started
   - Sets `isSecondLeg` and `firstLegFixture` references

2. **Categorization**:
   - Checks if status is FT/LIVE/etc (not just score presence)
   - Upcoming second leg has no status → categorized as "Future"
   - Month-based filtering ensures it appears in correct stage tab

3. **Frontend Display (MMM-MyTeams-LeagueTable.js)**:
   - Identifies fixture as upcoming (no status, not finished, not live)
   - Shows kickoff time in score column
   - Shows aggregate score below kickoff time in brackets

### For Live Second Leg Fixtures:

1. **Parser**:
   - Detects live status ("LIVE", minute markers, "HT", etc.)
   - Preserves current match scores (`homeScore`/`awayScore`)
   - Keeps aggregate score from first leg

2. **Categorization**:
   - Live matches go to `stageLive` array
   - Combined with finished matches in Results section
   - Appears at top of Results with live indicator

3. **Frontend Display**:
   - Shows current match score
   - Shows live minute marker (e.g., "67'", "HT", "90+2'")
   - Shows aggregate score below in brackets

### For Finished Second Leg Fixtures:

1. **Parser**:
   - Detects finished status ("FT", "PEN", "AET")
   - Preserves final match scores
   - Keeps aggregate score

2. **Categorization**:
   - Finished matches go to `stage1` array
   - Combined with live matches in Results section

3. **Frontend Display**:
   - Shows final match score
   - Shows status (e.g., "FT", "PEN")
   - Shows final aggregate score below in brackets

---

## Testing Checklist

### Champions League / Europa League / Conference League

#### Before Fixtures Start (e.g., morning of Feb 24):
- [ ] Fixtures appear in **"Today's Fixtures"** section (not Results)
- [ ] Shows kickoff time (e.g., "17:45") instead of "0-0"
- [ ] Second leg fixtures show aggregate score below time: `(agg X-X)`

#### During Live Matches:
- [ ] Fixtures appear in **"Results"** section at top
- [ ] Shows current match score (updates as goals are scored)
- [ ] Shows live minute marker (e.g., "45'", "HT", "67'", "90+2'")
- [ ] Shows aggregate score below: `(agg X-X)`
- [ ] Live matches have bright/highlighted styling

#### After Matches Finish:
- [ ] Fixtures remain in **"Results"** section
- [ ] Shows final match score
- [ ] Shows "FT" (or "PEN"/"AET") status
- [ ] Shows final aggregate score: `(agg X-X)`

#### Future Second Legs (e.g., Feb 26, Mar 12):
- [ ] Appear in **"Upcoming Fixtures"** section (not Results)
- [ ] Show kickoff time (not "0-0" or aggregate score)
- [ ] Show aggregate score from first leg below time: `(agg X-X)`

#### All Knockout Stages:
- [ ] Playoff (February): Works as above
- [ ] Rd16 (March): Works as above
- [ ] QF (April): Works as above
- [ ] SF (May): Works as above

---

## Stage-Specific Behavior

### Playoff Round (February)
- First legs: Feb 18-20
- Second legs: Feb 24-26
- Both legs use Results/Today/Future categorization
- Aggregate scores shown for all second legs

### Round of 16 (March)
- First legs: Early March
- Second legs: Mid/Late March
- Same categorization logic as Playoff

### Quarter-Finals (April)
- First legs: Early April
- Second legs: Mid/Late April
- Same categorization logic as Playoff

### Semi-Finals (May)
- First legs: Early May
- Second legs: Mid/Late May
- Same categorization logic as Playoff

### Final (Single Match)
- No aggregate scores (one-off match)
- Standard Results/Today/Future display

---

## Technical Details

### Key Data Fields

**Fixture Object:**
```javascript
{
    homeTeam: "Team A",
    awayTeam: "Team B",
    date: "2026-02-26",
    time: "17:45",
    homeScore: undefined,        // Only set if match started
    awayScore: undefined,        // Only set if match started
    aggregateScore: "2-1",       // From first leg (for 2nd leg fixtures)
    score: "vs",                 // Display string
    status: "",                  // "FT", "LIVE", "67'", "HT", etc.
    live: false,                 // Boolean flag
    isSecondLeg: true,           // Detected by parser
    firstLegFixture: {...},      // Reference to first leg
    stage: "Playoff",            // Inferred from date/month
}
```

### Categorization Decision Tree

```
Is status "FT"/"PEN"/"AET"?
├─ YES → Results (Finished)
└─ NO → Is live flag true OR status contains minute marker?
    ├─ YES → Results (Live)
    └─ NO → Is date = today?
        ├─ YES → Today's Fixtures
        └─ NO → Is date > today?
            ├─ YES → Future Fixtures
            └─ NO → (Past fixture, shouldn't appear)
```

### Display Logic Decision Tree

```
Is fixture upcoming? (!live && !finished)
├─ YES → Show kickoff time in score column
│        └─ Is second leg? (aggregateScore present)
│            └─ YES → Show (agg X-X) below time
└─ NO → Show match score
         └─ Is live?
             ├─ YES → Show live minute marker below score
             │        └─ Is second leg? → Show (agg X-X) below
             └─ NO (finished) → Show status (FT/PEN/AET) below score
                                └─ Is second leg? → Show (agg X-X) below
```

---

## Maintenance Notes

### If BBC HTML Structure Changes:
Update the fixture parsing patterns in `BBCParser.js`:
- Score extraction (lines 410-440)
- Status detection (lines 450-497)
- Team name extraction (lines 291-378)

### To Add New Knockout Stages:
1. Add stage to `uefaTwoLeggedStages` array (MMM-MyTeams-LeagueTable.js, line 2817)
2. Add stage-month mapping in `stageMonthMap` (line 2823)
3. Add stage inference logic in `_inferUEFAStage()` (BBCParser.js, line 1081)

### To Adjust Month-Stage Mapping:
Edit `stageMonthMap` in MMM-MyTeams-LeagueTable.js (lines 2823-2828).  
This is useful if UEFA changes the competition calendar.

---

## Known Limitations

1. **Mixed-Month Stages**: If a stage spans multiple months (e.g., Rd16 starts in late Feb and ends in early Mar), the filter uses both month check and explicit stage field check to ensure all fixtures appear.

2. **Aggregate Score Calculation**: Assumes standard two-legged format. Single-match finals don't have aggregate scores.

3. **Status Detection**: Relies on BBC Sport HTML structure. If BBC changes their HTML, parsing patterns may need updates.

4. **Timezone Handling**: Dates are in local timezone. Ensure MagicMirror system time is correct.

---

## Debugging Tips

### If fixtures appear in wrong section:
1. Check console logs for `[BBCParser]` messages showing categorization
2. Verify fixture has correct `status` field (`undefined` for upcoming, `"FT"` for finished, `"LIVE"` for live)
3. Check if `homeScore`/`awayScore` are set when they shouldn't be (should be `undefined` for upcoming)

### If aggregate scores are missing:
1. Check if `aggregateScore` field is present in fixture data
2. Verify `isSecondLeg` flag is set
3. Check if `firstLegFixture` reference exists and has scores
4. Look for `[BBCParser] Clearing premature scores` messages (indicates scores were removed)

### If live minutes don't display:
1. Check if `status` field contains minute marker (e.g., `"67'"`, `"HT"`)
2. Verify `live` flag is `true`
3. Check console logs for live status detection
4. Ensure BBC HTML contains minute markers in expected format

### Console Debugging Commands:
```javascript
// In browser console:
// Check current fixture data
document.querySelector('.MMM-MyTeams-LeagueTable').dataset

// Check categorization
// Look for fixtures with homeScore but no status (incorrect)
fixtures.filter(f => f.homeScore !== undefined && !f.status)

// Check second leg detection
fixtures.filter(f => f.isSecondLeg)
```

---

## Changelog Summary

**v1.1.0** - UEFA Knockout Fixture Fixes (Feb 20, 2026)
- Fixed future fixtures appearing in Results section
- Fixed "0-0" showing instead of kickoff times
- Fixed missing live minute markers
- Fixed aggregate scores not displaying for upcoming second legs
- Extended staged approach (Results/Today/Future) to all knockout rounds (Playoff, Rd16, QF, SF)
- Added comprehensive logging for debugging
- Improved live match detection with multiple fallback patterns
- Enhanced second leg detection and aggregate score calculation

---

## Migration Notes

**Existing Users**: After updating to this version:
1. Clear all caches (use "Clear Cache" button or set `clearCacheOnStart: true` temporarily)
2. Restart MagicMirror
3. Verify fixtures appear in correct sections
4. Check that aggregate scores display for second legs

**No Config Changes Required**: All fixes are automatic and backward-compatible.

---

## Support

If issues persist after applying these fixes:
1. Enable debug mode: `debug: true` in config
2. Check browser console for `[BBCParser]` and `[FIXTURE-DEBUG]` messages
3. Verify system date/time is correct
4. Clear all caches and restart
5. Report issue with console logs and fixture screenshots

---

## v1.8.4 Technical Implementation Details

### Equal-Height Split View CSS Changes

**Key Changes in MMM-MyTeams-LeagueTable.css:**

1. **Container Height** (Line 1264):
   ```css
   /* Before: max-height: 600px with flexible sections */
   /* After: */
   .uefa-split-view-container {
       height: 340px; /* Fixed: 2 sections × 165px + 10px gap */
   }
   ```

2. **Section Heights** (Lines 1269-1326):
   ```css
   /* Before: flex: 1 1 50% (dynamic) */
   /* After: */
   .uefa-section-wrapper {
       height: 165px; /* Fixed equal height */
   }
   
   .uefa-section-wrapper.results-section {
       height: 165px; /* Equal to future section */
   }
   
   .uefa-section-wrapper.future-section {
       height: 165px; /* Equal to results section */
   }
   ```

3. **Reduced Spacing** (Lines 1280-1283, 1440-1467):
   ```css
   /* Section titles */
   .uefa-section-wrapper .wc-title {
       padding: 4px 8px; /* Reduced from 8px 10px */
       font-size: 11px; /* Explicit size */
   }
   
   /* Table headers - scoped to split-view only */
   .uefa-section-scroll .wc-fixtures-table-v2 th {
       padding: 5px 4px; /* Reduced from 10px 4px */
       font-size: 9px; /* Reduced from 10px */
   }
   
   /* Fixture rows - scoped to split-view only */
   .uefa-section-scroll .fixture-row-v2 td {
       padding: 6px 4px; /* Reduced from 8px 4px */
   }
   ```

### Team Name Normalization Changes

**BBCParser.js Lines 755-763:**

```javascript
// BEFORE (v1.8.3 and earlier):
const normalizeTeamForDedup = (team) => {
    return team.toLowerCase()
        .replace(/&amp;/g, "&")
        .replace(/\b(fc|sc|afc|cf|united|city|real|atletico|de|la|ac|inter|sporting|club|madrid|barcelona|munich|dortmund|paris|saint|germain|st)\b/gi, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();
};

// AFTER (v1.8.4):
const normalizeTeamForDedup = (team) => {
    return team.toLowerCase()
        .replace(/&amp;/g, "&")
        .replace(/[^a-z0-9\s]/g, "") // Remove special chars but keep spaces
        .replace(/\s+/g, " ") // Normalize multiple spaces to single space
        .trim();
};
```

**Impact**: 
- Previous: "Newcastle United" → "newcastle" (United stripped)
- Current: "Newcastle United" → "newcastle united" (preserved)
- Previous: "Atletico Madrid" → "" (both words stripped)
- Current: "Atletico Madrid" → "atletico madrid" (preserved)

### Partial Name Detection Algorithm

**BBCParser.js Lines 992-1050:**

```javascript
// Key logic for bidirectional partial matching
const homeMatchesOtherAway_Exact = homeNorm === otherAwayNorm;
const homeMatchesOtherAway_Partial = homeNorm.length >= 4 && 
                                     otherAwayNorm.length > homeNorm.length && 
                                     otherAwayNorm.includes(homeNorm);
const homeMatchesOtherAway_PartialReverse = otherAwayNorm.length >= 4 && 
                                            homeNorm.length > otherAwayNorm.length && 
                                            homeNorm.includes(otherAwayNorm);
const homeMatchesOtherAway = homeMatchesOtherAway_Exact || 
                            homeMatchesOtherAway_Partial || 
                            homeMatchesOtherAway_PartialReverse;

// Similar logic for away team matching...

// If both teams match via any combination
if (homeMatchesOtherAway && awayMatchesOtherHome) {
    // Use version with longer total name length
    const otherHasLongerNames = (other.homeTeam.length + other.awayTeam.length) > 
                                (fixture.homeTeam.length + fixture.awayTeam.length);
    
    if (otherHasLongerNames) {
        // Adopt complete names from counterpart (reversed for two-legged tie)
        fixture.homeTeam = other.awayTeam;
        fixture.awayTeam = other.homeTeam;
    }
}
```

**Examples**:
1. **"Newcastle" vs "Newcastle United"**:
   - "newcastle".length = 9, "newcastle united".length = 17
   - 9 >= 4 ✓, 17 > 9 ✓, "newcastle united".includes("newcastle") ✓
   - Match detected, adopts "Newcastle United"

2. **"Atletico" vs "Atletico Madrid"**:
   - "atletico".length = 8, "atletico madrid".length = 16
   - 8 >= 4 ✓, 16 > 8 ✓, "atletico madrid".includes("atletico") ✓
   - Match detected, adopts "Atletico Madrid"

### Console Logging Tags (v1.8.4)

New logging tags for debugging partial name fixes:
- `[BBCParser-PARTIAL-NAMES]` - Shows when partial team names are detected and corrected
- `[BBCParser-PARTIAL-NAMES]   Better version found:` - Shows which fixture has complete names
- `[BBCParser-PARTIAL-NAMES]   Fixed to:` - Shows the corrected team names

---

**End of Summary**
