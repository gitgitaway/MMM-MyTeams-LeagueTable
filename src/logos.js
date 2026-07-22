import { COMMON_SUFFIXES, TEAM_ALIASES } from './constants';

export const logos = {
	// ===== NEW: Build normalized team lookup map =====
	// Creates a case-insensitive, whitespace-normalized lookup for team logo mappings
	// Handles common naming variations (e.g., "St Mirren" vs "st mirren", "ST. MIRREN", etc.)
	// Also handles suffix/prefix variations like FC, SC, AC in any case combination
	// Also handles diacritics (accents, umlauts) - "Atlético" matches "Atletico"
	buildNormalizedTeamMap() {
		var self = this;
		this.normalizedTeamLogoMap = {};
		this.fuzzyTeamLogoMap = {}; // New: map for stripping all non-alphanumeric chars

		// Common football club suffixes/prefixes to handle
		var commonSuffixes = COMMON_SUFFIXES;

		// Function to generate alternative diacritics spellings
		var getAlternativeDiacriticsSpellings = function (str) {
			if (!str) return [];
			var variants = [];
			if (str.match(/[öüä]/i)) {
				var withOe = str
					.replace(/ö/gi, (m) => (m === "ö" ? "oe" : "OE"))
					.replace(/ü/gi, (m) => (m === "ü" ? "ue" : "UE"))
					.replace(/ä/gi, (m) => (m === "ä" ? "ae" : "AE"));
				variants.push(self.normalizeTeamName(withOe));
			}
			return variants;
		};

		// Normalize function for logo mappings
		var normalize = function (str) {
			return self.normalizeTeamName(str);
		};

		// Fuzzy normalize: remove everything except alphanumeric characters
		var fuzzyNormalize = function (str) {
			return self.fuzzyNormalizeTeamName(str);
		};

		// Function to strip common suffixes/prefixes
		var stripSuffixes = function (str) {
			var normalized = normalize(str);
			var parts = normalized.split(" ");
			var stripped = normalized;

			if (parts.length > 1) {
				var lastWord = parts[parts.length - 1];
				if (commonSuffixes.indexOf(lastWord) !== -1) {
					stripped = parts.slice(0, -1).join(" ");
				}
				var firstWord = parts[0];
				if (commonSuffixes.indexOf(firstWord) !== -1) {
					stripped = parts.slice(1).join(" ");
				}
			}
			return stripped.trim();
		};

		// Build map with normalized keys and suffix variations
		Object.keys(this.mergedTeamLogoMap).forEach((teamName) => {
			var normalized = normalize(teamName);
			var fuzzy = fuzzyNormalize(teamName);
			var stripped = stripSuffixes(teamName);

			if (normalized && normalized.length > 0) {
				// Add normalized version
				this.normalizedTeamLogoMap[normalized] =
					this.mergedTeamLogoMap[teamName];

				// Add fuzzy version
				if (fuzzy && fuzzy.length > 0) {
					this.fuzzyTeamLogoMap[fuzzy] = this.mergedTeamLogoMap[teamName];
				}

				// Add stripped version (without common suffixes/prefixes)
				if (stripped !== normalized && stripped.length > 0) {
					this.normalizedTeamLogoMap[stripped] =
						this.mergedTeamLogoMap[teamName];
				}

				// Also add common suffix variants if they don't already exist
				// This helps find "Arsenal" even if mapped as "Arsenal FC"
				commonSuffixes.forEach((suffix) => {
					var withSuffix = `${normalized} ${suffix}`;
					if (!this.normalizedTeamLogoMap[withSuffix]) {
						this.normalizedTeamLogoMap[withSuffix] =
							this.mergedTeamLogoMap[teamName];
					}
				});

				// Add alternative Anglicization variants (ö→oe, ü→ue, ä→ae)
				// This helps find "Koeln" when mapped as "Köln"
				getAlternativeDiacriticsSpellings(teamName).forEach((variant) => {
					if (variant && !this.normalizedTeamLogoMap[variant]) {
						this.normalizedTeamLogoMap[variant] =
							this.mergedTeamLogoMap[teamName];
					}
					// Also add stripped version of variant
					var strippedVariant = stripSuffixes(variant);
					if (
						strippedVariant &&
						strippedVariant !== variant &&
						!this.normalizedTeamLogoMap[strippedVariant]
					) {
						this.normalizedTeamLogoMap[strippedVariant] =
							this.mergedTeamLogoMap[teamName];
					}
				});
			}
		});

		// Add country name synonyms and variations to the normalized map
		const aliases = this.teamAliases || TEAM_ALIASES;
		Object.keys(aliases).forEach((alias) => {
			var targetName = aliases[alias];
			var normalizedAlias = normalize(alias);

			// Find the logo path for the target name (it should already be in the map)
			var logoPath =
				this.mergedTeamLogoMap[targetName] ||
				this.normalizedTeamLogoMap[normalize(targetName)];

			if (logoPath && !this.normalizedTeamLogoMap[normalizedAlias]) {
				this.normalizedTeamLogoMap[normalizedAlias] = logoPath;

				// Also add stripped version of the alias
				var strippedAlias = stripSuffixes(normalizedAlias);
				if (
					strippedAlias &&
					strippedAlias !== normalizedAlias &&
					!this.normalizedTeamLogoMap[strippedAlias]
				) {
					this.normalizedTeamLogoMap[strippedAlias] = logoPath;
				}
			}
		});

		this.log(
			3, "LOGO", `Built normalized team map with ${
				Object.keys(this.normalizedTeamLogoMap).length
			} entries (diacritics removed, Anglicization variants added, case/whitespace normalized, suffix/prefix variants, common abbreviations)`
		);
	},

	// ===== NEW: Get team logo mapping with intelligent lookup =====
	// Tries multiple matching strategies:
	// 1. Exact match (fastest)
	// 2. Normalized match (case-insensitive, whitespace-normalized, diacritics removed)
	// 3. Suffix/prefix variants (handles AFC, VFB, FC, SC, AC in any case, no length restrictions)
	// 4. Diacritic variants (handles accents/umlauts AND Anglicization: Atlético→Atletico, Köln→Koln or Koeln)
	getTeamLogoMapping(teamName) {
		if (!teamName) return null;

		let logoPath = null;

		// If we already have a mapping for this name in our local maps (initialized at startup),
		// we can still return it as a backup.
		if (this.mergedTeamLogoMap && this.mergedTeamLogoMap[teamName]) {
			logoPath = this.mergedTeamLogoMap[teamName];
		}

		if (!logoPath) {
			var normalized = this.normalizeTeamName(teamName);

			// Try normalized match (handles case/whitespace/punctuation/diacritics variations and Anglicization variants)
			if (this.normalizedTeamLogoMap[normalized]) {
				this.log(
					4, "LOGO", `Found normalized mapping for '${teamName}' as '${normalized}' (diacritics/case/whitespace normalized, Anglicization variants like Köln→koeln supported)`
				);
				logoPath = this.normalizedTeamLogoMap[normalized];
			} else {
				// Try stripping common suffixes/prefixes
				var commonSuffixes = COMMON_SUFFIXES;
				var parts = normalized.split(" ");
				var stripped = normalized;

				// Check if last word is a common suffix
				if (parts.length > 1) {
					var lastWord = parts[parts.length - 1];
					if (commonSuffixes.indexOf(lastWord) !== -1) {
						stripped = parts.slice(0, -1).join(" ");
					}
					var firstWord = parts[0];
					if (commonSuffixes.indexOf(firstWord) !== -1) {
						stripped = parts.slice(1).join(" ");
					}
				}

				if (stripped !== normalized && this.normalizedTeamLogoMap[stripped]) {
					this.log(
						4, "LOGO", `Found suffix/prefix variant mapping for '${teamName}' -> '${stripped}'`
					);
					logoPath = this.normalizedTeamLogoMap[stripped];
				} else {
					// STRATEGY 4: Fuzzy match (strip all non-alphanumeric chars)
					var fuzzy = this.fuzzyNormalizeTeamName(teamName);
					if (this.fuzzyTeamLogoMap[fuzzy]) {
						this.log(
							4, "LOGO", `Found fuzzy mapping for '${teamName}' -> '${fuzzy}'`
						);
						logoPath = this.fuzzyTeamLogoMap[fuzzy];
					}
				}
			}
		}

		if (logoPath) {
			// Prepend module path if it's a relative path (e.g. "crests/...")
			if (logoPath.indexOf("http") !== 0 && logoPath.indexOf("/") !== 0) {
				return this.file(`images/${logoPath}`);
			}
			return logoPath;
		}

		// Log unmapped teams for debugging
		this.log(
			2, "LOGO", `NO MAPPING FOUND for team '${teamName}'.`
		);

		return null;
	},

	setupLazyLoading() {
		if (!("IntersectionObserver" in window)) {
			this.imageObserver = null;
			return;
		}
		this.imageObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const img = entry.target;
					const dataSrc = img.getAttribute("data-src");
					if (dataSrc) {
						img.src = dataSrc;
						img.removeAttribute("data-src");
						this.imageObserver.unobserve(img);
					}
				}
			});
		}, { rootMargin: "50px" });
	},

	setupImageLazyLoading(img, src) {
		if (this.imageObserver) {
			img.setAttribute("data-src", src);
			img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E';
			img.loading = "lazy";
			this.imageObserver.observe(img);
		} else {
			img.src = src;
			img.loading = "lazy";
		}
	},

	loadLogoMappings() {
		const url = this.file("team-logo-mappings.js");
		return this.loadScript(url).then(() => {
			this.mergedTeamLogoMap = Object.assign({}, window.TEAM_LOGO_MAPPINGS || {}, this.config.teamLogoMap || {});
			this.buildNormalizedTeamMap();
			this._lastRenderedKey = null;
			this.updateDom(this.config.animationSpeed);
		}).catch((err) => this.log(1, "LOGO", `Could not load team-logo-mappings.js: ${err.message}`));
	},

	/**
	 * Get the flag/logo for a given league (P-08)
	 * @param {string} leagueCode - The league identifier
	 * @returns {string|null} - The path to the flag image
	 */
	getLeagueFlag(leagueCode) {
		const uefaLeagues = ["UEFA_CHAMPIONS_LEAGUE", "UCL"];
		const europaLeagues = ["UEFA_EUROPA_LEAGUE", "UEL"];
		const conferenceLeagues = ["UEFA_EUROPA_CONFERENCE_LEAGUE", "ECL"];
		
		if (uefaLeagues.includes(leagueCode)) return this.file("images/UCL.png");
		if (europaLeagues.includes(leagueCode)) return this.file("images/UEL.png");
		if (conferenceLeagues.includes(leagueCode)) return this.file("images/UECL.png");
		if (leagueCode === "WORLD_CUP_2026") return this.file("images/WC2026.png");
		
		// For other leagues, look up in EUROPEAN_LEAGUES
		if (typeof EUROPEAN_LEAGUES !== "undefined" && EUROPEAN_LEAGUES[leagueCode]) {
			const config = EUROPEAN_LEAGUES[leagueCode];
			const countryFolder = config.countryFolder || config.country;
			// Normalization for flag filename
			const flagName = (config.country || "").toLowerCase().replace(/\s+/g, "_");
			return this.file(`images/crests/${countryFolder}/${flagName}.png`);
		}
		
		// Core leagues fallback
		if (leagueCode === "SCOTLAND_PREMIERSHIP" || leagueCode === "SCOTLAND_CHAMPIONSHIP" || leagueCode === "SPFL" || leagueCode === "SPFLC") 
			return this.file("images/crests/Scotland/scotland.png");
		if (leagueCode === "ENGLAND_PREMIER_LEAGUE" || leagueCode === "EPL") 
			return this.file("images/crests/England/england.png");
            
		return null;
	}
};
