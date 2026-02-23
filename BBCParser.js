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
					this.logDebug(
						`Checking table candidate (length: ${tableHtml.length})`
					);
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

					this.logDebug(
						`Found table ${processedTables + 1} with ${rows.length} rows`
					);
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
					if (
						teams.length > 0 &&
						!["UCL", "UEL", "ECL", "WORLD_CUP_2026"].includes(leagueType)
					)
						break;
				}
			}

			// Strategy 2: Grid/Div based table (modern BBC layout)
			if (teams.length === 0) {
				this.logDebug(
					`No standard table found for ${leagueType}, trying Grid/Div parsing`
				);
				const rowRegex =
					/<(?:div|article)[^>]*class="[^"]*(?:TableRecord|TableRow|gel-layout__item)[^"]*"[^>]*role="row"[^>]*>(.*?)<\/(?:div|article)>/gis;
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
				this.logDebug(
					`No teams parsed for ${leagueType} using standard methods, trying fallback`
				);
				return this.parseAlternativeFormat(html, leagueType);
			}

			return {
				teams: teams,
				lastUpdated: new Date().toISOString(),
				source: "BBC Sport",
				leagueType: leagueType
			};
		} catch (error) {
			console.error(
				` MMM-MyTeams-LeagueTable: Error parsing ${leagueType} data:`,
				error
			);
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
			if (rowHtml.includes("HeadingRow") || rowHtml.includes("<th"))
				return null;

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
				const teamNameMatch =
					rowHtml.match(/data-testid="team-name"[^>]*>([^<]+)<\/span>/i) ||
					rowHtml.match(
						/class="[^"]*VisuallyHidden[^"]*"[^>]*>([^<]+)<\/span>/i
					) ||
					rowHtml.match(/class="[^"]*team-name[^"]*"[^>]*>([^<]+)<\/span>/i) ||
					rowHtml.match(/<a[^>]*>([^<]+)<\/a>/i);
				if (teamNameMatch) {
					teamName = teamNameMatch[1].trim();
				}
			}

			if (teamName) {
				// Normalize team name to expand truncated/abbreviated names
				teamName = this.normalizeTeamName(teamName);
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
			if (!Number.isFinite(goalDifference))
				goalDifference = goalsFor - goalsAgainst;
			const points = this.getAriaNum(rowHtml, "Points");
			const form = this.getForm(rowHtml);

			if (this.config.debug && form.length === 0 && played > 0) {
				this.logDebug(
					`No form found for team: ${teamName}. Played: ${played}. Row HTML length: ${rowHtml.length}`
				);
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
	 * @param {Map} fixturesMap - Map to store fixtures (for deduplication)
	 * @returns {Map} - Map of fixture objects
	 */
	_parseBBCFixtureArticles(html, fixturesMap = new Map()) {
		const sections = [];
		let lastIndex = 0;
		const headerRegex =
			/<h\d[^>]*class="[^"]*(?:sp-c-date-header|GroupHeader|Heading|StyledHeading|GelHeading|FixtureTableHeading|MatchDateHeader|TodayHeader|sp-c-match-list-heading|MatchListHeading)[^"]*"[^>]*>([\s\S]*?)<\/h\d>|<h\d[^>]*>(?:Play-off|Playoff|Round of 32|Knockout|Round of 16|Rd16|Quarter|Semi|Final|KNOCKOUT ROUND PLAY-OFFS)[\s\S]*?<\/h\d>/gi;

		let h;
		while ((h = headerRegex.exec(html)) !== null) {
			if (h.index > lastIndex) {
				sections.push({
					header:
						sections.length > 0 ? sections[sections.length - 1].header : null,
					content: html.substring(lastIndex, h.index)
				});
			}
			sections.push({ header: h[0], content: "" });
			lastIndex = headerRegex.lastIndex;
		}
		if (lastIndex < html.length) {
			sections.push({
				header:
					sections.length > 0 ? sections[sections.length - 1].header : null,
				content: html.substring(lastIndex)
			});
		}
		if (sections.length === 0) sections.push({ header: null, content: html });

		this.logDebug(
			`_parseBBCFixtureArticles: Split HTML into ${sections.length} sections`
		);

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
				const dataDate = headerHtml.match(
					/data-(?:date|datetime|iso)="(\d{4}-\d{2}-\d{2})/i
				);
				if (dataDate) {
					info.dateStr = dataDate[1];
					info.isoDate = dataDate[1];
				}
			}

			const headerText = headerHtml.replace(/<[^>]*>/g, "").trim();
			if (!info.dateStr) {
				// Support "Tuesday 17 February" or "17 Feb 2026"
				const dateMatch = headerText.match(
					/(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*(\d{1,2})(?:st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(\d{4})?/i
				);
				if (dateMatch) {
					const day = dateMatch[1].padStart(2, "0");
					const monthName = dateMatch[2].toLowerCase();
					const year = dateMatch[3] || new Date().getFullYear();
					const months = {
						jan: "01",
						feb: "02",
						mar: "03",
						apr: "04",
						may: "05",
						jun: "06",
						jul: "07",
						aug: "08",
						sep: "09",
						oct: "10",
						nov: "11",
						dec: "12"
					};
					const month = months[monthName.substring(0, 3)];
					if (month) info.dateStr = `${year}-${month}-${day}`;
				} else if (
					/today|live/i.test(headerText) &&
					!/Results|Fixtures/i.test(headerText)
				) {
					// Only use "Today" as date if the header explicitly mentions today/live
					info.dateStr = new Date().toLocaleDateString("en-CA");
				}
			}

			info.stage = this._inferStageFromBlock(headerText);
			return info;
		};

		let currentSectionDate = "";
		let currentSectionStage = undefined;
		let fixtureCount = 0;

		for (const section of sections) {
			const info = getSectionInfo(section.header);
			if (info.dateStr) currentSectionDate = info.dateStr;
			if (info.stage) currentSectionStage = info.stage;

			if (!section.content.trim()) continue;

			// Improved fixture block detection using lookahead for the next fixture or section boundary
			// This handles nested tags better than matching closing tags
			const fixtureRegex =
				/<(article|div|li)([^>]*?(?:class="[^"]*?(?:sp-c-fixture|GridContainer|MatchItem|FixtureBlock|MatchListItem|HeadToHeadWrapper|StyledHeadToHeadWrapper|MatchGroup|FixtureList|ListItem|MatchRecord|LiveMatch|UpcomingMatch)[^"]*?"|data-event-id="[^"]+"|data-testid="[^"]*(?:fixture|match-list-item|match-record)[^"]*")[^>]*?)>([\s\S]*?)(?=<article|<div[^>]*?(?:data-event-id|data-testid="[^"]*(?:fixture|match-list-item|match-record)[^"]*")|<li[^>]*?(?:class="[^"]*?(?:HeadToHeadWrapper|ListItem|MatchRecord)[^"]*?"|data-event-id)|<div[^>]*?class="[^"]*?(?:sp-c-fixture|GridContainer|MatchItem|FixtureBlock|MatchListItem|MatchGroup|FixtureList|ListItem|MatchRecord|LiveMatch|UpcomingMatch)[^"]*?"|$)/gi;

			let m;
			let sectionFixtures = 0;
			while ((m = fixtureRegex.exec(section.content)) !== null) {
				fixtureCount++;
				sectionFixtures++;
				const attributes = m[2];
				const content = m[3];
				const block = attributes + content;

				// Centralized team extraction logic
				const extractTeams = (b) => {
					const teamsFound = [];

					// Match various team name containers in a single pass where possible
					// Only use single-team patterns here to avoid home/away swap issues when parts of block are analyzed
					const teamPatterns = [
						/data-testid="[^"]*team-name[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
						/class="[^"]*(?:team-name|qa-full-team-name|LongName|GelName|DesktopValue|MobileValue|HomeTeamName|AwayTeamName)[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
						/<abbr[^>]*title="([^"]+)"[^>]*>/gi,
						/data-abbv="([^"]+)"/gi,
						/<span[^>]*class="[^"]*team-name-short[^"]*"[^>]*>([\s\S]*?)<\/span>/gi
					];

					teamPatterns.forEach((pattern) => {
						let match;
						if (pattern.global) {
							while ((match = pattern.exec(b)) !== null) {
								teamsFound.push(match[1]);
							}
						} else {
							match = b.match(pattern);
							if (match) {
								teamsFound.push(match[1]);
							}
						}
					});

					return teamsFound
						.map((t) =>
							t
								.replace(/<[^>]*>/g, "")
								.replace(/&amp;/g, "&")
								.replace(/Aggregate score.*/i, "")
								.trim()
						)
						.filter((t) => t.length > 0 && t.length < 50); // Filter out garbage
				};

				const separatorRegex =
					/<(?:div|span|time)[^>]*class="[^"]*(?:sp-c-fixture__block|sp-c-fixture__status|ScoreValue|StyledTime|eli9aj90|StatusValue|FixtureScore|MatchStatus|FixtureTime|MatchTime|TimeValue)[^"]*"[^>]*>[\s\S]*?<\/(?:div|span|time)>|(\d+\s*[-–]\s*\d+)|(\d\d:\d\d)|(\bvs\b)/i;
				const sepMatch = block.match(separatorRegex);

				let homeTeam = null,
					awayTeam = null;

				// Priority 1: Summary line (Team A versus Team B) - Most reliable for ordering
				const versusMatch = block.match(
					/([A-Z0-9][a-z0-9.']+(?:\s+[A-Z0-9][a-z0-9.']+)*)\s+versus\s+([A-Z0-9][a-z0-9.']+(?:\s+[A-Z0-9][a-z0-9.']+)*)/i
				);
				if (versusMatch) {
					homeTeam = versusMatch[1].replace(/Aggregate score.*/i, "").trim();
					awayTeam = versusMatch[2].replace(/Aggregate score.*/i, "").trim();
				}

				// Priority 2: Specific Home/Away containers
				if (!homeTeam || !awayTeam) {
					const homeContainerRegex =
						/<(?:div|span)[^>]*class="[^"]*?(?:TeamHome|HomeTeam)[^"]*?"[^>]*>([\s\S]*?)<\/div>/i;
					const awayContainerRegex =
						/<(?:div|span)[^>]*class="[^"]*?(?:TeamAway|AwayTeam)[^"]*?"[^>]*>([\s\S]*?)<\/div>/i;

					const hMatch = block.match(homeContainerRegex);
					const aMatch = block.match(awayContainerRegex);

					if (hMatch && aMatch) {
						homeTeam =
							extractTeams(hMatch[1]).sort((a, b) => b.length - a.length)[0] ||
							homeTeam;
						awayTeam =
							extractTeams(aMatch[1]).sort((a, b) => b.length - a.length)[0] ||
							awayTeam;
					}
				}

				// Priority 3: Aria-label with score (e.g., "Team A 1, Team B 0")
				if (!homeTeam || !awayTeam || homeTeam === awayTeam) {
					const ariaMatch = block.match(
						/aria-label="([^"]+?)\s*\d+\s*,\s*([^"]+?)\s*\d+/i
					);
					if (ariaMatch) {
						homeTeam = ariaMatch[1].trim();
						awayTeam = ariaMatch[2].trim();
					}
				}

				// Priority 4: Split by separator (Time/Score)
				if (!homeTeam || !awayTeam || homeTeam === awayTeam) {
					if (sepMatch) {
						const sepIdx = block.indexOf(sepMatch[0]);
						const hPart = block.substring(0, sepIdx),
							aPart = block.substring(sepIdx + sepMatch[0].length);
						const hTs = extractTeams(hPart),
							aTs = extractTeams(aPart);
						homeTeam = hTs.sort((a, b) => b.length - a.length)[0] || homeTeam;
						awayTeam = aTs.sort((a, b) => b.length - a.length)[0] || awayTeam;
					}
				}

				// Priority 5: Collect all team names and pick first two in order (Task: Fix Swap)
				if (!homeTeam || !awayTeam || homeTeam === awayTeam) {
					const allRaw = extractTeams(block);
					const unique = [];
					allRaw.forEach((t) => {
						if (!unique.includes(t)) unique.push(t);
					});
					if (unique.length >= 2) {
						homeTeam = unique[0];
						awayTeam = unique[1];
					}
				}

				if (!homeTeam || !awayTeam) continue;

				// Clean up team names: remove "kick off" patterns (with or without time)
				const originalHomeTeam = homeTeam;
				const originalAwayTeam = awayTeam;

				// Match "kick off" followed by optional time (handles: "kick off 17:45", "kick off 17", "kick off")
				// Also match standalone "kick" at the end (handles: "Team to be confirmed Kick")
				homeTeam = homeTeam
					.replace(/kick\s*off\s*(\d{1,2}([:.]\d{2})?)?/gi, "")
					.trim();
				awayTeam = awayTeam
					.replace(/kick\s*off\s*(\d{1,2}([:.]\d{2})?)?/gi, "")
					.trim();
				homeTeam = homeTeam.replace(/\s+kick$/gi, "").trim();
				awayTeam = awayTeam.replace(/\s+kick$/gi, "").trim();

				// Also remove any trailing commas, periods, or extra whitespace
				homeTeam = homeTeam.replace(/[,.\s]+$/, "").trim();
				awayTeam = awayTeam.replace(/[,.\s]+$/, "").trim();

				// ALWAYS log when team names are cleaned (not just in debug mode) to verify execution
				if (homeTeam !== originalHomeTeam || awayTeam !== originalAwayTeam) {
					console.log(
						`[BBCParser] Team name cleaning: "${originalHomeTeam}" vs "${originalAwayTeam}" -> "${homeTeam}" vs "${awayTeam}"`
					);
					this.logDebug(
						`Team name cleaning: "${originalHomeTeam}" vs "${originalAwayTeam}" -> "${homeTeam}" vs "${awayTeam}"`
					);
				}

				// Normalize team names to expand truncated/abbreviated names (e.g., "Atletico" → "Atletico Madrid")
				homeTeam = this.normalizeTeamName(homeTeam);
				awayTeam = this.normalizeTeamName(awayTeam);

				// Task: Extract event ID for robust deduplication
				const eventIdMatch = attributes.match(/data-event-id="([^"]+)"/);
				const eventId = eventIdMatch ? eventIdMatch[1] : null;

				const stage =
					currentSectionStage || this._inferStageFromBlock(block) || "GS";

				// Improved score extraction (Task: Robustness)
				// FIX: Extract aggregate score FIRST, then exclude it when looking for match scores
				let scores = [];

				// Step 1: Extract aggregate score first (if present)
				const aggMatch =
					block.match(/\((?:agg\s*)?(\d+-\d+)\)/i) ||
					block.match(/agg\s*(\d+-\d+)/i);
				const aggregateScore = aggMatch ? aggMatch[1] : undefined;

				// Create a cleaned block that excludes aggregate score text to avoid confusion
				let blockForScoring = block;
				if (aggregateScore) {
					// Remove all variations of aggregate score notation from the block before score extraction
					blockForScoring = block.replace(/\((?:agg\s*)?(\d+-\d+)\)/gi, "");
					blockForScoring = blockForScoring.replace(/agg\s*(\d+-\d+)/gi, "");
					blockForScoring = blockForScoring.replace(
						/aggregate\s*score[^<]*(\d+-\d+)/gi,
						""
					);
				}

				// Step 2: Check aria-label first as it's very reliable for current scores
				const ariaScoreMatch = blockForScoring.match(
					/aria-label="[^"]+?\s*(\d+)\s*,\s*[^"]+?\s*(\d+)/i
				);
				if (ariaScoreMatch) {
					scores = [ariaScoreMatch[1], ariaScoreMatch[2]];
				} else {
					// Step 3: Try to find scores by modern BBC classes and data-testids
					const scoresRaw = Array.from(
						blockForScoring.matchAll(
							/<(?:span|div)[^>]*?(?:class="[^"]*?(?:sp-c-fixture__number|sp-c-fixture__number--[a-z]+|ScoreValue|MatchScore|FixtureScore|score-value)[^"]*?"|data-testid="[^"]*?(?:score-value|match-score|score)[^"]*?")[^>]*?>([\s\S]*?)<\/(?:span|div)>/gi
						)
					).map((x) => x[1]);
					scores = scoresRaw
						.map((s) => s.replace(/<[^>]*>/g, "").trim())
						.filter((s) => /^\d+$/.test(s));
				}

				// Step 4: Fallback to hyphenated score match (but not if it's the aggregate we already found)
				if (scores.length < 2) {
					const sm = blockForScoring.match(/(\d+)\s*[-–,]\s*(\d+)/);
					if (sm) {
						const potentialScore = `${sm[1]}-${sm[2]}`;
						// Only use this if it's NOT the same as the aggregate score
						if (potentialScore !== aggregateScore) {
							scores = [sm[1], sm[2]];
						}
					}
				}

				// Step 5: Last resort - scan for isolated digits (only if no aggregate score present)
				// This prevents aggregate scores from being misinterpreted as match scores
				if (scores.length < 2 && !aggregateScore) {
					const allDigits = Array.from(
						blockForScoring.matchAll(/>\s*(\d+)\s*</g)
					).map((x) => x[1]);
					if (allDigits.length >= 2) {
						// For live matches, the scores are usually the first two isolated numbers
						scores = [allDigits[0], allDigits[1]];
					}
				}

				// Only set homeScore/awayScore if we actually found MATCH scores (not aggregate)
				const homeScore = scores.length >= 2 ? parseInt(scores[0]) : undefined;
				const awayScore = scores.length >= 2 ? parseInt(scores[1]) : undefined;

				// Improved ISO date/time extraction from fixture block (Task: Fix Date Bleeding)
				let fixtureIso =
					(block.match(/<time[^>]*datetime="([^"]+)"[^>]*>/i) ||
						block.match(/data-(?:datetime|iso|date)="([^"]+)"/i) ||
						[])[1] || "";

				let statusStr = "";
				let isLive = false;

				// Improved status detection (Task: Precision)
				// FIX: Only set live status for ACTUALLY live matches, not upcoming ones
				// Strict detection: must have explicit live indicators

				// Priority 1: Check for finished status first
				if (
					block.includes("FinishedFixture") ||
					/\b(FT|PEN|Full time)\b/i.test(block)
				) {
					const sm = block.match(/\b(FT|PEN)\b/i);
					statusStr = sm ? sm[1].toUpperCase() : "FT";
				}
				// Priority 2: Check for live status - must have BOTH LiveFixture class AND actual indicators
				else if (
					block.includes("LiveFixture") &&
					block.match(/\d{1,2}'|HT|AET|in progress/i)
				) {
					isLive = true;

					// Try multiple patterns to extract live minute marker
					// Pattern 1: "45'" or "90+3'" (most reliable)
					const minMatch1 = block.match(/\b(\d{1,2}(?:\+\d{1,2})?')\b/);
					if (minMatch1) {
						statusStr = minMatch1[1];
					}
					// Pattern 2: "HT" or "AET"
					else {
						const sm = block.match(/\b(HT|AET)\b/i);
						if (sm) {
							statusStr = sm[1].toUpperCase();
						}
						// Pattern 3: "X minutes, in progress"
						else {
							const minMatch2 = block.match(
								/(\d+)\s*minutes?\s*[,]?\s*in progress/i
							);
							if (minMatch2) {
								statusStr = minMatch2[1] + "'";
							}
							// Pattern 4: Look for standalone minute numbers near "Live" text
							else if (block.includes("Live") || block.includes("live")) {
								const minMatch3 = block.match(
									/Live[^<]*?(\d{1,2})[^<]*?(?:min|')/i
								);
								if (minMatch3) {
									statusStr = minMatch3[1] + "'";
								} else {
									// Default to "LIVE" only if we have strong evidence of live match
									statusStr = "LIVE";
								}
							} else {
								statusStr = "LIVE";
							}
						}
					}
				}
				// DO NOT set live/status for upcoming fixtures
				// They should have no status set

				const venueMatch = block.match(
					/<span[^>]*class="[^"]*(?:venue|stadium)[^"]*"[^>]*>([\s\S]*?)<\/span>/i
				);
				const venue = venueMatch
					? venueMatch[1].replace(/<[^>]*>/g, "").trim()
					: "";

				// Task: Fix incorrect date fallback (Feb 18 for all). Priority: 1. ISO date from block, 2. Section header date, 3. Today's date
				let fixtureDate =
					(fixtureIso ? fixtureIso.split("T")[0] : currentSectionDate) ||
					new Date().toLocaleDateString("en-CA");
				const timeTextMatch = block.match(
					/<(?:time|span)[^>]*class="[^"]*(?:StyledTime|eli9aj90|FixtureTime|MatchTime|TimeValue)[^"]*"[^>]*>([\s\S]*?)<\/(?:time|span)>/i
				);
				let time = timeTextMatch
					? timeTextMatch[1].replace(/<[^>]*>/g, "").trim()
					: "";

				// Fix doubled time strings (e.g., "17:4517:45" -> "17:45")
				if (time.length > 5 && time.match(/^\d\d:\d\d\d\d:\d\d$/)) {
					time = time.substring(0, 5);
				}

				// Fallback to "kick off HH:mm" text if container fails
				if (!time || time === "vs") {
					const kickoffMatch = block.match(/kick off\s*(\d\d[:.]\d\d)/i);
					if (kickoffMatch) time = kickoffMatch[1].replace(".", ":");
				}

				// Ensure we have a valid time or fallback to ISO time (Task: Fix 'vs' in Time column)
				if (
					(!time || time === "vs") &&
					fixtureIso &&
					fixtureIso.includes("T")
				) {
					time = fixtureIso.split("T")[1].substring(0, 5);
				}

				// If still no time, use "vs" as last resort
				if (!time) time = "vs";

				// Deduplicate: Use an order-independent key with aggressive normalization
				const normalizeForKey = (t) => {
					if (!t) return "";
					return t
						.toLowerCase()
						.replace(/&amp;/g, "&")
						.replace(
							/\b(united|fc|afc|sc|city|town|rovers|athletic|albion|rsc|rb|ks|sl|sports|football|club|real|atletico|de|la|st|st\.)\b/gi,
							""
						)
						.replace(/[^a-z0-9]/g, "")
						.trim();
				};

				const teamA = normalizeForKey(homeTeam);
				const teamB = normalizeForKey(awayTeam);

				// FIX: For two-legged knockout ties, preserve home/away order
				// Use teams in home/away order, NOT sorted alphabetically
				// This ensures first leg (PSG vs Real) and second leg (Real vs PSG) are treated as separate fixtures
				const teamsInOrder = `${teamA}|${teamB}`;
				const teamDateKey = `${teamsInOrder}|${fixtureDate}`;
				const eidKey = eventId ? `eid-${eventId}` : null;

				// Find existing entry using either eventId or exact match
				let existingKey = null;

				if (eidKey && fixturesMap.has(eidKey)) {
					existingKey = eidKey;
				} else if (fixturesMap.has(teamDateKey)) {
					existingKey = teamDateKey;
				} else {
					// Proximity search: find match with EXACT SAME home/away teams within +/- 1 day ONLY
					// FIX: Reduced from 3 days to 1 day to prevent merging first and second legs
					// Two-legged knockout ties are typically 7-14 days apart, so 1-day window is safe
					for (const [k, v] of fixturesMap) {
						const vTeamA = normalizeForKey(v.homeTeam);
						const vTeamB = normalizeForKey(v.awayTeam);
						const vTeamsInOrder = `${vTeamA}|${vTeamB}`;

						// Only match if teams are in SAME ORDER (same home/away)
						if (vTeamsInOrder === teamsInOrder) {
							const d1 = new Date(fixtureDate);
							const d2 = new Date(v.date);
							if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
								const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
								// FIX: Changed from 3 days to 1 day
								if (diffDays < 1) {
									console.log(
										`[BBCParser-PROXIMITY] Found close match: "${homeTeam}" vs "${awayTeam}" | dates: ${fixtureDate} vs ${v.date} (${diffDays.toFixed(2)} days apart)`
									);
									existingKey = k;
									break;
								}
							}
						}
					}
				}

				const fixtureData = {
					eventId,
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
					live: isLive, // FIX: Use the isLive flag set during status detection
					status: statusStr,
					fixtureIso, // Save for merging decisions
					timestamp: this.parseDateTime(
						fixtureIso,
						fixtureDate,
						/\d\d:\d\d/.test(time) ? time : ""
					)
				};

				if (existingKey) {
					const existing = fixturesMap.get(existingKey);
					const existingScore = existing.homeScore !== undefined;
					const newScore = fixtureData.homeScore !== undefined;

					// Decision logic: prefer live data, or data with scores, or data with ISO timestamp (more reliable date)
					if (
						fixtureData.live ||
						(newScore && !existing.live) ||
						(!existing.eventId && fixtureData.eventId) ||
						(fixtureData.fixtureIso && !existing.fixtureIso) ||
						(!existingScore && newScore) ||
						(fixtureData.date !== existing.date &&
							fixtureData.fixtureIso &&
							!existing.fixtureIso)
					) {
						if (eidKey && !existing.eventId) {
							fixturesMap.delete(existingKey);
							fixturesMap.set(eidKey, fixtureData);
						} else {
							fixturesMap.set(existingKey, fixtureData);
						}
					}
				} else {
					fixturesMap.set(eidKey || teamDateKey, fixtureData);
				}
			}
			if (sectionFixtures === 0 && section.content.length > 100) {
				this.logDebug(
					`Section "${section.header ? section.header.replace(/<[^>]*>/g, "") : "Unknown"}" yielded 0 fixtures.`
				);
			}
		}
		this.logDebug(
			`_parseBBCFixtureArticles: Found ${fixtureCount} fixtures in total.`
		);
		return fixturesMap;
	}

	_computeGroupTablesFromFixtures(fixtures) {
		const groups = {};
		fixtures.forEach((f) => {
			if (f.stage === "GS" && f.group && f.homeTeam && f.awayTeam) {
				groups[f.group] = groups[f.group] || {};
				if (!groups[f.group][f.homeTeam])
					groups[f.group][f.homeTeam] = this._blankTeam(f.homeTeam);
				if (!groups[f.group][f.awayTeam])
					groups[f.group][f.awayTeam] = this._blankTeam(f.awayTeam);
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
			const teamNameMatch =
				rowHtml.match(/data-testid="team-name"[^>]*>([^<]+)<\/span>/i) ||
				rowHtml.match(
					/class="[^"]*VisuallyHidden[^"]*"[^>]*>([^<]+)<\/span>/i
				) ||
				rowHtml.match(/class="[^"]*team-name[^"]*"[^>]*>([^<]+)<\/span>/i) ||
				rowHtml.match(/<a[^>]*>([^<]+)<\/a>/i);
			if (teamNameMatch) {
				name = teamNameMatch[1].trim();
			}
		}

		if (name) {
			// Normalize team name to expand truncated/abbreviated names
			name = this.normalizeTeamName(name);
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
		if (!Number.isFinite(goalDifference))
			goalDifference = goalsFor - goalsAgainst;
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
		console.log(
			`[BBCParser] *** parseUEFACompetitionData START for ${leagueType} ***`
		);
		this.logDebug(
			`parseUEFACompetitionData called for ${leagueType}. fixturesHtml is Array: ${Array.isArray(fixturesHtml)}`
		);
		const baseData = this.parseLeagueData(tablesHtml, leagueType);
		const fixturesMap = new Map();

		if (Array.isArray(fixturesHtml)) {
			this.logDebug(
				`Processing ${fixturesHtml.length} HTML parts for ${leagueType}`
			);
			fixturesHtml.forEach((html, idx) => {
				const before = fixturesMap.size;
				this._parseBBCFixtureArticles(html, fixturesMap);
				this.logDebug(
					`Part ${idx} added ${fixturesMap.size - before} new fixtures (Total: ${fixturesMap.size}). HTML length: ${html.length}`
				);
				if (fixturesMap.size - before === 0 && html.length > 500) {
					this.logDebug(
						`Warning: Part ${idx} yielded 0 fixtures despite having ${html.length} chars. Snippet: ${html.substring(0, 300).replace(/\n/g, "")}`
					);
				}
			});
		} else {
			this._parseBBCFixtureArticles(fixturesHtml, fixturesMap);
		}

		const allFixtures = Array.from(fixturesMap.values());
		console.log(
			`[BBCParser] Total fixtures parsed for ${leagueType}: ${allFixtures.length}`
		);
		this.logDebug(
			`Total fixtures parsed for ${leagueType}: ${allFixtures.length}`
		);

		// Log ALL fixtures BEFORE deduplication for diagnosis
		console.log(
			`[BBCParser-DETAILED] ===== ALL FIXTURES BEFORE DEDUP (${leagueType}) =====`
		);
		allFixtures.forEach((fix, idx) => {
			console.log(
				`[BBCParser-DETAILED] #${idx + 1}: "${fix.homeTeam}" vs "${fix.awayTeam}" | date=${fix.date} | time=${fix.time || "N/A"} | score=${fix.score || "N/A"}`
			);
		});
		console.log(`[BBCParser-DETAILED] ===== END FIXTURES BEFORE DEDUP =====`);

		// Additional deduplication pass to ensure no duplicates slip through
		// Create a final deduplication based on normalized team names, date, and time
		const finalFixturesMap = new Map();
		const duplicateLog = [];
		// FIX: Less aggressive normalization that preserves team identity
		// Only normalize case and special characters, don't strip essential team name words
		const normalizeTeamForDedup = (team) => {
			return team
				.toLowerCase()
				.replace(/&amp;/g, "&")
				.replace(/\//g, " ") // Replace slashes with spaces for consistency ("Bodo/Glimt" → "Bodo Glimt")
				.replace(/[^a-z0-9\s]/g, "") // Remove special chars but keep spaces
				.replace(/\s+/g, " ") // Normalize multiple spaces to single space
				.trim();
		};

		// Helper function to check if two team names are similar (handles truncation/corruption)
		const areSimilarTeams = (team1Norm, team2Norm) => {
			// Exact match
			if (team1Norm === team2Norm) return true;

			// FIX: Handle very short truncated names (e.g., "ros" from "ferencvaros", "bod" from "bodo")
			// If one name is very short (< 4 chars), check if the longer name STARTS with it or ENDS with it
			if (team1Norm.length < 4 || team2Norm.length < 4) {
				const shorter =
					team1Norm.length < team2Norm.length ? team1Norm : team2Norm;
				const longer =
					team1Norm.length < team2Norm.length ? team2Norm : team1Norm;

				// Require at least 3 characters to avoid false positives
				if (shorter.length >= 3) {
					// FIX: Only match if the ratio is reasonable (avoid matching "mil" with "inter milan")
					const lengthRatio = longer.length / shorter.length;

					// If the longer name is more than 4x the shorter, they're probably different teams
					// Exception: if shorter is exactly 3 chars and longer ends with it, still match (e.g., "ros" in "ferencvaros")
					if (
						lengthRatio > 4 &&
						shorter.length === 3 &&
						!longer.endsWith(shorter)
					) {
						return false;
					}

					// Check if longer name starts with or ends with the shorter name
					if (longer.startsWith(shorter) || longer.endsWith(shorter)) {
						console.log(
							`[BBCParser-SIMILARITY] Matched truncated name: "${shorter}" in "${longer}" (ratio: ${lengthRatio.toFixed(2)})`
						);
						return true;
					}
				}
			}

			// Check if one is a substring of the other (handles truncation like "ferencv" vs "ferencvaros")
			// Require at least 4 chars to avoid false positives
			if (team1Norm.length >= 4 && team2Norm.length >= 4) {
				if (team1Norm.includes(team2Norm) || team2Norm.includes(team1Norm))
					return true;
			}

			// Check if they start with the same 5 characters (handles minor differences)
			if (team1Norm.length >= 5 && team2Norm.length >= 5) {
				if (team1Norm.substring(0, 5) === team2Norm.substring(0, 5))
					return true;
			}

			return false;
		};

		allFixtures.forEach((fixture) => {
			const teamA = normalizeTeamForDedup(fixture.homeTeam);
			const teamB = normalizeTeamForDedup(fixture.awayTeam);

			// FIX: For two-legged knockout ties, preserve home/away order
			// Don't sort team names - use them in home/away order to distinguish legs
			// First leg: "psg|realmadrid|2026-02-19"
			// Second leg: "realmadrid|psg|2026-02-26"
			// These are DIFFERENT fixtures and should both be kept
			const teamsInOrder = `${teamA}|${teamB}`;

			// Base dedup key: teams IN HOME/AWAY ORDER + date
			const baseDedupKey = `${teamsInOrder}|${fixture.date}`;

			// Check for existing fixture with EXACT same teams (in same order) and SAME date
			let isDuplicate = false;
			let existingKey = null;

			// Look for duplicates by scanning the map (now using fuzzy matching)
			for (const [key, existing] of finalFixturesMap) {
				// Check if dates match
				if (!key.includes(fixture.date)) continue;

				// Normalize existing fixture teams
				const existingTeamA = normalizeTeamForDedup(existing.homeTeam);
				const existingTeamB = normalizeTeamForDedup(existing.awayTeam);

				// FIX: Check if teams match in the SAME ORDER (home vs away matters for two-legged ties)
				// Only treat as duplicate if:
				// 1. Same date AND
				// 2. Same home team AND same away team (NOT reversed)
				const exactMatch =
					areSimilarTeams(teamA, existingTeamA) &&
					areSimilarTeams(teamB, existingTeamB);

				if (exactMatch) {
					isDuplicate = true;
					existingKey = key;

					console.log(
						`[BBCParser-DEDUP] Found duplicate: "${fixture.homeTeam}" vs "${fixture.awayTeam}" (${fixture.date})`
					);
					console.log(
						`[BBCParser-DEDUP]   Existing: "${existing.homeTeam}" vs "${existing.awayTeam}"`
					);
					console.log(
						`[BBCParser-DEDUP]   Normalized new: "${teamA}" vs "${teamB}"`
					);
					console.log(
						`[BBCParser-DEDUP]   Normalized existing: "${existingTeamA}" vs "${existingTeamB}"`
					);

					// Decide which version to keep
					const existingHasScore = existing.homeScore !== undefined;
					const newHasScore = fixture.homeScore !== undefined;
					const existingNameLength =
						existing.homeTeam.length + existing.awayTeam.length;
					const newNameLength =
						fixture.homeTeam.length + fixture.awayTeam.length;

					// Prefer: live > has score > longer team names (less truncated) > has eventId > has time
					const shouldReplace =
						fixture.live ||
						(newHasScore && !existing.live) ||
						(newNameLength > existingNameLength && !existingHasScore) ||
						(!existing.eventId && fixture.eventId) ||
						(!existingHasScore && newHasScore) ||
						(fixture.time &&
							fixture.time !== "vs" &&
							(!existing.time || existing.time === "vs"));

					if (shouldReplace) {
						console.log(
							`[BBCParser-DEDUP]   -> Replacing old version with new (better data)`
						);
						finalFixturesMap.delete(existingKey);
						isDuplicate = false; // Will add the new one
					} else {
						console.log(
							`[BBCParser-DEDUP]   -> Keeping old version (already has better data)`
						);
					}

					duplicateLog.push({
						fixture: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
						date: fixture.date,
						action: shouldReplace ? "replaced" : "discarded"
					});

					break;
				}
			}

			// If not a duplicate (or we removed the inferior version), add this fixture
			if (!isDuplicate) {
				const timeStr =
					fixture.time && fixture.time !== "vs" ? `|${fixture.time}` : "";
				const dedupKey = `${baseDedupKey}|${timeStr}`;
				finalFixturesMap.set(dedupKey, fixture);
			}
		});

		const dedupedFixtures = Array.from(finalFixturesMap.values());
		const duplicatesRemoved = allFixtures.length - dedupedFixtures.length;
		console.log(
			`[BBCParser] *** DEDUPLICATION RESULT for ${leagueType}: ${allFixtures.length} -> ${dedupedFixtures.length} (removed ${duplicatesRemoved}) ***`
		);
		this.logDebug(
			`After final deduplication: ${dedupedFixtures.length} fixtures (removed ${duplicatesRemoved} duplicates)`
		);

		// Log details if duplicates were found
		if (duplicatesRemoved > 0) {
			console.log(
				`[${leagueType}] *** WARNING: Found and removed ${duplicatesRemoved} duplicate fixtures ***`
			);
			duplicateLog.forEach((dup) => {
				console.log(
					`[${leagueType}]   - ${dup.fixture} (${dup.date}) [${dup.action}]`
				);
			});

			// Log which fixtures were kept after deduplication
			console.log(`[${leagueType}] *** Fixtures KEPT after deduplication: ***`);
			dedupedFixtures.forEach((fix, idx) => {
				console.log(
					`[${leagueType}]   ${idx + 1}. "${fix.homeTeam}" vs "${fix.awayTeam}" | ${fix.date}`
				);
			});
		} else {
			console.log(
				`[${leagueType}] No duplicates found - deduplication working correctly`
			);
		}

		// Log ALL fixtures AFTER deduplication for diagnosis
		console.log(
			`[BBCParser-DETAILED] ===== ALL FIXTURES AFTER DEDUP (${leagueType}) =====`
		);
		dedupedFixtures.forEach((fix, idx) => {
			console.log(
				`[BBCParser-DETAILED] #${idx + 1}: "${fix.homeTeam}" vs "${fix.awayTeam}" | date=${fix.date} | time=${fix.time || "N/A"} | score=${fix.score || "N/A"} | status=${fix.status || "none"} | agg=${fix.aggregateScore || "none"}`
			);
		});
		console.log(`[BBCParser-DETAILED] ===== END FIXTURES AFTER DEDUP =====`);

		// FIX: FIRST - Remove fixtures with truncated/corrupted team names by finding better versions
		console.log(`[BBCParser-TRUNCATION] Checking for truncated team names...`);
		const truncatedFixtures = [];

		dedupedFixtures.forEach((fixture, idx) => {
			const homeLength = fixture.homeTeam.length;
			const awayLength = fixture.awayTeam.length;

			// Flag fixtures with suspiciously short team names (likely truncated)
			// Most team names are at least 4 characters, so anything less is suspicious
			const homeIsTruncated = homeLength < 4;
			const awayIsTruncated = awayLength < 4;

			if (homeIsTruncated || awayIsTruncated) {
				console.log(
					`[BBCParser-TRUNCATION] Found fixture with truncated name: "${fixture.homeTeam}" (${homeLength} chars) vs "${fixture.awayTeam}" (${awayLength} chars) | date=${fixture.date}`
				);

				// Look for a similar fixture with longer team names (within 3 days)
				const fixtureDate = new Date(fixture.date);

				for (let j = 0; j < dedupedFixtures.length; j++) {
					if (j === idx) continue;
					const other = dedupedFixtures[j];
					const otherDate = new Date(other.date);
					const daysDiff = Math.abs(
						(fixtureDate - otherDate) / (1000 * 60 * 60 * 24)
					);

					// Only look within 3 days (same fixture reported with different dates)
					if (daysDiff <= 3) {
						const homeMatch =
							homeIsTruncated &&
							other.homeTeam
								.toLowerCase()
								.includes(fixture.homeTeam.toLowerCase());
						const awayMatch =
							awayIsTruncated &&
							other.awayTeam
								.toLowerCase()
								.includes(fixture.awayTeam.toLowerCase());

						// Also check if the non-truncated team matches
						const homeOtherMatch =
							!homeIsTruncated &&
							(other.homeTeam.toLowerCase() ===
								fixture.homeTeam.toLowerCase() ||
								other.homeTeam
									.toLowerCase()
									.includes(fixture.homeTeam.toLowerCase()) ||
								fixture.homeTeam
									.toLowerCase()
									.includes(other.homeTeam.toLowerCase()));
						const awayOtherMatch =
							!awayIsTruncated &&
							(other.awayTeam.toLowerCase() ===
								fixture.awayTeam.toLowerCase() ||
								other.awayTeam
									.toLowerCase()
									.includes(fixture.awayTeam.toLowerCase()) ||
								fixture.awayTeam
									.toLowerCase()
									.includes(other.awayTeam.toLowerCase()));

						// If this looks like the same fixture but with better team names, mark for removal
						if (
							(homeMatch || homeOtherMatch) &&
							(awayMatch || awayOtherMatch)
						) {
							console.log(
								`[BBCParser-TRUNCATION]   Found better version: "${other.homeTeam}" vs "${other.awayTeam}" | date=${other.date}`
							);
							console.log(
								`[BBCParser-TRUNCATION]   Marking truncated version for removal`
							);
							truncatedFixtures.push(idx);
							break;
						}
					}
				}
			}
		});

		// Remove truncated fixtures
		if (truncatedFixtures.length > 0) {
			console.log(
				`[BBCParser-TRUNCATION] Removing ${truncatedFixtures.length} truncated fixtures`
			);
			// Remove in reverse order to maintain indices
			truncatedFixtures
				.sort((a, b) => b - a)
				.forEach((idx) => {
					const removed = dedupedFixtures.splice(idx, 1)[0];
					console.log(
						`[BBCParser-TRUNCATION]   Removed: "${removed.homeTeam}" vs "${removed.awayTeam}" (${removed.date})`
					);
				});

			// Log clean fixtures after truncation removal
			console.log(
				`[BBCParser-TRUNCATION] ===== FIXTURES AFTER TRUNCATION REMOVAL (${leagueType}) =====`
			);
			dedupedFixtures.forEach((fix, idx) => {
				console.log(
					`[BBCParser-TRUNCATION] #${idx + 1}: "${fix.homeTeam}" (${fix.homeTeam.length}) vs "${fix.awayTeam}" (${fix.awayTeam.length}) | ${fix.date}`
				);
			});
			console.log(`[BBCParser-TRUNCATION] ===== END =====`);
		}

		// FIX: Enhanced detection for partial/incomplete team names
		// Handles cases like "Newcastle" vs "Newcastle United", "Atletico" vs "Atletico Madrid"
		// Works even when only ONE team name is partial (the other can be identical)
		console.log(
			`[BBCParser-PARTIAL-NAMES] Checking for partial/incomplete team names...`
		);

		dedupedFixtures.forEach((fixture, idx) => {
			const fixtureDate = new Date(fixture.date);

			// Compare with all other fixtures within 14 days (two-legged ties)
			for (let j = 0; j < dedupedFixtures.length; j++) {
				if (j === idx) continue;
				const other = dedupedFixtures[j];
				const otherDate = new Date(other.date);
				const daysDiff = Math.abs(
					(fixtureDate - otherDate) / (1000 * 60 * 60 * 24)
				);

				if (daysDiff > 0 && daysDiff <= 14) {
					const homeNorm = normalizeTeamForDedup(fixture.homeTeam);
					const awayNorm = normalizeTeamForDedup(fixture.awayTeam);
					const otherHomeNorm = normalizeTeamForDedup(other.homeTeam);
					const otherAwayNorm = normalizeTeamForDedup(other.awayTeam);

					// Check all possible team matching scenarios for two-legged ties
					// Scenario A: fixture.home matches other.away (reversed home/away in second leg)
					const homeMatchesOtherAway_Exact = homeNorm === otherAwayNorm;
					const homeMatchesOtherAway_Partial =
						homeNorm.length >= 4 &&
						otherAwayNorm.length > homeNorm.length &&
						otherAwayNorm.includes(homeNorm);
					const homeMatchesOtherAway_PartialReverse =
						otherAwayNorm.length >= 4 &&
						homeNorm.length > otherAwayNorm.length &&
						homeNorm.includes(otherAwayNorm);
					const homeMatchesOtherAway =
						homeMatchesOtherAway_Exact ||
						homeMatchesOtherAway_Partial ||
						homeMatchesOtherAway_PartialReverse;

					// Scenario B: fixture.away matches other.home (reversed home/away in second leg)
					const awayMatchesOtherHome_Exact = awayNorm === otherHomeNorm;
					const awayMatchesOtherHome_Partial =
						awayNorm.length >= 4 &&
						otherHomeNorm.length > awayNorm.length &&
						otherHomeNorm.includes(awayNorm);
					const awayMatchesOtherHome_PartialReverse =
						otherHomeNorm.length >= 4 &&
						awayNorm.length > otherHomeNorm.length &&
						awayNorm.includes(otherHomeNorm);
					const awayMatchesOtherHome =
						awayMatchesOtherHome_Exact ||
						awayMatchesOtherHome_Partial ||
						awayMatchesOtherHome_PartialReverse;

					// If both teams match (indicating this is likely the other leg), check if we should use the other fixture's names
					if (homeMatchesOtherAway && awayMatchesOtherHome) {
						// Use the version with longer (more complete) team names
						const otherHasLongerNames =
							other.homeTeam.length + other.awayTeam.length >
							fixture.homeTeam.length + fixture.awayTeam.length;

						if (otherHasLongerNames) {
							console.log(
								`[BBCParser-PARTIAL-NAMES] Found fixture with partial names: "${fixture.homeTeam}" vs "${fixture.awayTeam}" (${fixture.date})`
							);
							console.log(
								`[BBCParser-PARTIAL-NAMES]   Better version found: "${other.homeTeam}" vs "${other.awayTeam}" (${other.date})`
							);

							// Use the complete names from the other fixture (reversed for two-legged tie)
							fixture.homeTeam = other.awayTeam;
							fixture.awayTeam = other.homeTeam;

							console.log(
								`[BBCParser-PARTIAL-NAMES]   Fixed to: "${fixture.homeTeam}" vs "${fixture.awayTeam}"`
							);
							break;
						}
					}
				}
			}
		});

		// Fix corrupted fixtures where BBC shows same team twice (e.g., "Dortmund vs Borussia Dortmund")
		console.log(
			`[BBCParser-CORRUPTION] Checking for corrupted fixtures with duplicate teams...`
		);
		dedupedFixtures.forEach((fixture, idx) => {
			const teamA = normalizeTeamForDedup(fixture.homeTeam);
			const teamB = normalizeTeamForDedup(fixture.awayTeam);

			// Check if home and away teams are the same or very similar
			const isSameTeam =
				teamA === teamB ||
				(teamA.length >= 5 &&
					teamB.length >= 5 &&
					(teamA.includes(teamB) || teamB.includes(teamA)));

			if (isSameTeam) {
				console.log(
					`[BBCParser-CORRUPTION] Found corrupted fixture: "${fixture.homeTeam}" vs "${fixture.awayTeam}" (${fixture.date})`
				);

				// Look for a proper two-legged fixture within 14 days that has the same team but different opponent
				const fixtureDate = new Date(fixture.date);

				for (let j = 0; j < dedupedFixtures.length; j++) {
					if (j === idx) continue;
					const other = dedupedFixtures[j];
					const otherTeamA = normalizeTeamForDedup(other.homeTeam);
					const otherTeamB = normalizeTeamForDedup(other.awayTeam);
					const otherDate = new Date(other.date);
					const daysDiff = Math.abs(
						(fixtureDate - otherDate) / (1000 * 60 * 60 * 24)
					);

					// Check if the other fixture is within 14 days and involves one of our teams
					if (daysDiff > 0 && daysDiff <= 14) {
						// Check if other fixture has one team matching our corrupted team
						const otherHasSameTeam =
							teamA === otherTeamA ||
							teamA === otherTeamB ||
							teamA.includes(otherTeamA) ||
							otherTeamA.includes(teamA) ||
							teamA.includes(otherTeamB) ||
							otherTeamB.includes(teamA);

						// Check that the other fixture has DIFFERENT teams (not also corrupted)
						const otherIsValid =
							otherTeamA !== otherTeamB &&
							!(
								otherTeamA.includes(otherTeamB) ||
								otherTeamB.includes(otherTeamA)
							);

						if (otherHasSameTeam && otherIsValid) {
							console.log(
								`[BBCParser-CORRUPTION]   Found valid counterpart: "${other.homeTeam}" vs "${other.awayTeam}" (${other.date})`
							);

							// Determine which team in the corrupted fixture is correct and which is wrong
							// The longer team name is usually more complete
							const longerTeam =
								fixture.homeTeam.length >= fixture.awayTeam.length
									? fixture.homeTeam
									: fixture.awayTeam;

							// Find the opponent from the other fixture
							let opponent = null;
							if (
								normalizeTeamForDedup(longerTeam) === otherTeamA ||
								normalizeTeamForDedup(longerTeam).includes(otherTeamA) ||
								otherTeamA.includes(normalizeTeamForDedup(longerTeam))
							) {
								opponent = other.awayTeam;
							} else if (
								normalizeTeamForDedup(longerTeam) === otherTeamB ||
								normalizeTeamForDedup(longerTeam).includes(otherTeamB) ||
								otherTeamB.includes(normalizeTeamForDedup(longerTeam))
							) {
								opponent = other.homeTeam;
							}

							if (opponent) {
								// Fix the corrupted fixture - the second leg tells us the teams
								// If current fixture is earlier, it's the first leg (reversed teams)
								if (fixtureDate < otherDate) {
									// This is first leg, other is second leg
									// Second leg is: other.homeTeam vs other.awayTeam
									// So first leg should be: other.awayTeam vs other.homeTeam (reversed)
									fixture.homeTeam = other.awayTeam;
									fixture.awayTeam = other.homeTeam;
									console.log(
										`[BBCParser-CORRUPTION]   Fixed first leg: "${fixture.homeTeam}" vs "${fixture.awayTeam}"`
									);
								} else {
									// This is second leg, other is first leg
									// First leg is: other.homeTeam vs other.awayTeam
									// So second leg should be: other.awayTeam vs other.homeTeam (reversed)
									fixture.homeTeam = other.awayTeam;
									fixture.awayTeam = other.homeTeam;
									console.log(
										`[BBCParser-CORRUPTION]   Fixed second leg: "${fixture.homeTeam}" vs "${fixture.awayTeam}"`
									);
								}
								break;
							}
						}
					}
				}
			}
		});

		// FIX: Final cleanup - Apply known team name completions that weren't caught by automated detection
		// This handles cases where BBC consistently uses partial names across ALL fixtures
		console.log(`[BBCParser-CLEANUP] Applying known team name completions...`);
		const knownPartialNames = {
			// UEFA European competitions common partial names
			atletico: "Atletico Madrid",
			inter: "Inter Milan",
			milan: "AC Milan",
			newcastle: "Newcastle United",
			manchester: "Manchester United", // Could be City, but United more common in European competitions
			"bodo glimt": "Bodo / Glimt", // Normalize slash variations
			bodoglimt: "Bodo / Glimt",
			leverkusen: "Bayer Leverkusen",
			sporting: "Sporting CP",
			ajax: "Ajax Amsterdam",
			psv: "PSV Eindhoven"
		};

		dedupedFixtures.forEach((fixture) => {
			const homeNorm = normalizeTeamForDedup(fixture.homeTeam);
			const awayNorm = normalizeTeamForDedup(fixture.awayTeam);

			// Check if home team matches a known partial name
			if (
				knownPartialNames[homeNorm] &&
				fixture.homeTeam.toLowerCase() !==
					knownPartialNames[homeNorm].toLowerCase()
			) {
				console.log(
					`[BBCParser-CLEANUP] Completing home team: "${fixture.homeTeam}" → "${knownPartialNames[homeNorm]}"`
				);
				fixture.homeTeam = knownPartialNames[homeNorm];
			}

			// Check if away team matches a known partial name
			if (
				knownPartialNames[awayNorm] &&
				fixture.awayTeam.toLowerCase() !==
					knownPartialNames[awayNorm].toLowerCase()
			) {
				console.log(
					`[BBCParser-CLEANUP] Completing away team: "${fixture.awayTeam}" → "${knownPartialNames[awayNorm]}"`
				);
				fixture.awayTeam = knownPartialNames[awayNorm];
			}
		});

		// Detect second leg fixtures (same teams playing within 14 days, reverse home/away)
		// FIX: Ensure aggregate scores are calculated for future second leg fixtures
		dedupedFixtures.forEach((fixture, idx) => {
			const teamA = normalizeTeamForDedup(fixture.homeTeam);
			const teamB = normalizeTeamForDedup(fixture.awayTeam);
			const fixtureDate = new Date(fixture.date);

			// Look for matching fixture with reversed teams within 14 days
			for (let j = 0; j < dedupedFixtures.length; j++) {
				if (j === idx) continue;
				const other = dedupedFixtures[j];
				const otherTeamA = normalizeTeamForDedup(other.homeTeam);
				const otherTeamB = normalizeTeamForDedup(other.awayTeam);

				// Check if teams are reversed (home becomes away, away becomes home)
				if (teamA === otherTeamB && teamB === otherTeamA) {
					const otherDate = new Date(other.date);
					const daysDiff = Math.abs(
						(fixtureDate - otherDate) / (1000 * 60 * 60 * 24)
					);

					// If within 14 days, it's a two-legged tie
					if (daysDiff > 0 && daysDiff <= 14) {
						// The later fixture is the second leg
						if (fixtureDate > otherDate) {
							fixture.isSecondLeg = true;
							fixture.firstLegFixture = other;

							// FIX: Calculate aggregate score from first leg for display purposes
							// IMPORTANT: Only set aggregateScore field, NOT homeScore/awayScore
							// Setting homeScore/awayScore would incorrectly categorize upcoming fixtures as finished
							if (
								!fixture.aggregateScore &&
								other.homeScore !== undefined &&
								other.awayScore !== undefined
							) {
								// Calculate aggregate from first leg (teams are reversed)
								fixture.aggregateScore = `${other.awayScore}-${other.homeScore}`;
							}

							// Ensure second leg upcoming fixtures don't have scores that would categorize them as finished
							// Only keep scores if the second leg has actually started (has status)
							const secondLegStatus = (fixture.status || "").toUpperCase();
							const hasStarted =
								secondLegStatus === "FT" ||
								secondLegStatus === "PEN" ||
								secondLegStatus === "AET" ||
								secondLegStatus === "LIVE" ||
								fixture.live ||
								/\d+'|HT/i.test(secondLegStatus);

							if (
								!hasStarted &&
								fixture.homeScore !== undefined &&
								fixture.awayScore !== undefined
							) {
								// This is an upcoming second leg with scores (likely aggregate being misapplied)
								// Clear the scores to prevent incorrect categorization
								console.log(
									`[BBCParser] Clearing premature scores from upcoming 2nd leg: ${fixture.homeTeam} vs ${fixture.awayTeam} (${fixture.date})`
								);
								delete fixture.homeScore;
								delete fixture.awayScore;
								fixture.score = "vs";
							}
						} else {
							other.isSecondLeg = true;
							other.firstLegFixture = fixture;

							if (
								!other.aggregateScore &&
								fixture.homeScore !== undefined &&
								fixture.awayScore !== undefined
							) {
								other.aggregateScore = `${fixture.awayScore}-${fixture.homeScore}`;
							}

							// Same check for the other fixture
							const otherStatus = (other.status || "").toUpperCase();
							const otherHasStarted =
								otherStatus === "FT" ||
								otherStatus === "PEN" ||
								otherStatus === "AET" ||
								otherStatus === "LIVE" ||
								other.live ||
								/\d+'|HT/i.test(otherStatus);

							if (
								!otherHasStarted &&
								other.homeScore !== undefined &&
								other.awayScore !== undefined
							) {
								console.log(
									`[BBCParser] Clearing premature scores from upcoming 2nd leg: ${other.homeTeam} vs ${other.awayTeam} (${other.date})`
								);
								delete other.homeScore;
								delete other.awayScore;
								other.score = "vs";
							}
						}
					}
				}
			}
		});

		const today = this.getCurrentDateString();

		dedupedFixtures.forEach((f) => {
			const inferred = this._inferUEFAStage(f);
			if (inferred) f.stage = inferred;
		});

		// Staged Classification (Task: UEFA 3-stage display)
		// FIX: Categorize by match status, NOT by score presence
		// Issue: Second leg fixtures have aggregate scores assigned, causing them to appear in Results prematurely

		// Stage 1: Finished matches only (not live)
		// A match is finished if it has status "FT", "PEN", or "AET"
		// DO NOT include matches just because they have scores - scores might be aggregate scores from first leg
		const stage1 = dedupedFixtures.filter((f) => {
			const status = (f.status || "").toUpperCase();
			return status === "FT" || status === "PEN" || status === "AET";
		});

		// Stage 1b: Live matches (currently in progress)
		// Detected by live flag OR status containing minute markers (e.g., "45'", "HT")
		const stageLive = dedupedFixtures.filter((f) => {
			if (f.live === true) return true;
			const status = (f.status || "").toUpperCase();
			return /\d+'|HT|LIVE/i.test(status);
		});

		// Stage 2: Today's Fixtures (scheduled for today but not yet started and not finished)
		// Only include upcoming matches (no status or status is a time like "17:45")
		const stage2 = dedupedFixtures.filter((f) => {
			if (f.date !== today) return false;
			if (stage1.includes(f) || stageLive.includes(f)) return false;
			// A match is upcoming if it has no status or status doesn't indicate finished/live
			const status = (f.status || "").toUpperCase();
			const isFinishedOrLive =
				status === "FT" ||
				status === "PEN" ||
				status === "AET" ||
				status === "LIVE" ||
				f.live ||
				/\d+'|HT/i.test(status);
			return !isFinishedOrLive;
		});

		// Stage 3: Future Fixtures (scheduled for future dates and not yet started)
		// Only include matches that are truly in the future and not finished/live
		const stage3 = dedupedFixtures.filter((f) => {
			if (f.date <= today) return false;
			if (stage1.includes(f) || stageLive.includes(f)) return false;
			// Future matches should never have FT/LIVE status (if they do, it's a data error)
			const status = (f.status || "").toUpperCase();
			const isFinishedOrLive =
				status === "FT" ||
				status === "PEN" ||
				status === "AET" ||
				status === "LIVE" ||
				f.live ||
				/\d+'|HT/i.test(status);
			return !isFinishedOrLive;
		});

		// Combine finished and live matches for the results section
		// Live matches appear at the top of results with bright styling
		const combinedResults = [...stageLive, ...stage1];

		// Sort each stage chronologically
		const sortByTime = (a, b) => (a.timestamp || 0) - (b.timestamp || 0);
		combinedResults.sort(sortByTime);
		stage2.sort(sortByTime);
		stage3.sort(sortByTime);

		const data = {
			...baseData,
			fixtures: dedupedFixtures,
			uefaStages: {
				results: combinedResults,
				today: stage2,
				future: stage3
			},
			knockouts: {
				playoff: dedupedFixtures.filter(
					(f) => f.stage && f.stage.toLowerCase() === "playoff"
				),
				rd16: dedupedFixtures.filter(
					(f) => f.stage && f.stage.toLowerCase() === "rd16"
				),
				qf: dedupedFixtures.filter(
					(f) => f.stage && f.stage.toLowerCase() === "qf"
				),
				sf: dedupedFixtures.filter(
					(f) => f.stage && f.stage.toLowerCase() === "sf"
				),
				final: dedupedFixtures.filter(
					(f) => f.stage && f.stage.toLowerCase() === "final"
				)
			}
		};

		return data;
	}

	/**
	 * Normalize team names to handle BBC Sport's truncated/abbreviated names
	 * Expands shortened names to full canonical names for proper logo matching
	 * @param {string} teamName - Raw team name from BBC Sport HTML
	 * @returns {string} - Normalized team name
	 */
	normalizeTeamName(teamName) {
		if (!teamName || typeof teamName !== "string") return teamName;

		// Exact match replacements for truncated names (case-insensitive)
		const replacements = {
			// UEFA Competition truncations
			"atletico": "Atletico Madrid",
			"nottm forrest": "Nottingham Forest",
			"nottm forest": "Nottingham Forest",
			// Scottish Premiership special cases
			"heart of midlothian": "Hearts",
			"st mirren": "St. Mirren",
			// English Premier League special cases
			"afc bournemouth": "Bournemouth",
			// European clubs special cases
			"paris saint germain": "Paris Sg",
			"paris st germain": "Paris Sg",
			"paris fc": "Paris Fc",
			"leipzig": "Rb Leipzig",
			"rb leipzig": "Rb Leipzig",
			"oviedo": "Real Oviedo"
		};

		const lowerName = teamName.toLowerCase().trim();
		
		// Check for exact match in replacements
		if (replacements[lowerName]) {
			if (this.config.debug) {
				console.log(
					`[BBCParser-NORMALIZE] Expanding truncated name: "${teamName}" → "${replacements[lowerName]}"`
				);
			}
			return replacements[lowerName];
		}

		// Return original name if no normalization needed
		return teamName;
	}

	_inferUEFAStage(fixture) {
		const stage = fixture.stage || "";
		if (fixture.date) {
			const parts = fixture.date.split("-");
			if (parts.length >= 2) {
				const month = parts[1];
				// UEFA Knockout round play-offs (UCL/UEL/UECL) are in February
				if (month === "02") return "Playoff";
				// UEFA Round of 16 starts in March
				if (month === "03") return "Rd16";
				// QF in April
				if (month === "04") return "QF";
				// SF and Final in May/June
				if (month === "05") return "SF";
				if (month === "06") return "Final";
			}
		}

		if (
			stage === "Rd32" ||
			/Round of 32|Rd32|Play-off|Playoff|Knockout round|KNOCKOUT ROUND PLAY-OFFS/i.test(
				stage
			)
		)
			return "Playoff";
		if (/Round of 16|Rd16/i.test(stage)) return "Rd16";
		if (/Quarter|QF/i.test(stage)) return "QF";
		if (/Semi|SF/i.test(stage)) return "SF";
		if (/Final/i.test(stage)) return "Final";

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
