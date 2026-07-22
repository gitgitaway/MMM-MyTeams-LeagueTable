/**
 * MMM-MyTeams-LeagueTable
 * European Football Leagues Configuration
 *
 * Comprehensive mapping of European top-tier men's professional football leagues
 * with BBC Sport URLs and metadata for configurable league selection
 */

// ============================================================================
// EUROPEAN LEAGUES DATABASE
// ============================================================================
// Format: leagueCode: {
//   name: "Display Name",
//   country: "Country Name",
//   countryCode: "ISO 3166-1 alpha-2 code (e.g., 'NO' for Norway)",
//   url: "BBC Sport URL",
//   tier: 1,
//   enabled: boolean (default display state),
//   countryFolder: "Country folder in images/crests/ (e.g., 'Norway')"
// }
// ============================================================================

const EUROPEAN_LEAGUES = {
	// Nordic/Scandinavia
	NORWAY_ELITESERIEN: {
		name: "Eliteserien",
		country: "Norway",
		countryCode: "NO",
		countryFolder: "Norway",
		url: "https://www.bbc.co.uk/sport/football/norwegian-eliteserien/table",
		tier: 1,
		enabled: false
	},
	BELARUS_VYSSHAYA_LIGA: {
		name: "Vysshaya Liga",
		country: "Belarus",
		countryCode: "BY",
		countryFolder: "Belarus",
		url: "https://www.bbc.co.uk/sport/football/belarusian-vysshaya-liga/table",
		tier: 1,
		enabled: false
	},

	FINLAND_VEIKKAUSLIIGA: {
		name: "Veikkausliiga",
		country: "Finland",
		countryCode: "FI",
		countryFolder: "Finland",
		url: "https://www.bbc.co.uk/sport/football/finnish-veikkausliiga/table",
		tier: 1,
		enabled: false
	},
	ICELAND_URVALSDEILD: {
		name: "Urvalsdeild",
		country: "Iceland",
		countryCode: "IS",
		countryFolder: "Iceland",
		url: "https://www.bbc.co.uk/sport/football/icelandic-urvalsdeild/table",
		tier: 1,
		enabled: false
	},
	LATVIA_VIRSLIGA: {
		name: "Virsliga",
		country: "Latvia",
		countryCode: "LV",
		countryFolder: "Latvia",
		url: "https://www.bbc.co.uk/sport/football/latvian-virsliga/table",
		tier: 1,
		enabled: false
	},
	LITHUANIA_A_LYGA: {
		name: "A Lyga",
		country: "Lithuania",
		countryCode: "LT",
		countryFolder: "Lithuania",
		url: "https://www.bbc.co.uk/sport/football/lithuanian-a-lyga/table",
		tier: 1,
		enabled: false
	},
	ESTONIA_MEISTRILIIGA: {
		name: "Meistriliiga",
		country: "Estonia",
		countryCode: "EE",
		countryFolder: "Estonia",
		url: "https://www.bbc.co.uk/sport/football/estonian-meistriliiga/table",
		tier: 1,
		enabled: false
	},
	FAROE_ISLANDS_FOOTBALL_LEAGUE: {
		name: "Faroe Islands Football League",
		country: "Faroe Islands",
		countryCode: "FO",
		countryFolder: "Faroe_Islands",
		url: "https://www.bbc.co.uk/sport/football/faroe-islands-football-league/table",
		tier: 1,
		enabled: false
	},
	GEORGIA_EULOGE: {
		name: "Euloge",
		country: "Georgia",
		countryCode: "GE",
		countryFolder: "Georgia",
		url: "https://www.bbc.co.uk/sport/football/georgian-euloge/table",
		tier: 1,
		enabled: false
	},
	IRELAND_PREMIER_DIVISION: {
		name: "Premier Division",
		country: "Ireland",
		countryCode: "IE",
		countryFolder: "Ireland",
		url: "https://www.bbc.co.uk/sport/football/irish-premier-division/table",
		tier: 1,
		enabled: false
	},
	NORTHERN_IRELAND_NATIONAL_LEAGUE: {
		name: "National League",
		country: "Northern Ireland",
		countryCode: "GB-NIR",
		countryFolder: "Northern_Ireland",
		url: "https://www.bbc.co.uk/sport/football/northern-ireland-national-league/table",
		tier: 1,
		enabled: false
	},
	BOSNIAN_PREMIER_LEAGUE: {
		name: "Premier League of Bosnia and Herzegovina",
		country: "Bosnia and Herzegovina",
		countryCode: "BA",
		countryFolder: "Bosnia_and_Herzegovina",
		url: "https://www.bbc.co.uk/sport/football/bosnian-premier-league/table",
		tier: 1,
		enabled: false
	},

	SWEDEN_ALLSVENSKAN: {
		name: "Allsvenskan",
		country: "Sweden",
		countryCode: "SE",
		countryFolder: "Sweden",
		url: "https://www.bbc.co.uk/sport/football/swedish-allsvenskan/table",
		tier: 1,
		enabled: false
	},
	DENMARK_SUPERLIGA: {
		name: "Superligaen",
		country: "Denmark",
		countryCode: "DK",
		countryFolder: "Denmark",
		url: "https://www.bbc.co.uk/sport/football/danish-superliga/table",
		tier: 1,
		enabled: false
	},

	// Central Europe
	GERMANY_BUNDESLIGA: {
		name: "Bundesliga",
		country: "Germany",
		countryCode: "DE",
		countryFolder: "Germany",
		url: "https://www.bbc.co.uk/sport/football/german-bundesliga/table",
		tier: 1,
		enabled: false
	},
	AUSTRIA_BUNDESLIGA: {
		name: "Austrian Bundesliga",
		country: "Austria",
		countryCode: "AT",
		countryFolder: "Austria",
		url: "https://www.bbc.co.uk/sport/football/austrian-bundesliga/table",
		tier: 1,
		enabled: false
	},
	BULGARIA_FIRST_LEAGUE: {
		name: "First League",
		country: "Bulgaria",
		countryCode: "BG",
		countryFolder: "Bulgaria",
		url: "https://www.bbc.co.uk/sport/football/bulgarian-first-league/table",
		tier: 1,
		enabled: false
	},
	KOSOVO_SUPER_LEAGUE: {
		name: "Super League",
		country: "Kosovo",
		countryCode: "XK",
		countryFolder: "Kosovo",
		url: "https://www.bbc.co.uk/sport/football/kosovan-super-league/table",
		tier: 1,
		enabled: false
	},
	SERBIA_SUPER_LIGA: {
		name: "Serbian Super Liga",
		country: "Serbia",
		countryCode: "RS",
		countryFolder: "Serbia",
		url: "https://www.bbc.co.uk/sport/football/serbian-super-lig/table",
		tier: 1,
		enabled: false
	},
	MOLDOVA_SUPER_LIGA: {
		name: "Super Liga",
		country: "Moldova",
		countryCode: "MD",
		countryFolder: "Moldova",
		url: "https://www.bbc.co.uk/sport/football/moldovan-super-liga/table",
		tier: 1,
		enabled: false
	},
	MONTENEGRO_FIRST_LEAGUE: {
		name: "First League",
		country: "Montenegro",
		countryCode: "ME",
		countryFolder: "Montenegro",
		url: "https://www.bbc.co.uk/sport/football/montenegrin-first-league/table",
		tier: 1,
		enabled: false
	},
	NORTH_MACEDONIA_FIRST_LEAGUE: {
		name: "First League",
		country: "North Macedonia",
		countryCode: "MK",
		countryFolder: "North_Macedonia",
		url: "https://www.bbc.co.uk/sport/football/north-macedonian-first-league/table",
		tier: 1,
		enabled: false
	},
	SLOVENIA_PRVA_LIGA: {
		name: "Prva Liga",
		country: "Slovenia",
		countryCode: "SI",
		countryFolder: "Slovenia",
		url: "https://www.bbc.co.uk/sport/football/slovenian-prva-liga/table",
		tier: 1,
		enabled: false
	},
    KAZAKHSTAN_PYRKOVKA: {
		name: "Pyrkovka",
		country: "Kazakhstan",
		countryCode: "KZ",
		countryFolder: "Kazakhstan",
		url: "https://www.bbc.co.uk/sport/football/kazakhstani-pyrkovka/table",
		tier: 1,
		enabled: false
	},
	AZERBAIJAN_PYRKOVKA: {
		name: "Pyrkovka",
		country: "Azerbaijan",
		countryCode: "AZ",
		countryFolder: "Azerbaijan",
		url: "https://www.bbc.co.uk/sport/football/azerbaijani-pyrkovka/table",
		tier: 1,
		enabled: false
	},

	SLOVAKIA_SUPER_LIGA: {
		name: "Super Liga",
		country: "Slovakia",
		countryCode: "SK",
		countryFolder: "Slovakia",
		url: "https://www.bbc.co.uk/sport/football/slovakian-super-liga/table",
		tier: 1,
		enabled: false
	},
	CZECH_LIGA: {
		name: "Czech Liga",
		country: "Czech Republic",
		countryCode: "CZ",
		countryFolder: "Czech Republic",
		url: "https://www.bbc.co.uk/sport/football/czech-liga/table",
		tier: 1,
		enabled: false
	},
	HUNGARY_NBI: {
		name: "Hungarian NB I",
		country: "Hungary",
		countryCode: "HU",
		countryFolder: "Hungary",
		url: "https://www.bbc.co.uk/sport/football/hungarian-nb-i/table",
		tier: 1,
		enabled: false
	},
	POLAND_EKSTRAKLASA: {
		name: "Ekstraklasa",
		country: "Poland",
		countryCode: "PL",
		countryFolder: "Poland",
		url: "https://www.bbc.co.uk/sport/football/polish-ekstraklasa/table",
		tier: 1,
		enabled: false
	},

	// Western Europe
	FRANCE_LIGUE1: {
		name: "Ligue 1",
		country: "France",
		countryCode: "FR",
		countryFolder: "France",
		url: "https://www.bbc.co.uk/sport/football/french-ligue-one/table",
		tier: 1,
		enabled: false
	},
	NETHERLANDS_EREDIVISIE: {
		name: "Eredivisie",
		country: "Netherlands",
		countryCode: "NL",
		countryFolder: "The_Netherlands",
		url: "https://www.bbc.co.uk/sport/football/dutch-eredivisie/table",
		tier: 1,
		enabled: false
	},
	BELGIUM_PRO_LEAGUE: {
		name: "Belgian Pro League",
		country: "Belgium",
		countryCode: "BE",
		countryFolder: "Belgium",
		url: "https://www.bbc.co.uk/sport/football/belgian-pro-league/table",
		tier: 1,
		enabled: false
	},
	SWITZERLAND_SUPER_LEAGUE: {
		name: "Swiss Super League",
		country: "Switzerland",
		countryCode: "CH",
		countryFolder: "Switzerland",
		url: "https://www.bbc.co.uk/sport/football/swiss-super-league/table",
		tier: 1,
		enabled: false
	},

	// Southern Europe
	SPAIN_LA_LIGA: {
		name: "La Liga",
		country: "Spain",
		countryCode: "ES",
		countryFolder: "Spain",
		url: "https://www.bbc.co.uk/sport/football/spanish-la-liga/table",
		tier: 1,
		enabled: false
	},
	ITALY_SERIE_A: {
		name: "Serie A",
		country: "Italy",
		countryCode: "IT",
		countryFolder: "Italy",
		url: "https://www.bbc.co.uk/sport/football/italian-serie-a/table",
		tier: 1,
		enabled: false
	},
	PORTUGAL_PRIMEIRA_LIGA: {
		name: "Primeira Liga",
		country: "Portugal",
		countryCode: "PT",
		countryFolder: "Portugal",
		url: "https://www.bbc.co.uk/sport/football/portuguese-primeira-liga/table",
		tier: 1,
		enabled: false
	},

	// Eastern Europe
	UKRAINE_PREMIER_LEAGUE: {
		name: "Ukrainian Premier League",
		country: "Ukraine",
		countryCode: "UA",
		countryFolder: "Ukraine",
		url: "https://www.bbc.co.uk/sport/football/ukrainian-premier-league/table",
		tier: 1,
		enabled: false
	},
	ROMANIA_LIGA_I: {
		name: "Liga I",
		country: "Romania",
		countryCode: "RO",
		countryFolder: "Romania",
		url: "https://www.bbc.co.uk/sport/football/romanian-liga-i/table",
		tier: 1,
		enabled: false
	},
	CROATIA_HNL: {
		name: "Croatian HNL",
		country: "Croatia",
		countryCode: "HR",
		countryFolder: "Croatia",
		url: "https://www.bbc.co.uk/sport/football/croatian-first-league/table",
		tier: 1,
		enabled: false
	},
	
	// Mediterranean/Balkan
	GREECE_SUPER_LEAGUE: {
		name: "Greek Super League",
		country: "Greece",
		countryCode: "GR",
		countryFolder: "Greece",
		url: "https://www.bbc.co.uk/sport/football/greek-super-league/table",
		tier: 1,
		enabled: false
	},
	TURKEY_SUPER_LIG: {
		name: "Turkish Super Lig",
		country: "Turkey",
		countryCode: "TR",
		countryFolder: "Turkey",
		url: "https://www.bbc.co.uk/sport/football/turkish-super-lig/table",
		tier: 1,
		enabled: false
	},
	CYPRUS_FIRST_DIVISION: {
		name: "Cypriot First Division",
		country: "Cyprus",
		countryCode: "CY",
		countryFolder: "Cyprus",
		url: "https://www.bbc.co.uk/sport/football/cypriot-first-division/table",
		tier: 1,
		enabled: false
	},
	ISRAEL_PREMIER_LEAGUE: {
		name: "Israeli Premier League",
		country: "Israel",
		countryCode: "IL",
		countryFolder: "Israel",
		url: "https://www.bbc.co.uk/sport/football/israeli-premier-league/table",
		tier: 1,
		enabled: false
	},

	// UK Leagues (already present but included for completeness)
	SCOTLAND_PREMIERSHIP: {
		name: "Scottish Premiership",
		country: "Scotland",
		countryCode: "SC",
		countryFolder: "Scotland",
		url: "https://www.bbc.co.uk/sport/football/scottish-premiership/table",
		tier: 1,
		enabled: true // Default enabled for backward compatibility
	},
	SCOTLAND_CHAMPIONSHIP: {
		name: "Scottish Championship",
		country: "Scotland",
		countryCode: "SC",
		countryFolder: "Scotland",
		url: "https://www.bbc.co.uk/sport/football/scottish-championship/table",
		tier: 2,
		enabled: false
	},
	ENGLAND_PREMIER_LEAGUE: {
		name: "English Premier League",
		country: "England",
		countryCode: "EN",
		countryFolder: "England",
		url: "https://www.bbc.co.uk/sport/football/premier-league/table",
		tier: 1,
		enabled: false
	},
	CYMRU_PREMIER_LEAGUE: {
		name: "Cymru Premier",
		country: "Wales",
		countryCode: "WAL",
		countryFolder: "Wales",
		url: "https://www.bbc.co.uk/sport/football/cymru-premier/table",
		tier: 1,
		enabled: false
	}
};

