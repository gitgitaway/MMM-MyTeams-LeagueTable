// Test the updated parsing logic
const https = require("https");

const url = "https://www.bbc.co.uk/sport/football/scottish-premiership/table";

const options = {
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
};

// Updated parsing logic
function parseTeamRow(rowHtml, position) {
    try {
        // Skip header row
        if (rowHtml.includes('HeadingRow') || rowHtml.includes('<th')) {
            return null;
        }

        // Extract team name from data-testid attribute
        const testIdMatch = rowHtml.match(/data-testid="badge-container-([^"]+)"/);
        let teamName = "";
        if (testIdMatch) {
            teamName = testIdMatch[1]
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            // Handle special cases
            if (teamName === "Heart Of Midlothian") teamName = "Hearts";
            if (teamName === "St Mirren") teamName = "St. Mirren";
        }
        
        if (!teamName || teamName.length < 2) {
            return null;
        }

        // Extract position number
        const positionMatch = rowHtml.match(/class="[^"]*Rank[^"]*">(\d+)</);
        const actualPosition = positionMatch ? parseInt(positionMatch[1]) : position;

        // Extract statistics from labeled cells
        const cellData = {};
        
        // First try the span-wrapped format (for Points)
        const spanCellRegex = /<td[^>]*aria-label="([^"]*)"[^>]*><span[^>]*>(\d+)<\/span><\/td>/g;
        let match;
        while ((match = spanCellRegex.exec(rowHtml)) !== null) {
            cellData[match[1]] = parseInt(match[2]);
        }
        
        // Then try the direct content format (for other stats)
        const directCellRegex = /<td[^>]*aria-label="([^"]*)"[^>]*>(\d+)<\/td>/g;
        while ((match = directCellRegex.exec(rowHtml)) !== null) {
            cellData[match[1]] = parseInt(match[2]);
        }

        const team = {
            position: actualPosition,
            name: teamName,
            played: cellData['Played'] || 0,
            won: cellData['Won'] || 0,
            drawn: cellData['Drawn'] || 0,
            lost: cellData['Lost'] || 0,
            goalsFor: cellData['Goals For'] || 0,
            goalsAgainst: cellData['Goals Against'] || 0,
            goalDifference: cellData['Goal Difference'] || 0,
            points: cellData['Points'] || 0
        };

        return team;

    } catch (error) {
        console.error("Error parsing team row:", error);
        return null;
    }
}

console.log("Testing updated SPFL League Table parsing...");

https.get(url, options, (res) => {
    let data = "";
    
    res.on("data", (chunk) => {
        data += chunk;
    });
    
    res.on("end", () => {
        // Find the table
        const tableRegex = /<table[^>]*>(.*?)<\/table>/gis;
        const tableMatch = data.match(tableRegex);
        
        if (tableMatch) {
            const tableHtml = tableMatch[0];
            
            // Extract rows
            const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
            const rows = tableHtml.match(rowRegex);
            
            if (rows) {
                console.log("=== SPFL League Table ===");
                console.log("Pos | Team                | P | W | D | L | GF | GA | GD | Pts");
                console.log("----|---------------------|---|---|---|---|----|----|----|----|");
                
                const teams = [];
                rows.forEach((row, index) => {
                    const team = parseTeamRow(row, index);
                    if (team) {
                        teams.push(team);
                        
                        // Format output
                        const pos = team.position.toString().padStart(2);
                        const name = team.name.padEnd(19);
                        const p = team.played.toString().padStart(2);
                        const w = team.won.toString().padStart(2);
                        const d = team.drawn.toString().padStart(2);
                        const l = team.lost.toString().padStart(2);
                        const gf = team.goalsFor.toString().padStart(3);
                        const ga = team.goalsAgainst.toString().padStart(3);
                        const gd = (team.goalDifference >= 0 ? "+" + team.goalDifference : team.goalDifference.toString()).padStart(3);
                        const pts = team.points.toString().padStart(3);
                        
                        console.log(`${pos}  | ${name} | ${p} | ${w} | ${d} | ${l} | ${gf} | ${ga} | ${gd} | ${pts}`);
                    }
                });
                
                console.log(`\nSuccessfully parsed ${teams.length} teams with complete data!`);
            }
        } else {
            console.log("No table found!");
        }
    });
    
}).on("error", (err) => {
    console.error("Error:", err);
});