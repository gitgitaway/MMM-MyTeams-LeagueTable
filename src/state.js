import { LEAGUE_TABS, LEAGUE_HEADERS, EUROPEAN_LEAGUES, COMMON_SUFFIXES, LEGACY_CODE_MAP } from './constants';
import { BBC_URL_MAP, WIKIPEDIA_URL_MAP, SOCCERWAY_URL_MAP, GOOGLE_URL_MAP, ESPN_URL_MAP, LEAGUE_SPLITS } from './league-configs';

export const state = {
	// -----------------------------
	// Match Events & Notifications
	// -----------------------------
	_checkMatchEvents(oldData, newData) {
		if (!oldData || !newData || !newData.fixtures) return;
		const leagueName = this.config.leagueHeaders[newData.leagueType] || newData.leagueType;

		newData.fixtures.forEach(newFix => {
			const oldFix = oldData.fixtures.find(f => 
				f.homeTeam === newFix.homeTeam && f.awayTeam === newFix.awayTeam && f.date === newFix.date
			);
			if (!oldFix) return;

			const oldHome = parseInt(oldFix.homeScore);
			const oldAway = parseInt(oldFix.awayScore);
			const newHome = parseInt(newFix.homeScore);
			const newAway = parseInt(newFix.awayScore);

			if (!isNaN(oldHome) && !isNaN(newHome) && newHome > oldHome) {
				this._broadcastMatchEvent("GOAL", {
					team: newFix.homeTeam, score: `${newHome}-${newAway}`,
					fixture: `${newFix.homeTeam} vs ${newFix.awayTeam}`, league: leagueName
				});
			}
			if (!isNaN(oldAway) && !isNaN(newAway) && newAway > oldAway) {
				this._broadcastMatchEvent("GOAL", {
					team: newFix.awayTeam, score: `${newHome}-${newAway}`,
					fixture: `${newFix.homeTeam} vs ${newFix.awayTeam}`, league: leagueName
				});
			}
			if (oldFix.status !== newFix.status) {
				if (newFix.status === "HT") {
					this._broadcastMatchEvent("HALFTIME", {
						score: `${newHome}-${newAway}`, fixture: `${newFix.homeTeam} vs ${newFix.awayTeam}`, league: leagueName
					});
				} else if (newFix.status === "FT" || newFix.status === "Full Time") {
					this._broadcastMatchEvent("FULLTIME", {
						score: `${newHome}-${newAway}`, fixture: `${newFix.homeTeam} vs ${newFix.awayTeam}`, league: leagueName
					});
				}
			}
		});
	},

	_broadcastMatchEvent(type, data) {
		this.log(3, "EVENT", `Broadcasting match event: ${type}`, data);
		this.sendNotification(`MTLT_MATCH_${type}`, data);
		if (this.config.showMatchAlerts) {
			this.sendNotification("SHOW_ALERT", {
				title: `${type === "GOAL" ? "⚽ GOAL!" : type}`,
				message: `${data.fixture}: ${data.score} (${data.league})`,
				timer: 5000
			});
		}
	},

	_autoFocusRelevantSubTab(leagueType) {
		// Logic to automatically switch to active match day or current group
	},

	// -----------------------------
	// Refresh Strategy (PERF-01)
	// -----------------------------
	scheduleUpdate() {
		const self = this;
		if (this.updateTimer) clearTimeout(this.updateTimer);

		let nextUpdate = this.config.updateInterval || 1800000;
		let hasLiveGames = false;
		let mightHaveLiveGames = false;
		let hasUpcomingToday = false;
		const nowMs = Date.now();
		const hour = new Date().getHours();
		const todayDateStr = this.getCurrentDateString();

		if (this.leagueData) {
			Object.values(this.leagueData).forEach((data) => {
				if (data && data.fixtures) {
					data.fixtures.forEach((f) => {
						const isFinished = ["FT", "PEN", "AET"].includes((f.status || "").toUpperCase());
						if (f.live) hasLiveGames = true;
						else if (f.date === todayDateStr && !isFinished) {
							if (f.timestamp && f.timestamp < nowMs + 900000) mightHaveLiveGames = true;
							else hasUpcomingToday = true;
						}
					});
				}
			});
		}

		if (hasLiveGames) nextUpdate = 120000;
		else if (mightHaveLiveGames) nextUpdate = 300000;
		else if (hasUpcomingToday) nextUpdate = 900000;
		else if (hour >= 1 && hour <= 6) nextUpdate = 14400000;

		this.updateTimer = setTimeout(() => {
			self.requestAllLeagueData();
			self.scheduleUpdate();
		}, nextUpdate);
	},

	scheduleCycling() {
		if (this._pinned) return;
		if (this.cycleTimer) clearInterval(this.cycleTimer);

		if (this.enabledLeagueCodes && this.enabledLeagueCodes.length > 1) {
			this.cycleTimer = setInterval(() => this.cycleToNextLeague(), this.config.cycleInterval);
			this.scheduleWorldCupSubtabCycling();
		}
	},

	cycleToNextLeague() {
		if (this.isScrolling || this._pinned) return;
		if (!this.enabledLeagueCodes || this.enabledLeagueCodes.length <= 1) return;

		let currentIndex = this.enabledLeagueCodes.indexOf(this.currentLeague);
		let nextIndex = (currentIndex + 1) % this.enabledLeagueCodes.length;

		this.currentLeague = this.enabledLeagueCodes[nextIndex];
		
		// Reset subtab when switching leagues to ensure valid state
		const uefaLeagues = ["UEFA_CHAMPIONS_LEAGUE", "UEFA_EUROPA_LEAGUE", "UEFA_EUROPA_CONFERENCE_LEAGUE", "UCL", "UEL", "ECL"];
		if (this.currentLeague === "WORLD_CUP_2026") {
			this.currentSubTab = this.config.defaultWCSubTab || "A";
		} else if (uefaLeagues.includes(this.currentLeague)) {
			this.currentSubTab = "Table";
		} else {
			this.currentSubTab = null;
		}

		this._lastRenderedKey = null;
		this.log(3, "UI", `Cycling to league: ${this.currentLeague}`);
		this.updateDom(this.config.animationSpeed);
	},

	scheduleWorldCupSubtabCycling() {
		if (this.isScrolling || this._pinned) return;
		if (this.wcSubtabTimer) clearInterval(this.wcSubtabTimer);
		if (this.wcInitialDelayTimer) clearTimeout(this.wcInitialDelayTimer);
		if (this.config.autoCycleWcSubtabs === false) return;
		if (this.currentLeague !== "WORLD_CUP_2026" || !(this.config.autoCycle || this.config.onlyShowWorldCup2026)) return;

		const groupsToShow = this.config.showWC2026Groups || ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
		const isCurrentGroup = groupsToShow.includes(this.currentSubTab);
		const interval = this.config.wcSubtabCycleInterval || 15000;

		if (isCurrentGroup) {
			this.wcInitialDelayTimer = setTimeout(() => {
				this.wcSubtabTimer = setInterval(() => {
					if (this.isWorldCupStageComplete("GROUPS")) {
						clearInterval(this.wcSubtabTimer);
						this.currentSubTab = "Rd32";
						this.updateDom(this.config.animationSpeed);
						return;
					}
					let idx = groupsToShow.indexOf(this.currentSubTab);
					this.currentSubTab = groupsToShow[(idx + 1) % groupsToShow.length];
					this.updateDom(this.config.animationSpeed);
				}, interval);
			}, interval);
		}
	},

	// -----------------------------
	// Data Processing
	// -----------------------------
	socketNotificationReceived(notification, payload) {
		switch (notification) {
			case "LEAGUE_DATA": this.processLeagueData(payload); break;
			case "FETCH_ERROR": this.processError(payload); break;
			case "DEBUG_INFO": this.log(4, "BACKEND", payload.message, payload.data || ""); break;
		}
	},

	processLeagueData(data) {
		const leagueType = data.leagueType || "SPFL";
		if (this.leagueData[leagueType]) this._checkMatchEvents(this.leagueData[leagueType], data);
		
		this.leagueData[leagueType] = data;
		this.loaded[leagueType] = true;
		if (!this.currentLeague || this.currentLeague === leagueType) this.currentLeague = leagueType;
		if (this.config.autoFocusRelevantSubTab) this._autoFocusRelevantSubTab(leagueType);

		this.error = null;
		this.retryCount = 0;
		if (leagueType === this.currentLeague) {
			this._lastRenderedKey = null;
			this.announceDataUpdate(this.config.leagueHeaders[leagueType] || leagueType);
			this.debouncedUpdateDom(this.config.animationSpeed);
		}
	},

	_shouldSkipRender() {
		if (this.config.debug) return false;
		const data = this.leagueData[this.currentLeague];
		const dataKey = JSON.stringify(data?.standings || data?.teams || data?.groups || {});
		const key = `${this.currentLeague}_${this.currentSubTab || "table"}_${this.isOnline}_${this.isContentHidden}_${dataKey}`;
		if (this._lastRenderedKey === key) return true;
		this._lastRenderedKey = key;
		return false;
	},

	debouncedUpdateDom(speed) {
		if (this.updateDomTimer) clearTimeout(this.updateDomTimer);
		this.saveFocusState();
		this.updateDomTimer = setTimeout(() => {
			this.updateDom(speed || this.config.animationSpeed);
			this.updateDomTimer = null;
			setTimeout(() => this.restoreFocusState(), (speed || this.config.animationSpeed || 0) + 150);
		}, 200);
	},

	processError(error) {
		const leagueType = error.leagueType || null;
		if (!this._leagueRetryCounters) this._leagueRetryCounters = new Map();

		if (leagueType) {
			const count = (this._leagueRetryCounters.get(leagueType) || 0) + 1;
			this._leagueRetryCounters.set(leagueType, count);
			if (count <= this.config.maxRetries) {
				setTimeout(() => this._requestSingleLeagueData(leagueType), this.config.retryDelay);
			} else {
				this.updateDom(this.config.animationSpeed);
			}
			return;
		}

		this.error = error;
		this.retryCount++;
		if (this.retryCount <= this.config.maxRetries) {
			setTimeout(() => this.requestAllLeagueData(), this.config.retryDelay);
		} else {
			this.updateDom(this.config.animationSpeed);
		}
	},

	_requestSingleLeagueData(leagueCode) {
		const urls = this.getLeagueUrl(leagueCode);
		if (!urls || (!urls.primary && !urls.fallback)) return;
		this.sendSocketNotification("GET_LEAGUE_DATA", {
			...this.config, leagueType: leagueCode, url: urls.primary,
			fallbackUrl: urls.fallback, providerChain: urls.providerChain || [], 
			splitConfig: LEAGUE_SPLITS[leagueCode] || null
		});
	},

	getLeagueUrl(leagueCode) {
		const provider = (this.config.provider || "auto").toLowerCase();
		const urls = {
			bbc: BBC_URL_MAP[leagueCode],
			google: GOOGLE_URL_MAP[leagueCode],
			wikipedia: WIKIPEDIA_URL_MAP[leagueCode],
			espn: ESPN_URL_MAP[leagueCode],
			soccerway: SOCCERWAY_URL_MAP[leagueCode]
		};

		const buildChain = (...providerOrder) =>
			providerOrder
				.map((p) => (urls[p] ? { url: urls[p], provider: p } : null))
				.filter(Boolean);

		let chain = [];
		if (provider === "bbc") chain = buildChain("bbc", "soccerway", "espn", "wikipedia", "google");
		else if (provider === "espn") chain = buildChain("espn", "bbc", "soccerway", "wikipedia", "google");
		else if (provider === "soccerway") chain = buildChain("soccerway", "bbc", "espn", "wikipedia", "google");
		else if (provider === "wikipedia") chain = buildChain("wikipedia", "soccerway", "bbc", "espn", "google");
		else chain = buildChain("bbc", "soccerway", "espn", "wikipedia", "google");

		if (chain.length === 0) return null;

		return {
			primary: chain[0].url,
			fallback: chain.length > 1 ? chain[1].url : null,
			providerChain: chain
		};
	},

	requestAllLeagueData() {
		if (!this.enabledLeagueCodes || this.enabledLeagueCodes.length === 0) {
			this.log(2, "CORE", "No leagues configured to fetch");
			return;
		}

		this.enabledLeagueCodes.forEach((leagueCode, index) => {
			const urls = this.getLeagueUrl(leagueCode);
			if (!urls || (!urls.primary && !urls.fallback)) {
				this.log(1, "CORE", `Could not find URL for league code: ${leagueCode}`);
				return;
			}

			const splitConfig = LEAGUE_SPLITS[leagueCode] || null;

			setTimeout(() => {
				this.log(3, "DATA", `Requesting data for ${leagueCode}${splitConfig ? " (split-league)" : ""}`);
				this.sendSocketNotification("GET_LEAGUE_DATA", {
					...this.config, leagueType: leagueCode, url: urls.primary,
					fallbackUrl: urls.fallback, providerChain: urls.providerChain || [],
					splitConfig: splitConfig
				});
			}, index * 500);
		});
	},

	handleOnlineStatus(isOnline) {
		this.isOnline = isOnline;
		if (!isOnline) this.announceToScreenReader("Internet connection lost - showing cached data", true);
		else {
			this.announceToScreenReader("Internet connection restored - updating data", true);
			this.requestAllLeagueData();
		}
		this.updateDom();
	},

	setupOfflineDetection() {
		window.addEventListener("online", () => this.handleOnlineStatus(true));
		window.addEventListener("offline", () => this.handleOnlineStatus(false));
	},

	isWorldCupStageComplete(stageId) {
		const data = this.leagueData && this.leagueData.WORLD_CUP_2026;
		if (!data) return false;
		if (stageId === "GROUPS") {
			const groups = this.config.showWC2026Groups || ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
			return groups.every(g => (data.standings && data.standings[g]) ? data.standings[g].every(team => team.played >= 3) : false);
		}
		return false;
	},

	determineEnabledLeagues() {
		this.enabledLeagueCodes = [];
		if (this.config.onlyShowWorldCup2026) { this.enabledLeagueCodes = ["WORLD_CUP_2026"]; return; }
		if (this.config.selectedLeagues?.length) {
			this.config.selectedLeagues.forEach(c => { const n = this.normalizeLeagueCode(c); if (n && !this.enabledLeagueCodes.includes(n)) this.enabledLeagueCodes.push(n); });
		}
		if (!this.enabledLeagueCodes.length && this.config.legacyLeagueToggle) {
			const map = { showSPFL: "SCOTLAND_PREMIERSHIP", showSPFLC: "SCOTLAND_CHAMPIONSHIP", showEPL: "ENGLAND_PREMIER_LEAGUE", showUCL: "UEFA_CHAMPIONS_LEAGUE", showUEL: "UEFA_EUROPA_LEAGUE", showECL: "UEFA_EUROPA_CONFERENCE_LEAGUE" };
			Object.entries(map).forEach(([k, v]) => { if (this.config[k] && !this.enabledLeagueCodes.includes(v)) this.enabledLeagueCodes.push(v); });
		}
		if (this.config.showWC2026) { if (!this.enabledLeagueCodes.includes("WORLD_CUP_2026")) this.enabledLeagueCodes.push("WORLD_CUP_2026"); }
		else if (this.config.showWC2026 === false) this.enabledLeagueCodes = this.enabledLeagueCodes.filter(c => c !== "WORLD_CUP_2026");
		const uefa = ["UEFA_EUROPA_CONFERENCE_LEAGUE", "UEFA_EUROPA_LEAGUE", "UEFA_CHAMPIONS_LEAGUE"];
		if (this.config.showUEFAleagues) uefa.forEach(c => { if (!this.enabledLeagueCodes.includes(c)) this.enabledLeagueCodes.push(c); });
		else if (this.config.showUEFAleagues === false) this.enabledLeagueCodes = this.enabledLeagueCodes.filter(c => !uefa.includes(c));
		if (!this.enabledLeagueCodes.length) this.enabledLeagueCodes = ["SCOTLAND_PREMIERSHIP"];
		if (!this.currentLeague || !this.enabledLeagueCodes.includes(this.currentLeague)) this.currentLeague = this.enabledLeagueCodes[0] || "SCOTLAND_PREMIERSHIP";
	},

	normalizeLeagueCode(code) {
		return code ? (LEGACY_CODE_MAP[code] || code) : null;
	}
};
