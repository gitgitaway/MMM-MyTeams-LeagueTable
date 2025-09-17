/* MagicMirror²
 * Module:  MMM-MyTeams-LeagueTable
 * 
 * By: Assistantz
 * MIT Licensed.
 * 
 * This module displays the current SPFL (Scottish Professional Football League) standings
 * sourced from BBC Sport website.
 */

Module.register("MMM-MyTeams-LeagueTable", {
    // Default module config
    defaults: {
        updateInterval: 30 * 60 * 1000, // Update every 30 minutes (in milliseconds)
        retryDelay: 15000, // Retry delay on error (15 seconds)
        maxRetries: 3, // Maximum number of retries before giving up
        animationSpeed: 2000, // Animation speed for updates
        showPosition: true, // Show position numbers
        showTeamLogos: true, // Show team logos (requires additional setup)
        teamLogoMap: {}, // Optional mapping: { "Hearts": "heart-of-midlothian.png" }
        showPoints: true, // Show points column
        showGoalDifference: true, // Show goal difference
        showPlayedGames: true, // Show games played
        showWon: true, // Show won games
        showDrawn: true, // Show drawn games
        showLost: true, // Show lost games
        showGoalsFor: true, // Show goals for
        showGoalsAgainst: true, // Show goals against
        showForm: false, // Show recent form (last 5 games)
        maxTeams: 12, // Maximum number of teams to display (0 = all)
        highlightTeams: [], // Array of team names to highlight
        //tableHeader: "SPFL Premiership", // Header text for the table not needed
        fadeSpeed: 4000, // Fade animation speed
        colored: true, // Use colored styling for different positions
        debug: true // Enable debug logging
    },

    // Required version of MagicMirror
    requiresVersion: "2.1.0",

    // Module startup
    start: function() {
        Log.info("Starting module: " + this.name);
        
        // Initialize variables
        this.leagueData = null;
        this.loaded = false;
        this.error = null;
        this.retryCount = 0;
        
        // Send initial request for data
        this.sendSocketNotification("GET_LEAGUE_DATA", this.config);
        
        // Set up periodic updates
        this.scheduleUpdate();
        
        if (this.config.debug) {
            Log.info(" MMM-MyTeams-LeagueTable: Module started with config:", this.config);
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
            self.sendSocketNotification("GET_LEAGUE_DATA", self.config);
            self.scheduleUpdate();
        }, this.config.updateInterval);
        
        if (this.config.debug) {
            Log.info(" MMM-MyTeams-LeagueTable: Next update scheduled in " + (this.config.updateInterval / 1000) + " seconds");
        }
    },

    // Handle notifications from node_helper
    socketNotificationReceived: function(notification, payload) {
        if (this.config.debug) {
            Log.info(" MMM-MyTeams-LeagueTable: Received notification:", notification);
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
            Log.info(" MMM-MyTeams-LeagueTable: Processing league data:", data);
        }
        
        this.leagueData = data;
        this.loaded = true;
        this.error = null;
        this.retryCount = 0;
        
        // Update the display
        this.updateDom(this.config.animationSpeed);
    },

    // Process error from data fetch
    processError: function(error) {
        Log.error(" MMM-MyTeams-LeagueTable: Error fetching data:", error);
        
        this.error = error;
        this.retryCount++;
        
        // Retry if we haven't exceeded max retries
        if (this.retryCount <= this.config.maxRetries) {
            var self = this;
            setTimeout(function() {
                if (self.config.debug) {
                    Log.info(" MMM-MyTeams-LeagueTable: Retrying data fetch (attempt " + self.retryCount + ")");
                }
                self.sendSocketNotification("GET_LEAGUE_DATA", self.config);
            }, this.config.retryDelay);
        } else {
            Log.error(" MMM-MyTeams-LeagueTable: Max retries exceeded, giving up");
            this.updateDom(this.config.animationSpeed);
        }
    },

    // Generate the DOM content
    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.className = "spfl-league-table";
        
        // Show loading message if data not loaded yet
        if (!this.loaded && !this.error) {
            wrapper.innerHTML = this.translate("LOADING");
            wrapper.className += " dimmed light small";
            return wrapper;
        }
        
        // Show error message if there's an error and max retries exceeded
        if (this.error && this.retryCount > this.config.maxRetries) {
            wrapper.innerHTML = this.translate("ERROR") + ": " + this.error.message;
            wrapper.className += " dimmed light small";
            return wrapper;
        }
        
        // Show retry message if retrying
        if (this.error && this.retryCount <= this.config.maxRetries) {
            wrapper.innerHTML = this.translate("RETRYING") + " (" + this.retryCount + "/" + this.config.maxRetries + ")";
            wrapper.className += " dimmed light small";
            return wrapper;
        }
        
        // Create the table
        if (this.leagueData && this.leagueData.teams) {
            if (this.config.debug) {
                Log.info(" MMM-MyTeams-LeagueTable: Creating table with " + this.leagueData.teams.length + " teams");
            }
            wrapper.appendChild(this.createTable());
        } else {
            if (this.config.debug) {
                Log.info(" MMM-MyTeams-LeagueTable: No league data available", this.leagueData);
            }
            wrapper.innerHTML = "No league data available";
            wrapper.className += " dimmed light small";
        }
        
        return wrapper;
    },

    // Create the league table
    createTable: function() {
        var table = document.createElement("table");
        table.className = "small spfl-table";
        
        // Create header
        if (this.config.tableHeader) {
            var header = document.createElement("caption");
            header.innerHTML = this.config.tableHeader;
            header.className = "spfl-header";
            table.appendChild(header);
        }
        
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
        var teamsToShow = this.leagueData.teams;
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
                posCell.innerHTML = team.position;
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
                // Resolve logo filename candidates: mapping override -> slug.svg -> slug.png
                var mapped = (this.config.teamLogoMap && this.config.teamLogoMap[team.name]) || null;
                var slug = (team.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                var candidates = [];
                if (mapped) candidates.push(mapped);
                candidates.push(slug + ".svg");
                candidates.push(slug + ".png");

                var basePath = "modules/MMM-MyTeams-LeagueTable/images/";
                var tryIndex = 0;
                function tryNext(imgEl) {
                    if (tryIndex >= candidates.length) {
                        imgEl.onerror = null;
                        imgEl.remove();
                        return;
                    }
                    imgEl.src = basePath + candidates[tryIndex++];
                }
                img.onerror = function () { tryNext(this); };
                tryNext(img);
                // If all fail, image will be removed by onerror handler
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
                playedCell.innerHTML = team.played || "-";
                playedCell.className = "played-cell";
                row.appendChild(playedCell);
            }
            
            // Won cell
            if (this.config.showWon) {
                var wonCell = document.createElement("td");
                wonCell.innerHTML = team.won || "-";
                wonCell.className = "won-cell";
                row.appendChild(wonCell);
            }
            
            // Drawn cell
            if (this.config.showDrawn) {
                var drawnCell = document.createElement("td");
                drawnCell.innerHTML = team.drawn || "-";
                drawnCell.className = "drawn-cell";
                row.appendChild(drawnCell);
            }
            
            // Lost cell
            if (this.config.showLost) {
                var lostCell = document.createElement("td");
                lostCell.innerHTML = team.lost || "-";
                lostCell.className = "lost-cell";
                row.appendChild(lostCell);
            }
            
            // Goals For cell
            if (this.config.showGoalsFor) {
                var gfCell = document.createElement("td");
                gfCell.innerHTML = team.goalsFor || "-";
                gfCell.className = "gf-cell";
                row.appendChild(gfCell);
            }
            
            // Goals Against cell
            if (this.config.showGoalsAgainst) {
                var gaCell = document.createElement("td");
                gaCell.innerHTML = team.goalsAgainst || "-";
                gaCell.className = "ga-cell";
                row.appendChild(gaCell);
            }
            
            // Goal difference cell
            if (this.config.showGoalDifference) {
                var gdCell = document.createElement("td");
                var gd = team.goalDifference;
                gdCell.innerHTML = gd > 0 ? "+" + gd : gd;
                gdCell.className = "gd-cell";
                if (gd > 0) gdCell.className += " positive";
                else if (gd < 0) gdCell.className += " negative";
                row.appendChild(gdCell);
            }
            
            // Points cell
            if (this.config.showPoints) {
                var pointsCell = document.createElement("td");
                pointsCell.innerHTML = team.points;
                pointsCell.className = "points-cell";
                row.appendChild(pointsCell);
            }
            
            // Form cell
            if (this.config.showForm) {
                var formCell = document.createElement("td");
                formCell.className = "form-cell";
                var container = document.createElement("div");
                container.className = "form-tokens";
                var formStr = (team.form || "").toString().trim().toUpperCase();
                if (formStr.length === 0) {
                    container.textContent = "-";
                } else {
                    for (var i = 0; i < formStr.length; i++) {
                        var ch = formStr.charAt(i);
                        var span = document.createElement("span");
                        if (ch === "W") { span.className = "form-win"; span.textContent = "W"; }
                        else if (ch === "D") { span.className = "form-draw"; span.textContent = "D"; }
                        else if (ch === "L") { span.className = "form-loss"; span.textContent = "L"; }
                        else { span.textContent = ch; }
                        container.appendChild(span);
                    }
                }
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
        var src = (this.leagueData && this.leagueData.source) ? this.leagueData.source : "Unknown";
        var ts = (this.leagueData && this.leagueData.lastUpdated) ? new Date(this.leagueData.lastUpdated).toLocaleString() : new Date().toLocaleString();
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
        return {
            en: "translations/en.json",
            de: "translations/de.json",
            es: "translations/es.json",
            fr: "translations/fr.json"
        };
    },

    // Clean up on suspend
    suspend: function() {
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
        }
    },

    // Resume updates
    resume: function() {
        this.scheduleUpdate();
        this.sendSocketNotification("GET_LEAGUE_DATA", this.config);
    }
});