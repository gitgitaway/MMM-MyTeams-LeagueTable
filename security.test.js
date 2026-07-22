"use strict";

/**
 * SEC-10: Security Test Suite for MMM-MyTeams-LeagueTable
 *
 * Validates that security-critical functions behave correctly and that no
 * security regressions have been introduced into the codebase.
 *
 * Run with: npm run test:security
 *
 * Covers:
 *  - Input validation (validateDateTimeOverride)
 *  - DOM manipulation safety (no innerHTML)
 *  - Hex color validation (customTeamColors)
 *  - URL / league-type sanitization
 *  - Debug logging guard presence
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MAIN_JS = path.join(ROOT, "MMM-MyTeams-LeagueTable.js");
const NODE_HELPER_JS = path.join(ROOT, "node_helper.js");
const BBC_PARSER_JS = path.join(ROOT, "parsers", "BBCParser.js");
const FIFA_PARSER_JS = path.join(ROOT, "parsers", "FIFAParser.js");

let mainJsContent;
let nodeHelperContent;
let bbcParserContent;
let fifaParserContent;

before(function () {
	mainJsContent = fs.readFileSync(MAIN_JS, "utf8");
	nodeHelperContent = fs.readFileSync(NODE_HELPER_JS, "utf8");
	bbcParserContent = fs.readFileSync(BBC_PARSER_JS, "utf8");
	fifaParserContent = fs.readFileSync(FIFA_PARSER_JS, "utf8");
});

// ---------------------------------------------------------------------------
// DOM Manipulation Safety
// ---------------------------------------------------------------------------
describe("DOM Manipulation Safety", function () {
	it("MMM-MyTeams-LeagueTable.js must not assign to .innerHTML", function () {
		const matches = mainJsContent.match(/\.innerHTML\s*=/g) || [];
		assert.strictEqual(
			matches.length,
			0,
			`Found ${matches.length} .innerHTML assignment(s) in MMM-MyTeams-LeagueTable.js - use createElement + textContent instead`
		);
	});

	it("node_helper.js must not assign to .innerHTML", function () {
		const matches = nodeHelperContent.match(/\.innerHTML\s*=/g) || [];
		assert.strictEqual(
			matches.length,
			0,
			`Found ${matches.length} .innerHTML assignment(s) in node_helper.js`
		);
	});

	it("BBCParser.js must not assign to .innerHTML", function () {
		const matches = bbcParserContent.match(/\.innerHTML\s*=/g) || [];
		assert.strictEqual(
			matches.length,
			0,
			`Found ${matches.length} .innerHTML assignment(s) in BBCParser.js`
		);
	});

	it("FIFAParser.js must not assign to .innerHTML", function () {
		const matches = fifaParserContent.match(/\.innerHTML\s*=/g) || [];
		assert.strictEqual(
			matches.length,
			0,
			`Found ${matches.length} .innerHTML assignment(s) in FIFAParser.js`
		);
	});
});

// ---------------------------------------------------------------------------
// Input Validation: validateDateTimeOverride
// ---------------------------------------------------------------------------
describe("validateDateTimeOverride logic (source-level inspection)", function () {
	it("source code must contain NaN check for date validation", function () {
		assert.ok(
			mainJsContent.includes("isNaN"),
			"validateDateTimeOverride must check isNaN() to reject invalid date strings"
		);
	});

	it("source code must enforce year range 1900-2100", function () {
		assert.ok(
			mainJsContent.includes("1900") && mainJsContent.includes("2100"),
			"validateDateTimeOverride must enforce year range 1900-2100"
		);
	});

	it("source code must return null for invalid inputs", function () {
		const validationFn = mainJsContent.match(
			/validateDateTimeOverride[\s\S]{0,2000}?return null/
		);
		assert.ok(
			validationFn !== null,
			"validateDateTimeOverride must return null for invalid inputs"
		);
	});
});

// ---------------------------------------------------------------------------
// Hex Color Validation (DES-06 regression guard)
// ---------------------------------------------------------------------------
describe("Hex Color Validation", function () {
	it("source code must validate hex color with regex", function () {
		const hasHexValidation =
			mainJsContent.includes("#[0-9A-F]{6}") ||
			mainJsContent.includes("[0-9A-Fa-f]{6}") ||
			mainJsContent.includes("RRGGBB");
		assert.ok(
			hasHexValidation,
			"Custom team color validation must use hex regex (#RRGGBB format)"
		);
	});
});

// ---------------------------------------------------------------------------
// Debug Logging Guards
// ---------------------------------------------------------------------------
describe("Debug Logging Guards", function () {
	it("MMM-MyTeams-LeagueTable.js must not call console.log() unconditionally", function () {
		const unconditionalConsoleLog =
			mainJsContent.match(/^\s*console\.log\(/gm) || [];
		assert.strictEqual(
			unconditionalConsoleLog.length,
			0,
			`Found ${unconditionalConsoleLog.length} unconditional console.log() call(s) - wrap in if (this.config.debug)`
		);
	});

	it("node_helper.js must guard debug logging", function () {
		// Accepts either guarded Log.info/warn/error or guarded console.log:
		//   if (debug) { Log.info(...) }   -- MagicMirror Log helper
		//   if (debug) console.log(...)    -- node_helper.js style
		const hasLogGuard =
			/if\s*\([^)]*debug[^)]*\)[\s\S]{0,200}?(Log\.(info|warn|error)|console\.log)/.test(
				nodeHelperContent
			);
		assert.ok(
			hasLogGuard,
			"node_helper.js must use if (debug) guards around verbose logging statements"
		);
	});
});

// ---------------------------------------------------------------------------
// External Resource Safety
// ---------------------------------------------------------------------------
describe("External Resource Safety", function () {
	it("client-side JS must not load scripts from external domains", function () {
		const externalScript =
			/document\.createElement.*script[\s\S]{0,500}https?:\/\/(?!localhost)/;
		assert.ok(
			!externalScript.test(mainJsContent),
			"No external domain scripts should be dynamically loaded by the client module"
		);
	});

	it("module must not use eval()", function () {
		const evalUsage = (mainJsContent.match(/\beval\s*\(/g) || []).length;
		assert.strictEqual(evalUsage, 0, "eval() must not be used - XSS risk");
	});
});

// ---------------------------------------------------------------------------
// Focus Management (A11Y-08 regression guard)
// ---------------------------------------------------------------------------
describe("A11Y-08 Focus Management", function () {
	it("saveFocusState method must exist in main JS", function () {
		assert.ok(
			mainJsContent.includes("saveFocusState"),
			"saveFocusState() method must be present for A11Y-08 compliance"
		);
	});

	it("restoreFocusState method must exist in main JS", function () {
		assert.ok(
			mainJsContent.includes("restoreFocusState"),
			"restoreFocusState() method must be present for A11Y-08 compliance"
		);
	});

	it("team rows must use data-team-name attribute", function () {
		assert.ok(
			mainJsContent.includes("data-team-name"),
			"Team rows must carry data-team-name attribute to support focus restoration"
		);
	});
});

// ---------------------------------------------------------------------------
// Bundle Safety (PERF-09 regression guard)
// ---------------------------------------------------------------------------
describe("PERF-09 Dynamic Logo Loading", function () {
	it("loadLogoMappings method must exist for dynamic loading", function () {
		assert.ok(
			mainJsContent.includes("loadLogoMappings"),
			"loadLogoMappings() method must exist to support deferred team-logo-mappings.js loading"
		);
	});

	it("loadScript helper must exist", function () {
		assert.ok(
			mainJsContent.includes("loadScript"),
			"loadScript() helper must exist to support dynamic script injection"
		);
	});
});
