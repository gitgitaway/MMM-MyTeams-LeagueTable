/**
 * LogoResolver utility for node_helper.js
 * Handles intelligent team logo matching logic on the server side.
 * Migrated from client-side for performance and memory optimization.
 */

const TEAM_LOGO_MAPPINGS = require("./team-logo-mappings.js");

class LogoResolver {
	constructor() {
		this.normalizedTeamLogoMap = {};
		this.fuzzyTeamLogoMap = {};
		this.normalizedNameCache = new Map(); // LRU cache for normalized names (max 500 entries)
		this.maxNormalizedCacheSize = 500;
		this.commonSuffixes = [
			"fc",
			"sc",
			"ac",
			"cf",
			"sk",
			"if",
			"bk",
			"fk",
			"ik",
			"aik",
			"afc",
			"vfb",
			"unt",
			"fn"
		];
		this.teamAliases = {
			"cabo verde": "Cape Verde",
			"cape verde islands": "Cape Verde",
			"ir iran": "Iran",
			"iran, islamic republic of": "Iran",
			"south korea": "Rep. of Korea",
			"korea republic": "Rep. of Korea",
			"korea, republic of": "Rep. of Korea",
			"côte d'ivoire": "Ivory Coast",
			"cote d'ivoire": "Ivory Coast",
			"bosnia-herzegovina": "Bosnia and Herzegovina",
			"bosnia & herzegovina": "Bosnia and Herzegovina",
			curacao: "Curaçao",
			usa: "United States",
			"united states (host)": "United States",
			"mexico (host)": "Mexico",
			"canada (host)": "Canada",
			"argentina (title holder)": "Argentina",
			"united states of america": "United States",
			czechia: "Czech Republic",
			"check republic": "Czech Republic",
			"congo dr": "DR Congo",
			"democratic republic of congo": "DR Congo",
			"rd congo": "DR Congo",
			"democratic republic of the congo": "DR Congo",
			türkiye: "Turkey",
			"north macedonia": "Macedonia",
			"viet nam": "Vietnam",
			eswatini: "Swaziland"
		};

		// Initial build with default mappings
		this.buildNormalizedTeamMap(TEAM_LOGO_MAPPINGS);
	}

	/**
	 * Remove diacritics and handle special characters
	 */
	removeDiacritics(str) {
		if (!str) return str;
		let result = str.replace(/ß/g, "ss");
		result = result.replace(/ø/g, "o");
		result = result.replace(/æ/g, "ae");
		return result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	}

	/**
	 * Standard normalization for lookup keys (with LRU caching)
	 */
	normalize(str) {
		if (!str) return "";

		// 1. Resolve aliases if defined (use the raw name first, trimmed and lowercase)
		const lookupKey = str.trim().toLowerCase();
		if (this.teamAliases && this.teamAliases[lookupKey]) {
			str = this.teamAliases[lookupKey];
		}

		// Check cache next (using the potentially aliased name)
		if (this.normalizedNameCache.has(str)) {
			const cached = this.normalizedNameCache.get(str);
			// LRU: Move to end by deleting and re-adding
			this.normalizedNameCache.delete(str);
			this.normalizedNameCache.set(str, cached);
			return cached;
		}

		// Perform normalization
		const normalized = this.removeDiacritics(str)
			.toLowerCase()
			.replace(/\([^)]*\)/g, "") // Strip anything in parentheses
			.replace(/\b(and|the|of|rep|republic)\b/g, "") // Strip common words
			.replace(/&/g, " ")
			.replace(/[-]/g, " ") // Replace hyphens with spaces
			.replace(/\s+/g, " ")
			.trim()
			.replace(/[.,]/g, "");

		// Add to cache with LRU eviction
		if (this.normalizedNameCache.size >= this.maxNormalizedCacheSize) {
			// Remove oldest entry (first in Map)
			const oldestKey = this.normalizedNameCache.keys().next().value;
			this.normalizedNameCache.delete(oldestKey);
		}
		this.normalizedNameCache.set(str, normalized);

