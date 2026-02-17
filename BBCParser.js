const BaseParser = require("./BaseParser");

/**
 * BBC Parser class for MMM-MyTeams-LeagueTable
 * Handles parsing of data from BBC Sport website
 */
class BBCParser extends BaseParser {
	/**
	 * Parse league data from HTML (BBC Sport structure)
	 * @param {string} html - HTML to parse
	 * @param {string} leagueType - Type of league
	 * @returns {object} - Parsed league data
	 */
	parseLeagueData(html, leagueType) {
		try {
			const teams = [];
			this.logDebug(`Starting to parse ${leagueType} HTML data`);

			// Strategy 1: Standard HTML Table
			const tableRegex = /<table[^>]*>(.*?)<\/table>/gis;
			const tableMatches = html.match(tableRegex);

			if (tableMatches) {
				this.logDebug(`Found ${tableMatches.length} table candidates`);
				let processedTables = 0;
				let totalTeams = 0;

				for (const tableHtml of tableMatches) {
					const tableHtmlLower = tableHtml.toLowerCase();
					this.logDebug(`Checking table candidate (length: ${tableHtml.length})`);
					// More lenient table identification
					if (
						!tableHtmlLower.includes("team") &&
						!tableHtmlLower.includes("club") &&
						!tableHtmlLower.includes("position") &&
						!tableHtmlLower.includes("football-table") &&
						!tableHtmlLower.includes("rank") &&
						!tableHtmlLower.includes("played")
					) {
						this.logDebug(`Table candidate rejected (no keywords found)`);
						continue;
					}

					const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
					const rows = tableHtml.match(rowRegex);

					if (!rows || rows.length < 2) continue;

					this.logDebug(`Found table ${processedTables + 1} with ${rows.length} rows`);
					processedTables++;

					for (let i = 1; i < rows.length; i++) {
						const row = rows[i];
						const team = this.parseTeamRow(row, totalTeams + i);

						if (team) {
							if (["UCL", "UEL", "ECL"].includes(leagueType)) {
								const groupHeaderRegex = /<h3[^>]*>Group\s+([A-Z])<\/h3>/i;
								const groupMatch = html
									.substring(
										Math.max(0, html.indexOf(tableHtml) - 300),
										html.indexOf(tableHtml)
									)
									.match(groupHeaderRegex);

								if (groupMatch) {
									team.group = `Group ${groupMatch[1]}`;
								}
							}
							teams.push(team);
						}
					}
					totalTeams += rows.length - 1;

					// If we found teams, and it's not a multi-table league like UCL, we can stop
					if (teams.length > 0 && !["UCL", "UEL", "ECL", "WORLD_CUP_2026"].includes(leagueType)) break;
				}
			}

			// Strategy 2: Grid/Div based table (modern BBC layout)
			if (teams.length === 0) {
				this.logDebug(`No standard table found for ${leagueType}, trying Grid/Div parsing`);
				const rowRegex = /<(?:div|article)[^>]*class="[^"]*(?:TableRecord|TableRow|gel-layout__item)[^"]*"[^>]*role="row"[^>]*>(.*?)<\/(?:div|article)>/gis;
				const rows = html.match(rowRegex);
				
				if (rows && rows.length > 0) {
					this.logDebug(`Found ${rows.length} grid rows for ${leagueType}`);
					rows.forEach((row, index) => {
						const team = this.parseTeamRow(row, index + 1);
						if (team) teams.push(team);
					});
				}
			}

			if (teams.length === 0) {
				this.logDebug(`No teams parsed for ${leagueType} using standard methods, trying fallback`);
				return this.parseAlternativeFormat(html, leagueType);
			}

			return {
				teams: teams,
				lastUpdated: new Date().toISOString(),
				source: "BBC Sport",
				leagueType: leagueType
			};
		} catch (error) {
			console.error(` MMM-MyTeams-LeagueTable: Error parsing ${leagueType} data:`, error);
			return this.parseAlternativeFormat(html, leagueType);
		}
	}

