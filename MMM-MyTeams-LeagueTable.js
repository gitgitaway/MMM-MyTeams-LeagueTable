/* MagicMirror²
 * Module:  MMM-MyTeams-LeagueTable
 * 
 * By: Assistantz
 * MIT Licensed.
 * 
 * This module displays football league standings from various competitions
 * sourced from BBC Sport website, including SPFL, UEFA Champions League,
 * UEFA Europa League, and UEFA Europa Conference League.
 */

Module.register("MMM-MyTeams-LeagueTable", {
    // Default module config
    defaults: {
        updateInterval: 30 * 60 * 1000, // Update every 30 minutes (in milliseconds)
        retryDelay: 15000, // Retry delay on error (15 seconds)
        maxRetries: 3, // Maximum number of retries before giving up
        animationSpeed: 2000, // Animation speed for updates
        maxTableHeight: 550, // Max height (px) for the scroll container
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
        showForm: false, // Show recent form tokens
        formMaxGames: 5, // Max number of form games to display (pads with "-" if fewer)
        maxTeams: 16, // Maximum number of teams to display (0 = all)
        highlightTeams: [], // Array of team names to highlight
        fadeSpeed: 4000, // Fade animation speed
        colored: true, // Use colored styling for different positions
        debug: false, // Enable debug logging
        
        // League options
        showSPFL: true, // Show Scottish Premier League
        showUCL: false, // Show UEFA Champions League
        showUEL: true, // Show UEFA Europa League
        showECL: false, // Show UEFA Europa Conference League
        showEPL: false, // Show English Premier League
        showSPFLC: false, // Show Scottish Championship
        
        // Auto-cycling options
        autoCycle: false, // Enable auto-cycling between leagues
        cycleInterval: 15 * 1000, // Time to display each league (15 seconds)
        
        // League headers
        leagueHeaders: {
            "SPFL": "SPFL Premiership",
            "UCL": "UEFA Champions League",
            "UEL": "UEFA Europa League",
            "ECL": "UEFA Europa Conference League",
            "EPL": "English Premier League",
            "SPFLC": "Scottish Championship"
        }
    },

    // Required version of MagicMirror
    requiresVersion: "2.1.0",

    // Module startup
    start: function() {
        Log.info("Starting module: " + this.name);
        
        // Initialize variables
        this.leagueData = {
            SPFL: null,
            UCL: null,
            UEL: null,
            ECL: null,
            EPL: null,
            SPFLC: null
        };
        this.loaded = {
            SPFL: false,
            UCL: false,
            UEL: false,
            ECL: false,
            EPL: false,
            SPFLC: false
        };
        this.error = null;
        this.retryCount = 0;
        this.currentLeague = "SPFL"; // Default to SPFL
        this.isScrolling = false;
        
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
    
    // Request data for all enabled leagues
    requestAllLeagueData: function() {
        if (this.config.showSPFL) {
            this.sendSocketNotification("GET_LEAGUE_DATA", {
                ...this.config,
                leagueType: "SPFL",
                url: "https://www.bbc.co.uk/sport/football/scottish-premiership/table"
            });
        }
        
        if (this.config.showSPFLC) {
            this.sendSocketNotification("GET_LEAGUE_DATA", {
                ...this.config,
                leagueType: "SPFLC",
                url: "https://www.bbc.co.uk/sport/football/scottish-championship/table"
            });
        }
        
        if (this.config.showEPL) {
            this.sendSocketNotification("GET_LEAGUE_DATA", {
                ...this.config,
                leagueType: "EPL",
                url: "https://www.bbc.co.uk/sport/football/premier-league/table"
            });
        }
        
        if (this.config.showUCL) {
            this.sendSocketNotification("GET_LEAGUE_DATA", {
                ...this.config,
                leagueType: "UCL",
                url: "https://www.bbc.co.uk/sport/football/champions-league/table"
            });
        }
        
        if (this.config.showUEL) {
            this.sendSocketNotification("GET_LEAGUE_DATA", {
                ...this.config,
                leagueType: "UEL",
                url: "https://www.bbc.co.uk/sport/football/europa-league/table"
            });
        }

        if (this.config.showECL) {
            this.sendSocketNotification("GET_LEAGUE_DATA", {
                ...this.config,
                leagueType: "ECL",
                url: "https://www.bbc.co.uk/sport/football/europa-conference-league/table"
            });
        }
    },
    
    // Set up auto-cycling between leagues with smooth transitions
    scheduleCycling: function() {
        var self = this;
        
        // Clear any existing timer
        if (this.cycleTimer) {
            clearInterval(this.cycleTimer);
            this.cycleTimer = null;
        }
        
        // Create array of enabled leagues in a fixed known order
        this.enabledLeagues = [];
        const knownLeagues = ["SPFL","SPFLC","UCL","UEL","ECL","EPL"];
        knownLeagues.forEach((lk) => {
            if (this.config["show" + lk]) {
                this.enabledLeagues.push(lk);
            }
        });
        
        // Only set up cycling if we have more than one league
        if (this.enabledLeagues.length > 1) {
            // Create a cycling function that will be called at regular intervals
            const cycleFn = function() {
                if (self.config.debug) {
                    Log.info(" MMM-MyTeams-LeagueTable: Running cycle function");
                }
                
                // Find current and next league
                let currentIndex = self.enabledLeagues.indexOf(self.currentLeague);
                if (currentIndex === -1) {
                    // If current league not found in enabled leagues, reset to first league
                    currentIndex = 0;
                    self.currentLeague = self.enabledLeagues[0];
                }
                
                let nextIndex = (currentIndex + 1) % self.enabledLeagues.length;
                let nextLeague = self.enabledLeagues[nextIndex];
                
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
        const backToTopBtn = root ? root.querySelector(".back-to-top-btn") : null;
        
        if (tableContainer && backToTopBtn) {
            if (tableContainer.scrollTop > 30) {
                backToTopBtn.classList.add("visible");
                this.isScrolling = true;
            } else {
                backToTopBtn.classList.remove("visible");
                this.isScrolling = false;
            }
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
        
        // Create a mapping of league keys to their display properties
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
        
        headerContainer.appendChild(buttonsContainer);
        wrapper.appendChild(headerContainer);
        
        // Create back to top button (initially hidden)
        var backToTopBtn = document.createElement("button");
        backToTopBtn.className = "back-to-top-btn";
        backToTopBtn.innerHTML = "↑ Back to Top";
        backToTopBtn.addEventListener("click", this.handleBackToTopClick.bind(this));
        wrapper.appendChild(backToTopBtn);
        
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
            contentContainer.appendChild(this.createTable(currentData));
        } else {
            if (this.config.debug) {
                Log.info(" MMM-MyTeams-LeagueTable: No league data available for " + this.currentLeague + ", payload: " + JSON.stringify(currentData || {}));
            }
            contentContainer.textContent = "No league data available for " + this.currentLeague;
            contentContainer.className += " dimmed light small";
        }
        
        wrapper.appendChild(contentContainer);
        
        // Set up scroll event listener and initialize visibility
        setTimeout(() => {
            const tableContainer = wrapper.querySelector(".league-content-container");
            if (tableContainer) {
                tableContainer.addEventListener("scroll", () => {
                    this.updateScrollButtons();
                });
            }
            // Initialize back-to-top visibility
            this.updateScrollButtons();
            // Compute dynamic team name width
            this.updateTeamNameColumnWidth();
        }, 100);
        
        return wrapper;
    },

    // Create the league table
    createTable: function(leagueData) {
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
    }
});
