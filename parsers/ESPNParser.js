const BaseParser = require("./BaseParser");

/**
 * ESPN Parser class for MMM-MyTeams-LeagueTable
 * Handles parsing of league tables from ESPN website
 */
class ESPNParser extends BaseParser {
	/**
	 * Parse league data from ESPN HTML
	 * ESPN often uses a "split table" layout where team names and stats are in separate
	 * side-by-side table elements. This parser is designed to identify these tables,
	 * extract their rows, and join them back together based on their index.
	 *
	 * @param {string} html - Raw HTML content from the ESPN standings page
	 * @param {string} leagueType - The internal code for the league
	 * @returns {object} - A standardized league data object
	 */
	parseLeagueData(html, leagueType) {
		try {
			const teams = [];
			this.logDebug(`Starting to parse ${leagueType} HTML data from ESPN`);

			// STRATEGY 1: Split Table Layout (Modern ESPN)
			// ESPN often uses "Table--fixed" for names and "Table--ls" for stats.
			const nameTableRegex =
				/<table[^>]*class="[^"]*Table--fixed[^"]*"[^>]*>(.*?)<\/table>/gis;
			const statsTableRegex =
				/<table[^>]*class="[^"]*Table--ls[^"]*"[^>]*>(.*?)<\/table>/gis;

			const nameMatch = nameTableRegex.exec(html);
			const statsMatch = statsTableRegex.exec(html);

			if (nameMatch && statsMatch) {
				// We extract rows from both tables and iterate through them simultaneously.
				const nameRows = nameMatch[1].match(/<tr[^>]*>(.*?)<\/tr>/gis) || [];
				const statsRows = statsMatch[1].match(/<tr[^>]*>(.*?)<\/tr>/gis) || [];

				// Skip headers (usually first row) and join the data.
				for (let i = 1; i < nameRows.length && i < statsRows.length; i++) {
					const nameRow = nameRows[i];
					const statsRow = statsRows[i];

					const team = this.parseJoinedRows(nameRow, statsRow, i);
					if (team) teams.push(team);
				}
			} else {
				// STRATEGY 2: Single Table Layout (Fallback)
				// If the split layout is not found, search for a single table containing common headers (GP, PTS).
				const singleTableRegex =
					/<table[^>]*class="[^"]*Table[^"]*"[^>]*>(.*?)<\/table>/gis;
				let m;
				while ((m = singleTableRegex.exec(html)) !== null) {
					const tableHtml = m[1];
					if (tableHtml.includes("GP") && tableHtml.includes("PTS")) {
						const rows = tableHtml.match(/<tr[^>]*>(.*?)<\/tr>/gis) || [];
						// Iterate through rows, skipping the header.
						for (let i = 1; i < rows.length; i++) {
							const team = this.parseTeamRow(rows[i], i);
							if (team) teams.push(team);
						}
						break;
					}
				}
			}

			if (teams.length === 0) {
				this.logDebug(`No teams parsed for ${leagueType} from ESPN`);
				return null;
			}

			return {
				teams: teams,
				lastUpdated: new Date().toISOString(),
				source: "ESPN",
				leagueType: leagueType
			};
		} catch (error) {
			console.error(
				` MMM-MyTeams-LeagueTable: [ESPN] Error parsing ${leagueType}:`,
				error
			);
			return null;
		}
	}

	/**
	 * Parse team from joined name and stats rows
	 * This method takes the separate row chunks from the split table layout and joins them.
	 *
	 * @param {string} nameRowHtml - HTML for the row containing team identity
	 * @param {string} statsRowHtml - HTML for the row containing statistics
	 * @param {number} position - Position of the team in the table
	 * @returns {object|null} - Joined team object
	 */
	parseJoinedRows(nameRowHtml, statsRowHtml, position) {
		try {
			// Extract Name: Targeted at specific ESPN class "TeamLink" used in <a> tags,
			// or "hide-mobile" span elements as a fallback for plain names.
			const nameMatch =
				nameRowHtml.match(/class="[^"]*TeamLink[^"]*"[^>]*>(.*?)<\/a>/i) ||
				nameRowHtml.match(
					/<span[^>]*class="[^"]*hide-mobile[^"]*"[^>]*>(.*?)<\/span>/i
				);
			if (!nameMatch) return null;
			const teamName = nameMatch[1].replace(/<[^>]*>/g, "").trim();

			// Extract Stats from statsRow: Splits row into individual cells (<td>).
			const cells = statsRowHtml.match(/<td[^>]*>(.*?)<\/td>/gis) || [];
			// Clean each cell of HTML tags to leave only numeric content.
			const stats = cells.map((c) => c.replace(/<[^>]*>/g, "").trim());

			// HEURISTIC: ESPN consistently orders stats as: GP, W, D, L, GF, GA, GD, P, (Form).
			return {
				position: position,
				name: teamName,
				played: parseInt(stats[0], 10) || 0,
				won: parseInt(stats[1], 10) || 0,
				drawn: parseInt(stats[2], 10) || 0,
				lost: parseInt(stats[3], 10) || 0,
				goalsFor: parseInt(stats[4], 10) || 0,
				goalsAgainst: parseInt(stats[5], 10) || 0,
				goalDifference: parseInt(stats[6].replace("+", ""), 10) || 0,
				points: parseInt(stats[7], 10) || 0,
				form: this.getForm(statsRowHtml)
			};
		} catch {
			return null;
		}
	}

	/**
	 * Generic row parser for single table layout
	 */
	parseTeamRow(rowHtml, position) {
		try {
			const cells = rowHtml.match(/<td[^>]*>(.*?)<\/td>/gis) || [];
			if (cells.length < 5) return null;

			const stats = cells.map((c) => c.replace(/<[^>]*>/g, "").trim());

			// Find name cell (usually second cell if first is position)
			const nameCell =
				cells.find(
					(c) => c.includes("TeamLink") || c.includes("hide-mobile")
				) || cells[1];
			const teamName = nameCell.replace(/<[^>]*>/g, "").trim();

			return {
				position: parseInt(stats[0], 10) || position,
				name: teamName,
				played: parseInt(stats[1], 10) || 0,
				won: parseInt(stats[2], 10) || 0,
				drawn: parseInt(stats[3], 10) || 0,
				lost: parseInt(stats[4], 10) || 0,
				goalsFor: parseInt(stats[5], 10) || 0,
				goalsAgainst: parseInt(stats[6], 10) || 0,
				goalDifference: parseInt(stats[7].replace("+", ""), 10) || 0,
				points: parseInt(stats[8], 10) || 0,
				form: this.getForm(rowHtml)
			};
		} catch {
			return null;
		}
	}
}

module.exports = ESPNParser;