	/**
	 * Parse individual team row from BBC table
	 * @param {string} rowHtml - HTML of the row
	 * @param {number} position - Current position
	 * @returns {object|null} - Parsed team object
	 */
	parseTeamRow(rowHtml, position) {
		try {
			if (rowHtml.includes("HeadingRow") || rowHtml.includes("<th")) return null;

			const badgeMatch = rowHtml.match(/data-testid="badge-container-([^"]+)"/);
			let teamName = "";

			if (badgeMatch && badgeMatch[1] && badgeMatch[1] !== "undefined") {
				teamName = badgeMatch[1]
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" ");
			}

			// If badge container didn't work, try team-name testid or other spans
			if (!teamName) {
				const teamNameMatch = rowHtml.match(/data-testid="team-name"[^>]*>([^<]+)<\/span>/i) ||
									 rowHtml.match(/class="[^"]*VisuallyHidden[^"]*"[^>]*>([^<]+)<\/span>/i) ||
									 rowHtml.match(/class="[^"]*team-name[^"]*"[^>]*>([^<]+)<\/span>/i) ||
									 rowHtml.match(/<a[^>]*>([^<]+)<\/a>/i);
				if (teamNameMatch) {
					teamName = teamNameMatch[1].trim();
				}
			}

			if (teamName) {
				// Handle special cases
				if (teamName === "Heart Of Midlothian") teamName = "Hearts";
				if (teamName === "St Mirren") teamName = "St. Mirren";
				if (teamName === "AFC Bournemouth") teamName = "Bournemouth";
				if (teamName === "Paris Saint Germain" || teamName === "Paris St Germain") teamName = "Paris Sg";
				if (teamName === "Paris Fc" || teamName === "Paris FC") teamName = "Paris Fc";
				if (teamName === "Leipzig" || teamName === "RB Leipzig") teamName = "Rb Leipzig";
				if (teamName === "Oviedo") teamName = "Real Oviedo";
			}

			if (!teamName) return null;

			let pos = position;
			const posMatch = rowHtml.match(/class="[^"]*Rank[^"]*">(\d+)</i);
			if (posMatch) pos = parseInt(posMatch[1], 10);

			const played = this.getAriaNum(rowHtml, "Played");
			const won = this.getAriaNum(rowHtml, "Won");
			const drawn = this.getAriaNum(rowHtml, "Drawn");
			const lost = this.getAriaNum(rowHtml, "Lost");
			const goalsFor = this.getAriaNum(rowHtml, "Goals For");
			const goalsAgainst = this.getAriaNum(rowHtml, "Goals Against");
			let goalDifference = this.getAriaNum(rowHtml, "Goal Difference");
			if (!Number.isFinite(goalDifference)) goalDifference = goalsFor - goalsAgainst;
			const points = this.getAriaNum(rowHtml, "Points");
			const form = this.getForm(rowHtml);

