const BaseParser = require("./BaseParser");

/**
 * Wikipedia Parser class for MMM-MyTeams-LeagueTable
 * Handles parsing of league tables from Wikipedia pages.
 *
 * WHY depth-tracking instead of regex for table extraction:
 * Wikipedia articles often contain nested tables (flag icons, sortable headers,
 * mini-tables inside cells). A naive regex like /<table>(.*?)<\/table>/s stops
 * at the FIRST closing </table> tag, cutting the outer table short and producing
 * zero parseable rows. Depth-tracking correctly finds the matching close tag.
 *
 * WHY split-aware heading detection:
 * Leagues like Romania Liga I split mid-season into Championship (top N) and
 * Relegation (bottom M) groups. Wikipedia articles show ALL tables: the pre-split
 * full table, the championship round table, and the relegation round table.
 * Without heading-aware selection, the parser picks the largest table (pre-split
 * or relegation) instead of the post-split championship group that the module
 * should display.
 */
class WikipediaParser extends BaseParser {
	/**
	 * Extract all top-level wikitable HTML strings AND their start positions.
	 * Uses depth-tracking to correctly handle nested tables.
	 * @param {string} html - Full page HTML
	 * @returns {{tableHtml: string, startIdx: number}[]}
	 */
	_extractWikiTables(html) {
		const tables = [];
		const lc = html.toLowerCase();
		let searchFrom = 0;

		while (searchFrom < html.length) {
			const openIdx = lc.indexOf("<table", searchFrom);
			if (openIdx === -1) break;

			const tagEnd = lc.indexOf(">", openIdx);
			if (tagEnd === -1) break;
			const tagText = lc.substring(openIdx, tagEnd + 1);
			if (!tagText.includes("wikitable")) {
				searchFrom = tagEnd + 1;
				continue;
			}

			// Depth-track to find the matching </table>
			let depth = 0;
			let pos = openIdx;
			let tableEnd = -1;

			while (pos < html.length) {
				const nextOpen = lc.indexOf("<table", pos);
				const nextClose = lc.indexOf("</table", pos);

				if (nextClose === -1) break;

				if (nextOpen !== -1 && nextOpen < nextClose) {
					depth++;
					pos = nextOpen + 6;
				} else {
					depth--;
					const closeTagEnd = lc.indexOf(">", nextClose);
					const endPos = closeTagEnd !== -1 ? closeTagEnd + 1 : nextClose + 8;
					if (depth === 0) {
						tableEnd = endPos;
						break;
					}
					pos = endPos;
				}
			}

			if (tableEnd === -1) break;

			tables.push({
				tableHtml: html.substring(openIdx, tableEnd),
				startIdx: openIdx
			});
			searchFrom = tableEnd;
		}

		return tables;
	}

	/**
	 * Find the nearest heading (h2/h3/h4) that precedes a given character position.
	 * Wikipedia headings identify section context for each table (e.g. "Championship round").
	 * @param {string} html - Full page HTML
	 * @param {string} lc - Lowercase version of html (pre-computed for performance)
	 * @param {number} beforeIdx - Character position; look for headings before this position
	 * @returns {string} Lowercase heading text, empty string if none found
	 */
	_findNearestHeading(html, lc, beforeIdx) {
		const headingRegex = /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi;
		let lastHeading = "";
		let match;

		while ((match = headingRegex.exec(html)) !== null) {
			if (match.index >= beforeIdx) break;
			// Strip inner HTML tags and normalise whitespace to get clean heading text
			const text = match[1]
				.replace(/<[^>]*>/g, " ")
				.replace(/\s+/g, " ")
				.trim()
				.toLowerCase();
			if (text) lastHeading = text;
		}

		return lastHeading;
	}

