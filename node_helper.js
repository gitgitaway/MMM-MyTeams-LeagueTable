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

module.exports = NodeHelper.create({
    
    // Node helper started
    start: function() {
    console.log("Starting node helper for: MMM-MyTeams-LeagueTable");
    this.config = null;
    
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
        }
    },

    // Main function to fetch league data
    fetchLeagueData: function(url, leagueType) {
        const self = this;
        
        if (this.config && this.config.debug) {
        console.log(` MMM-MyTeams-LeagueTable: Fetching ${leagueType} data from ${url}...`);
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
                    // Add the league type to the response
                    leagueData.leagueType = leagueType;
                    this.sendSocketNotification("LEAGUE_DATA", leagueData);
                })
                .catch(error => {
                    console.error(` MMM-MyTeams-LeagueTable: Error fetching ${leagueType} data:`, error);
                    this.sendSocketNotification("FETCH_ERROR", {
                        message: error.message,
                        code: error.code || "UNKNOWN_ERROR",
                        leagueType: leagueType
                    });
                });
        } catch (error) {
            console.error(` MMM-MyTeams-LeagueTable: Unexpected error for ${leagueType}:`, error);
            this.sendSocketNotification("FETCH_ERROR", {
                message: error.message,
                code: "UNEXPECTED_ERROR",
                leagueType: leagueType
            });
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
            if (testIdMatch) {
                // Convert kebab-case to proper team name
                teamName = testIdMatch[1]
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                
                // Handle special cases
                if (teamName === "Heart Of Midlothian") teamName = "Hearts";
                if (teamName === "St Mirren") teamName = "St. Mirren";
                // No need to remap Dundee United -> Dundee United
            } else {
                // Fallback: look for team name in link
                const teamLinkMatch = rowHtml.match(/<a[^>]*>([^<]+)<\/a>/);
                if (teamLinkMatch) {
                    teamName = teamLinkMatch[1].trim();
                }
            }
            
            if (!teamName || teamName.length < 2) {
                if (this.config && this.config.debug) {
                    console.log(" MMM-MyTeams-LeagueTable: Could not extract team name from row");
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

    // Clean up team name
    cleanTeamName: function(name) {
        return name
            .replace(/^\d+\s*/, "") // Remove leading position numbers
            .replace(/\s+/g, " ") // Normalize whitespace
            .trim();
    }
});