import { LEAGUE_TABS, LEAGUE_HEADERS, EUROPEAN_LEAGUES, COMMON_SUFFIXES, LEGACY_CODE_MAP } from './constants';

export const utils = {
	/**
	 * Enhanced logger for the frontend (DEBUG-02, DEBUG-04)
	 * @param {number} level - 1=ERROR, 2=WARN, 3=INFO, 4=DEBUG
	 * @param {string} subsystem - The subsystem (e.g., CORE, CACHE, PARSER)
	 * @param {string} message - The message to log
	 * @param {any} data - Optional data to log alongside the message
	 */
	log(level, subsystem, message, data = null) {
		const debugLevel = this.config ? (this.config.debugLevel !== undefined ? this.config.debugLevel : (this.config.debug ? 4 : 1)) : 1;
		if (level > debugLevel) return;

		const levels = ["", "ERROR", "WARN", "INFO", "DEBUG"];
		const prefix = ` MMM-MyTeams-LeagueTable: [${subsystem}] [${levels[level]}]`;
		
		switch(level) {
			case 1: Log.error(`${prefix} ${message}`, data || ""); break;
			case 2: Log.warn(`${prefix} ${message}`, data || ""); break;
			case 3: Log.info(`${prefix} ${message}`, data || ""); break;
			case 4: Log.info(`${prefix} ${message}`, data || ""); break;
			default: Log.log(`${prefix} ${message}`, data || ""); break;
		}
	},

	/**
	 * Gets the current date, with optional override for testing.
	 * Validates dateTimeOverride to prevent invalid date exploits.
	 * @returns {Date} The current or overridden date
	 */
	getCurrentDate() {
		if (this.config.dateTimeOverride) {
			const validated = this.validateDateTimeOverride(
				this.config.dateTimeOverride
			);
			if (validated) {
				this.log(
					3, "CORE", `Using validated date override: ${this.config.dateTimeOverride} -> ${validated.toISOString()}`
				);
				return validated;
			}
		}
		return new Date();
	},

	/**
	 * Security helper: Validates dateTimeOverride input to prevent invalid dates and exploits.
	 * @param {string} dateString - The ISO date string to validate
	 * @returns {Date|null} The validated Date object or null if invalid
	 */
	validateDateTimeOverride(dateString) {
		if (!dateString || typeof dateString !== "string") {
			this.log(2, "CORE", `Invalid dateTimeOverride type: ${typeof dateString}`);
			return null;
		}

		const override = new Date(dateString);

		if (isNaN(override.getTime())) {
			this.log(2, "CORE", `Invalid dateTimeOverride format: ${dateString}`);
			return null;
		}

		const year = override.getFullYear();
		if (year < 1900 || year > 2100) {
			this.log(2, "CORE", `dateTimeOverride year out of range (1900-2100): ${dateString} (year: ${year})`);
			return null;
		}

		return override;
	},

	/**
	 * Security helper: Validates CSS color values to prevent CSS injection.
	 * Supports Hex, RGB, RGBA, and basic named colors.
	 * @param {string} color - The color string to validate
	 * @returns {boolean} True if valid
	 */
	isValidColor(color) {
		if (!color || typeof color !== "string") return false;
		const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$|^#([A-Fa-f0-9]{4}){1,2}$/;
		const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
		const rgbaRegex = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([0-1]?\.?\d+)\s*\)$/;
		const namedColors = [
			"white", "black", "red", "green", "blue", "yellow", "orange", "purple", "grey", "gray", "transparent", "inherit", "initial", "unset"
		];

		return (
			hexRegex.test(color) ||
			rgbRegex.test(color) ||
			rgbaRegex.test(color) ||
			namedColors.includes(color.toLowerCase())
		);
	},

	getCurrentDateString() {
		return this.getCurrentDate().toLocaleDateString("en-CA");
	},

	/**
	 * Standardize team names for mapping lookups (case-insensitive, whitespace-normalized, diacritics removed)
	 * @param {string} name - The team name to normalize
	 * @returns {string} The normalized team name
	 */
	normalizeTeamName(name) {
		if (!name || typeof name !== "string") return "";

		// 1. Convert to string and trim
		let result = String(name).trim();

		// 2. Remove diacritics (accents, umlauts) - "Atlético" -> "Atletico"
		result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

		// 3. Lowercase and strip common tournament suffixes/words
		return result
			.toLowerCase()
			.replace(/\([^)]*\)/g, "") // Strip anything in parentheses like (Host) or (Title Holder)
			.replace(/\b(and|the|of|rep|republic)\b/g, "") // Strip common words
			.replace(/&/g, " ")
			.replace(/[-]/g, " ") // Replace hyphens with spaces
			.replace(/\s+/g, " ")
			.trim()
			.replace(/[.,]/g, "");
	},

	/**
	 * Fuzzy normalization for team names (removes all non-alphanumeric characters)
	 * @param {string} str - The team name to normalize
	 * @returns {string} The fuzzy normalized team name
	 */
	fuzzyNormalizeTeamName(str) {
		const norm = this.normalizeTeamName(str);
		return norm.replace(/[^a-z0-9]/g, "");
	},

	/**
	 * Dynamic script loader
	 * @param {string} url - The URL of the script to load
	 * @returns {Promise}
	 */
	loadScript(url) {
		return new Promise((resolve, reject) => {
			if (document.querySelector(`script[src="${url}"]`)) return resolve();
			const script = document.createElement("script");
			script.src = url;
			script.onload = resolve;
			script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
			document.head.appendChild(script);
		});
	}
};