	/**
	 * Generic group-table finder used by both single-group and multi-group strategies.
	 *
	 * Strategy 1 — heading keyword match (most reliable):
	 *   Scan each wikitable's nearest preceding heading for the provided keywords.
	 *   Wikipedia consistently titles split sections (e.g. "Play-off table").
	 *
	 * Strategy 2 — size-based match (fallback when no heading matches):
	 *   Look for a football-like table whose data-row count is within ±2 of expectedSize.
	 *   Tolerance of 2 covers "Source" and "Notes" footer rows that use <td>.
	 *
	 * @param {string} html - Full page HTML
	 * @param {string} lc - Lowercase version of html (pre-computed)
	 * @param {{tableHtml: string, startIdx: number}[]} tables - Extracted wikitables
	 * @param {string[]} keywords - Lowercase heading strings to match
	 * @param {number} expectedSize - Expected number of team rows
	 * @param {Set} usedIndices - Set of table indices already claimed by earlier groups
	 * @returns {{tableHtml: string, tableIndex: number}|null}
	 */
	_findGroupTable(html, lc, tables, keywords, expectedSize, usedIndices) {
		const kws = keywords.map((k) => k.toLowerCase());

		// Strategy 1: heading keyword match
		for (let i = 0; i < tables.length; i++) {
			if (usedIndices && usedIndices.has(i)) continue;
			const { tableHtml, startIdx } = tables[i];
			const heading = this._findNearestHeading(html, lc, startIdx);
			if (!kws.some((kw) => heading.includes(kw))) continue;
			if (this._isScorerTable(tableHtml)) continue;
			if (!this._hasFootballHeaders(tableHtml)) continue;
			return { tableHtml, tableIndex: i };
		}

		// Strategy 2: size match within ±2 tolerance
		if (expectedSize) {
			for (let i = 0; i < tables.length; i++) {
				if (usedIndices && usedIndices.has(i)) continue;
				const { tableHtml } = tables[i];
				if (this._isScorerTable(tableHtml)) continue;
				if (!this._hasFootballHeaders(tableHtml)) continue;

				const rowMatches = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
				const dataRows = rowMatches.filter((r) => /<td/i.test(r));
				if (Math.abs(dataRows.length - expectedSize) <= 2) {
					return { tableHtml, tableIndex: i };
				}
			}
		}

		return null;
	}

	/**
	 * Backward-compatible wrapper: finds the championship group table.
	 * Delegates to the generic _findGroupTable using championship keywords/size.
	 * @param {string} html - Full page HTML
	 * @param {{tableHtml: string, startIdx: number}[]} tables - Extracted wikitables
	 * @param {object} splitConfig - Split config from LEAGUE_SPLITS
	 * @returns {string|null} - HTML string of the championship table, or null
	 */
	_findSplitGroupTable(html, tables, splitConfig) {
		const lc = html.toLowerCase();
		const result = this._findGroupTable(
			html,
			lc,
			tables,
			splitConfig.championshipKeywords || [],
			splitConfig.championshipSize,
			null
		);
		return result ? result.tableHtml : null;
	}

