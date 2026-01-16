const fs = require('fs');

// Read the CSS file
let content = fs.readFileSync('src/components/AgentDemoCards.css', 'utf8');
const lines = content.split('\n');

let braceCount = 0;
const fixedLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const openBraces = (line.match(/\{/g) || []).length;
  const closeBraces = (line.match(/\}/g) || []).length;
  
  // Track brace balance
  braceCount += openBraces - closeBraces;
  
  // If this line is just a closing brace and we have negative balance, skip it
  if (line.trim() === '}' && braceCount < 0) {
    console.log(`Removing orphaned brace at line ${i + 1}`);
    braceCount = 0; // Reset to 0 since we're skipping this brace
    continue;
  }
  
  fixedLines.push(line);
}

// Write the fixed content
fs.writeFileSync('src/components/AgentDemoCards.css', fixedLines.join('\n'), 'utf8');
console.log('Fixed CSS braces');


