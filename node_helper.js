/* MagicMirror²
 * Node Helper:  MMM-MyTeams-LeagueTable
 *
 * By: Assistant
 * MIT Licensed.
 *
 * This node helper fetches SPFL league data from BBC Sport website
 * and processes it for display in the MagicMirror module.
 */

const SharedRequestManager = require("./shared-request-manager.js");

const requestManager = SharedRequestManager.getInstance();
const NodeHelper = require("node_helper");
const CacheManager = require("./cache-manager.js");
const BBCParser = require("./parsers/BBCParser.js");
const FIFAParser = require("./parsers/FIFAParser.js");
const SoccerwayParser = require("./parsers/SoccerwayParser.js");
const WikipediaParser = require("./parsers/WikipediaParser.js");
const ESPNParser = require("./parsers/ESPNParser.js");
const GoogleParser = require("./parsers/GoogleParser.js");
const logoResolver = require("./logo-resolver.js");

module.exports = NodeHelper.create({
	// Helper to send debug info to frontend for browser console viewing
	sendDebugInfo(message, data = null) {
		const debugLevel = this.config ? (this.config.debugLevel !== undefined ? this.config.debugLevel : (this.config.debug ? 4 : 1)) : 1;
		if (debugLevel < 4) return;

		// DEBUG-05: Rate-limit sendDebugInfo() socket messages to prevent flooding
		const now = Date.now();
		if (!this._lastDebugTime) this._lastDebugTime = 0;
		if (now - this._lastDebugTime < 500) return; // Max 2 messages per second
		this._lastDebugTime = now;

		this.sendSocketNotification("DEBUG_INFO", {
			message: message,
			data: data,
			timestamp: new Date().toISOString()
		});
	},

	/**
	 * Helper to log messages with levels and subsystems (DEBUG-02, DEBUG-04)
	 * @param {number} level - 1=ERROR, 2=WARN, 3=INFO, 4=DEBUG
	 * @param {string} subsystem - The subsystem (e.g., CORE, CACHE, PARSER)
	 * @param {string} message - The message to log
	 * @param {any} data - Optional data to log alongside the message
	 */
	log(level, subsystem, message, data = null) {
		const debugLevel = this.config ? (this.config.debugLevel !== undefined ? this.config.debugLevel : (this.config.debug ? 4 : 1)) : 1;
		if (level > debugLevel) return;

		const levels = ["", "ERROR", "WARN", "INFO", "DEBUG"];
		const prefix = ` MMM-MyTeams-LeagueTable: [${subsystem}] [${levels[level]}]`;
		
		let safeData = data;
		if (data && typeof data === "object" && !Array.isArray(data)) {
			safeData = this._getSafeConfig(data);
		}

		if (safeData) console.log(`${prefix} ${message}`, safeData);
		else console.log(`${prefix} ${message}`);
	},

	/**
	 * Categorize errors and provide user-friendly messages
	 * @param {Error} error - The error object
	 * @returns {Object} Error with category and user-friendly message
	 */
	categorizeError(error) {
		const errorMsg = error.message || String(error);
		const errorName = error.name || "Error";

		let category = "Unknown";
		let userMessage = "An unexpected error occurred";
		let suggestion = "Please try again later";
		let icon = "⚠️";

		// Network errors (timeout, connection)
		if (
			errorName === "AbortError" ||
			errorMsg.includes("timeout") ||
			errorMsg.includes("ETIMEDOUT") ||
			errorMsg.includes("ECONNREFUSED") ||
			errorMsg.includes("ENOTFOUND")
		) {
			category = "Network";
			userMessage = "Network timeout - check your internet connection";
			suggestion = "Verify internet connection and try again";
			icon = "🌐";
		}
		// HTTP 4xx errors (client errors)
		else if (errorMsg.match(/HTTP 4\d{2}/)) {
			category = "Server";
			userMessage = "Data source unavailable - please try again later";
			suggestion = "The website may be temporarily down";
			icon = "🚫";
		}
		// HTTP 5xx errors (server errors)
		else if (errorMsg.match(/HTTP 5\d{2}/)) {
			category = "Server";
			userMessage = "Server error - data source is experiencing issues";
			suggestion = "Wait a few minutes and try again";
			icon = "🔧";
		}
		// Parsing errors
		else if (
			errorMsg.includes("parse") ||
			errorMsg.includes("JSON") ||
			(errorMsg.includes("No") && errorMsg.includes("data"))
		) {
			category = "Parsing";
			userMessage = "Data format changed - module may need update";
			suggestion = "Check for module updates";
			icon = "📋";
		}
		// Fetch errors
		else if (errorMsg.includes("fetch") || errorMsg.includes("request")) {
			category = "Network";
			userMessage = "Failed to fetch data";
			suggestion = "Check network connection";
			icon = "📡";
		}

		return {
			category,
			userMessage,
			suggestion,
			icon,
			originalError: errorMsg,
			code: error.code || "UNKNOWN"
		};
	},

	/**
	 * Resolves logos for all teams in the data payload.
	 * Moves logic from client to server to improve performance on low-power devices.
	 *
	 * @param {Object} data - The league data payload
	 * @param {Object} config - The module configuration
	 * @returns {Object} - Data with resolved logo paths
	 */
	resolveLogos(data, config) {
		if (!data) return data;

		const customMappings = (config && config.teamLogoMap) || {};

		this.log(4, "LOGO", "Resolving logos on server-side...");

		// Helper to get logo with caching
		const getCachedLogo = (teamName) => {
			const cacheKey = `${teamName}_${JSON.stringify(customMappings)}`;
			if (this.resolvedLogoCache.has(cacheKey)) {
				return this.resolvedLogoCache.get(cacheKey);
			}
			const logo = logoResolver.getLogo(teamName, customMappings);
			this.resolvedLogoCache.set(cacheKey, logo);
			return logo;
		};

		// 1. Resolve logos for standard league tables
		if (data.teams && Array.isArray(data.teams)) {
			data.teams.forEach((team) => {
				if (team.name) {
					team.logo = getCachedLogo(team.name);
				}
			});
		}

		// 2. Resolve logos for groups (World Cup/UEFA)
		if (data.groups) {
			Object.keys(data.groups).forEach((groupName) => {
				if (Array.isArray(data.groups[groupName])) {
					data.groups[groupName].forEach((team) => {
						if (team.name) {
							team.logo = getCachedLogo(team.name);
						}
					});
				}
			});
		}

		// 2b. Resolve logos for split-league multi-group data (Romania, Austria etc.)
		if (Array.isArray(data.splitGroups)) {
			data.splitGroups.forEach((group) => {
				if (Array.isArray(group.teams)) {
					group.teams.forEach((team) => {
						if (team.name) team.logo = getCachedLogo(team.name);
					});
				}
			});
		}

		// 3. Resolve logos for fixtures
		if (data.fixtures && Array.isArray(data.fixtures)) {
			data.fixtures.forEach((fixture) => {
				if (fixture.homeTeam) {
					fixture.homeLogo = getCachedLogo(fixture.homeTeam);
				}
				if (fixture.awayTeam) {
					fixture.awayLogo = getCachedLogo(fixture.awayTeam);
				}
			});
		}

		// 4. Resolve logos for knockout stages
		if (data.knockouts) {
			Object.keys(data.knockouts).forEach((stage) => {
				if (Array.isArray(data.knockouts[stage])) {
					data.knockouts[stage].forEach((fixture) => {
						if (fixture.homeTeam) {
							fixture.homeLogo = getCachedLogo(fixture.homeTeam);
						}
						if (fixture.awayTeam) {
							fixture.awayLogo = getCachedLogo(fixture.awayTeam);
						}
					});
				}
			});
		}

		// 5. Resolve logos for uefaStages (Task: Staged Approach)
		if (data.uefaStages) {
			["results", "today", "future"].forEach((sKey) => {
				if (Array.isArray(data.uefaStages[sKey])) {
					data.uefaStages[sKey].forEach((fixture) => {
						if (fixture.homeTeam)
							fixture.homeLogo = getCachedLogo(fixture.homeTeam);
						if (fixture.awayTeam)
							fixture.awayLogo = getCachedLogo(fixture.awayTeam);
					});
				}
			});
		}

		return data;
	},

	// Node helper started
	start() {
		this.log(3, "CORE", "Starting node helper");
		this.config = null;

		// Initialize cache manager
		this.cache = new CacheManager(__dirname);

		// Monthly fixture cache to track last fetch time per month (P-03)
		this.fixtureCache = {};

		// Server-side logo cache to reduce lookup overhead
		this.resolvedLogoCache = new Map();

		// Initialize parsers
		this.bbcParser = new BBCParser();
		this.fifaParser = new FIFAParser();
		this.soccerwayParser = new SoccerwayParser();
		this.wikipediaParser = new WikipediaParser();
		this.espnParser = new ESPNParser();
		this.googleParser = new GoogleParser();

		// Start periodic cache cleanup
		this.startCacheCleanup();

		// Configure shared request manager
		requestManager.updateConfig({
			minRequestInterval: 2000,
			minDomainInterval: 1000,
			maxRetries: 3,
			requestTimeout: 10000
		});
	},

	/**
	 * SEC-04: Strip sensitive keys from config before logging
	 * @param {Object} config - The module configuration
	 * @returns {Object} - Safe configuration for logging
	 */
	_getSafeConfig(config) {
		if (!config) return {};
		const safe = { ...config };
		const sensitiveKeys = ["apiKey", "api_key", "token", "password", "secret"];
		sensitiveKeys.forEach((key) => {
			if (key in safe) safe[key] = "********";
		});
		return safe;
	},

	// Handle socket notifications from the module
	async socketNotificationReceived(notification, payload) {
		if (notification === "GET_LEAGUE_DATA") {
			this.config = payload;

			// CACHE-05: Scale memory cache to number of enabled leagues
			if (payload.leagues && Array.isArray(payload.leagues)) {
				this.cache.setMaxMemoryEntries(payload.leagues.length);
			}

			// Propagate config to all registered parsers
			if (this.bbcParser) this.bbcParser.setConfig(payload);
			if (this.fifaParser) this.fifaParser.setConfig(payload);
			if (this.soccerwayParser) this.soccerwayParser.setConfig(payload);
			if (this.wikipediaParser) this.wikipediaParser.setConfig(payload);
			if (this.espnParser) this.espnParser.setConfig(payload);
			if (this.googleParser) this.googleParser.setConfig(payload);

			this.sendDebugInfo("Received request for " + payload.leagueType);
			if (payload.parallelProviderRacing && payload.providerChain && payload.providerChain.length > 1) {
				this.fetchLeagueDataParallel(payload.leagueType, payload);
			} else {
				this.fetchLeagueData(payload.url, payload.leagueType, payload);
			}
		} else if (notification === "CACHE_GET_STATS") {
			const stats = await this.cache.getStats();
			this.sendSocketNotification("CACHE_STATS", stats);
		} else if (notification === "CACHE_CLEAR_ALL") {
			const cleared = await this.cache.clearAll();

			// Also clear in-memory caches
			this.fixtureCache = {};
			this.resolvedLogoCache.clear();

			this.sendSocketNotification("CACHE_CLEARED", { cleared: cleared });
			this.log(
				3, "CACHE", `All caches cleared (${cleared} disk files removed, fixture cache reset, logo cache reset)`
			);
		} else if (notification === "CACHE_CLEANUP") {
			const deleted = await this.cache.cleanupExpired();
			this.sendSocketNotification("CACHE_CLEANUP_DONE", { deleted: deleted });
			this.log(
				3, "CACHE", `Cache cleanup complete (${deleted} expired files removed)`
			);
		}
	},

	// Helper: select the appropriate parser instance and display name for a given provider string.
	// Provider is detected from the explicit provider name or inferred from the URL domain.
	_getParser(providerName, url) {
		const p = (providerName || "auto").toLowerCase();
		const u = url || "";
		if (p === "google" || (p === "auto" && u.includes("google.com"))) {
			return { parser: this.googleParser, name: "Google Search" };
		}
		if (p === "fifa" || (p === "auto" && u.includes("fifa.com"))) {
			return { parser: this.fifaParser, name: "FIFA.com" };
		}
		if (p === "soccerway" || (p === "auto" && u.includes("soccerway.com"))) {
			return { parser: this.soccerwayParser, name: "Soccerway" };
		}
		if (p === "wikipedia" || (p === "auto" && u.includes("wikipedia.org"))) {
			return { parser: this.wikipediaParser, name: "Wikipedia" };
		}
		if (p === "espn" || (p === "auto" && u.includes("espn.com"))) {
			return { parser: this.espnParser, name: "ESPN" };
		}
		return { parser: this.bbcParser, name: "BBC Sport" };
	},

	/**
	 * INNOV-05: Parallel provider racing with Promise.any()
	 * Fetches from all providers in the chain simultaneously and uses the first successful result.
	 * @param {string} leagueType - League identifier
	 * @param {Object} config - The module configuration
	 */
	async fetchLeagueDataParallel(leagueType, config) {
		const debug = config && config.debug;
		const providerChain = config.providerChain || [];

		this.log(4, "FETCH", `[INNOV-05] Racing ${providerChain.length} providers for ${leagueType}...`);

		// PROACTIVE CACHING: Serve any valid cached data immediately while racing fresh fetches.
		const cachedData = await this.cache.get(leagueType);
		if (cachedData) {
			const isValid = this.isDataComplete(
				cachedData,
				leagueType,
				config && config.splitConfig
			);
			if (isValid) {
				cachedData.leagueType = leagueType;
				cachedData.fromCache = true;
				this.sendSocketNotification(
					"LEAGUE_DATA",
					this.resolveLogos(cachedData, config)
				);
			}
		}

		// Create individual fetch promises for each provider in the chain
		const fetchPromises = providerChain.map(async (entry, index) => {
			try {
				// We call fetchLeagueData with a special flag to prevent further recursion/cascading
				// but still leverage the existing parser/fetcher logic.
				// NOTE: We pass a mock config with empty chain to prevent fetchLeagueData from trying fallbacks itself
				const raceConfig = { ...config, providerChain: [], parallelRacingInternal: true };
				const result = await this.fetchLeagueDataForRace(entry.url, leagueType, raceConfig, entry.provider);
				
				if (result && this.isDataComplete(result, leagueType, config.splitConfig)) {
					this.log(3, "FETCH", `[INNOV-05] Provider ${entry.provider} won the race for ${leagueType}!`);
					return result;
				}
				throw new Error(`Incomplete data from ${entry.provider}`);
			} catch (err) {
				this.log(4, "FETCH", `[INNOV-05] Provider ${entry.provider} failed race: ${err.message}`);
				throw err;
			}
		});

		try {
			// Race all providers. Promise.any returns the first fulfilled promise.
			const winnerData = await Promise.any(fetchPromises);
			
			// Process winner data
			winnerData.leagueType = leagueType;
			winnerData.fromCache = false;
			
			// Save to cache
			await this.cache.set(leagueType, winnerData);
			
			// Resolve logos and send to frontend
			this.sendSocketNotification(
				"LEAGUE_DATA",
				this.resolveLogos(winnerData, config)
			);
		} catch (aggregateError) {
			this.log(1, "FETCH", `[INNOV-05] All providers failed for ${leagueType}. Falling back to cache.`);
			// If all fail, the UI will rely on the cached data already sent or show error if none.
			// No further action needed as cached data was already sent proactively.
		}
	},

	/**
	 * Helper for fetchLeagueDataParallel to run a single fetch attempt without chain recursion.
	 */
	async fetchLeagueDataForRace(url, leagueType, config, providerStr) {
		// Detect parser
		const { parser } = this._getParser(providerStr, url);
		
		// Special handling for UEFA/FIFA complex URLs
		if (typeof url === "object" && url !== null && url.table && url.fixtures) {
			return this.fetchUEFACompetitionDataInternal(url, leagueType, config);
		}
		if (leagueType === "WORLD_CUP_2026") {
			return this.fetchFIFAWorldCup2026Internal(url, config);
		}

		const html = await this.fetchWebPage(url);
		const leagueData = parser.parseLeagueData(
			html,
			leagueType,
			config.splitConfig || null
		);

		return leagueData;
	},

	// Main function to fetch league data.
	// chainIndex: position within config.providerChain (0 = primary, 1+ = fallback providers).
	// isFallback is kept for backward compatibility when providerChain is not set.
	async fetchLeagueData(url, leagueType, config, chainIndex = 0) {
		const debug = config && config.debug;
		const useMockData = config && config.useMockData;
		const providerChain =
			config && Array.isArray(config.providerChain) ? config.providerChain : [];

		// INNOV-05: Parallel provider racing with Promise.any()
		// If enabled and we have multiple providers, race them all at once.
		if (config.enableParallelRacing && providerChain.length > 1 && chainIndex === 0) {
			this.log(3, "FETCH", `[${leagueType}] [INNOV-05] Starting parallel racing for ${providerChain.length} providers...`);
			
			// PROACTIVE CACHING: Serve cached data immediately while racing
			const cachedData = await this.cache.get(leagueType);
			if (cachedData) {
				const isValid = this.isDataComplete(cachedData, leagueType, config.splitConfig);
				if (isValid) {
					cachedData.leagueType = leagueType;
					cachedData.fromCache = true;
					this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(cachedData, config));
				}
			}

			// Define racing task
			const raceTask = async (entry, index) => {
				const { parser, name: providerName } = this._getParser(entry.provider, entry.url);
				try {
					const html = await this.fetchWebPage(entry.url);
					const data = parser.parseLeagueData(html, leagueType, config.splitConfig || null);
					
					if (data && this.isDataComplete(data, leagueType, config.splitConfig)) {
						this.log(3, "FETCH", `[${leagueType}] [INNOV-05] WINNER: ${providerName} (Index: ${index})`);
						data.provider = providerName;
						data.fromCache = false;
						return data;
					}
					throw new Error(`Incomplete data from ${providerName}`);
				} catch (err) {
					this.log(4, "FETCH", `[${leagueType}] [INNOV-05] Provider ${entry.provider} failed: ${err.message}`);
					throw err;
				}
			};

			try {
				// Promise.any resolves as soon as ANY provider returns valid data.
				// It rejects with AggregateError if ALL fail.
				const winnerData = await Promise.any(providerChain.map((entry, idx) => raceTask(entry, idx)));
				
				winnerData.leagueType = leagueType;
				this.cache.set(leagueType, winnerData);
				this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(winnerData, config));
				return winnerData;
			} catch (aggregateError) {
				this.log(1, "FETCH", `[${leagueType}] [INNOV-05] ALL providers failed racing. Falling back to cache.`);
				// If all failed, fall back to whatever is in cache (even if incomplete)
				const cachedData = await this.cache.get(leagueType);
				if (cachedData) {
					cachedData.leagueType = leagueType;
					cachedData.fromCache = true;
					this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(cachedData, config));
				}
				return null;
			}
		}

		// Determine current provider from chain entry or fall back to config.provider / auto-detect.
		const chainEntry = providerChain[chainIndex];
		const currentProviderStr = chainEntry
			? chainEntry.provider
			: config && config.provider
			? config.provider
			: "auto";
		const chainInfo = `index ${chainIndex}/${providerChain.length}`;

		this.log(4, "FETCH", `Fetching ${leagueType} (${chainInfo}, Provider: ${currentProviderStr})...`);
		this.cache.setDebug(true);

		// Convenience: tries the next provider in the chain or falls to cache.
		const tryNextProvider = async (reason) => {
			const nextIdx = chainIndex + 1;
			if (nextIdx < providerChain.length) {
				this.log(
					4, "FETCH", `[${leagueType}] ${reason}. Trying next provider: ${providerChain[nextIdx].provider}`
				);
				return this.fetchLeagueData(
					providerChain[nextIdx].url,
					leagueType,
					config,
					nextIdx
				);
			}

			// Legacy single fallbackUrl support (when no providerChain is available).
			const legacyFallback = config && config.fallbackUrl;
			if (legacyFallback && chainIndex === 0 && providerChain.length === 0) {
				this.log(
					4, "FETCH", `[${leagueType}] ${reason}. Trying legacy fallbackUrl.`
				);
				return this.fetchLeagueData(legacyFallback, leagueType, config, 999);
			}

			return null; // Signals caller to fall through to cache-only handling.
		};

		// Handle Mock Data for non-WC leagues (simulated)
		if (useMockData && leagueType !== "WORLD_CUP_2026") {
			this.log(4, "CORE", `[MOCK MODE] Generating mock data for ${leagueType}`);
			const cachedData = await this.cache.get(leagueType);
			if (cachedData) {
				cachedData.leagueType = leagueType;
				cachedData.fromCache = true;
				cachedData.isMock = true;
				this.sendSocketNotification(
					"LEAGUE_DATA",
					this.resolveLogos(cachedData, config)
				);
				return;
			}
		}

		// Handle UEFA competitions with separate table and fixture URLs
		if (typeof url === "object" && url !== null && url.table && url.fixtures) {
			return this.fetchUEFACompetitionData(url, leagueType, config, tryNextProvider);
		}

		// Handle FIFA World Cup 2026 specifically if needed
		if (leagueType === "WORLD_CUP_2026") {
			if (!url) {
				this.log(1, "FETCH", "[WORLD_CUP_2026] Skipping fetch - URL is undefined");
				const fallbackData = await this.cache.get("WORLD_CUP_2026");
				if (fallbackData) {
					fallbackData.leagueType = "WORLD_CUP_2026";
					fallbackData.fromCache = true;
					this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(fallbackData, config));
				} else {
					this.sendSocketNotification("FETCH_ERROR", { category: "Invalid URL", userMessage: "No valid URL for WORLD_CUP_2026", leagueType: "WORLD_CUP_2026" });
				}
				return;
			}
			return this.fetchFIFAWorldCup2026(url, config);
		}

		// PROACTIVE CACHING: Serve any valid cached data immediately while a fresh fetch runs.
		// Only do this on the first attempt (chainIndex === 0) to avoid repeat sends.
		if (chainIndex === 0) {
			const cachedData = await this.cache.get(leagueType);
			if (cachedData) {
				const isValid = this.isDataComplete(
					cachedData,
					leagueType,
					config && config.splitConfig
				);
				this.log(
					4, "CACHE", `[${leagueType}] Cached data is ${
						isValid ? "complete" : "incomplete"
					}`
				);
				if (isValid) {
					cachedData.leagueType = leagueType;
					cachedData.fromCache = true;
					this.sendSocketNotification(
						"LEAGUE_DATA",
						this.resolveLogos(cachedData, config)
					);
				}
			}
		}

		// Select the right parser for the current URL / provider.
		const { parser, name: providerName } = this._getParser(
			currentProviderStr,
			url
		);

		try {
		// Guard: if url is undefined or null at this point all providers have been
		// exhausted or a race condition delivered an undefined url. Log and bail out
		// rather than passing undefined to fetchWebPage (which throws an unhelpful
		// "Failed to parse URL from undefined" error that floods the log).
		if (!url || typeof url !== "string") {
			this.log(1, "FETCH", `[${leagueType}] Skipping fetch - URL is ${url === undefined ? "undefined" : String(url)} (provider: ${providerName})`);
			const advanced = await tryNextProvider("Invalid URL detected");
			if (advanced !== null) return;
			const fallbackData = await this.cache.get(leagueType);
			if (fallbackData) {
				fallbackData.leagueType = leagueType;
				fallbackData.fromCache = true;
				fallbackData.cacheFallback = true;
				this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(fallbackData, config));
			} else {
				this.sendSocketNotification("FETCH_ERROR", {
					category: "Invalid URL",
					userMessage: `No valid URL available for ${leagueType}`,
					leagueType: leagueType
				});
			}
			return;
		}

			const html = await this.fetchWebPage(url);
			this.log(
				4, "FETCH", `[${leagueType}] Fetched HTML from ${providerName} (${url.substring(
					0,
					80
				)}...)`
			);

			let leagueData = parser.parseLeagueData(
				html,
				leagueType,
				config.splitConfig || null
			);

			// For split leagues: detect when the parser returned the full pre-split table
			// instead of the post-split championship group. This happens because the
			// WikipediaParser (and others) may not have received splitConfig if the shared
			// parser's this.config was overwritten by a concurrent request (race condition).
			// The direct splitConfig param (above) fixes the race, but this guard catches
			// any residual cases where we still get too many teams.
			if (
				config.splitConfig &&
				leagueData &&
				Array.isArray(leagueData.teams) &&
				leagueData.teams.length > 0 &&
				!leagueData.splitGroups
			) {
				const splitCfg = config.splitConfig;
				// Use groups array sum when available (handles 3-group leagues like Belgium)
				const fullSeasonCount =
					Array.isArray(splitCfg.groups) && splitCfg.groups.length > 0
						? splitCfg.groups.reduce((sum, g) => sum + (g.size || 0), 0)
						: (splitCfg.championshipSize || 0) + (splitCfg.relegationSize || 0);
				// Determine how far into the season we are by taking the maximum
				// games-played value across all returned teams.
				const maxPlayed = leagueData.teams.reduce(
					(max, t) => Math.max(max, t.played || 0),
					0
				);

				// Phase 2 is underway when at least the leading team has played
				// more games than the Phase 1 total (regularSeasonGames).
				const phase2Started = maxPlayed > splitCfg.regularSeasonGames;

				// Phase 1 is complete but Phase 2 groups have not been formed yet.
				// This is the normal transition window between the two phases.
				const awaitingSplitAnnouncement =
					!phase2Started && maxPlayed >= splitCfg.regularSeasonGames;

				if (awaitingSplitAnnouncement) {
					// Phase 1 is over but the split has not been announced yet.
					// Every provider will return the same full Phase 1 table right now,
					// so escalating to the next provider is pointless and wastes resources.
					// Mark the data with awaitingSplit so the frontend can display a
					// clear indicator (e.g. "Phase 1 Final / Awaiting Split").
					leagueData.awaitingSplit = true;
					this.log(4, "FETCH", `[${leagueType}] Phase 1 complete (max played: ${maxPlayed}/${splitCfg.regularSeasonGames}). Awaiting split announcement — serving Phase 1 final standings.`);
				} else {
					// Phase 2 has started — check whether the returned table is correct.
					// Case 1: Provider returned the full pre-split table (wrong — too many teams).
					const gotPreSplitTable =
						phase2Started && leagueData.teams.length >= fullSeasonCount;
					// Case 2: Provider returned only one group when we need all groups.
					const gotSingleGroupOnly =
						phase2Started &&
						splitCfg.showAllGroups &&
						leagueData.teams.length < fullSeasonCount;

					if (gotPreSplitTable || gotSingleGroupOnly) {
						const escalateReason = gotPreSplitTable
							? `Phase 2 started but pre-split full table returned (${leagueData.teams.length} teams, expected ${splitCfg.championshipSize})`
							: `Phase 2 started but single-group table returned (${leagueData.teams.length} teams) while showAllGroups=true`;
						this.log(4, "FETCH", `[${leagueType}] ${escalateReason}. Escalating to next provider.`);
						const advanced = await tryNextProvider(escalateReason);
						if (advanced !== null) return;
						leagueData.incomplete = true;
					}
				}
			}

			if (leagueData && leagueData.teams && leagueData.teams.length > 0) {
				leagueData.leagueType = leagueType;
				leagueData.source = providerName;

				const isFreshComplete = this.isDataComplete(
					leagueData,
					leagueType,
					config && config.splitConfig
				);

				if (!isFreshComplete) {
					this.log(4, "FETCH", `[${leagueType}] Data from ${providerName} is incomplete (${leagueData.teams.length} teams, all-zero stats or no form).`);

					// Check if the cache holds better data before escalating the chain.
					const existingCache = await this.cache.get(leagueType);
					if (
						existingCache &&
						this.isDataComplete(
							existingCache,
							leagueType,
							config && config.splitConfig
						)
					) {
						this.log(4, "CACHE", `[${leagueType}] Cache has complete data; serving that instead.`);
						existingCache.leagueType = leagueType;
						existingCache.fromCache = true;
						existingCache.cacheFallback = true;
						this.sendSocketNotification(
							"LEAGUE_DATA",
							this.resolveLogos(existingCache, config)
						);
						return;
					}

					// No usable cache - escalate to next provider in the chain.
					const advanced = await tryNextProvider(
						`${providerName} returned incomplete data`
					);
					if (advanced !== null) return; // Next provider handled it.

					// All providers exhausted; serve what we have with an incomplete flag.
					leagueData.incomplete = true;
				}

				await this.cache.set(leagueType, leagueData);
				this.sendDebugInfo("Sending LEAGUE_DATA for " + leagueType);
				this.sendSocketNotification(
					"LEAGUE_DATA",
					this.resolveLogos(leagueData, config)
				);
			} else {
				// Parser returned no teams - try next provider.
				const advanced = await tryNextProvider(
					`${providerName} returned no team data`
				);
				if (advanced !== null) return;

				throw new Error(`No ${leagueType} data parsed from any provider`);
			}
		} catch (error) {
			// HTTP / network error - try next provider before giving up.
			this.log(1, "FETCH", `[${leagueType}] Error from ${providerName}: ${error.message}`);

			const advanced = await tryNextProvider(
				`${providerName} fetch/parse error`
			);
			if (advanced !== null) return;

			// All providers failed - log and fall back to cached data.
			this.sendDebugInfo("Error fetching " + leagueType, error.message);
			console.error(
				` MMM-MyTeams-LeagueTable: All providers failed for ${leagueType}:`,
				error.message
			);

			const fallbackData = await this.cache.get(leagueType);
			if (fallbackData) {
				fallbackData.leagueType = leagueType;
				fallbackData.fromCache = true;
				fallbackData.cacheFallback = true;
				this.sendSocketNotification(
					"LEAGUE_DATA",
					this.resolveLogos(fallbackData, config)
				);
			} else {
				const errorInfo = this.categorizeError(error);
				this.sendSocketNotification("FETCH_ERROR", {
					...errorInfo,
					leagueType: leagueType
				});
			}
		}
	},

	/**
	 * Check if the league data is complete (e.g. contains form tokens)
	 * @param {Object} data - League data object
	 * @param {string} leagueType - League type
	 * @returns {boolean} - True if complete
	 */
	isDataComplete(data, leagueType, splitConfig) {
		if (
			!data ||
			!data.teams ||
			!Array.isArray(data.teams) ||
			data.teams.length === 0
		) {
			return false;
		}

		// INNOV-06: For start-of-season (July/August/Sept), we accept zero-stat data if the team count is correct.
		// Respect dateTimeOverride if provided in config
		const now =
			this.config && this.config.dateTimeOverride
				? new Date(this.config.dateTimeOverride)
				: new Date();
		const currentMonth = now.getMonth(); // 0-indexed, 6=July, 7=August, 8=September
		
		// INNOV-06: Calendar-year leagues (Norway, Sweden, etc.) start in March/April.
		// For these, July is mid-season, so the "start of season" window should not apply.
		const calendarYearLeagues = [
			"NORWAY_ELITESERIEN",
			"SWEDEN_ALLSVENSKAN",
			"IRELAND_PREMIER_LEAGUE",
			"ICELAND_PREMIER_LEAGUE",
			"USA_MLS",
			"JAPAN_J1_LEAGUE",
			"SOUTH_KOREA_K_LEAGUE_1",
			"BELARUS_VYSSHAYA_LIGA",
			"KAZAKHSTAN_PREMIER_LEAGUE",
			"ESTONIA_MEISTRILIIGA",
			"LATVIA_VIRSLIGA",
			"LITHUANIA_A_LYGA",
			"FAROE_ISLANDS_PREMIER_LEAGUE",
			"FINLAND_VEIKKAUSLIIGA",
			"GEORGIA_EROVNULI_LIGA"
		];
		const isCalendarYearLeague = calendarYearLeagues.includes(leagueType);
		const isStartOfSeasonWindow = !isCalendarYearLeague && currentMonth >= 6 && currentMonth <= 8;

		// For split leagues that require all groups: cached data lacking splitGroups is stale.
		// This prevents single-group BBC data from being served from cache for post-split leagues.
		// EXCEPTION: awaitingSplit data (Phase 1 final standings) is valid — the split simply
		// has not been announced yet.  Treat it as complete so it can be cached and served.
		if (splitConfig && splitConfig.showAllGroups && !data.splitGroups && !isStartOfSeasonWindow) {
			if (data.awaitingSplit) {
				return true;
			}
			return false;
		}

		// World Cup and other knockout-heavy leagues might not have form in the same way
		if (leagueType === "WORLD_CUP_2026" || leagueType.includes("UEFA")) {
			return true;
		}

		// BBC phase-2 split group tables do not include form data ("No Result" placeholders).
		// When splitGroups is already correctly populated (>=2 groups), the data is valid
		// and must not be rejected just because form tokens are absent.
		if (data.splitGroups && Array.isArray(data.splitGroups) && data.splitGroups.length >= 2) {
			this.log(4, "CORE", `[isDataComplete] ${leagueType}: split data with ${data.splitGroups.length} groups — skipping form check.`);
			return true;
		}

		const debug = this.config && this.config.debug;

		// Check if ALL teams have zero stats (played, points, won all zero).
		// This indicates a stub or transitional page (e.g. BBC during a league-split period)
		// rather than genuine start-of-season data where the team count would be wrong too.
		// We require >3 teams to avoid false positives on tiny cup-phase groups.
		// INNOV-06: For start-of-season (July/August), we accept zero-stat data if the team count is correct.
		const allStatsZero =
			data.teams.length > 3 &&
			data.teams.every(
				(t) =>
					(t.played || 0) === 0 && (t.points || 0) === 0 && (t.won || 0) === 0
			);

		if (allStatsZero && !isStartOfSeasonWindow) {
			this.log(4, "CORE", `[isDataComplete] ${leagueType}: All ${data.teams.length} teams have zero stats - stub/split page detected, marking incomplete.`);
			return false;
		}

		// Fallback providers (Wikipedia, ESPN, Google, Soccerway) do not supply form data.
		// For these sources, completeness is based on having non-zero stats rather than form.
		// BBC Sport is the only provider expected to supply form tokens.
		const fallbackSources = ["Wikipedia", "ESPN", "Google Search", "Soccerway"];
		const isFallbackSource = fallbackSources.includes(data.source);

		if (isFallbackSource) {
			// For fallback providers: data is complete if majority of teams have played games.
			// INNOV-06: During start-of-season, we accept 0 games played.
			const teamsWhoPlayed = data.teams.filter((t) => (t.played || 0) > 0);
			const complete =
				isStartOfSeasonWindow || 
				teamsWhoPlayed.length >= Math.ceil(data.teams.length * 0.5);
			this.log(4, "CORE", `[isDataComplete] ${leagueType} (source: ${data.source}): ${teamsWhoPlayed.length}/${data.teams.length} teams played. Complete: ${complete} (Season Window: ${isStartOfSeasonWindow})`);
			return complete;
		}

		// For BBC Sport: check that at least some teams have form data.
		// Form is an array of result objects populated by the BBC parser.
		const teamsWithForm = data.teams.filter(
			(t) => Array.isArray(t.form) && t.form.length > 0
		);

		this.log(4, "CORE", `[isDataComplete] ${leagueType}: ${teamsWithForm.length}/${data.teams.length} teams have form.`);

		// If no teams have form, check whether games have been played.
		// If games have been played but no form is found, BBC is returning a stub page.
		if (data.teams.length > 0 && teamsWithForm.length === 0) {
			const teamsWhoPlayed = data.teams.filter((t) => (t.played || 0) > 0);
			if (teamsWhoPlayed.length > 0) {
				this.log(4, "CORE", `[isDataComplete] ${leagueType} has played games but no form from BBC. Marking as incomplete.`);
				return false;
			}
		}

		if (isStartOfSeasonWindow && data.teams.length > 0) {
			this.log(4, "CORE", `[isDataComplete] ${leagueType}: Accepting data without form due to start-of-season window.`);
			return true;
		}

		return teamsWithForm.length / data.teams.length > 0.5;
	},

	// Fetch and parse FIFA World Cup 2026 data core logic
	async fetchFIFAWorldCup2026Internal(url, config) {
		const leagueType = "WORLD_CUP_2026";
		const useMockData = config && config.useMockData;

		try {
			// Handle Mock Data specifically for World Cup
			if (useMockData) {
				this.log(4, "CORE", "[MOCK MODE] Generating World Cup mock data");
				this.fifaParser.setConfig(config);
				let mockData = this.fifaParser.generateMockWC2026Data();
				mockData.fromCache = false;
				mockData.isMock = true;
				// Resolve placeholders even for mock data to show realistic teams in bracket
				mockData = this.fifaParser.resolveWCPlaceholders(mockData);
				return mockData;
			}

			// Fetch both BBC pages: tables and fixtures
			// Handle single URL or array of URLs for fixtures
			const fixtureUrls = Array.isArray(url) ? url : [url];
			const tablesUrl = "https://www.bbc.co.uk/sport/football/world-cup/table";

			const fetchPromises = [this.fetchWebPage(tablesUrl)];
			fixtureUrls.forEach((fUrl) =>
				fetchPromises.push(this.fetchWebPage(fUrl))
			);

			const [tablesHtml, ...fixturesHtmlParts] = await Promise.all(
				fetchPromises
			);

			// Parse groups from tables page
			this.fifaParser.setConfig(config);
			const groups = this.fifaParser.parseFIFAWorldCupTablesBBC(tablesHtml);

			// Parse fixtures from all fixture pages and merge them
			let allFixtures = [];
			fixturesHtmlParts.forEach((fHtml) => {
				const partData = this.fifaParser.parseFIFAWorldCupData("", fHtml);
				if (partData && partData.fixtures) {
					allFixtures = allFixtures.concat(partData.fixtures);
				}
			});

			// Deduplicate fixtures by matchNo
			const uniqueFixturesMap = new Map();
			allFixtures.forEach((f) => {
				if (f.matchNo) {
					uniqueFixturesMap.set(f.matchNo, f);
				} else {
					// For fixtures without matchNo (if any), use a synthetic key
					const key = `${f.date}_${f.homeTeam}_${f.awayTeam}`;
					uniqueFixturesMap.set(key, f);
				}
			});

			const mergedFixtures = Array.from(uniqueFixturesMap.values());

			// Create final data object
			let data = {
				groups: groups,
				fixtures: mergedFixtures,
				knockouts: {
					rd32: mergedFixtures.filter((f) => f.stage === "Rd32"),
					rd16: mergedFixtures.filter((f) => f.stage === "Rd16"),
					qf: mergedFixtures.filter((f) => f.stage === "QF"),
					sf: mergedFixtures.filter((f) => f.stage === "SF"),
					tp: mergedFixtures.filter((f) => f.stage === "TP"),
					final: mergedFixtures.filter((f) => f.stage === "Final")
				},
				lastUpdated: new Date().toISOString(),
				source: "BBC Sport",
				leagueType: leagueType
			};

			if (data && data.groups && Object.keys(data.groups).length > 0) {
				data.leagueType = leagueType;
				data = this.fifaParser.resolveWCPlaceholders(data);
				return data;
			} else {
				throw new Error("No World Cup data parsed from website");
			}
		} catch (error) {
			console.error(
				" MMM-MyTeams-LeagueTable: Error fetching World Cup data internal:",
				error.message
			);
			throw error;
		}
	},

	// Fetch and parse FIFA World Cup 2026 data with socket side effects
	async fetchFIFAWorldCup2026(url, config) {
		const leagueType = "WORLD_CUP_2026";
		try {
			// PROACTIVE CACHING: Serve cached World Cup data immediately
			const cachedData = await this.cache.get(leagueType);
			if (cachedData) {
				this.log(4, "CACHE", "Serving cached World Cup data immediately");
				cachedData.fromCache = true;
				this.fifaParser.setConfig(config);
				const resolvedCached =
					this.fifaParser.resolveWCPlaceholders(cachedData);
				this.sendSocketNotification(
					"LEAGUE_DATA",
					this.resolveLogos(resolvedCached, config)
				);
			}

			const data = await this.fetchFIFAWorldCup2026Internal(url, config);
			
			if (data) {
				data.fromCache = false;
				await this.cache.set(leagueType, data);
				this.sendSocketNotification(
					"LEAGUE_DATA",
					this.resolveLogos(data, config)
				);
			}
		} catch (error) {
			console.error(
				" MMM-MyTeams-LeagueTable: Error fetching World Cup data:",
				error.message
			);

			// Only fallback to cache if we haven't already served it during this fetch
			const fallbackData = await this.cache.get(leagueType);
			if (fallbackData) {
				this.log(
					" MMM-MyTeams-LeagueTable: Using cached World Cup data as fallback"
				);
				fallbackData.fromCache = true;
				fallbackData.cacheFallback = true;
				const resolvedFallback =
					this.fifaParser.resolveWCPlaceholders(fallbackData);
				this.sendSocketNotification(
					"LEAGUE_DATA",
					this.resolveLogos(resolvedFallback, config)
				);
			} else {
				const errorInfo = this.categorizeError(error);
				this.sendSocketNotification("FETCH_ERROR", {
					...errorInfo,
					leagueType: leagueType
				});
			}
		}
	},

	// Fetch and parse UEFA Competition data (UCL, UEL, ECL)
	/**
	 * Internal core logic for fetchUEFACompetitionData without socket side effects
	 */
	async fetchUEFACompetitionDataInternal(urls, leagueType, config) {
		const now = new Date();
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth(); // 0-11
		const formatMonth = (y, m) => `${y}-${String(m + 1).padStart(2, "0")}`;

		const monthsToFetch = [];
		const cachedMonthParts = [];

		for (let i = 0; i <= 4; i++) {
			const d = new Date(currentYear, currentMonth + i, 1);
			const monthStr = formatMonth(d.getFullYear(), d.getMonth());
			const isFuture = i > 0;
			const oneDay = 24 * 60 * 60 * 1000;

			const baseKey = `${leagueType}_${monthStr}_base`;
			const resKey = `${leagueType}_${monthStr}_results`;
			const lastFetch = Math.min(
				this.fixtureCache[baseKey]?.timestamp || 0,
				this.fixtureCache[resKey]?.timestamp || 0
			);

			if (!isFuture || Date.now() - lastFetch > oneDay) {
				monthsToFetch.push(monthStr);
			} else {
				if (this.fixtureCache[baseKey])
					cachedMonthParts.push(this.fixtureCache[baseKey].html);
				if (this.fixtureCache[resKey])
					cachedMonthParts.push(this.fixtureCache[resKey].html);
			}
		}

		const fixtureFetchPromises = [
			this.fetchWebPage(urls.fixtures)
				.then((html) => {
					const curMonthStr = formatMonth(currentYear, currentMonth);
					this.fixtureCache[`${leagueType}_${curMonthStr}_base`] = {
						html,
						timestamp: Date.now()
					};
					return html;
				})
				.catch(() => "")
		];

		monthsToFetch.forEach((month) => {
			const baseMonthlyUrl = `${urls.fixtures}/${month}`;
			const variants = [
				{ url: baseMonthlyUrl, type: "base" },
				{ url: `${baseMonthlyUrl}?filter=results`, type: "results" }
			];

			variants.forEach((variant) => {
				fixtureFetchPromises.push(
					this.fetchWebPage(variant.url)
						.then((html) => {
							const cacheKey = `${leagueType}_${month}_${variant.type}`;
							this.fixtureCache[cacheKey] = { html, timestamp: Date.now() };
							return html;
						})
						.catch(() => "")
				);
			});
		});

		const results = await Promise.all([
			this.fetchWebPage(urls.table).catch(() => ""),
			...fixtureFetchPromises
		]);

		const [tableHtml, ...fixturesHtmlParts] = results;
		const allHtml = fixturesHtmlParts.concat(cachedMonthParts);

		this.bbcParser.setConfig(config);
		const tableData = this.bbcParser.parseLeagueData(tableHtml, leagueType);
		const fixtureData = this.bbcParser.parseUEFAFixtures(allHtml, leagueType);

		return {
			teams: tableData.teams,
			fixtures: fixtureData.fixtures,
			uefaStages: fixtureData.uefaStages,
			knockouts: fixtureData.knockouts,
			lastUpdated: new Date().toISOString(),
			source: "BBC Sport",
			leagueType: leagueType
		};
	},

	async fetchUEFACompetitionData(urls, leagueType, config, tryNextProvider) {
		try {
			// PROACTIVE CACHING: Serve cached data immediately
			const cachedData = await this.cache.get(leagueType);
			if (cachedData) {
				this.log(4, "CACHE", `Serving cached ${leagueType} data immediately`);
				cachedData.leagueType = leagueType;
				cachedData.fromCache = true;
				this.sendSocketNotification(
					"LEAGUE_DATA",
					this.resolveLogos(cachedData, config)
				);
			}

			const data = await this.fetchUEFACompetitionDataInternal(urls, leagueType, config);

			if (data && data.teams && data.teams.length > 0) {
				data.fromCache = false;
				await this.cache.set(leagueType, data);
				this.sendSocketNotification(
					"LEAGUE_DATA",
					this.resolveLogos(data, config)
				);
			} else {
				throw new Error(`No ${leagueType} teams parsed`);
			}
		} catch (error) {
			if (tryNextProvider) {
				return tryNextProvider(`${leagueType} fetch failed: ${error.message}`);
			}

			const categorized = this.categorizeError(error);
			this.log(1, "FETCH", `${leagueType} fetch failed: ${categorized.userMessage}`, error);
			this.sendSocketNotification("FETCH_ERROR", {
				leagueType: leagueType,
				...categorized
			});
		}
	},

	// Fetch webpage content
	async fetchWebPage(url) {
		try {
			const result = await requestManager.queueRequest({
				url: url,
				options: {
					method: "GET",
					headers: {
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
						Accept:
							"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
						"Accept-Language": "en-US,en;q=0.5",
						Connection: "keep-alive"
					}
				},
				timeout: 10000,
				priority: 1, // Normal priority
				moduleId: "MMM-MyTeams-LeagueTable",
				deduplicate: true
			});

			if (!result.success) {
				throw new Error(`HTTP ${result.status}: Request failed`);
			}

			return result.data;
		} catch (error) {
			console.error(" MMM-MyTeams-LeagueTable: Fetch error:", error.message);
			throw error;
		}
	},

	startCacheCleanup() {
		const cleanupInterval = 6 * 60 * 60 * 1000; // 6 hours
		setInterval(async () => {
			const deleted = await this.cache.cleanupExpired();
			if (deleted > 0) {
				this.log(3, "CACHE", `Automatic cache cleanup removed ${deleted} expired entries`);
			}
		}, cleanupInterval);

		this.log(3, "CACHE", "Cache cleanup scheduled every 6 hours");
	},

	// Clean up team name
	cleanTeamName(name) {
		return name
			.replace(/^\d+\s*/, "") // Remove leading position numbers
			.replace(/\s+/g, " ") // Normalize whitespace
			.trim();
	}
});
