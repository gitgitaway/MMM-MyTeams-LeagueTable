/**
 * Base Parser class for MMM-MyTeams-LeagueTable
 * Provides common utility methods for parsing league data
 */
class BaseParser {
	constructor(config) {
		this.config = config || {};
	}

	/**
	 * Update the configuration
	 * @param {object} config - New configuration
	 */
	setConfig(config) {
		this.config = config || {};
	}

	/**
	 * Log debug information if debug mode is enabled
	 * @param {string} message - Message to log
	 */
	logDebug(message) {
		if (this.config.debug) {
			console.log(` MMM-MyTeams-LeagueTable: [Parser] ${message}`);
		}
	}

	/**
	 * Extract a number from HTML using aria-label
	 * @param {string} rowHtml - HTML of the table row
	 * @param {string} label - aria-label to search for
	 * @returns {number} - Extracted number or 0
	 */
	getAriaNum(rowHtml, label) {
		const patterns = [
			// Exact match or contains label (e.g., "Played 20" or just "Played")
			new RegExp(`<td[^>]*(?:aria-label|title)="${label}[^"]*"[^>]*><span[^>]*>([+-]?\\d+)</span></td>`, "i"),
			new RegExp(`<td[^>]*(?:aria-label|title)="${label}[^"]*"[^>]*>([+-]?\\d+)</td>`, "i"),
			// Match by class containing the label
			new RegExp(`<td[^>]*class="[^"]*${label.replace(/\s+/g, "").toLowerCase()}[^"]*"[^>]*>.*?([+-]?\\d+).*?</td>`, "is"),
			// Generic element (div, etc) with aria-label
			new RegExp(`<(?:td|div|span)[^>]*(?:aria-label|title)="${label}[^"]*"[^>]*>.*?([+-]?\\d+).*?</(?:td|div|span)>`, "is"),
			// Data-testid variation
			new RegExp(`data-testid="[^"]*${label.replace(/\s+/g, "-").toLowerCase()}[^"]*"[^>]*>.*?([+-]?\\d+).*?<`, "is")
		];

		for (const pattern of patterns) {
			const match = rowHtml.match(pattern);
			if (match && match[1]) {
				const val = parseInt(match[1], 10);
				if (!isNaN(val)) return val;
			}
		}

		return 0;
	}