		return normalized;
	}

	/**
	 * Fuzzy normalization (alphanumeric only)
	 */
	fuzzyNormalize(str) {
		const norm = this.normalize(str);
		return norm.replace(/[^a-z0-9]/g, "");
	}

	/**
	 * Strip common football club suffixes/prefixes
	 */
	stripSuffixes(str) {
		const normalized = this.normalize(str);
		const parts = normalized.split(" ");
		let stripped = normalized;

		if (parts.length > 1) {
			const lastWord = parts[parts.length - 1];
			if (this.commonSuffixes.indexOf(lastWord) !== -1) {
				stripped = parts.slice(0, -1).join(" ");
			}
		}
		if (parts.length > 1 && stripped === normalized) {
			const firstWord = parts[0];
			if (this.commonSuffixes.indexOf(firstWord) !== -1) {
				stripped = parts.slice(1).join(" ");
			}
		}
		return stripped.trim();
	}

	/**
	 * Generate alternative spellings (e.g. Köln -> Koeln)
	 */
	getAlternativeDiacriticsSpellings(str) {
		if (!str) return [];
		const variants = [];
		if (str.match(/[öüä]/i)) {
			const withOe = str
				.replace(/ö/gi, (m) => (m === "ö" ? "oe" : "OE"))
				.replace(/ü/gi, (m) => (m === "ü" ? "ue" : "UE"))
				.replace(/ä/gi, (m) => (m === "ä" ? "ae" : "AE"));
			variants.push(this.normalize(withOe));
		}
		return variants;
	}

	/**
	 * Pre-calculate maps for fast lookup
	 */
	buildNormalizedTeamMap(baseMap) {
		Object.keys(baseMap).forEach((teamName) => {
			const normalized = this.normalize(teamName);
			const fuzzy = this.fuzzyNormalize(teamName);
			const stripped = this.stripSuffixes(teamName);
			const logoPath = baseMap[teamName];

			if (normalized && normalized.length > 0) {
				this.normalizedTeamLogoMap[normalized] = logoPath;
				if (fuzzy && fuzzy.length > 0) {
					this.fuzzyTeamLogoMap[fuzzy] = logoPath;
				}
				if (stripped !== normalized && stripped.length > 0) {
					this.normalizedTeamLogoMap[stripped] = logoPath;
				}

				this.commonSuffixes.forEach((suffix) => {
					const withSuffix = `${normalized} ${suffix}`;
					if (!this.normalizedTeamLogoMap[withSuffix]) {
						this.normalizedTeamLogoMap[withSuffix] = logoPath;
					}
				});

				this.getAlternativeDiacriticsSpellings(teamName).forEach((variant) => {
					if (variant && !this.normalizedTeamLogoMap[variant]) {
						this.normalizedTeamLogoMap[variant] = logoPath;
					}
					const strippedVariant = this.stripSuffixes(variant);
					if (
						strippedVariant &&
						strippedVariant !== variant &&
						!this.normalizedTeamLogoMap[strippedVariant]
					) {
						this.normalizedTeamLogoMap[strippedVariant] = logoPath;
					}
				});
			}
		});

		// Add aliases
		Object.keys(this.teamAliases).forEach((alias) => {
			const targetName = this.teamAliases[alias];
			const normalizedAlias = this.normalize(alias);
			const logoPath =
				baseMap[targetName] ||
				this.normalizedTeamLogoMap[this.normalize(targetName)];

			if (logoPath && !this.normalizedTeamLogoMap[normalizedAlias]) {
				this.normalizedTeamLogoMap[normalizedAlias] = logoPath;
				const strippedAlias = this.stripSuffixes(normalizedAlias);
				if (
					strippedAlias &&
					strippedAlias !== normalizedAlias &&
					!this.normalizedTeamLogoMap[strippedAlias]
				) {
					this.normalizedTeamLogoMap[strippedAlias] = logoPath;
				}
			}
		});
	}

	/**
	 * Resolve logo path for a given team name
	 */
	getLogo(teamName, customMappings = {}) {
		if (!teamName) return null;

		const debug = true; // Temporary for troubleshooting

		// 1. Check custom mappings from config first
		if (customMappings[teamName]) return customMappings[teamName];

		const normalizedCustom = this.normalize(teamName);
		// Check if any custom mapping matches normalized name
		for (const key of Object.keys(customMappings)) {
			if (this.normalize(key) === normalizedCustom) return customMappings[key];
		}

		// 2. Check exact match in base mappings
		if (TEAM_LOGO_MAPPINGS[teamName]) return TEAM_LOGO_MAPPINGS[teamName];

		// 3. Check normalized map
		const normalized = this.normalize(teamName);
		if (this.normalizedTeamLogoMap[normalized])
			return this.normalizedTeamLogoMap[normalized];

		// 4. Check stripped version
		const stripped = this.stripSuffixes(teamName);
		if (this.normalizedTeamLogoMap[stripped])
			return this.normalizedTeamLogoMap[stripped];

		// 5. Check fuzzy map (AGGRESSIVE)
		const fuzzy = this.fuzzyNormalize(teamName);
		if (this.fuzzyTeamLogoMap[fuzzy]) {
			if (debug)
				console.log(
					` [LogoResolver] Fuzzy match found: '${teamName}' -> '${fuzzy}'`
				);
			return this.fuzzyTeamLogoMap[fuzzy];
		}

		if (debug) {
			console.warn(
				` [LogoResolver] NO LOGO FOUND for '${teamName}'. Tried: exact, normalized ('${normalized}'), stripped ('${stripped}'), fuzzy ('${fuzzy}')`
			);
		}

		return null;
	}
}

module.exports = new LogoResolver();