// ============================================================================
// LEAGUE GROUPING BY REGION (for organized dropdown/menu display)
// ============================================================================
const LEAGUE_REGIONS = {
	Scandinavia: [
		"NORWAY_ELITESERIEN",
		"SWEDEN_ALLSVENSKAN",
		"DENMARK_SUPERLIGA",
		"FINLAND_VEIKKAUSLIIGA",
		"ICELAND_URVALSDEILD",
		"LATVIA_VIRSLIGA",
	],
	"Central Europe": [
		"GERMANY_BUNDESLIGA",
		"AUSTRIA_BUNDESLIGA",
		"CZECH_LIGA",
		"HUNGARY_NBI",
		"POLAND_EKSTRAKLASA",
		"SWITZERLAND_SUPER_LEAGUE",
		"BULGARIA_FIRST_LEAGUE",
		"KOSOVO_SUPER_LEAGUE",
		"SERBIA_SUPER_LIGA",
		"MOLDOVA_SUPER_LIGA",
		"MONTENEGRO_FIRST_LEAGUE",
		"NORTH_MACEDONIA_FIRST_LEAGUE",
	],
	"Western Europe": [
		"FRANCE_LIGUE1",
		"NETHERLANDS_EREDIVISIE",
		"BELGIUM_PRO_LEAGUE",

	],
	"Southern Europe": [
		"SPAIN_LA_LIGA",
		"ITALY_SERIE_A",
		"PORTUGAL_PRIMEIRA_LIGA",

	],
	"Eastern Europe": [
		"UKRAINE_PREMIER_LEAGUE",
		"ROMANIA_LIGA_I",
		"CROATIA_HNL",
		"SLOVENIA_PRVA_LIGA",
		"SERBIA_SUPER_LIGA",
		"SLOVAKIA_SUPER_LIGA",
		"KAZAKHSTAN_PYRKOVKA",
		"AZERBAIJAN_PYRKOVKA"
		
	],
	Mediterranean: ["GREECE_SUPER_LEAGUE", "TURKEY_SUPER_LIG", "CYPRUS_FIRST_DIVISION", "ISRAEL_PREMIER_LEAGUE"],
	"United Kingdom": [
		"SCOTLAND_PREMIERSHIP",
		"SCOTLAND_CHAMPIONSHIP",
		"ENGLAND_PREMIER_LEAGUE",
		"ENGLAND_CHAMPIONSHIP",
		"CYMRU_PREMIER_LEAGUE"
	]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all available European leagues
 * @returns {object} All league configurations
 */
function getAllLeagues() {
	return EUROPEAN_LEAGUES;
}

/**
 * Get all tier-1 (top-tier) leagues only
 * @returns {object} Filtered league configurations for tier-1 only
 */
function getTierOneLeagues() {
	const tierOne = {};
	Object.entries(EUROPEAN_LEAGUES).forEach(([code, league]) => {
		if (league.tier === 1) {
			tierOne[code] = league;
		}
	});
	return tierOne;
}

/**
 * Get leagues by region
 * @param {string} region - Region name (e.g., "Scandinavia", "Western Europe")
 * @returns {object} Leagues in that region
 */
function getLeaguesByRegion(region) {
	const codes = LEAGUE_REGIONS[region] || [];
	const result = {};
	codes.forEach((code) => {
		if (EUROPEAN_LEAGUES[code]) {
			result[code] = EUROPEAN_LEAGUES[code];
		}
	});
	return result;
}

/**
 * Get league by code
 * @param {string} code - League code
 * @returns {object} League configuration or null
 */
function getLeague(code) {
	return EUROPEAN_LEAGUES[code] || null;
}

/**
 * Get all available regions
 * @returns {Array} Array of region names
 */
function getRegions() {
	return Object.keys(LEAGUE_REGIONS);
}

/**
 * Get countries represented in European leagues
 * @returns {Array} Unique country names sorted alphabetically
 */
function getCountries() {
	const countries = new Set();
	Object.values(EUROPEAN_LEAGUES).forEach((league) => {
		countries.add(league.country);
	});
	return Array.from(countries).sort();
}

/**
 * Validate league code exists and is tier-1
 * @param {string} code - League code to validate
 * @param {boolean} tierOneOnly - If true, only accept tier-1 leagues
 * @returns {boolean} True if valid, false otherwise
 */
function isValidLeague(code, tierOneOnly = false) {
	const league = EUROPEAN_LEAGUES[code];
	if (!league) return false;
	if (tierOneOnly && league.tier !== 1) return false;
	return true;
}

/**
 * Convert legacy league names to new format
 * Maps old config keys (e.g., "showSPFL") to new format
 * @param {object} legacyConfig - Old config object
 * @returns {object} New format config with selectedLeagues array
 */
function migrateConfig(legacyConfig) {
	const selectedLeagues = [];

	// Map legacy keys to new league codes
	const legacyMap = {
		showSPFL: "SCOTLAND_PREMIERSHIP",
		showSPFLC: "SCOTLAND_CHAMPIONSHIP",
		showEPL: "ENGLAND_PREMIER_LEAGUE"
	};

	Object.entries(legacyMap).forEach(([oldKey, newCode]) => {
		if (legacyConfig[oldKey] === true) {
			selectedLeagues.push(newCode);
		}
	});

	// Also keep UEFA leagues if they were enabled
	if (legacyConfig.showUCL) selectedLeagues.push("UEFA_CHAMPIONS_LEAGUE");
	if (legacyConfig.showUEL) selectedLeagues.push("UEFA_EUROPA_LEAGUE");
	if (legacyConfig.showECL)
		selectedLeagues.push("UEFA_EUROPA_CONFERENCE_LEAGUE");

	return {
		...legacyConfig,
		selectedLeagues:
			selectedLeagues.length > 0 ? selectedLeagues : ["SCOTLAND_PREMIERSHIP"]
	};
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================
if (typeof module !== "undefined" && module.exports) {
	module.exports = {
		EUROPEAN_LEAGUES,
		LEAGUE_REGIONS,
		getAllLeagues,
		getTierOneLeagues,
		getLeaguesByRegion,
		getLeague,
		getRegions,
		getCountries,
		isValidLeague,
		migrateConfig
	};
}
