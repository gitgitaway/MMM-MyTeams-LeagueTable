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

module.exports = NodeHelper.create({
    
    // Node helper started
    start: function() {
    console.log("Starting node helper for: MMM-MyTeams-LeagueTable");
    this.config = null;
    
    // Initialize cache manager
    this.cache = new CacheManager(__dirname);
    
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
    socketNotificationReceived: function(notification, payload) {
        if (notification === "GET_LEAGUE_DATA") {
            this.config = payload;
            this.fetchLeagueData(payload.url, payload.leagueType);
        } else if (notification === "CACHE_GET_STATS") {
            const stats = this.cache.getStats();
            this.sendSocketNotification("CACHE_STATS", stats);
        } else if (notification === "CACHE_CLEAR_ALL") {
            const cleared = this.cache.clearAll();
            this.sendSocketNotification("CACHE_CLEARED", { cleared: cleared });
            console.log(` MMM-MyTeams-LeagueTable: Cache cleared (${cleared} files removed)`);
        } else if (notification === "CACHE_CLEANUP") {
            const deleted = this.cache.cleanupExpired();
            this.sendSocketNotification("CACHE_CLEANUP_DONE", { deleted: deleted });
            console.log(` MMM-MyTeams-LeagueTable: Cache cleanup complete (${deleted} expired files removed)`);
        }
    },

    // Main function to fetch league data
    fetchLeagueData: function(url, leagueType) {
        const self = this;
        
        if (this.config && this.config.debug) {
            console.log(` MMM-MyTeams-LeagueTable: Fetching ${leagueType} data from ${url}...`);
            this.cache.setDebug(true);
        }
        
        try {
            this.fetchWebPage(url)
                .then(html => {
                    if (this.config && this.config.debug) {
                        console.log(` MMM-MyTeams-LeagueTable: Successfully fetched ${leagueType} webpage`);
                    }
                    return this.parseLeagueData(html, leagueType);
                })
                .then(leagueData => {
                    if (this.config && this.config.debug) {
                        console.log(` MMM-MyTeams-LeagueTable: Parsed ${leagueType} data: ${JSON.stringify({ teams: leagueData && leagueData.teams ? leagueData.teams.length : 0 })}`);
                    }
                    
                    // Save successful data to cache
                    leagueData.leagueType = leagueType;
                    this.cache.set(leagueType, leagueData);
                    
                    // Send data to frontend
                    this.sendSocketNotification("LEAGUE_DATA", leagueData);
                })
                .catch(error => {
                    console.error(` MMM-MyTeams-LeagueTable: Error fetching ${leagueType} data:`, error.message);
                    
                    // Try to load from cache before reporting error
                    const cachedData = this.cache.get(leagueType);
                    if (cachedData) {
                        console.log(` MMM-MyTeams-LeagueTable: Using cached data for ${leagueType} after fetch failure`);
                        cachedData.leagueType = leagueType;
                        cachedData.fromCache = true;
                        cachedData.cacheFallback = true;
                        this.sendSocketNotification("LEAGUE_DATA", cachedData);
                    } else {
                        // No cache available, report error
                        this.sendSocketNotification("FETCH_ERROR", {
                            message: error.message,
                            code: error.code || "UNKNOWN_ERROR",
                            leagueType: leagueType
                        });
                    }
                });
        } catch (error) {
            console.error(` MMM-MyTeams-LeagueTable: Unexpected error for ${leagueType}:`, error);
            
            // Try cache on unexpected error too
            const cachedData = this.cache.get(leagueType);
            if (cachedData) {
                console.log(` MMM-MyTeams-LeagueTable: Using cached data for ${leagueType} after unexpected error`);
                cachedData.leagueType = leagueType;
                cachedData.fromCache = true;
                cachedData.cacheFallback = true;
                this.sendSocketNotification("LEAGUE_DATA", cachedData);
            } else {
                this.sendSocketNotification("FETCH_ERROR", {
                    message: error.message,
                    code: "UNEXPECTED_ERROR",
                    leagueType: leagueType
                });
            }
        }
    },

    // Fetch webpage content
   fetchWebPage: async function(url) {
    try {
        const result = await requestManager.queueRequest({
            url: url,
            options: {
                method: 'GET',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Connection": "keep-alive"
                }
            },
            timeout: 10000,
            priority: 1,  // Normal priority
            moduleId: 'MMM-MyTeams-LeagueTable',
            deduplicate: true
        });

        if (!result.success) {
            throw new Error(`HTTP ${result.status}: Request failed`);
        }

        return result.data;
    } catch (error) {
        console.error(` MMM-MyTeams-LeagueTable: Fetch error:`, error.message);
        throw error;
    }
},

    // Parse league data from HTML
    parseLeagueData: function(html, leagueType) {
        try {
            const teams = [];
            
            if (this.config && this.config.debug) {
                console.log(` MMM-MyTeams-LeagueTable: Starting to parse ${leagueType} HTML data`);
            }
            
            // Look for table data in the HTML - BBC uses specific table structure
            const tableRegex = /<table[^>]*>(.*?)<\/table>/gis;
            const tableMatches = html.match(tableRegex);
            
            if (!tableMatches) {
                if (this.config && this.config.debug) {
                    console.log(` MMM-MyTeams-LeagueTable: No table found for ${leagueType}, trying alternative parsing`);
                }
                return this.parseAlternativeFormat(html, leagueType);
            }

            // For UCL, UEL, and ECL, we need to handle multiple tables (group stages)
            let processedTables = 0;
            let totalTeams = 0;
            
            // Process each table found
            for (const tableHtml of tableMatches) {
                // Skip tables that don't look like league tables
                if (!tableHtml.includes("team") && !tableHtml.includes("club") && !tableHtml.includes("position")) {
                    continue;
                }
                
                // Extract table rows
                const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
                const rows = tableHtml.match(rowRegex);
                
                if (!rows || rows.length < 2) {
                    continue;
                }

                if (this.config && this.config.debug) {
                    console.log(` MMM-MyTeams-LeagueTable: Found table ${processedTables + 1} with ${rows.length} rows`);
                }
                
                processedTables++;

                // Skip header row and process data rows
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    const team = this.parseTeamRow(row, totalTeams + i);
                    
                    if (team) {
                        // For group stages, add group information if available
                        if (["UCL", "UEL", "ECL"].includes(leagueType)) {
                            // Try to find group header near this table
                            const groupHeaderRegex = /<h3[^>]*>Group\s+([A-Z])<\/h3>/i;
                            const groupMatch = html.substring(Math.max(0, html.indexOf(tableHtml) - 200), 
                                                             html.indexOf(tableHtml)).match(groupHeaderRegex);
                            
                            if (groupMatch) {
                                team.group = "Group " + groupMatch[1];
                            }
                        }
                        
                        teams.push(team);
                        if (this.config && this.config.debug && teams.length <= 3) {
                            console.log(` MMM-MyTeams-LeagueTable: Parsed ${leagueType} team: ${team.name}`);
                        }
                    }
                }
                
                totalTeams += rows.length - 1; // Subtract header row
                
                // For SPFL, we only need the first valid table
                if (leagueType === "SPFL" && teams.length > 0) {
                    break;
                }
            }

            if (teams.length === 0) {
                if (this.config && this.config.debug) {
                    console.log(` MMM-MyTeams-LeagueTable: No teams parsed for ${leagueType}, using fallback`);
                }
                return this.parseAlternativeFormat(html, leagueType);
            }

            return {
                teams: teams,
                lastUpdated: new Date().toISOString(),
                source: "BBC Sport",
                leagueType: leagueType
            };

        } catch (error) {
            console.error(` MMM-MyTeams-LeagueTable: Error parsing ${leagueType} data:`, error);
            if (this.config && this.config.debug) {
                console.log(` MMM-MyTeams-LeagueTable: Using fallback for ${leagueType} due to parsing error`);
            }
            return this.parseAlternativeFormat(html, leagueType);
        }
    },

    // Parse individual team row
    parseTeamRow: function(rowHtml, position) {
        try {
            if (this.config && this.config.debug) {
                console.log(" MMM-MyTeams-LeagueTable: Parsing row " + position + ":", rowHtml.substring(0, 200) + "...");
            }

            // Skip header row
            if (rowHtml.includes('HeadingRow') || rowHtml.includes('<th')) {
                return null;
            }

            // Extract team name from data-testid attribute in the first cell
            const testIdMatch = rowHtml.match(/data-testid="badge-container-([^"]+)"/);
            let teamName = "";
            
            if (this.config && this.config.debug) {
                console.log(" MMM-MyTeams-LeagueTable: [Row " + position + "] data-testid regex match: " + (testIdMatch ? "FOUND: '" + testIdMatch[1] + "'" : "NOT FOUND"));
            }
            
            if (testIdMatch) {
                // Convert kebab-case to proper team name
                teamName = testIdMatch[1]
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                
                if (this.config && this.config.debug) {
                    console.log(" MMM-MyTeams-LeagueTable: [Row " + position + "] After conversion: '" + teamName + "'");
                    // If this is "undefined", show the full HTML to help debug
                    if (teamName === "Undefined") {
                        console.log(" MMM-MyTeams-LeagueTable: [Row " + position + "] *** UNDEFINED TEAM FOUND ***");
                        console.log(" MMM-MyTeams-LeagueTable: [Row " + position + "] FULL HTML (0-800):");
                        console.log(rowHtml.substring(0, 800));
                        console.log(" MMM-MyTeams-LeagueTable: [Row " + position + "] FULL HTML (800-1600):");
                        console.log(rowHtml.substring(800, 1600));
                        console.log(" MMM-MyTeams-LeagueTable: [Row " + position + "] Total HTML length: " + rowHtml.length);
                    }
                }
                
                // Handle special cases
                if (teamName === "Heart Of Midlothian") teamName = "Hearts";
                if (teamName === "St Mirren") teamName = "St. Mirren";
                if (teamName === "AFC Bournemouth") teamName = "Bournemouth";
                // French league special cases
                if (teamName === "Paris Saint Germain") teamName = "Paris Sg";
                if (teamName === "Paris St Germain") teamName = "Paris Sg";
                if (teamName === "Paris Sg") teamName = "Paris Sg";
                if (teamName === "Paris Fc") teamName = "Paris Fc";
                if (teamName === "Paris FC") teamName = "Paris Fc";
                // Italian league special cases - ensure consistency
                if (teamName === "Pisa") teamName = "Pisa";
                // Spanish league special cases - ensure consistency
                if (teamName === "Levante") teamName = "Levante";
                if (teamName === "Oviedo") teamName = "Real Oviedo";
                if (teamName === "Real Oviedo") teamName = "Real Oviedo";
                // German league special cases
                if (teamName === "Leipzig") teamName = "Rb Leipzig";
                if (teamName === "Rb Leipzig") teamName = "Rb Leipzig";
                if (teamName === "RB Leipzig") teamName = "Rb Leipzig";
                
                if (this.config && this.config.debug) {
                    console.log(" MMM-MyTeams-LeagueTable: [Row " + position + "] Extracted via data-testid: '" + teamName + "'");
                }
                
                // Fallback for "Undefined" teams: try to extract from data-600 attribute
                if (teamName === "Undefined") {
                    const data600Match = rowHtml.match(/data-600="([^"]+)"/);
                    if (data600Match) {
                        teamName = data600Match[1].trim();
                        if (this.config && this.config.debug) {
                            console.log(" MMM-MyTeams-LeagueTable: [Row " + position + "] *** FALLBACK SUCCESS: Extracted from data-600: '" + teamName + "'");
                        }
                    }
                }
            } else {
                // Fallback: look for team name in link
                const teamLinkMatch = rowHtml.match(/<a[^>]*>([^<]+)<\/a>/);
                if (this.config && this.config.debug) {
                    console.log(" MMM-MyTeams-LeagueTable: [Row " + position + "] link regex match: " + (teamLinkMatch ? "FOUND: '" + teamLinkMatch[1] + "'" : "NOT FOUND"));
                }
                
                if (teamLinkMatch) {
                    teamName = teamLinkMatch[1].trim();
                    if (this.config && this.config.debug) {
                        console.log(" MMM-MyTeams-LeagueTable: [Row " + position + "] Extracted via link: '" + teamName + "'");
                    }
                } else {
                    // Both patterns failed
                    if (this.config && this.config.debug) {
                        console.log(" MMM-MyTeams-LeagueTable: [Row " + position + "] WARNING - No pattern matched!");
                        console.log(" MMM-MyTeams-LeagueTable: FULL HTML (0-500):");
                        console.log(rowHtml.substring(0, 500));
                        console.log(" MMM-MyTeams-LeagueTable: FULL HTML (500-1000):");
                        console.log(rowHtml.substring(500, 1000));
                    }
                }
            }
            
            if (!teamName || teamName.length < 2) {
                if (this.config && this.config.debug) {
                    console.log(" MMM-MyTeams-LeagueTable: Could not extract team name from row " + position + ". Final teamName value: '" + teamName + "'");
                    console.log(" MMM-MyTeams-LeagueTable: FULL HTML (0-500):");
                    console.log(rowHtml.substring(0, 500));
                    console.log(" MMM-MyTeams-LeagueTable: FULL HTML (500-1000):");
                    console.log(rowHtml.substring(500, 1000));
                    console.log(" MMM-MyTeams-LeagueTable: Total HTML length: " + rowHtml.length);
                }
                return null;
            }

            // Extract position number
            const positionMatch = rowHtml.match(/class="[^"]*Rank[^"]*">(\d+)</);
            const actualPosition = positionMatch ? parseInt(positionMatch[1]) : position;

            // Extract statistics from labeled cells
            const cellData = {};
            
            // First try the span-wrapped format (for Points)
            const spanCellRegex = /<td[^>]*aria-label="([^"]*)"[^>]*><span[^>]*>([+\-]?\d+)<\/span><\/td>/g;
            let match;
            while ((match = spanCellRegex.exec(rowHtml)) !== null) {
                cellData[match[1]] = parseInt(match[2]);
            }
            
            // Then try the direct content format (for other stats)
            const directCellRegex = /<td[^>]*aria-label="([^"]*)"[^>]*>([+\-]?\d+)<\/td>/g;
            while ((match = directCellRegex.exec(rowHtml)) !== null) {
                cellData[match[1]] = parseInt(match[2]);
            }

            if (this.config && this.config.debug) {
                console.log(" MMM-MyTeams-LeagueTable: Extracted cell data:", cellData);
            }

            // Extract form (sequence of recent results) using multiple patterns
            // Handles aria-label, data attributes, class markers, titles, and raw letters
            let formValue = null;
            const formCellMatch = rowHtml.match(/<td[^>]*((aria-label)=("[^"]*Form[^"]*")|data-stat=("form")|data-testid=("form")|class=("[^"]*Form[^"]*"))[^>]*>([\s\S]*?)<\/td>/i);
            if (formCellMatch) {
                const content = formCellMatch[7] || formCellMatch[0];
                const tokens = [];
                // Classes like ...result--w/d/l
                const classMatchRegex = /result--([wdl])/gi;
                let m;
                while ((m = classMatchRegex.exec(content)) !== null) {
                    tokens.push(m[1].toUpperCase());
                }
                // title attributes (Win/Draw/Loss)
                const titleRegex = /title=\"(Win|Draw|Loss)\"/gi;
                while ((m = titleRegex.exec(content)) !== null) {
                    const v = m[1].toUpperCase();
                    tokens.push(v === 'WIN' ? 'W' : v === 'DRAW' ? 'D' : 'L');
                }
                // Abbr or text content letters W/D/L
                const letterRegex = />\s*([WDL])\s*</gi;
                while ((m = letterRegex.exec(content)) !== null) {
                    tokens.push(m[1].toUpperCase());
                }
                if (tokens.length) formValue = tokens.join("");
            }

            const goalsFor = Number.isFinite(cellData['Goals For']) ? cellData['Goals For'] : 0;
            const goalsAgainst = Number.isFinite(cellData['Goals Against']) ? cellData['Goals Against'] : 0;
            const goalDifferenceValue = Number.isFinite(cellData['Goal Difference'])
                ? cellData['Goal Difference']
                : goalsFor - goalsAgainst;

            const team = {
                position: actualPosition,
                name: teamName,
                played: cellData['Played'] || 0,
                won: cellData['Won'] || 0,
                drawn: cellData['Drawn'] || 0,
                lost: cellData['Lost'] || 0,
                goalsFor,
                goalsAgainst,
                goalDifference: goalDifferenceValue,
                points: cellData['Points'] || 0,
                form: formValue
            };

            if (this.config && this.config.debug) {
                console.log(" MMM-MyTeams-LeagueTable: Successfully parsed team:", team);
                console.log(" MMM-MyTeams-LeagueTable: Position " + actualPosition + " -> Team Name: '" + teamName + "'");
            }

            return team;

        } catch (error) {
            if (this.config && this.config.debug) {
                console.error(" MMM-MyTeams-LeagueTable: Error parsing team row " + position + ":", error);
            }
            return null;
        }
    },

    // Helper function to extract numbers from HTML content
    extractNumber: function(cellContent) {
        if (!cellContent) return 0;
        
        // Remove HTML tags and extract number
        const cleanContent = cellContent.replace(/<[^>]*>/g, "").trim();
        const number = parseInt(cleanContent);
        
        return isNaN(number) ? 0 : number;
    },

    // Alternative parsing method for different HTML structures
    parseAlternativeFormat: function(html, leagueType) {
        try {
            let fallbackTeams = [];
            
            // Provide fallback data based on league type
            switch (leagueType) {
                case "SPFL":
                    // Current SPFL Teams based on 2025-26 season - fallback data
                    fallbackTeams = [
                        { position: 1, name: "Celtic", played: 4, won: 3, drawn: 1, lost: 0, goalsFor: 6, goalsAgainst: 0, goalDifference: 6, points: 10, form: "WWDW" },
                        { position: 2, name: "Hearts", played: 4, won: 3, drawn: 1, lost: 0, goalsFor: 10, goalsAgainst: 6, goalDifference: 4, points: 10, form: "WWDW" },
                        { position: 3, name: "Hibernian", played: 3, won: 1, drawn: 2, lost: 0, goalsFor: 5, goalsAgainst: 4, goalDifference: 1, points: 5, form: "DDW" },
                        { position: 4, name: "Dundee United", played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 6, goalsAgainst: 5, goalDifference: 1, points: 4, form: "WDL" },
                        { position: 5, name: "Motherwell", played: 4, won: 0, drawn: 4, lost: 0, goalsFor: 6, goalsAgainst: 6, goalDifference: 0, points: 4, form: "DDDD" },
                        { position: 6, name: "Kilmarnock", played: 4, won: 0, drawn: 4, lost: 0, goalsFor: 6, goalsAgainst: 6, goalDifference: 0, points: 4, form: "DDDD" },
                        { position: 7, name: "Rangers", played: 4, won: 0, drawn: 4, lost: 0, goalsFor: 3, goalsAgainst: 3, goalDifference: 0, points: 4, form: "DDDD" },
                        { position: 8, name: "Falkirk", played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 4, goalsAgainst: 5, goalDifference: -1, points: 4, form: "WDL" },
                        { position: 9, name: "Livingston", played: 4, won: 1, drawn: 1, lost: 2, goalsFor: 6, goalsAgainst: 8, goalDifference: -2, points: 4, form: "LDLW" },
                        { position: 10, name: "St. Mirren", played: 4, won: 0, drawn: 3, lost: 1, goalsFor: 2, goalsAgainst: 3, goalDifference: -1, points: 3, form: "DDL" },
                        { position: 11, name: "Dundee", played: 4, won: 0, drawn: 2, lost: 2, goalsFor: 2, goalsAgainst: 5, goalDifference: -3, points: 2, form: "DLL" },
                        { position: 12, name: "Aberdeen", played: 3, won: 0, drawn: 0, lost: 3, goalsFor: 0, goalsAgainst: 5, goalDifference: -5, points: 0, form: "LLL" }
                    ];
                    break;
                    
                case "UCL":
                    // UCL Group A
                    fallbackTeams = [
                        { position: 1, name: "Bayern Munich", group: "Group A", played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 9, goalsAgainst: 2, goalDifference: 7, points: 6, form: "WW" },
                        { position: 2, name: "Manchester City", group: "Group A", played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 5, goalsAgainst: 3, goalDifference: 2, points: 4, form: "WD" },
                        { position: 3, name: "Barcelona", group: "Group A", played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 3, goalsAgainst: 2, goalDifference: 1, points: 3, form: "WL" },
                        { position: 4, name: "PSG", group: "Group A", played: 2, won: 0, drawn: 1, lost: 1, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 1, form: "DL" },
                        
                        // UCL Group B
                        { position: 1, name: "Real Madrid", group: "Group B", played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 1, goalDifference: 5, points: 6, form: "WW" },
                        { position: 2, name: "Liverpool", group: "Group B", played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 4, goalsAgainst: 2, goalDifference: 2, points: 4, form: "WD" },
                        { position: 3, name: "Inter Milan", group: "Group B", played: 2, won: 0, drawn: 1, lost: 1, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 1, form: "DL" },
                        { position: 4, name: "Celtic", group: "Group B", played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 1, goalsAgainst: 6, goalDifference: -5, points: 0, form: "LL" },
                        
                        // UCL Group C
                        { position: 1, name: "Juventus", group: "Group C", played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 5, goalsAgainst: 1, goalDifference: 4, points: 6, form: "WW" },
                        { position: 2, name: "Atletico Madrid", group: "Group C", played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 3, goalsAgainst: 2, goalDifference: 1, points: 3, form: "WL" },
                        { position: 3, name: "Borussia Dortmund", group: "Group C", played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 3, goalDifference: -1, points: 3, form: "LW" },
                        { position: 4, name: "Ajax", group: "Group C", played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 0, goalsAgainst: 4, goalDifference: -4, points: 0, form: "LL" }
                    ];
                    break;
                    
                case "UEL":
                    // UEL Group A
                    fallbackTeams = [
                        { position: 1, name: "Arsenal", group: "Group A", played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 1, goalDifference: 5, points: 6, form: "WW" },
                        { position: 2, name: "Roma", group: "Group A", played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 4, goalsAgainst: 2, goalDifference: 2, points: 4, form: "WD" },
                        { position: 3, name: "Rangers", group: "Group A", played: 2, won: 0, drawn: 1, lost: 1, goalsFor: 2, goalsAgainst: 4, goalDifference: -2, points: 1, form: "DL" },
                        { position: 4, name: "Olympiacos", group: "Group A", played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 1, goalsAgainst: 6, goalDifference: -5, points: 0, form: "LL" },
                        
                        // UEL Group B
                        { position: 1, name: "Sevilla", group: "Group B", played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 5, goalsAgainst: 1, goalDifference: 4, points: 6, form: "WW" },
                        { position: 2, name: "Manchester United", group: "Group B", played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 3, goalsAgainst: 2, goalDifference: 1, points: 3, form: "WL" },
                        { position: 3, name: "Lazio", group: "Group B", played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 3, goalDifference: -1, points: 3, form: "LW" },
                        { position: 4, name: "Dynamo Kyiv", group: "Group B", played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 0, goalsAgainst: 4, goalDifference: -4, points: 0, form: "LL" }
                    ];
                    break;
                    
                case "ECL":
                    // ECL Group A
                    fallbackTeams = [
                        { position: 1, name: "West Ham", group: "Group A", played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 5, goalsAgainst: 1, goalDifference: 4, points: 6, form: "WW" },
                        { position: 2, name: "Fiorentina", group: "Group A", played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 3, goalsAgainst: 2, goalDifference: 1, points: 3, form: "WL" },
                        { position: 3, name: "Hearts", group: "Group A", played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 3, goalDifference: -1, points: 3, form: "LW" },
                        { position: 4, name: "Partizan", group: "Group A", played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 0, goalsAgainst: 4, goalDifference: -4, points: 0, form: "LL" },
                        
                        // ECL Group B
                        { position: 1, name: "AZ Alkmaar", group: "Group B", played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 4, goalsAgainst: 0, goalDifference: 4, points: 6, form: "WW" },
                        { position: 2, name: "Anderlecht", group: "Group B", played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 3, goalsAgainst: 2, goalDifference: 1, points: 3, form: "WL" },
                        { position: 3, name: "FC Copenhagen", group: "Group B", played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 3, goalDifference: -1, points: 3, form: "LW" },
                        { position: 4, name: "Slavia Prague", group: "Group B", played: 2, won: 0, drawn: 0, lost: 2, goalsFor: 0, goalsAgainst: 4, goalDifference: -4, points: 0, form: "LL" }
                    ];
                    break;
                    
                case "NORWAY_ELITESERIEN":
                    fallbackTeams = [
                        { position: 1, name: "Bodø/Glimt", played: 22, won: 15, drawn: 5, lost: 2, goalsFor: 48, goalsAgainst: 18, goalDifference: 30, points: 50, form: "WWDWW" },
                        { position: 2, name: "Molde", played: 22, won: 14, drawn: 3, lost: 5, goalsFor: 42, goalsAgainst: 24, goalDifference: 18, points: 45, form: "WDWLW" },
                        { position: 3, name: "Strømsgodset", played: 22, won: 12, drawn: 4, lost: 6, goalsFor: 38, goalsAgainst: 26, goalDifference: 12, points: 40, form: "WWDWL" },
                        { position: 4, name: "Rosenborg", played: 22, won: 11, drawn: 5, lost: 6, goalsFor: 35, goalsAgainst: 22, goalDifference: 13, points: 38, form: "WDWDW" },
                        { position: 5, name: "Viking", played: 22, won: 10, drawn: 4, lost: 8, goalsFor: 32, goalsAgainst: 28, goalDifference: 4, points: 34, form: "WLWDW" },
                        { position: 6, name: "Bryne", played: 22, won: 8, drawn: 6, lost: 8, goalsFor: 28, goalsAgainst: 30, goalDifference: -2, points: 30, form: "LDWDL" },
                        { position: 7, name: "FK Haugesund", played: 22, won: 7, drawn: 5, lost: 10, goalsFor: 24, goalsAgainst: 32, goalDifference: -8, points: 26, form: "WDLDL" },
                        { position: 8, name: "Lillestrom", played: 22, won: 6, drawn: 4, lost: 12, goalsFor: 20, goalsAgainst: 36, goalDifference: -16, points: 22, form: "LLDLW" },
                        { position: 9, name: "Elfsborg", played: 22, won: 5, drawn: 3, lost: 14, goalsFor: 18, goalsAgainst: 42, goalDifference: -24, points: 18, form: "LLWLL" },
                        { position: 10, name: "Start", played: 22, won: 3, drawn: 2, lost: 17, goalsFor: 14, goalsAgainst: 48, goalDifference: -34, points: 11, form: "LLLLL" }
                    ];
                    break;
                    
                case "SWEDEN_ALLSVENSKAN":
                    fallbackTeams = [
                        { position: 1, name: "Malmö FF", played: 22, won: 16, drawn: 4, lost: 2, goalsFor: 50, goalsAgainst: 18, goalDifference: 32, points: 52, form: "WWWWW" },
                        { position: 2, name: "AIK", played: 22, won: 15, drawn: 3, lost: 4, goalsFor: 46, goalsAgainst: 22, goalDifference: 24, points: 48, form: "WWWDW" },
                        { position: 3, name: "Hammarby", played: 22, won: 13, drawn: 5, lost: 4, goalsFor: 42, goalsAgainst: 20, goalDifference: 22, points: 44, form: "WWDWL" },
                        { position: 4, name: "Djurgården", played: 22, won: 12, drawn: 4, lost: 6, goalsFor: 38, goalsAgainst: 24, goalDifference: 14, points: 40, form: "WDWDW" },
                        { position: 5, name: "IFK Göteborg", played: 22, won: 10, drawn: 6, lost: 6, goalsFor: 34, goalsAgainst: 26, goalDifference: 8, points: 36, form: "WDWDL" },
                        { position: 6, name: "Kalmar", played: 22, won: 9, drawn: 5, lost: 8, goalsFor: 30, goalsAgainst: 28, goalDifference: 2, points: 32, form: "LDWDW" },
                        { position: 7, name: "Värnamo", played: 22, won: 8, drawn: 4, lost: 10, goalsFor: 26, goalsAgainst: 32, goalDifference: -6, points: 28, form: "WDLDL" },
                        { position: 8, name: "Norrköping", played: 22, won: 7, drawn: 3, lost: 12, goalsFor: 22, goalsAgainst: 38, goalDifference: -16, points: 24, form: "LLDLW" },
                        { position: 9, name: "Mjällby", played: 22, won: 6, drawn: 2, lost: 14, goalsFor: 18, goalsAgainst: 44, goalDifference: -26, points: 20, form: "LLWLL" },
                        { position: 10, name: "Sirius", played: 22, won: 4, drawn: 1, lost: 17, goalsFor: 16, goalsAgainst: 50, goalDifference: -34, points: 13, form: "LLLLL" }
                    ];
                    break;
                    
                case "DENMARK_SUPERLIGAEN":
                    fallbackTeams = [
                        { position: 1, name: "FC Copenhagen", played: 22, won: 15, drawn: 5, lost: 2, goalsFor: 48, goalsAgainst: 16, goalDifference: 32, points: 50, form: "WWWWW" },
                        { position: 2, name: "Brøndby IF", played: 22, won: 14, drawn: 4, lost: 4, goalsFor: 44, goalsAgainst: 20, goalDifference: 24, points: 46, form: "WWDWL" },
                        { position: 3, name: "Aarhus GI", played: 22, won: 13, drawn: 5, lost: 4, goalsFor: 40, goalsAgainst: 22, goalDifference: 18, points: 44, form: "WWDWD" },
                        { position: 4, name: "Odense BK", played: 22, won: 12, drawn: 4, lost: 6, goalsFor: 36, goalsAgainst: 24, goalDifference: 12, points: 40, form: "WDWDW" },
                        { position: 5, name: "Silkeborg IF", played: 22, won: 10, drawn: 6, lost: 6, goalsFor: 32, goalsAgainst: 28, goalDifference: 4, points: 36, form: "WDWDL" },
                        { position: 6, name: "Midtjylland", played: 22, won: 9, drawn: 5, lost: 8, goalsFor: 28, goalsAgainst: 30, goalDifference: -2, points: 32, form: "LDWDW" },
                        { position: 7, name: "Randers FK", played: 22, won: 8, drawn: 4, lost: 10, goalsFor: 24, goalsAgainst: 34, goalDifference: -10, points: 28, form: "WDLDL" },
                        { position: 8, name: "Sønderjyske", played: 22, won: 7, drawn: 3, lost: 12, goalsFor: 20, goalsAgainst: 40, goalDifference: -20, points: 24, form: "LLDLW" },
                        { position: 9, name: "Viborg FF", played: 22, won: 6, drawn: 2, lost: 14, goalsFor: 16, goalsAgainst: 46, goalDifference: -30, points: 20, form: "LLWLL" },
                        { position: 10, name: "Lolland-Falster", played: 22, won: 4, drawn: 1, lost: 17, goalsFor: 14, goalsAgainst: 52, goalDifference: -38, points: 13, form: "LLLLL" }
                    ];
                    break;

                case "GERMANY_BUNDESLIGA":
                    fallbackTeams = [
                        { position: 1, name: "Bayern Munich", played: 22, won: 16, drawn: 3, lost: 3, goalsFor: 52, goalsAgainst: 20, goalDifference: 32, points: 51, form: "WWWWW" },
                        { position: 2, name: "Borussia Dortmund", played: 22, won: 15, drawn: 2, lost: 5, goalsFor: 48, goalsAgainst: 24, goalDifference: 24, points: 47, form: "WWWDW" },
                        { position: 3, name: "Bayer Leverkusen", played: 22, won: 14, drawn: 3, lost: 5, goalsFor: 44, goalsAgainst: 22, goalDifference: 22, points: 45, form: "WWDWL" },
                        { position: 4, name: "RB Leipzig", played: 22, won: 13, drawn: 2, lost: 7, goalsFor: 42, goalsAgainst: 26, goalDifference: 16, points: 41, form: "WDWDW" },
                        { position: 5, name: "VfB Stuttgart", played: 22, won: 11, drawn: 4, lost: 7, goalsFor: 38, goalsAgainst: 28, goalDifference: 10, points: 37, form: "WDWDL" },
                        { position: 6, name: "VfL Wolfsburg", played: 22, won: 10, drawn: 3, lost: 9, goalsFor: 34, goalsAgainst: 32, goalDifference: 2, points: 33, form: "LDWDW" },
                        { position: 7, name: "FC Union Berlin", played: 22, won: 9, drawn: 3, lost: 10, goalsFor: 30, goalsAgainst: 34, goalDifference: -4, points: 30, form: "WDLDL" },
                        { position: 8, name: "Eintracht Frankfurt", played: 22, won: 8, drawn: 2, lost: 12, goalsFor: 26, goalsAgainst: 40, goalDifference: -14, points: 26, form: "LLDLW" },
                        { position: 9, name: "FC Cologne", played: 22, won: 6, drawn: 4, lost: 12, goalsFor: 22, goalsAgainst: 44, goalDifference: -22, points: 22, form: "LLWLL" },
                        { position: 10, name: "Mainz 05", played: 22, won: 5, drawn: 3, lost: 14, goalsFor: 18, goalsAgainst: 48, goalDifference: -30, points: 18, form: "LLLLL" }
                    ];
                    break;

                case "SPAIN_LA_LIGA":
                    fallbackTeams = [
                        { position: 1, name: "Real Madrid", played: 22, won: 16, drawn: 4, lost: 2, goalsFor: 52, goalsAgainst: 18, goalDifference: 34, points: 52, form: "WWWWW" },
                        { position: 2, name: "Barcelona", played: 22, won: 15, drawn: 3, lost: 4, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 48, form: "WWDWL" },
                        { position: 3, name: "Atlético Madrid", played: 22, won: 14, drawn: 5, lost: 3, goalsFor: 46, goalsAgainst: 20, goalDifference: 26, points: 47, form: "WWWWD" },
                        { position: 4, name: "Sevilla", played: 22, won: 12, drawn: 4, lost: 6, goalsFor: 40, goalsAgainst: 26, goalDifference: 14, points: 40, form: "WDWDW" },
                        { position: 5, name: "Real Betis", played: 22, won: 11, drawn: 3, lost: 8, goalsFor: 36, goalsAgainst: 30, goalDifference: 6, points: 36, form: "WDWDL" },
                        { position: 6, name: "Real Sociedad", played: 22, won: 10, drawn: 4, lost: 8, goalsFor: 32, goalsAgainst: 32, goalDifference: 0, points: 34, form: "LDWDW" },
                        { position: 7, name: "Valencia", played: 22, won: 9, drawn: 3, lost: 10, goalsFor: 28, goalsAgainst: 36, goalDifference: -8, points: 30, form: "WDLDL" },
                        { position: 8, name: "Villarreal", played: 22, won: 8, drawn: 2, lost: 12, goalsFor: 24, goalsAgainst: 40, goalDifference: -16, points: 26, form: "LLDLW" },
                        { position: 9, name: "Athletic Bilbao", played: 22, won: 7, drawn: 4, lost: 11, goalsFor: 22, goalsAgainst: 42, goalDifference: -20, points: 25, form: "LLWLL" },
                        { position: 10, name: "Rayo Vallecano", played: 22, won: 6, drawn: 2, lost: 14, goalsFor: 20, goalsAgainst: 46, goalDifference: -26, points: 20, form: "LLLLL" }
                    ];
                    break;

                case "ITALY_SERIE_A":
                    fallbackTeams = [
                        { position: 1, name: "Napoli", played: 22, won: 17, drawn: 2, lost: 3, goalsFor: 56, goalsAgainst: 18, goalDifference: 38, points: 53, form: "WWWWW" },
                        { position: 2, name: "Inter Milan", played: 22, won: 16, drawn: 3, lost: 3, goalsFor: 52, goalsAgainst: 20, goalDifference: 32, points: 51, form: "WWDWL" },
                        { position: 3, name: "Juventus", played: 22, won: 15, drawn: 4, lost: 3, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 49, form: "WWWWD" },
                        { position: 4, name: "AS Roma", played: 22, won: 13, drawn: 4, lost: 5, goalsFor: 44, goalsAgainst: 26, goalDifference: 18, points: 43, form: "WDWDW" },
                        { position: 5, name: "Lazio", played: 22, won: 12, drawn: 3, lost: 7, goalsFor: 40, goalsAgainst: 30, goalDifference: 10, points: 39, form: "WDWDL" },
                        { position: 6, name: "AC Milan", played: 22, won: 11, drawn: 2, lost: 9, goalsFor: 36, goalsAgainst: 34, goalDifference: 2, points: 35, form: "LDWDW" },
                        { position: 7, name: "Fiorentina", played: 22, won: 10, drawn: 2, lost: 10, goalsFor: 32, goalsAgainst: 38, goalDifference: -6, points: 32, form: "WDLDL" },
                        { position: 8, name: "Bologna", played: 22, won: 9, drawn: 1, lost: 12, goalsFor: 28, goalsAgainst: 42, goalDifference: -14, points: 28, form: "LLDLW" },
                        { position: 9, name: "Atalanta", played: 22, won: 8, drawn: 3, lost: 11, goalsFor: 26, goalsAgainst: 44, goalDifference: -18, points: 27, form: "LLWLL" },
                        { position: 10, name: "Torino", played: 22, won: 7, drawn: 2, lost: 13, goalsFor: 22, goalsAgainst: 48, goalDifference: -26, points: 23, form: "LLLLL" }
                    ];
                    break;

                case "FRANCE_LIGUE1":
                    fallbackTeams = [
                        { position: 1, name: "Paris Saint-Germain", played: 22, won: 17, drawn: 3, lost: 2, goalsFor: 58, goalsAgainst: 20, goalDifference: 38, points: 54, form: "WWWWW" },
                        { position: 2, name: "Marseille", played: 22, won: 15, drawn: 2, lost: 5, goalsFor: 50, goalsAgainst: 24, goalDifference: 26, points: 47, form: "WWDWL" },
                        { position: 3, name: "Monaco", played: 22, won: 14, drawn: 4, lost: 4, goalsFor: 48, goalsAgainst: 22, goalDifference: 26, points: 46, form: "WWWWD" },
                        { position: 4, name: "Lens", played: 22, won: 13, drawn: 2, lost: 7, goalsFor: 46, goalsAgainst: 28, goalDifference: 18, points: 41, form: "WDWDW" },
                        { position: 5, name: "Rennes", played: 22, won: 12, drawn: 3, lost: 7, goalsFor: 42, goalsAgainst: 32, goalDifference: 10, points: 39, form: "WDWDL" },
                        { position: 6, name: "Lille", played: 22, won: 11, drawn: 2, lost: 9, goalsFor: 38, goalsAgainst: 36, goalDifference: 2, points: 35, form: "LDWDW" },
                        { position: 7, name: "Lyon", played: 22, won: 10, drawn: 2, lost: 10, goalsFor: 34, goalsAgainst: 40, goalDifference: -6, points: 32, form: "WDLDL" },
                        { position: 8, name: "Brest", played: 22, won: 9, drawn: 1, lost: 12, goalsFor: 30, goalsAgainst: 44, goalDifference: -14, points: 28, form: "LLDLW" },
                        { position: 9, name: "Nantes", played: 22, won: 8, drawn: 3, lost: 11, goalsFor: 28, goalsAgainst: 46, goalDifference: -18, points: 27, form: "LLWLL" },
                        { position: 10, name: "Nice", played: 22, won: 7, drawn: 2, lost: 13, goalsFor: 24, goalsAgainst: 50, goalDifference: -26, points: 23, form: "LLLLL" }
                    ];
                    break;

                case "ENGLAND_PREMIER_LEAGUE":
                    fallbackTeams = [
                        { position: 1, name: "Manchester City", played: 22, won: 17, drawn: 2, lost: 3, goalsFor: 54, goalsAgainst: 18, goalDifference: 36, points: 53, form: "WWWWW" },
                        { position: 2, name: "Arsenal", played: 22, won: 16, drawn: 3, lost: 3, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 51, form: "WWDWL" },
                        { position: 3, name: "Liverpool", played: 22, won: 14, drawn: 4, lost: 4, goalsFor: 48, goalsAgainst: 24, goalDifference: 24, points: 46, form: "WWDWD" },
                        { position: 4, name: "Chelsea", played: 22, won: 13, drawn: 3, lost: 6, goalsFor: 44, goalsAgainst: 28, goalDifference: 16, points: 42, form: "WDWDW" },
                        { position: 5, name: "Newcastle United", played: 22, won: 12, drawn: 2, lost: 8, goalsFor: 40, goalsAgainst: 32, goalDifference: 8, points: 38, form: "WDWDL" },
                        { position: 6, name: "Manchester United", played: 22, won: 11, drawn: 2, lost: 9, goalsFor: 36, goalsAgainst: 36, goalDifference: 0, points: 35, form: "LDWDW" },
                        { position: 7, name: "Tottenham Hotspur", played: 22, won: 10, drawn: 2, lost: 10, goalsFor: 32, goalsAgainst: 40, goalDifference: -8, points: 32, form: "WDLDL" },
                        { position: 8, name: "Aston Villa", played: 22, won: 9, drawn: 1, lost: 12, goalsFor: 28, goalsAgainst: 44, goalDifference: -16, points: 28, form: "LLDLW" },
                        { position: 9, name: "Brighton", played: 22, won: 8, drawn: 3, lost: 11, goalsFor: 26, goalsAgainst: 46, goalDifference: -20, points: 27, form: "LLWLL" },
                        { position: 10, name: "West Ham United", played: 22, won: 7, drawn: 2, lost: 13, goalsFor: 22, goalsAgainst: 50, goalDifference: -28, points: 23, form: "LLLLL" }
                    ];
                    break;

                case "NETHERLANDS_EREDIVISIE":
                    fallbackTeams = [
                        { position: 1, name: "PSV Eindhoven", played: 22, won: 17, drawn: 2, lost: 3, goalsFor: 56, goalsAgainst: 20, goalDifference: 36, points: 53, form: "WWWWW" },
                        { position: 2, name: "Ajax", played: 22, won: 16, drawn: 3, lost: 3, goalsFor: 52, goalsAgainst: 22, goalDifference: 30, points: 51, form: "WWDWL" },
                        { position: 3, name: "Feyenoord", played: 22, won: 14, drawn: 4, lost: 4, goalsFor: 48, goalsAgainst: 24, goalDifference: 24, points: 46, form: "WWDWD" },
                        { position: 4, name: "AZ Alkmaar", played: 22, won: 12, drawn: 4, lost: 6, goalsFor: 42, goalsAgainst: 30, goalDifference: 12, points: 40, form: "WDWDW" },
                        { position: 5, name: "Utrecht", played: 22, won: 11, drawn: 3, lost: 8, goalsFor: 38, goalsAgainst: 34, goalDifference: 4, points: 36, form: "WDWDL" },
                        { position: 6, name: "Twente", played: 22, won: 10, drawn: 2, lost: 10, goalsFor: 34, goalsAgainst: 38, goalDifference: -4, points: 32, form: "LDWDW" },
                        { position: 7, name: "Groningen", played: 22, won: 9, drawn: 1, lost: 12, goalsFor: 30, goalsAgainst: 42, goalDifference: -12, points: 28, form: "WDLDL" },
                        { position: 8, name: "NEC Nijmegen", played: 22, won: 8, drawn: 0, lost: 14, goalsFor: 26, goalsAgainst: 46, goalDifference: -20, points: 24, form: "LLDLW" },
                        { position: 9, name: "Vitesse", played: 22, won: 7, drawn: 2, lost: 13, goalsFor: 24, goalsAgainst: 50, goalDifference: -26, points: 23, form: "LLWLL" },
                        { position: 10, name: "Fortuna Sittard", played: 22, won: 6, drawn: 1, lost: 15, goalsFor: 20, goalsAgainst: 54, goalDifference: -34, points: 19, form: "LLLLL" }
                    ];
                    break;

                case "BELGIUM_PRO_LEAGUE":
                    fallbackTeams = [
                        { position: 1, name: "Club Brugge", played: 22, won: 16, drawn: 4, lost: 2, goalsFor: 52, goalsAgainst: 18, goalDifference: 34, points: 52, form: "WWWWW" },
                        { position: 2, name: "Union Saint-Gilloise", played: 22, won: 15, drawn: 3, lost: 4, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 48, form: "WWDWL" },
                        { position: 3, name: "Anderlecht", played: 22, won: 14, drawn: 2, lost: 6, goalsFor: 46, goalsAgainst: 26, goalDifference: 20, points: 44, form: "WWDWD" },
                        { position: 4, name: "Standard Liege", played: 22, won: 12, drawn: 3, lost: 7, goalsFor: 40, goalsAgainst: 30, goalDifference: 10, points: 39, form: "WDWDW" },
                        { position: 5, name: "Genk", played: 22, won: 11, drawn: 2, lost: 9, goalsFor: 36, goalsAgainst: 34, goalDifference: 2, points: 35, form: "WDWDL" },
                        { position: 6, name: "Gent", played: 22, won: 10, drawn: 1, lost: 11, goalsFor: 32, goalsAgainst: 38, goalDifference: -6, points: 31, form: "LDWDW" },
                        { position: 7, name: "Cercle Brugge", played: 22, won: 9, drawn: 0, lost: 13, goalsFor: 28, goalsAgainst: 42, goalDifference: -14, points: 27, form: "WDLDL" },
                        { position: 8, name: "Mechelen", played: 22, won: 8, drawn: 2, lost: 12, goalsFor: 26, goalsAgainst: 46, goalDifference: -20, points: 26, form: "LLDLW" },
                        { position: 9, name: "Beerschot", played: 22, won: 7, drawn: 1, lost: 14, goalsFor: 22, goalsAgainst: 50, goalDifference: -28, points: 22, form: "LLWLL" },
                        { position: 10, name: "Eupen", played: 22, won: 6, drawn: 0, lost: 16, goalsFor: 18, goalsAgainst: 54, goalDifference: -36, points: 18, form: "LLLLL" }
                    ];
                    break;

                case "PORTUGAL_PRIMEIRA_LIGA":
                    fallbackTeams = [
                        { position: 1, name: "Benfica", played: 22, won: 17, drawn: 2, lost: 3, goalsFor: 56, goalsAgainst: 20, goalDifference: 36, points: 53, form: "WWWWW" },
                        { position: 2, name: "FC Porto", played: 22, won: 15, drawn: 4, lost: 3, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 49, form: "WWDWL" },
                        { position: 3, name: "Sporting CP", played: 22, won: 14, drawn: 3, lost: 5, goalsFor: 48, goalsAgainst: 26, goalDifference: 22, points: 45, form: "WWDWD" },
                        { position: 4, name: "Braga", played: 22, won: 12, drawn: 3, lost: 7, goalsFor: 42, goalsAgainst: 32, goalDifference: 10, points: 39, form: "WDWDW" },
                        { position: 5, name: "Vitória Setúbal", played: 22, won: 11, drawn: 2, lost: 9, goalsFor: 38, goalsAgainst: 36, goalDifference: 2, points: 35, form: "WDWDL" },
                        { position: 6, name: "Gil Vicente", played: 22, won: 10, drawn: 1, lost: 11, goalsFor: 34, goalsAgainst: 40, goalDifference: -6, points: 31, form: "LDWDW" },
                        { position: 7, name: "Arouca", played: 22, won: 9, drawn: 0, lost: 13, goalsFor: 30, goalsAgainst: 44, goalDifference: -14, points: 27, form: "WDLDL" },
                        { position: 8, name: "Boavista", played: 22, won: 8, drawn: 2, lost: 12, goalsFor: 28, goalsAgainst: 48, goalDifference: -20, points: 26, form: "LLDLW" },
                        { position: 9, name: "Santa Clara", played: 22, won: 7, drawn: 1, lost: 14, goalsFor: 24, goalsAgainst: 52, goalDifference: -28, points: 22, form: "LLWLL" },
                        { position: 10, name: "Estrela Amadora", played: 22, won: 6, drawn: 0, lost: 16, goalsFor: 20, goalsAgainst: 56, goalDifference: -36, points: 18, form: "LLLLL" }
                    ];
                    break;

                case "AUSTRIA_BUNDESLIGA":
                    fallbackTeams = [
                        { position: 1, name: "Red Bull Salzburg", played: 22, won: 16, drawn: 3, lost: 3, goalsFor: 52, goalsAgainst: 18, goalDifference: 34, points: 51, form: "WWWWW" },
                        { position: 2, name: "Sturm Graz", played: 22, won: 15, drawn: 2, lost: 5, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 47, form: "WWDWL" },
                        { position: 3, name: "LASK", played: 22, won: 13, drawn: 4, lost: 5, goalsFor: 44, goalsAgainst: 24, goalDifference: 20, points: 43, form: "WWDWD" },
                        { position: 4, name: "Rapid Vienna", played: 22, won: 12, drawn: 3, lost: 7, goalsFor: 40, goalsAgainst: 30, goalDifference: 10, points: 39, form: "WDWDW" },
                        { position: 5, name: "Austria Vienna", played: 22, won: 11, drawn: 2, lost: 9, goalsFor: 36, goalsAgainst: 34, goalDifference: 2, points: 35, form: "WDWDL" },
                        { position: 6, name: "Hartberg", played: 22, won: 10, drawn: 1, lost: 11, goalsFor: 32, goalsAgainst: 38, goalDifference: -6, points: 31, form: "LDWDW" },
                        { position: 7, name: "Wolfsberger AC", played: 22, won: 9, drawn: 0, lost: 13, goalsFor: 28, goalsAgainst: 42, goalDifference: -14, points: 27, form: "WDLDL" },
                        { position: 8, name: "Ried", played: 22, won: 8, drawn: 2, lost: 12, goalsFor: 26, goalsAgainst: 46, goalDifference: -20, points: 26, form: "LLDLW" },
                        { position: 9, name: "Klagenfurt", played: 22, won: 7, drawn: 1, lost: 14, goalsFor: 22, goalsAgainst: 50, goalDifference: -28, points: 22, form: "LLWLL" },
                        { position: 10, name: "Admira Wacker", played: 22, won: 6, drawn: 0, lost: 16, goalsFor: 18, goalsAgainst: 54, goalDifference: -36, points: 18, form: "LLLLL" }
                    ];
                    break;

                case "SWITZERLAND_SUPER_LEAGUE":
                    fallbackTeams = [
                        { position: 1, name: "FC Zurich", played: 22, won: 16, drawn: 3, lost: 3, goalsFor: 52, goalsAgainst: 18, goalDifference: 34, points: 51, form: "WWWWW" },
                        { position: 2, name: "FC Basel", played: 22, won: 15, drawn: 2, lost: 5, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 47, form: "WWDWL" },
                        { position: 3, name: "Young Boys", played: 22, won: 14, drawn: 3, lost: 5, goalsFor: 48, goalsAgainst: 24, goalDifference: 24, points: 45, form: "WWDWD" },
                        { position: 4, name: "Lugano", played: 22, won: 12, drawn: 3, lost: 7, goalsFor: 42, goalsAgainst: 30, goalDifference: 12, points: 39, form: "WDWDW" },
                        { position: 5, name: "Grasshoppers", played: 22, won: 11, drawn: 2, lost: 9, goalsFor: 38, goalsAgainst: 34, goalDifference: 4, points: 35, form: "WDWDL" },
                        { position: 6, name: "St. Gallen", played: 22, won: 10, drawn: 1, lost: 11, goalsFor: 34, goalsAgainst: 38, goalDifference: -4, points: 31, form: "LDWDW" },
                        { position: 7, name: "Servette", played: 22, won: 9, drawn: 0, lost: 13, goalsFor: 30, goalsAgainst: 42, goalDifference: -12, points: 27, form: "WDLDL" },
                        { position: 8, name: "Lausanne-Sport", played: 22, won: 8, drawn: 2, lost: 12, goalsFor: 28, goalsAgainst: 46, goalDifference: -18, points: 26, form: "LLDLW" },
                        { position: 9, name: "Luzern", played: 22, won: 7, drawn: 1, lost: 14, goalsFor: 24, goalsAgainst: 50, goalDifference: -26, points: 22, form: "LLWLL" },
                        { position: 10, name: "Sion", played: 22, won: 6, drawn: 0, lost: 16, goalsFor: 20, goalsAgainst: 54, goalDifference: -34, points: 18, form: "LLLLL" }
                    ];
                    break;

                case "CZECH_LIGA":
                    fallbackTeams = [
                        { position: 1, name: "Sparta Prague", played: 22, won: 17, drawn: 2, lost: 3, goalsFor: 56, goalsAgainst: 18, goalDifference: 38, points: 53, form: "WWWWW" },
                        { position: 2, name: "Slavia Prague", played: 22, won: 16, drawn: 1, lost: 5, goalsFor: 52, goalsAgainst: 22, goalDifference: 30, points: 49, form: "WWDWL" },
                        { position: 3, name: "Viktoria Plzeň", played: 22, won: 14, drawn: 3, lost: 5, goalsFor: 48, goalsAgainst: 24, goalDifference: 24, points: 45, form: "WWDWD" },
                        { position: 4, name: "Mladá Boleslav", played: 22, won: 13, drawn: 2, lost: 7, goalsFor: 44, goalsAgainst: 28, goalDifference: 16, points: 41, form: "WDWDW" },
                        { position: 5, name: "Jablonec", played: 22, won: 12, drawn: 1, lost: 9, goalsFor: 40, goalsAgainst: 32, goalDifference: 8, points: 37, form: "WDWDL" },
                        { position: 6, name: "Sigma Olomouc", played: 22, won: 11, drawn: 0, lost: 11, goalsFor: 36, goalsAgainst: 36, goalDifference: 0, points: 33, form: "LDWDW" },
                        { position: 7, name: "Baník Ostrava", played: 22, won: 10, drawn: 1, lost: 11, goalsFor: 32, goalsAgainst: 40, goalDifference: -8, points: 31, form: "WDLDL" },
                        { position: 8, name: "Slovácko", played: 22, won: 9, drawn: 0, lost: 13, goalsFor: 28, goalsAgainst: 44, goalDifference: -16, points: 27, form: "LLDLW" },
                        { position: 9, name: "Bohemians 1905", played: 22, won: 8, drawn: 2, lost: 12, goalsFor: 26, goalsAgainst: 48, goalDifference: -22, points: 26, form: "LLWLL" },
                        { position: 10, name: "Liberec", played: 22, won: 7, drawn: 0, lost: 15, goalsFor: 22, goalsAgainst: 52, goalDifference: -30, points: 21, form: "LLLLL" }
                    ];
                    break;

                case "POLAND_EKSTRAKLASA":
                    fallbackTeams = [
                        { position: 1, name: "Legia Warsaw", played: 22, won: 17, drawn: 2, lost: 3, goalsFor: 56, goalsAgainst: 20, goalDifference: 36, points: 53, form: "WWWWW" },
                        { position: 2, name: "Cracovia", played: 22, won: 15, drawn: 3, lost: 4, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 48, form: "WWDWL" },
                        { position: 3, name: "Jagiellonia Białystok", played: 22, won: 14, drawn: 2, lost: 6, goalsFor: 48, goalsAgainst: 26, goalDifference: 22, points: 44, form: "WWDWD" },
                        { position: 4, name: "Widzew Łódź", played: 22, won: 13, drawn: 1, lost: 8, goalsFor: 44, goalsAgainst: 30, goalDifference: 14, points: 40, form: "WDWDW" },
                        { position: 5, name: "Piast Gliwice", played: 22, won: 12, drawn: 0, lost: 10, goalsFor: 40, goalsAgainst: 34, goalDifference: 6, points: 36, form: "WDWDL" },
                        { position: 6, name: "Wisła Kraków", played: 22, won: 11, drawn: 1, lost: 10, goalsFor: 36, goalsAgainst: 38, goalDifference: -2, points: 34, form: "LDWDW" },
                        { position: 7, name: "Radomiak Radom", played: 22, won: 10, drawn: 1, lost: 11, goalsFor: 32, goalsAgainst: 42, goalDifference: -10, points: 31, form: "WDLDL" },
                        { position: 8, name: "Pogon Szczecin", played: 22, won: 9, drawn: 0, lost: 13, goalsFor: 28, goalsAgainst: 46, goalDifference: -18, points: 27, form: "LLDLW" },
                        { position: 9, name: "Lech Poznań", played: 22, won: 8, drawn: 2, lost: 12, goalsFor: 26, goalsAgainst: 50, goalDifference: -24, points: 26, form: "LLWLL" },
                        { position: 10, name: "Lechia Gdańsk", played: 22, won: 7, drawn: 1, lost: 14, goalsFor: 22, goalsAgainst: 54, goalDifference: -32, points: 22, form: "LLLLL" }
                    ];
                    break;

                case "HUNGARY_NBI":
                    fallbackTeams = [
                        { position: 1, name: "Ferencváros", played: 22, won: 17, drawn: 2, lost: 3, goalsFor: 56, goalsAgainst: 20, goalDifference: 36, points: 53, form: "WWWWW" },
                        { position: 2, name: "Debrecen", played: 22, won: 15, drawn: 3, lost: 4, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 48, form: "WWDWL" },
                        { position: 3, name: "Fehérvár", played: 22, won: 14, drawn: 2, lost: 6, goalsFor: 48, goalsAgainst: 26, goalDifference: 22, points: 44, form: "WWDWD" },
                        { position: 4, name: "Diósgyőr", played: 22, won: 13, drawn: 1, lost: 8, goalsFor: 44, goalsAgainst: 30, goalDifference: 14, points: 40, form: "WDWDW" },
                        { position: 5, name: "Paks", played: 22, won: 12, drawn: 0, lost: 10, goalsFor: 40, goalsAgainst: 34, goalDifference: 6, points: 36, form: "WDWDL" },
                        { position: 6, name: "Kisvárda", played: 22, won: 11, drawn: 1, lost: 10, goalsFor: 36, goalsAgainst: 38, goalDifference: -2, points: 34, form: "LDWDW" },
                        { position: 7, name: "Ujpest", played: 22, won: 10, drawn: 0, lost: 12, goalsFor: 32, goalsAgainst: 42, goalDifference: -10, points: 30, form: "WDLDL" },
                        { position: 8, name: "Szombathely", played: 22, won: 9, drawn: 1, lost: 12, goalsFor: 28, goalsAgainst: 46, goalDifference: -18, points: 28, form: "LLDLW" },
                        { position: 9, name: "Kecskemét", played: 22, won: 8, drawn: 1, lost: 13, goalsFor: 26, goalsAgainst: 50, goalDifference: -24, points: 25, form: "LLWLL" },
                        { position: 10, name: "Nyíregyháza", played: 22, won: 7, drawn: 0, lost: 15, goalsFor: 22, goalsAgainst: 54, goalDifference: -32, points: 21, form: "LLLLL" }
                    ];
                    break;

                case "ROMANIA_LIGA_I":
                    fallbackTeams = [
                        { position: 1, name: "FCSB", played: 22, won: 17, drawn: 2, lost: 3, goalsFor: 56, goalsAgainst: 20, goalDifference: 36, points: 53, form: "WWWWW" },
                        { position: 2, name: "CFR Cluj", played: 22, won: 15, drawn: 3, lost: 4, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 48, form: "WWDWL" },
                        { position: 3, name: "Dinamo Bucuresti", played: 22, won: 14, drawn: 2, lost: 6, goalsFor: 48, goalsAgainst: 26, goalDifference: 22, points: 44, form: "WWDWD" },
                        { position: 4, name: "Rapid Bucuresti", played: 22, won: 13, drawn: 1, lost: 8, goalsFor: 44, goalsAgainst: 30, goalDifference: 14, points: 40, form: "WDWDW" },
                        { position: 5, name: "UTA Arad", played: 22, won: 12, drawn: 0, lost: 10, goalsFor: 40, goalsAgainst: 34, goalDifference: 6, points: 36, form: "WDWDL" },
                        { position: 6, name: "Sepsi OSK", played: 22, won: 11, drawn: 1, lost: 10, goalsFor: 36, goalsAgainst: 38, goalDifference: -2, points: 34, form: "LDWDW" },
                        { position: 7, name: "Hermannstadt", played: 22, won: 10, drawn: 0, lost: 12, goalsFor: 32, goalsAgainst: 42, goalDifference: -10, points: 30, form: "WDLDL" },
                        { position: 8, name: "Otelul Galati", played: 22, won: 9, drawn: 1, lost: 12, goalsFor: 28, goalsAgainst: 46, goalDifference: -18, points: 28, form: "LLDLW" },
                        { position: 9, name: "Politehnica Iasi", played: 22, won: 8, drawn: 1, lost: 13, goalsFor: 26, goalsAgainst: 50, goalDifference: -24, points: 25, form: "LLWLL" },
                        { position: 10, name: "Voluntari", played: 22, won: 7, drawn: 0, lost: 15, goalsFor: 22, goalsAgainst: 54, goalDifference: -32, points: 21, form: "LLLLL" }
                    ];
                    break;

                case "UKRAINE_PREMIER_LEAGUE":
                    fallbackTeams = [
                        { position: 1, name: "Shakhtar Donetsk", played: 22, won: 17, drawn: 2, lost: 3, goalsFor: 56, goalsAgainst: 20, goalDifference: 36, points: 53, form: "WWWWW" },
                        { position: 2, name: "Dynamo Kyiv", played: 22, won: 15, drawn: 3, lost: 4, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 48, form: "WWDWL" },
                        { position: 3, name: "Zorya Luhansk", played: 22, won: 14, drawn: 2, lost: 6, goalsFor: 48, goalsAgainst: 26, goalDifference: 22, points: 44, form: "WWDWD" },
                        { position: 4, name: "Vorskla Poltava", played: 22, won: 13, drawn: 1, lost: 8, goalsFor: 44, goalsAgainst: 30, goalDifference: 14, points: 40, form: "WDWDW" },
                        { position: 5, name: "Oleksandriya", played: 22, won: 12, drawn: 0, lost: 10, goalsFor: 40, goalsAgainst: 34, goalDifference: 6, points: 36, form: "WDWDL" },
                        { position: 6, name: "Metalist Kharkiv", played: 22, won: 11, drawn: 1, lost: 10, goalsFor: 36, goalsAgainst: 38, goalDifference: -2, points: 34, form: "LDWDW" },
                        { position: 7, name: "Karpaty Lviv", played: 22, won: 10, drawn: 0, lost: 12, goalsFor: 32, goalsAgainst: 42, goalDifference: -10, points: 30, form: "WDLDL" },
                        { position: 8, name: "Kolos Kovalivka", played: 22, won: 9, drawn: 1, lost: 12, goalsFor: 28, goalsAgainst: 46, goalDifference: -18, points: 28, form: "LLDLW" },
                        { position: 9, name: "Polissya Zhytomyr", played: 22, won: 8, drawn: 1, lost: 13, goalsFor: 26, goalsAgainst: 50, goalDifference: -24, points: 25, form: "LLWLL" },
                        { position: 10, name: "Veres Rivne", played: 22, won: 7, drawn: 0, lost: 15, goalsFor: 22, goalsAgainst: 54, goalDifference: -32, points: 21, form: "LLLLL" }
                    ];
                    break;

                case "GREECE_SUPER_LEAGUE":
                    fallbackTeams = [
                        { position: 1, name: "Olympiacos", played: 22, won: 17, drawn: 2, lost: 3, goalsFor: 56, goalsAgainst: 20, goalDifference: 36, points: 53, form: "WWWWW" },
                        { position: 2, name: "PAOK", played: 22, won: 15, drawn: 3, lost: 4, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 48, form: "WWDWL" },
                        { position: 3, name: "AEK Athens", played: 22, won: 14, drawn: 2, lost: 6, goalsFor: 48, goalsAgainst: 26, goalDifference: 22, points: 44, form: "WWDWD" },
                        { position: 4, name: "Panathinaikos", played: 22, won: 13, drawn: 1, lost: 8, goalsFor: 44, goalsAgainst: 30, goalDifference: 14, points: 40, form: "WDWDW" },
                        { position: 5, name: "Aris Thessaloniki", played: 22, won: 12, drawn: 0, lost: 10, goalsFor: 40, goalsAgainst: 34, goalDifference: 6, points: 36, form: "WDWDL" },
                        { position: 6, name: "Asteras Tripolis", played: 22, won: 11, drawn: 1, lost: 10, goalsFor: 36, goalsAgainst: 38, goalDifference: -2, points: 34, form: "LDWDW" },
                        { position: 7, name: "Volos", played: 22, won: 10, drawn: 0, lost: 12, goalsFor: 32, goalsAgainst: 42, goalDifference: -10, points: 30, form: "WDLDL" },
                        { position: 8, name: "Kallithea", played: 22, won: 9, drawn: 1, lost: 12, goalsFor: 28, goalsAgainst: 46, goalDifference: -18, points: 28, form: "LLDLW" },
                        { position: 9, name: "Lamia", played: 22, won: 8, drawn: 1, lost: 13, goalsFor: 26, goalsAgainst: 50, goalDifference: -24, points: 25, form: "LLWLL" },
                        { position: 10, name: "OFI Crete", played: 22, won: 7, drawn: 0, lost: 15, goalsFor: 22, goalsAgainst: 54, goalDifference: -32, points: 21, form: "LLLLL" }
                    ];
                    break;

                case "TURKEY_SUPER_LIG":
                    fallbackTeams = [
                        { position: 1, name: "Galatasaray", played: 22, won: 17, drawn: 2, lost: 3, goalsFor: 56, goalsAgainst: 20, goalDifference: 36, points: 53, form: "WWWWW" },
                        { position: 2, name: "Fenerbahçe", played: 22, won: 15, drawn: 3, lost: 4, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 48, form: "WWDWL" },
                        { position: 3, name: "Beşiktaş", played: 22, won: 14, drawn: 2, lost: 6, goalsFor: 48, goalsAgainst: 26, goalDifference: 22, points: 44, form: "WWDWD" },
                        { position: 4, name: "Trabzonspor", played: 22, won: 13, drawn: 1, lost: 8, goalsFor: 44, goalsAgainst: 30, goalDifference: 14, points: 40, form: "WDWDW" },
                        { position: 5, name: "Kayserispor", played: 22, won: 12, drawn: 0, lost: 10, goalsFor: 40, goalsAgainst: 34, goalDifference: 6, points: 36, form: "WDWDL" },
                        { position: 6, name: "Konyaspor", played: 22, won: 11, drawn: 1, lost: 10, goalsFor: 36, goalsAgainst: 38, goalDifference: -2, points: 34, form: "LDWDW" },
                        { position: 7, name: "Gaziantep FK", played: 22, won: 10, drawn: 0, lost: 12, goalsFor: 32, goalsAgainst: 42, goalDifference: -10, points: 30, form: "WDLDL" },
                        { position: 8, name: "Sivasspor", played: 22, won: 9, drawn: 1, lost: 12, goalsFor: 28, goalsAgainst: 46, goalDifference: -18, points: 28, form: "LLDLW" },
                        { position: 9, name: "Alanyaspor", played: 22, won: 8, drawn: 1, lost: 13, goalsFor: 26, goalsAgainst: 50, goalDifference: -24, points: 25, form: "LLWLL" },
                        { position: 10, name: "Antalyaspor", played: 22, won: 7, drawn: 0, lost: 15, goalsFor: 22, goalsAgainst: 54, goalDifference: -32, points: 21, form: "LLLLL" }
                    ];
                    break;

                case "SERBIA_SUPER_LIGA":
                    fallbackTeams = [
                        { position: 1, name: "Red Star Belgrade", played: 22, won: 17, drawn: 2, lost: 3, goalsFor: 56, goalsAgainst: 20, goalDifference: 36, points: 53, form: "WWWWW" },
                        { position: 2, name: "Partizan Belgrade", played: 22, won: 15, drawn: 3, lost: 4, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 48, form: "WWDWL" },
                        { position: 3, name: "Voždovac", played: 22, won: 14, drawn: 2, lost: 6, goalsFor: 48, goalsAgainst: 26, goalDifference: 22, points: 44, form: "WWDWD" },
                        { position: 4, name: "Radnički Belgrade", played: 22, won: 13, drawn: 1, lost: 8, goalsFor: 44, goalsAgainst: 30, goalDifference: 14, points: 40, form: "WDWDW" },
                        { position: 5, name: "FK Voždovac", played: 22, won: 12, drawn: 0, lost: 10, goalsFor: 40, goalsAgainst: 34, goalDifference: 6, points: 36, form: "WDWDL" },
                        { position: 6, name: "Štarci Sabac", played: 22, won: 11, drawn: 1, lost: 10, goalsFor: 36, goalsAgainst: 38, goalDifference: -2, points: 34, form: "LDWDW" },
                        { position: 7, name: "FK Čukarički", played: 22, won: 10, drawn: 0, lost: 12, goalsFor: 32, goalsAgainst: 42, goalDifference: -10, points: 30, form: "WDLDL" },
                        { position: 8, name: "FK Vojvodina", played: 22, won: 9, drawn: 1, lost: 12, goalsFor: 28, goalsAgainst: 46, goalDifference: -18, points: 28, form: "LLDLW" },
                        { position: 9, name: "FK Proleter", played: 22, won: 8, drawn: 1, lost: 13, goalsFor: 26, goalsAgainst: 50, goalDifference: -24, points: 25, form: "LLWLL" },
                        { position: 10, name: "FK Radnik", played: 22, won: 7, drawn: 0, lost: 15, goalsFor: 22, goalsAgainst: 54, goalDifference: -32, points: 21, form: "LLLLL" }
                    ];
                    break;

                case "CROATIA_HNL":
                    fallbackTeams = [
                        { position: 1, name: "Dinamo Zagreb", played: 22, won: 17, drawn: 2, lost: 3, goalsFor: 56, goalsAgainst: 20, goalDifference: 36, points: 53, form: "WWWWW" },
                        { position: 2, name: "Hajduk Split", played: 22, won: 15, drawn: 3, lost: 4, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 48, form: "WWDWL" },
                        { position: 3, name: "Rijeka", played: 22, won: 14, drawn: 2, lost: 6, goalsFor: 48, goalsAgainst: 26, goalDifference: 22, points: 44, form: "WWDWD" },
                        { position: 4, name: "Osijek", played: 22, won: 13, drawn: 1, lost: 8, goalsFor: 44, goalsAgainst: 30, goalDifference: 14, points: 40, form: "WDWDW" },
                        { position: 5, name: "Lokomotiva Zagreb", played: 22, won: 12, drawn: 0, lost: 10, goalsFor: 40, goalsAgainst: 34, goalDifference: 6, points: 36, form: "WDWDL" },
                        { position: 6, name: "Slaven Belupo", played: 22, won: 11, drawn: 1, lost: 10, goalsFor: 36, goalsAgainst: 38, goalDifference: -2, points: 34, form: "LDWDW" },
                        { position: 7, name: "Istra 1961", played: 22, won: 10, drawn: 0, lost: 12, goalsFor: 32, goalsAgainst: 42, goalDifference: -10, points: 30, form: "WDLDL" },
                        { position: 8, name: "Sibenik", played: 22, won: 9, drawn: 1, lost: 12, goalsFor: 28, goalsAgainst: 46, goalDifference: -18, points: 28, form: "LLDLW" },
                        { position: 9, name: "NK Varazdin", played: 22, won: 8, drawn: 1, lost: 13, goalsFor: 26, goalsAgainst: 50, goalDifference: -24, points: 25, form: "LLWLL" },
                        { position: 10, name: "Gorica", played: 22, won: 7, drawn: 0, lost: 15, goalsFor: 22, goalsAgainst: 54, goalDifference: -32, points: 21, form: "LLLLL" }
                    ];
                    break;

                case "ENGLAND_CHAMPIONSHIP":
                    fallbackTeams = [
                        { position: 1, name: "Leeds United", played: 22, won: 16, drawn: 3, lost: 3, goalsFor: 52, goalsAgainst: 18, goalDifference: 34, points: 51, form: "WWWWW" },
                        { position: 2, name: "Norwich City", played: 22, won: 15, drawn: 2, lost: 5, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 47, form: "WWDWL" },
                        { position: 3, name: "Leicester City", played: 22, won: 14, drawn: 3, lost: 5, goalsFor: 48, goalsAgainst: 24, goalDifference: 24, points: 45, form: "WWDWD" },
                        { position: 4, name: "Coventry City", played: 22, won: 13, drawn: 2, lost: 7, goalsFor: 44, goalsAgainst: 28, goalDifference: 16, points: 41, form: "WDWDW" },
                        { position: 5, name: "Ipswich Town", played: 22, won: 12, drawn: 1, lost: 9, goalsFor: 40, goalsAgainst: 32, goalDifference: 8, points: 37, form: "WDWDL" },
                        { position: 6, name: "Watford", played: 22, won: 11, drawn: 0, lost: 11, goalsFor: 36, goalsAgainst: 36, goalDifference: 0, points: 33, form: "LDWDW" },
                        { position: 7, name: "Burnley", played: 22, won: 10, drawn: 1, lost: 11, goalsFor: 32, goalsAgainst: 40, goalDifference: -8, points: 31, form: "WDLDL" },
                        { position: 8, name: "West Bromwich Albion", played: 22, won: 9, drawn: 0, lost: 13, goalsFor: 28, goalsAgainst: 44, goalDifference: -16, points: 27, form: "LLDLW" },
                        { position: 9, name: "Bristol City", played: 22, won: 8, drawn: 2, lost: 12, goalsFor: 26, goalsAgainst: 48, goalDifference: -22, points: 26, form: "LLWLL" },
                        { position: 10, name: "Huddersfield Town", played: 22, won: 7, drawn: 1, lost: 14, goalsFor: 22, goalsAgainst: 52, goalDifference: -30, points: 22, form: "LLLLL" }
                    ];
                    break;

                case "SCOTLAND_CHAMPIONSHIP":
                    fallbackTeams = [
                        { position: 1, name: "Partick Thistle", played: 22, won: 16, drawn: 3, lost: 3, goalsFor: 52, goalsAgainst: 18, goalDifference: 34, points: 51, form: "WWWWW" },
                        { position: 2, name: "Falkirk", played: 22, won: 15, drawn: 2, lost: 5, goalsFor: 50, goalsAgainst: 22, goalDifference: 28, points: 47, form: "WWDWL" },
                        { position: 3, name: "Dunfermline Athletic", played: 22, won: 14, drawn: 3, lost: 5, goalsFor: 48, goalsAgainst: 24, goalDifference: 24, points: 45, form: "WWDWD" },
                        { position: 4, name: "Raith Rovers", played: 22, won: 13, drawn: 2, lost: 7, goalsFor: 44, goalsAgainst: 28, goalDifference: 16, points: 41, form: "WDWDW" },
                        { position: 5, name: "Queen's Park", played: 22, won: 12, drawn: 1, lost: 9, goalsFor: 40, goalsAgainst: 32, goalDifference: 8, points: 37, form: "WDWDL" },
                        { position: 6, name: "Greenock Morton", played: 22, won: 11, drawn: 0, lost: 11, goalsFor: 36, goalsAgainst: 36, goalDifference: 0, points: 33, form: "LDWDW" },
                        { position: 7, name: "Arbroath", played: 22, won: 10, drawn: 1, lost: 11, goalsFor: 32, goalsAgainst: 40, goalDifference: -8, points: 31, form: "WDLDL" },
                        { position: 8, name: "Ayr United", played: 22, won: 9, drawn: 0, lost: 13, goalsFor: 28, goalsAgainst: 44, goalDifference: -16, points: 27, form: "LLDLW" },
                        { position: 9, name: "Airdrieonians", played: 22, won: 8, drawn: 2, lost: 12, goalsFor: 26, goalsAgainst: 48, goalDifference: -22, points: 26, form: "LLWLL" },
                        { position: 10, name: "Stenhousemuir", played: 22, won: 7, drawn: 1, lost: 14, goalsFor: 22, goalsAgainst: 52, goalDifference: -30, points: 22, form: "LLLLL" }
                    ];
                    break;
                    
                default:
                    // Default fallback if league type is unknown
                    fallbackTeams = [
                        { position: 1, name: "Team 1", played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 0, goalDifference: 6, points: 6, form: "WW" },
                        { position: 2, name: "Team 2", played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 3, goalsAgainst: 1, goalDifference: 2, points: 4, form: "WD" },
                        { position: 3, name: "Team 3", played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 2, goalDifference: 0, points: 3, form: "WL" },
                        { position: 4, name: "Team 4", played: 2, won: 0, drawn: 1, lost: 1, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 1, form: "DL" }
                    ];
            }

            console.log(` MMM-MyTeams-LeagueTable: Using fallback data for ${leagueType} due to parsing issues`);
            
            return {
                teams: fallbackTeams,
                lastUpdated: new Date().toISOString(),
                source: `Fallback Data (${leagueType})`,
                note: `Live data parsing failed for ${leagueType}, showing sample data`,
                leagueType: leagueType
            };

        } catch (error) {
            throw new Error(`Failed to generate fallback data for ${leagueType}: ${error.message}`);
        }
    },

    // Start periodic cache cleanup (every 6 hours)
    startCacheCleanup: function() {
        const cleanupInterval = 6 * 60 * 60 * 1000; // 6 hours
        setInterval(() => {
            const deleted = this.cache.cleanupExpired();
            if (deleted > 0) {
                console.log(` MMM-MyTeams-LeagueTable: Automatic cache cleanup removed ${deleted} expired entries`);
            }
        }, cleanupInterval);
        
        if (this.config && this.config.debug) {
            console.log(` MMM-MyTeams-LeagueTable: Cache cleanup scheduled every 6 hours`);
        }
    },

    // Clean up team name
    cleanTeamName: function(name) {
        return name
            .replace(/^\d+\s*/, "") // Remove leading position numbers
            .replace(/\s+/g, " ") // Normalize whitespace
            .trim();
    }
});