	/**
	 * Extract all team objects from a given wikitable HTML string.
	 * Reuses parseTeamRow for consistent parsing across single and multi-group modes.
	 * @param {string} tableHtml - HTML of one wikitable
	 * @returns {object[]} - Array of parsed team objects
	 */
	_extractTeamsFromTable(tableHtml) {
		const teams = [];
		const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
		let rowMatch;
		let posCounter = 1;
		while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
			const rowHtml = rowMatch[1];
			if (!/<td/i.test(rowHtml)) continue;
			const team = this.parseTeamRow(rowHtml, posCounter);
			if (team) {
				teams.push(team);
				posCounter++;
			}
		}
		return teams;
	}

	/**
	 * Detect if a table is likely a "Top Scorers" table rather than a standings table.
	 * @param {string} tableHtml
	 * @returns {boolean}
	 */
	_isScorerTable(tableHtml) {
		const tl = tableHtml.toLowerCase();
		// Scorer tables have "Goals" or "Scorer" headers but usually lack "Pts" or "Pld"
		const hasScorerHeaders =
			tl.includes(">goals<") ||
			tl.includes(">scorer<") ||
			tl.includes(">player<");
		const hasStandingsHeaders =
			tl.includes(">pts<") ||
			tl.includes(">points<") ||
			tl.includes(">pld<") ||
			tl.includes(">played<");

		return hasScorerHeaders && !hasStandingsHeaders;
	}

	/**
	 * Verify if a table has standard football standings headers.
	 * @param {string} tableHtml
	 * @returns {boolean}
	 */
	_hasFootballHeaders(tableHtml) {
		const tl = tableHtml.toLowerCase();
		const footballHeaders = [
			"team",
			"club",
			"pos",
			"pld",
			"played",
			"pts",
			"points",
			"mp"
		];
		// Require at least two standard headers to match, and at least one MUST be a stats header
		let matchCount = 0;
		let hasStatsHeader = false;
		for (const h of footballHeaders) {
			if (
				tl.includes(`>${h}<`) ||
				tl.includes(`>${h}.<`) ||
				tl.includes(`>${h} `)
			) {
				matchCount++;
				if (["pld", "played", "pts", "points", "mp"].includes(h)) {
					hasStatsHeader = true;
				}
			}
		}
		return matchCount >= 2 && hasStatsHeader;
	}

	/**
	 * Parse league data from Wikipedia HTML.
	 *
	 * Multi-group mode (splitConfig.showAllGroups === true):
	 *   Iterates splitConfig.groups and finds a wikitable for each group definition
	 *   using heading keywords first, then size matching.  Returns a splitGroups array
	 *   alongside teams (= championship group, for backward compatibility).
	 *   Groups that cannot be found are skipped gracefully — partial results are returned
	 *   so a partially-complete display is shown rather than nothing at all.
	 *
	 * Single-group fallback:
	 *   Uses heading keywords to find the championship group, then falls back to the
	 *   most-rows heuristic for non-split leagues or before the split has occurred.
	 *
	 * @param {string} html - HTML to parse
	 * @param {string} leagueType - Type of league
	 * @param {object|null} splitConfigParam - Directly passed splitConfig (avoids race condition)
	 * @returns {object|null} - Parsed league data
	 */
	parseLeagueData(html, leagueType, splitConfigParam) {
		try {
			// Prefer the directly-passed splitConfig (avoids shared-singleton race condition)
			// and fall back to the stored this.config.splitConfig for backward compatibility.
			const splitConfig =
				splitConfigParam || (this.config && this.config.splitConfig) || null;
			this.logDebug(
				`Starting to parse ${leagueType} HTML data from Wikipedia${
					splitConfig ? " (split-league)" : ""
				}`
			);

			const allTablesWithPos = this._extractWikiTables(html);
			this.logDebug(`Found ${allTablesWithPos.length} wikitables on page`);

			const lc = html.toLowerCase();

			// === MULTI-GROUP PATH ===
			// When splitConfig defines a groups array, find each group's table independently.
			// usedIndices prevents the same wikitable being claimed by two groups.
			if (
				splitConfig &&
				splitConfig.showAllGroups &&
				Array.isArray(splitConfig.groups) &&
				splitConfig.groups.length > 1 &&
				allTablesWithPos.length > 0
			) {
				const usedIndices = new Set();
				const splitGroups = [];

				for (const groupDef of splitConfig.groups) {
					const result = this._findGroupTable(
						html,
						lc,
						allTablesWithPos,
						groupDef.keywords || [],
						groupDef.size,
						usedIndices
					);

					if (result) {
						usedIndices.add(result.tableIndex);
						const groupTeams = this._extractTeamsFromTable(result.tableHtml);
						if (groupTeams.length > 0) {
							splitGroups.push({ label: groupDef.label, teams: groupTeams });
							this.logDebug(
								`[Multi-group] Found "${groupDef.label}" with ${groupTeams.length} teams`
							);
						}
					} else {
						this.logDebug(
							`[Multi-group] Could not find table for group "${groupDef.label}"`
						);
					}
				}

				if (splitGroups.length > 0) {
					// Phase 2 check: Only return split groups if at least some games have been played.
					// This prevents placeholder empty split tables from overriding the pre-split table
					// at the start of a new season.
					// INNOV-06: During start-of-season (July/August/Sept), we accept 0 games played.
					const currentMonth = this.getCurrentDate().getMonth();
					const isStartOfSeason = currentMonth >= 6 && currentMonth <= 8;

					const splitMaxPlayed = splitGroups.reduce((max, group) => {
						const groupMax = group.teams.reduce((m, t) => Math.max(m, t.played || 0), 0);
						return Math.max(max, groupMax);
					}, 0);

					if (splitMaxPlayed > 0) {
						// teams = top group teams for backward compat with isDataComplete / pre-split guard
						const topTeams = splitGroups[0].teams;
						this.logDebug(
							`[Multi-group] Returning ${splitGroups.length} groups for ${leagueType}`
						);
						return {
							teams: topTeams,
							splitGroups: splitGroups,
							isSplit: true,
							lastUpdated: new Date().toISOString(),
							source: "Wikipedia",
							leagueType: leagueType
						};
					}
				}
				// If no group tables were found (split not yet occurred), fall through to single-group path
				this.logDebug(
					`[Multi-group] No group tables found yet for ${leagueType} — pre-split season`
				);
			}

			// === SINGLE-GROUP / PRE-SPLIT PATH ===
			let bestTable = null;
			let splitGroupFound = false;

			// Try to locate the championship group table via the legacy championshipKeywords
			if (splitConfig && allTablesWithPos.length > 0) {
				const champTable = this._findSplitGroupTable(
					html,
					allTablesWithPos,
					splitConfig
				);
				if (champTable) {
					// Phase 2 check for single-group split path
					const teams = this._extractTeamsFromTable(champTable);
					const maxPlayed = teams.reduce((m, t) => Math.max(m, t.played || 0), 0);
					
					if (maxPlayed > 0) {
						bestTable = champTable;
						splitGroupFound = true;
						this.logDebug(
							`[Split] Found championship group table for ${leagueType}`
						);
					} else {
						this.logDebug(
							`[Split] Championship group table found but is empty (0 games played) — falling back to regular table`
						);
					}
				} else {
					this.logDebug(
						`[Split] No championship group table found for ${leagueType} — using full table`
					);
				}
			}

			// Final fallback: largest valid football table (regular season or non-split league)
			if (!bestTable) {
				let maxRows = 0;
				for (const { tableHtml } of allTablesWithPos) {
					if (this._isScorerTable(tableHtml)) continue;
					if (!this._hasFootballHeaders(tableHtml)) continue;
					const rowMatches = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
					const dataRows = rowMatches.filter((r) => /<td/i.test(r));
					if (dataRows.length > maxRows) {
						maxRows = dataRows.length;
						bestTable = tableHtml;
					}
				}
			}

			if (!bestTable) {
				this.logDebug(`No suitable wikitable found for ${leagueType}`);
				return null;
			}

			const teams = this._extractTeamsFromTable(bestTable);

			if (teams.length === 0) {
				this.logDebug(`No teams parsed for ${leagueType} from Wikipedia`);
				return null;
			}

			this.logDebug(
				`Parsed ${teams.length} teams for ${leagueType} from Wikipedia${
					splitGroupFound ? " (championship group)" : ""
				}`
			);

			return {
				teams: teams,
				splitGroup: splitGroupFound ? "championship" : null,
				lastUpdated: new Date().toISOString(),
				source: "Wikipedia",
				leagueType: leagueType
			};
		} catch (error) {
			console.error(
				` MMM-MyTeams-LeagueTable: [Wikipedia] Error parsing ${leagueType}:`,
				error
			);
			return null;
		}
	}

	/**
	 * Parse individual team row from a Wikipedia table row.
	 * Wikipedia rows can have position in a <th> cell followed by team name in a <td>/<a>.
	 * Stats follow in order: Pld, W, D, L, GF, GA, GD, Pts.
	 * @param {string} rowHtml - HTML of the row (content between <tr> tags)
	 * @param {number} defaultPosition - Fallback position counter
	 * @returns {object|null} - Parsed team object or null if row is not a valid data row
	 */
	parseTeamRow(rowHtml, defaultPosition) {
		try {
			// Extract all cell content (both <td> and <th>) stripping inner HTML
			const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
			const cells = [];
			let cellMatch;
			while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
				// Strip all inner tags and decode common HTML entities
				let content = cellMatch[1]
					.replace(/<[^>]*>/g, " ")
					.replace(/&nbsp;/g, " ")
					.replace(/&amp;/g, "&")
					.replace(/&lt;/g, "<")
					.replace(/&gt;/g, ">")
					.replace(/\s+/g, " ")
					.trim();
				cells.push(content);
			}

			if (cells.length < 3) return null;

			// Determine position cell index.
			// Wikipedia often puts position in a <td> or <th> as the very first cell.
			let posIdx = 0;
			let nameIdx = 1;
			let position = parseInt(cells[posIdx], 10);

			if (isNaN(position)) {
				// First cell isn't a number (possibly a color-code or status dot)
				posIdx = 1;
				nameIdx = 2;
				position = parseInt(cells[posIdx], 10);
			}
			if (isNaN(position)) position = defaultPosition;

			// Team name: prefer the <a title="..."> attribute within the name cell.
			// Falls back to the plain text of the name cell.
			let teamName = "";
			
			// Find the name cell HTML to look for title
			const cellHtmls = [];
			let cellMatchInner;
			const cellRegexInner = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
			while ((cellMatchInner = cellRegexInner.exec(rowHtml)) !== null) {
				cellHtmls.push(cellMatchInner[1]);
			}

			const nameCellHtml = cellHtmls[nameIdx] || "";
			const titleMatch = nameCellHtml.match(/<a[^>]*\btitle="([^"]+)"[^>]*>/i);
			
			if (titleMatch) {
				teamName = titleMatch[1]
					.replace(/\s*\([CQR]\)$/i, "") // Remove (C), (Q), (R) suffixes
					.trim();
			}
			if (!teamName && cells[nameIdx]) {
				teamName = cells[nameIdx].replace(/^\d+\s+/, "").trim();
			}

			if (!teamName || teamName.length < 2) return null;

			// Stats extraction: collect all cells after the name that look numeric.
			// Wikipedia uses U+2212 (−) as the minus sign and often has footnotes [a], [1] etc.
			const statCells = cells.slice(nameIdx + 1);
			const stats = statCells
				.map((c) => {
					// 1. Normalize minus sign and remove common decorations
					let cleaned = c
						.replace(/\u2212/g, "-")
						.replace(/[+\u2009\u200b]/g, "") // remove plus, thin space, zero-width space
						.replace(/\s+/g, " ")
						.trim();
					
					// 2. Remove footnotes like [1] or [a]
					cleaned = cleaned.replace(/\[[a-z0-9]+\]/gi, "").trim();
					
					// 3. Extract the first number found in the cell (handles "10 10" or "10 (Q)" etc)
					const match = cleaned.match(/-?\d+/);
					return match ? match[0] : "";
				})
				.filter((c) => c !== "")
				.map((c) => parseInt(c, 10));

			// Wikipedia league table column order: Pld, W, D, L, GF, GA, GD, Pts
			const played = stats[0] || 0;
			const won = stats[1] || 0;
			const drawn = stats[2] || 0;
			const lost = stats[3] || 0;
			const goalsFor = stats[4] || 0;
			const goalsAgainst = stats[5] || 0;
			// GD may be at index 6 (if GF and GA are present) or computed if short table
			const goalDifference =
				stats.length >= 8
					? stats[6] !== undefined
						? stats[6]
						: goalsFor - goalsAgainst
					: goalsFor - goalsAgainst;
			const points =
				stats.length >= 8 ? stats[7] || 0 : stats[stats.length - 1] || 0;

			return {
				position,
				name: teamName,
				played,
				won,
				drawn,
				lost,
				goalsFor,
				goalsAgainst,
				goalDifference,
				points,
				form: [] // Wikipedia tables do not include form data
			};
		} catch {
			return null;
		}
	}
}

module.exports = WikipediaParser;
