export const defaults = {
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
	selectedLeagues: ["SCOTLAND_PREMIERSHIP"],
	legacyLeagueToggle: false, // If true, uses showSPFL, showEPL, etc. from config
	autoGenerateButtons: true, // Auto-create buttons for all leagues in selectedLeagues
	showLeagueButtons: true, // Show/hide league selector buttons in header
	showLeagueLabel: true, // If true, shows the league descriptor label next to the flag
	autoFocusRelevantSubTab: true, // Automatically focus on the sub-tab with live or upcoming matches

	// ===== NEW: World Cup 2026 Specific Options =====
	showWC2026: false, // Set to true to show World Cup 2026 in league switcher
	showUEFAleagues: false, // Set to true to show UEFA leagues in league switcher
	onlyShowWorldCup2026: false, // If true, only shows World Cup 2026 view
	showWC2026Groups: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"], // Groups to show
	showWC2026Knockouts: ["Rd32", "Rd16", "QF", "SF", "TP", "Final"], // Knockout rounds to show
	showUEFAnockouts: ["Playoff", "Rd16", "QF", "SF", "Final"], // UEFA knockout stages to show
	defaultWCSubTab: "A", // Default tab to focus on start-up (e.g., "A", "Final", etc.)
	displayAllTabs: false, // Override to show all tabs regardless of completion
	useMockData: false, // For testing: use mock data instead of scraping

	// ===== LEGACY League toggles (used if legacyLeagueToggle: true) =====
	showSPFL: false, // Show Scottish Premiership
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
	enhancedIndicatorShapes: true, // true = shape differentiation on form tokens (circle/square/triangle); false = no background, colored text only (W=green, D=grey, L=red)
	highlightedColor: "rgba(255, 255, 255, 0.1)", // Color for highlighted teams

	// ===== UX Options (Phase 4) =====
	tableDensity: "normal", // Table row density: "compact", "normal", "comfortable"
	fixtureDateFilter: null, // Filter fixtures by date range: null (show all), "today", "week", "month", or {start: "YYYY-MM-DD", end: "YYYY-MM-DD"}

	// ===== Theme Options (Phase 4) =====
	theme: "auto", // Color theme: "auto" (follows system), "light", "dark"
	customTeamColors: {}, // Custom colors for specific teams: {"Team Name": "#HEXCOLOR"}

	// ===== Auto-cycling options =====
	autoCycle: false, // Enable auto-cycling between leagues
	cycleInterval: 15 * 1000, // Time to display each league (15 seconds)
	wcSubtabCycleInterval: 15 * 1000, // Time to display each WC sub-tab (groups/knockouts)
	autoCycleWcSubtabs: true, // Allow auto-cycling of World Cup sub-tabs

	// ===== League Headers =====
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

	// Theme overrides
	darkMode: null, // null=auto, true=force dark, false=force light
	fontColorOverride: "#FFFFFF", // Set to "null" for your existing css colour scheme or override all font colors "#FFFFFF" to force white text
	opacityOverride: null, // null=auto,  set to  1.0 to force full opacity

	// Debug
	debug: false, 
	debugLevel: 1, // DEBUG-02: 0=OFF, 1=ERROR, 2=WARN, 3=INFO, 4=DEBUG
	provider: "auto", // Data provider: "auto", "bbc", "soccerway", "wikipedia", "espn", "google"
	providerChain: [], // List of fallback providers: [{provider: "BBC", url: "..."}, {provider: "Soccerway", url: "..."}]
	parallelProviderRacing: false, // INNOV-05: If true, fetch from all providers in chain simultaneously and use the first successful result
	dateTimeOverride: null, // Override system date/time for testing. Use ISO date format (e.g., "2026-01-15" or "2026-01-15T14:30:00Z"). null = use system date

	// Cache controls
	clearCacheButton: true,
	clearCacheOnStart: false, // Set to true to force-clear ALL caches (disk, fixture, logo) on every module start - useful for development and troubleshooting
	maxTableHeight: 500 // Height in px to show 12 teams + extra room for fixtures (reduced to ensure footer visibility)
};
