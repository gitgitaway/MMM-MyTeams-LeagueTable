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
       updateInterval: 30 * 60 * 1000,              // How often to refresh (ms) – default: 30 min
				retryDelay: 15000,                           // Delay between retry attempts after an error (ms)
				maxRetries: 3,                               // Stop retrying after this many failures
				animationSpeed: 2000,                        // DOM update animation speed (ms)
				fadeSpeed: 4000,                             // Fade animation speed (ms)
				colored: true,                               // Color rows by standing (top/UEFA/relegation)
				maxTeams: 36,    							 // 0 = show all teams
				highlightTeams: ["Celtic", "Hearts"],        // Emphasize teams by exact name
				scrollable: true,                            // Enable vertical scrolling if max height exceeded
				
				// League toggles - set true to show, false to hide
				showSPFL: true,                              // Show Scottish Premiership
				showSPFLC: true,      			             // Show Scottish Premiership
				showEPL: true,                               // Show English Premier League                          // Show Scottish Championship                          // Show Scottish Premier League
				showUCL: true,                               // Show UEFA Champions League
				showUEL: true,                               // Show UEFA Europa League
				showECL: false,                              // Show UEFA Europa Conference League
				
				// Show League Data                         showPosition: true, 
				showPosition: true,                         // Show table position
				showTeamLogos: true, // Show team logos
				showPlayedGames: true,
				showWon: true,
				showDrawn: true,
				showLost: true,
				showGoalsFor: true,
				showGoalsAgainst: true,
				showGoalDifference: true,
				showPoints: true,
				showForm: true,                            // Show recent form tokens (W/D/L)
				formMaxGames: 5, // Max number of form games to display (pads with "-" if fewer)
	
				// Auto-cycling options
				autoCycle: false,                            // Enable auto-cycling between leagues
				cycleInterval: 15 * 1000,                   // Time to display each league (15 seconds)
				
				//Map club names to image files
				// Maps team names (as fetched from BBC Sport) to their corresponding logo image files
				// Format: "Team Name": "filename.png"
				// If no logo exists, uses "placeholder.svg" (a question mark icon)
				teamLogoMap: {
					// Scottish Premiership (SPFL)
					"Hearts": "heart-of-midlothian.png",
					"Celtic": "celtic.png",
					"Rangers": "rangers.png",
					"Aberdeen": "aberdeen.png",
					"Hibernian": "hibernian.png",
					"Kilmarnock": "kilmarnock.png",
					"Dundee": "dundee.png",
					"Dundee United": "dundee-united.png",
					"Motherwell": "motherwell.png",
					"Ross County": "ross-county.png",
					"St Mirren": "st-mirren.png",
					"St. Mirren": "st-mirren.png",
					"St Johnstone": "st-johnstone.png",
					"Livingston": "livingston.png",
					
					// Scottish Championship (SPFLC)
					"Falkirk": "falkirk.png",
					"Ayr United": "ayr-united.png",
					"Partick Thistle": "partick-thistle.png",
					"Raith Rovers": "raith-rovers.png",
					"Dunfermline Athletic": "dunfermline-athletic.png",
					"Queen's Park": "queens-park.png",
					"Queens Park": "queens-park.png",
					"Greenock Morton": "greenock-morton.png",
					"Airdrieonians": "airdrieonians.png",
					"Arbroath": "arbroath.png",
					
					// English Premier League (EPL)
					"Arsenal": "arsenal.png",
					"Aston Villa": "aston-villa.png",
					"Brighton": "brighton-and-hove-albion.png",
					"Brighton & Hove Albion": "brighton-and-hove-albion.png",
					"Brighton And Hove Albion": "brighton-and-hove-albion.png",
					"Chelsea": "chelsea.png",
					"Crystal Palace": "crystal-palace.png",
					"Everton": "everton.png",
					"Fulham": "fulham.png",
					"Leicester City": "leicester-city.png",
					"Liverpool": "liverpool.png",
					"Manchester City": "manchester-city.png",
					"Man City": "manchester-city.png",
					"Manchester United": "manchester-united.png",
					"Man Utd": "manchester-united.png",
					"Newcastle United": "newcastle-united.png",
					"Newcastle": "newcastle-united.png",
					"Nottingham Forest": "nottingham-forest.png",
					"Southampton": "southampton.png",
					"Tottenham Hotspur": "tottenham-hotspur.png",
					"Tottenham": "tottenham-hotspur.png",
					"West Ham United": "west-ham-united.png",
					"West Ham": "west-ham-united.png",
					"Ipswich Town": "placeholder.svg",
					"Bournemouth": "placeholder.svg",
					"Brentford": "placeholder.svg",
					"Wolves": "placeholder.svg",
					"Wolverhampton": "placeholder.svg",
					
					// UEFA Champions League (UCL)
					"AC Milan": "ac-milan.png",
					"Ac Milan": "ac-milan.png",
					"Ajax": "ajax.png",
					"Atalanta": "atalanta.png",
					"Atlético Madrid": "atlético-madrid.png",
					"Atletico Madrid": "atlético-madrid.png",
					"Barcelona": "barcelona.png",
					"Bayern Munich": "bayern-munich.png",
					"Bayern": "bayern-munich.png",
					"Benfica": "benfica.png",
					"Bologna": "bologna.png",
					"Borussia Dortmund": "borussia-dortmund.png",
					"Dortmund": "borussia-dortmund.png",
					"Brest": "brest.png",
					"Club Brugge": "club-brugge.png",
					"Crvena Zvezda": "crvena-zvezda.png",
					"Red Star Belgrade": "crvena-zvezda.png",
					"Dinamo Zagreb": "dinamo-zagreb.png",
					"Feyenoord": "feyenoord.png",
					"Girona": "girona.png",
					"Inter Milan": "inter-milan.png",
					"Inter": "inter-milan.png",
					"Internazionale": "inter-milan.png",
					"Juventus": "juventus.png",
					"Lille": "lille.png",
					"Liverpool": "liverpool.png",
					"Manchester City": "manchester-city.png",
					"Monaco": "monaco.png",
					"Paris St Germain": "paris-sg.png",
					"Paris SG": "paris-sg.png",
					"Paris Saint Germain": "paris-sg.png",
					"Paris Saint-Germain": "paris-sg.png",
					"PSG": "paris-sg.png",
					"PSV Eindhoven": "psv-eindhoven.png",
					"PSV": "psv-eindhoven.png",
					"Qarabag": "qarabağ.png",
					"Qarabağ": "qarabağ.png",
					"RB Leipzig": "rb-leipzig.png",
					"Leipzig": "rb-leipzig.png",
					"Real Madrid": "real-madrid.png",
					"Salzburg": "red-bull-salzburg.png",
					"Red Bull Salzburg": "red-bull-salzburg.png",
					"Shakhtar Donetsk": "shakhtar-donetsk.png",
					"Shakhtar": "shakhtar-donetsk.png",
					"Slovan Bratislava": "slovan-bratislava.png",
					"Sparta Prague": "sparta-prague.png",
					"Sparta Praha": "sparta-prague.png",
					"Sporting CP": "sporting-cp.png",
					"Sporting Lisbon": "sporting-cp.png",
					"Sporting": "sporting-cp.png",
					"Sturm Graz": "sturm-graz.png",
					"Stuttgart": "stuttgart.png",
					"Young Boys": "young-boys.png",
					"Bayer Leverkusen": "bayer-leverkusen.png",
					"Leverkusen": "bayer-leverkusen.png",
					"Aston Villa": "aston-villa.png",
					"Marseille": "placeholder.svg",
					"Olympique Marseille": "placeholder.svg",
					"Napoli": "placeholder.svg",
					"SSC Napoli": "placeholder.svg",
					"Villarreal": "placeholder.svg",
					"Villarreal CF": "placeholder.svg",
					"FC Copenhagen": "placeholder.svg",
					"Copenhagen": "placeholder.svg",
					"Kobenhavn": "placeholder.svg",
					"Kairat": "placeholder.svg",
					"FC Kairat": "placeholder.svg",
					
					// UEFA Europa League (UEL)
					"Ajax": "ajax.png",
					"Anderlecht": "anderlecht.png",
					"Athletic Bilbao": "athletic-bilbao.png",
					"Athletic Club": "athletic-bilbao.png",
					"AZ Alkmaar": "az-alkmaar.png",
					"AZ": "az-alkmaar.png",
					"Beşiktaş": "beşiktaş.png",
					"Besiktas": "beşiktaş.png",
					"Bodø/Glimt": "bodøglimt.png",
					"Bodø Glimt": "bodøglimt.png",
					"Bodo/Glimt": "bodøglimt.png",
					"Bodo Glimt": "bodøglimt.png",
					"Braga": "braga.png",
					"Dynamo Kyiv": "dynamo-kyiv.png",
					"Dynamo Kiev": "dynamo-kyiv.png",
					"Eintracht Frankfurt": "eintracht-frankfurt.png",
					"Frankfurt": "eintracht-frankfurt.png",
					"Elfsborg": "elfsborg.png",
					"Fenerbahçe": "fenerbahçe.png",
					"Fenerbahce": "fenerbahçe.png",
					"Ferencváros": "ferencváros.png",
					"Ferencvaros": "ferencváros.png",
					"FCSB": "fcsb.png",
					"Galatasaray": "galatasaray.png",
					"Hoffenheim": "hoffenheim.png",
					"Lazio": "lazio.png",
					"Ludogorets": "placeholder.svg",
					"Lyon": "lyon.png",
					"Maccabi Tel Aviv": "maccabi-tel-aviv.png",
					"M. Tel Aviv": "maccabi-tel-aviv.png",
					"M. Tel-Aviv": "maccabi-tel-aviv.png",
					"Malmö": "malmö-redhawks.png",
					"Malmo": "malmö-redhawks.png",
					"Manchester United": "manchester-united.png",
					"Man Utd": "manchester-united.png",
					"Midtjylland": "fc-midtjylland.png",
					"FC Midtjylland": "fc-midtjylland.png",
					"Nice": "nice.png",
					"Olympiacos": "olympiacos.png",
					"Olympiakos": "olympiacos.png",
					"Olympiacos Piraeus": "olympiacos.png",
					"Olympiakos Piraeus": "olympiacos.png",
					"PAOK": "paok.png",
					"Porto": "fc-porto.png",
					"FC Porto": "fc-porto.png",
					"Qarabağ": "qarabağ.png",
					"Qarabag": "qarabağ.png",
					"Rangers": "rangers.png",
					"Real Sociedad": "real-sociedad.png",
					"Roma": "roma.png",
					"AS Roma": "roma.png",
					"Slavia Prague": "slavia-prague.png",
					"Slavia Praha": "slavia-prague.png",
					"Tottenham Hotspur": "tottenham-hotspur.png",
					"Tottenham": "tottenham-hotspur.png",
					"Twente": "twente.png",
					"FC Twente": "twente.png",
					"Union SG": "placeholder.svg",
					"Union St Gilloise": "placeholder.svg",
					"Union Saint Gilloise": "placeholder.svg",
					"Viktoria Plzeň": "viktoria-plzeň.png",
					"Viktoria Plzen": "viktoria-plzeň.png",
					
					// UEFA Europa Conference League (ECL)
					"Borac Banja Luka": "borac-banja-luka.png",
					"Borac": "borac-banja-luka.png",
					"Celje": "celje.png",
					"Chelsea": "chelsea.png",
					"Cercle Brugge": "cercle-brugge.png",
					"Dinamo Minsk": "dinamo-minsk.png",
					"Fiorentina": "fiorentina.png",
					"Gent": "gent.png",
					"HJK Helsinki": "hjk-helsinki.png",
					"HJK": "hjk-helsinki.png",
					"Istanbul Başakşehir": "istanbul-başakşehir.png",
					"Istanbul Basaksehir": "istanbul-başakşehir.png",
					"Başakşehir": "istanbul-başakşehir.png",
					"Larne": "larne.png",
					"LASK": "lask.png",
					"Legia Warsaw": "legia-warsaw.png",
					"Legia": "legia-warsaw.png",
					"Lugano": "lugano.png",
					"Mladá Boleslav": "mladá-boleslav.png",
					"Mlada Boleslav": "mladá-boleslav.png",
					"Molde": "molde.png",
					"Noah": "noah.png",
					"Olimpija Ljubljana": "olimpija-ljubljana.png",
					"Olimpija": "olimpija-ljubljana.png",
					"Pafos": "pafos.png",
					"Panathinaikos": "panathinaikos.png",
					"Rapid Vienna": "rapid-vienna.png",
					"Rapid Wien": "rapid-vienna.png",
					"Real Betis": "real-betis.png",
					"Betis": "real-betis.png",
					"RFS": "rfs.png",
					"Shamrock Rovers": "shamrock-rovers.png",
					"St Gallen": "st-gallen.png",
					"St. Gallen": "st-gallen.png",
					"The New Saints": "the-new-saints.png",
					"TNS": "the-new-saints.png",
					
					// Additional teams that may appear
					"Bristol City": "bristol-city.png",
					"Portsmouth": "portsmouth.png",
					"Swansea City": "swansea-city.png",
					"Swansea": "swansea-city.png",
					"West Bromwich Albion": "west-bromwich-albion.png",
					"West Brom": "west-bromwich-albion.png"
				},
				
				// League headers
				leagueHeaders: {
				"SPFL": "SPFL Premiership",
				"UCL": "UEFA Champions League",
				"UEL": "UEFA Europa League",
				"ECL": "UEFA Europa Conference League",
				"EPL": "English Premier League",
				"SPFLC": "Scottish Championship"
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
                // Resolve logo filename candidates: mapping override -> slug.svg -> slug.png -> placeholder.svg
                var mapped = (this.config.teamLogoMap && this.config.teamLogoMap[team.name]) || null;
                var slug = (team.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                var candidates = [];
                if (mapped) candidates.push(mapped);
                candidates.push(slug + ".svg");
                candidates.push(slug + ".png");
                candidates.push("placeholder.svg"); // Final fallback to placeholder

                var basePath = "modules/MMM-MyTeams-LeagueTable/images/";
                var tryIndex = 0;
                function tryNext(imgEl) {
                    if (tryIndex >= candidates.length) {
                        // All candidates failed including placeholder, remove image
                        imgEl.onerror = null;
                        imgEl.remove();
                        return;
                    }
                    imgEl.src = basePath + candidates[tryIndex++];
                }
                img.onerror = function () { tryNext(this); };
                tryNext(img);
                // If all fail including placeholder, image will be removed by onerror handler
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
