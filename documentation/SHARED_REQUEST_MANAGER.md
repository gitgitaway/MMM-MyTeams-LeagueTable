# Shared Request Manager

Documentation for the Shared Request Manager that coordinates HTTP requests across multiple MagicMirror modules.

## Overview

The **Shared Request Manager** (`shared-request-manager.js`) is a global singleton that queues and throttles API requests to prevent rate limiting, timeouts, and network conflicts when multiple modules make simultaneous HTTP calls.

## Why It's Needed

### Problems with Simultaneous Requests

When multiple modules make API requests at the same time:
- ❌ APIs become overwhelmed causing rate limiting (429 errors)
- ❌ Network congestion leads to timeouts
- ❌ Modules interfere with each other's data loading
- ❌ Slow or failed module loading
- ❌ API quota exhaustion

### Solution

The Shared Request Manager:
- ✅ Queues all HTTP requests from all modules
- ✅ Processes requests sequentially (never simultaneous)
- ✅ Configurable throttling between requests (default: 1200ms)
- ✅ Per-domain rate limiting
- ✅ Deduplicates identical simultaneous requests
- ✅ Automatically retries failed requests with exponential backoff
- ✅ Supports priority levels for urgent requests
- ✅ Includes comprehensive debug logging

## How It Works

### Request Flow

```
Module makes request
    ↓
Shared Request Manager
    ├─ Check if identical request already queued → Deduplicate
    ├─ Add to request queue
    ├─ Check domain rate limits
    └─ Process queue sequentially
        ├─ Execute request
        ├─ If success → Return data to module
        └─ If fail → Retry with exponential backoff
```

### Queue Processing

1. **Receive Request**: Module sends HTTP request to manager
2. **Deduplicate**: Check if identical request already queued
3. **Queue**: Add to processing queue if unique
4. **Throttle**: Wait throttle delay before processing
5. **Rate Limit Check**: Verify domain hasn't exceeded rate limits
6. **Execute**: Make HTTP request
7. **Handle Response**: Success or retry with backoff

## Integration with Other Modules

### Compatible Modules

The Shared Request Manager is designed for MMM-MyTeams family of modules:
- MMM-MyTeams-DriveToMatch 
- MMM-MyTeams-Fixtures
- MMM-MyTeams-LeagueTable (this module)
- MMM-MyTeams-Honours
- MMM-Celtic-OnThisDay

### Setup for Multi-Module

1. **Step 1**: Copy `shared-request-manager.js` from MMM-MyTeams-DriveToMatch to each other module's directory:

```bash
# Assuming you're in MagicMirror/modules directory
Copy-Item MMM-MyTeams-DriveToMatch/shared-request-manager.js MMM-MyTeams-Fixtures/
Copy-Item MMM-MyTeams-DriveToMatch/shared-request-manager.js MMM-MyTeams-LeagueTable/
Copy-Item MMM-MyTeams-DriveToMatch/shared-request-manager.js MMM-MyTeams-Honours/
Copy-Item MMM-MyTeams-DriveToMatch/shared-request-manager.js MMM-Celtic-OnThisDay/
```

2. **Step 2**: Each module loads it in `node_helper.js`:

```javascript
const SharedRequestManager = require('./shared-request-manager');
const requestManager = SharedRequestManager.getInstance();
```

3. **Step 3**: Use manager for all HTTP requests:

```javascript
// Instead of: this.sendRequest(url, callback)
// Use: requestManager.queueRequest(url, options, callback)

requestManager.queueRequest(url, {
    priority: 0,  // 0=highest, 1=normal, 2=lowest
    timeout: 15000
}, (error, response, body) => {
    if (error) {
        console.error('Request failed:', error);
    } else {
        // Handle response
    }
});
```

### Singleton Pattern

The manager uses **global singleton pattern**:
- Only one instance across all modules
- All modules share same queue and rate limiting
- First load creates instance, subsequent loads return same instance
- Prevents multiple queues or competing throttling

