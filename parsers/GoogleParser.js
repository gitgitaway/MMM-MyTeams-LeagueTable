const BaseParser = require("./BaseParser");

/**
 * Google Parser class for MMM-MyTeams-LeagueTable
 * Handles parsing of league tables from Google Search results
 */
class GoogleParser extends BaseParser {
	/**
	 * Parse league data from Google Search HTML
	 * @param {string} html - HTML to parse
	 * @param {string} leagueType - Type of league
	 * @returns {object} - Parsed league data
	 */
	parseLeagueData(html, leagueType) {
		try {
			const teams = [];
			this.logDebug(
				`Starting to parse ${leagueType} HTML data from Google Search`
			);

			// Google often uses standard <table> elements in their sports snippets
			// We look for tables and pick the one that looks most like a league table
			const tableRegex = /<table[^>]*>(.*?)<\/table>/gis;
			let m;
			let bestTable = null;
			let maxRows = 0;

			while ((m = tableRegex.exec(html)) !== null) {
				const tableHtml = m[1].toLowerCase();
				// Check for common headers in Google's sports tables (P, W, D, L, GD, Pts)
				if (
					(tableHtml.includes(">p<") ||
						tableHtml.includes(">played<") ||
						tableHtml.includes(">pl<")) &&
					(tableHtml.includes(">pts<") || tableHtml.includes(">points<"))
				) {
					const rowCount = (tableHtml.match(/<tr/gi) || []).length;
					if (rowCount > maxRows) {
						maxRows = rowCount;
						bestTable = m[1];
					}
				}
			}

			// If no table with standard headers found, try a more generic search for tables with many rows
			if (!bestTable) {
				tableRegex.lastIndex = 0;
				while ((m = tableRegex.exec(html)) !== null) {
					const rowCount = (m[1].match(/<tr/gi) || []).length;
					if (rowCount > 5 && rowCount > maxRows) {
						maxRows = rowCount;
						bestTable = m[1];
					}
				}
			}

			if (bestTable) {
				const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
				let rowMatch;
				let posCounter = 1;

				while ((rowMatch = rowRegex.exec(bestTable)) !== null) {
					const rowHtml = rowMatch[1];

					// Skip header rows
					if (
						rowHtml.includes("<th") ||
						rowHtml.toLowerCase().includes(">pts<") ||
						rowHtml.toLowerCase().includes(">played<") ||
						rowHtml.toLowerCase().includes(">team<")
					)
						continue;

					if (!rowHtml.includes("<td")) continue;

					const team = this.parseTeamRow(rowHtml, posCounter);
					if (team) {
						teams.push(team);
						posCounter++;
					}
				}
			}

			if (teams.length === 0) {
				this.logDebug(`No teams parsed for ${leagueType} from Google Search`);
				return null;
			}

			return {
				teams: teams,
				lastUpdated: new Date().toISOString(),
				source: "Google Search",
				leagueType: leagueType
			};
		} catch (error) {
			console.error(
				` MMM-MyTeams-LeagueTable: [Google] Error parsing ${leagueType}:`,
				error
			);
			return null;
		}
	}

	/**
	 * Parse individual team row from Google Search table
	 * @param {string} rowHtml - HTML of the row
	 * @param {number} defaultPosition - Default position if not found
	 * @returns {object|null} - Parsed team object
	 */
	parseTeamRow(rowHtml, defaultPosition) {
		try {
			// Extract all <td> cells
			const cellRegex = /<td[^>]*>(.*?)<\/td>/gis;
			const cells = [];
			let cellMatch;
			while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
				// Clean HTML tags and entities
				let content = cellMatch[1].replace(/<[^>]*>/g, " ").trim();
				content = content
					.replace(/&nbsp;/g, " ")
					.replace(/\s+/g, " ")
					.trim();
				cells.push(content);
			}

			if (cells.length < 3) return null;

			// Google's sports table structure variations:
			// 1. Pos | Team | P | W | D | L | GD | Pts
			// 2. Pos | Team | P | GD | Pts
			// 3. Team | P | W | D | L | GD | Pts (Pos is implied or in first cell)

			let pos = parseInt(cells[0], 10);
			let teamName = "";
			let statsStartIdx = 2;

			if (isNaN(pos)) {
				// If first cell isn't a number, it might be the team name or contain both rank and name
				pos = defaultPosition;
				teamName = cells[0];
				statsStartIdx = 1;
			} else {
				teamName = cells[1];
				statsStartIdx = 2;
			}

			// Clean up team name (sometimes it has rank prefix like "1 Manchester City")
			teamName = teamName.replace(/^\d+\s+/, "").trim();

			// Extract numeric stats after the name
			const stats = cells.slice(statsStartIdx).map((c) => {
				// Handle minus sign variations (U+2212, U+2013, etc.)
				const cleaned = c.replace(/[−–—]/g, "-").replace(/[+]/g, "").trim();
				return parseInt(cleaned, 10);
			});

			let played = 0,
				won = 0,
				drawn = 0,
				lost = 0,
				goalsFor = 0,
				goalsAgainst = 0,
				goalDifference = 0,
				points = 0;

			// Heuristic based on number of columns
			if (stats.length >= 6) {
				// Likely P, W, D, L, GD, Pts
				played = stats[0] || 0;
				won = stats[1] || 0;
				drawn = stats[2] || 0;
				lost = stats[3] || 0;

				if (stats.length >= 8) {
					// Likely P, W, D, L, GF, GA, GD, Pts
					goalsFor = stats[4] || 0;
					goalsAgainst = stats[5] || 0;
					goalDifference = !isNaN(stats[6])
						? stats[6]
						: goalsFor - goalsAgainst;
					points = stats[7] || 0;
				} else {
					goalDifference = !isNaN(stats[4]) ? stats[4] : 0;
					points = stats[5] || 0;
				}
			} else if (stats.length >= 3) {
				// Likely P, GD, Pts
				played = stats[0] || 0;
				goalDifference = !isNaN(stats[1]) ? stats[1] : 0;
				points = stats[2] || 0;
			}

			if (!teamName || teamName.length < 2) return null;

			return {
				position: pos,
				name: teamName,
				played,
				won,
				drawn,
				lost,
				goalsFor,
				goalsAgainst,
				goalDifference,
				points,
				form: [] // Google snippets rarely show full form history in accessible tables
			};
		} catch (error) {
			return null;
		}
	}
}

module.exports = GoogleParser;
