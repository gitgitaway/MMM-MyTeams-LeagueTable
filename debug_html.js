// Debug the actual HTML structure
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
        // Find the table
        const tableRegex = /<table[^>]*>(.*?)<\/table>/gis;
        const tableMatch = data.match(tableRegex);
        
        if (tableMatch) {
            const tableHtml = tableMatch[0];
            
            // Extract rows
            const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
            const rows = tableHtml.match(rowRegex);
            
            if (rows && rows.length > 1) {
                console.log("=== Analyzing first data row ===");
                const firstDataRow = rows[1]; // Skip header row
                
                console.log("Full row HTML:");
                console.log(firstDataRow);
                console.log("\n=== Cell Analysis ===");
                
                // Extract all td elements
                const cellRegex = /<td[^>]*>(.*?)<\/td>/gis;
                let match;
                let cellIndex = 0;
                
                while ((match = cellRegex.exec(firstDataRow)) !== null) {
                    console.log(`\nCell ${cellIndex}:`);
                    console.log("Full content:", match[1].substring(0, 200) + "...");
                    
                    // Look for aria-label
                    const ariaMatch = match[0].match(/aria-label="([^"]*)"/);
                    if (ariaMatch) {
                        console.log("Aria-label:", ariaMatch[1]);
                    }
                    
                    // Look for numbers
                    const numberMatch = match[1].match(/>(\d+)</);
                    if (numberMatch) {
                        console.log("Number found:", numberMatch[1]);
                    }
                    
                    cellIndex++;
                }
            }
        }
    });
    
}).on("error", (err) => {
    console.error("Error:", err);
});