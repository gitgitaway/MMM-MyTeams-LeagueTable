// Test the updated parsing logic
const NodeHelper = require("./node_helper.js");

// Create a mock helper instance
const helper = {
    config: { debug: true },
    
    // Copy the parsing methods
    parseTeamRow: NodeHelper.parseTeamRow,
    extractNumber: NodeHelper.extractNumber
};

// Test with a sample BBC row (from the previous test output)
const sampleRow = `<tr class="ssrcss-1urqilq-CellsRow e13j9mpy2"><td aria-label="Team" class="ssrcss-ow7ttz-TableCell e13j9mpy1"><div class="ssrcss-h6ig69-Team e1pscgbk4"><span class="ssrcss-4fgj5b-Rank e1pscgbk3">1</span><div data-testid="badge-container-celtic" class="ssrcss-7kfmgb-BadgeContainer ezmsq4q1"><img alt="Celtic" src="https://static.files.bbci.co.uk/core/website/assets/static/sport/football/celtic.a07ebda54a.svg" class="ssrcss-1ixj8ey-Badge ezmsq4q0"></div><a href="/sport/football/teams/celtic" class="ssrcss-1x4zb8j-TeamLink e1pscgbk5">Celtic</a></div></td><td aria-label="Played" class="ssrcss-ow7ttz-TableCell e13j9mpy1"><span class="ssrcss-1abe4gf-Element e1pwba1m0">4</span></td><td aria-label="Won" class="ssrcss-ow7ttz-TableCell e13j9mpy1"><span class="ssrcss-1abe4gf-Element e1pwba1m0">3</span></td><td aria-label="Drawn" class="ssrcss-ow7ttz-TableCell e13j9mpy1"><span class="ssrcss-1abe4gf-Element e1pwba1m0">1</span></td><td aria-label="Lost" class="ssrcss-ow7ttz-TableCell e13j9mpy1"><span class="ssrcss-1abe4gf-Element e1pwba1m0">0</span></td><td aria-label="Goals For" class="ssrcss-ow7ttz-TableCell e13j9mpy1"><span class="ssrcss-1abe4gf-Element e1pwba1m0">6</span></td><td aria-label="Goals Against" class="ssrcss-ow7ttz-TableCell e13j9mpy1"><span class="ssrcss-1abe4gf-Element e1pwba1m0">0</span></td><td aria-label="Goal Difference" class="ssrcss-ow7ttz-TableCell e13j9mpy1"><span class="ssrcss-1abe4gf-Element e1pwba1m0">6</span></td><td aria-label="Points" class="ssrcss-ow7ttz-TableCell e13j9mpy1"><span class="ssrcss-1abe4gf-Element e1pwba1m0">10</span></td></tr>`;

console.log("Testing team row parsing...");
console.log("Sample row length:", sampleRow.length);

try {
    const result = helper.parseTeamRow.call(helper, sampleRow, 1);
    console.log("Parsed result:", result);
} catch (error) {
    console.error("Error:", error);
}