	/**
	 * Extract form data from HTML
	 * @param {string} rowHtml - HTML of the table row
	 * @returns {Array} - Array of match objects { result, details }
	 */
	getForm(rowHtml) {
		try {
			// Find the Form cell (aria-label starts with "Form" or contains "Form")
			let contentToParse = rowHtml;
			
			// Try to isolate the Form cell if possible
			// BBC uses labels like "Form, Last 6 games, Oldest first" or "Recent Form"
			const tdMatch = rowHtml.match(/<td[^>]*(?:aria-label|title)="[^"]*Form[^"]*"[^>]*>([\s\S]*?)<\/td>/i) ||
						   rowHtml.match(/<td[^>]*class="[^"]*Form(?:Guide)?[^"]*"[^>]*>([\s\S]*?)<\/td>/i) ||
						   rowHtml.match(/<div[^>]*role="cell"[^>]*(?:aria-label|title)="[^"]*Form[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
			
			if (tdMatch) {
				contentToParse = tdMatch[1];
			} else {
				// Fallback for modern BBC structure where it might be a div with specific testid
				const testidMatch = rowHtml.match(/data-testid="form-container"[^>]*>([\s\S]*?)<\/(?:div|ul)>/i) ||
								   rowHtml.match(/data-testid="[^"]*form-guide[^"]*"[^>]*>([\s\S]*?)<\/(?:div|ul)>/i);
				if (testidMatch) contentToParse = testidMatch[1];
			}
			
			const tokens = this._parseFormTokens(contentToParse);
			
			// If we found tokens in the whole row but not the specific cell, use those
			if (tokens.length === 0 && contentToParse !== rowHtml) {
				return this._parseFormTokens(rowHtml);
			}

			return tokens;
		} catch (error) {
			console.error(" MMM-MyTeams-LeagueTable: [BaseParser] Error in getForm:", error);
			return [];
		}
	}

	/**
	 * Internal helper to parse tokens from form HTML
	 * @param {string} formContent 
	 * @returns {Array}
	 */
	_parseFormTokens(formContent) {
		const results = [];
		let m;
		
		// Strategy 0: Look for data-testid="form-accessible-letter"
		// This is very reliable on the new BBC structure
		const accessibleRegex = /data-testid="form-accessible-letter"[^>]*>Result\s+(Win|Loss|Draw|Won|Lost|Drawn|W|L|D)/gi;
		while ((m = accessibleRegex.exec(formContent)) !== null) {
			const fullText = m[1].toLowerCase();
			let res = "D";
			if (fullText.startsWith("w")) res = "W";
			else if (fullText.startsWith("l")) res = "L";
			
			results.push({
				result: res,
				details: `Result ${m[1]}`
			});
		}

		// Strategy 0.5: Look for modern BBC form tokens (span with visually hidden text)
		if (results.length === 0) {
			const tokenRegex = /<span[^>]*class="[^"]*VisuallyHidden[^"]*"[^>]*>(Win|Loss|Draw|Won|Lost|Drawn)<\/span>/gi;
			while ((m = tokenRegex.exec(formContent)) !== null) {
				const fullText = m[1].toLowerCase();
				let res = "D";
				if (fullText.startsWith("w")) res = "W";
				else if (fullText.startsWith("l")) res = "L";
				results.push({ result: res, details: m[1] });
			}
		}

		// Strategy 1: Find everything with data-testid="letter-content"
		// Only run if Strategy 0 found nothing or to supplement
		if (results.length === 0) {
			const simpleRegex = /data-testid="letter-content"[^>]*>([\s\S]*?)<\//gi;
			while ((m = simpleRegex.exec(formContent)) !== null) {
				const content = m[1].replace(/<[^>]*>/g, "").trim();
				if (content && content.length === 1 && "WDL".includes(content)) {
					const res = content;
					const pos = simpleRegex.lastIndex;
					
					// Look ahead for details
					const lookAhead = formContent.substring(pos, pos + 200);
					const detailMatch = lookAhead.match(/Result\s+(Win|Loss|Draw|Won|Lost|Drawn)/i);
					
					results.push({
						result: res,
						details: detailMatch ? `Result ${detailMatch[1]}` : ""
					});
				}
			}
		}

		// Strategy 2: If previous strategies found nothing, try older aria-label pattern
		if (results.length === 0) {
			const tokenRegex = /<[^>]*aria-label="([^"]*(?:Win|Loss|Draw|Won|Lost|Drawn)[^"]*)"[^>]*>.*?data-testid="letter-content"[^>]*>([WDL])<\/div>/gi;
			while ((m = tokenRegex.exec(formContent)) !== null) {
				results.push({
					result: m[2],
					details: m[1]
				});
			}
		}

		// Strategy 3: Absolute fallback for extremely simple text-based structures
		if (results.length === 0) {
			const fallbackRegex = />([WDL])<\/span>/gi;
			while ((m = fallbackRegex.exec(formContent)) !== null) {
				results.push({
					result: m[1],
					details: ""
				});
			}
		}

		return results;
	}

	/**
	 * Create a blank team object with default stats
	 * @param {string} name - Team name
	 * @returns {object} - Blank team object
	 */
	_blankTeam(name) {
		return {
			name: name,
			played: 0,
			won: 0,
			drawn: 0,
			lost: 0,
			goalsFor: 0,
			goalsAgainst: 0,
			goalDifference: 0,
			points: 0,
			form: ""
		};
	}

	/**
	 * Infer match stage from text block
	 * @param {string} block - Text block to analyze
	 * @returns {string|undefined} - Inferred stage code
	 */
	_inferStageFromBlock(block) {
		const b = block || "";
		if (
			/Round of 32|Rd32/i.test(b)
		)
			return "Rd32";
		if (
			/Play-offs?|Playoffs?|Knockout[- ]round play-offs?/i.test(b)
		)
			return "Playoff";
		if (/Round of 16|Rd16/i.test(b)) return "Rd16";
		if (/Quarter[- ]?finals?|QF/i.test(b)) return "QF";
		if (/Semi[- ]?finals?|SF/i.test(b)) return "SF";
		if (/Third[- ]?place|3rd place|TP/i.test(b)) return "TP";
		if (/Final/i.test(b)) return "Final";
		return undefined;
	}

	/**
	 * Parse datetime string to epoch timestamp
	 * @param {string} iso - ISO datetime string
	 * @param {string} fallbackDateStr - Fallback date (YYYY-MM-DD)
	 * @param {string} fallbackTimeStr - Fallback time (HH:mm)
	 * @returns {number} - Epoch timestamp in milliseconds
	 */
	parseDateTime(iso, fallbackDateStr, fallbackTimeStr) {
		try {
			if (iso) {
				const d = new Date(iso);
				if (!isNaN(d.getTime())) return d.getTime();
			}
			
			// If we have a fallback date, construct a timestamp
			if (fallbackDateStr) {
				let dt = fallbackDateStr;
				
				// Handle time
				let time = "00:00";
				if (fallbackTimeStr && /\d\d:\d\d/.test(fallbackTimeStr)) {
					time = fallbackTimeStr;
				} else if (fallbackTimeStr && /\d\d\.\d\d/.test(fallbackTimeStr)) {
					time = fallbackTimeStr.replace(".", ":");
				}
				
				// Combine date and time
				// Use T for ISO format
				const isoStr = `${dt}T${time}:00`;
				const d2 = new Date(isoStr);
				
				if (!isNaN(d2.getTime())) return d2.getTime();
				
				// If ISO failed, try space separator
				const d3 = new Date(`${dt} ${time}`);
				if (!isNaN(d3.getTime())) return d3.getTime();
				
				// Last resort: just the date
				const d4 = new Date(dt);
				if (!isNaN(d4.getTime())) return d4.getTime();
			}
		} catch {
			// Silently fail and return 0
		}
		return 0;
	}
}

module.exports = BaseParser;
