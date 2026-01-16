const fs = require('fs');
const path = require('path');

function findCssFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          findCssFiles(filePath, fileList);
        } else if (file.endsWith('.css')) {
          fileList.push(filePath);
        }
      } catch (e) {}
    });
  } catch (e) {}
  return fileList;
}

const cssFiles = [];
const publicCssFile = path.join('public', 'videos', 'stacked-slides-app', 'stacked-slides-app.9f367d21.css');
if (fs.existsSync(publicCssFile)) {
  cssFiles.push(publicCssFile);
}
if (fs.existsSync('src')) {
  cssFiles.push(...findCssFiles('src'));
}

console.log(`Found ${cssFiles.length} CSS files to check`);

let fixedCount = 0;
let checkedCount = 0;

cssFiles.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      checkedCount++;
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Fix broken @import URLs
      content = content.replace(/@import\s+url\(['"]https:\/;([^'"]+)['"]\);/g, (match, params) => {
        if (params.includes('400;500;600;700') && params.includes('&display=swap')) {
          return `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');`;
        }
        if (params.includes('400;500;600;700;800;900') && params.includes('&display=swap')) {
          return `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&display=swap');`;
        }
        return match;
      });
      
      // Convert aspect-ratio fractions to decimals
      content = content.replace(/aspect-ratio:\s*(\d+)\s*\/\s*(\d+)\s*;/g, (match, num1, num2) => {
        const decimal = (parseInt(num1) / parseInt(num2)).toFixed(6).replace(/\.?0+$/, '');
        return `aspect-ratio: ${decimal};`;
      });
      
      // FIX: Remove forward slashes from background shorthand - SIMPLE APPROACH
      // Only fix single-line background properties to avoid breaking structure
      const lines = content.split('\n');
      const fixedLines = [];
      let inComment = false;
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Track comment state
        if (line.includes('/*')) {
          inComment = true;
          if (line.includes('*/')) {
            inComment = false;
          }
          fixedLines.push(line);
          continue;
        }
        if (line.includes('*/')) {
          inComment = false;
          fixedLines.push(line);
          continue;
        }
        if (inComment) {
          fixedLines.push(line);
          continue;
        }
        
        // Skip @import
        if (line.includes('@import')) {
          fixedLines.push(line);
          continue;
        }
        
        // Only fix background shorthand on single lines (not multi-line)
        // Pattern: background: ... position / size ...
        if (line.includes('background:') && line.includes(' / ') && !line.includes('background-') && line.includes(';')) {
          // Check if forward slash is in a URL
          const urlRegex = /url\([^)]*\)/g;
          const urls = line.match(urlRegex) || [];
          let hasSlashInUrl = urls.some(url => url.includes(' / '));
          
          if (!hasSlashInUrl) {
            // Remove forward slashes from background shorthand
            // Pattern: "center / cover" or "0 0 / 100%"
            line = line.replace(/(\b(?:center|top|bottom|left|right|\d+(?:px|%|em|rem)?)\s+)\/\s+([a-zA-Z-]+|\d+(?:px|%|em|rem)?)/g, '$1');
            line = line.replace(/(\d+(?:px|%|em|rem)?)\s+\/\s+(\d+(?:px|%|em|rem)?)/g, '$1');
          }
        }
        
        fixedLines.push(line);
      }
      
      content = fixedLines.join('\n');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Fixed: ${filePath}`);
        fixedCount++;
      }
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\nCSS fix script completed: Checked ${checkedCount} files, Fixed ${fixedCount} files`);
