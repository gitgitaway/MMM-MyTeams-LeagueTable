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
const BBCParser = require("./BBCParser.js");
const FIFAParser = require("./FIFAParser.js");
const logoResolver = require("./logo-resolver.js");

module.exports = NodeHelper.create({
	// Helper to send debug info to frontend for browser console viewing
	sendDebugInfo(message, data = null) {
		if (this.config && this.config.debug) {
			this.sendSocketNotification("DEBUG_INFO", {
				message: message,
				data: data,
				timestamp: new Date().toISOString()
			});
		}
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
		const debug = config && config.debug;

		if (debug) console.log(" MMM-MyTeams-LeagueTable: Resolving logos on server-side...");

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
			data.teams.forEach(team => {
				if (team.name) {
					team.logo = getCachedLogo(team.name);
				}
			});
		}

		// 2. Resolve logos for groups (World Cup/UEFA)
		if (data.groups) {
			Object.keys(data.groups).forEach(groupName => {
				if (Array.isArray(data.groups[groupName])) {
					data.groups[groupName].forEach(team => {
						if (team.name) {
							team.logo = getCachedLogo(team.name);
						}
					});
				}
			});
		}

		// 3. Resolve logos for fixtures
		if (data.fixtures && Array.isArray(data.fixtures)) {
			data.fixtures.forEach(fixture => {
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
			Object.keys(data.knockouts).forEach(stage => {
				if (Array.isArray(data.knockouts[stage])) {
					data.knockouts[stage].forEach(fixture => {
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

		return data;
	},

	// Node helper started
	start() {
		console.log("Starting node helper for: MMM-MyTeams-LeagueTable");
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

	// Handle socket notifications from the module
	socketNotificationReceived(notification, payload) {
		if (notification === "GET_LEAGUE_DATA") {
			this.config = payload;
			this.sendDebugInfo("Received request for " + payload.leagueType); this.fetchLeagueData(payload.url, payload.leagueType, payload);
		} else if (notification === "CACHE_GET_STATS") {
			const stats = this.cache.getStats();
			this.sendSocketNotification("CACHE_STATS", stats);
		} else if (notification === "CACHE_CLEAR_ALL") {
			const cleared = this.cache.clearAll();
			this.sendSocketNotification("CACHE_CLEARED", { cleared: cleared });
			console.log(
				` MMM-MyTeams-LeagueTable: Cache cleared (${cleared} files removed)`
			);
		} else if (notification === "CACHE_CLEANUP") {
			const deleted = this.cache.cleanupExpired();
			this.sendSocketNotification("CACHE_CLEANUP_DONE", { deleted: deleted });
			console.log(
				` MMM-MyTeams-LeagueTable: Cache cleanup complete (${deleted} expired files removed)`
			);
		}
	},

	// Main function to fetch league data
	async fetchLeagueData(url, leagueType, config) {
		const debug = config && config.debug;
		const useMockData = config && config.useMockData;

		if (debug) {
			console.log(` MMM-MyTeams-LeagueTable: Fetching ${leagueType} data...`);
			this.cache.setDebug(true);
		}

		// Handle Mock Data for non-WC leagues (simulated)
		if (useMockData && leagueType !== "WORLD_CUP_2026") {
			if (debug) console.log(` MMM-MyTeams-LeagueTable: [MOCK MODE] Generating mock data for ${leagueType}`);
			const cachedData = this.cache.get(leagueType);
			if (cachedData) {
				cachedData.leagueType = leagueType;
				cachedData.fromCache = true;
				cachedData.isMock = true;
				this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(cachedData, config));
				return;
			}
		}

		// Handle UEFA competitions with separate table and fixture URLs
		if (typeof url === "object" && url.table && url.fixtures) {
			return this.fetchUEFACompetitionData(url, leagueType, config);
		}

		// Handle FIFA World Cup 2026 specifically if needed
		if (leagueType === "WORLD_CUP_2026") {
			return this.fetchFIFAWorldCup2026(url, config);
		}

		// PROACTIVE CACHING: Check if we have cached data and send it immediately
		const cachedData = this.cache.get(leagueType);
		if (cachedData) {
			const isValid = this.isDataComplete(cachedData, leagueType);
			if (debug) console.log(` MMM-MyTeams-LeagueTable: Cached data for ${leagueType} is ${isValid ? "complete" : "incomplete"}`);
			
			if (isValid) {
				if (debug) console.log(` MMM-MyTeams-LeagueTable: Serving cached data for ${leagueType} immediately`);
				cachedData.leagueType = leagueType;
				cachedData.fromCache = true;
				this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(cachedData, config));
			} else {
				if (debug) console.log(` MMM-MyTeams-LeagueTable: Skipping incomplete cache for ${leagueType}`);
			}
		}

		try {
			const html = await this.fetchWebPage(url);
			if (debug) console.log(` MMM-MyTeams-LeagueTable: Successfully fetched ${leagueType} webpage`);
			
			const leagueData = this.bbcParser.parseLeagueData(html, leagueType);
			
			if (leagueData && leagueData.teams && leagueData.teams.length > 0) {
				leagueData.leagueType = leagueType;
				
				// Check if fresh data is complete (has form)
				const isFreshComplete = this.isDataComplete(leagueData, leagueType);
				
				if (!isFreshComplete) {
					// Fresh data is incomplete. Check if we have a better version in cache.
					const cachedData = this.cache.get(leagueType);
					if (cachedData && this.isDataComplete(cachedData, leagueType)) {
						if (debug) console.log(` MMM-MyTeams-LeagueTable: Fresh data for ${leagueType} is incomplete, using complete cached data instead.`);
						cachedData.leagueType = leagueType;
						cachedData.fromCache = true;
						cachedData.cacheFallback = true;
						this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(cachedData, config));
						return;
					}
					// If no better cache, mark this fresh data as incomplete so UI can show warning
					leagueData.incomplete = true;
				}

				this.cache.set(leagueType, leagueData);
				this.sendDebugInfo("Sending LEAGUE_DATA for " + leagueType); 
				this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(leagueData, config));
			} else {
				throw new Error(`No ${leagueType} data parsed from website`);
			}
		} catch (error) {
			this.sendDebugInfo("Error fetching " + leagueType, error.message); 
			console.error(` MMM-MyTeams-LeagueTable: Error fetching ${leagueType} data:`, error.message);

			// Fallback to cache ONLY if we haven't already served it
			const fallbackData = this.cache.get(leagueType);
			if (fallbackData) {
				fallbackData.leagueType = leagueType;
				fallbackData.fromCache = true;
				fallbackData.cacheFallback = true;
				this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(fallbackData, config));
			} else {
				this.sendSocketNotification("FETCH_ERROR", {
					message: error.message,
					code: error.code || "FETCH_FAILED",
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
	isDataComplete(data, leagueType) {
		if (!data || !data.teams || !Array.isArray(data.teams) || data.teams.length === 0) {
			return false;
		}

		// World Cup and other knockout-heavy leagues might not have form in the same way
		if (leagueType === "WORLD_CUP_2026" || leagueType.includes("UEFA")) {
			return true;
		}

		// Check if at least some teams have form data (as an array)
		// We expect form to be an array of objects if parsed correctly by new parser
		const teamsWithForm = data.teams.filter(t => Array.isArray(t.form) && t.form.length > 0);
		
		// Log status for debugging
		if (this.config && this.config.debug) {
			console.log(` MMM-MyTeams-LeagueTable: Data completeness check for ${leagueType}: ${teamsWithForm.length}/${data.teams.length} teams have form.`);
		}

		// If more than 50% of teams have NO form, consider it incomplete/old parser data
		// But allow it if there are NO teams with form (maybe it's start of season or special league)
		if (data.teams.length > 0 && teamsWithForm.length === 0) {
			// Check if teams have actually played games
			const teamsWhoPlayed = data.teams.filter(t => (t.played || 0) > 0);
			
			// If teams have played but no form is found, it's likely a parsing issue or stale cache
			if (teamsWhoPlayed.length > 0) {
				const leaguesWithForm = ["PREMIER_LEAGUE", "CHAMPIONSHIP", "LEAGUE_ONE", "LEAGUE_TWO", "SPFL", "SCOTTISH_PREMIERSHIP"];
				if (leaguesWithForm.some(l => leagueType.includes(l))) {
					if (this.config && this.config.debug) {
						console.log(` MMM-MyTeams-LeagueTable: League ${leagueType} has played games but no form. Marking as incomplete.`);
					}
					return false;
				}
			}
		}

		return (teamsWithForm.length / data.teams.length) > 0.5;
	},

	// Fetch and parse FIFA World Cup 2026 data
	async fetchFIFAWorldCup2026(url, config) {
		const leagueType = "WORLD_CUP_2026";
		const debug = config && config.debug;
		const useMockData = config && config.useMockData;

		try {
			// Handle Mock Data specifically for World Cup
			if (useMockData) {
				if (debug) console.log(" MMM-MyTeams-LeagueTable: [MOCK MODE] Generating World Cup mock data");
				const mockData = this.fifaParser.generateMockWC2026Data();
				mockData.fromCache = false;
				mockData.isMock = true;
				this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(mockData, config));
				return;
			}

			// PROACTIVE CACHING: Serve cached World Cup data immediately
			const cachedData = this.cache.get(leagueType);
			if (cachedData) {
				if (this.config && this.config.debug) {
					console.log(
						" MMM-MyTeams-LeagueTable: Serving cached World Cup data immediately"
					);
				}
				cachedData.fromCache = true;
				const resolvedCached = this.fifaParser.resolveWCPlaceholders(cachedData);
				this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(resolvedCached, config));
			}

			// Fetch both BBC pages: tables and fixtures
			const tablesUrl = "https://www.bbc.co.uk/sport/football/world-cup/table";
			const [tablesHtml, fixturesHtml] = await Promise.all([
				this.fetchWebPage(tablesUrl),
				this.fetchWebPage(url)
			]);

			// Parse groups from tables page
			const groups = this.fifaParser.parseFIFAWorldCupTablesBBC(tablesHtml);
			// Parse fixtures from fixtures page
			let data = this.fifaParser.parseFIFAWorldCupData("", fixturesHtml);
			// Overwrite groups with authoritative table data
			data.groups = groups;

			if (data && data.groups && Object.keys(data.groups).length > 0) {
				data.leagueType = leagueType;
				data = this.fifaParser.resolveWCPlaceholders(data);
				this.cache.set(leagueType, data);
				this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(data, config));
			} else {
				throw new Error("No World Cup data parsed from website");
			}
		} catch (error) {
			console.error(
				" MMM-MyTeams-LeagueTable: Error fetching World Cup data:",
				error.message
			);

			// Only fallback to cache if we haven't already served it during this fetch
			const fallbackData = this.cache.get(leagueType);
			if (fallbackData) {
				console.log(
					" MMM-MyTeams-LeagueTable: Using cached World Cup data as fallback"
				);
				fallbackData.fromCache = true;
				fallbackData.cacheFallback = true;
				const resolvedFallback = this.fifaParser.resolveWCPlaceholders(fallbackData);
				this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(resolvedFallback, config));
			} else {
				this.sendSocketNotification("FETCH_ERROR", {
					message: error.message,
					code: error.code || "FETCH_FAILED",
					leagueType: leagueType
				});
			}
		}
	},

	// Fetch and parse UEFA Competition data (UCL, UEL, ECL)
	async fetchUEFACompetitionData(urls, leagueType, config) {
		try {
			// PROACTIVE CACHING: Serve cached data immediately
			const cachedData = this.cache.get(leagueType);
			if (cachedData) {
				if (this.config && this.config.debug) {
					console.log(` MMM-MyTeams-LeagueTable: Serving cached ${leagueType} data immediately`);
				}
				cachedData.leagueType = leagueType;
				cachedData.fromCache = true;
				this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(cachedData, config));
			}

			// DYNAMIC MONTH FETCHING: Fetch current month and next 4 months to ensure full knockout coverage
			const now = new Date();
			const currentYear = now.getFullYear();
			const currentMonth = now.getMonth(); // 0-11
			
			const formatMonth = (y, m) => `${y}-${String(m + 1).padStart(2, "0")}`;
			
			const monthsToFetch = [];
			
			for (let i = 0; i <= 4; i++) {
				const d = new Date(currentYear, currentMonth + i, 1);
				const monthStr = formatMonth(d.getFullYear(), d.getMonth());
				
				// PRIORITY QUEUE LOGIC (P-03):
				// 1. Current month: Always fetch (handled by standard module interval)
				// 2. Future months: Only fetch once per 24 hours
				const cacheKey = `${leagueType}_${monthStr}`;
				const lastFetch = this.fixtureCache[cacheKey] ? this.fixtureCache[cacheKey].timestamp : 0;
				const isFuture = i > 0;
				const oneDay = 24 * 60 * 60 * 1000;
				
				if (!isFuture || (Date.now() - lastFetch > oneDay)) {
					monthsToFetch.push(monthStr);
				} else if (this.fixtureCache[cacheKey].html) {
					if (config.debug) console.log(` MMM-MyTeams-LeagueTable: Using cached fixtures for ${monthStr} (fetched ${Math.round((Date.now() - lastFetch) / 3600000)}h ago)`);
				}
			}

			// Create promises with individual catch to handle 404s on future months
			const fixtureFetchPromises = [
				this.fetchWebPage(urls.fixtures).catch(() => {
					console.warn(` MMM-MyTeams-LeagueTable: Base fixtures fetch failed`);
					return "";
				})
			];
			
			monthsToFetch.forEach(month => {
				fixtureFetchPromises.push(
					this.fetchWebPage(`${urls.fixtures}/${month}`).then(html => {
						// Store in memory cache for P-03 logic
						const cacheKey = `${leagueType}_${month}`;
						this.fixtureCache[cacheKey] = {
							timestamp: Date.now(),
							html: html
						};
						return html;
					}).catch(() => {
						// Don't warn for future months as they might not exist yet
						return "";
					})
				);
			});

			// Fetch BBC table and all relevant fixture pages in parallel
			const results = await Promise.all([
				this.fetchWebPage(urls.table).catch(err => {
					console.error(` MMM-MyTeams-LeagueTable: Table fetch failed for ${leagueType}: ${err.message}`);
					return ""; // Return empty string instead of throwing, so fixtures can still be parsed
				}),
				...fixtureFetchPromises
			]);

			const tablesHtml = results[0];
			const fetchedFixturesHtml = results.slice(1);
			
			// Re-inject cached future months that we skipped fetching
			const allFixturesHtmlParts = [...fetchedFixturesHtml];
			for (let i = 1; i <= 4; i++) {
				const d = new Date(currentYear, currentMonth + i, 1);
				const monthStr = formatMonth(d.getFullYear(), d.getMonth());
				const cacheKey = `${leagueType}_${monthStr}`;
				
				if (!monthsToFetch.includes(monthStr) && this.fixtureCache[cacheKey]) {
					allFixturesHtmlParts.push(this.fixtureCache[cacheKey].html);
				}
			}

			// Combine all fixture pages into a single string for parsing
			const combinedFixturesHtml = allFixturesHtmlParts.join("\n");

			// Parse data
			const leagueData = this.bbcParser.parseUEFACompetitionData(tablesHtml, combinedFixturesHtml, leagueType);

			// Logic update: Accept data if either teams OR fixtures are found
			const hasTeams = leagueData && leagueData.teams && leagueData.teams.length > 0;
			const hasFixtures = leagueData && leagueData.fixtures && leagueData.fixtures.length > 0;

			if (leagueData && (hasTeams || hasFixtures)) {
				leagueData.leagueType = leagueType;
				this.cache.set(leagueType, leagueData);
				this.sendDebugInfo("Sending LEAGUE_DATA for " + leagueType + " (Teams: " + hasTeams + ", Fixtures: " + hasFixtures + ")"); 
				this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(leagueData, config));
			} else {
				throw new Error(`No ${leagueType} data (teams or fixtures) parsed from website`);
			}
		} catch (error) {
			this.sendDebugInfo("Error fetching " + leagueType, error.message); console.error(` MMM-MyTeams-LeagueTable: Error fetching ${leagueType} data:`, error.message);
			
			// Fallback to cache
			const fallbackData = this.cache.get(leagueType);
			if (fallbackData) {
				fallbackData.leagueType = leagueType;
				fallbackData.fromCache = true;
				fallbackData.cacheFallback = true;
				this.sendSocketNotification("LEAGUE_DATA", this.resolveLogos(fallbackData, config));
			}
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
		setInterval(() => {
			const deleted = this.cache.cleanupExpired();
			if (deleted > 0) {
				console.log(
					` MMM-MyTeams-LeagueTable: Automatic cache cleanup removed ${deleted} expired entries`
				);
			}
		}, cleanupInterval);

		if (this.config && this.config.debug) {
			console.log(
				" MMM-MyTeams-LeagueTable: Cache cleanup scheduled every 6 hours"
			);
		}
	},

	// Clean up team name
	cleanTeamName(name) {
		return name
			.replace(/^\d+\s*/, "") // Remove leading position numbers
			.replace(/\s+/g, " ") // Normalize whitespace
			.trim();
	}
});
