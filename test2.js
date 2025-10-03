// Detailed test script for BBC Sport HTML structure
const https = require("https");

const url = "https://www.bbc.co.uk/sport/football/scottish-premiership/table";

const options = {
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
};

https.get(url, options, (res) => {
    let data = "";
    
    res.on("data", (chunk) => {
        data += chunk;
    });
    
    res.on("end", () => {
        console.log("=== BBC Sport HTML Analysis ===");
        
        // Find the table
        const tableRegex = /<table[^>]*>(.*?)<\/table>/gis;
        const tableMatch = data.match(tableRegex);
        
        if (tableMatch) {
            const tableHtml = tableMatch[0];
            console.log("Table found, length:", tableHtml.length);
            
            // Extract rows
            const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
            const rows = tableHtml.match(rowRegex);
            
            if (rows) {
                console.log("Total rows:", rows.length);
                
                // Analyze each row
                rows.forEach((row, index) => {
                    console.log(`\n--- Row ${index} ---`);
                    
                    if (row.includes('HeadingRow') || row.includes('<th')) {
                        console.log("HEADER ROW");
                        // Extract header text
                        const headerText = row.replace(/<[^>]*>/g, "").trim();
                        console.log("Header text:", headerText);
                    } else {
                        console.log("DATA ROW");
                        
                        // Look for team name
                        const teamLinkMatch = row.match(/<a[^>]*>([^<]+)<\/a>/);
                        if (teamLinkMatch) {
                            console.log("Team name:", teamLinkMatch[1]);
                        }
                        
                        // Look for position
                        const positionMatch = row.match(/class="[^"]*Rank[^"]*">(\d+)</);
                        if (positionMatch) {
                            console.log("Position:", positionMatch[1]);
                        }
                        
                        // Extract all numbers
                        const numberMatches = row.match(/>\s*(\d+)\s*</g);
                        if (numberMatches) {
                            const numbers = numberMatches.map(match => 
                                parseInt(match.replace(/[><\s]/g, ''))
                            ).filter(num => !isNaN(num));
                            console.log("Numbers found:", numbers);
                        }
                        
                        // Show first 300 chars of row for debugging
                        console.log("Row sample:", row.substring(0, 300) + "...");
                    }
                });
            }
        } else {
            console.log("No table found!");
        }
    });
    
}).on("error", (err) => {
    console.error("Error:", err);
});