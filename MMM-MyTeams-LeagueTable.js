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
    getScripts: function() {
        return ["modules/" + this.name + "/team-logo-mappings.js"];
    },
    // Default module config
    defaults: {
       updateInterval: 30 * 60 * 1000,              // How often to refresh (ms) – default: 30 min
       retryDelay: 15000,                           // Delay between retry attempts after an error (ms)
       maxRetries: 3,                               // Stop retrying after this many failures
       animationSpeed: 2000,                        // DOM update animation speed (ms)
       fadeSpeed: 4000,                             // Fade animation speed (ms)
       colored: true,                               // Color rows by standing (top/UEFA/relegation)
       maxTeams: 36,                                // 0 = show all teams
       highlightTeams: ["Celtic", "Hearts"],        // Emphasize teams by exact name
       scrollable: true,                            // Enable vertical scrolling if max height exceeded
       
       // ===== NEW: League Selection System (replaces old individual toggles) =====
       // Method 1: Use selectedLeagues array to choose specific leagues by code
       // Leave empty to use legacy showXXX options, or populate with league codes
       // Example: Scottish Premiership enabled by default
       // Add more league codes here, e.g., "ENGLAND_PREMIER_LEAGUE", "GERMANY_BUNDESLIGA", etc.
       selectedLeagues: [
         "SCOTLAND_PREMIERSHIP" ],
       
       // Method 2: Use legacyLeagueToggle = true to enable old config style (for backward compatibility)
       legacyLeagueToggle: true,                     // If true, uses showSPFL, showEPL, etc. from config
       
       // ===== NEW: Automatic button generation from selectedLeagues =====
       autoGenerateButtons: true,                    // Auto-create buttons for all leagues in selectedLeagues
       showLeagueButtons: true,                      // Show/hide league selector buttons in header
       
       // ===== LEGACY League toggles (used if legacyLeagueToggle: true) =====
       // Set true to show, false to hide
       showSPFL: true,                              // Show Scottish Premiership
       showSPFLC: false,                            // Show Scottish Championship
       showEPL: false,                              // Show English Premier League
       showUCL: false,                              // Show UEFA Champions League
       showUEL: false,                              // Show UEFA Europa League
       showECL: false,                              // Show UEFA Europa Conference League
       
       // ===== Display Options =====
       showPosition: true,                          // Show table position
       showTeamLogos: true,                         // Show team logos
       showPlayedGames: true,                       // Show games played
       showWon: true,                               // Show wins
       showDrawn: true,                             // Show draws
       showLost: true,                              // Show losses
       showGoalsFor: true,                          // Show goals for
       showGoalsAgainst: true,                      // Show goals against
       showGoalDifference: true,                    // Show goal difference
       showPoints: true,                            // Show points
       showForm: true,                              // Show recent form tokens (W/D/L)
       formMaxGames: 5,                             // Max number of form games to display
       
       // ===== Auto-cycling options =====
       autoCycle: false,                            // Enable auto-cycling between leagues
       cycleInterval: 15 * 1000,                    // Time to display each league (15 seconds)
       
       // ===== League Headers =====
       // Maps league codes to their display names
       // Dynamically extended at runtime with all configured European leagues
				leagueHeaders: {
					// Domestic Leagues
					"SCOTLAND_PREMIERSHIP": "Scottish Premiership",
					"SCOTLAND_CHAMPIONSHIP": "Scottish Championship",
					"ENGLAND_PREMIER_LEAGUE": "English Premier League",
					"GERMANY_BUNDESLIGA": "Bundesliga",
					"FRANCE_LIGUE1": "Ligue 1",
					"SPAIN_LA_LIGA": "La Liga",
					"ITALY_SERIE_A": "Serie A",
					"NETHERLANDS_EREDIVISIE": "Eredivisie",
					"BELGIUM_PRO_LEAGUE": "Belgian Pro League",
					"PORTUGAL_PRIMEIRA_LIGA": "Primeira Liga",
					"TURKEY_SUPER_LIG": "Turkish Super Lig",
					"GREECE_SUPER_LEAGUE": "Greek Super League",
					"AUSTRIA_BUNDESLIGA": "Austrian Bundesliga",
					"CZECH_LIGA": "Czech Liga",
					"DENMARK_SUPERLIGAEN": "Superligaen",
					"NORWAY_ELITESERIEN": "Eliteserien",
					"SWEDEN_ALLSVENSKAN": "Allsvenskan",
					"SWITZERLAND_SUPER_LEAGUE": "Swiss Super League",
					"UKRAINE_PREMIER_LEAGUE": "Ukrainian Premier League",
					"ROMANIA_LIGA_I": "Liga I",
					"CROATIA_HNL": "Croatian HNL",
					"SERBIA_SUPER_LIGA": "Serbian Super Liga",
					"HUNGARY_NBI": "Hungarian NB I",
					"POLAND_EKSTRAKLASA": "Ekstraklasa",
					// European Competitions
					"UEFA_CHAMPIONS_LEAGUE": "UEFA Champions League",
					"UEFA_EUROPA_LEAGUE": "UEFA Europa League",
					"UEFA_EUROPA_CONFERENCE_LEAGUE": "UEFA Europa Conference League"
				},

				
				// Theme overrides
				darkMode: null,                             // null=auto, true=force dark, false=force light
				fontColorOverride: "#FFFFFF",             // Set to "null" for your existing css colour scheme or override all font colors "#FFFFFF" to force white text
				opacityOverride: null,                      // null=auto,  set to  1.0 to force full opacity
			
				// Debug
				debug: true								// Set to true to enable console logging
            },
		

    // Required version of MagicMirror
    requiresVersion: "2.1.0",

    // Module startup
    start: function() {
        Log.info("Starting module: " + this.name);
        
        // ===== INITIALIZE TEAM LOGO MAPPINGS =====
        // Merge centralized mappings from team-logo-mappings.js with config overrides
        // TEAM_LOGO_MAPPINGS is loaded via getScripts() and available globally
        this.mergedTeamLogoMap = Object.assign({}, window.TEAM_LOGO_MAPPINGS || {}, this.config.teamLogoMap || {});
        
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
        this.enabledLeagueCodes.forEach(leagueCode => {
            this.leagueData[leagueCode] = null;
            this.loaded[leagueCode] = false;
        });
        
        this.error = null;
        this.retryCount = 0;
        
        // Set current league to first enabled league
        this.currentLeague = this.enabledLeagueCodes.length > 0 ? this.enabledLeagueCodes[0] : "SCOTLAND_PREMIERSHIP";
        this.isScrolling = false;
        
        if (this.config.debug) {
            Log.info(" MMM-MyTeams-LeagueTable: Enabled leagues: " + JSON.stringify(this.enabledLeagueCodes));
            Log.info(" MMM-MyTeams-LeagueTable: Current league: " + this.currentLeague);
        }
        
        // Send initial request for data for all enabled leagues
        this.requestAllLeagueData();
        
        // Set up periodic updates
        this.scheduleUpdate();
        
        // Set up auto-cycling if enabled
        if (this.config.autoCycle) {
            this.scheduleCycling();
        }
        
        if (this.config.debug) {
            Log.info(" MMM-MyTeams-LeagueTable: Module started with config: " + JSON.stringify(this.config));
        }
    },
    
    // ===== NEW: Build normalized team lookup map =====
    // Creates a case-insensitive, whitespace-normalized lookup for team logo mappings
    // Handles common naming variations (e.g., "St Mirren" vs "st mirren", "ST. MIRREN", etc.)
    // Also handles suffix/prefix variations like FC, SC, AC in any case combination
    // Also handles diacritics (accents, umlauts) - "Atlético" matches "Atletico"
    buildNormalizedTeamMap: function() {
        this.normalizedTeamLogoMap = {};
        
        // Common football club suffixes/prefixes to handle
        var commonSuffixes = ["fc", "sc", "ac", "cf", "sk", "if", "bk", "fk", "ik", "aik","afc","vfb","unt","fn"];
        
        // Function to remove diacritics (accents, umlauts, etc.)
        // Converts: é→e, ö→o, ü→u, ñ→n, ç→c, ß→ss, á→a, í→i, ó→o, ú→u, etc.
        var removeDiacritics = function(str) {
            if (!str) return str;
            // Handle special characters explicitly before Unicode normalization
            str = str.replace(/ß/g, "ss");  // German ß → ss
            str = str.replace(/ø/g, "o");   // Danish/Norwegian ø → o
            str = str.replace(/æ/g, "ae");  // Scandinavian æ → ae
            // Use Unicode normalization to decompose accented characters
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        };
        
        // Function to generate alternative diacritics spellings (e.g., Köln → koeln)
        // Handles common Anglicization variants: ö→oe, ü→ue, ä→ae
        var getAlternativeDiacriticsSpellings = function(str) {
            if (!str) return [];
            var variants = [];
            // German convention: ö→oe, ü→ue, ä→ae
            if (str.match(/[öüä]/i)) {
                var withOe = str.replace(/ö/gi, function(m) { return m === 'ö' ? 'oe' : 'OE'; })
                              .replace(/ü/gi, function(m) { return m === 'ü' ? 'ue' : 'UE'; })
                              .replace(/ä/gi, function(m) { return m === 'ä' ? 'ae' : 'AE'; });
                variants.push(normalize(withOe));
            }
            return variants;
        };
        
        // Normalize function: remove diacritics, lowercase, and remove/compress whitespace, remove punctuation
        var normalize = function(str) {
            return removeDiacritics((str || "")).toLowerCase().replace(/\s+/g, " ").trim().replace(/[.,]/g, "");
        };
        
        // Function to strip common suffixes/prefixes
        var stripSuffixes = function(str) {
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
        Object.keys(this.mergedTeamLogoMap).forEach(teamName => {
            var normalized = normalize(teamName);
            var stripped = stripSuffixes(teamName);
            
            if (normalized && normalized.length > 0) {
                // Add normalized version
                this.normalizedTeamLogoMap[normalized] = this.mergedTeamLogoMap[teamName];
                
                // Add stripped version (without common suffixes/prefixes)
                if (stripped !== normalized && stripped.length > 0) {
                    this.normalizedTeamLogoMap[stripped] = this.mergedTeamLogoMap[teamName];
                }
                
                // Also add common suffix variants if they don't already exist
                // This helps find "Arsenal" even if mapped as "Arsenal FC"
                commonSuffixes.forEach(suffix => {
                    var withSuffix = normalized + " " + suffix;
                    if (!this.normalizedTeamLogoMap[withSuffix]) {
                        this.normalizedTeamLogoMap[withSuffix] = this.mergedTeamLogoMap[teamName];
                    }
                });
                
                // Add alternative Anglicization variants (ö→oe, ü→ue, ä→ae)
                // This helps find "Koeln" when mapped as "Köln"
                getAlternativeDiacriticsSpellings(teamName).forEach(variant => {
                    if (variant && !this.normalizedTeamLogoMap[variant]) {
                        this.normalizedTeamLogoMap[variant] = this.mergedTeamLogoMap[teamName];
                    }
                    // Also add stripped version of variant
                    var strippedVariant = stripSuffixes(variant);
                    if (strippedVariant && strippedVariant !== variant && !this.normalizedTeamLogoMap[strippedVariant]) {
                        this.normalizedTeamLogoMap[strippedVariant] = this.mergedTeamLogoMap[teamName];
                    }
                });
            }
        });
        
        if (this.config.debug) {
            Log.info(" MMM-MyTeams-LeagueTable: Built normalized team map with " + Object.keys(this.normalizedTeamLogoMap).length + " entries (diacritics removed, Anglicization variants added, case/whitespace normalized, suffix/prefix variants, common abbreviations)");
        }
    },
    
    // ===== NEW: Get team logo mapping with intelligent lookup =====
    // Tries multiple matching strategies:
    // 1. Exact match (fastest)
    // 2. Normalized match (case-insensitive, whitespace-normalized, diacritics removed)
    // 3. Suffix/prefix variants (handles AFC, VFB, FC, SC, AC in any case, no length restrictions)
    // 4. Diacritic variants (handles accents/umlauts AND Anglicization: Atlético→Atletico, Köln→Koln or Koeln)
    getTeamLogoMapping: function(teamName) {
        if (!teamName) return null;
        
        // Try exact match first (fastest)
        if (this.mergedTeamLogoMap[teamName]) {
            return this.mergedTeamLogoMap[teamName];
        }
        
        // Function to remove diacritics (accents, umlauts, etc.)
        var removeDiacritics = function(str) {
            if (!str) return str;
            // Handle special characters explicitly before Unicode normalization
            str = str.replace(/ß/g, "ss");  // German ß → ss
            str = str.replace(/ø/g, "o");   // Danish/Norwegian ø → o
            str = str.replace(/æ/g, "ae");  // Scandinavian æ → ae
            // Use Unicode normalization to decompose accented characters
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        };
        
        // Normalize and try lookup with suffix handling
        var normalize = function(str) {
            return removeDiacritics((str || "")).toLowerCase().replace(/\s+/g, " ").trim().replace(/[.,]/g, "");
        };
        
        var normalized = normalize(teamName);
        
        // Try normalized match (handles case/whitespace/punctuation/diacritics variations and Anglicization variants)
        if (this.normalizedTeamLogoMap[normalized]) {
            if (this.config.debug) {
                Log.info(" MMM-MyTeams-LeagueTable: Found normalized mapping for '" + teamName + "' as '" + normalized + "' (diacritics/case/whitespace normalized, Anglicization variants like Köln→koeln supported)");
            }
            return this.normalizedTeamLogoMap[normalized];
        }
        
        // Try stripping common suffixes/prefixes
        var commonSuffixes = ["fc", "sc", "ac", "cf", "sk", "if", "bk", "fk", "ik", "aik","afc","vfb","unt","fn"];
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
                Log.info(" MMM-MyTeams-LeagueTable: Found suffix/prefix variant mapping for '" + teamName + "' -> '" + stripped + "'");
            }
            return this.normalizedTeamLogoMap[stripped];
        }
        
        // Log unmapped teams for debugging
        if (this.config.debug) {
            Log.warn(" MMM-MyTeams-LeagueTable: NO MAPPING FOUND for team '" + teamName + "'. Tried: exact, normalized ('" + normalized + "'), stripped ('" + stripped + "')");
        }
        
        return null;
    },
    
    // ===== NEW: Determine which leagues are enabled =====
    // Handles both new selectedLeagues config and legacy showXXX toggles for backward compatibility
    // Populates this.enabledLeagueCodes array with league codes to fetch
    determineEnabledLeagues: function() {
        this.enabledLeagueCodes = [];
        
        // PRIORITY 1: Use selectedLeagues if provided and not empty
        if (this.config.selectedLeagues && Array.isArray(this.config.selectedLeagues) && this.config.selectedLeagues.length > 0) {
            // Filter and validate league codes from selectedLeagues
            this.config.selectedLeagues.forEach(leagueCode => {
                // Map old codes to new codes for backward compatibility
                const normalizedCode = this.normalizeLeagueCode(leagueCode);
                if (normalizedCode && !this.enabledLeagueCodes.includes(normalizedCode)) {
                    this.enabledLeagueCodes.push(normalizedCode);
                }
            });
            
            if (this.config.debug) {
                Log.info(" MMM-MyTeams-LeagueTable: Using selectedLeagues config: " + JSON.stringify(this.enabledLeagueCodes));
            }
        }
        
        // PRIORITY 2: Fall back to legacy toggles if legacyLeagueToggle is enabled and no selected leagues
        if (this.enabledLeagueCodes.length === 0 && this.config.legacyLeagueToggle === true) {
            const legacyMapping = {
                "showSPFL": "SCOTLAND_PREMIERSHIP",
                "showSPFLC": "SCOTLAND_CHAMPIONSHIP",
                "showEPL": "ENGLAND_PREMIER_LEAGUE",
                "showUCL": "UEFA_CHAMPIONS_LEAGUE",
                "showUEL": "UEFA_EUROPA_LEAGUE",
                "showECL": "UEFA_EUROPA_CONFERENCE_LEAGUE"
            };
            
            Object.entries(legacyMapping).forEach(([legacyKey, newCode]) => {
                if (this.config[legacyKey] === true && !this.enabledLeagueCodes.includes(newCode)) {
                    this.enabledLeagueCodes.push(newCode);
                }
            });
            
            if (this.config.debug) {
                Log.info(" MMM-MyTeams-LeagueTable: Using legacy league toggles: " + JSON.stringify(this.enabledLeagueCodes));
            }
        }
        
        // Fallback: If still no leagues enabled, default to Scottish Premiership
        if (this.enabledLeagueCodes.length === 0) {
            this.enabledLeagueCodes = ["SCOTLAND_PREMIERSHIP"];
            if (this.config.debug) {
                Log.warn(" MMM-MyTeams-LeagueTable: No leagues configured, defaulting to SCOTLAND_PREMIERSHIP");
            }
        }
    },
    
    // ===== NEW: Normalize league codes =====
    // Converts old league codes to new format for backward compatibility
    // Returns null if code is invalid
    normalizeLeagueCode: function(code) {
        if (!code || typeof code !== 'string') return null;
        
        // Legacy code mappings for backward compatibility
        const legacyCodeMap = {
            "SPFL": "SCOTLAND_PREMIERSHIP",
            "SPFLC": "SCOTLAND_CHAMPIONSHIP",
            "EPL": "ENGLAND_PREMIER_LEAGUE",
            "UCL": "UEFA_CHAMPIONS_LEAGUE",
            "UEL": "UEFA_EUROPA_LEAGUE",
            "ECL": "UEFA_EUROPA_CONFERENCE_LEAGUE"
        };
        
        return legacyCodeMap[code] || code;
    },
    
    // ===== NEW: Get league URL by code =====
    // Returns the BBC Sport URL for a given league code
    getLeagueUrl: function(leagueCode) {
        // Map of league codes to their BBC Sport URLs
        const urlMap = {
            // Domestic Leagues
            "SCOTLAND_PREMIERSHIP": "https://www.bbc.co.uk/sport/football/scottish-premiership/table",
            "SCOTLAND_CHAMPIONSHIP": "https://www.bbc.co.uk/sport/football/scottish-championship/table",
            "ENGLAND_PREMIER_LEAGUE": "https://www.bbc.co.uk/sport/football/premier-league/table",
            "ENGLAND_CHAMPIONSHIP": "https://www.bbc.co.uk/sport/football/english-championship/table",
            "GERMANY_BUNDESLIGA": "https://www.bbc.co.uk/sport/football/german-bundesliga/table",
            "FRANCE_LIGUE1": "https://www.bbc.co.uk/sport/football/french-ligue-one/table",
            "SPAIN_LA_LIGA": "https://www.bbc.co.uk/sport/football/spanish-la-liga/table",
            "ITALY_SERIE_A": "https://www.bbc.co.uk/sport/football/italian-serie-a/table",
            "NETHERLANDS_EREDIVISIE": "https://www.bbc.co.uk/sport/football/dutch-eredivisie/table",
            "BELGIUM_PRO_LEAGUE": "https://www.bbc.co.uk/sport/football/belgian-pro-league/table",
            "PORTUGAL_PRIMEIRA_LIGA": "https://www.bbc.co.uk/sport/football/portuguese-primeira-liga/table",
            "TURKEY_SUPER_LIG": "https://www.bbc.co.uk/sport/football/turkish-super-lig/table",
            "GREECE_SUPER_LEAGUE": "https://www.bbc.co.uk/sport/football/greek-super-league/table",
            "AUSTRIA_BUNDESLIGA": "https://www.bbc.co.uk/sport/football/austrian-bundesliga/table",
            "CZECH_LIGA": "https://www.bbc.co.uk/sport/football/czech-liga/table",
            "DENMARK_SUPERLIGAEN": "https://www.bbc.co.uk/sport/football/danish-superliga/table",
            "NORWAY_ELITESERIEN": "https://www.bbc.co.uk/sport/football/norwegian-eliteserien/table",
            "SWEDEN_ALLSVENSKAN": "https://www.bbc.co.uk/sport/football/swedish-allsvenskan/table",
            "SWITZERLAND_SUPER_LEAGUE": "https://www.bbc.co.uk/sport/football/swiss-super-league/table",
            "UKRAINE_PREMIER_LEAGUE": "https://www.bbc.co.uk/sport/football/ukrainian-premier-league/table",
            "ROMANIA_LIGA_I": "https://www.bbc.co.uk/sport/football/romanian-liga-i/table",
            "CROATIA_HNL": "https://www.bbc.co.uk/sport/football/croatian-first-league/table",
            "SERBIA_SUPER_LIGA": "https://www.bbc.co.uk/sport/football/serbian-super-lig/table",
            "HUNGARY_NBI": "https://www.bbc.co.uk/sport/football/hungarian-nb-i/table",
            "POLAND_EKSTRAKLASA": "https://www.bbc.co.uk/sport/football/polish-ekstraklasa/table",
            
            // UEFA Competitions
            "UEFA_CHAMPIONS_LEAGUE": "https://www.bbc.co.uk/sport/football/champions-league/table",
            "UEFA_EUROPA_LEAGUE": "https://www.bbc.co.uk/sport/football/europa-league/table",
            "UEFA_EUROPA_CONFERENCE_LEAGUE": "https://www.bbc.co.uk/sport/football/europa-conference-league/table",
            
            // Legacy code support
            "UCL": "https://www.bbc.co.uk/sport/football/champions-league/table",
            "UEL": "https://www.bbc.co.uk/sport/football/europa-league/table",
            "ECL": "https://www.bbc.co.uk/sport/football/europa-conference-league/table"
        };
        
        const url = urlMap[leagueCode];
        if (!url && this.config.debug) {
            Log.warn(" MMM-MyTeams-LeagueTable: Unknown league code: " + leagueCode);
        }
        return url;
    },
    
    // ===== NEW: Request data for all enabled leagues (dynamic) =====
    // Iterates through enabledLeagueCodes and fetches data for each league
    // Replaces the old hardcoded showXXX conditionals
    requestAllLeagueData: function() {
        const self = this;
        
        if (!this.enabledLeagueCodes || this.enabledLeagueCodes.length === 0) {
            if (this.config.debug) {
                Log.warn(" MMM-MyTeams-LeagueTable: No leagues configured to fetch");
            }
            return;
        }
        
        // Iterate through each enabled league code and request its data
        this.enabledLeagueCodes.forEach(leagueCode => {
            const url = this.getLeagueUrl(leagueCode);
            
            if (!url) {
                Log.error(" MMM-MyTeams-LeagueTable: Could not find URL for league code: " + leagueCode);
                return; // Skip this league if no URL found
            }
            
            if (this.config.debug) {
                Log.info(" MMM-MyTeams-LeagueTable: Requesting data for " + leagueCode + " from " + url);
            }
            
            // Send request to node helper
            this.sendSocketNotification("GET_LEAGUE_DATA", {
                ...this.config,
                leagueType: leagueCode,
                url: url
            });
        });
    },
    
    // Set up auto-cycling between leagues with smooth transitions
    scheduleCycling: function() {
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
            const cycleFn = function() {
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
                    Log.info(" MMM-MyTeams-LeagueTable: Cycling from " + self.currentLeague + " to " + nextLeague);
                }
                
                // Apply smooth transition
                const root = document.getElementById("mtlt-" + self.identifier);
                const wrapper = root ? root : null;
                if (wrapper) {
                    // Fade out current league
                    wrapper.style.opacity = "0";
                    wrapper.style.transform = "translateY(10px)";
                    
                    // Use setTimeout to create a smooth transition effect
                    setTimeout(function() {
                        // Update current league
                        self.currentLeague = nextLeague;
                        
                        // Update the display immediately
                        self.updateDom(0);
                        
                        // Fade back in after DOM update
                        setTimeout(function() {
                            const root2 = document.getElementById("mtlt-" + self.identifier);
                            const newWrapper = root2 ? root2 : null;
                            if (newWrapper) {
                                newWrapper.style.opacity = "1";
                                newWrapper.style.transform = "translateY(0)";
                            }
                            
                            // Scroll to top when changing leagues
                            const contentContainer = root2 ? root2.querySelector(".league-content-container") : null;
                            if (contentContainer) {
                                contentContainer.scrollTop = 0;
                            }
                        }, 50);
                    }, 300);
                } else {
                    // Fallback if wrapper not found - just update the league and DOM
                    self.currentLeague = nextLeague;
                    self.updateDom(self.config.animationSpeed);
                }
            };
            
            // Set up the interval to run continuously
            this.cycleTimer = setInterval(cycleFn, this.config.cycleInterval);
            
            if (this.config.debug) {
                Log.info(" MMM-MyTeams-LeagueTable: Auto-cycling enabled with interval " + 
                         (this.config.cycleInterval / 1000) + " seconds");
            }
        } else if (this.config.debug) {
            Log.info(" MMM-MyTeams-LeagueTable: Auto-cycling not enabled - need at least 2 leagues");
        }
    },

    // Schedule the next update
    scheduleUpdate: function() {
        var self = this;
        
        // Clear any existing timer
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
        }
        
        // Schedule next update
        this.updateTimer = setTimeout(function() {
            self.requestAllLeagueData();
            self.scheduleUpdate();
        }, this.config.updateInterval);
        
        if (this.config.debug) {
            Log.info(" MMM-MyTeams-LeagueTable: Next update scheduled in " + (this.config.updateInterval / 1000) + " seconds");
        }
    },

    // Handle notifications from node_helper
    socketNotificationReceived: function(notification, payload) {
        if (this.config.debug) {
            Log.info(" MMM-MyTeams-LeagueTable: Received notification: " + notification);
        }
        
        switch (notification) {
            case "LEAGUE_DATA":
                this.processLeagueData(payload);
                break;
            case "FETCH_ERROR":
                this.processError(payload);
                break;
        }
    },

    // Process successful league data
    processLeagueData: function(data) {
        if (this.config.debug) {
            Log.info(" MMM-MyTeams-LeagueTable: Processing league data for " + data.leagueType + ": " + JSON.stringify(data && data.meta ? data.meta : {}));
        }
        
        // Store data for the specific league
        const leagueType = data.leagueType || "SPFL"; // Default to SPFL if not specified
        this.leagueData[leagueType] = data;
        this.loaded[leagueType] = true;
        
        // If this is the first data we've received, set it as current
        if (!this.currentLeague || this.currentLeague === leagueType) {
            this.currentLeague = leagueType;
        }
        
        this.error = null;
        this.retryCount = 0;
        
        // Update the display
        this.updateDom(this.config.animationSpeed);
    },

    // Process error from data fetch
    processError: function(error) {
        Log.error(" MMM-MyTeams-LeagueTable: Error fetching data: " + (error && error.message ? error.message : String(error)));
        
        this.error = error;
        this.retryCount++;
        
        // Retry if we haven't exceeded max retries
        if (this.retryCount <= this.config.maxRetries) {
            var self = this;
            setTimeout(function() {
                if (self.config.debug) {
                    Log.info(" MMM-MyTeams-LeagueTable: Retrying data fetch (attempt " + self.retryCount + ")");
                }
                self.requestAllLeagueData();
            }, this.config.retryDelay);
        } else {
            Log.error(" MMM-MyTeams-LeagueTable: Max retries exceeded, giving up");
            this.updateDom(this.config.animationSpeed);
        }
    },

    // Get league information from EUROPEAN_LEAGUES (if available) or legacy config
    getLeagueInfo: function(leagueCode) {
        // Map of league codes to their information
        // This includes new EUROPEAN_LEAGUES format and legacy codes
        const leagueMapping = {
            // Legacy codes (for backward compatibility)
            "SPFL": { name: "Scottish Premiership", countryFolder: "Scotland", countryCode: "SC" },
            "SPFLC": { name: "Scottish Championship", countryFolder: "Scotland", countryCode: "SC" },
            "EPL": { name: "English Premier League", countryFolder: "England", countryCode: "EN" },
            "UCL": { name: "UEFA Champions League", countryFolder: null, countryCode: "EU" },
            "UEL": { name: "UEFA Europa League", countryFolder: null, countryCode: "EU" },
            "ECL": { name: "UEFA Conference League", countryFolder: null, countryCode: "EU" },
            
            // New EUROPEAN_LEAGUES format codes
            "SCOTLAND_PREMIERSHIP": { name: "Scottish Premiership", countryFolder: "Scotland", countryCode: "SC" },
            "SCOTLAND_CHAMPIONSHIP": { name: "Scottish Championship", countryFolder: "Scotland", countryCode: "SC" },
            "ENGLAND_PREMIER_LEAGUE": { name: "English Premier League", countryFolder: "England", countryCode: "EN" },
            "GERMANY_BUNDESLIGA": { name: "Bundesliga", countryFolder: "Germany", countryCode: "DE" },
            "FRANCE_LIGUE1": { name: "Ligue 1", countryFolder: "France", countryCode: "FR" },
            "SPAIN_LA_LIGA": { name: "La Liga", countryFolder: "Spain", countryCode: "ES" },
            "ITALY_SERIE_A": { name: "Serie A", countryFolder: "Italy", countryCode: "IT" },
            "NETHERLANDS_EREDIVISIE": { name: "Eredivisie", countryFolder: "The Netherlands", countryCode: "NL" },
            "BELGIUM_PRO_LEAGUE": { name: "Belgian Pro League", countryFolder: "Belgium", countryCode: "BE" },
            "PORTUGAL_PRIMEIRA_LIGA": { name: "Primeira Liga", countryFolder: "Portugal", countryCode: "PT" },
            "GREECE_SUPER_LEAGUE": { name: "Greek Super League", countryFolder: "Greece", countryCode: "GR" },
            "TURKEY_SUPER_LIG": { name: "Turkish Super Lig", countryFolder: "Turkey", countryCode: "TR" },
            "UKRAINE_PREMIER_LEAGUE": { name: "Ukrainian Premier League", countryFolder: "Ukraine", countryCode: "UA" },
            "ROMANIA_LIGA_I": { name: "Liga I", countryFolder: "Romania", countryCode: "RO" },
            "CROATIA_HNL": { name: "Croatian HNL", countryFolder: "Croatia", countryCode: "HR" },
            "SERBIA_SUPER_LIGA": { name: "Serbian Super Liga", countryFolder: "Serbia", countryCode: "RS" },
            "AUSTRIA_BUNDESLIGA": { name: "Austrian Bundesliga", countryFolder: "Austria", countryCode: "AT" },
            "CZECH_LIGA": { name: "Czech Liga", countryFolder: "Czech Republic", countryCode: "CZ" },
            "HUNGARY_NBI": { name: "Hungarian NB I", countryFolder: "Hungary", countryCode: "HU" },
            "POLAND_EKSTRAKLASA": { name: "Ekstraklasa", countryFolder: "Poland", countryCode: "PL" },
            "SWITZERLAND_SUPER_LEAGUE": { name: "Swiss Super League", countryFolder: "Switzerland", countryCode: "CH" },
            "SWEDEN_ALLSVENSKAN": { name: "Allsvenskan", countryFolder: "Sweden", countryCode: "SE" },
            "NORWAY_ELITESERIEN": { name: "Eliteserien", countryFolder: "Norway", countryCode: "NO" },
            "DENMARK_SUPERLIGAEN": { name: "Superligaen", countryFolder: "Denmark", countryCode: "DK" }
        };
        
        return leagueMapping[leagueCode] || null;
    },

    // Get league abbreviation from league code
    getLeagueAbbreviation: function(leagueCode) {
        // Map codes to abbreviations
        const abbreviations = {
            "SPFL": "SPFL",
            "SPFLC": "SPFLC",
            "EPL": "EPL",
            "UCL": "UCL",
            "UEL": "UEL",
            "ECL": "ECL",
            "SCOTLAND_PREMIERSHIP": "SPL",
            "SCOTLAND_CHAMPIONSHIP": "SLC",
            "ENGLAND_PREMIER_LEAGUE": "EPL",
            "GERMANY_BUNDESLIGA": "BL",
            "FRANCE_LIGUE1": "L1",
            "SPAIN_LA_LIGA": "LL",
            "ITALY_SERIE_A": "SA",
            "NETHERLANDS_EREDIVISIE": "ED",
            "BELGIUM_PRO_LEAGUE": "PL",
            "PORTUGAL_PRIMEIRA_LIGA": "PL",
            "GREECE_SUPER_LEAGUE": "SL",
            "TURKEY_SUPER_LIG": "SL",
            "UKRAINE_PREMIER_LEAGUE": "UPL",
            "ROMANIA_LIGA_I": "LI",
            "CROATIA_HNL": "HNL",
            "SERBIA_SUPER_LIGA": "SL",
            "AUSTRIA_BUNDESLIGA": "AB",
            "CZECH_LIGA": "CL",
            "HUNGARY_NBI": "NBI",
            "POLAND_EKSTRAKLASA": "EK",
            "SWITZERLAND_SUPER_LEAGUE": "SL",
            "SWEDEN_ALLSVENSKAN": "AS",
            "NORWAY_ELITESERIEN": "ES",
            "DENMARK_SUPERLIGAEN": "SL"
        };
        
        return abbreviations[leagueCode] || leagueCode.substring(0, 3).toUpperCase();
    },
    
    // Handle league button clicks with smooth transitions
    handleLeagueButtonClick: function(event) {
        const league = event.currentTarget.dataset.league;
        if (league && this.currentLeague !== league) {
            // Apply transition effect
            const root = document.getElementById("mtlt-" + this.identifier);
            const wrapper = root ? root : null;
            if (wrapper) {
                // Fade out current league
                wrapper.style.opacity = "0";
                wrapper.style.transform = "translateY(10px)";
                
                // Use setTimeout to create a smooth transition effect
                setTimeout(() => {
                    this.currentLeague = league;
                    this.updateDom(0); // Update immediately
                    
                    // Fade back in after DOM update
                    setTimeout(() => {
                        const root2 = document.getElementById("mtlt-" + this.identifier);
                        const newWrapper = root2 ? root2 : null;
                        if (newWrapper) {
                            newWrapper.style.opacity = "1";
                            newWrapper.style.transform = "translateY(0)";
                        }
                        
                        // Scroll to top when changing leagues
                        const contentContainer = root2 ? root2.querySelector(".league-content-container") : null;
                        if (contentContainer) {
                            contentContainer.scrollTop = 0;
                        }
                    }, 50);
                }, 300);
            } else {
                // Fallback if wrapper not found
                this.currentLeague = league;
                this.updateDom(this.config.animationSpeed);
            }
            
            // Reset auto-cycling timer if we're manually changing leagues
            if (this.config.autoCycle && this.cycleTimer) {
                this.scheduleCycling();
            }
            
            if (this.config.debug) {
                Log.info(" MMM-MyTeams-LeagueTable: Switched to " + league + " via button click");
            }
        }
    },
    
    // Handle back to top button click
    handleBackToTopClick: function() {
        const root = document.getElementById("mtlt-" + this.identifier);
        const tableContainer = root ? root.querySelector(".league-content-container") : null;
        if (tableContainer) {
            // Use smooth scrolling for a better user experience
            tableContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Update button visibility after scrolling
            setTimeout(() => {
                this.updateScrollButtons();
            }, 500);
        }
    },
    
    // Update scroll buttons visibility based on scroll position
    updateScrollButtons: function() {
        const root = document.getElementById("mtlt-" + this.identifier);
        const tableContainer = root ? root.querySelector(".league-content-container") : null;
        const backToTopControls = root ? root.querySelector(".back-to-top-controls") : null;
        
        if (tableContainer && backToTopControls) {
            const scrollTop = tableContainer.scrollTop;
            const isScrolled = scrollTop > 30;
            console.log("[LeagueTable] ScrollTop:", scrollTop, "IsScrolled:", isScrolled, "Has .visible:", backToTopControls.classList.contains("visible"));
            
            // Show button when scrolled down more than 30px
            if (isScrolled) {
                if (!backToTopControls.classList.contains("visible")) {
                    backToTopControls.classList.add("visible");
                    console.log("[LeagueTable] Added .visible class");
                }
                this.isScrolling = true;
            } else {
                if (backToTopControls.classList.contains("visible")) {
                    backToTopControls.classList.remove("visible");
                    console.log("[LeagueTable] Removed .visible class");
                }
                this.isScrolling = false;
            }
        } else {
            console.warn("[LeagueTable] Missing elements - root:", !!root, "tableContainer:", !!tableContainer, "backToTopControls:", !!backToTopControls);
        }
    },

    // Compute and set team name column width to longest name + 10px
    updateTeamNameColumnWidth: function() {
        const root = document.getElementById("mtlt-" + this.identifier);
        if (!root) return;
        const names = root.querySelectorAll('.team-cell .team-name');
        if (!names || names.length === 0) return;
        // Build hidden measurer with same font properties
        const sample = names[0];
        const cs = window.getComputedStyle(sample);
        const measurer = document.createElement('span');
        measurer.style.position = 'absolute';
        measurer.style.visibility = 'hidden';
        measurer.style.whiteSpace = 'nowrap';
        measurer.style.left = '-9999px';
        measurer.style.top = '-9999px';
        measurer.style.fontFamily = cs.fontFamily;
        measurer.style.fontSize = cs.fontSize;
        measurer.style.fontWeight = cs.fontWeight;
        measurer.style.fontStyle = cs.fontStyle;
        document.body.appendChild(measurer);
        let max = 0;
        names.forEach(n => {
            measurer.textContent = n.textContent || '';
            const w = measurer.offsetWidth;
            if (w > max) max = w;
        });
        measurer.remove();
        const width = Math.ceil(max + 10);
        root.style.setProperty('--team-name-width', width + 'px');
    },

    // Generate the DOM content
    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.className = "spfl-league-table";
        wrapper.id = "mtlt-" + this.identifier;
        
        this._applyThemeOverrides();
        
        // Create header with league buttons
        var headerContainer = document.createElement("div");
        headerContainer.className = "league-header-container";
        
        // Create league title
        var leagueTitle = document.createElement("div");
        leagueTitle.className = "league-title";
        leagueTitle.textContent = this.config.leagueHeaders[this.currentLeague] || this.currentLeague;
        headerContainer.appendChild(leagueTitle);
        
        // Create league buttons container
        var buttonsContainer = document.createElement("div");
        buttonsContainer.className = "league-buttons-container";
        
        // Auto-generate buttons from selectedLeagues if autoGenerateButtons is enabled
        if (this.config.autoGenerateButtons && this.config.selectedLeagues && this.config.selectedLeagues.length > 0) {
            this.config.selectedLeagues.forEach(leagueCode => {
                const leagueInfo = this.getLeagueInfo(leagueCode);
                if (leagueInfo) {
                    const btn = document.createElement("button");
                    btn.className = "league-btn" + (this.currentLeague === leagueCode ? " active" : "");
                    btn.title = leagueInfo.name; // Tooltip for full league name
                    
                    // Create button content with country flag image only
                    if (leagueInfo.countryFolder) {
                        const flagImg = document.createElement("img");
                        flagImg.className = "flag-image";
                        flagImg.alt = leagueInfo.name;
                        // Construct path to flag image (e.g., "modules/MMM-MyTeams-LeagueTable/images/crests/Scotland/scotland.png")
                        flagImg.src = `modules/MMM-MyTeams-LeagueTable/images/crests/${leagueInfo.countryFolder}/${leagueInfo.countryFolder.toLowerCase()}.png`;
                        flagImg.onerror = function() {
                            // Fallback if flag image not found
                            this.style.display = 'none';
                        };
                        btn.appendChild(flagImg);
                    }
                    btn.dataset.league = leagueCode;
                    btn.dataset.country = leagueInfo.countryCode || "";
                    
                    btn.addEventListener("click", this.handleLeagueButtonClick.bind(this));
                    buttonsContainer.appendChild(btn);
                }
            });
        } else {
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
            const knownLeaguesOrder = ["SPFL","SPFLC","UCL","UEL","ECL","EPL"];
            knownLeaguesOrder.forEach((lk) => {
                if (this.config["show" + lk]) {
                    configOrder.push(lk);
                }
            });
            
            // If we found enabled leagues in the config, use that order
            if (configOrder.length > 0) {
                // Create buttons in the order they appear
                configOrder.forEach(leagueKey => {
                    const league = leagueButtonsConfig.find(l => l.key === leagueKey);
                    if (league && league.show) {
                        const btn = document.createElement("button");
                        btn.className = "league-btn" + (this.currentLeague === league.key ? " active" : "");
                        btn.textContent = league.text;
                        btn.dataset.league = league.key;
                        btn.addEventListener("click", this.handleLeagueButtonClick.bind(this));
                        buttonsContainer.appendChild(btn);
                    }
                });
            } else {
                // Fallback to the original order if no enabled leagues found in config
                leagueButtonsConfig.forEach(league => {
                    if (league.show) {
                        const btn = document.createElement("button");
                        btn.className = "league-btn" + (this.currentLeague === league.key ? " active" : "");
                        btn.textContent = league.text;
                        btn.dataset.league = league.key;
                        btn.addEventListener("click", this.handleLeagueButtonClick.bind(this));
                        buttonsContainer.appendChild(btn);
                    }
                });
            }
        }
        
        headerContainer.appendChild(buttonsContainer);
        wrapper.appendChild(headerContainer);
        
        // Create content container for the table
        var contentContainer = document.createElement("div");
        contentContainer.className = "league-content-container";
        if (typeof this.config.maxTableHeight === "number" && this.config.maxTableHeight > 0) {
            contentContainer.style.maxHeight = this.config.maxTableHeight + "px";
        }
        
        // Show loading message if data not loaded yet
        if (!this.loaded[this.currentLeague] && !this.error) {
            contentContainer.textContent = this.translate("LOADING");
            contentContainer.className += " dimmed light small";
            wrapper.appendChild(contentContainer);
            return wrapper;
        }
        
        // Show error message if there's an error and max retries exceeded
        if (this.error && this.retryCount > this.config.maxRetries) {
            contentContainer.textContent = this.translate("ERROR") + ": " + (this.error && this.error.message ? String(this.error.message) : "Unknown error");
            contentContainer.className += " dimmed light small";
            wrapper.appendChild(contentContainer);
            return wrapper;
        }
        
        // Show retry message if retrying
        if (this.error && this.retryCount <= this.config.maxRetries) {
            contentContainer.textContent = this.translate("RETRYING") + " (" + this.retryCount + "/" + this.config.maxRetries + ")";
            contentContainer.className += " dimmed light small";
            wrapper.appendChild(contentContainer);
            return wrapper;
        }
        
        // Create the table
        const currentData = this.leagueData[this.currentLeague];
        if (currentData && currentData.teams) {
            if (this.config.debug) {
                Log.info(" MMM-MyTeams-LeagueTable: Creating table for " + this.currentLeague + 
                         " with " + currentData.teams.length + " teams");
            }
            contentContainer.appendChild(this.createTable(currentData, this.currentLeague));
        } else {
            if (this.config.debug) {
                Log.info(" MMM-MyTeams-LeagueTable: No league data available for " + this.currentLeague + ", payload: " + JSON.stringify(currentData || {}));
            }
            contentContainer.textContent = "No league data available for " + this.currentLeague;
            contentContainer.className += " dimmed light small";
        }
        
        // Add back-to-top button control inside the scroll container (sticky positioning)
        var backToTopControls = document.createElement("div");
        backToTopControls.className = "back-to-top-controls";
        
        var backToTopBtn = document.createElement("button");
        backToTopBtn.type = "button";
        backToTopBtn.className = "back-to-top-btn";
        backToTopBtn.innerHTML = "↑ Back to Top";
        backToTopBtn.addEventListener("click", this.handleBackToTopClick.bind(this));
        
        backToTopControls.appendChild(backToTopBtn);
        contentContainer.appendChild(backToTopControls);
        
        wrapper.appendChild(contentContainer);
        
        // Set up scroll event listener and initialize visibility
        setTimeout(() => {
            const tableContainer = wrapper.querySelector(".league-content-container");
            const backToTopControls = wrapper.querySelector(".back-to-top-controls");
            if (tableContainer && backToTopControls) {
                // Ensure button starts hidden
                backToTopControls.classList.remove("visible");
                // Attach scroll event listener with passive flag for better performance
                tableContainer.addEventListener("scroll", () => {
                    this.updateScrollButtons();
                }, { passive: true });
            }
            // Initialize back-to-top visibility (should be hidden at start)
            this.updateScrollButtons();
            // Compute dynamic team name width
            this.updateTeamNameColumnWidth();
        }, 100);
        
        return wrapper;
    },

    // Create the league table
    createTable: function(leagueData, leagueKey) {
        var table = document.createElement("table");
        table.className = "small spfl-table";
        
        // Create table header row
        var thead = document.createElement("thead");
        var headerRow = document.createElement("tr");
        
        // Position column
        if (this.config.showPosition) {
            var posHeader = document.createElement("th");
            posHeader.innerHTML = "#";
            posHeader.className = "position-header";
            headerRow.appendChild(posHeader);
        }
        
        // Team name column
        var teamHeader = document.createElement("th");
        teamHeader.innerHTML = "Team";
        teamHeader.className = "team-header";
        headerRow.appendChild(teamHeader);
        
        // Games played column
        if (this.config.showPlayedGames) {
            var playedHeader = document.createElement("th");
            playedHeader.innerHTML = "P";
            playedHeader.className = "played-header";
            headerRow.appendChild(playedHeader);
        }
        
        // Won column
        if (this.config.showWon) {
            var wonHeader = document.createElement("th");
            wonHeader.innerHTML = "W";
            wonHeader.className = "won-header";
            headerRow.appendChild(wonHeader);
        }
        
        // Drawn column
        if (this.config.showDrawn) {
            var drawnHeader = document.createElement("th");
            drawnHeader.innerHTML = "D";
            drawnHeader.className = "drawn-header";
            headerRow.appendChild(drawnHeader);
        }
        
        // Lost column
        if (this.config.showLost) {
            var lostHeader = document.createElement("th");
            lostHeader.innerHTML = "L";
            lostHeader.className = "lost-header";
            headerRow.appendChild(lostHeader);
        }
        
        // Goals For column
        if (this.config.showGoalsFor) {
            var gfHeader = document.createElement("th");
            gfHeader.innerHTML = "F";
            gfHeader.className = "gf-header";
            headerRow.appendChild(gfHeader);
        }
        
        // Goals Against column
        if (this.config.showGoalsAgainst) {
            var gaHeader = document.createElement("th");
            gaHeader.innerHTML = "A";
            gaHeader.className = "ga-header";
            headerRow.appendChild(gaHeader);
        }
        
        // Goal difference column
        if (this.config.showGoalDifference) {
            var gdHeader = document.createElement("th");
            gdHeader.innerHTML = "GD";
            gdHeader.className = "gd-header";
            headerRow.appendChild(gdHeader);
        }
        
        // Points column
        if (this.config.showPoints) {
            var pointsHeader = document.createElement("th");
            pointsHeader.innerHTML = "Pts";
            pointsHeader.className = "points-header";
            headerRow.appendChild(pointsHeader);
        }
        
        // Form column
        if (this.config.showForm) {
            var formHeader = document.createElement("th");
            formHeader.innerHTML = "Form";
            formHeader.className = "form-header";
            headerRow.appendChild(formHeader);
        }
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        var tbody = document.createElement("tbody");
        
        // Limit teams if configured
        var teamsToShow = leagueData.teams;
        if (this.config.maxTeams > 0) {
            teamsToShow = teamsToShow.slice(0, this.config.maxTeams);
        }
        
        // Create rows for each team
        teamsToShow.forEach((team, index) => {
            var row = document.createElement("tr");
            row.className = "team-row";
            
            // Add position-based styling if colored is enabled
            if (this.config.colored) {
                if (team.position <= 2) {
                    row.className += " champions-league";
                } else if (team.position <= 4) {
                    row.className += " europa-league";
                } else if (team.position >= teamsToShow.length - 1) {
                    row.className += " relegation";
                }
            }
            
            // Highlight specific teams if configured
            if (this.config.highlightTeams.includes(team.name)) {
                row.className += " highlighted";
            }
            
            // Position cell
            if (this.config.showPosition) {
                var posCell = document.createElement("td");
                posCell.innerHTML = Number.isFinite(team.position) ? team.position : "-";
                posCell.className = "position-cell";
                row.appendChild(posCell);
            }
            
            // Team cell: optional logo + name
            var teamCell = document.createElement("td");
            teamCell.className = "team-cell";

            // Add team logo if enabled; fall back gracefully if missing
            if (this.config.showTeamLogos) {
                var img = document.createElement("img");
                img.className = "team-logo";
                img.alt = team.name + " logo";
                
                // ===== OPTIMIZED FALLBACK CHAIN =====
                // Priority 1: Direct mappings from team-logo-mappings.js (1706+ teams with full crests/Country/file paths)
                // Priority 2: Slug-based fallbacks for teams not in mapping
                // Priority 3: Placeholder image
                var mapped = this.getTeamLogoMapping(team.name) || null;
                var slug = (team.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                var candidates = [];
                
                // PRIMARY: Direct mapping (format: crests/Country/team.png)
                if (mapped) {
                    candidates.push(mapped);
                    if (this.config.debug) {
                        Log.info(" MMM-MyTeams-LeagueTable: Using direct mapping for " + team.name + ": " + mapped);
                    }
                }
                
                // SECONDARY FALLBACK: Slug-based paths for teams not in mapping
                // Try SVG and PNG variants
                candidates.push("crests/" + slug + ".svg");
                candidates.push("crests/" + slug + ".png");
                candidates.push(slug + ".svg");
                candidates.push(slug + ".png");
                
                // FINAL FALLBACK: Placeholder image
                candidates.push("placeholder.svg");

                var basePath = "modules/MMM-MyTeams-LeagueTable/images/";
                var tryIndex = 0;
                var self = this;
                
                function tryNext(imgEl) {
                    if (tryIndex >= candidates.length) {
                        // All candidates failed including placeholder, remove image
                        imgEl.onerror = null;
                        imgEl.remove();
                        if (self.config.debug) {
                            Log.warn(" MMM-MyTeams-LeagueTable: No logo found for " + team.name + ", image removed");
                        }
                        return;
                    }
                    var nextPath = basePath + candidates[tryIndex];
                    if (self.config.debug && tryIndex === 0 && mapped) {
                        Log.info(" MMM-MyTeams-LeagueTable: Loading primary mapping: " + nextPath);
                    }
                    imgEl.src = nextPath;
                    tryIndex++;
                }
                
                img.onerror = function () { tryNext(this); };
                tryNext(img);
                teamCell.appendChild(img);
            }

            var nameSpan = document.createElement("span");
            nameSpan.className = "team-name";
            nameSpan.textContent = team.name;
            teamCell.appendChild(nameSpan);
            row.appendChild(teamCell);
            
            // Games played cell
            if (this.config.showPlayedGames) {
                var playedCell = document.createElement("td");
                playedCell.innerHTML = Number.isFinite(team.played) ? team.played : "-";
                playedCell.className = "played-cell";
                row.appendChild(playedCell);
            }
            
            // Won cell
            if (this.config.showWon) {
                var wonCell = document.createElement("td");
                wonCell.innerHTML = Number.isFinite(team.won) ? team.won : "-";
                wonCell.className = "won-cell";
                row.appendChild(wonCell);
            }
            
            // Drawn cell
            if (this.config.showDrawn) {
                var drawnCell = document.createElement("td");
                drawnCell.innerHTML = Number.isFinite(team.drawn) ? team.drawn : "-";
                drawnCell.className = "drawn-cell";
                row.appendChild(drawnCell);
            }
            
            // Lost cell
            if (this.config.showLost) {
                var lostCell = document.createElement("td");
                lostCell.innerHTML = Number.isFinite(team.lost) ? team.lost : "-";
                lostCell.className = "lost-cell";
                row.appendChild(lostCell);
            }
            
            // Goals For cell
            if (this.config.showGoalsFor) {
                var gfCell = document.createElement("td");
                gfCell.innerHTML = Number.isFinite(team.goalsFor) ? team.goalsFor : "-";
                gfCell.className = "gf-cell";
                row.appendChild(gfCell);
            }
            
            // Goals Against cell
            if (this.config.showGoalsAgainst) {
                var gaCell = document.createElement("td");
                gaCell.innerHTML = Number.isFinite(team.goalsAgainst) ? team.goalsAgainst : "-";
                gaCell.className = "ga-cell";
                row.appendChild(gaCell);
            }
            
            // Goal difference cell
            if (this.config.showGoalDifference) {
                var gdCell = document.createElement("td");
                var gd = Number.isFinite(team.goalDifference) ? team.goalDifference : null;
                gdCell.innerHTML = (gd === null) ? "-" : (gd > 0 ? "+" + gd : String(gd));
                gdCell.className = "gd-cell";
                if (gd > 0) gdCell.className += " positive";
                else if (gd < 0) gdCell.className += " negative";
                else if (gd === 0) gdCell.className += " neutral";
                row.appendChild(gdCell);
            }
            
            // Points cell
            if (this.config.showPoints) {
                var pointsCell = document.createElement("td");
                pointsCell.innerHTML = Number.isFinite(team.points) ? team.points : "-";
                pointsCell.className = "points-cell";
                row.appendChild(pointsCell);
            }
            
            // Form cell (limit to config.formMaxGames; pad with '-')
            if (this.config.showForm) {
                var formCell = document.createElement("td");
                formCell.className = "form-cell";
                var container = document.createElement("div");
                container.className = "form-tokens";
                var raw = (team.form || "").toString().trim().toUpperCase().replace(/[^WDL]/g, "");
                var arr = raw.split("").filter(Boolean);
                var maxGames = Math.max(1, Number(this.config.formMaxGames) || 5);
                // Keep only the last maxGames results
                if (arr.length > maxGames) arr = arr.slice(-maxGames);
                // Left-pad with '-' to maxGames if fewer than maxGames matches
                var display = new Array(Math.max(0, maxGames - arr.length)).fill("-").concat(arr);
                display.forEach(function(ch){
                    var span = document.createElement("span");
                    if (ch === "W") { span.className = "form-win"; span.textContent = "W"; }
                    else if (ch === "D") { span.className = "form-draw"; span.textContent = "D"; }
                    else if (ch === "L") { span.className = "form-loss"; span.textContent = "L"; }
                    else { span.className = "form-missing"; span.textContent = "-"; }
                    container.appendChild(span);
                });
                formCell.appendChild(container);
                row.appendChild(formCell);
            }
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);

        // Add footer with source and last updated time
        var colCount = 0;
        if (this.config.showPosition) colCount++;
        colCount++; // team column
        if (this.config.showPlayedGames) colCount++;
        if (this.config.showWon) colCount++;
        if (this.config.showDrawn) colCount++;
        if (this.config.showLost) colCount++;
        if (this.config.showGoalsFor) colCount++;
        if (this.config.showGoalsAgainst) colCount++;
        if (this.config.showGoalDifference) colCount++;
        if (this.config.showPoints) colCount++;
        if (this.config.showForm) colCount++;

        var tfoot = document.createElement("tfoot");
        var footerRow = document.createElement("tr");
        var footerCell = document.createElement("td");
        footerCell.colSpan = colCount;
        footerCell.className = "spfl-footer";
        var src = (leagueData && leagueData.source) ? leagueData.source : "Unknown";
        var ts = (leagueData && leagueData.lastUpdated) ? new Date(leagueData.lastUpdated).toLocaleString() : new Date().toLocaleString();
        footerCell.innerHTML = "Source: " + src + " • " + this.translate("LAST_UPDATED") + ": " + ts;
        footerRow.appendChild(footerCell);
        tfoot.appendChild(footerRow);
        table.appendChild(tfoot);

        return table;
    },

    // Return the list of CSS files to load for this module
    getStyles: function() {
        // Ensure the module's stylesheet is loaded by MagicMirror
        // Note: filename uses current folder spelling. We can rename alongside module folder later.
        return ["MMM-MyTeams-LeagueTable.css"];
    },

    // Get translations
    getTranslations: function() {
        // Return an empty map by default to avoid 404s when translation files are absent.
        return {};
    },

    // Clean up on suspend
    suspend: function() {
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
        }
        
        if (this.cycleTimer) {
            clearInterval(this.cycleTimer);
        }
    },

    // Resume updates
    resume: function() {
        this.scheduleUpdate();
        this.requestAllLeagueData();
        
        if (this.config.autoCycle) {
            this.scheduleCycling();
        }
    },

    // -----------------------------
    // Theme Overrides
    // -----------------------------
    _applyThemeOverrides: function() {
        const styleId = "mmm-myteams-leaguetable-theme-override";
        let styleEl = document.getElementById(styleId);
        
        // Remove existing style element if no overrides are active
        if (this.config.darkMode === null && 
            this.config.fontColorOverride === null && 
            this.config.opacityOverride === null) {
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
            css += `.spfl-league-table { background-color: #111 !important; color: #fff !important; }\n`;
        } else if (this.config.darkMode === false) {
            css += `.spfl-league-table { background-color: #f5f5f5 !important; color: #000 !important; }\n`;
        }
        
        // Font color override
        if (this.config.fontColorOverride) {
            css += `.spfl-league-table * { color: ${this.config.fontColorOverride} !important; }\n`;
        }
        
        // Opacity override (exclude back-to-top-controls which manages its own visibility)
        if (this.config.opacityOverride !== null && this.config.opacityOverride !== undefined) {
            const opacity = parseFloat(this.config.opacityOverride);
            if (!isNaN(opacity)) {
                css += `.spfl-league-table * { opacity: ${opacity} !important; }\n`;
                // Restore back-to-top-controls opacity to allow visibility toggle to work
                css += `.spfl-league-table .back-to-top-controls { opacity: 0 !important; }\n`;
                css += `.spfl-league-table .back-to-top-controls.visible { opacity: 1 !important; }\n`;
            }
        }
        
        styleEl.textContent = css;
    }
});
