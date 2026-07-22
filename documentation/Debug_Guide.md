# Debug Guide

This guide explains how to enable, read, and interpret the debug logging system in **MMM-MyTeams-LeagueTable**. It also covers the tagged log format, common log patterns, and how to share logs when reporting issues.

---

## 1. Enabling Debug Mode

Set `debug: true` in your `config/config.js` module entry:

```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  config: {
    debug: true,   // Enable verbose logging
    // ... other options
  }
}
```

> **Performance Warning**: On Raspberry Pi, debug logging generates significant I/O. Always set `debug: false` in production. The default is `false`.

---

## 2. Log Level System

The module uses a numeric log level (set internally). Higher numbers mean more verbose output:

| Level | Meaning | Example use |
|-------|---------|-------------|
| `1` | **ERROR** — serious failures | Fetch failures, parse crashes |
| `2` | **WARN** — recoverable issues | Missing logo, cache miss |
| `3` | **INFO** — general operation | League data received, cache hit |
| `4` — verbose | **DEBUG** — detailed trace | Provider chain decisions, row-by-row parse |

When `debug: true`, levels 1–4 are all active. When `debug: false`, only level 1 (ERROR) messages from critical paths are emitted.

---

## 3. Log Tag Reference

Logs use structured `[SUBSYSTEM]` tags for easy filtering. Use `grep` on the terminal or filter by tag in DevTools:

| Tag | Source | What it covers |
|-----|--------|---------------|
| `[CORE]` | `MMM-MyTeams-LeagueTable.js` | Module startup, league switching |
| `[DATA]` | `MMM-MyTeams-LeagueTable.js` | Data received / error from backend |
| `[RENDER]` | `MMM-MyTeams-LeagueTable.js` | DOM updates, table creation |
| `[FETCH]` | `node_helper.js` | HTTP fetch attempts and results |
| `[CACHE]` | `cache-manager.js` | Cache hits, misses, writes |
| `[BBCParser]` | `BBCParser.js` | BBC Sport HTML parsing decisions |
| `[BBCParser-DEDUP]` | `BBCParser.js` | Fixture deduplication decisions |
| `[BBCParser-PROXIMITY]` | `BBCParser.js` | Fuzzy date proximity matching |
| `[BBCParser-CORRUPTION]` | `BBCParser.js` | Corrupted fixture repair |
| `[Multi-group]` | `node_helper.js` / `WikipediaParser.js` | Split-league group extraction |
| `[LogoResolver]` | `logo-resolver.js` | Team crest lookup results |
| `[SharedRequestManager]` | `shared-request-manager.js` | HTTP queue and rate limiting |
| `[FIXTURE-DISPLAY]` | `MMM-MyTeams-LeagueTable.js` | Fixture state decisions (time vs score) |

---

## 4. Where Logs Appear

Logs are written to **two places**:

### A. MagicMirror Terminal (server-side)
From `node_helper.js`, `BBCParser.js`, `cache-manager.js`, etc.

View with:
```bash
# If running via npm start
npm run start:windows  # Windows
npm start              # Linux/Mac

# If running via PM2
pm2 logs MagicMirror
```

Look for lines prefixed with `[LOG]`, `[WARN]`, `[ERROR]`, or `[INFO]`.

### B. Browser Console (client-side)
From `MMM-MyTeams-LeagueTable.js` (the frontend module).

Open: **F12 → Console tab** in your browser (or Electron DevTools).

Filter by typing a subsystem tag (e.g., `[RENDER]`, `[DATA]`) in the filter box.

---

## 5. Common Debug Patterns

### Module not displaying data
Look for:
```
[DATA] [ERROR] [Parsing] Data format changed - module may need update
```
This means the parser received HTML it couldn't interpret. Check if the BBC Sport or other provider's page structure has changed.

### Logo missing for a team
```
[LogoResolver] NO LOGO FOUND for 'Djurgardens'. Tried: exact, normalized, stripped, fuzzy
```
Add a manual mapping in `team-logo-mappings.js` or add the image to `images/crests/`.

### Provider fallback in action
```
[FETCH] [SCOTLAND_PREMIERSHIP] Error from BBC Sport: HTTP 404
[FETCH] [SCOTLAND_PREMIERSHIP] Trying next provider: wikipedia
```
The module is working as designed — BBC returned 404 so it escalated to Wikipedia.

### Split-league multi-group fetch
```
[Multi-group] Provider returned 1 group but expected 2 for ROMANIA_LIGA_I — escalating
[Multi-group] Wikipedia returned 2 groups successfully
```

### Cache hit / miss
```
CacheManager: Cache HIT (memory) for SCOTLAND_PREMIERSHIP
CacheManager: Cache MISS for NORWAY_ELITESERIEN - file not found
CacheManager: Cache SET for DENMARK_SUPERLIGA (16 teams)
```

### Fetch queue and rate limiting
```
[SharedRequestManager] Queued request from MMM-MyTeams-LeagueTable (priority: 2, queue size: 3)
[SharedRequestManager] Processing request: https://www.bbc.co.uk/sport/...
[SharedRequestManager] Resource not modified (304) — using cache
```

---

## 6. Filtering Terminal Logs

To focus on a specific subsystem in the terminal (Linux/Mac):
```bash
npm start 2>&1 | grep "\[FETCH\]"
npm start 2>&1 | grep "SCOTLAND_PREMIERSHIP"
npm start 2>&1 | grep "ERROR"
```

On Windows PowerShell:
```powershell
npm run start:windows 2>&1 | Select-String "\[FETCH\]"
npm run start:windows 2>&1 | Select-String "ERROR"
```

---

## 7. Reporting an Issue

When opening a GitHub issue, include:

1. Your `config/config.js` snippet for this module (remove any API keys or sensitive data).
2. The **browser console log** (F12 → Console → right-click → Save as).
3. The **terminal log** from the MagicMirror startup (copy from the point MagicMirror starts until the error appears).
4. The module version (check `package.json` or `CHANGELOG.md`).

> **Tip**: Save logs with debug mode enabled (`debug: true`) — logs without it are much less useful for diagnosing data or parsing issues.

---

## 8. Disabling Specific Log Noise

If you find certain log lines noisy but still want debug mode enabled for others, you can temporarily add `// eslint-disable` or wrap in conditions — but this requires code changes. The recommended approach is to use the log tags to filter in your terminal rather than removing log lines.

---

## See Also

- **[Troubleshooting Guide](./Troubleshooting_User_Guide.md)**: Known issues and step-by-step solutions.
- **[Maintenance Guide](./maintenance.md)**: Seasonal updates and cache management.
- **[How This Module Works](./How_This_Module_Works.md)**: Architectural overview for deeper debugging context.
