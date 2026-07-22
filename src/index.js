import { state } from './state';
import { logos } from './logos';
import { rendering } from './rendering';
import { utils } from './utils';
import { accessibility } from './accessibility';
import { TEAM_ALIASES } from './constants';

Module.register("MMM-MyTeams-LeagueTable", Object.assign({}, utils, state, accessibility, rendering, logos, {
	// Default module config
	defaults: {
		updateInterval: 30 * 60 * 1000,
		retryDelay: 15000,
		maxRetries: 3,
		animationSpeed: 2000,
		fadeSpeed: 4000,
		colored: true,
		maxTeams: 36,
		highlightTeams: ["Celtic", "Hearts"],
		scrollable: true,
		selectedLeagues: ["SCOTLAND_PREMIERSHIP"],
		legacyLeagueToggle: false,
		autoGenerateButtons: true,
		showLeagueButtons: true,
		autoFocusRelevantSubTab: true,
		showWC2026: false,
		showUEFAleagues: false,
		onlyShowWorldCup2026: false,
		showWC2026Groups: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
		showWC2026Knockouts: ["Rd32", "Rd16", "QF", "SF", "TP", "Final"],
		showUEFAnockouts: ["Playoff", "Rd16", "QF", "SF", "Final"],
		defaultWCSubTab: "A",
		displayAllTabs: false,
		useMockData: false,
		showSPFL: false,
		showSPFLC: false,
		showEPL: false,
		showUCL: false,
		showUEL: false,
		showECL: false,
		showPosition: true,
		showTeamLogos: true,
		showPlayedGames: true,
		showWon: true,
		showDrawn: true,
		showLost: true,
		showGoalsFor: true,
		showGoalsAgainst: true,
		showGoalDifference: true,
		showPoints: true,
		showForm: true,
		formMaxGames: 6,
		enhancedIndicatorShapes: true,
		highlightedColor: "rgba(255, 255, 255, 0.1)",
		tableDensity: "normal",
		fixtureDateFilter: null,
		theme: "auto",
		customTeamColors: {},
		autoCycle: false,
		cycleInterval: 15 * 1000,
		wcSubtabCycleInterval: 15 * 1000,
		autoCycleWcSubtabs: true,
		leagueHeaders: {
			SCOTLAND_PREMIERSHIP: "Scottish Premiership",
			SCOTLAND_CHAMPIONSHIP: "Scottish Championship",
			ENGLAND_PREMIER_LEAGUE: "English Premier League",
			Cymru_Premier_League: "Cymru Premier",
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
			ROMANIA_LIGA_I: "Romanian Liga I",
			CROATIA_HNL: "Croatian HNL",
			SERBIA_SUPER_LIGA: "Serbian Super Liga",
			HUNGARY_NBI: "Hungarian NB I",
			POLAND_EKSTRAKLASA: "Ekstraklasa",
			BOLIVIA_LIGA_2: "Bolivia Simón Bolívar",
			UEFA_EUROPA_CONFERENCE_LEAGUE: "UEFA Europa Conference League",
			UEFA_EUROPA_LEAGUE: "UEFA Europa League",
			UEFA_CHAMPIONS_LEAGUE: "UEFA Champions League",
			WORLD_CUP_2026: "WC26"
		},
		darkMode: null,
		fontColorOverride: "#FFFFFF",
		opacityOverride: null,
		debug: false,
		debugLevel: 1,
		provider: "auto",
		providerChain: [],
		parallelProviderRacing: false,
		dateTimeOverride: null,
		clearCacheButton: true,
		clearCacheOnStart: false,
		maxTableHeight: 600
	},

	requiresVersion: "2.1.0",

	getScripts() {
		return [
			"european-leagues.js"
		];
	},

	getHeader() {
		if (this.config.onlyShowWorldCup2026 === true) {
			return "FIFA World Cup 2026";
		}
		return this.data.header || "League Standings";
	},

	start() {
		this.leagueData = {};
		this.loaded = {};
		this.log(3, "CORE", "Starting module");

		this.mergedTeamLogoMap = Object.assign({}, this.config.teamLogoMap || {});
		this.teamAliases = TEAM_ALIASES;
		this.normalizedTeamLogoMap = {};
		this.buildNormalizedTeamMap();
		this.determineEnabledLeagues();

		this.currentLeague = this.enabledLeagueCodes.length > 0 ? this.enabledLeagueCodes[0] : "SCOTLAND_PREMIERSHIP";

		this.enabledLeagueCodes.forEach((leagueCode) => {
			this.leagueData[leagueCode] = null;
			this.loaded[leagueCode] = false;
		});

		this.error = null;
		this.retryCount = 0;
		this.lastAnnouncement = Date.now();
		this.announcementThrottle = 3000;
		this.createAriaLiveRegion();
		this.setupLazyLoading();

		this.isOnline = navigator.onLine;
		this.setupOfflineDetection();

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register(this.file("service-worker.js"))
				.then(() => this.log(3, "CORE", "Service Worker registered"))
				.catch(err => this.log(1, "CORE", "Service Worker registration failed: " + err));
		}

		this.loadLogoMappings();

		const uefaLeagues = ["UEFA_CHAMPIONS_LEAGUE", "UEFA_EUROPA_LEAGUE", "UEFA_EUROPA_CONFERENCE_LEAGUE", "UCL", "UEL", "ECL"];
		if (this.currentLeague === "WORLD_CUP_2026") this.currentSubTab = this.config.defaultWCSubTab || "A";
		else if (uefaLeagues.includes(this.currentLeague)) this.currentSubTab = "Table";
		else this.currentSubTab = null;

		this.isScrolling = false;
		this.isContentHidden = false;
		this._lastRenderedKey = null;
		this._pinned = false;

		if (this.config.clearCacheOnStart === true) {
			this.log(3, "CACHE", "Clearing cache on start");
			this.sendSocketNotification("CACHE_CLEAR_ALL");
		}

		this.requestAllLeagueData();
		this.scheduleUpdate();

		if (this.config.autoCycle || this.config.onlyShowWorldCup2026) {
			if (this.config.onlyShowWorldCup2026) {
				this.config.cycleInterval = 30 * 1000;
				this.config.formMaxGames = 3;
			}
			this.scheduleCycling();
			this.scheduleWorldCupSubtabCycling();
		}
	}
}));
