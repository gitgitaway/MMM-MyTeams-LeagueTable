const BBCParser = require("./BBCParser");

/**
 * FIFA Parser class for MMM-MyTeams-LeagueTable
 * Specifically handles World Cup 2026 data
 * Extends BBCParser as it uses BBC Sport structure for scraping
 */
class FIFAParser extends BBCParser {
	/**
	 * Enhanced stage inference for World Cup 2026 including date-based fallback
	 * @param {string} text - The header or fixture text
	 * @returns {string|undefined} - The inferred stage
	 */
	_inferStageFromBlock(text) {
		const stage = super._inferStageFromBlock(text);
		if (stage) return stage;

		if (!text) return undefined;
		const t = text.toUpperCase();

		// Date-based inference for World Cup 2026 Knockouts
		// Based on user feedback:
		// Rd32: 28/29 June to 3 July
		// Rd16: 4 July to 7 July
		// QF: 9 July to 11 July
		// SF: 14 July to 15 July
		// TP: 18 July
		// Final: 19 July

		// Try to extract date like "29 JUNE" or "JULY 4"
		const dateMatch = t.match(/(\d{1,2})\s+(JUNE|JULY)|(JUNE|JULY)\s+(\d{1,2})/);
		if (dateMatch) {
			const day = parseInt(dateMatch[1] || dateMatch[4]);
			const month = (dateMatch[2] || dateMatch[3]).toUpperCase();

			if (month === "JUNE") {
				if (day >= 28) return "Rd32";
			} else if (month === "JULY") {
				if (day <= 3) return "Rd32";
				if (day >= 4 && day <= 7) return "Rd16";
				if (day >= 9 && day <= 11) return "QF";
				if (day >= 14 && day <= 15) return "SF";
				if (day === 18) return "TP";
				if (day === 19) return "Final";
			}
		}

		return undefined;
	}

	/**
	 * Parse BBC World Cup tables page into groups A-L
	 * @param {string} html - HTML to parse
	 * @returns {object} - Groups data
	 */
	parseFIFAWorldCupTablesBBC(html) {
		const result = {};
		try {
			// For each Group header, capture its table until next group header
			const groupSectionRegex =
				/<h2[^>]*>\s*Group\s*([A-L])\s*<\/h2>([\s\S]*?)(?=(<h2[^>]*>\s*Group\s*[A-L]\s*<\/h2>|$))/gi;
			let m;
			while ((m = groupSectionRegex.exec(html)) !== null) {
				const letter = m[1];
				const section = m[2];
				const tableMatch = section.match(/<table[\s\S]*?<\/table>/i);
				if (!tableMatch) continue;
				const tableHtml = tableMatch[0];
				const rows = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
				const teams = [];
				for (let i = 1; i < rows.length; i++) {
					const row = rows[i];
					const team = this._parseBBCTableTeamRow(row, i);
					if (team) teams.push(team);
				}
				// assign positions if not present
				teams.forEach((t, idx) => {
					if (!Number.isFinite(t.position) || t.position <= 0)
						t.position = idx + 1;
				});
				result[letter] = teams;
			}
		} catch (error) {
			console.error(
				" MMM-MyTeams-LeagueTable: Error parsing BBC WC tables:",
				error.message
			);
		}
		return result;
	}

	/**
	 * Parse World Cup data from HTML
	 * @param {string} standingsHtml - HTML containing standings
	 * @param {string} fixturesHtml - HTML containing fixtures
	 * @returns {object} - Parsed World Cup data
	 */
	parseFIFAWorldCupData(standingsHtml, fixturesHtml = "") {
		const data = {
			groups: {},
			fixtures: [],
			knockouts: {
				rd32: [],
				rd16: [],
				qf: [],
				sf: [],
				tp: [],
				final: []
			},
			lastUpdated: new Date().toISOString(),
			source: "BBC Sport"
		};

		try {
			if (fixturesHtml) {
				const fixturesMap = this._parseBBCFixtureArticles(fixturesHtml);
				const allFixtures = Array.from(fixturesMap.values());
				data.fixtures = allFixtures;

				// Categorize into knockouts - ensure each stage is filtered correctly
				data.knockouts.rd32 = allFixtures.filter((f) => f.stage === "Rd32");
				data.knockouts.rd16 = allFixtures.filter((f) => f.stage === "Rd16");
				data.knockouts.qf = allFixtures.filter((f) => f.stage === "QF");
				data.knockouts.sf = allFixtures.filter((f) => f.stage === "SF");
				data.knockouts.tp = allFixtures.filter((f) => f.stage === "TP");
				data.knockouts.final = allFixtures.filter((f) => f.stage === "Final");
			}
		} catch (error) {
			console.error(
				" MMM-MyTeams-LeagueTable: Error parsing FIFA WC data:",
				error.message
			);
		}
		return data;
	}