			if (this.config.debug && form.length === 0 && played > 0) {
				this.logDebug(`No form found for team: ${teamName}. Played: ${played}. Row HTML length: ${rowHtml.length}`);
				// Log first 200 chars of row to see structure if it fails
				this.logDebug(`Row HTML snippet: ${rowHtml.substring(0, 200)}...`);
			}

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
				form
			};
		} catch {
			return null;
		}
	}

	/**
	 * Parse BBC fixtures articles
	 * @param {string} html - HTML containing fixtures
	 * @returns {Array} - Array of fixture objects
	 */
	_parseBBCFixtureArticles(html) {
		const fixtures = [];
		const seen = new Set();
		const sections = [];
		let lastIndex = 0;
		const headerRegex = /<h\d[^>]*class="[^"]*(?:sp-c-date-header|GroupHeader|Heading|StyledHeading|GelHeading|FixtureTableHeading)[^"]*"[^>]*>([\s\S]*?)<\/h\d>|<h\d[^>]*>(?:Play-off|Playoff|Round of 32|Knockout)[\s\S]*?<\/h\d>/gi;
		
		let h;
		while ((h = headerRegex.exec(html)) !== null) {
			if (h.index > lastIndex) {
				sections.push({
					header: sections.length > 0 ? sections[sections.length - 1].header : null,
					content: html.substring(lastIndex, h.index)
				});
			}
			sections.push({ header: h[0], content: "" });
			lastIndex = headerRegex.lastIndex;
		}
		if (lastIndex < html.length) {
			sections.push({
				header: sections.length > 0 ? sections[sections.length - 1].header : null,
				content: html.substring(lastIndex)
			});
		}
		if (sections.length === 0) sections.push({ header: null, content: html });

		const getSectionInfo = (headerHtml) => {
			if (!headerHtml) return { dateStr: "", isoDate: "", stage: undefined };
			const info = { dateStr: "", isoDate: "", stage: undefined };
			
			const timeTag = headerHtml.match(/<time[^>]*datetime="([^"]+)"[^>]*>/i);
			if (timeTag) {
				const iso = timeTag[1];
				const m = iso.match(/^(\d{4}-\d{2}-\d{2})/);
				info.dateStr = m ? m[1] : "";
				info.isoDate = iso;
			} else {
				const dataDate = headerHtml.match(/data-(?:date|datetime)="(\d{4}-\d{2}-\d{2})/i);
				if (dataDate) {
					info.dateStr = dataDate[1];
					info.isoDate = dataDate[1];
				}
			}

			if (!info.dateStr) {
				const headerText = headerHtml.replace(/<[^>]*>/g, "").trim();
				const dateMatch = headerText.match(/(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{4}))?/i);
				if (dateMatch) {
					const day = dateMatch[1].padStart(2, "0");
					const monthName = dateMatch[2].toLowerCase();
					const year = dateMatch[3] || new Date().getFullYear();
					const months = { january: "01", february: "02", march: "03", april: "04", may: "05", june: "06", july: "07", august: "08", september: "09", october: "10", november: "11", december: "12" };
					const month = months[monthName];
					if (month) info.dateStr = `${year}-${month}-${day}`;
				}
			}
			
			const headerText = headerHtml.replace(/<[^>]*>/g, "").trim();
			info.stage = this._inferStageFromBlock(headerText);
			return info;
		};

		let currentSectionDate = "";
		let currentSectionStage = undefined;

		for (const section of sections) {
			const info = getSectionInfo(section.header);
			if (info.dateStr) currentSectionDate = info.dateStr;
			if (info.stage) currentSectionStage = info.stage;

			// Improved fixture block detection with simplified class matching
			// This avoids deep backtracking and is more resilient to BBC class name changes
			const fixtureRegex = /<(article|div|li)([^>]*?(?:class="[^"]*?(?:sp-c-fixture|GridContainer|MatchItem|FixtureBlock|MatchListItem|HeadToHeadWrapper|StyledHeadToHeadWrapper)[^"]*?"|data-event-id="[^"]+"|data-testid="[^"]*(?:fixture|match-list-item)[^"]*")[^>]*?)>([\s\S]*?)(?=<article|<div[^>]*?(?:data-event-id|data-testid="[^"]*(?:fixture|match-list-item)[^"]*")|<li[^>]*?(?:class="[^"]*?HeadToHeadWrapper[^"]*?"|data-event-id)|<div[^>]*?class="[^"]*?(?:sp-c-fixture|GridContainer|MatchItem|FixtureBlock|MatchListItem)[^"]*?"|$)/gi;
			
			let m;
			while ((m = fixtureRegex.exec(section.content)) !== null) {
				const attributes = m[2];
				const content = m[3];
				const block = attributes + content;
				
				// Centralized team extraction logic
				const extractTeams = (b) => {
					const teamsFound = [];
					
					// Match various team name containers in a single pass where possible
					const teamPatterns = [
						/data-testid="[^"]*team-name[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
						/class="[^"]*(?:team-name|qa-full-team-name|LongName|GelName|DesktopValue|MobileValue)[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
						/aria-label="([^"]+?)\s*\d+\s*,\s*([^"]+?)\s*\d+/i, // Both teams in one aria-label
						/<abbr[^>]*title="([^"]+)"[^>]*>/gi,
						/data-abbv="([^"]+)"/gi
					];

					teamPatterns.forEach(pattern => {
						let match;
						if (pattern.global) {
							while ((match = pattern.exec(b)) !== null) {
								teamsFound.push(match[1]);
							}
						} else {
							match = b.match(pattern);
							if (match) {
								teamsFound.push(match[1]);
								if (match[2]) teamsFound.push(match[2]);
							}
						}
					});

					return teamsFound
						.map(t => t.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim())
						.filter(t => t.length > 1);
				};

				const separatorRegex = /<(?:div|span|time)[^>]*class="[^"]*(?:sp-c-fixture__block|sp-c-fixture__status|ScoreValue|StyledTime|eli9aj90|StatusValue|FixtureScore|MatchStatus|FixtureTime|MatchTime)[^"]*"[^>]*>[\s\S]*?<\/(?:div|span|time)>|(\d+\s*-\s*\d+)|(\d\d:\d\d)|(\bvs\b)/i;
				const sepMatch = block.match(separatorRegex);

				let homeTeam = null, awayTeam = null;
				const homeContainerRegex = /<(?:div|span)[^>]*class="[^"]*?(?:TeamHome|HomeTeam)[^"]*?"[^>]*>([\s\S]*?)<\/div>/i;
				const awayContainerRegex = /<(?:div|span)[^>]*class="[^"]*?(?:TeamAway|AwayTeam)[^"]*?"[^>]*>([\s\S]*?)<\/div>/i;
				
				const hMatch = block.match(homeContainerRegex);
				const aMatch = block.match(awayContainerRegex);

				if (hMatch && aMatch) {
					homeTeam = extractTeams(hMatch[1]).sort((a, b) => b.length - a.length)[0] || null;
					awayTeam = extractTeams(aMatch[1]).sort((a, b) => b.length - a.length)[0] || null;
				}

				if (!homeTeam || !awayTeam || homeTeam === awayTeam || (homeTeam && awayTeam && (homeTeam.includes(awayTeam) || awayTeam.includes(homeTeam)))) {
					// Fallback: try to get teams from aria-label if present
					const ariaMatch = block.match(/aria-label="([^"]+?)\s*\d+\s*,\s*([^"]+?)\s*\d+/i);
					if (ariaMatch) {
						homeTeam = ariaMatch[1].trim();
						awayTeam = ariaMatch[2].trim();
					}
					
					if (!homeTeam || !awayTeam) {
						if (sepMatch) {
							const sepIdx = block.indexOf(sepMatch[0]);
							const hPart = block.substring(0, sepIdx), aPart = block.substring(sepIdx + sepMatch[0].length);
							const hTs = extractTeams(hPart), aTs = extractTeams(aPart);
							homeTeam = hTs.sort((a, b) => b.length - a.length)[0] || homeTeam;
							awayTeam = aTs.sort((a, b) => b.length - a.length)[0] || awayTeam;
						}
					}
				}

				if (!homeTeam || !awayTeam) {
					const all = [...new Set(extractTeams(block))].sort((a, b) => b.length - a.length);
					if (all.length >= 2) {
						homeTeam = all[0];
						awayTeam = all.find(t => !homeTeam.includes(t) && !t.includes(homeTeam)) || all[1];
					}
				}

				if (!homeTeam || !awayTeam) continue;

				const stage = currentSectionStage || this._inferStageFromBlock(block) || "GS";
				
				// Improved score extraction (Task: Robustness)
				let scores = [];
				
				// 1. Check aria-label first as it's very reliable for current scores
				const ariaScoreMatch = block.match(/aria-label="[^"]+?\s*(\d+)\s*,\s*[^"]+?\s*(\d+)/i);
				if (ariaScoreMatch) {
					scores = [ariaScoreMatch[1], ariaScoreMatch[2]];
				} else {
					// 2. Try to find scores by modern BBC classes and data-testids
					const scoresRaw = Array.from(block.matchAll(/<(?:span|div)[^>]*?(?:class="[^"]*?(?:sp-c-fixture__number|sp-c-fixture__number--[a-z]+|ScoreValue|MatchScore|FixtureScore|score-value)[^"]*?"|data-testid="[^"]*?(?:score-value|match-score|score)[^"]*?")[^>]*?>([\s\S]*?)<\/(?:span|div)>/gi)).map(x => x[1]);
					scores = scoresRaw.map(s => s.replace(/<[^>]*>/g, "").trim()).filter(s => /^\d+$/.test(s));
				}

				const aggMatch = block.match(/\((?:agg\s*)?(\d+-\d+)\)/i) || block.match(/agg\s*(\d+-\d+)/i);
				const aggregateScore = aggMatch ? aggMatch[1] : undefined;

				// 3. Fallback to hyphenated score match or scanning for all digits
				if (scores.length < 2) {
					const sm = block.match(/(\d+)\s*[-–,]\s*(\d+)/);
					if (sm) {
						scores = [sm[1], sm[2]];
					} else {
						// Scan for any isolated digits in the block that could be scores
						const allDigits = Array.from(block.matchAll(/>\s*(\d+)\s*</g)).map(x => x[1]);
						if (allDigits.length >= 2) {
							// For live matches, the scores are usually the first two isolated numbers
							scores = [allDigits[0], allDigits[1]];
						}
					}
				}

				const homeScore = scores.length >= 2 ? parseInt(scores[0]) : undefined;
				const awayScore = scores.length >= 2 ? parseInt(scores[1]) : undefined;

				let fixtureIso = (block.match(/<time[^>]*datetime="([^"]+)"[^>]*>/i) || [])[1] || "";
				let status = "";
				let statusStr = "";
				
				// Improved status detection (Task: Precision)
				if (block.includes("FinishedFixture") || /\b(FT|PEN|Full time)\b/i.test(block)) {
					status = "FT";
					const sm = block.match(/\b(FT|PEN)\b/i);
					statusStr = sm ? sm[1].toUpperCase() : "FT";
				}
				else if (block.includes("LiveFixture") || block.match(/\d+'|HT|AET|Live|in progress/i)) {
					status = "LIVE";
					const sm = block.match(/\b(HT|AET|\d+')\b/i);
					if (sm) {
						statusStr = sm[1].toUpperCase();
					} else {
						// Look for "X minutes , in progress"
						const minMatch = block.match(/(\d+)\s*minutes\s*,\s*in progress/i);
						if (minMatch) statusStr = minMatch[1] + "'";
					}
				}

				const venueMatch = block.match(/<span[^>]*class="[^"]*(?:venue|stadium)[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
				const venue = venueMatch ? venueMatch[1].replace(/<[^>]*>/g, "").trim() : "";

				let fixtureDate = currentSectionDate || (fixtureIso ? fixtureIso.split("T")[0] : "");
				const timeTextMatch = block.match(/<(?:time|span)[^>]*class="[^"]*(?:StyledTime|eli9aj90|FixtureTime|MatchTime)[^"]*"[^>]*>([\s\S]*?)<\/(?:time|span)>/i);
				let time = timeTextMatch ? timeTextMatch[1].replace(/<[^>]*>/g, "").trim() : "";
				
				// Ensure we have a valid time or fallback to ISO time (Task: Fix 'vs' in Time column)
				if ((!time || time === "vs") && fixtureIso && fixtureIso.includes("T")) {
					time = fixtureIso.split("T")[1].substring(0, 5);
				}
				
				// If still no time, use "vs" as last resort
				if (!time) time = "vs";

				const dedupKey = `${homeTeam}|${awayTeam}|${fixtureDate}|${time}`;
				if (seen.has(dedupKey)) continue;
				seen.add(dedupKey);

				fixtures.push({
					stage,
					group: (block.match(/Group\s*([A-L])/i) || [])[1],
					date: fixtureDate,
					time,
					homeTeam,
					awayTeam,
					homeScore,
					awayScore,
					aggregateScore,
					venue,
					score: scores.length >= 2 ? `${scores[0]} - ${scores[1]}` : "vs",
					live: status === "LIVE",
					status: statusStr,
					timestamp: this.parseDateTime(fixtureIso, fixtureDate, /\d\d:\d\d/.test(time) ? time : "")
				});
			}
		}
		return fixtures;
	}

	_computeGroupTablesFromFixtures(fixtures) {
		const groups = {};
		fixtures.forEach((f) => {
			if (f.stage === "GS" && f.group && f.homeTeam && f.awayTeam) {
				groups[f.group] = groups[f.group] || {};
				if (!groups[f.group][f.homeTeam]) groups[f.group][f.homeTeam] = this._blankTeam(f.homeTeam);
				if (!groups[f.group][f.awayTeam]) groups[f.group][f.awayTeam] = this._blankTeam(f.awayTeam);
			}
		});
		return groups;
	}

	_parseBBCTableTeamRow(rowHtml, defaultPos) {
		let name = "";
		const badgeMatch = rowHtml.match(/data-testid="badge-container-([^"]+)"/);
		if (badgeMatch && badgeMatch[1] && badgeMatch[1] !== "undefined") {
			name = badgeMatch[1]
				.split("-")
				.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
				.join(" ");
		}

		if (!name) {
			const teamNameMatch = rowHtml.match(/data-testid="team-name"[^>]*>([^<]+)<\/span>/i) ||
								 rowHtml.match(/class="[^"]*VisuallyHidden[^"]*"[^>]*>([^<]+)<\/span>/i) ||
								 rowHtml.match(/class="[^"]*team-name[^"]*"[^>]*>([^<]+)<\/span>/i) ||
								 rowHtml.match(/<a[^>]*>([^<]+)<\/a>/i);
			if (teamNameMatch) {
				name = teamNameMatch[1].trim();
			}
		}

		if (!name) return null;

		let position = defaultPos;
		const posMatch = rowHtml.match(/class="[^"]*Rank[^"]*">(\d+)</i);
		if (posMatch) position = parseInt(posMatch[1], 10);

		const played = this.getAriaNum(rowHtml, "Played");
		const won = this.getAriaNum(rowHtml, "Won");
		const drawn = this.getAriaNum(rowHtml, "Drawn");
		const lost = this.getAriaNum(rowHtml, "Lost");
		const goalsFor = this.getAriaNum(rowHtml, "Goals For");
		const goalsAgainst = this.getAriaNum(rowHtml, "Goals Against");
		let goalDifference = this.getAriaNum(rowHtml, "Goal Difference");
		if (!Number.isFinite(goalDifference)) goalDifference = goalsFor - goalsAgainst;
		const points = this.getAriaNum(rowHtml, "Points");
		const form = this.getForm(rowHtml);

		return {
			position,
			name,
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
	}

	parseUEFACompetitionData(tablesHtml, fixturesHtml, leagueType) {
		const baseData = this.parseLeagueData(tablesHtml, leagueType);
		let allFixtures = this._parseBBCFixtureArticles(fixturesHtml);

		allFixtures.forEach(f => {
			const inferred = this._inferUEFAStage(f);
			if (inferred) f.stage = inferred;
		});
		
		const data = {
			...baseData,
			fixtures: allFixtures,
			knockouts: {
				playoff: allFixtures.filter(f => f.stage === "Playoff"),
				rd16: allFixtures.filter(f => f.stage === "Rd16"),
				qf: allFixtures.filter(f => f.stage === "QF"),
				sf: allFixtures.filter(f => f.stage === "SF"),
				final: allFixtures.filter(f => f.stage === "Final")
			}
		};

		return data;
	}

	_inferUEFAStage(fixture) {
		const stage = fixture.stage || "";
		if (fixture.date) {
			// UEFA Knockout round play-offs are strictly in February (16 fixtures)
			if (fixture.date.includes("-02-")) return "Playoff";
			// UEFA Round of 16 starts in March
			if (fixture.date.includes("-03-")) return "Rd16";
		}
		if (stage === "Rd32") return "Playoff";
		if (stage === "Rd16" || stage === "QF" || stage === "SF" || stage === "Final") return stage;
		return stage;
	}

	parseAlternativeFormat(html, leagueType) {
		// Provide basic fallback structure. Full data will be kept in node_helper or moved later if needed.
		return {
			teams: [],
			lastUpdated: new Date().toISOString(),
			source: "Fallback",
			leagueType: leagueType
		};
	}
}

module.exports = BBCParser;
