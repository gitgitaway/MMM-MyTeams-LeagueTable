#!/usr/bin/env python3
"""
update_season_urls.py
=====================
Purpose
-------
Updates all season-specific URLs in src/league-configs.js from the
2025-26 season to the 2026-27 season.  Covers three URL maps:

  1. WIKIPEDIA_URL_MAP  – en-dash encoded double-year slugs
                          (2025%E2%80%9326 → 2026%E2%80%9327)
                          and single calendar-year leagues.
  2. GOOGLE_URL_MAP     – human-readable year strings embedded in
                          search query parameters.
  3. SOCCERWAY_URL_MAP  – year path segments (20252026 → 20262027).
                          NOTE: the r##### season IDs in Soccerway URLs
                          are unique per season and cannot be computed
                          automatically.  The script updates the year
                          portion of the path only; you MUST visit each
                          league's Soccerway page at the start of the new
                          season, copy the fresh r##### ID, and paste it
                          into SOCCERWAY_URL_MAP in src/league-configs.js.

Also updates the hardcoded season-year anchors in tools/fix_splits.py so
that the split-league insertion script remains useful for future seasons.

Background
----------
Most European domestic leagues run August–May and are referenced by a
double year (e.g. 2025-26 → 2026-27).  Several leagues run on a single
calendar year instead:

  Spring–Autumn calendar-year leagues (year increments by 1 each season):
    Estonia, Finland, Iceland, Republic of Ireland, Japan, Kazakhstan,
    Latvia, Lithuania, Moldova, South Korea, Brazil, Canada/USA MLS,
    China, Uruguay.

  Spring–Autumn calendar-year leagues that are already one year ahead
  because they were updated last cycle:
    Norway Eliteserien  (2026 → 2027)
    Sweden Allsvenskan  (2026 → 2027)

Usage
-----
Run from any directory – the script resolves paths relative to its own
location so it works on PC, Raspberry Pi, and Mac alike:

    python3 tools/update_season_urls.py

or, from inside the tools/ directory:

    python3 update_season_urls.py

The script reads, modifies in memory, and writes back.  If an expected
string is not found it prints a WARNING rather than silently corrupting
the file.

Author  : gitgitaway
Created : 2026-06-28
"""

import os
import sys
import re