	/**
	 * Resolve placeholders (1A, 2B, W73, etc.) for World Cup brackets
	 * @param {object} data - World Cup data
	 * @returns {object} - Data with resolved placeholders
	 */
	resolveWCPlaceholders(data) {
		if (!data || !data.fixtures || !data.groups) return data;

		const fixtures = data.fixtures;
		const groups = data.groups;

		const getWinner = (matchNo) => {
			const match = fixtures.find((f) => f.matchNo === matchNo);
			if (!match || match.score === "vs" || !match.score.includes("-"))
				return null;

			const scoreClean = match.score.replace(/"/g, "").replace(/\s+/g, "");
			const scores = scoreClean.split("-").map((s) => {
				const baseScore = s.split("(")[0];
				return parseInt(baseScore);
			});

			if (isNaN(scores[0]) || isNaN(scores[1])) return null;
			if (scores[0] > scores[1]) return match.homeTeam;
			if (scores[1] > scores[0]) return match.awayTeam;

			const penMatch = match.score.match(/\((\d+)-(\d+)\)/);
			if (penMatch) {
				const penScores = [parseInt(penMatch[1]), parseInt(penMatch[2])];
				if (penScores[0] > penScores[1]) return match.homeTeam;
				if (penScores[1] > penScores[0]) return match.awayTeam;
			}
			return null;
		};

		const getLoser = (matchNo) => {
			const match = fixtures.find((f) => f.matchNo === matchNo);
			if (!match || match.score === "vs" || !match.score.includes("-"))
				return null;
			const winner = getWinner(matchNo);
			if (!winner) return null;
			return winner === match.homeTeam ? match.awayTeam : match.homeTeam;
		};

		const getGroupTeam = (groupLetter, position) => {
			const group = groups[groupLetter];
			if (!group) return null;
			const team = group.find((t) => t.position === position);
			return team ? team.name : null;
		};

		const resolveThirdPlaceSlots = () => {
			const thirdPlaceTeams = [];
			Object.keys(groups).forEach((letter) => {
				const third = groups[letter].find((t) => t.position === 3);
				if (third) {
					third.group = letter;
					thirdPlaceTeams.push(third);
				}
			});

			thirdPlaceTeams.sort((a, b) => {
				if (b.points !== a.points) return b.points - a.points;
				if (b.goalDifference !== a.goalDifference)
					return b.goalDifference - a.goalDifference;
				return b.goalsFor - a.goalsFor;
			});

			if (thirdPlaceTeams.length < 8) return {};

			const bestEight = thirdPlaceTeams.slice(0, 8);
			const sortedByGroup = [...bestEight].sort((a, b) =>
				a.group.localeCompare(b.group)
			);

			return {
				74: sortedByGroup[0].name,
				77: sortedByGroup[1].name,
				79: sortedByGroup[2].name,
				80: sortedByGroup[3].name,
				81: sortedByGroup[4].name,
				82: sortedByGroup[5].name,
				85: sortedByGroup[6].name,
				87: sortedByGroup[7].name
			};
		};

		const thirdPlaceAllocations = resolveThirdPlaceSlots();

		fixtures.forEach((fixture) => {
			if (fixture.homeTeam === "3rd Place" || fixture.homeTeam === "3rd") {
				if (thirdPlaceAllocations[fixture.matchNo])
					fixture.homeTeam = thirdPlaceAllocations[fixture.matchNo];
			}
			if (fixture.awayTeam === "3rd Place" || fixture.awayTeam === "3rd") {
				if (thirdPlaceAllocations[fixture.matchNo])
					fixture.awayTeam = thirdPlaceAllocations[fixture.matchNo];
			}

			if (typeof fixture.homeTeam === "string") {
				if (fixture.homeTeam.match(/^[12][A-L]$/)) {
					const teamName = getGroupTeam(
						fixture.homeTeam[1],
						parseInt(fixture.homeTeam[0])
					);
					if (teamName) fixture.homeTeam = teamName;
				} else if (
					fixture.homeTeam.startsWith("W") &&
					!isNaN(fixture.homeTeam.substring(1))
				) {
					const teamName = getWinner(parseInt(fixture.homeTeam.substring(1)));
					if (teamName) fixture.homeTeam = teamName;
				} else if (
					fixture.homeTeam.startsWith("L") &&
					!isNaN(fixture.homeTeam.substring(1))
				) {
					const teamName = getLoser(parseInt(fixture.homeTeam.substring(1)));
					if (teamName) fixture.homeTeam = teamName;
				}
			}

			if (typeof fixture.awayTeam === "string") {
				if (fixture.awayTeam.match(/^[12][A-L]$/)) {
					const teamName = getGroupTeam(
						fixture.awayTeam[1],
						parseInt(fixture.awayTeam[0])
					);
					if (teamName) fixture.awayTeam = teamName;
				} else if (
					fixture.awayTeam.startsWith("W") &&
					!isNaN(fixture.awayTeam.substring(1))
				) {
					const teamName = getWinner(parseInt(fixture.awayTeam.substring(1)));
					if (teamName) fixture.awayTeam = teamName;
				} else if (
					fixture.awayTeam.startsWith("L") &&
					!isNaN(fixture.awayTeam.substring(1))
				) {
					const teamName = getLoser(parseInt(fixture.awayTeam.substring(1)));
					if (teamName) fixture.awayTeam = teamName;
				}
			}
		});

		Object.keys(data.knockouts).forEach((stage) => {
			const stageLabel =
				stage === "rd32"
					? "Rd32"
					: stage === "rd16"
					? "Rd16"
					: stage === "qf"
					? "QF"
					: stage === "sf"
					? "SF"
					: stage === "tp"
					? "TP"
					: "Final";
			data.knockouts[stage] = fixtures.filter((f) => f.stage === stageLabel);
		});

		return data;
	}

	/**
	 * Generate mock World Cup 2026 data
	 * @returns {object} - Mock data
	 */
	generateMockWC2026Data() {
		const groups = {};
		const groupLetters = [
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
			"G",
			"H",
			"I",
			"J",
			"K",
			"L"
		];
		const teams = [
			["Mexico", "South Africa", "South Korea", "Czech Republic"],
			["Canada", "Bosnia-Herzegovina", "Qatar", "Switzerland"],
			["Brazil", "Morocco", "Haiti", "Scotland"],
			["United States", "Paraguay", "Australia", "Turkey"],
			["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
			["Netherlands", "Japan", "Sweden", "Tunisia"],
			["Belgium", "Egypt", "Iran", "New Zealand"],
			["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
			["France", "Senegal", "Iraq", "Norway"],
			["Argentina", "Algeria", "Austria", "Jordan"],
			["Portugal", "Congo DR", "Uzbekistan", "Colombia"],
			["England", "Croatia", "Ghana", "Panama"]
		];

		groupLetters.forEach((letter, idx) => {
			const groupTeams = teams[idx];
			groups[letter] = groupTeams.map((name, i) => ({
				position: i + 1,
				name: name,
				played: 0,
				won: 0,
				drawn: 0,
				lost: 0,
				goalsFor: 0,
				goalsAgainst: 0,
				goalDifference: 0,
				points: 0,
				form: []
			}));
		});

		const fixtures = [
			// GROUP A
			{
				stage: "GS",
				group: "A",
				matchNo: 1,
				date: "11/06/2026",
				time: "20:00",
				homeTeam: "Mexico",
				awayTeam: "South Africa",
				venue: "Mexico City"
			},
			{
				stage: "GS",
				group: "A",
				matchNo: 2,
				date: "12/06/2026",
				time: "03:00",
				homeTeam: "South Korea",
				awayTeam: "Czech Republic",
				venue: "Guadalajara"
			},
			{
				stage: "GS",
				group: "A",
				matchNo: 25,
				date: "18/06/2026",
				time: "17:00",
				homeTeam: "Czech Republic",
				awayTeam: "South Africa",
				venue: "Atlanta"
			},
			{
				stage: "GS",
				group: "A",
				matchNo: 28,
				date: "19/06/2026",
				time: "02:00",
				homeTeam: "Mexico",
				awayTeam: "South Korea",
				venue: "Guadalajara"
			},
			{
				stage: "GS",
				group: "A",
				matchNo: 53,
				date: "25/06/2026",
				time: "02:00",
				homeTeam: "Czech Republic",
				awayTeam: "Mexico",
				venue: "Mexico City"
			},
			{
				stage: "GS",
				group: "A",
				matchNo: 54,
				date: "25/06/2026",
				time: "02:00",
				homeTeam: "South Africa",
				awayTeam: "South Korea",
				venue: "Monterrey"
			},

			// GROUP B
			{
				stage: "GS",
				group: "B",
				matchNo: 3,
				date: "12/06/2026",
				time: "20:00",
				homeTeam: "Canada",
				awayTeam: "Bosnia-Herzegovina",
				venue: "Toronto"
			},
			{
				stage: "GS",
				group: "B",
				matchNo: 8,
				date: "13/06/2026",
				time: "20:00",
				homeTeam: "Qatar",
				awayTeam: "Switzerland",
				venue: "San Francisco"
			},
			{
				stage: "GS",
				group: "B",
				matchNo: 26,
				date: "18/06/2026",
				time: "20:00",
				homeTeam: "Switzerland",
				awayTeam: "Bosnia-Herzegovina",
				venue: "Los Angeles"
			},
			{
				stage: "GS",
				group: "B",
				matchNo: 27,
				date: "18/06/2026",
				time: "23:00",
				homeTeam: "Canada",
				awayTeam: "Qatar",
				venue: "Vancouver"
			},
			{
				stage: "GS",
				group: "B",
				matchNo: 51,
				date: "24/06/2026",
				time: "20:00",
				homeTeam: "Bosnia-Herzegovina",
				awayTeam: "Qatar",
				venue: "Vancouver"
			},
			{
				stage: "GS",
				group: "B",
				matchNo: 52,
				date: "24/06/2026",
				time: "20:00",
				homeTeam: "Switzerland",
				awayTeam: "Canada",
				venue: "Seattle"
			},

			// GROUP C
			{
				stage: "GS",
				group: "C",
				matchNo: 7,
				date: "13/06/2026",
				time: "23:00",
				homeTeam: "Brazil",
				awayTeam: "Morocco",
				venue: "New York/New Jersey"
			},
			{
				stage: "GS",
				group: "C",
				matchNo: 5,
				date: "14/06/2026",
				time: "02:00",
				homeTeam: "Haiti",
				awayTeam: "Scotland",
				venue: "Boston"
			},
			{
				stage: "GS",
				group: "C",
				matchNo: 30,
				date: "19/06/2026",
				time: "23:00",
				homeTeam: "Scotland",
				awayTeam: "Morocco",
				venue: "Boston"
			},
			{
				stage: "GS",
				group: "C",
				matchNo: 29,
				date: "20/06/2026",
				time: "01:30",
				homeTeam: "Brazil",
				awayTeam: "Haiti",
				venue: "Philadelphia"
			},
			{
				stage: "GS",
				group: "C",
				matchNo: 49,
				date: "24/06/2026",
				time: "23:00",
				homeTeam: "Morocco",
				awayTeam: "Haiti",
				venue: "Atlanta"
			},
			{
				stage: "GS",
				group: "C",
				matchNo: 50,
				date: "24/06/2026",
				time: "23:00",
				homeTeam: "Scotland",
				awayTeam: "Brazil",
				venue: "Miami"
			},

			// GROUP D
			{
				stage: "GS",
				group: "D",
				matchNo: 4,
				date: "13/06/2026",
				time: "02:00",
				homeTeam: "United States",
				awayTeam: "Paraguay",
				venue: "Los Angeles"
			},
			{
				stage: "GS",
				group: "D",
				matchNo: 6,
				date: "14/06/2026",
				time: "05:00",
				homeTeam: "Australia",
				awayTeam: "Turkey",
				venue: "Vancouver"
			},
			{
				stage: "GS",
				group: "D",
				matchNo: 32,
				date: "19/06/2026",
				time: "20:00",
				homeTeam: "United States",
				awayTeam: "Australia",
				venue: "Seattle"
			},
			{
				stage: "GS",
				group: "D",
				matchNo: 31,
				date: "20/06/2026",
				time: "04:00",
				homeTeam: "Turkey",
				awayTeam: "Paraguay",
				venue: "San Francisco"
			},
			{
				stage: "GS",
				group: "D",
				matchNo: 55,
				date: "26/06/2026",
				time: "03:00",
				homeTeam: "Paraguay",
				awayTeam: "Australia",
				venue: "Kansas City"
			},
			{
				stage: "GS",
				group: "D",
				matchNo: 56,
				date: "26/06/2026",
				time: "03:00",
				homeTeam: "Turkey",
				awayTeam: "United States",
				venue: "Dallas"
			},

			// GROUP E
			{
				stage: "GS",
				group: "E",
				matchNo: 10,
				date: "14/06/2026",
				time: "18:00",
				homeTeam: "Germany",
				awayTeam: "Curaçao",
				venue: "Houston"
			},
			{
				stage: "GS",
				group: "E",
				matchNo: 9,
				date: "15/06/2026",
				time: "00:00",
				homeTeam: "Ivory Coast",
				awayTeam: "Ecuador",
				venue: "Philadelphia"
			},
			{
				stage: "GS",
				group: "E",
				matchNo: 33,
				date: "20/06/2026",
				time: "21:00",
				homeTeam: "Germany",
				awayTeam: "Ivory Coast",
				venue: "Toronto"
			},
			{
				stage: "GS",
				group: "E",
				matchNo: 34,
				date: "21/06/2026",
				time: "01:00",
				homeTeam: "Ecuador",
				awayTeam: "Curaçao",
				venue: "Kansas City"
			},
			{
				stage: "GS",
				group: "E",
				matchNo: 57,
				date: "25/06/2026",
				time: "21:00",
				homeTeam: "Curaçao",
				awayTeam: "Ivory Coast",
				venue: "Philadelphia"
			},
			{
				stage: "GS",
				group: "E",
				matchNo: 58,
				date: "25/06/2026",
				time: "21:00",
				homeTeam: "Ecuador",
				awayTeam: "Germany",
				venue: "New York/New Jersey"
			},

			// GROUP F
			{
				stage: "GS",
				group: "F",
				matchNo: 11,
				date: "14/06/2026",
				time: "21:00",
				homeTeam: "Netherlands",
				awayTeam: "Japan",
				venue: "Dallas"
			},
			{
				stage: "GS",
				group: "F",
				matchNo: 12,
				date: "15/06/2026",
				time: "03:00",
				homeTeam: "Sweden",
				awayTeam: "Tunisia",
				venue: "Monterrey"
			},
			{
				stage: "GS",
				group: "F",
				matchNo: 35,
				date: "20/06/2026",
				time: "18:00",
				homeTeam: "Netherlands",
				awayTeam: "Sweden",
				venue: "Houston"
			},
			{
				stage: "GS",
				group: "F",
				matchNo: 36,
				date: "21/06/2026",
				time: "05:00",
				homeTeam: "Tunisia",
				awayTeam: "Japan",
				venue: "Monterrey"
			},
			{
				stage: "GS",
				group: "F",
				matchNo: 59,
				date: "26/06/2026",
				time: "00:00",
				homeTeam: "Japan",
				awayTeam: "Sweden",
				venue: "Dallas"
			},
			{
				stage: "GS",
				group: "F",
				matchNo: 60,
				date: "26/06/2026",
				time: "00:00",
				homeTeam: "Tunisia",
				awayTeam: "Netherlands",
				venue: "Kansas City"
			},

			// GROUP G
			{
				stage: "GS",
				group: "G",
				matchNo: 16,
				date: "15/06/2026",
				time: "20:00",
				homeTeam: "Belgium",
				awayTeam: "Egypt",
				venue: "Seattle"
			},
			{
				stage: "GS",
				group: "G",
				matchNo: 15,
				date: "16/06/2026",
				time: "02:00",
				homeTeam: "Iran",
				awayTeam: "New Zealand",
				venue: "Los Angeles"
			},
			{
				stage: "GS",
				group: "G",
				matchNo: 39,
				date: "21/06/2026",
				time: "20:00",
				homeTeam: "Belgium",
				awayTeam: "Iran",
				venue: "Los Angeles"
			},
			{
				stage: "GS",
				group: "G",
				matchNo: 40,
				date: "22/06/2026",
				time: "02:00",
				homeTeam: "New Zealand",
				awayTeam: "Egypt",
				venue: "Vancouver"
			},
			{
				stage: "GS",
				group: "G",
				matchNo: 63,
				date: "27/06/2026",
				time: "04:00",
				homeTeam: "Egypt",
				awayTeam: "Iran",
				venue: "Seattle"
			},
			{
				stage: "GS",
				group: "G",
				matchNo: 64,
				date: "27/06/2026",
				time: "04:00",
				homeTeam: "New Zealand",
				awayTeam: "Belgium",
				venue: "Vancouver"
			},

			// GROUP H
			{
				stage: "GS",
				group: "H",
				matchNo: 14,
				date: "15/06/2026",
				time: "17:00",
				homeTeam: "Spain",
				awayTeam: "Cape Verde",
				venue: "Atlanta"
			},
			{
				stage: "GS",
				group: "H",
				matchNo: 13,
				date: "15/06/2026",
				time: "23:00",
				homeTeam: "Saudi Arabia",
				awayTeam: "Uruguay",
				venue: "Miami"
			},
			{
				stage: "GS",
				group: "H",
				matchNo: 38,
				date: "21/06/2026",
				time: "17:00",
				homeTeam: "Spain",
				awayTeam: "Saudi Arabia",
				venue: "Atlanta"
			},
			{
				stage: "GS",
				group: "H",
				matchNo: 37,
				date: "21/06/2026",
				time: "23:00",
				homeTeam: "Uruguay",
				awayTeam: "Cape Verde",
				venue: "Miami"
			},
			{
				stage: "GS",
				group: "H",
				matchNo: 61,
				date: "27/06/2026",
				time: "01:00",
				homeTeam: "Cape Verde",
				awayTeam: "Saudi Arabia",
				venue: "Houston"
			},
			{
				stage: "GS",
				group: "H",
				matchNo: 62,
				date: "27/06/2026",
				time: "01:00",
				homeTeam: "Uruguay",
				awayTeam: "Spain",
				venue: "Guadalajara"
			},

			// GROUP I
			{
				stage: "GS",
				group: "I",
				matchNo: 17,
				date: "16/06/2026",
				time: "20:00",
				homeTeam: "France",
				awayTeam: "Senegal",
				venue: "New York/New Jersey"
			},
			{
				stage: "GS",
				group: "I",
				matchNo: 18,
				date: "16/06/2026",
				time: "23:00",
				homeTeam: "Iraq",
				awayTeam: "Norway",
				venue: "Boston"
			},
			{
				stage: "GS",
				group: "I",
				matchNo: 42,
				date: "22/06/2026",
				time: "22:00",
				homeTeam: "France",
				awayTeam: "Iraq",
				venue: "Dallas"
			},
			{
				stage: "GS",
				group: "I",
				matchNo: 41,
				date: "23/06/2026",
				time: "01:00",
				homeTeam: "Norway",
				awayTeam: "Senegal",
				venue: "New York/New Jersey"
			},
			{
				stage: "GS",
				group: "I",
				matchNo: 65,
				date: "26/06/2026",
				time: "20:00",
				homeTeam: "Norway",
				awayTeam: "France",
				venue: "Boston"
			},
			{
				stage: "GS",
				group: "I",
				matchNo: 66,
				date: "26/06/2026",
				time: "20:00",
				homeTeam: "Senegal",
				awayTeam: "Iraq",
				venue: "Toronto"
			},

			// GROUP J
			{
				stage: "GS",
				group: "J",
				matchNo: 19,
				date: "17/06/2026",
				time: "02:00",
				homeTeam: "Argentina",
				awayTeam: "Algeria",
				venue: "Kansas City"
			},
			{
				stage: "GS",
				group: "J",
				matchNo: 20,
				date: "17/06/2026",
				time: "05:00",
				homeTeam: "Austria",
				awayTeam: "Jordan",
				venue: "San Francisco"
			},
			{
				stage: "GS",
				group: "J",
				matchNo: 43,
				date: "22/06/2026",
				time: "18:00",
				homeTeam: "Argentina",
				awayTeam: "Austria",
				venue: "Dallas"
			},
			{
				stage: "GS",
				group: "J",
				matchNo: 44,
				date: "23/06/2026",
				time: "04:00",
				homeTeam: "Jordan",
				awayTeam: "Algeria",
				venue: "San Francisco"
			},
			{
				stage: "GS",
				group: "J",
				matchNo: 67,
				date: "28/06/2026",
				time: "03:00",
				homeTeam: "Algeria",
				awayTeam: "Austria",
				venue: "Kansas City"
			},
			{
				stage: "GS",
				group: "J",
				matchNo: 68,
				date: "28/06/2026",
				time: "03:00",
				homeTeam: "Jordan",
				awayTeam: "Argentina",
				venue: "Dallas"
			},

			// GROUP K
			{
				stage: "GS",
				group: "K",
				matchNo: 23,
				date: "17/06/2026",
				time: "18:00",
				homeTeam: "Portugal",
				awayTeam: "Congo DR",
				venue: "Houston"
			},
			{
				stage: "GS",
				group: "K",
				matchNo: 24,
				date: "18/06/2026",
				time: "03:00",
				homeTeam: "Uzbekistan",
				awayTeam: "Colombia",
				venue: "Mexico City"
			},
			{
				stage: "GS",
				group: "K",
				matchNo: 47,
				date: "23/06/2026",
				time: "18:00",
				homeTeam: "Portugal",
				awayTeam: "Uzbekistan",
				venue: "Houston"
			},
			{
				stage: "GS",
				group: "K",
				matchNo: 48,
				date: "24/06/2026",
				time: "03:00",
				homeTeam: "Colombia",
				awayTeam: "Congo DR",
				venue: "Guadalajara"
			},
			{
				stage: "GS",
				group: "K",
				matchNo: 71,
				date: "28/06/2026",
				time: "00:30",
				homeTeam: "Colombia",
				awayTeam: "Portugal",
				venue: "Miami"
			},
			{
				stage: "GS",
				group: "K",
				matchNo: 72,
				date: "28/06/2026",
				time: "00:30",
				homeTeam: "Congo DR",
				awayTeam: "Uzbekistan",
				venue: "Atlanta"
			},

			// GROUP L
			{
				stage: "GS",
				group: "L",
				matchNo: 22,
				date: "17/06/2026",
				time: "21:00",
				homeTeam: "England",
				awayTeam: "Croatia",
				venue: "Dallas"
			},
			{
				stage: "GS",
				group: "L",
				matchNo: 21,
				date: "18/06/2026",
				time: "00:00",
				homeTeam: "Ghana",
				awayTeam: "Panama",
				venue: "Toronto"
			},
			{
				stage: "GS",
				group: "L",
				matchNo: 45,
				date: "23/06/2026",
				time: "22:00",
				homeTeam: "England",
				awayTeam: "Ghana",
				venue: "Boston"
			},
			{
				stage: "GS",
				group: "L",
				matchNo: 46,
				date: "24/06/2026",
				time: "00:00",
				homeTeam: "Panama",
				awayTeam: "Croatia",
				venue: "Toronto"
			},
			{
				stage: "GS",
				group: "L",
				matchNo: 69,
				date: "27/06/2026",
				time: "22:00",
				homeTeam: "Croatia",
				awayTeam: "Ghana",
				venue: "Philadelphia"
			},
			{
				stage: "GS",
				group: "L",
				matchNo: 70,
				date: "27/06/2026",
				time: "22:00",
				homeTeam: "Panama",
				awayTeam: "England",
				venue: "New York/New Jersey"
			},

			// KNOCKOUTS (Placeholders)
			{
				stage: "Rd32",
				matchNo: 73,
				date: "28/06/2026",
				time: "21:00",
				homeTeam: "2A",
				awayTeam: "2B",
				venue: "Los Angeles"
			},
			{
				stage: "Rd32",
				matchNo: 74,
				date: "29/06/2026",
				time: "22:30",
				homeTeam: "1E",
				awayTeam: "3rd Place",
				venue: "Boston"
			},
			{
				stage: "Rd32",
				matchNo: 75,
				date: "30/06/2026",
				time: "03:00",
				homeTeam: "1F",
				awayTeam: "2C",
				venue: "Monterrey"
			},
			{
				stage: "Rd32",
				matchNo: 76,
				date: "29/06/2026",
				time: "19:00",
				homeTeam: "1C",
				awayTeam: "2F",
				venue: "Houston"
			},
			{
				stage: "Rd32",
				matchNo: 77,
				date: "30/06/2026",
				time: "23:00",
				homeTeam: "1I",
				awayTeam: "3rd Place",
				venue: "New York/New Jersey"
			},
			{
				stage: "Rd32",
				matchNo: 78,
				date: "30/06/2026",
				time: "19:00",
				homeTeam: "2E",
				awayTeam: "2I",
				venue: "Dallas"
			},
			{
				stage: "Rd32",
				matchNo: 79,
				date: "01/07/2026",
				time: "03:00",
				homeTeam: "1A",
				awayTeam: "3rd Place",
				venue: "Mexico City"
			},
			{
				stage: "Rd32",
				matchNo: 80,
				date: "01/07/2026",
				time: "18:00",
				homeTeam: "1L",
				awayTeam: "3rd Place",
				venue: "Atlanta"
			},
			{
				stage: "Rd32",
				matchNo: 81,
				date: "02/07/2026",
				time: "02:00",
				homeTeam: "1D",
				awayTeam: "3rd Place",
				venue: "San Francisco"
			},
			{
				stage: "Rd32",
				matchNo: 82,
				date: "01/07/2026",
				time: "22:00",
				homeTeam: "1G",
				awayTeam: "3rd Place",
				venue: "Seattle"
			},
			{
				stage: "Rd32",
				matchNo: 83,
				date: "03/07/2026",
				time: "01:00",
				homeTeam: "2K",
				awayTeam: "2L",
				venue: "Toronto"
			},
			{
				stage: "Rd32",
				matchNo: 84,
				date: "02/07/2026",
				time: "21:00",
				homeTeam: "1H",
				awayTeam: "2J",
				venue: "Los Angeles"
			},
			{
				stage: "Rd32",
				matchNo: 85,
				date: "03/07/2026",
				time: "05:00",
				homeTeam: "1B",
				awayTeam: "3rd Place",
				venue: "Vancouver"
			},
			{
				stage: "Rd32",
				matchNo: 86,
				date: "04/07/2026",
				time: "00:00",
				homeTeam: "1J",
				awayTeam: "2H",
				venue: "Miami"
			},
			{
				stage: "Rd32",
				matchNo: 87,
				date: "04/07/2026",
				time: "03:30",
				homeTeam: "1K",
				awayTeam: "3rd Place",
				venue: "Kansas City"
			},
			{
				stage: "Rd32",
				matchNo: 88,
				date: "03/07/2026",
				time: "20:00",
				homeTeam: "2D",
				awayTeam: "2G",
				venue: "Dallas"
			},

			{
				stage: "Rd16",
				matchNo: 89,
				date: "04/07/2026",
				time: "23:00",
				homeTeam: "W73",
				awayTeam: "W75",
				venue: "Philadelphia"
			},
			{
				stage: "Rd16",
				matchNo: 90,
				date: "04/07/2026",
				time: "19:00",
				homeTeam: "W74",
				awayTeam: "W77",
				venue: "Houston"
			},
			{
				stage: "Rd16",
				matchNo: 91,
				date: "05/07/2026",
				time: "22:00",
				homeTeam: "W76",
				awayTeam: "W78",
				venue: "New York/New Jersey"
			},
			{
				stage: "Rd16",
				matchNo: 92,
				date: "06/07/2026",
				time: "02:00",
				homeTeam: "W79",
				awayTeam: "W80",
				venue: "Mexico City"
			},
			{
				stage: "Rd16",
				matchNo: 93,
				date: "06/07/2026",
				time: "21:00",
				homeTeam: "W83",
				awayTeam: "W84",
				venue: "Dallas"
			},
			{
				stage: "Rd16",
				matchNo: 94,
				date: "07/07/2026",
				time: "02:00",
				homeTeam: "W81",
				awayTeam: "W82",
				venue: "Seattle"
			},
			{
				stage: "Rd16",
				matchNo: 95,
				date: "07/07/2026",
				time: "18:00",
				homeTeam: "W86",
				awayTeam: "W88",
				venue: "Atlanta"
			},
			{
				stage: "Rd16",
				matchNo: 96,
				date: "07/07/2026",
				time: "22:00",
				homeTeam: "W85",
				awayTeam: "W87",
				venue: "Vancouver"
			},

			{
				stage: "QF",
				matchNo: 97,
				date: "09/07/2026",
				time: "22:00",
				homeTeam: "W89",
				awayTeam: "W90",
				venue: "Boston"
			},
			{
				stage: "QF",
				matchNo: 98,
				date: "10/07/2026",
				time: "21:00",
				homeTeam: "W93",
				awayTeam: "W94",
				venue: "Los Angeles"
			},
			{
				stage: "QF",
				matchNo: 99,
				date: "11/07/2026",
				time: "23:00",
				homeTeam: "W91",
				awayTeam: "W92",
				venue: "Miami"
			},
			{
				stage: "QF",
				matchNo: 100,
				date: "12/07/2026",
				time: "03:00",
				homeTeam: "W95",
				awayTeam: "W96",
				venue: "Kansas City"
			},

			{
				stage: "SF",
				matchNo: 101,
				date: "14/07/2026",
				time: "21:00",
				homeTeam: "W97",
				awayTeam: "W98",
				venue: "Dallas"
			},
			{
				stage: "SF",
				matchNo: 102,
				date: "15/07/2026",
				time: "21:00",
				homeTeam: "W99",
				awayTeam: "W100",
				venue: "Atlanta"
			},

			{
				stage: "TP",
				matchNo: 103,
				date: "18/07/2026",
				time: "23:00",
				homeTeam: "L101",
				awayTeam: "L102",
				venue: "Miami"
			},
			{
				stage: "Final",
				matchNo: 104,
				date: "19/07/2026",
				time: "21:00",
				homeTeam: "W101",
				awayTeam: "W102",
				venue: "New York/New Jersey"
			}
		].map((f) => {
			const [d, m, y] = f.date.split("/");
			const dateObj = new Date(`${y}-${m}-${d}T${f.time}:00`);
			return { ...f, score: "vs", timestamp: dateObj.getTime() };
		});

		return {
			groups,
			fixtures,
			knockouts: {
				rd32: fixtures.filter((f) => f.stage === "Rd32"),
				rd16: fixtures.filter((f) => f.stage === "Rd16"),
				qf: fixtures.filter((f) => f.stage === "QF"),
				sf: fixtures.filter((f) => f.stage === "SF"),
				tp: fixtures.filter((f) => f.stage === "TP"),
				final: fixtures.filter((f) => f.stage === "Final")
			},
			lastUpdated: new Date().toISOString(),
			source: "BBC Sport",
			leagueType: "WORLD_CUP_2026"
		};
	}
}

module.exports = FIFAParser;
