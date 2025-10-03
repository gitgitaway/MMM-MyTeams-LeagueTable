// Simple test script for  MMM-MyTeams-LeagueTable node_helper
const https = require("https");

// Test the BBC Sport URL directly
const url = "https://www.bbc.co.uk/sport/football/scottish-premiership/table";

console.log("Testing BBC Sport URL fetch...");

const options = {
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
};

https.get(url, options, (res) => {
    let data = "";
    
    console.log("Status Code:", res.statusCode);
    console.log("Headers:", res.headers);
    
    res.on("data", (chunk) => {
        data += chunk;
    });
    
    res.on("end", () => {
        console.log("Data length:", data.length);
        
        // Look for table data
        const tableRegex = /<table[^>]*>(.*?)<\/table>/gis;
        const tableMatch = data.match(tableRegex);
        
        if (tableMatch) {
            console.log("Found table data!");
            console.log("Table HTML length:", tableMatch[0].length);
            
            // Extract rows
            const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
            const rows = tableMatch[0].match(rowRegex);
            
            if (rows) {
                console.log("Found", rows.length, "table rows");
                
                // Show first few rows
                for (let i = 0; i < Math.min(3, rows.length); i++) {
                    console.log("Row", i + ":", rows[i].substring(0, 200) + "...");
                }
            }
        } else {
            console.log("No table found in HTML");
            // Show a sample of the HTML
            console.log("HTML sample:", data.substring(0, 1000));
        }
    });
    
}).on("error", (err) => {
    console.error("Error:", err);
});