/* MagicMirror²
 * Node Helper:  MMM-MyTeams-LeagueTable
 * 
 * By: Assistant
 * MIT Licensed.
 * 
 * This node helper fetches SPFL league data from BBC Sport website
 * and processes it for display in the MagicMirror module.
 */

const NodeHelper = require("node_helper");
const https = require("https");
const http = require("http");
const { URL } = require("url");

module.exports = NodeHelper.create({
    
    // Node helper started
    start: function() {
        console.log("Starting node helper for:  MMM-MyTeams-LeagueTable");
        this.config = null;
    },

    // Handle socket notifications from the module
    socketNotificationReceived: function(notification, payload) {
        if (notification === "GET_LEAGUE_DATA") {
            this.config = payload;
            this.fetchLeagueData();
        }
    },

    // Main function to fetch league data
    fetchLeagueData: function() {
        const self = this;
        
        if (this.config.debug) {
            console.log(" MMM-MyTeams-LeagueTable: Fetching league data...");
        }

        // BBC Sport SPFL table URL
        const url = "https://www.bbc.co.uk/sport/football/scottish-premiership/table";
        
        try {
            this.fetchWebPage(url)
                .then(html => {
                    if (this.config.debug) {
                        console.log(" MMM-MyTeams-LeagueTable: Successfully fetched webpage");
                    }
                    return this.parseLeagueData(html);
                })
                .then(leagueData => {
                    if (this.config.debug) {
                        console.log(" MMM-MyTeams-LeagueTable: Parsed league data:", leagueData);
                    }
                    this.sendSocketNotification("LEAGUE_DATA", leagueData);
                })
                .catch(error => {
                    console.error(" MMM-MyTeams-LeagueTable: Error fetching data:", error);
                    this.sendSocketNotification("FETCH_ERROR", {
                        message: error.message,
                        code: error.code || "UNKNOWN_ERROR"
                    });
                });
        } catch (error) {
            console.error(" MMM-MyTeams-LeagueTable: Unexpected error:", error);
            this.sendSocketNotification("FETCH_ERROR", {
                message: error.message,
                code: "UNEXPECTED_ERROR"
            });
        }
    },

    // Fetch webpage content
    fetchWebPage: function(url) {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const protocol = parsedUrl.protocol === "https:" ? https : http;
            
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port,
                path: parsedUrl.pathname + parsedUrl.search,
                method: "GET",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Accept-Encoding": "gzip, deflate",
                    "Connection": "keep-alive",
                    "Upgrade-Insecure-Requests": "1"
                },
                timeout: 10000 // 10 second timeout
            };

            const req = protocol.request(options, (res) => {
                let data = "";
                
                // Handle different status codes
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    return;
                }

                // Handle gzip encoding
                let stream = res;
                if (res.headers["content-encoding"] === "gzip") {
                    const zlib = require("zlib");
                    stream = res.pipe(zlib.createGunzip());
                }

                stream.on("data", (chunk) => {
                    data += chunk;
                });

                stream.on("end", () => {
                    resolve(data);
                });

                stream.on("error", (error) => {
                    reject(error);
                });
            });

            req.on("error", (error) => {
                reject(error);
            });

            req.on("timeout", () => {
                req.destroy();
                reject(new Error("Request timeout"));
            });

            req.setTimeout(10000);
            req.end();
        });
    },

    // Parse league data from HTML
    parseLeagueData: function(html) {
        try {
            const teams = [];
            
            if (this.config.debug) {
                console.log(" MMM-MyTeams-LeagueTable: Starting to parse HTML data");
            }
            
            // Look for table data in the HTML - BBC uses specific table structure
            const tableRegex = /<table[^>]*>(.*?)<\/table>/gis;
            const tableMatch = html.match(tableRegex);
            
            if (!tableMatch) {
                if (this.config.debug) {
                    console.log(" MMM-MyTeams-LeagueTable: No table found, trying alternative parsing");
                }
                return this.parseAlternativeFormat(html);
            }

            const tableHtml = tableMatch[0];
            
            // Extract table rows
            const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
            const rows = tableHtml.match(rowRegex);
            
            if (!rows || rows.length < 2) {
                if (this.config.debug) {
                    console.log(" MMM-MyTeams-LeagueTable: Insufficient table rows found");
                }
                return this.parseAlternativeFormat(html);
            }

            if (this.config.debug) {
                console.log(" MMM-MyTeams-LeagueTable: Found " + rows.length + " table rows");
            }

            // Skip header row and process data rows
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const team = this.parseTeamRow(row, i);
                
                if (team) {
                    teams.push(team);
                    if (this.config.debug) {
                        console.log(" MMM-MyTeams-LeagueTable: Parsed team:", team);
                    }
                }
            }

            if (teams.length === 0) {
                if (this.config.debug) {
                    console.log(" MMM-MyTeams-LeagueTable: No Teams parsed, using fallback");
                }
                return this.parseAlternativeFormat(html);
            }

            return {
                teams: teams,
                lastUpdated: new Date().toISOString(),
                source: "BBC Sport"
            };

        } catch (error) {
            console.error(" MMM-MyTeams-LeagueTable: Error parsing league data:", error);
            if (this.config.debug) {
                console.log(" MMM-MyTeams-LeagueTable: Using fallback due to parsing error");
            }
            return this.parseAlternativeFormat(html);
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
                if (teamName === "Dundee United") teamName = "Dundee United";
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
            const spanCellRegex = /<td[^>]*aria-label="([^"]*)"[^>]*><span[^>]*>(\d+)<\/span><\/td>/g;
            let match;
            while ((match = spanCellRegex.exec(rowHtml)) !== null) {
                cellData[match[1]] = parseInt(match[2]);
            }
            
            // Then try the direct content format (for other stats)
            const directCellRegex = /<td[^>]*aria-label="([^"]*)"[^>]*>(\d+)<\/td>/g;
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

            const team = {
                position: actualPosition,
                name: teamName,
                played: cellData['Played'] || 0,
                won: cellData['Won'] || 0,
                drawn: cellData['Drawn'] || 0,
                lost: cellData['Lost'] || 0,
                goalsFor: cellData['Goals For'] || 0,
                goalsAgainst: cellData['Goals Against'] || 0,
                goalDifference: cellData['Goal Difference'] || 0,
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
    parseAlternativeFormat: function(html) {
        try {
            // Current SPFL Teams based on 2025-26 season - fallback data
            // This ensures the module works even if parsing fails
            const fallbackTeams = [
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

            console.log(" MMM-MyTeams-LeagueTable: Using fallback data due to parsing issues");
            
            return {
                teams: fallbackTeams,
                lastUpdated: new Date().toISOString(),
                source: "Fallback Data (Current Season)",
                note: "Live data parsing failed, showing current season sample data"
            };

        } catch (error) {
            throw new Error("Failed to generate fallback data: " + error.message);
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