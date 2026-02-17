# Cache System - Quick Start & Verification

Get the caching system up and running in 5 minutes!

## Installation (Already Done ✓)

The caching system is **already integrated**. Just restart MagicMirror:

```bash
# Restart MagicMirror
pm2 restart MagicMirror

# Or from MagicMirror directory
npm start
```

## Verify Cache is Working

### Step 1: Check Node Helper Logs

When the module starts, you should see:

```
Starting node helper for: MMM-MyTeams-LeagueTable
CacheManager: Created cache directory at /path/to/.cache
MMM-MyTeams-LeagueTable: Cache cleanup scheduled every 6 hours
```

### Step 2: First Run - Cache Creation

The first time each league data is fetched:

```
MMM-MyTeams-LeagueTable: Fetching SCOTLAND_PREMIERSHIP data from http://...
MMM-MyTeams-LeagueTable: Successfully fetched SCOTLAND_PREMIERSHIP webpage
MMM-MyTeams-LeagueTable: Parsed SCOTLAND_PREMIERSHIP data: {"teams": 12}
CacheManager: Cache SET for SCOTLAND_PREMIERSHIP (12 teams)
```

### Step 3: Check Cache Directory

Navigate to the module and check the cache:

```bash
cd MMM-MyTeams-LeagueTable
ls -la .cache/

# Output:
# -rw-r--r-- user group 45230 Jan 1 12:00 scotland_premiership.json
# -rw-r--r-- user group 52100 Jan 1 12:00 england_premier_league.json
# ... etc
```

### Step 4: Enable Debug Mode

Add debug to your config to see detailed cache logs:

```javascript
{
  module: "MMM-MyTeams-LeagueTable",
  position: "top_left",
  config: {
    debug: true,  // ← Add this
    selectedLeagues: ["SCOTLAND_PREMIERSHIP"]
  }
}
```

Restart and watch for cache messages:

```
CacheManager: Cache SET for SCOTLAND_PREMIERSHIP (12 teams)
CacheManager: Cache HIT (disk) for SCOTLAND_PREMIERSHIP - Age: 3600s
CacheManager: Cache HIT (memory) for SCOTLAND_PREMIERSHIP
```

## Test Cache Fallback

### Scenario 1: Network Failure Simulation

1. **First load**: Module fetches data normally
2. **Go offline**: Disconnect network or block BBC Sport
3. **Reload**: Module should use cached data
4. **Check logs**: You'll see:

```
MMM-MyTeams-LeagueTable: Error fetching SCOTLAND_PREMIERSHIP data: Network error
MMM-MyTeams-LeagueTable: Using cached data for SCOTLAND_PREMIERSHIP after fetch failure
```

### Scenario 2: BBC HTML Structure Changes

If BBC Sport changes their website format:

1. **Parsing fails**: Old regex patterns don't work
2. **Error caught**: System tries cache
3. **Cache used**: Data displays normally
4. **Check logs**:

```
MMM-MyTeams-LeagueTable: Error fetching SCOTLAND_PREMIERSHIP data: No valid table found
MMM-MyTeams-LeagueTable: Using cached data for SCOTLAND_PREMIERSHIP after fetch failure
```

## Check Cache Health

### View Cache Statistics

Create a quick test script to check cache status:

```javascript
// test-cache.js - Run with: node test-cache.js
const CacheManager = require("./cache-manager.js");
const cache = new CacheManager(__dirname);

// Get stats
const stats = cache.getStats();

console.log("\n=== Cache Statistics ===\n");
console.log("Cache Directory:", stats.cacheDir);
console.log("Total Files:", stats.totalFiles);
console.log("Memory Entries:", stats.memoryEntries);
console.log("\n=== Cached Leagues ===\n");

stats.entries.forEach(entry => {
    const status = entry.isExpired ? "EXPIRED" : "VALID";
    const age = Math.round(entry.cacheAge / 60) + " min";
    const expiring = entry.isExpired ? "NOW" : Math.round(entry.expiresIn / 3600) + "h";
    
    console.log(`${entry.leagueType}`);
    console.log(`  Status: ${status}`);
    console.log(`  Teams: ${entry.teams}`);
    console.log(`  Age: ${age}`);
    console.log(`  Expires in: ${expiring}`);
    console.log(`  Size: ${(entry.fileSize / 1024).toFixed(1)} KB\n`);
});
```

Run it:

```bash
cd MMM-MyTeams-LeagueTable
node test-cache.js

# Output:
# === Cache Statistics ===
# 
# Cache Directory: /home/user/MagicMirror/modules/MMM-MyTeams-LeagueTable/.cache
# Total Files: 3
# Memory Entries: 2
# 
# === Cached Leagues ===
# 
# SCOTLAND_PREMIERSHIP
#   Status: VALID
#   Teams: 12
#   Age: 45 min
#   Expires in: 23h
#   Size: 45.2 KB
```

## Common First Run Issues

### Issue: Cache Directory Not Created

**Problem**: `.cache` directory is empty

**Solution**:
1. Restart module to trigger first fetch
2. Wait for data to load (might take 10-30 seconds)
3. Check again after successful fetch