## Configuration

### Pre-configured Defaults

No additional configuration required. Sensible defaults included:

| Setting | Default | Description |
|---------|---------|-------------|
| **Throttle Delay** | 1200ms | Time between requests (prevents rate limiting) |
| **Max Retries** | 3 | Attempts before giving up on failed request |
| **Timeout** | 15000ms | Max time to wait for response (15 seconds) |
| **Priority Levels** | 0-2 | 0=highest, 1=normal, 2=lowest priority |
| **Exponential Backoff** | Yes | Retry delays increase: 1s, 2s, 4s, etc. |

### Custom Configuration

If needed, modify in `shared-request-manager.js`:

```javascript
// Near top of file
const CONFIG = {
    throttleDelay: 1200,        // ms between requests
    maxRetries: 3,              // retry attempts
    timeout: 15000,             // ms per request
    exponentialBackoff: true    // enable backoff
};
```

### Per-Request Options

```javascript
requestManager.queueRequest(url, {
    priority: 0,                // Higher = processed sooner
    timeout: 20000,             // Override default timeout
    retries: 5,                 // Override max retries
    method: 'GET',              // HTTP method
    headers: {},                // Custom headers
    body: null                  // POST body
}, callback);
```

## Priority Levels

### Three Priority Tiers

| Priority | Level | Use Case | Example |
|----------|-------|----------|---------|
| 0 | **Highest** | Critical/urgent requests | Getting current match time |
| 1 | **Normal** | Regular module requests | Fetching next fixture |
| 2 | **Lowest** | Background/cache refresh | Pre-loading data |

### Priority Example

```javascript
// High priority - urgent match details
requestManager.queueRequest(urgentUrl, { priority: 0 }, callback);

// Normal priority - regular fixture fetch
requestManager.queueRequest(normalUrl, { priority: 1 }, callback);

// Low priority - background cache update
requestManager.queueRequest(cacheUrl, { priority: 2 }, callback);
```

High-priority requests are processed before lower-priority queued requests.

## Retry Strategy

### Automatic Retries

Failed requests automatically retry with exponential backoff:

| Attempt | Delay | Total Wait |
|---------|-------|-----------|
| 1st attempt | 0ms | 0ms |
| Failed → 2nd attempt | 1000ms | 1s |
| Failed → 3rd attempt | 2000ms | 3s |
| Failed → 4th attempt | 4000ms | 7s |
| All failed | Give up | Return error |

### Example Retry Behavior

```
Request to API
  ├─ Attempt 1: Fails (timeout)
  ├─ Wait 1s
  ├─ Attempt 2: Fails (500 error)
  ├─ Wait 2s
  ├─ Attempt 3: Fails (connection refused)
  ├─ Wait 4s
  ├─ Attempt 4: Success! ✓
  └─ Return data to module
```

### Max Retries Configuration

Default 3 retries = 4 total attempts. Customize:

```javascript
// In shared-request-manager.js
maxRetries: 5  // Allow up to 6 total attempts
```

## Rate Limiting

### Domain-Based Rate Limiting

Different throttle rates per domain:

```javascript
const domainLimits = {
    'api.thesportsdb.com': 1000,  // 1s between requests
    'api.tomtom.com': 800,         // 800ms between requests
    'api.example.com': 1200        // 1.2s between requests
};
```

### Shared Throttle

All requests to same domain share throttling:
- If MMM-MyTeams-DriveToMatch requests at 0s
- And MMM-MyTeams-Fixtures requests at 0.5s
- Second request waits for throttle delay
- Prevents hammering the API

## Debug Logging

### Enable Debug Mode

```javascript
// In shared-request-manager.js or via ENV
DEBUG = true;  // or set via console
```

### Console Output

With debug enabled, see detailed logs:

```
[SRM] Request queued: GET https://api.thesportsdb.com/...
[SRM] Queue length: 3 pending requests
[SRM] Processing request (priority: 0)
[SRM] Request successful: 200 OK
[SRM] Deduplicating identical request
[SRM] Request retry 1/3 after 1000ms
[SRM] Request timeout after 15000ms, retrying...
```

### Debug via Node

In MagicMirror console/terminal:

```javascript
const SRM = require('./shared-request-manager');
SRM.getInstance().debug = true;  // Enable debugging
SRM.getInstance().getStats();    // Show queue statistics
```

## Monitoring & Statistics

### Request Statistics

```javascript
const manager = SharedRequestManager.getInstance();
const stats = manager.getStats();

console.log(stats);
// Output:
// {
//   queueLength: 5,
//   totalRequests: 127,
//   successfulRequests: 123,
//   failedRequests: 4,
//   averageResponseTime: 245,  // ms
//   throttledWaits: 127
// }
```

### Real-time Queue

```javascript
const manager = SharedRequestManager.getInstance();
console.log('Current queue:', manager.queue);
```

## Best Practices

### Do's

- ✅ Use manager for all external API calls
- ✅ Set appropriate priority levels
- ✅ Implement proper error handling in callbacks
- ✅ Copy manager to all MMM-MyTeams modules
- ✅ Monitor console logs during troubleshooting
- ✅ Check module documentation for integration examples

### Don'ts

- ❌ Make direct HTTP requests bypassing manager
- ❌ Set throttle delay too low (<500ms)
- ❌ Use priority 0 for non-urgent requests
- ❌ Modify manager code without testing
- ❌ Run multiple instances of manager

## Troubleshooting

### Requests Timing Out

1. Check throttle delay isn't too high
2. Verify API endpoint is responsive
3. Check internet connection
4. Increase timeout: `timeout: 30000`
5. Enable debug logging to see queue status

### High API Usage

1. Lower requests by increasing throttle delay
2. Use `useSharedFixturesCache: true` to share data between modules
3. Increase fixture cache TTL
4. Reduce `maxRetries` to avoid excessive retries

### Module Not Receiving Data

1. Verify callback is implemented correctly
2. Check console for error messages
3. Enable debug logging in manager
4. Verify URL and API key are correct
5. Test API endpoint manually in browser

### Queue Never Processes

1. Check manager is properly initialized
2. Verify `processQueue()` method exists
3. Enable debug logging to see queue status
4. Check browser console for JavaScript errors
5. Restart MagicMirror and try again

## Performance Impact

### Typical Performance

| Scenario | Time | Notes |
|----------|------|-------|
| Single request | ~300ms | Normal API response time |
| 5 requests sequential | ~7.5s | 5 × (1.2s throttle + response time) |
| 10 simultaneous requests | ~12s | Queued and throttled vs. instant timeout |

### Benefits

- **Reliability**: No rate limiting or 429 errors
- **Stability**: No network congestion
- **Predictability**: Consistent response times
- **Scalability**: Works with many modules

## Integration Example

Complete example in node_helper.js:

```javascript
const NodeHelper = require("node_helper");
const SharedRequestManager = require("./shared-request-manager");

module.exports = NodeHelper.create({
    socketNotificationReceived: function(notification, payload) {
        if (notification === "GET_FIXTURE") {
            const manager = SharedRequestManager.getInstance();
            const url = "https://api.thesportsdb.com/api/v1/...";
            
            manager.queueRequest(url, {
                priority: 1,
                timeout: 15000
            }, (error, response, body) => {
                if (error) {
                    this.sendSocketNotification("FIXTURE_ERROR", error);
                } else {
                    this.sendSocketNotification("FIXTURE_DATA", body);
                }
            });
        }
    }
});
```

## Additional Resources

- See individual MMM-MyTeams module documentation for integration
- Check console logs with `debug: true` enabled
- Review module source code for advanced usage
- Contact module maintainer for issues