def update_league_configs(content: str) -> str:
    """Apply all URL replacements to the contents of league-configs.js."""

    changes: list[str] = []

    # =========================================================================
    # 1. WIKIPEDIA_URL_MAP
    #    a) Double-year slugs encoded with an en-dash
    # =========================================================================
    old_wiki_dual = "2025%E2%80%9326"
    new_wiki_dual = "2026%E2%80%9327"
    count = content.count(old_wiki_dual)
    if count:
        content = content.replace(old_wiki_dual, new_wiki_dual)
        changes.append(f"  Wikipedia dual-year slug: {count} occurrence(s) "
                       f"({old_wiki_dual} → {new_wiki_dual})")
    else:
        print(f"WARNING: '{old_wiki_dual}' not found in WIKIPEDIA_URL_MAP "
              "– already updated or file structure changed.")

    # -------------------------------------------------------------------------
    # 1b) Single calendar-year leagues whose Wikipedia article year increments
    #     from 2025 to 2026.  We use precise substring replacement so we don't
    #     accidentally alter version numbers or other numeric strings.
    # -------------------------------------------------------------------------
    calendar_year_pairs_25_to_26 = [
        ("wiki/2025_Meistriliiga",                     "wiki/2026_Meistriliiga"),
        ("wiki/2025_Veikkausliiga",                    "wiki/2026_Veikkausliiga"),
        ("wiki/2025_%C3%9Arvalsdeild_karla",           "wiki/2026_%C3%9Arvalsdeild_karla"),
        ("wiki/2025_League_of_Ireland_Premier_Division","wiki/2026_League_of_Ireland_Premier_Division"),
        ("wiki/2025_J1_League",                        "wiki/2026_J1_League"),
        ("wiki/2025_Kazakhstan_Premier_League",        "wiki/2026_Kazakhstan_Premier_League"),
        ("wiki/2025_Virsliga",                         "wiki/2026_Virsliga"),
        ("wiki/2025_A_Lyga",                           "wiki/2026_A_Lyga"),
        ("wiki/2025_Moldovan_National_Division",       "wiki/2026_Moldovan_National_Division"),
        ("wiki/2025_K_League_1",                       "wiki/2026_K_League_1"),
        ("wiki/2025_in_Brazilian_football",            "wiki/2026_in_Brazilian_football"),
        ("wiki/2025_Major_League_Soccer_season",       "wiki/2026_Major_League_Soccer_season"),
        ("wiki/2025_Chinese_Super_League",             "wiki/2026_Chinese_Super_League"),
    ]

    for old, new in calendar_year_pairs_25_to_26:
        if old in content:
            content = content.replace(old, new)
            changes.append(f"  Wikipedia single-year: '{old}' → '{new}'")
        else:
            print(f"WARNING: '{old}' not found – skipping.")

    # -------------------------------------------------------------------------
    # 1c) Spring–Autumn leagues that were already at year 2026 and now advance
    #     to 2027 (Norway and Sweden).
    # -------------------------------------------------------------------------
    calendar_year_pairs_26_to_27 = [
        ("wiki/2026_Eliteserien",   "wiki/2027_Eliteserien"),
        ("wiki/2026_Allsvenskan",   "wiki/2027_Allsvenskan"),
    ]

    for old, new in calendar_year_pairs_26_to_27:
        if old in content:
            content = content.replace(old, new)
            changes.append(f"  Wikipedia single-year (spring-autumn): '{old}' → '{new}'")
        else:
            print(f"WARNING: '{old}' not found – skipping.")

    # =========================================================================
    # 2. GOOGLE_URL_MAP
    #    Replace year tokens embedded in the q= search strings.
    #    Dual-year: 2025-26 → 2026-27
    #    Single calendar-year: 2025 → 2026  (only inside the Google URL block)
    #    Spring–Autumn: 2026 → 2027 (Norway / Sweden only)
    # =========================================================================

    # -- 2a: dual-year tokens in Google URLs --
    old_g_dual = "2025-26"
    new_g_dual = "2026-27"
    count = content.count(old_g_dual)
    if count:
        content = content.replace(old_g_dual, new_g_dual)
        changes.append(f"  Google dual-year token: {count} occurrence(s) "
                       f"({old_g_dual} → {new_g_dual})")
    else:
        print(f"WARNING: '{old_g_dual}' not found in GOOGLE_URL_MAP.")

    # -- 2b: single calendar-year tokens in Google URLs (q= suffix) --
    # We match the year only when it appears at the very end of a search query
    # string (before the closing quote) so we don't disturb other contexts.
    google_single_year_pairs = [
        ("+2025\"",  "+2026\""),   # e.g. "+standings+2025"
        ("+2025\n",  "+2026\n"),   # edge case if there's a newline
    ]
    for old, new in google_single_year_pairs:
        count = content.count(old)
        if count:
            content = content.replace(old, new)
            changes.append(f"  Google single-year token: {count} occurrence(s) "
                           f"({old.strip()!r} → {new.strip()!r})")

    # -- 2c: spring-autumn Google tokens (Norway/Sweden) --
    google_spring_autumn_pairs = [
        ("+2026\"",  "+2027\""),
    ]
    for old, new in google_spring_autumn_pairs:
        count = content.count(old)
        if count:
            content = content.replace(old, new)
            changes.append(f"  Google spring-autumn token: {count} occurrence(s) "
                           f"({old.strip()!r} → {new.strip()!r})")

    # =========================================================================
    # 3. SOCCERWAY_URL_MAP
    #    Update the year path segment 20252026 → 20262027.
    #    The r##### season IDs cannot be derived automatically – they must be
    #    looked up on the Soccerway website at the start of the new season.
    # =========================================================================
    old_sw_year = "20252026"
    new_sw_year = "20262027"
    count = content.count(old_sw_year)
    if count:
        content = content.replace(old_sw_year, new_sw_year)
        changes.append(f"  Soccerway year path: {count} occurrence(s) "
                       f"({old_sw_year} → {new_sw_year})")
        print(
            "\n*** IMPORTANT – Soccerway r##### IDs ***\n"
            "The year portion of every Soccerway URL has been updated to "
            f"'{new_sw_year}',\n"
            "but the r##### season identifiers (e.g. r87209) are unique per "
            "season.\n"
            "Before the 2026-27 season begins you MUST:\n"
            "  1. Visit int.soccerway.com for each league in SOCCERWAY_URL_MAP.\n"
            "  2. Navigate to the 2026-27 season table page.\n"
            "  3. Copy the new r##### ID from the URL.\n"
            "  4. Update SOCCERWAY_URL_MAP in src/league-configs.js accordingly.\n"
        )
    else:
        print(f"WARNING: '{old_sw_year}' not found in SOCCERWAY_URL_MAP.")

    if changes:
        print("\nChanges applied to league-configs.js:")
        for c in changes:
            print(c)

    return content


def update_fix_splits(content: str) -> str:
    """Update the hardcoded 2025-26 season anchors in fix_splits.py."""

    changes: list[str] = []

    replacements = [
        ("2025%E2%80%9326_Cymru_Premier",         "2026%E2%80%9327_Cymru_Premier"),
        ("2025%E2%80%9326_Cypriot_First_Division", "2026%E2%80%9327_Cypriot_First_Division"),
        ("2025%E2%80%9326_Israeli_Premier_League", "2026%E2%80%9327_Israeli_Premier_League"),
    ]

    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            changes.append(f"  fix_splits.py anchor: '{old}' → '{new}'")
        else:
            print(f"WARNING (fix_splits.py): '{old}' not found – may already be updated.")

    if changes:
        print("\nChanges applied to fix_splits.py:")
        for c in changes:
            print(c)

    return content


def main() -> None:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    module_root = os.path.dirname(script_dir)

    league_configs_path = os.path.join(module_root, "src", "league-configs.js")
    fix_splits_path     = os.path.join(script_dir, "fix_splits.py")

    for path in (league_configs_path, fix_splits_path):
        if not os.path.isfile(path):
            print(f"ERROR: Cannot find file at {path}")
            sys.exit(1)

    # -- league-configs.js --
    with open(league_configs_path, "r", encoding="utf-8") as fh:
        lc_content = fh.read()

    lc_updated = update_league_configs(lc_content)

    with open(league_configs_path, "w", encoding="utf-8") as fh:
        fh.write(lc_updated)
    print(f"\nSaved: {league_configs_path}")

    # -- fix_splits.py --
    with open(fix_splits_path, "r", encoding="utf-8") as fh:
        fs_content = fh.read()

    fs_updated = update_fix_splits(fs_content)

    with open(fix_splits_path, "w", encoding="utf-8") as fh:
        fh.write(fs_updated)
    print(f"Saved: {fix_splits_path}")

    print("\nSeason URL update complete.  Review the WARNING messages above "
          "for any entries that could not be updated automatically.")


if __name__ == "__main__":
    main()