### Issue: Files Not Appearing

**Problem**: Cache directory exists but no files

**Solution**:
1. Check file permissions: `chmod 755 .cache`
2. Ensure module can write: `touch .cache/test.txt`
3. Check disk space: `df -h`
4. Restart module with debug: `debug: true`

### Issue: Very Old Cache Files

**Problem**: Cache files are from weeks ago

**Solution**:
1. Automatic cleanup runs every 6 hours
2. Manual cleanup: `node -e "const c = require('./cache-manager.js'); new c(__dirname).cleanupExpired()"`
3. Clear all: Delete `.cache` directory and restart

## Performance Before & After

### Without Cache (Network Every Time)

```
Module Start:  2-3 seconds (fetch happens)
Auto-cycle:    2-3 seconds per league switch (fetches each one)
Bandwidth:     ~500 KB per fetch × update frequency

On Network Error: No data displayed ✗
```

### With Cache (Smart Fallback)

```
Module Start:  <500ms (uses cache)
Auto-cycle:    <100ms per league switch (memory cache)
Bandwidth:     ~500 KB first time, then cached

On Network Error: Shows cached data ✓
```

## Real-World Example

### Your typical usage pattern:

**Day 1 - First Run:**
```
14:00 - Start MagicMirror
        └─ Fetches SCOTLAND_PREMIERSHIP (3.2s, 52 KB)
        └─ Fetches ENGLAND_PREMIER_LEAGUE (2.8s, 58 KB)
        └─ Caches both leagues
        └─ Total: 6s, 110 KB downloaded

14:15 - Switch to ENGLAND_PREMIER_LEAGUE
        └─ Uses memory cache (<100ms)
        └─ No network request

18:00 - Auto-update (6 hour interval)
        └─ Fetches fresh data
        └─ Updates cache
        └─ Total: 3.5s per league, 100 KB downloaded
```

**Day 2 - Next Run:**
```
08:00 - Start MagicMirror
        └─ Uses disk cache (500ms)
        └─ No network requests
        └─ 0 KB downloaded
        └─ Shows yesterday's data until next update

12:00 - Network is down
        └─ Cache fallback activates
        └─ Shows latest cached data
        └─ No error message to user
```

## Monitoring Dashboard

Create a simple monitoring script to track cache performance:

```javascript
// monitor-cache.js
const CacheManager = require("./cache-manager.js");
const cache = new CacheManager(__dirname);
cache.setDebug(true);

console.log("📊 Cache Monitoring Started\n");

// Check every 30 seconds
setInterval(() => {
    const stats = cache.getStats();
    console.log(`[${new Date().toLocaleTimeString()}] Cache Status:`);
    console.log(`  Files: ${stats.totalFiles}, Memory: ${stats.memoryEntries}`);
    
    stats.entries.slice(0, 3).forEach(e => {
        console.log(`  - ${e.leagueType}: ${e.teams} teams, expires in ${Math.round(e.expiresIn/3600)}h`);
    });
}, 30000);
```

Run it:
```bash
node monitor-cache.js
```

## Configuration Options

You can control the cache behavior via your `config.js`:

```javascript
config: {
    clearCacheButton: true,    // Adds a "Clear Cache" button to the module header
    clearCacheOnStart: false,  // Force clear all cache files every time the module starts
    debug: true                // Enables detailed cache performance logs in console
}
```

### Manual Cache Management
- **Clear via UI**: If `clearCacheButton` is enabled, click the button in the module header to purge all cached data and trigger a fresh fetch.
- **Force Reset**: Set `clearCacheOnStart: true` to ensure the module always pulls fresh data from the internet on startup.

## Troubleshooting

### Q: How often is data refreshed?
**A**: 
- First fetch: On startup
- Subsequent: Based on `updateInterval` config (default 1 hour)
- **Dynamic Refresh**: Automatically increases to **3 minutes** when live matches are detected
- Cache expiration: 24 hours

### Q: What if I want fresher data?
**A**:
```javascript
config: {
    updateInterval: 30 * 60 * 1000,  // 30 minutes instead of 1 hour
}
```

### Q: Does cache survive reboots?
**A**: **Yes!** Cache is stored on disk and persists across restarts.

### Q: Can I disable cache?
**A**: Not directly, but you can delete `.cache` folder before restart to start fresh.

### Q: How much storage does cache use?
**A**: Typically 2-5 MB for all 25 European leagues, auto-cleaned after 7 days.

### Q: What if cache gets corrupted?
**A**: 
```bash
# Clear all cache
rm -rf .cache/
# Module will rebuild cache on next fetch
```

## Summary

✅ **Cache automatically saves** after each successful fetch  
✅ **Cache automatically used** when fetch fails  
✅ **Cache automatically cleaned** every 6 hours  
✅ **Cache survives** restarts (persisted to disk)  
✅ **Cache improves** performance and reliability  

**The caching system is designed to work invisibly - you don't need to do anything, it just works!**

For advanced configuration, see [CACHING.md](./CACHING.md)  
For developer details, see [CACHE_DEVELOPER_GUIDE.md](./CACHE_DEVELOPER_GUIDE.md)