/* MagicMirror²
 * Module:  MMM-MyTeams-LeagueTable
 *
 * Author: gitgitaway with assistance from AI Assistant
 * MIT Licensed.
 *
 * This module displays football league standings from multiple European competitions
 * sourced from BBC Sport website, including all top-tier European football leagues,
 * UEFA Champions League, UEFA Europa League, and UEFA Europa Conference League.
 *
 * Enhanced with configurable league selection supporting 20+ European nations.
 */

Module.register("MMM-MyTeams-LeagueTable", {
	// Load external scripts
	getScripts() {
		return [
			`modules/${this.name}/team-logo-mappings.js`,
			`modules/${this.name}/european-leagues.js`
		];
	},

	// Override getHeader to dynamically update the title
	getHeader() {
		if (this.config.onlyShowWorldCup2026 === true) {
			return "FIFA World Cup 2026";
		}
		return this.data.header || "League Standings";
	},

	// Default module config
	defaults: {
		updateInterval: 30 * 60 * 1000, // How often to refresh (ms) – default: 30 min
		retryDelay: 15000, // Delay between retry attempts after an error (ms)
		maxRetries: 3, // Stop retrying after this many failures
		animationSpeed: 2000, // DOM update animation speed (ms)
		fadeSpeed: 4000, // Fade animation speed (ms)
		colored: true, // Color rows by standing (top/UEFA/relegation)
		maxTeams: 36, // 0 = show all teams
		highlightTeams: ["Celtic", "Hearts"], // Emphasize teams by exact name
		scrollable: true, // Enable vertical scrolling if max height exceeded

		// ===== NEW: League Selection System (replaces old individual toggles) =====
		// Method 1: Use selectedLeagues array to choose specific leagues by code
		// Leave empty to use legacy showXXX options, or populate with league codes
		// Example: Scottish Premiership enabled by default
		// Add more league codes here, e.g., "ENGLAND_PREMIER_LEAGUE", "GERMANY_BUNDESLIGA", etc.
		selectedLeagues: ["SCOTLAND_PREMIERSHIP"],

		// Method 2: Use legacyLeagueToggle = true to enable old config style (for backward compatibility)
		legacyLeagueToggle: true, // If true, uses showSPFL, showEPL, etc. from config

		// ===== NEW: Automatic button generation from selectedLeagues =====
		autoGenerateButtons: true, // Auto-create buttons for all leagues in selectedLeagues
		showLeagueButtons: true, // Show/hide league selector buttons in header
		autoFocusRelevantSubTab: true, // Automatically focus on the sub-tab with live or upcoming matches

		// ===== NEW: World Cup 2026 Specific Options =====
		showWC2026: false, // Set to true to show World Cup 2026 in league switcher
		showUEFAleagues: false, // Set to true to show UEFA leagues in league switcher
		onlyShowWorldCup2026: false, // If true, only shows World Cup 2026 view
		showWC2026Groups: [
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
			"G",
			"H",
			"I",
			"J",
			"K",
			"L"
		], // Groups to show
		showWC2026Knockouts: ["Rd32", "Rd16", "QF", "SF", "TP", "Final"], // Knockout rounds to show
		showUEFAnockouts: ["Playoff", "Rd16", "QF", "SF", "Final"], // UEFA knockout stages to show
		defaultWCSubTab: "A", // Default tab to focus on start-up (e.g., "A", "Final", etc.)
		displayAllTabs: false, // Override to show all tabs regardless of completion
		useMockData: false, // For testing: use mock data instead of scraping

		// ===== LEGACY League toggles (used if legacyLeagueToggle: true) =====
		// Set true to show, false to hide
		showSPFL: true, // Show Scottish Premiership
		showSPFLC: false, // Show Scottish Championship
		showEPL: false, // Show English Premier League
		showUCL: false, // Show UEFA Champions League
		showUEL: false, // Show UEFA Europa League
		showECL: false, // Show UEFA Europa Conference League

		// ===== Display Options =====
		showPosition: true, // Show table position
		showTeamLogos: true, // Show team logos
		showPlayedGames: true, // Show games played
		showWon: true, // Show wins
		showDrawn: true, // Show draws
		showLost: true, // Show losses
		showGoalsFor: true, // Show goals for
		showGoalsAgainst: true, // Show goals against
		showGoalDifference: true, // Show goal difference
		showPoints: true, // Show points
		showForm: true, // Show recent form tokens (W/D/L)
		formMaxGames: 6, // Max number of form games to display
		//firstPlaceColor: "rgba(255, 255, 255, 0.1)", // Color for the team in first position
		highlightedColor: "rgba(255, 255, 255, 0.1)", // Color for highlighted teams

		// ===== Auto-cycling options =====
		autoCycle: false, // Enable auto-cycling between leagues
		cycleInterval: 15 * 1000, // Time to display each league (15 seconds)
		wcSubtabCycleInterval: 15 * 1000, // Time to display each WC sub-tab (groups/knockouts)
		autoCycleWcSubtabs: true, // Allow auto-cycling of World Cup sub-tabs

		// ===== League Headers =====
		// Maps league codes to their display names
		// Dynamically extended at runtime with all configured European leagues
		leagueHeaders: {
			// Domestic Leagues
			SCOTLAND_PREMIERSHIP: "Scottish Premiership",
			SCOTLAND_CHAMPIONSHIP: "Scottish Championship",
			ENGLAND_PREMIER_LEAGUE: "English Premier League",
			GERMANY_BUNDESLIGA: "Bundesliga",
			FRANCE_LIGUE1: "Ligue 1",
			SPAIN_LA_LIGA: "La Liga",
			ITALY_SERIE_A: "Serie A",
			NETHERLANDS_EREDIVISIE: "Eredivisie",
			BELGIUM_PRO_LEAGUE: "Belgian Pro League",
			PORTUGAL_PRIMEIRA_LIGA: "Primeira Liga",
			TURKEY_SUPER_LIG: "Turkish Super Lig",
			GREECE_SUPER_LEAGUE: "Greek Super League",
			AUSTRIA_BUNDESLIGA: "Austrian Bundesliga",
			CZECH_LIGA: "Czech Liga",
			DENMARK_SUPERLIGAEN: "Superligaen",
			NORWAY_ELITESERIEN: "Eliteserien",
			SWEDEN_ALLSVENSKAN: "Allsvenskan",
			SWITZERLAND_SUPER_LEAGUE: "Swiss Super League",
			UKRAINE_PREMIER_LEAGUE: "Ukrainian Premier League",
			ROMANIA_LIGA_I: "Liga I",
			CROATIA_HNL: "Croatian HNL",
			SERBIA_SUPER_LIGA: "Serbian Super Liga",
			HUNGARY_NBI: "Hungarian NB I",
			POLAND_EKSTRAKLASA: "Ekstraklasa",
			// European Competitions
			UEFA_EUROPA_CONFERENCE_LEAGUE: "UEFA Europa Conference League",
			UEFA_EUROPA_LEAGUE: "UEFA Europa League",
			UEFA_CHAMPIONS_LEAGUE: "UEFA Champions League",
			
			// World Cup
			WORLD_CUP_2026: "WC26"
		},

		// Theme overrides
		darkMode: null, // null=auto, true=force dark, false=force light
		fontColorOverride: "#FFFFFF", // Set to "null" for your existing css colour scheme or override all font colors "#FFFFFF" to force white text
		opacityOverride: null, // null=auto,  set to  1.0 to force full opacity

		// Debug
		debug: true, // Set to true to enable console logging

		// Cache controls
		clearCacheButton: true,
		clearCacheOnStart: false,
		maxTableHeight: 460 // Height in px to show 12 teams
	},

	// Required version of MagicMirror
	requiresVersion: "2.1.0",

	// Module startup
	start() {
		Log.info(`Starting module: ${this.name}`);

		// ===== INITIALIZE TEAM LOGO MAPPINGS =====
		// Merge centralized mappings from team-logo-mappings.js with config overrides
		// TEAM_LOGO_MAPPINGS is loaded via getScripts() and available globally
		this.mergedTeamLogoMap = Object.assign(
			{},
			window.TEAM_LOGO_MAPPINGS || {},
			this.config.teamLogoMap || {}
		);

		// Build normalized team lookup map for case-insensitive matching
		this.normalizedTeamLogoMap = {};
		this.buildNormalizedTeamMap();

		// ===== INITIALIZE LEAGUE SYSTEM =====
		// Determine which leagues are enabled based on config
		this.determineEnabledLeagues();

		// Initialize data storage - dynamically create entries for each enabled league
		this.leagueData = {};
		this.loaded = {};

		// Populate data structures for each enabled league
		this.enabledLeagueCodes.forEach((leagueCode) => {
			this.leagueData[leagueCode] = null;
			this.loaded[leagueCode] = false;
		});

		this.error = null;
		this.retryCount = 0;

		// Set current league to first enabled league
		this.currentLeague =
			this.enabledLeagueCodes.length > 0
				? this.enabledLeagueCodes[0]
				: "SCOTLAND_PREMIERSHIP";
		
		const uefaLeagues = [
			"UEFA_CHAMPIONS_LEAGUE",
			"UEFA_EUROPA_LEAGUE",
			"UEFA_EUROPA_CONFERENCE_LEAGUE",
			"UCL",
			"UEL",
			"ECL"
		];
		
		if (this.currentLeague === "WORLD_CUP_2026") {
			this.currentSubTab = this.config.defaultWCSubTab || "A";
		} else if (uefaLeagues.includes(this.currentLeague)) {
			this.currentSubTab = "Table";
		} else {
			this.currentSubTab = null;
		}

		this.isScrolling = false;
		this.isContentHidden = false; // Add state for content visibility
		this._lastRenderedKey = null;
		this._pinned = false; // when true, temporarily lock view and pause auto-cycling
		this._countdownEl = null; // header countdown element
		this._countdownTimer = null;

		if (this.config.debug) {
			Log.info(
				` MMM-MyTeams-LeagueTable: Enabled leagues: ${JSON.stringify(this.enabledLeagueCodes)}`
			);
			Log.info(
				` MMM-MyTeams-LeagueTable: Current league: ${this.currentLeague}`
			);
		}

		// Optionally clear cache once at startup
		if (this.config.clearCacheOnStart === true) {
			if (this.config.debug) Log.info(" MMM-MyTeams-LeagueTable: Clearing cache on start");
			this.sendSocketNotification("CACHE_CLEAR_ALL");
		}

		// Send initial request for data for all enabled leagues
		this.requestAllLeagueData();

		// Set up periodic updates
		this.scheduleUpdate();

		// Set up auto-cycling if enabled (also enable if onlyShowWorldCup2026 is true for 20s rotation)
		if (this.config.autoCycle || this.config.onlyShowWorldCup2026) {
			// Force cycle interval to 30 seconds and formMaxGames to 3 if onlyShowWorldCup2026 is true
			if (this.config.onlyShowWorldCup2026) {
				this.config.cycleInterval = 30 * 1000;
				this.config.formMaxGames = 3;
			}
			this.scheduleCycling();
			this.scheduleWorldCupSubtabCycling();
		}

		if (this.config.debug) {
			Log.info(
				` MMM-MyTeams-LeagueTable: Module started with config: ${JSON.stringify(this.config)}`
			);
		}
	},

	// ===== NEW: Build normalized team lookup map =====
	// Creates a case-insensitive, whitespace-normalized lookup for team logo mappings
	// Handles common naming variations (e.g., "St Mirren" vs "st mirren", "ST. MIRREN", etc.)
	// Also handles suffix/prefix variations like FC, SC, AC in any case combination
	// Also handles diacritics (accents, umlauts) - "Atlético" matches "Atletico"
	buildNormalizedTeamMap() {
		this.normalizedTeamLogoMap = {};
		this.fuzzyTeamLogoMap = {}; // New: map for stripping all non-alphanumeric chars

		// Common football club suffixes/prefixes to handle
		var commonSuffixes = [
			"fc",
			"sc",
			"ac",
			"cf",
			"sk",
			"if",
			"bk",
			"fk",
			"ik",
			"aik",
			"afc",
			"vfb",
			"unt",
			"fn"
		];

		// Country name synonyms and variations (handles FIFA vs BBC vs other source differences)
		var teamAliases = {
			"Cabo Verde": "Cape Verde",
			"Cape Verde Islands": "Cape Verde",
			"IR Iran": "Iran",
			"Iran, Islamic Republic of": "Iran",
			"South Korea": "Rep. of Korea",
			"Korea Republic": "Rep. of Korea",
			"Korea, Republic of": "Rep. of Korea",
			"Côte d'Ivoire": "Ivory Coast",
			"Cote d'Ivoire": "Ivory Coast",
			Curacao: "Curaçao",
			USA: "United States",
			"United States of America": "United States",
			Czechia: "Czech Republic",
			Türkiye: "Turkey",
			"North Macedonia": "Macedonia",
			"Viet Nam": "Vietnam",
			Eswatini: "Swaziland"
		};

		// Function to remove diacritics (accents, umlauts, etc.)
		// Converts: é→e, ö→o, ü→u, ñ→n, ç→c, ß→ss, á→a, í→i, ó→o, ú→u, etc.
		var removeDiacritics = function (str) {
			if (!str) return str;
			// Handle special characters explicitly before Unicode normalization
			let result = str.replace(/ß/g, "ss"); // German ß → ss
			result = result.replace(/ø/g, "o"); // Danish/Norwegian ø → o
			result = result.replace(/æ/g, "ae"); // Scandinavian æ → ae
			// Use Unicode normalization to decompose accented characters
			return result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		};

		// Function to generate alternative diacritics spellings (e.g., Köln → koeln)
		// Handles common Anglicization variants: ö→oe, ü→ue, ä→ae
		var getAlternativeDiacriticsSpellings = function (str) {
			if (!str) return [];
			var variants = [];
			// German convention: ö→oe, ü→ue, ä→ae
			if (str.match(/[öüä]/i)) {
				var withOe = str
					.replace(/ö/gi, function (m) {
						return m === "ö" ? "oe" : "OE";
					})
					.replace(/ü/gi, function (m) {
						return m === "ü" ? "ue" : "UE";
					})
					.replace(/ä/gi, function (m) {
						return m === "ä" ? "ae" : "AE";
					});
				variants.push(normalize(withOe));
			}
			return variants;
		};

		// Normalize function: remove diacritics, lowercase, and remove/compress whitespace, remove punctuation
		var normalize = function (str) {
			return removeDiacritics(str || "")
				.toLowerCase()
				.replace(/\s+/g, " ")
				.trim()
				.replace(/[.,]/g, "");
		};

		// Fuzzy normalize: remove everything except alphanumeric characters
		var fuzzyNormalize = function (str) {
			return removeDiacritics(str || "")
				.toLowerCase()
				.replace(/[^a-z0-9]/g, "");
		};

		// Function to strip common suffixes/prefixes
		var stripSuffixes = function (str) {
			var normalized = normalize(str);
			var parts = normalized.split(" ");
			var stripped = normalized;

			// Check if last word is a common suffix
			if (parts.length > 1) {
				var lastWord = parts[parts.length - 1];
				if (commonSuffixes.indexOf(lastWord) !== -1) {
					stripped = parts.slice(0, -1).join(" ");
				}
			}
			// Check if first word is a common prefix (AC, SC, AFC, VFB, etc.)
			if (parts.length > 1) {
				var firstWord = parts[0];
				if (commonSuffixes.indexOf(firstWord) !== -1) {
					stripped = parts.slice(1).join(" ");
				}
			}

			return stripped.trim();
		};

		// Build map with normalized keys and suffix variations
		Object.keys(this.mergedTeamLogoMap).forEach((teamName) => {
			var normalized = normalize(teamName);
			var fuzzy = fuzzyNormalize(teamName);
			var stripped = stripSuffixes(teamName);

			if (normalized && normalized.length > 0) {
				// Add normalized version
				this.normalizedTeamLogoMap[normalized] =
					this.mergedTeamLogoMap[teamName];

				// Add fuzzy version
				if (fuzzy && fuzzy.length > 0) {
					this.fuzzyTeamLogoMap[fuzzy] = this.mergedTeamLogoMap[teamName];
				}

				// Add stripped version (without common suffixes/prefixes)
				if (stripped !== normalized && stripped.length > 0) {
					this.normalizedTeamLogoMap[stripped] =
						this.mergedTeamLogoMap[teamName];
				}

				// Also add common suffix variants if they don't already exist
				// This helps find "Arsenal" even if mapped as "Arsenal FC"
				commonSuffixes.forEach((suffix) => {
					var withSuffix = `${normalized} ${suffix}`;
					if (!this.normalizedTeamLogoMap[withSuffix]) {
						this.normalizedTeamLogoMap[withSuffix] =
							this.mergedTeamLogoMap[teamName];
					}
				});

				// Add alternative Anglicization variants (ö→oe, ü→ue, ä→ae)
				// This helps find "Koeln" when mapped as "Köln"
				getAlternativeDiacriticsSpellings(teamName).forEach((variant) => {
					if (variant && !this.normalizedTeamLogoMap[variant]) {
						this.normalizedTeamLogoMap[variant] =
							this.mergedTeamLogoMap[teamName];
					}
					// Also add stripped version of variant
					var strippedVariant = stripSuffixes(variant);
					if (
						strippedVariant &&
						strippedVariant !== variant &&
						!this.normalizedTeamLogoMap[strippedVariant]
					) {
						this.normalizedTeamLogoMap[strippedVariant] =
							this.mergedTeamLogoMap[teamName];
					}
				});
			}
		});

		// Add country name synonyms and variations to the normalized map
		Object.keys(teamAliases).forEach((alias) => {
			var targetName = teamAliases[alias];
			var normalizedAlias = normalize(alias);

			// Find the logo path for the target name (it should already be in the map)
			var logoPath =
				this.mergedTeamLogoMap[targetName] ||
				this.normalizedTeamLogoMap[normalize(targetName)];

			if (logoPath && !this.normalizedTeamLogoMap[normalizedAlias]) {
				this.normalizedTeamLogoMap[normalizedAlias] = logoPath;

				// Also add stripped version of the alias
				var strippedAlias = stripSuffixes(normalizedAlias);
				if (
					strippedAlias &&
					strippedAlias !== normalizedAlias &&
					!this.normalizedTeamLogoMap[strippedAlias]
				) {
					this.normalizedTeamLogoMap[strippedAlias] = logoPath;
				}
			}
		});

		if (this.config.debug) {
			Log.info(
				` MMM-MyTeams-LeagueTable: Built normalized team map with ${Object.keys(this.normalizedTeamLogoMap).length} entries (diacritics removed, Anglicization variants added, case/whitespace normalized, suffix/prefix variants, common abbreviations)`
			);
		}
	},

	// ===== NEW: Get team logo mapping with intelligent lookup =====
	// Tries multiple matching strategies:
	// 1. Exact match (fastest)
	// 2. Normalized match (case-insensitive, whitespace-normalized, diacritics removed)
	// 3. Suffix/prefix variants (handles AFC, VFB, FC, SC, AC in any case, no length restrictions)
	// 4. Diacritic variants (handles accents/umlauts AND Anglicization: Atlético→Atletico, Köln→Koln or Koeln)
	getTeamLogoMapping(teamName) {
		if (!teamName) return null;

		// Phase 1: Logic moved to server (node_helper.js)
		// We still keep this helper for potential client-side needs or backward compatibility,
		// but we prioritize server-resolved logos.
		
		// If we already have a mapping for this name in our local maps (initialized at startup),
		// we can still return it as a backup.
		if (this.mergedTeamLogoMap && this.mergedTeamLogoMap[teamName]) {
			return this.mergedTeamLogoMap[teamName];
		}

		// Function to remove diacritics (accents, umlauts, etc.)
		var removeDiacritics = function (str) {
			if (!str) return str;
			// Handle special characters explicitly before Unicode normalization
			let result = str.replace(/ß/g, "ss"); // German ß → ss
			result = result.replace(/ø/g, "o"); // Danish/Norwegian ø → o
			result = result.replace(/æ/g, "ae"); // Scandinavian æ → ae
			// Use Unicode normalization to decompose accented characters
			return result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		};

		// Normalize and try lookup with suffix handling
		var normalize = function (str) {
			return removeDiacritics(str || "")
				.toLowerCase()
				.replace(/\s+/g, " ")
				.trim()
				.replace(/[.,]/g, "");
		};

		var normalized = normalize(teamName);

		// Try normalized match (handles case/whitespace/punctuation/diacritics variations and Anglicization variants)
		if (this.normalizedTeamLogoMap[normalized]) {
			if (this.config.debug) {
				Log.info(
					` MMM-MyTeams-LeagueTable: Found normalized mapping for '${teamName}' as '${normalized}' (diacritics/case/whitespace normalized, Anglicization variants like Köln→koeln supported)`
				);
			}
			return this.normalizedTeamLogoMap[normalized];
		}

		// Try stripping common suffixes/prefixes
		var commonSuffixes = [
			"fc",
			"sc",
			"ac",
			"cf",
			"sk",
			"if",
			"bk",
			"fk",
			"ik",
			"aik",
			"afc",
			"vfb",
			"unt",
			"fn"
		];
		var parts = normalized.split(" ");
		var stripped = normalized;

		// Check if last word is a common suffix
		if (parts.length > 1) {
			var lastWord = parts[parts.length - 1];
			if (commonSuffixes.indexOf(lastWord) !== -1) {
				stripped = parts.slice(0, -1).join(" ");
			}
		}
		// Check if first word is a common prefix (AC, SC, AFC, VFB, etc.)
		if (parts.length > 1 && stripped === normalized) {
			var firstWord = parts[0];
			if (commonSuffixes.indexOf(firstWord) !== -1) {
				stripped = parts.slice(1).join(" ");
			}
		}

		if (stripped !== normalized && this.normalizedTeamLogoMap[stripped]) {
			if (this.config.debug) {
				Log.info(
					` MMM-MyTeams-LeagueTable: Found suffix/prefix variant mapping for '${teamName}' -> '${stripped}'`
				);
			}
			return this.normalizedTeamLogoMap[stripped];
		}

		// STRATEGY 4: Fuzzy match (strip all non-alphanumeric chars)
		// This handles names like "Bodø / Glimt" matching "Bodøglimt"
		var fuzzyNormalize = function (str) {
			return removeDiacritics(str || "")
				.toLowerCase()
				.replace(/[^a-z0-9]/g, "");
		};
		var fuzzy = fuzzyNormalize(teamName);
		if (this.fuzzyTeamLogoMap[fuzzy]) {
			if (this.config.debug) {
				Log.info(
					` MMM-MyTeams-LeagueTable: Found fuzzy mapping for '${teamName}' -> '${fuzzy}'`
				);
			}
			return this.fuzzyTeamLogoMap[fuzzy];
		}

		// Log unmapped teams for debugging
		if (this.config.debug) {
			Log.warn(
				` MMM-MyTeams-LeagueTable: NO MAPPING FOUND for team '${teamName}'. Tried: exact, normalized ('${normalized}'), stripped ('${stripped}'), fuzzy ('${fuzzy}')`
			);
		}

		return null;
	},

	// ===== NEW: Determine which leagues are enabled =====
	// Handles both new selectedLeagues config and legacy showXXX toggles for backward compatibility
	// Populates this.enabledLeagueCodes array with league codes to fetch
	determineEnabledLeagues() {
		this.enabledLeagueCodes = [];

		// PRIORITY 0: If onlyShowWorldCup2026 is true, ONLY show World Cup 2026
		if (this.config.onlyShowWorldCup2026 === true) {
			this.enabledLeagueCodes = ["WORLD_CUP_2026"];
			if (this.config.debug) {
				Log.info(
					" MMM-MyTeams-LeagueTable: onlyShowWorldCup2026 is enabled. ONLY World Cup 2026 will be shown."
				);
			}
			return; // Skip other league detection
		}

		// PRIORITY 1: Use selectedLeagues if provided and not empty
		if (
			this.config.selectedLeagues &&
			Array.isArray(this.config.selectedLeagues) &&
			this.config.selectedLeagues.length > 0
		) {
			// Filter and validate league codes from selectedLeagues
			this.config.selectedLeagues.forEach((leagueCode) => {
				// Map old codes to new codes for backward compatibility
				const normalizedCode = this.normalizeLeagueCode(leagueCode);
				if (
					normalizedCode &&
					!this.enabledLeagueCodes.includes(normalizedCode)
				) {
					this.enabledLeagueCodes.push(normalizedCode);
				}
			});

			if (this.config.debug) {
				Log.info(
					` MMM-MyTeams-LeagueTable: Using selectedLeagues config: ${JSON.stringify(this.enabledLeagueCodes)}`
				);
			}
		}

		// PRIORITY 2: Fall back to legacy toggles if legacyLeagueToggle is enabled and no selected leagues
		if (
			this.enabledLeagueCodes.length === 0 &&
			this.config.legacyLeagueToggle === true
		) {
			const legacyMapping = {
				showSPFL: "SCOTLAND_PREMIERSHIP",
				showSPFLC: "SCOTLAND_CHAMPIONSHIP",
				showEPL: "ENGLAND_PREMIER_LEAGUE",
				showUCL: "UEFA_CHAMPIONS_LEAGUE",
				showUEL: "UEFA_EUROPA_LEAGUE",
				showECL: "UEFA_EUROPA_CONFERENCE_LEAGUE"
			};

			Object.entries(legacyMapping).forEach(([legacyKey, newCode]) => {
				if (
					this.config[legacyKey] === true &&
					!this.enabledLeagueCodes.includes(newCode)
				) {
					this.enabledLeagueCodes.push(newCode);
				}
			});

			if (this.config.debug) {
				Log.info(
					` MMM-MyTeams-LeagueTable: Using legacy league toggles: ${JSON.stringify(this.enabledLeagueCodes)}`
				);
			}
		}

		// HANDLE MASTER TOGGLES: Handle showWC2026 and showUEFAleagues (granular control)
		// These act as master switches: if true, they ensure the leagues are included.
		// If explicitly false, they ensure they are excluded (even if in selectedLeagues).

		// World Cup 2026
		if (this.config.showWC2026 === true) {
			if (!this.enabledLeagueCodes.includes("WORLD_CUP_2026")) {
				this.enabledLeagueCodes.push("WORLD_CUP_2026");
			}
		} else if (this.config.showWC2026 === false) {
			this.enabledLeagueCodes = this.enabledLeagueCodes.filter(
				(code) => code !== "WORLD_CUP_2026"
			);
		}

		// UEFA Leagues
		const uefaLeagues = [
			"UEFA_EUROPA_CONFERENCE_LEAGUE",
			"UEFA_EUROPA_LEAGUE",
			"UEFA_CHAMPIONS_LEAGUE"
		];
		if (this.config.showUEFAleagues === true) {
			uefaLeagues.forEach((code) => {
				if (!this.enabledLeagueCodes.includes(code)) {
					this.enabledLeagueCodes.push(code);
				}
			});
		} else if (this.config.showUEFAleagues === false) {
			this.enabledLeagueCodes = this.enabledLeagueCodes.filter(
				(code) => !uefaLeagues.includes(code)
			);
		}

		// Fallback: If after all logic no leagues are enabled, default to Scottish Premiership
		if (this.enabledLeagueCodes.length === 0) {
			this.enabledLeagueCodes = ["SCOTLAND_PREMIERSHIP"];
			if (this.config.debug) {
				Log.warn(
					" MMM-MyTeams-LeagueTable: No leagues enabled after filtering, defaulting to SCOTLAND_PREMIERSHIP"
				);
			}
		}

		// Ensure currentLeague is valid and present in enabledLeagueCodes
		// If currentLeague is not set or not enabled, set it to the first enabled league
		if (!this.currentLeague || !this.enabledLeagueCodes.includes(this.currentLeague)) {
			if (this.enabledLeagueCodes.length > 0) {
				this.currentLeague = this.enabledLeagueCodes[0];
			} else {
				this.currentLeague = "SCOTLAND_PREMIERSHIP";
			}
		}
	},

	// ===== NEW: Normalize league codes =====
	// Converts old league codes to new format for backward compatibility
	// Returns null if code is invalid
	normalizeLeagueCode(code) {
		if (!code || typeof code !== "string") return null;

		// Legacy code mappings for backward compatibility
		const legacyCodeMap = {
			SPFL: "SCOTLAND_PREMIERSHIP",
			SPFLC: "SCOTLAND_CHAMPIONSHIP",
			EPL: "ENGLAND_PREMIER_LEAGUE",
			UCL: "UEFA_CHAMPIONS_LEAGUE",
			UEL: "UEFA_EUROPA_LEAGUE",
			ECL: "UEFA_EUROPA_CONFERENCE_LEAGUE"
		};

		return legacyCodeMap[code] || code;
	},

	// ===== NEW: Get league URL by code =====
	// Returns the BBC Sport URL for a given league code
	getLeagueUrl(leagueCode) {
		// Map of league codes to their BBC Sport URLs
		const urlMap = {
			// Domestic Leagues
			SCOTLAND_PREMIERSHIP:
				"https://www.bbc.co.uk/sport/football/scottish-premiership/table",
			SCOTLAND_CHAMPIONSHIP:
				"https://www.bbc.co.uk/sport/football/scottish-championship/table",
			ENGLAND_PREMIER_LEAGUE:
				"https://www.bbc.co.uk/sport/football/premier-league/table",
			ENGLAND_CHAMPIONSHIP:
				"https://www.bbc.co.uk/sport/football/english-championship/table",
			GERMANY_BUNDESLIGA:
				"https://www.bbc.co.uk/sport/football/german-bundesliga/table",
			FRANCE_LIGUE1:
				"https://www.bbc.co.uk/sport/football/french-ligue-one/table",
			SPAIN_LA_LIGA:
				"https://www.bbc.co.uk/sport/football/spanish-la-liga/table",
			ITALY_SERIE_A:
				"https://www.bbc.co.uk/sport/football/italian-serie-a/table",
			NETHERLANDS_EREDIVISIE:
				"https://www.bbc.co.uk/sport/football/dutch-eredivisie/table",
			BELGIUM_PRO_LEAGUE:
				"https://www.bbc.co.uk/sport/football/belgian-pro-league/table",
			PORTUGAL_PRIMEIRA_LIGA:
				"https://www.bbc.co.uk/sport/football/portuguese-primeira-liga/table",
			TURKEY_SUPER_LIG:
				"https://www.bbc.co.uk/sport/football/turkish-super-lig/table",
			GREECE_SUPER_LEAGUE:
				"https://www.bbc.co.uk/sport/football/greek-super-league/table",
			AUSTRIA_BUNDESLIGA:
				"https://www.bbc.co.uk/sport/football/austrian-bundesliga/table",
			CZECH_LIGA: "https://www.bbc.co.uk/sport/football/czech-liga/table",
			DENMARK_SUPERLIGAEN:
				"https://www.bbc.co.uk/sport/football/danish-superliga/table",
			NORWAY_ELITESERIEN:
				"https://www.bbc.co.uk/sport/football/norwegian-eliteserien/table",
			SWEDEN_ALLSVENSKAN:
				"https://www.bbc.co.uk/sport/football/swedish-allsvenskan/table",
			SWITZERLAND_SUPER_LEAGUE:
				"https://www.bbc.co.uk/sport/football/swiss-super-league/table",
			UKRAINE_PREMIER_LEAGUE:
				"https://www.bbc.co.uk/sport/football/ukrainian-premier-league/table",
			ROMANIA_LIGA_I:
				"https://www.bbc.co.uk/sport/football/romanian-liga-i/table",
			CROATIA_HNL:
				"https://www.bbc.co.uk/sport/football/croatian-first-league/table",
			SERBIA_SUPER_LIGA:
				"https://www.bbc.co.uk/sport/football/serbian-super-lig/table",
			HUNGARY_NBI: "https://www.bbc.co.uk/sport/football/hungarian-nb-i/table",
			POLAND_EKSTRAKLASA:
				"https://www.bbc.co.uk/sport/football/polish-ekstraklasa/table",

			// UEFA Competitions
			UEFA_CHAMPIONS_LEAGUE: {
				table: "https://www.bbc.co.uk/sport/football/champions-league/table",
				fixtures: "https://www.bbc.co.uk/sport/football/champions-league/scores-fixtures"
			},
			UEFA_EUROPA_LEAGUE: {
				table: "https://www.bbc.co.uk/sport/football/europa-league/table",
				fixtures: "https://www.bbc.co.uk/sport/football/europa-league/scores-fixtures"
			},
			UEFA_EUROPA_CONFERENCE_LEAGUE: {
				table: "https://www.bbc.co.uk/sport/football/europa-conference-league/table",
				fixtures: "https://www.bbc.co.uk/sport/football/europa-conference-league/scores-fixtures"
			},

			// World Cup
			WORLD_CUP_2026: "https://www.bbc.co.uk/sport/football/world-cup/scores-fixtures/2026-06",

			// Legacy code support
			UCL: {
				table: "https://www.bbc.co.uk/sport/football/champions-league/table",
				fixtures: "https://www.bbc.co.uk/sport/football/champions-league/scores-fixtures"
			},
			UEL: {
				table: "https://www.bbc.co.uk/sport/football/europa-league/table",
				fixtures: "https://www.bbc.co.uk/sport/football/europa-league/scores-fixtures"
			},
			ECL: {
				table: "https://www.bbc.co.uk/sport/football/europa-conference-league/table",
				fixtures: "https://www.bbc.co.uk/sport/football/europa-conference-league/scores-fixtures"
			}
		};

		const url = urlMap[leagueCode];
		if (!url && this.config.debug) {
			Log.warn(` MMM-MyTeams-LeagueTable: Unknown league code: ${leagueCode}`);
		}
		return url;
	},

	// ===== NEW: Request data for all enabled leagues (dynamic) =====
	// Iterates through enabledLeagueCodes and fetches data for each league
	// Replaces the old hardcoded showXXX conditionals
	requestAllLeagueData() {
		if (!this.enabledLeagueCodes || this.enabledLeagueCodes.length === 0) {
			if (this.config.debug) {
				Log.warn(" MMM-MyTeams-LeagueTable: No leagues configured to fetch");
			}
			return;
		}

		// Iterate through each enabled league code and request its data with staggering to avoid spikes
		this.enabledLeagueCodes.forEach((leagueCode, index) => {
			const url = this.getLeagueUrl(leagueCode);

			if (!url) {
				Log.error(
					` MMM-MyTeams-LeagueTable: Could not find URL for league code: ${leagueCode}`
				);
				return; // Skip this league if no URL found
			}

			// Stagger requests by 500ms to prevent network/CPU spikes
			setTimeout(() => {
				if (this.config.debug) {
					Log.info(
						` MMM-MyTeams-LeagueTable: Requesting data for ${leagueCode} from ${url}`
					);
				}

				// Send request to node helper
				this.sendSocketNotification("GET_LEAGUE_DATA", {
					...this.config,
					leagueType: leagueCode,
					url: url
				});
			}, index * 500);
		});
	},

	// Utility: determine if a WC stage is complete based on available data
	isWorldCupStageComplete(stageId) {
		const data = this.leagueData && this.leagueData.WORLD_CUP_2026;
		if (!data) return false;

		// For groups: consider complete if every group A-L exists and each team has played all group matches
		if (stageId === "GROUPS") {
			const groups = this.config.showWC2026Groups || [
				"A",
				"B",
				"C",
				"D",
				"E",
				"F",
				"G",
				"H",
				"I",
				"J",
				"K",
				"L"
			];
			if (!data.groups) return false;
			for (const g of groups) {
				const teams = data.groups[g];
				if (!Array.isArray(teams) || teams.length === 0) return false;
				// Heuristic: when standings are final in group tables, BBC usually includes a 'played' equal maximum.
				// We consider group complete if all teams have a non-null played and max played equals min played and is >= number of group opponents.
				const playedVals = teams.map((t) => Number(t.played || 0));
				const minP = Math.min(...playedVals);
				const maxP = Math.max(...playedVals);
				if (!(minP > 0 && minP === maxP)) return false;
			}
			return true;
		}

		// For knockouts: consider complete if knockouts[stage] exists and all fixtures have a non-empty final score with FT/AET/PEN
		const koKey = String(stageId || "").toLowerCase();
		const list = data.knockouts && data.knockouts[koKey];
		if (!Array.isArray(list) || list.length === 0) return false;
		return list.every((f) => {
			const s = (f.score || "").toUpperCase();
			return s && s !== "VS" && /(FT|AET|PEN)/.test(s);
		});
	},

	// Set up auto-cycling between leagues with smooth transitions
	scheduleCycling() {
		if (this._pinned) return; // respect pin state
		var self = this;

		// Clear any existing timer
		if (this.cycleTimer) {
			clearInterval(this.cycleTimer);
			this.cycleTimer = null;
		}

		// ===== NEW: Use dynamically determined enabledLeagueCodes =====
		// Instead of creating from legacy config, we use the already-populated enabledLeagueCodes array
		// This allows cycling through any configured European league

		// Only set up cycling if we have more than one league
		if (this.enabledLeagueCodes && this.enabledLeagueCodes.length > 1) {
			// Create a cycling function that will be called at regular intervals
			const cycleFn = function () {
				if (self.config.debug) {
					Log.info(" MMM-MyTeams-LeagueTable: Running cycle function");
				}

				// Find current and next league
				let currentIndex = self.enabledLeagueCodes.indexOf(self.currentLeague);
				if (currentIndex === -1) {
					// If current league not found in enabled leagues, reset to first league
					currentIndex = 0;
					self.currentLeague = self.enabledLeagueCodes[0];
				}

				let nextIndex = (currentIndex + 1) % self.enabledLeagueCodes.length;
				let nextLeague = self.enabledLeagueCodes[nextIndex];

				if (self.config.debug) {
					Log.info(
						` MMM-MyTeams-LeagueTable: Cycling from ${self.currentLeague} to ${nextLeague}`
					);
				}

				// Update current league
				self.currentLeague = nextLeague;

				// Reconfigure WC subtab cycling if needed (when entering/leaving WC)
				self.scheduleWorldCupSubtabCycling();

				// Use MagicMirror's built-in animation for a reliable transition
				self.updateDom(self.config.animationSpeed || 300);
			};

			// Set up the interval to run continuously
			const interval = this.config.cycleInterval;
			this.cycleTimer = setInterval(cycleFn, interval);

			// Also align WC subtab cycling when entering/leaving WC league
			this.scheduleWorldCupSubtabCycling();

			if (this.config.debug) {
				Log.info(
					` MMM-MyTeams-LeagueTable: Auto-cycling enabled with interval ${
						interval / 1000
					} seconds`
				);
			}
		} else if (this.config.debug) {
			Log.info(
				" MMM-MyTeams-LeagueTable: Auto-cycling not enabled - need at least 2 leagues"
			);
		}
	},

	// Schedule the next update
	scheduleUpdate() {
		var self = this;

		// Clear any existing timer
		if (this.updateTimer) {
			clearTimeout(this.updateTimer);
		}

		// Schedule next update
		let nextUpdate = this.config.updateInterval;
		
		// Task: Reduce refresh time for live matches to once per 3 mins
		let hasLiveGames = false;
		if (this.leagueData) {
			Object.values(this.leagueData).forEach(data => {
				if (data && data.fixtures && Array.isArray(data.fixtures)) {
					if (data.fixtures.some(f => f.live)) {
						hasLiveGames = true;
					}
				}
			});
		}
		
		if (hasLiveGames) {
			nextUpdate = 3 * 60 * 1000; // 3 minutes
			if (this.config.debug) {
				Log.info(" MMM-MyTeams-LeagueTable: Live games detected, increasing refresh rate to 3 minutes.");
			}
		}

		this.updateTimer = setTimeout(function () {
			self.requestAllLeagueData();
			self.scheduleUpdate();
		}, nextUpdate);

		if (this.config.debug) {
			Log.info(
				` MMM-MyTeams-LeagueTable: Next update scheduled in ${nextUpdate / 1000} seconds`
			);
		}
	},

	// Handle notifications from node_helper
	socketNotificationReceived(notification, payload) {
		if (this.config.debug) {
			Log.info(
				` MMM-MyTeams-LeagueTable: Received notification: ${notification}`
			);
		}

		switch (notification) {
			case "LEAGUE_DATA":
				this.processLeagueData(payload);
				break;
			case "FETCH_ERROR":
				this.processError(payload);
				break;
			case "DEBUG_INFO":
				Log.info(`[MTLT-BACKEND] ${payload.message}`, payload.data || "");
				break;
		}
	},

	// Process successful league data
	processLeagueData(data) {
		if (this.config.debug) {
			Log.info(
				` MMM-MyTeams-LeagueTable: Processing league data for ${data.leagueType}: ${JSON.stringify(data && data.meta ? data.meta : {})}`
			);
		}

		// Store data for the specific league
		const leagueType = data.leagueType || "SPFL"; // Default to SPFL if not specified
		this.leagueData[leagueType] = data;
		this.loaded[leagueType] = true;

		// If this is the first data we've received, set it as current
		if (!this.currentLeague || this.currentLeague === leagueType) {
			this.currentLeague = leagueType;
		}

		// Automatically focus on relevant sub-tab if enabled
		if (this.config.autoFocusRelevantSubTab) {
			this._autoFocusRelevantSubTab(leagueType);
		}

		this.error = null;
		this.retryCount = 0;

		// Use debounced DOM update to batch multiple league updates together
		this.debouncedUpdateDom(this.config.animationSpeed);
	},

	// ===== NEW: Debounced DOM Update =====
	// Batches multiple updates occurring within a short window (e.g., 200ms)
	// to prevent redundant re-renders when multiple leagues update at once
	debouncedUpdateDom(speed) {
		if (this.updateDomTimer) {
			clearTimeout(this.updateDomTimer);
		}

		this.updateDomTimer = setTimeout(() => {
			this.updateDom(speed || this.config.animationSpeed);
			this.updateDomTimer = null;
		}, 200);
	},

	// Process error from data fetch
	processError(error) {
		Log.error(
			` MMM-MyTeams-LeagueTable: Error fetching data: ${error && error.message ? error.message : String(error)}`
		);

		this.error = error;
		this.retryCount++;

		// Retry if we haven't exceeded max retries
		if (this.retryCount <= this.config.maxRetries) {
			var self = this;
			setTimeout(function () {
				if (self.config.debug) {
					Log.info(
						` MMM-MyTeams-LeagueTable: Retrying data fetch (attempt ${self.retryCount})`
					);
				}
				self.requestAllLeagueData();
			}, this.config.retryDelay);
		} else {
			Log.error(" MMM-MyTeams-LeagueTable: Max retries exceeded, giving up");
			this.updateDom(this.config.animationSpeed);
		}
	},

	// Get league information from EUROPEAN_LEAGUES (if available) or legacy config
	getLeagueInfo(leagueCode) {
		// Map of league codes to their information
		// This includes new EUROPEAN_LEAGUES format and legacy codes
		const leagueMapping = {
			// Legacy codes (for backward compatibility)
			SPFL: {
				name: "Scottish Premiership",
				countryFolder: "Scotland",
				countryCode: "SC"
			},
			SPFLC: {
				name: "Scottish Championship",
				countryFolder: "Scotland",
				countryCode: "SC"
			},
			EPL: {
				name: "English Premier League",
				countryFolder: "England",
				countryCode: "EN"
			},
			UCL: {
				name: "UEFA Champions League",
				countryFolder: null,
				countryCode: "EU",
				logo: "modules/MMM-MyTeams-LeagueTable/images/crests/UEFA-Champions-League/UCL_Trophy.png"
			},
			UEL: {
				name: "UEFA Europa League",
				countryFolder: null,
				countryCode: "EU",
				logo: "modules/MMM-MyTeams-LeagueTable/images/crests/UEFA-Europa-League/UEL_Trophy.png"
			},
			ECL: {
				name: "UEFA Conference League",
				countryFolder: null,
				countryCode: "EU",
				logo: "modules/MMM-MyTeams-LeagueTable/images/crests/UEFA-Conference-League/UECL_Trophy.png"
			},
			SCOTLAND_PREMIERSHIP: {
				name: "Scottish Premiership",
				countryFolder: "Scotland",
				countryCode: "SC"
			},
			SCOTLAND_CHAMPIONSHIP: {
				name: "Scottish Championship",
				countryFolder: "Scotland",
				countryCode: "SC"
			},
			ENGLAND_PREMIER_LEAGUE: {
				name: "English Premier League",
				countryFolder: "England",
				countryCode: "EN"
			},
			GERMANY_BUNDESLIGA: {
				name: "Bundesliga",
				countryFolder: "Germany",
				countryCode: "DE"
			},
			FRANCE_LIGUE1: {
				name: "Ligue 1",
				countryFolder: "France",
				countryCode: "FR"
			},
			SPAIN_LA_LIGA: {
				name: "La Liga",
				countryFolder: "Spain",
				countryCode: "ES"
			},
			ITALY_SERIE_A: {
				name: "Serie A",
				countryFolder: "Italy",
				countryCode: "IT"
			},
			NETHERLANDS_EREDIVISIE: {
				name: "Eredivisie",
				countryFolder: "The_Netherlands",
				countryCode: "NL"
			},
			BELGIUM_PRO_LEAGUE: {
				name: "Belgian Pro League",
				countryFolder: "Belgium",
				countryCode: "BE"
			},
			PORTUGAL_PRIMEIRA_LIGA: {
				name: "Primeira Liga",
				countryFolder: "Portugal",
				countryCode: "PT"
			},
			GREECE_SUPER_LEAGUE: {
				name: "Greek Super League",
				countryFolder: "Greece",
				countryCode: "GR"
			},
			TURKEY_SUPER_LIG: {
				name: "Turkish Super Lig",
				countryFolder: "Turkey",
				countryCode: "TR"
			},
			UKRAINE_PREMIER_LEAGUE: {
				name: "Ukrainian Premier League",
				countryFolder: "Ukraine",
				countryCode: "UA"
			},
			ROMANIA_LIGA_I: {
				name: "Liga I",
				countryFolder: "Romania",
				countryCode: "RO"
			},
			CROATIA_HNL: {
				name: "Croatian HNL",
				countryFolder: "Croatia",
				countryCode: "HR"
			},
			SERBIA_SUPER_LIGA: {
				name: "Serbian Super Liga",
				countryFolder: "Serbia",
				countryCode: "RS"
			},
			AUSTRIA_BUNDESLIGA: {
				name: "Austrian Bundesliga",
				countryFolder: "Austria",
				countryCode: "AT"
			},
			CZECH_LIGA: {
				name: "Czech Liga",
				countryFolder: "Czech Republic",
				countryCode: "CZ"
			},
			HUNGARY_NBI: {
				name: "Hungarian NB I",
				countryFolder: "Hungary",
				countryCode: "HU"
			},
			POLAND_EKSTRAKLASA: {
				name: "Ekstraklasa",
				countryFolder: "Poland",
				countryCode: "PL"
			},
			SWITZERLAND_SUPER_LEAGUE: {
				name: "Swiss Super League",
				countryFolder: "Switzerland",
				countryCode: "CH"
			},
			SWEDEN_ALLSVENSKAN: {
				name: "Allsvenskan",
				countryFolder: "Sweden",
				countryCode: "SE"
			},
			NORWAY_ELITESERIEN: {
				name: "Eliteserien",
				countryFolder: "Norway",
				countryCode: "NO"
			},
			DENMARK_SUPERLIGAEN: {
				name: "Superligaen",
				countryFolder: "Denmark",
				countryCode: "DK"
			},
			WORLD_CUP_2026: {
				name: "FIFA WC 2026",
				countryFolder: "FIFA-WC26",
				countryCode: "WC",
				logo: "modules/MMM-MyTeams-LeagueTable/images/WC_Trophy.png"
			},
			// New EUROPEAN_LEAGUES format codes
			UEFA_CHAMPIONS_LEAGUE: {
				name: "UEFA Champions League",
				countryFolder: null,
				countryCode: "EU",
				logo: "modules/MMM-MyTeams-LeagueTable/images/crests/UEFA-Champions-League/UCL_Trophy.png"
			},
			UEFA_EUROPA_LEAGUE: {
				name: "UEFA Europa League",
				countryFolder: null,
				countryCode: "EU",
				logo: "modules/MMM-MyTeams-LeagueTable/images/crests/UEFA-Europa-League/UEL_Trophy.png"
			},
			UEFA_EUROPA_CONFERENCE_LEAGUE: {
				name: "UEFA Conference League",
				countryFolder: null,
				countryCode: "EU",
				logo: "modules/MMM-MyTeams-LeagueTable/images/crests/UEFA-Conference-League/UECL_Trophy.png"
			}
			
		};

		return leagueMapping[leagueCode] || null;
	},

	// Get league abbreviation from league code
	getLeagueAbbreviation(leagueCode) {
		// Map codes to abbreviations
		const abbreviations = {
			SPFL: "SPFL",
			SPFLC: "SPFLC",
			EPL: "EPL",
			UCL: "UCL",
			UEL: "UEL",
			ECL: "ECL",
			UEFA_CHAMPIONS_LEAGUE: "UCL",
			UEFA_EUROPA_LEAGUE: "UEL",
			UEFA_EUROPA_CONFERENCE_LEAGUE: "UECL",
			SCOTLAND_PREMIERSHIP: "SPL",
			SCOTLAND_CHAMPIONSHIP: "SLC",
			ENGLAND_PREMIER_LEAGUE: "EPL",
			GERMANY_BUNDESLIGA: "BL",
			FRANCE_LIGUE1: "L1",
			SPAIN_LA_LIGA: "LL",
			ITALY_SERIE_A: "SA",
			NETHERLANDS_EREDIVISIE: "ED",
			BELGIUM_PRO_LEAGUE: "PL",
			PORTUGAL_PRIMEIRA_LIGA: "PL",
			GREECE_SUPER_LEAGUE: "SL",
			TURKEY_SUPER_LIG: "SL",
			UKRAINE_PREMIER_LEAGUE: "UPL",
			ROMANIA_LIGA_I: "LI",
			CROATIA_HNL: "HNL",
			SERBIA_SUPER_LIGA: "SL",
			AUSTRIA_BUNDESLIGA: "AB",
			CZECH_LIGA: "CL",
			HUNGARY_NBI: "NBI",
			POLAND_EKSTRAKLASA: "EK",
			SWITZERLAND_SUPER_LEAGUE: "SL",
			SWEDEN_ALLSVENSKAN: "AS",
			NORWAY_ELITESERIEN: "ES",
			DENMARK_SUPERLIGAEN: "SL"
		};

		return (
			abbreviations[leagueCode] || leagueCode.substring(0, 3).toUpperCase()
		);
	},

	// Handle league button clicks with smooth transitions
	handleLeagueButtonClick(event) {
		if (!event) return;

		if (this.config.debug) {
			Log.info(" MMM-MyTeams-LeagueTable: League button clicked");
		}

		// Prevent default behavior to avoid any scrolling/jumping issues
		if (event.preventDefault) event.preventDefault();
		if (event.stopPropagation) event.stopPropagation();

		// Robust button detection:
		// 1. event.currentTarget is the element the listener was attached to (the button)
		// 2. Fallback to closest .league-btn for delegation support
		let button = event.currentTarget;

		// If currentTarget is null or not the button, use target and find the closest button
		if (!button || (button.classList && !button.classList.contains("league-btn"))) {
			if (event.target && typeof event.target.closest === "function") {
				button = event.target.closest(".league-btn");
			}
		}

		// Final check: if we still don't have a valid button, return
		if (!button || typeof button.getAttribute !== "function") {
			if (this.config.debug) {
				Log.warn(" MMM-MyTeams-LeagueTable: No valid league button found in click event");
			}
			return;
		}

		// Get league code with multiple fallbacks for cross-browser compatibility
		const leagueCode =
			button.getAttribute("data-league") ||
			(button.dataset ? button.dataset.league : null);

		if (!leagueCode) {
			if (this.config.debug) {
				Log.warn(" MMM-MyTeams-LeagueTable: Clicked element has no data-league attribute");
			}
			return;
		}

		const league = this.normalizeLeagueCode(leagueCode);

		if (league) {
			if (this.config.debug) {
				Log.info(` MMM-MyTeams-LeagueTable: Switching to league: ${league}`);
			}

			if (this.currentLeague !== league) {
				// Update current league
				this.currentLeague = league;

				// Reset sub-tab for the new league
				const uefaLeagues = [
					"UEFA_CHAMPIONS_LEAGUE",
					"UEFA_EUROPA_LEAGUE",
					"UEFA_EUROPA_CONFERENCE_LEAGUE",
					"UCL",
					"UEL",
					"ECL"
				];
				if (league === "WORLD_CUP_2026") {
					this.currentSubTab = this.config.defaultWCSubTab || "A";
				} else if (uefaLeagues.includes(league)) {
					this.currentSubTab = "Table";
				} else {
					this.currentSubTab = null;
				}

				// Use MagicMirror's built-in animation for a reliable transition
				this.updateDom(this.config.animationSpeed || 300);

				// Reset auto-cycling timer if we're manually changing leagues
				if (this.config.autoCycle && this.cycleTimer) {
					this.scheduleCycling();
				}
				// Ensure WC sub-tab cycling is aligned with manual league change
				this.scheduleWorldCupSubtabCycling();
			}
		}
	},

	// Handle back to top button click
	handleBackToTopClick() {
		const root = document.getElementById(`mtlt-${this.identifier}`);
		const tableContainer = root
			? root.querySelector(".league-body-scroll") || root.querySelector(".league-content-container")
			: null;
		if (tableContainer) {
			// Use smooth scrolling for a better user experience
			tableContainer.scrollTo({
				top: 0,
				behavior: "smooth"
			});

			// Update button visibility after scrolling
			setTimeout(() => {
				this.updateScrollButtons();
			}, 500);
		}
	},

	// Update scroll buttons visibility based on scroll position (log only on state change)
	updateScrollButtons() {
		const root = document.getElementById(`mtlt-${this.identifier}`);
		const tableContainer = root
			? root.querySelector(".league-body-scroll") || root.querySelector(".league-content-container")
			: null;
		const backToTopControls = root
			? root.querySelector(".back-to-top-controls")
			: null;
		const toggleIcon = root
			? root.querySelector(".LeagueTable-toggle-icon")
			: null;

		if (tableContainer && backToTopControls) {
			const scrollTop = tableContainer.scrollTop;
			const isScrolled = scrollTop > 30;

			// Update toggle icon visibility (show when scrolled OR when module is hidden)
			if (toggleIcon) {
				if (isScrolled || this.isContentHidden) {
					toggleIcon.classList.add("visible");
				} else {
					toggleIcon.classList.remove("visible");
				}
			}

			// Footer is now always visible via CSS sticky behavior
			// We just update the internal isScrolling state for other components
			this.isScrolling = isScrolled;
			
			// Always ensure the visible class is present for internal consistency
			if (!backToTopControls.classList.contains("visible")) {
				backToTopControls.classList.add("visible");
			}
		} else {
			if (this.config.debug) {
				Log.warn(
					`[LeagueTable] Missing elements - root: ${!!root} tableContainer: ${!!tableContainer} backToTopControls: ${!!backToTopControls}`
				);
			}
		}
	},

	// Compute and set team name column width to longest name + 10px
	updateTeamNameColumnWidth() {
		const root = document.getElementById(`mtlt-${this.identifier}`);
		if (!root) return;
		const names = root.querySelectorAll(".team-cell .team-name");
		if (!names || names.length === 0) return;
		// Build hidden measurer with same font properties
		const sample = names[0];
		const cs = window.getComputedStyle(sample);
		const measurer = document.createElement("span");
		measurer.style.position = "absolute";
		measurer.style.visibility = "hidden";
		measurer.style.whiteSpace = "nowrap";
		measurer.style.left = "-9999px";
		measurer.style.top = "-9999px";
		measurer.style.fontFamily = cs.fontFamily;
		measurer.style.fontSize = cs.fontSize;
		measurer.style.fontWeight = cs.fontWeight;
		measurer.style.fontStyle = cs.fontStyle;
		document.body.appendChild(measurer);
		let max = 0;
		names.forEach((n) => {
			measurer.textContent = n.textContent || "";
			const w = measurer.offsetWidth;
			if (w > max) max = w;
		});
		measurer.remove();
		const width = Math.ceil(max + 10);
		root.style.setProperty("--team-name-width", `${width}px`);
	},

	// Helper: skip redundant renders if same league/subtab and no pending error/loading state
	_shouldSkipRender() {
		const key = `${this.currentLeague}::${this.currentSubTab || "-"}`;
		if (this._lastRenderedKey === key) return true;
		this._lastRenderedKey = key;
		return false;
	},

	// Pause all cycling timers
	_pauseCycling() {
		if (this.cycleTimer) {
			clearInterval(this.cycleTimer);
			this.cycleTimer = null;
		}
		if (this.wcSubtabTimer) {
			clearInterval(this.wcSubtabTimer);
			this.wcSubtabTimer = null;
		}
		if (this.wcInitialDelayTimer) {
			clearTimeout(this.wcInitialDelayTimer);
			this.wcInitialDelayTimer = null;
		}
		this._stopHeaderCountdown();
	},
	// Resume cycling timers if config allows
	_resumeCyclingIfNeeded() {
		if (this.isScrolling || this._pinned) return;
		if (this.config.autoCycle || this.config.onlyShowWorldCup2026) {
			this.scheduleCycling();
			this.scheduleWorldCupSubtabCycling();
			this._startHeaderCountdown();
		}
	},
	// Attach scroll-based pause/resume to a container
	_attachScrollPause(tableContainer) {
		if (!tableContainer) return;
		let lastScrolling = this.isScrolling;
		tableContainer.addEventListener(
			"scroll",
			() => {
				const nowScrolling = tableContainer.scrollTop > 30;
				if (nowScrolling && !lastScrolling) {
					this.isScrolling = true;
					this._pauseCycling();
					lastScrolling = true;
				} else if (!nowScrolling && lastScrolling) {
					this.isScrolling = false;
					this._resumeCyclingIfNeeded();
					lastScrolling = false;
				}
			},
			{ passive: true }
		);
	},

	// Generate the DOM content
	getDom() {
		var self = this; // Preserve 'this' context for nested functions/callbacks
		var wrapper = document.createElement("div");
		wrapper.className = "spfl-league-table";
		wrapper.id = `mtlt-${this.identifier}`;
		wrapper.setAttribute("data-league", this.currentLeague);
		if (this.isContentHidden) {
			wrapper.classList.add("content-hidden");
		}

		// If content is hidden, return wrapper with toggle icon and source in footer
		if (this.isContentHidden) {
			const hiddenWrapper = document.createElement("div");
			hiddenWrapper.className = "spfl-league-table content-hidden";
			
			const footer = document.createElement("div");
			footer.className = "back-to-top-controls visible"; // Always visible when hidden
			footer.style.display = "flex";
			footer.style.justifyContent = "space-between";
			footer.style.alignItems = "center";
			footer.style.width = "100%";
			footer.style.boxSizing = "border-box";
			
			// Left: Toggle icon
			const toggleIcon = this._createToggleIcon();
			footer.appendChild(toggleIcon);

			// Center: Source info
			if (currentData) {
				const sourceContainer = document.createElement("div");
				sourceContainer.className = "footer-source-info";
				sourceContainer.style.flex = "1";
				sourceContainer.style.textAlign = "center";
				sourceContainer.style.margin = "0 10px";
				
				const src = currentData.source || "BBC Sport";
				const tsDate = currentData.meta && currentData.meta.lastUpdated ? new Date(currentData.meta.lastUpdated) : new Date();
				const ts = tsDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
				
				sourceContainer.innerHTML = `<span class="dimmed xsmall">Source: ${src}</span> • <span class="dimmed xsmall last-updated">${this.translate("LAST_UPDATED")}: ${ts}</span>`;
				footer.appendChild(sourceContainer);
			}

			// Right: Spacer to keep source centered
			const spacer = document.createElement("div");
			spacer.style.width = "40px"; // Roughly the width of the toggle icon
			footer.appendChild(spacer);
			
			hiddenWrapper.appendChild(footer);
			return hiddenWrapper;
		}

		// Apply league-specific mode classes for selective CSS styling
		const uefaLeagues = ["UEFA_CHAMPIONS_LEAGUE", "UEFA_EUROPA_LEAGUE", "UEFA_EUROPA_CONFERENCE_LEAGUE", "UCL", "UEL", "ECL"];
		if (this.currentLeague === "WORLD_CUP_2026") {
			wrapper.classList.add("league-mode-wc");
		} else if (uefaLeagues.includes(this.currentLeague)) {
			wrapper.classList.add("league-mode-uefa");
		} else {
			wrapper.classList.add("league-mode-national");
		}

		const wrapperFragment = document.createDocumentFragment();

		this._applyThemeOverrides();

		// Skip re-render when content is identical and no error/loading change
		if (!this.error && this.loaded[this.currentLeague] && this._shouldSkipRender()) {
			const placeholder = document.createElement("div");
			placeholder.style.display = "none";
			return placeholder;
		}

		// Create header with league buttons
		var headerContainer = document.createElement("div");
		headerContainer.className = "league-header-container";

		// Create league title
		var leagueTitle = document.createElement("div");
		leagueTitle.className = "league-title";

		// Use "FIFA World Cup 2026" as header if onlyShowWorldCup2026 is true
		if (this.config.onlyShowWorldCup2026) {
			leagueTitle.textContent = null; // "FIFA World Cup 2026";
		} else {
			let baseTitle = this.config.leagueHeaders[this.currentLeague] || this.currentLeague;
			if (this.currentLeague === "WORLD_CUP_2026" && this.currentSubTab) {
				const sub = this.currentSubTab;
				const stageMap = { Rd32: "Round of 32", Rd16: "Round of 16", QF: "Quarter-finals", SF: "Semi-finals", TP: "Third Place", Final: "Final" };
				if (/^[A-L]$/.test(sub)) baseTitle += ` • Group ${sub}`;
				else if (stageMap[sub]) baseTitle += ` • ${stageMap[sub]}`;
			}
			leagueTitle.textContent = baseTitle;
		}

		headerContainer.appendChild(leagueTitle);

		// Add meta info (Last Updated and Refresh button)
		const metaInfo = document.createElement("div");
		metaInfo.className = "league-meta-info";

		const currentData = this.leagueData[this.currentLeague];
		if (currentData && currentData.meta && currentData.meta.lastUpdated) {
			const lastUpdated = document.createElement("span");
			lastUpdated.className = "last-updated xsmall dimmed";

			// Format timestamp (e.g., "18:35")
			const date = new Date(currentData.meta.lastUpdated);
			const timeStr = date.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit"
			});
			lastUpdated.textContent = `${this.translate("LAST_UPDATED")}: ${timeStr}`;
			metaInfo.appendChild(lastUpdated);
		}

		// Add Stale Data warning if we are showing a cache fallback (fetch failed) OR data is incomplete
		if (currentData && (currentData.cacheFallback || currentData.incomplete)) {
			const staleWarning = document.createElement("span");
			staleWarning.className = "stale-warning xsmall";
			staleWarning.style.color = "#ffa500"; // Orange alert color
			staleWarning.style.marginLeft = "8px";
			staleWarning.style.fontWeight = "bold";
			
			if (currentData.cacheFallback) {
				staleWarning.innerHTML = '<i class="fas fa-history"></i> STALE';
				staleWarning.title = "Live fetch failed: Showing last cached result";
			} else {
				staleWarning.innerHTML = '<i class="fas fa-exclamation-circle"></i> INCOMPLETE';
				staleWarning.title = "Live data missing statistics: Parser may need update or data not yet available";
			}
			
			metaInfo.appendChild(staleWarning);
		}

		// Add manual refresh button (only if not in WORLD_CUP_2026 mode, which has its own refresh button location)
		if (this.currentLeague !== "WORLD_CUP_2026") {
			const refreshBtn = document.createElement("span");
			refreshBtn.className = "refresh-btn fas fa-sync-alt small dimmed";
			refreshBtn.title = "Refresh Data";
			refreshBtn.setAttribute("aria-label", "Refresh Data");
			refreshBtn.setAttribute("role", "button");
			refreshBtn.style.cursor = "pointer";
			refreshBtn.style.marginLeft = "8px";
			refreshBtn.addEventListener("click", () => {
				this.requestAllLeagueData();
				refreshBtn.classList.add("fa-spin");
				setTimeout(() => refreshBtn.classList.remove("fa-spin"), 2000);
			});
			metaInfo.appendChild(refreshBtn);

			// Add Clear Cache button when enabled
			if (this.config.clearCacheButton === true) {
				const clearBtn = document.createElement("span");
				clearBtn.className = "clear-cache-btn fas fa-trash-alt small dimmed";
				clearBtn.title = "Clear Cache";
				clearBtn.setAttribute("aria-label", "Clear Cache");
				clearBtn.setAttribute("role", "button");
				clearBtn.style.cursor = "pointer";
				clearBtn.style.marginLeft = "8px";
				clearBtn.addEventListener("click", () => {
					// Send clear cache notification
					this.sendSocketNotification("CACHE_CLEAR_ALL");
					// Visual feedback – pulse/spin briefly
					clearBtn.classList.add("fa-spin");
					setTimeout(() => clearBtn.classList.remove("fa-spin"), 1500);
				});
				metaInfo.appendChild(clearBtn);
			}
		}

		// Pin control and countdown in header
	const pinBtn = document.createElement("span");
	pinBtn.className = "pin-btn fas fa-thumbtack small dimmed";
	pinBtn.setAttribute("role", "button");
	pinBtn.setAttribute("aria-pressed", this._pinned);
	pinBtn.setAttribute("aria-label", this._pinned ? "Unpin (resume auto-cycling)" : "Pin (pause auto-cycling)");
	pinBtn.title = this._pinned ? "Unpin (resume auto-cycling)" : "Pin (pause auto-cycling)";
	pinBtn.style.cursor = "pointer";
	pinBtn.style.marginLeft = "8px";
	pinBtn.addEventListener("click", () => {
		this._pinned = !this._pinned;
		pinBtn.classList.toggle("active", this._pinned);
		pinBtn.setAttribute("aria-pressed", this._pinned);
		pinBtn.setAttribute("aria-label", this._pinned ? "Unpin (resume auto-cycling)" : "Pin (pause auto-cycling)");
		pinBtn.title = this._pinned ? "Unpin (resume auto-cycling)" : "Pin (pause auto-cycling)";
		if (this._pinned) {
			this._pauseCycling();
			this._stopHeaderCountdown();
		} else {
			this._resumeCyclingIfNeeded();
			this._startHeaderCountdown();
		}
	});
	metaInfo.appendChild(pinBtn);
	const countdown = document.createElement("span");
	countdown.className = "cycle-countdown xsmall dimmed";
	countdown.style.marginLeft = "8px";
	this._countdownEl = countdown;
	metaInfo.appendChild(countdown);

	headerContainer.appendChild(metaInfo);
	wrapperFragment.appendChild(headerContainer);

		// Create league buttons container
		var buttonsContainer = document.createElement("div");
		buttonsContainer.className = "league-buttons-container";

		// Hide buttons if showLeagueButtons is false
		if (this.config.showLeagueButtons === false) {
			buttonsContainer.style.display = "none";
		}

		// Auto-generate buttons from selectedLeagues if autoGenerateButtons is enabled
		if (
			this.config.autoGenerateButtons &&
			this.enabledLeagueCodes &&
			this.enabledLeagueCodes.length > 0
		) {
			const buttonsFragment = document.createDocumentFragment();
			// Move WORLD_CUP_2026 to the end if present
			const displayOrder = [...this.enabledLeagueCodes].sort((a, b) => {
				if (a === "WORLD_CUP_2026") return 1;
				if (b === "WORLD_CUP_2026") return -1;
				return 0; // Maintain original relative order for other leagues
			});

			displayOrder.forEach((leagueCode) => {
				// If onlyShowWorldCup2026 is true, we don't show the league tab buttons at all
				// as the header title already indicates the league and it's the only one shown.
				if (
					this.config.onlyShowWorldCup2026 === true &&
					leagueCode === "WORLD_CUP_2026"
				) {
					return;
				}

				const leagueInfo = this.getLeagueInfo(leagueCode);
				if (leagueInfo) {
					const btn = document.createElement("button");
					// Normalize codes for reliable active state comparison
					const normalizedCode = this.normalizeLeagueCode(leagueCode);
					const isCurrentlyActive = this.currentLeague === normalizedCode;

					btn.className = `league-btn${isCurrentlyActive ? " active" : ""}`;
					btn.title = leagueInfo.name; // Tooltip for full league name
					btn.setAttribute("aria-label", `Switch to ${leagueInfo.name} table`);

					// Set data attributes using setAttribute for maximum compatibility
					btn.setAttribute("data-league", leagueCode);
					btn.setAttribute("data-country", leagueInfo.countryCode || "");

					// Add fallback text (league abbreviation)
					const fallbackText = document.createElement("span");
					fallbackText.className = "league-abbr";
					fallbackText.textContent = this.getLeagueAbbreviation(leagueCode);
					btn.appendChild(fallbackText);

					// Create button content: Priority 1: Specific logo path (e.g. for World Cup)
					if (leagueInfo.logo) {
						const logoImg = document.createElement("img");
						logoImg.className = "flag-image"; // Reuse existing class for consistent sizing
						logoImg.loading = "lazy";
						logoImg.alt = leagueInfo.name;
						logoImg.src = leagueInfo.logo;
						logoImg.onload = function () {
							fallbackText.style.display = "none";
						};
						logoImg.onerror = function () {
							this.style.display = "none";
							fallbackText.style.display = "inline";
						};
						btn.appendChild(logoImg);
					}
					// Priority 2: Standard country flag image
					else if (leagueInfo.countryFolder) {
						const flagImg = document.createElement("img");
						flagImg.className = "flag-image";
						flagImg.loading = "lazy";
						flagImg.alt = leagueInfo.name;
						// Construct path to flag image (e.g., "modules/MMM-MyTeams-LeagueTable/images/crests/Scotland/scotland.png")
						const countryName = leagueInfo.countryFolder
							.toLowerCase()
							.replace(/\s+/g, "-");
						flagImg.src = `modules/MMM-MyTeams-LeagueTable/images/crests/${leagueInfo.countryFolder}/${countryName}.png`;

						// Enhanced fallback handling with multiple filename attempts
						let fallbackAttempts = 0;
						const flagFallbacks = [
							// Try with underscores instead of hyphens for spaces
							`modules/MMM-MyTeams-LeagueTable/images/crests/${leagueInfo.countryFolder}/${leagueInfo.countryFolder.toLowerCase().replace(/\s+/g, "_")}.png`,
							// Try just the country folder name without subfolder (in case flag is in root)
							`modules/MMM-MyTeams-LeagueTable/images/crests/${countryName}.png`,
							// Try country folder with underscores in root
							`modules/MMM-MyTeams-LeagueTable/images/crests/${leagueInfo.countryFolder.toLowerCase().replace(/\s+/g, "_")}.png`
						];

						flagImg.onload = function () {
							fallbackText.style.display = "none";
						};

						flagImg.onerror = function () {
							if (fallbackAttempts < flagFallbacks.length) {
								this.src = flagFallbacks[fallbackAttempts];
								fallbackAttempts++;
								if (self.config.debug) {
									Log.info(
										` MMM-MyTeams-LeagueTable: Flag fallback attempt ${fallbackAttempts} for ${leagueInfo.name}: ${this.src}`
									);
								}
							} else {
								// If all attempts fail, hide the image and show text
								this.style.display = "none";
								fallbackText.style.display = "inline";
								if (self.config.debug) {
									Log.warn(
										` MMM-MyTeams-LeagueTable: Flag image not found for ${leagueInfo.name} (country: ${leagueInfo.countryFolder})`
									);
								}
							}
						};
						btn.appendChild(flagImg);
					} else {
						// No logo or country folder, just show text
						fallbackText.style.display = "inline";
					}

					btn.addEventListener("click", (e) => {
						this.handleLeagueButtonClick(e);
					});
					buttonsFragment.appendChild(btn);
				}
			});
			buttonsContainer.appendChild(buttonsFragment);
		} else {
			const buttonsFragment = document.createDocumentFragment();
			// Legacy button generation
			const leagueButtonsConfig = [
				{ key: "SPFL", show: this.config.showSPFL, text: "SPFL" },
				{ key: "SPFLC", show: this.config.showSPFLC, text: "SPFLC" },
				{ key: "UCL", show: this.config.showUCL, text: "UCL" },
				{ key: "UEL", show: this.config.showUEL, text: "UEL" },
				{ key: "ECL", show: this.config.showECL, text: "ECL" },
				{ key: "EPL", show: this.config.showEPL, text: "EPL" }
			];

			// Get the order of leagues from known order, respecting enabled flags
			const configOrder = [];
			const knownLeaguesOrder = ["SPFL", "SPFLC", "UCL", "UEL", "ECL", "EPL"];
			knownLeaguesOrder.forEach((lk) => {
				if (this.config[`show${lk}`]) {
					configOrder.push(lk);
				}
			});

			// If we found enabled leagues in the config, use that order
			if (configOrder.length > 0) {
				// Create buttons in the order they appear
				configOrder.forEach((leagueKey) => {
					const league = leagueButtonsConfig.find((l) => l.key === leagueKey);
					if (league && league.show) {
						const btn = document.createElement("button");
						// Normalize codes for reliable active state comparison
						const normalizedCode = this.normalizeLeagueCode(league.key);
						const isCurrentlyActive = this.currentLeague === normalizedCode;

						btn.className = `league-btn${isCurrentlyActive ? " active" : ""}`;
						btn.textContent = league.text;
						btn.setAttribute("aria-label", `Switch to ${league.text} league table`);
						btn.setAttribute("aria-pressed", isCurrentlyActive ? "true" : "false");
						btn.setAttribute("role", "tab");

						// Set data attributes using setAttribute for maximum compatibility
						btn.setAttribute("data-league", league.key);

						btn.addEventListener("click", (e) => {
							this.handleLeagueButtonClick(e);
						});
						buttonsFragment.appendChild(btn);
					}
				});
			} else {
				// Fallback to the original order if no enabled leagues found in config
				leagueButtonsConfig.forEach((league) => {
					if (league.show) {
						const btn = document.createElement("button");
						// Normalize codes for reliable active state comparison
						const normalizedCode = this.normalizeLeagueCode(league.key);
						const isCurrentlyActive = this.currentLeague === normalizedCode;

						btn.className = `league-btn${isCurrentlyActive ? " active" : ""}`;
						btn.textContent = league.text;
						btn.setAttribute("aria-label", `Switch to ${league.text} league table`);
						btn.setAttribute("aria-pressed", isCurrentlyActive ? "true" : "false");
						btn.setAttribute("role", "tab");

						// Set data attributes using setAttribute for maximum compatibility
						btn.setAttribute("data-league", league.key);

						btn.addEventListener("click", (e) => {
							this.handleLeagueButtonClick(e);
						});
						buttonsFragment.appendChild(btn);
					}
				});
			}
		buttonsContainer.appendChild(buttonsFragment);
	}

	this._addHorizontalScrollIndicators(buttonsContainer, wrapperFragment);

	// ===== NEW: Sub-tabs (World Cup & UEFA Competitions) =====
		if (this.currentLeague === "WORLD_CUP_2026" || uefaLeagues.includes(this.currentLeague)) {
			var subTabsContainer = document.createElement("div");
			subTabsContainer.className = "wc-subtabs-container single-line";
			const subTabsFragment = document.createDocumentFragment();

			// Add manual refresh button to the left of the tabs
			const refreshBtn = document.createElement("button");
			refreshBtn.className = "wc-btn refresh-btn-wc";
			refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
			refreshBtn.addEventListener("click", () => {
				this.requestAllLeagueData();
				const icon = refreshBtn.querySelector("i");
				if (icon) icon.classList.add("fa-spin");
				setTimeout(() => { if (icon) icon.classList.remove("fa-spin"); }, 2000);
			});
			subTabsFragment.appendChild(refreshBtn);

			const currentData = this.leagueData[this.currentLeague];
			const isTestMode = this.config.displayAllTabs;

			if (this.currentLeague === "WORLD_CUP_2026") {
				// Generate Group Tabs (A-L) for World Cup
				const groupsToShow = this.config.showWC2026Groups || ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
				groupsToShow.forEach((groupLetter) => {
					if (isTestMode || (currentData && currentData.groups && currentData.groups[groupLetter])) {
						const btn = document.createElement("button");
						btn.className = `wc-btn${this.currentSubTab === groupLetter ? " active" : ""}`;
						btn.textContent = groupLetter;
						btn.setAttribute("aria-label", `Show Group ${groupLetter} standings`);
						btn.setAttribute("aria-pressed", this.currentSubTab === groupLetter ? "true" : "false");
						btn.setAttribute("role", "tab");
						btn.addEventListener("click", () => {
							this.currentSubTab = groupLetter;
							this.updateDom(this.config.animationSpeed);
						});
						subTabsFragment.appendChild(btn);
					}
				});

				// Generate World Cup Knockout Tabs
				const knockouts = [
					{ id: "Rd32", label: "Rd32" },
					{ id: "Rd16", label: "Rd16" },
					{ id: "QF", label: "QF" },
					{ id: "SF", label: "SF" },
					{ id: "TP", label: "TP" },
					{ id: "Final", label: "Final" }
				];
				knockouts.forEach((ko) => {
					if (this.config.showWC2026Knockouts.includes(ko.id)) {
						let shouldShow = isTestMode;
						if (!shouldShow && currentData && currentData.knockouts) {
							const koKey = ko.id.toLowerCase();
							if (currentData.knockouts[koKey] && currentData.knockouts[koKey].length > 0) {
								shouldShow = true;
							}
						}
						if (shouldShow) {
							const btn = document.createElement("button");
							btn.className = `wc-btn ko-btn${this.currentSubTab === ko.id ? " active" : ""}`;
							btn.textContent = ko.label;
							btn.setAttribute("aria-label", `Show ${ko.label} fixtures`);
							btn.setAttribute("aria-pressed", this.currentSubTab === ko.id ? "true" : "false");
							btn.setAttribute("role", "tab");
							btn.addEventListener("click", () => {
								this.currentSubTab = ko.id;
								this.updateDom(this.config.animationSpeed);
							});
							subTabsFragment.appendChild(btn);
						}
					}
				});
			} else {
				// Generate UEFA League/Table Tab
				const tableBtn = document.createElement("button");
				tableBtn.className = `wc-btn${(!this.currentSubTab || this.currentSubTab === "Table") ? " active" : ""}`;
				tableBtn.textContent = "Table";
				tableBtn.addEventListener("click", () => {
					this.currentSubTab = "Table";
					this.updateDom(this.config.animationSpeed);
				});
				subTabsFragment.appendChild(tableBtn);

				// Generate UEFA Knockout Tabs
				const uefaKnockouts = [
					{ id: "Playoff", label: "Playoff" },
					{ id: "Rd16", label: "Rd16" },
					{ id: "QF", label: "QF" },
					{ id: "SF", label: "SF" },
					{ id: "Final", label: "Final" }
				];
				uefaKnockouts.forEach((ko) => {
					if (this.config.showUEFAnockouts.includes(ko.id)) {
						let shouldShow = isTestMode;
						if (!shouldShow && currentData && currentData.knockouts) {
							const koKey = ko.id.toLowerCase();
							if (currentData.knockouts[koKey] && currentData.knockouts[koKey].length > 0) {
								shouldShow = true;
							}
						}
						if (shouldShow) {
							const btn = document.createElement("button");
							btn.className = `wc-btn ko-btn${this.currentSubTab === ko.id ? " active" : ""}`;
							btn.textContent = ko.label;
							btn.setAttribute("aria-label", `Show ${ko.label} fixtures`);
							btn.setAttribute("aria-pressed", this.currentSubTab === ko.id ? "true" : "false");
							btn.setAttribute("role", "tab");
							btn.addEventListener("click", () => {
								this.currentSubTab = ko.id;
								this.updateDom(this.config.animationSpeed);
							});
							subTabsFragment.appendChild(btn);
						}
					}
				});
			}

			subTabsContainer.appendChild(subTabsFragment);
			this._addHorizontalScrollIndicators(subTabsContainer, wrapperFragment);
		}

		// Create content container for the table
		var contentContainer = document.createElement("div");
		contentContainer.className = "league-content-container";
		if (
			typeof this.config.maxTableHeight === "number" &&
			this.config.maxTableHeight > 0
		) {
			contentContainer.style.maxHeight = `${this.config.maxTableHeight}px`;
		}

		// Show loading message if data not loaded yet
		if (!this.loaded[this.currentLeague] && !this.error) {
			if (this.config.debug) {
				Log.info(` MMM-MyTeams-LeagueTable: Data not loaded for ${this.currentLeague}. Loaded states: ${JSON.stringify(this.loaded)}`);
			}

			// Safety: If for some reason this league is not being loaded, request it now
			if (this.loaded[this.currentLeague] === undefined) {
				if (this.config.debug) Log.warn(` MMM-MyTeams-LeagueTable: ${this.currentLeague} was not in loaded map, requesting now`);
				this.loaded[this.currentLeague] = false;
				this.requestAllLeagueData();
			}

			// Get readable league name for loading message
			let leagueDisplayName = this.currentLeague;
			if (typeof EUROPEAN_LEAGUES !== "undefined" && EUROPEAN_LEAGUES[this.currentLeague]) {
				leagueDisplayName = EUROPEAN_LEAGUES[this.currentLeague].name || this.currentLeague;
			} else if (this.currentLeague === "WORLD_CUP_2026") {
				leagueDisplayName = "FIFA World Cup 2026";
			}
			
			// Show league-specific loading state with spinner
			const loadingState = document.createElement("div");
			loadingState.className = "loading-state";

			const spinner = document.createElement("i");
			spinner.className = "fas fa-spinner fa-spin";
			loadingState.appendChild(spinner);

			const loadingText = document.createElement("span");
			loadingText.textContent = ` ${this.translate("LOADING")} ${leagueDisplayName}...`;
			loadingState.appendChild(loadingText);

			contentContainer.appendChild(loadingState);
			contentContainer.className += " dimmed light small";
			wrapper.appendChild(wrapperFragment);
			wrapper.appendChild(contentContainer);
			return wrapper;
		}

		// Show error message if there's an error and max retries exceeded
		if (this.error && this.retryCount > this.config.maxRetries) {
			const errorState = document.createElement("div");
			errorState.className = "error-state dimmed light small";
			
			const errorIcon = document.createElement("i");
			errorIcon.className = "fas fa-exclamation-triangle error-icon";
			errorState.appendChild(errorIcon);
			
			const errorText = document.createElement("span");
			errorText.textContent = ` ${this.translate("ERROR")}: ${this.error && this.error.message ? String(this.error.message) : "Source Unavailable"}`;
			errorState.appendChild(errorText);

			const retryBtn = document.createElement("button");
			retryBtn.className = "retry-btn-error";
			retryBtn.textContent = "Retry Now";
			retryBtn.addEventListener("click", () => {
				this.retryCount = 0;
				this.error = null;
				this.requestAllLeagueData();
				this.updateDom(this.config.animationSpeed);
			});
			errorState.appendChild(retryBtn);

			contentContainer.appendChild(errorState);
			wrapper.appendChild(wrapperFragment);
			wrapper.appendChild(contentContainer);
			return wrapper;
		}

		// Show retry message if retrying
		if (this.error && this.retryCount <= this.config.maxRetries) {
			const retryState = document.createElement("div");
			retryState.className = "retry-state dimmed light small";
			
			const retryIcon = document.createElement("i");
			retryIcon.className = "fas fa-sync fa-spin retry-icon";
			retryState.appendChild(retryIcon);
			
			const retryText = document.createElement("span");
			retryText.textContent = ` ${this.translate("RETRYING")} (${this.retryCount}/${this.config.maxRetries})...`;
			retryState.appendChild(retryText);

			contentContainer.appendChild(retryState);
			wrapper.appendChild(wrapperFragment);
			wrapper.appendChild(contentContainer);
			return wrapper;
		}

		// Create the table
		if (currentData) {
			if (this.currentLeague === "WORLD_CUP_2026" || uefaLeagues.includes(this.currentLeague)) {
				contentContainer.appendChild(this.createWorldCupView(currentData));
			} else if (currentData.teams) {
				if (this.config.debug) {
					Log.info(
						` MMM-MyTeams-LeagueTable: Creating table for ${
							this.currentLeague
						} with ${currentData.teams.length} teams`
					);
				}
				contentContainer.appendChild(
					this.createTable(currentData, this.currentLeague)
				);
			} else {
				contentContainer.textContent = `No league data available for ${this.currentLeague}`;
				contentContainer.className += " dimmed light small";
			}
		} else {
			if (this.config.debug) {
				Log.info(
					` MMM-MyTeams-LeagueTable: No league data available for ${this.currentLeague}`
				);
			}
			contentContainer.textContent = `No league data available for ${this.currentLeague}`;
			contentContainer.className += " dimmed light small";
		}

		// Add sticky footer controls (toggle, source info, back-to-top)
		var backToTopControls = document.createElement("div");
		backToTopControls.className = "back-to-top-controls visible"; // Start visible (Task: sticky source footer)
		backToTopControls.style.display = "flex";
		backToTopControls.style.justifyContent = "space-between";
		backToTopControls.style.alignItems = "center";
		backToTopControls.style.width = "100%";
		backToTopControls.style.boxSizing = "border-box";

		// Left side: Toggle icon
		const toggleIcon = this._createToggleIcon();
		backToTopControls.appendChild(toggleIcon);

		// Center: Source information
		if (currentData) {
			const sourceContainer = document.createElement("div");
			sourceContainer.className = "footer-source-info";
			sourceContainer.style.flex = "1";
			sourceContainer.style.textAlign = "center";
			sourceContainer.style.margin = "0 10px";
			
			const src = currentData.source || "BBC Sport";
			const tsDate = currentData.meta && currentData.meta.lastUpdated ? new Date(currentData.meta.lastUpdated) : new Date();
			const ts = tsDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
			
			sourceContainer.innerHTML = `<span class="dimmed xsmall">Source: ${src}</span> • <span class="dimmed xsmall last-updated">${this.translate("LAST_UPDATED")}: ${ts}</span>`;
			backToTopControls.appendChild(sourceContainer);
		}

		// Right side: Back to Top button
		var backToTopBtn = document.createElement("button");
		backToTopBtn.type = "button";
		backToTopBtn.className = "back-to-top-btn";
		backToTopBtn.textContent = "↑ Top"; // Shortened to fit better
		backToTopBtn.addEventListener(
			"click",
			this.handleBackToTopClick.bind(this)
		);

		backToTopControls.appendChild(backToTopBtn);
		contentContainer.appendChild(backToTopControls);

		wrapperFragment.appendChild(contentContainer);
		wrapper.appendChild(wrapperFragment);

		// Set up scroll event listener and initialize visibility
		setTimeout(() => {
			const tableContainer = wrapper.querySelector(".league-body-scroll") || wrapper.querySelector(".league-content-container");
			const backToTopControls = wrapper.querySelector(".back-to-top-controls");
			if (tableContainer && backToTopControls) {
				// Attach scroll event listener for visibility state and pause/resume behavior
				tableContainer.addEventListener(
					"scroll",
					() => {
						this.updateScrollButtons();
					},
					{ passive: true }
				);
				this._attachScrollPause(tableContainer);
				// Initialize visibility states
				this.updateScrollButtons();
			}
			// Compute dynamic team name width
			this.updateTeamNameColumnWidth();
			// Start header countdown after DOM is ready
			this._startHeaderCountdown();
		}, 100);

		return wrapper;
	},

	// Create the league table
	createTable(leagueData, leagueKey) {
		// Create the outer wrapper that holds everything
		const outerWrapper = document.createElement("div");
		outerWrapper.className = "league-table-wrapper-v2";
		if (leagueKey) outerWrapper.classList.add(leagueKey);

		// Get the country folder from league configuration for use in team logo fallbacks
		var countryFolder = "";
		if (typeof EUROPEAN_LEAGUES !== "undefined" && EUROPEAN_LEAGUES[leagueKey]) {
			countryFolder = EUROPEAN_LEAGUES[leagueKey].countryFolder || "";
		}

		// --- 1. Header Table (Sticky) ---
		const headerContainer = document.createElement("div");
		headerContainer.className = "league-header-sticky";
		const headerTable = document.createElement("table");
		headerTable.className = "small spfl-table header-only";
		
		const thead = document.createElement("thead");
		const headerRow = document.createElement("tr");
		
		if (this.config.showPosition) {
			const th = document.createElement("th");
			th.textContent = "#";
			th.className = "position-header";
			headerRow.appendChild(th);
		}

		const teamHeader = document.createElement("th");
		teamHeader.textContent = "Team";
		teamHeader.className = "team-header";
		headerRow.appendChild(teamHeader);

		if (this.config.showPlayedGames) {
			const th = document.createElement("th");
			th.textContent = "P";
			th.className = "played-header";
			headerRow.appendChild(th);
		}
		if (this.config.showWon) {
			const th = document.createElement("th");
			th.textContent = "W";
			th.className = "won-header";
			headerRow.appendChild(th);
		}
		if (this.config.showDrawn) {
			const th = document.createElement("th");
			th.textContent = "D";
			th.className = "drawn-header";
			headerRow.appendChild(th);
		}
		if (this.config.showLost) {
			const th = document.createElement("th");
			th.textContent = "L";
			th.className = "lost-header";
			headerRow.appendChild(th);
		}
		if (this.config.showGoalsFor) {
			const th = document.createElement("th");
			th.textContent = "F";
			th.className = "gf-header";
			headerRow.appendChild(th);
		}
		if (this.config.showGoalsAgainst) {
			const th = document.createElement("th");
			th.textContent = "A";
			th.className = "ga-header";
			headerRow.appendChild(th);
		}
		if (this.config.showGoalDifference) {
			const th = document.createElement("th");
			th.textContent = "GD";
			th.className = "gd-header";
			headerRow.appendChild(th);
		}
		if (this.config.showPoints) {
			const th = document.createElement("th");
			th.textContent = "Pts";
			th.className = "points-header";
			headerRow.appendChild(th);
		}
		if (this.config.showForm) {
			const th = document.createElement("th");
			th.textContent = "Form";
			th.className = "form-header";
			headerRow.appendChild(th);
		}

		thead.appendChild(headerRow);
		headerTable.appendChild(thead);
		headerContainer.appendChild(headerTable);
		outerWrapper.appendChild(headerContainer);

		// --- 2. Body Scroll Container ---
		const scrollContainer = document.createElement("div");
		scrollContainer.className = "league-body-scroll";
		const bodyTable = document.createElement("table");
		bodyTable.className = "small spfl-table body-only";
		const tbody = document.createElement("tbody");

		var teamsToShow = leagueData.teams || [];
		if (this.config.maxTeams > 0) {
			teamsToShow = teamsToShow.slice(0, this.config.maxTeams);
		}

		teamsToShow.forEach((team) => {
			var row = document.createElement("tr");
			row.className = "team-row";
			const pos = team.position || "-";
			const pts = team.points || "0";

			row.setAttribute("aria-label", `${team.name}, rank ${pos}, ${pts} points`);

			if (this.config.colored) {
				if (team.position <= 2) row.classList.add("champions-league");
				else if (team.position <= 4) row.classList.add("europa-league");
				else if (team.position >= teamsToShow.length - 1) row.classList.add("relegation");
			}

			if (this.config.highlightTeams.includes(team.name)) {
				row.classList.add("highlighted");
			}

			if (this.config.showPosition) {
				var posCell = document.createElement("td");
				posCell.textContent = Number.isFinite(team.position) ? team.position : "-";
				posCell.className = "position-cell";
				row.appendChild(posCell);
			}

			var teamCell = document.createElement("td");
			teamCell.className = "team-cell";

			if (this.config.showTeamLogos) {
				var img = document.createElement("img");
				img.className = "team-logo";
				img.loading = "lazy";
				img.width = 18;
				img.height = 18;

				var resolvedLogo = team.logo || this.getTeamLogoMapping(team.name);
				var slug = (team.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
				var candidates = [];

				if (resolvedLogo) candidates.push(resolvedLogo);
				if (team.name && team.name !== "undefined") {
					if (countryFolder) {
						candidates.push(`crests/${countryFolder}/${slug}.svg`);
						candidates.push(`crests/${countryFolder}/${slug}.png`);
					}
					candidates.push(`crests/${slug}.svg`);
					candidates.push(`crests/${slug}.png`);
				}
				candidates.push("placeholder.svg");

				var basePath = "modules/MMM-MyTeams-LeagueTable/images/";
				var tryIndex = 0;
				function tryNext(imgEl) {
					if (tryIndex >= candidates.length) {
						imgEl.remove();
						return;
					}
					imgEl.src = basePath + candidates[tryIndex];
					tryIndex++;
				}
				img.onerror = function () { tryNext(this); };
				tryNext(img);
				teamCell.appendChild(img);
			}

			var nameSpan = document.createElement("span");
			nameSpan.className = "team-name";
			nameSpan.textContent = this.translateTeamName(team.name);
			teamCell.appendChild(nameSpan);
			row.appendChild(teamCell);

			if (this.config.showPlayedGames) {
				var td = document.createElement("td");
				td.textContent = Number.isFinite(team.played) ? team.played : "-";
				td.className = "played-cell";
				row.appendChild(td);
			}
			if (this.config.showWon) {
				var td = document.createElement("td");
				td.textContent = Number.isFinite(team.won) ? team.won : "-";
				td.className = "won-cell";
				row.appendChild(td);
			}
			if (this.config.showDrawn) {
				var td = document.createElement("td");
				td.textContent = Number.isFinite(team.drawn) ? team.drawn : "-";
				td.className = "drawn-cell";
				row.appendChild(td);
			}
			if (this.config.showLost) {
				var td = document.createElement("td");
				td.textContent = Number.isFinite(team.lost) ? team.lost : "-";
				td.className = "lost-cell";
				row.appendChild(td);
			}
			if (this.config.showGoalsFor) {
				var td = document.createElement("td");
				td.textContent = Number.isFinite(team.goalsFor) ? team.goalsFor : "-";
				td.className = "gf-cell";
				row.appendChild(td);
			}
			if (this.config.showGoalsAgainst) {
				var td = document.createElement("td");
				td.textContent = Number.isFinite(team.goalsAgainst) ? team.goalsAgainst : "-";
				td.className = "ga-cell";
				row.appendChild(td);
			}
			if (this.config.showGoalDifference) {
				var td = document.createElement("td");
				var gd = Number.isFinite(team.goalDifference) ? team.goalDifference : null;
				td.textContent = gd === null ? "-" : gd > 0 ? `+${gd}` : String(gd);
				td.className = "gd-cell";
				if (gd > 0) td.classList.add("positive");
				else if (gd < 0) td.classList.add("negative");
				row.appendChild(td);
			}
			if (this.config.showPoints) {
				var td = document.createElement("td");
				td.textContent = Number.isFinite(team.points) ? team.points : "-";
				td.className = "points-cell";
				row.appendChild(td);
			}
			if (this.config.showForm) {
				var formCell = document.createElement("td");
				formCell.className = "form-cell";
				var formWrapper = document.createElement("div");
				formWrapper.className = "form-tokens";
				
				var formArr = Array.isArray(team.form) ? team.form : [];
				var maxGames = Math.max(1, Number(this.config.formMaxGames) || 5);
				if (formArr.length > maxGames) formArr = formArr.slice(-maxGames);
				
				for (var p = 0; p < maxGames - formArr.length; p++) {
					var span = document.createElement("span");
					span.textContent = "-";
					span.className = "form-missing";
					formWrapper.appendChild(span);
				}

				formArr.forEach((match) => {
					var span = document.createElement("span");
					span.textContent = match.result;
					if (match.result === "W") span.className = "form-win";
					else if (match.result === "D") span.className = "form-draw";
					else if (match.result === "L") span.className = "form-loss";
					else span.className = "form-missing";
					formWrapper.appendChild(span);
				});
				formCell.appendChild(formWrapper);
				row.appendChild(formCell);
			}

			tbody.appendChild(row);
		});

		bodyTable.appendChild(tbody);
		
		scrollContainer.appendChild(bodyTable);
		outerWrapper.appendChild(scrollContainer);

		setTimeout(() => {
			const firstHighlighted = scrollContainer.querySelector(".highlighted");
			if (firstHighlighted) {
				firstHighlighted.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}, 1000);

		return outerWrapper;
	},

	// Set up sub-tab cycling for World Cup
	scheduleWorldCupSubtabCycling() {
		// If paused due to scroll or pinned, do not schedule
		if (this.isScrolling || this._pinned) return;
		// Clear any existing WC subtab timer
		if (this.wcSubtabTimer) {
			clearInterval(this.wcSubtabTimer);
			this.wcSubtabTimer = null;
		}
		if (this.wcInitialDelayTimer) {
			clearTimeout(this.wcInitialDelayTimer);
			this.wcInitialDelayTimer = null;
		}

		// Respect user toggle for WC sub-tab cycling
		if (this.config && this.config.autoCycleWcSubtabs === false) {
			return;
		}

		// Only run when WC league is active and autoCycle is enabled
		if (this.currentLeague !== "WORLD_CUP_2026" || !(this.config.autoCycle || this.config.onlyShowWorldCup2026)) {
			return;
		}

		const advanceStageIfComplete = () => {
			// If groups complete, stop group cycling and jump to Rd32
			if (this.isWorldCupStageComplete("GROUPS")) {
				this.currentSubTab = "Rd32";
				this.updateDom(this.config.animationSpeed || 300);
				return;
			}
			// If Rd32 complete, set Rd16; then QF; then SF; then TP; then Final
			const order = ["Rd32", "Rd16", "QF", "SF", "TP", "Final"];
			for (let i = 0; i < order.length - 1; i++) {
				if (this.currentSubTab === order[i] && this.isWorldCupStageComplete(order[i])) {
					this.currentSubTab = order[i + 1];
					this.updateDom(this.config.animationSpeed || 300);
					break;
				}
			}
		};

		const groupsToShow = this.config.showWC2026Groups || [
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
			"G",
			"H",
			"I",
			"J",
			"K",
			"L"
		];

		// If current subtab is a group, set up cycling through A-L
		const isCurrentGroup = groupsToShow.includes(this.currentSubTab);
		const interval = this.config.wcSubtabCycleInterval || 15000;

		if (isCurrentGroup) {
			// Initial delay to show default group for one interval before cycling
			this.wcInitialDelayTimer = setTimeout(() => {
				let idx = groupsToShow.indexOf(this.currentSubTab);
				this.wcSubtabTimer = setInterval(() => {
					// If groups are completed, advance stage and stop cycling groups
					if (this.isWorldCupStageComplete("GROUPS")) {
						clearInterval(this.wcSubtabTimer);
						this.wcSubtabTimer = null;
						this.currentSubTab = "Rd32";
						this.updateDom(this.config.animationSpeed || 300);
						return;
					}
					idx = (idx + 1) % groupsToShow.length;
					this.currentSubTab = groupsToShow[idx];
					this.updateDom(this.config.animationSpeed || 300);
				}, interval);
			}, interval);
		} else {
			// Not a group: periodically evaluate stage completion to auto-advance through knockouts
			this.wcSubtabTimer = setInterval(() => {
				advanceStageIfComplete();
			}, interval);
		}
	},

	// Check if we are in the UEFA off-season (July to late August)
	isUEFAOffSeason() {
		const uefaLeagues = [
			"UEFA_CHAMPIONS_LEAGUE",
			"UEFA_EUROPA_LEAGUE",
			"UEFA_EUROPA_CONFERENCE_LEAGUE",
			"UCL",
			"UEL",
			"ECL"
		];
		
		if (!uefaLeagues.includes(this.currentLeague)) return false;

		const now = new Date();
		const month = now.getMonth(); // 0 = Jan, 6 = July, 7 = Aug
		
		// Window starts July 1st (roughly 30 days after late May finals)
		// Window ends when draw is made (usually late August)
		if (month === 6 || month === 7) {
			const currentData = this.leagueData[this.currentLeague];
			const hasData = currentData && (
				(currentData.teams && currentData.teams.length > 0) || 
				(currentData.fixtures && currentData.fixtures.length > 0)
			);
			
			// If we are in July or August and have no data, it's off-season
			return !hasData;
		}
		
		return false;
	},

	// MagicMirror lifecycle hooks to manage timers cleanly
	suspend() {
		this._pauseCycling();
		this._stopHeaderCountdown();
		if (this.updateTimer) {
			clearTimeout(this.updateTimer);
			this.updateTimer = null;
		}
	},
	resume() {
		this.scheduleUpdate();
		this._resumeCyclingIfNeeded();
		this._startHeaderCountdown();
	},

	// Header countdown helpers
	_startHeaderCountdown() {
		this._stopHeaderCountdown();
		if (!this._countdownEl) return;
		if (this._pinned || this.isScrolling) { this._countdownEl.textContent = "(Paused)"; return; }
		const base = this.currentLeague === "WORLD_CUP_2026" ? (this.config.wcSubtabCycleInterval || 15000) : (this.config.cycleInterval || 15000);
		if (!base || base <= 0) { this._countdownEl.textContent = ""; return; }
		let remaining = Math.ceil(base / 1000);
		const label = this.currentLeague === "WORLD_CUP_2026" ? "sub-tab" : "league";
		const tick = () => {
			if (!this._countdownEl) return;
			this._countdownEl.textContent = `Next ${label} in ${remaining}s`;
			remaining -= 1;
			if (remaining < 0) remaining = Math.ceil(base / 1000);
		};
		tick();
		this._countdownTimer = setInterval(tick, 1000);
	},
	_stopHeaderCountdown() {
		if (this._countdownTimer) {
			clearInterval(this._countdownTimer);
			this._countdownTimer = null;
		}
		if (this._countdownEl) {
			this._countdownEl.textContent = (this._pinned || this.isScrolling) ? "(Paused)" : "";
		}
	},

	// ===== NEW: World Cup & UEFA View Renderer =====
	createWorldCupView(currentData) {
		var container = document.createElement("div");
		container.className = "wc-view-container";
		const fragment = document.createDocumentFragment();

		const subTab = this.currentSubTab;

		// Handle "Table" sub-tab (for UEFA)
		if (subTab === "Table") {
			if (currentData.teams && currentData.teams.length > 0) {
				const mockLeagueData = {
					teams: currentData.teams,
					source: currentData.source,
					lastUpdated: currentData.lastUpdated
				};
				fragment.appendChild(this.createTable(mockLeagueData, this.currentLeague));
				container.appendChild(fragment);
				return container;
			} else if (this.isUEFAOffSeason()) {
				var offMsg = document.createElement("div");
				offMsg.className = "bright small";
				offMsg.style.textAlign = "center";
				offMsg.style.marginTop = "20px";
				offMsg.textContent = "awaiting competition draw";
				fragment.appendChild(offMsg);
				container.appendChild(fragment);
				return container;
			}
		}

		// Handle Knockout Rounds (World Cup: Rd32, Rd16, QF, SF, TP, Final; UEFA: Playoff, Rd16, QF, SF, Final)
		const allKnockoutStages = ["Rd32", "Rd16", "QF", "SF", "TP", "Final", "Playoff"];
		if (allKnockoutStages.includes(subTab)) {
			const koKey = subTab.toLowerCase();
			const knockoutFixtures = (currentData.knockouts && currentData.knockouts[koKey]) || [];

			var title = document.createElement("div");
			title.className = "wc-title";
			title.textContent = `${subTab} Fixtures`;
			fragment.appendChild(title);

			if (knockoutFixtures.length > 0) {
				fragment.appendChild(this.createFixturesTable(knockoutFixtures));
			} else {
				var msg = document.createElement("div");
				msg.className = "dimmed small";
				msg.style.textAlign = "center";
				msg.style.marginTop = "10px";
				if (this.isUEFAOffSeason()) {
					msg.textContent = "awaiting competition draw";
					msg.className = "bright small";
				} else {
					msg.textContent = `Fixtures not yet available for ${subTab}`;
				}
				fragment.appendChild(msg);
			}
			container.appendChild(fragment);
			return container;
		}

		// Handle Group View (A-L) - for World Cup
		const groupData = (currentData.groups && currentData.groups[subTab]);
		if (groupData) {
			const stickyWrapper = document.createElement("div");
			stickyWrapper.className = "wc-sticky-top";

			var groupTitle = document.createElement("div");
			groupTitle.className = "wc-title";
			groupTitle.textContent = `Group ${subTab}`;
			stickyWrapper.appendChild(groupTitle);

			// Re-use createTable but filter for this group
			const mockLeagueData = {
				teams: groupData,
				source: currentData.source,
				lastUpdated: currentData.lastUpdated
			};
			// We append the table to the sticky wrapper
			stickyWrapper.appendChild(this.createTable(mockLeagueData, "WORLD_CUP_2026"));
			
			// Add subtitles to the sticky wrapper too
			var fixTitle = document.createElement("div");
			fixTitle.className = "wc-subtitle";
			fixTitle.textContent = `FIXTURES _ GROUP ${subTab}`;
			stickyWrapper.appendChild(fixTitle);
			
			fragment.appendChild(stickyWrapper);

			// Add fixtures for this group (outside the sticky wrapper so they scroll)
			const groupFixtures = currentData.fixtures.filter((f) => {
				if (f.stage !== "GS") return false;
				const teamNames = groupData.map((t) => t.name);
				return teamNames.includes(f.homeTeam) && teamNames.includes(f.awayTeam);
			});

			if (groupFixtures.length > 0) {
				fragment.appendChild(this.createFixturesTable(groupFixtures));
			}
		} else {
			const noDataMsg = document.createElement("div");
			noDataMsg.textContent = `No data available for Group ${subTab}`;
			noDataMsg.className = "dimmed light small";
			fragment.appendChild(noDataMsg);
		}

		container.appendChild(fragment);
		return container;
	},

	// ===== NEW: Create Fixtures Table =====
	createFixturesTable(fixtures) {
		const outerWrapper = document.createElement("div");
		outerWrapper.className = "fixtures-container";
		
		if (!fixtures || fixtures.length === 0) return outerWrapper;

		// Sort fixtures by timestamp or date
		fixtures.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

		// Check if we should use the enhanced scrollable view (World Cup or UEFA)
		const uefaLeagues = ["UEFA_CHAMPIONS_LEAGUE", "UEFA_EUROPA_LEAGUE", "UEFA_EUROPA_CONFERENCE_LEAGUE", "UCL", "UEL", "ECL"];
		const useEnhancedView = this.currentLeague === "WORLD_CUP_2026" || uefaLeagues.includes(this.currentLeague);

		if (useEnhancedView) {
			const wrapperV2 = document.createElement("div");
			wrapperV2.className = "fixtures-wrapper-v2";

			// 1. Header Table (Sticky/Fixed)
			const headerContainer = document.createElement("div");
			headerContainer.className = "fixtures-header-container";
			const headerTable = document.createElement("table");
			headerTable.className = "wc-fixtures-table-v2 header-only";
			
			const thead = document.createElement("thead");
			const headerRow = document.createElement("tr");
			// Order: Date, Time, Home Team, Home Logo, Score, Away Logo, Away Team, Venue
			const columnNames = ["Date", "Time", "Home Team", "Home Logo", "Score", "Away Logo", "Away Team", "Venue"];
			columnNames.forEach(col => {
				const th = document.createElement("th");
				th.textContent = col;
				th.className = `fixture-header-${col.toLowerCase().replace(/\s+/g, "-")}`;
				headerRow.appendChild(th);
			});
			thead.appendChild(headerRow);
			headerTable.appendChild(thead);
			headerContainer.appendChild(headerTable);
			wrapperV2.appendChild(headerContainer);

			// 2. Body Scroll Container
			const scrollContainer = document.createElement("div");
			scrollContainer.className = "fixtures-body-scroll";
			
			// Task 3 & 4: Restrict height for Playoff and Rd32
			if (this.currentSubTab === "Playoff" || this.currentSubTab === "Rd32") {
				scrollContainer.classList.add("restricted-height");
			}

			const bodyTable = document.createElement("table");
			bodyTable.className = "wc-fixtures-table-v2 body-only";
			const tbody = document.createElement("tbody");

			let foundCurrent = false;
			const now = Date.now();

			fixtures.forEach((fix, index) => {
				const row = document.createElement("tr");
				row.className = "fixture-row-v2";
				
				// Task: Color indicators for live, finished and upcoming fixtures
				if (fix.live) {
					row.classList.add("live");
				} else if (fix.status === "FT" || fix.status === "AET" || fix.status === "PEN") {
					row.classList.add("finished");
				} else {
					row.classList.add("upcoming");
				}

				// Task 3 & 4: Special auto-scroll logic for Playoff/Rd32
				// Scroll to second leg (index 8+) if ALL first leg matches are finished
				if ((this.currentSubTab === "Playoff" || this.currentSubTab === "Rd32") && !foundCurrent) {
					// Check if all of the first 8 fixtures are finished
					const firstEightFinished = fixtures.slice(0, 8).every(f => f.status === "FT" || f.status === "PEN" || f.status === "AET");
					if (firstEightFinished && index === 8) {
						row.classList.add("current-fixture");
						foundCurrent = true;
					}
				}

				// Standard Identification of current fixture for auto-scroll
				// Priority: 1. Live matches, 2. First upcoming match
				if (!foundCurrent) {
					if (fix.live || (fix.timestamp && fix.timestamp > now)) {
						row.classList.add("current-fixture");
						foundCurrent = true;
					}
				}

				this._buildFixtureRowContent(row, fix, columnNames);
				tbody.appendChild(row);
			});

			bodyTable.appendChild(tbody);
			scrollContainer.appendChild(bodyTable);
			wrapperV2.appendChild(scrollContainer);

			outerWrapper.appendChild(wrapperV2);

			// 3. Trigger Auto-Scroll after short delay to allow DOM to settle
			setTimeout(() => {
				const current = scrollContainer.querySelector(".current-fixture");
				if (current) {
					current.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			}, 1000);

			return outerWrapper;
		}

		// Fallback for Group Stage or non-tournament leagues
		const table = document.createElement("table");
		table.className = "wc-fixtures-table-v2";
		const thead = document.createElement("thead");
		const headerRow = document.createElement("tr");
		const columnNames = ["Date", "Time", "Home Team", "Home Logo", "Score", "Away Logo", "Away Team", "Location"];
		columnNames.forEach(col => {
			const th = document.createElement("th");
			th.textContent = col;
			th.className = `fixture-header-${col.toLowerCase().replace(/\s+/g, "-")}`;
			headerRow.appendChild(th);
		});
		thead.appendChild(headerRow);
		table.appendChild(thead);

		const tbody = document.createElement("tbody");
		fixtures.forEach(fix => {
			const row = document.createElement("tr");
			row.className = "fixture-row-v2";
			
			// Task: Color indicators for live, finished and upcoming fixtures
			if (fix.live) {
				row.classList.add("live");
			} else if (fix.status === "FT" || fix.status === "AET" || fix.status === "PEN") {
				row.classList.add("finished");
			} else {
				row.classList.add("upcoming");
			}

			this._buildFixtureRowContent(row, fix, columnNames);
			tbody.appendChild(row);
		});
		table.appendChild(tbody);
		outerWrapper.appendChild(table);
		return outerWrapper;
	},

	// Helper to build the content of a fixture row
	_buildFixtureRowContent(row, fix, columnNames) {
		columnNames.forEach(col => {
			const cell = document.createElement("td");
			
			if (col === "Date") {
				cell.className = "fixture-date-v2";
				if (fix.timestamp) {
					const d = new Date(fix.timestamp);
					const dayShort = d.toLocaleDateString(this.config.language || "en", { weekday: "short" });
					const dayNum = String(d.getDate()).padStart(2, "0");
					const monthShort = d.toLocaleDateString(this.config.language || "en", { month: "short" });
					cell.textContent = `${dayShort} ${dayNum} ${monthShort}`;
				} else {
					cell.textContent = fix.date || "";
				}
			} else if (col === "Time") {
				cell.className = "fixture-time-v2";
				
				// Task: Fix 'vs' in Time column. If there's a score or match is live/finished, hide the time column content
				const hasScore = fix.score && fix.score !== "vs";
				const isPlayed = fix.live || (fix.status && ["FT", "AET", "PEN"].includes(fix.status));
				
				if (hasScore || isPlayed) {
					cell.textContent = "";
				} else if (fix.timestamp) {
					const d = new Date(fix.timestamp);
					cell.textContent = d.toLocaleTimeString(this.config.language || "en", { hour: "2-digit", minute: "2-digit", hour12: false });
				} else {
					cell.textContent = fix.time || "TBD";
				}
			} else if (col === "Home Team") {
				cell.className = "fixture-home-team-v2";
				cell.textContent = this.translateTeamName(fix.homeTeam);
			} else if (col === "Home Logo") {
				cell.className = "fixture-home-logo-v2";
				const logoPath = fix.homeLogo || this.getTeamLogoMapping(fix.homeTeam);
				if (logoPath) {
					const img = document.createElement("img");
					img.src = `modules/MMM-MyTeams-LeagueTable/images/${logoPath}`;
					img.className = "fixture-logo-v2";
					img.loading = "lazy";
					img.onerror = () => (img.style.display = "none");
					cell.appendChild(img);
				}
			} else if (col === "Score") {
				cell.className = "fixture-score-v2";
				const scoreWrapper = document.createElement("div");
				scoreWrapper.className = "score-wrapper-v2";
				const mainScore = document.createElement("div");
				mainScore.className = "main-score-v2";
				if (fix.live) mainScore.classList.add("bright");
				let scoreText = fix.score || "vs";
				if (scoreText === "vs" && fix.live) scoreText = "0 - 0";
				mainScore.textContent = scoreText;
				scoreWrapper.appendChild(mainScore);

				// Show status (FT, HT, 85', etc) below the score if live or finished
				if (fix.status && fix.status !== "LIVE") {
					const statusDiv = document.createElement("div");
					statusDiv.className = "fixture-status-tag-v2";
					if (fix.live) statusDiv.classList.add("live-tag");
					statusDiv.textContent = fix.status;
					scoreWrapper.appendChild(statusDiv);
				}

				if (fix.aggregateScore) {
					const aggScore = document.createElement("div");
					aggScore.className = "aggregate-score-v2";
					aggScore.textContent = `(${fix.aggregateScore})`;
					scoreWrapper.appendChild(aggScore);
				}
				cell.appendChild(scoreWrapper);
			} else if (col === "Away Team") {
				cell.className = "fixture-away-team-v2";
				cell.textContent = this.translateTeamName(fix.awayTeam);
			} else if (col === "Away Logo") {
				cell.className = "fixture-away-logo-v2";
				const logoPath = fix.awayLogo || this.getTeamLogoMapping(fix.awayTeam);
				if (logoPath) {
					const img = document.createElement("img");
					img.src = `modules/MMM-MyTeams-LeagueTable/images/${logoPath}`;
					img.className = "fixture-logo-v2";
					img.loading = "lazy";
					img.onerror = () => (img.style.display = "none");
					cell.appendChild(img);
				}
			} else if (col === "Venue" || col === "Location") {
				cell.className = "fixture-location-v2";
				cell.textContent = fix.venue || "";
			}
			
			row.appendChild(cell);
		});
	},

	translateStage(stage) {
		const map = {
			Playoff: "Knockout Round Play-offs",
			Rd32: "Round of 32",
			Rd16: "Round of 16",
			QF: "Quarter-finals",
			SF: "Semi-finals",
			TP: "Third Place",
			Final: "Final"
		};
		return map[stage] || stage;
	},

	// ===== NEW: Add Flag and Name to Cell =====
	addFlagAndNameToCell(cell, teamName, isHome, logoPath = null) {
		const flagSpan = document.createElement("span");
		flagSpan.className = "country-flag";

		// Use provided logoPath or fall back to mapping
		const finalLogoPath = logoPath || this.getTeamLogoMapping(teamName);
		
		if (finalLogoPath) {
			const img = document.createElement("img");
			img.className = "inline-flag";
			img.loading = "lazy";
			img.decoding = "async";
			img.width = 14; // stabilize layout
			img.height = 10;
			img.src = `modules/MMM-MyTeams-LeagueTable/images/${finalLogoPath}`;
			img.onerror = () => (img.style.display = "none");
			flagSpan.appendChild(img);
		}

		const nameSpan = document.createElement("span");
		nameSpan.className = "fixture-team-name";
		nameSpan.textContent = this.translateTeamName(teamName);

		if (isHome) {
			// For home team: [Name] [Flag]
			cell.appendChild(nameSpan);
			cell.appendChild(flagSpan);
		} else {
			// For away team: [Flag] [Name]
			cell.appendChild(flagSpan);
			cell.appendChild(nameSpan);
		}
	},

	// Automatically focus on the most relevant sub-tab (live or upcoming matches)
	_autoFocusRelevantSubTab(leagueCode) {
		const data = this.leagueData[leagueCode];
		if (!data) return;

		// Only apply to World Cup and UEFA competitions
		const uefaLeagues = [
			"UEFA_CHAMPIONS_LEAGUE",
			"UEFA_EUROPA_LEAGUE",
			"UEFA_EUROPA_CONFERENCE_LEAGUE",
			"UCL",
			"UEL",
			"ECL"
		];
		const isTournament = leagueCode === "WORLD_CUP_2026" || uefaLeagues.includes(leagueCode);
		if (!isTournament) return;

		// 1. Check for LIVE matches across all knockout stages
		if (data.knockouts) {
			for (const [stage, fixtures] of Object.entries(data.knockouts)) {
				if (fixtures && fixtures.some((f) => f.live)) {
					const stageIdMap = {
						rd32: "Rd32",
						rd16: "Rd16",
						qf: "QF",
						sf: "SF",
						tp: "TP",
						final: "Final",
						playoff: "Playoff"
					};
					const targetTab = stageIdMap[stage] || stage;
					if (this.currentSubTab !== targetTab) {
						if (this.config.debug) {
							Log.info(` MMM-MyTeams-LeagueTable: Auto-focusing LIVE knockout stage: ${targetTab}`);
						}
						this.currentSubTab = targetTab;
						return;
					}
				}
			}
		}

		// 2. Check for LIVE matches in World Cup Groups
		if (leagueCode === "WORLD_CUP_2026" && data.fixtures) {
			const liveGroupMatch = data.fixtures.find((f) => f.stage === "GS" && f.live && f.group);
			if (liveGroupMatch) {
				if (this.currentSubTab !== liveGroupMatch.group) {
					if (this.config.debug) {
						Log.info(` MMM-MyTeams-LeagueTable: Auto-focusing LIVE Group: ${liveGroupMatch.group}`);
					}
					this.currentSubTab = liveGroupMatch.group;
					return;
				}
			}
		}

		// 3. Fallback: If no live matches, check for upcoming matches in knockout stages
		// We look for matches with "vs" or a time in the score/time field that aren't finished
		if (data.knockouts) {
			const stagesOrder = ["playoff", "rd32", "rd16", "qf", "sf", "tp", "final"];
			for (const stage of stagesOrder) {
				const fixtures = data.knockouts[stage];
				if (fixtures && fixtures.length > 0) {
					const hasUpcoming = fixtures.some((f) => {
						const isFinished = /\b(FT|PEN)\b/i.test(f.score || "");
						return !isFinished;
					});
					if (hasUpcoming) {
						const stageIdMap = {
							rd32: "Rd32",
							rd16: "Rd16",
							qf: "QF",
							sf: "SF",
							tp: "TP",
							final: "Final",
							playoff: "Playoff"
						};
						const targetTab = stageIdMap[stage] || stage;
						if (this.currentSubTab !== targetTab) {
							if (this.config.debug) {
								Log.info(` MMM-MyTeams-LeagueTable: Auto-focusing upcoming knockout stage: ${targetTab}`);
							}
							this.currentSubTab = targetTab;
							return;
						}
					}
				}
			}
		}
	},

	// Adds horizontal scroll indicators (arrows) to a container
	_addHorizontalScrollIndicators(container, parent) {
		if (!container || !parent) return;

		const wrapper = document.createElement("div");
		wrapper.className = "league-tabs-wrapper";

		const prevBtn = document.createElement("button");
		prevBtn.className = "tab-scroll-btn prev";
		prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
		prevBtn.setAttribute("aria-label", "Scroll tabs left");

		const nextBtn = document.createElement("button");
		nextBtn.className = "tab-scroll-btn next";
		nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
		nextBtn.setAttribute("aria-label", "Scroll tabs right");

		const updateArrows = () => {
			if (!container) return;
			const { scrollLeft, scrollWidth, clientWidth } = container;
			// Show prev if we've scrolled right at all
			if (scrollLeft > 5) {
				prevBtn.classList.add("visible");
			} else {
				prevBtn.classList.remove("visible");
			}
			// Show next if there's more content to the right
			if (scrollLeft < scrollWidth - clientWidth - 5 && scrollWidth > clientWidth) {
				nextBtn.classList.add("visible");
			} else {
				nextBtn.classList.remove("visible");
			}
		};

		prevBtn.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			container.scrollBy({ left: -120, behavior: "smooth" });
		});

		nextBtn.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			container.scrollBy({ left: 120, behavior: "smooth" });
		});

		container.addEventListener("scroll", updateArrows);

		// Initial check after a short delay to allow for DOM rendering
		setTimeout(updateArrows, 300);

		wrapper.appendChild(prevBtn);
		wrapper.appendChild(container);
		wrapper.appendChild(nextBtn);
		parent.appendChild(wrapper);

		// Re-check on window resize
		const resizeHandler = () => updateArrows();
		window.addEventListener("resize", resizeHandler);
		
		// Clean up listener when module is destroyed (if MM supported it better)
		// For now we just add it.
	},

	// Return the list of CSS files to load for this module
	getStyles() {
		// Ensure the module's stylesheet is loaded by MagicMirror
		// Note: filename uses current folder spelling. We can rename alongside module folder later.
		return ["MMM-MyTeams-LeagueTable.css"];
	},

	// Helper to translate team names if they exist in translation files
	translateTeamName(name) {
		if (!name) return "";

		// Standardize key: uppercase and underscores for spaces
		const key = name.toUpperCase().replace(/\s+/g, "_");
		const translated = this.translate(key);

		// If translate returns the key (meaning no translation found), return original name
		// In MagicMirror, this.translate(key) returns key if not found
		return translated === key ? name : translated;
	},

	// Get translations
	getTranslations() {
		return {
			af: "translations/af.json",
			ar: "translations/ar.json",
			de: "translations/de.json",
			en: "translations/en.json",
			es: "translations/es.json",
			fa: "translations/fa.json",
			fr: "translations/fr.json",
			ga: "translations/ga.json",
			gd: "translations/gd.json",
			hr: "translations/hr.json",
			ht: "translations/ht.json",
			it: "translations/it.json",
			ja: "translations/ja.json",
			ko: "translations/ko.json",
			mi: "translations/mi.json",
			nl: "translations/nl.json",
			no: "translations/no.json",
			pt: "translations/pt.json",
			uz: "translations/uz.json",
			cy: "translations/cy.json",
			sv: "translations/sv.json",
			pl: "translations/pl.json",
			tr: "translations/tr.json",
			hu: "translations/hu.json",
			uk: "translations/uk.json",
			el: "translations/el.json",
			da: "translations/da.json"
		};
	},

	// -----------------------------
	// Theme Overrides
	// -----------------------------
	_applyThemeOverrides() {
		const styleId = "mmm-myteams-leaguetable-theme-override";
		let styleEl = document.getElementById(styleId);

		// Remove existing style element if no overrides are active
		if (
			this.config.darkMode === null &&
			this.config.fontColorOverride === null &&
			this.config.opacityOverride === null &&
			this.config.firstPlaceColor === "rgba(255, 255, 255, 0.1)" &&
			this.config.highlightedColor === "rgba(255, 255, 255, 0.1)"
		) {
			if (styleEl) styleEl.remove();
			return;
		}

		// Create style element if it doesn't exist
		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = styleId;
			document.head.appendChild(styleEl);
		}

		// Build CSS rules
		let css = "";

		// Dark/Light mode override
		if (this.config.darkMode === true) {
			css +=
				".spfl-league-table { background-color: #111 !important; color: #fff !important; }\n";
		} else if (this.config.darkMode === false) {
			css +=
				".spfl-league-table { background-color: #f5f5f5 !important; color: #000 !important; }\n";
		}

		// Font color override
		if (this.config.fontColorOverride) {
			css += `.spfl-league-table * { color: ${this.config.fontColorOverride} !important; }\n`;
		}

		// Opacity override (exclude back-to-top-controls which manages its own visibility)
		if (
			this.config.opacityOverride !== null &&
			this.config.opacityOverride !== undefined
		) {
			const opacity = parseFloat(this.config.opacityOverride);
			if (!isNaN(opacity)) {
				css += `.spfl-league-table * { opacity: ${opacity} !important; }\n`;
				// Restore back-to-top-controls opacity to allow visibility toggle to work
				css +=
					".spfl-league-table .back-to-top-controls { opacity: 0 !important; }\n";
				css +=
					".spfl-league-table .back-to-top-controls.visible { opacity: 1 !important; }\n";
			}
		}

		// Highlight colors
		if (this.config.firstPlaceColor) {
			css += `.spfl-league-table .team-row:first-child { background-color: ${this.config.firstPlaceColor} !important; }\n`;
			css += `.spfl-league-table .team-row:first-child .position-cell { background: ${this.config.firstPlaceColor} !important; }\n`;
		}
		if (this.config.highlightedColor) {
			css += `.spfl-league-table .team-row.highlighted { background-color: ${this.config.highlightedColor} !important; }\n`;
		}

		styleEl.textContent = css;
	},

	/**
	 * Creates the toggle icon for hiding/showing the league table
	 * @returns {HTMLElement} The toggle icon element
	 */
	_createToggleIcon() {
		const toggleIcon = document.createElement("div");
		toggleIcon.className = "LeagueTable-toggle-icon visible"; // Always visible in footer
		toggleIcon.innerHTML = this.isContentHidden ? "▲" : "▼"; // Up arrow when hidden, down arrow when visible
		toggleIcon.title = this.isContentHidden
			? this.translate("SHOW_LEAGUE_TABLE")
			: this.translate("HIDE_LEAGUE_TABLE");
		toggleIcon.style.cursor = "pointer";
		toggleIcon.style.fontSize = "14px";
		toggleIcon.style.color = "#888";
		toggleIcon.style.padding = "0 10px";
		toggleIcon.style.transition = "transform 0.3s ease";
		
		toggleIcon.onclick = (e) => {
			e.stopPropagation();
			this.isContentHidden = !this.isContentHidden;
			this.updateDom();
		};
		
		return toggleIcon;
	}
});
