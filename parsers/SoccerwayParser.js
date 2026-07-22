const BaseParser = require("./BaseParser");

/**
 * Soccerway Parser class for MMM-MyTeams-LeagueTable
 * Handles parsing of data from Soccerway website
 */
class SoccerwayParser extends BaseParser {
	/**
	 * Parse league data from HTML (Soccerway structure)
	 * This parser identifies tables with the "leaguetable" class, which is standard
	 * across most Soccerway league pages. It then iterates through the rows to extract
	 * team standings.
	 *
	 * @param {string} html - Raw HTML content from the Soccerway league page
	 * @param {string} leagueType - The internal code for the league
	 * @returns {object} - A standardized league data object
	 */
	parseLeagueData(html, leagueType) {
		try {
			const teams = [];
			this.logDebug(`Starting to parse ${leagueType} HTML data from Soccerway`);

			// STRATEGY 1: Targeted "leaguetable" class extraction
			// Soccerway usually wraps its standings in a table with this specific class.
			const tableRegex =
				/<table[^>]*class="[^"]*leaguetable[^"]*"[^>]*>(.*?)<\/table>/gis;
			let tableMatch = tableRegex.exec(html);

			// FALLBACK: Generic table extraction
			// If no "leaguetable" class is found, we try to parse the first available table.
			if (!tableMatch) {
				const fallbackTableRegex = /<table[^>]*>(.*?)<\/table>/gis;
				tableMatch = fallbackTableRegex.exec(html);
			}

			if (tableMatch) {
				const tableHtml = tableMatch[1];
				const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
				let rowMatch;
				let position = 1;

				// Iterate through each row in the table.
				while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
					const rowHtml = rowMatch[1];

					// HEURISTIC: Skip header rows (identified by <th> or <thead> tags).
					if (rowHtml.includes("<th") || rowHtml.includes("thead")) continue;

					const team = this.parseTeamRow(rowHtml, position);
					if (team) {
						teams.push(team);
						position++;
					}
				}
			}

			if (teams.length === 0) {
				this.logDebug(`No teams parsed for ${leagueType} from Soccerway`);
				return null;
			}

			return {
				teams: teams,
				lastUpdated: new Date().toISOString(),
				source: "Soccerway",
				leagueType: leagueType
			};
		} catch (error) {
			console.error(
				` MMM-MyTeams-LeagueTable: [Soccerway] Error parsing ${leagueType}:`,
				error
			);
			return null;
		}
	}

	/**
	 * Parse individual team row from Soccerway table
	 * Extracts all relevant statistical data from a single table row (<tr>).
	 * Uses specific CSS class identifiers to ensure correct data mapping.
	 *
	 * @param {string} rowHtml - Raw HTML of the table row
	 * @param {number} defaultPosition - Fallback position if extraction fails
	 * @returns {object|null} - A standardized team data object
	 */
	parseTeamRow(rowHtml, defaultPosition) {
		try {
			// 1. EXTRACT POSITION
			// Soccerway usually wraps the rank/position in a <td> with class="rank".
			let position = defaultPosition;
			const posMatch = rowHtml.match(
				/<td[^>]*class="[^"]*rank[^"]*"[^>]*>(\d+)/i
			);
			if (posMatch) position = parseInt(posMatch[1], 10);

			// 2. EXTRACT TEAM NAME
			// Soccerway uses multiple class variations (team, team-title) and typically
			// embeds an <a> tag pointing to the team profile.
			const teamNameMatch =
				rowHtml.match(
					/<td[^>]*class="[^"]*team[^"]*"[^>]*>.*?<a[^>]*>(.*?)<\/a>/i
				) ||
				rowHtml.match(
					/<td[^>]*class="[^"]*team-title[^"]*"[^>]*>.*?<a[^>]*>(.*?)<\/a>/i
				) ||
				rowHtml.match(/<td[^>]*class="[^"]*team[^"]*"[^>]*>(.*?)<\/td>/i);

			if (!teamNameMatch) return null;
			let teamName = teamNameMatch[1].replace(/<[^>]*>/g, "").trim();

			// 3. EXTRACT STATS
			// STRATEGY: Targeted extraction using specific class names in <td> elements.
			// Classes like "mp" (Matches Played), "won", "draw", "loss", "gf", "ga", "gd", and "points" are used.
			const played =
				this._extractStat(rowHtml, "mp") ||
				this._extractStat(rowHtml, "played") ||
				0;
			const won =
				this._extractStat(rowHtml, "won") ||
				this._extractStat(rowHtml, "w") ||
				0;
			const drawn =
				this._extractStat(rowHtml, "draw") ||
				this._extractStat(rowHtml, "d") ||
				0;
			const lost =
				this._extractStat(rowHtml, "loss") ||
				this._extractStat(rowHtml, "l") ||
				0;
			const goalsFor = this._extractStat(rowHtml, "gf") || 0;
			const goalsAgainst = this._extractStat(rowHtml, "ga") || 0;
			const goalDifference =
				this._extractStat(rowHtml, "gd") || goalsFor - goalsAgainst;
			const points =
				this._extractStat(rowHtml, "points") ||
				this._extractStat(rowHtml, "pts") ||
				0;

			// 4. EXTRACT FORM
			// Soccerway form is typically a series of colored spans or divs representing Recent performance.
			const form = this.getForm(rowHtml);

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
				form
			};
		} catch {
			return null;
		}
	}

	/**
	 * Helper to extract numeric stat from Soccerway cell
	 * @param {string} rowHtml
	 * @param {string} className
	 * @returns {number|null}
	 */
	_extractStat(rowHtml, className) {
		const regex = new RegExp(
			`<td[^>]*class="[^"]*${className}[^"]*"[^>]*>\\s*([+-]?\\d+)`,
			"i"
		);
		const match = rowHtml.match(regex);
		return match ? parseInt(match[1], 10) : null;
	}
}

module.exports = SoccerwayParser;
