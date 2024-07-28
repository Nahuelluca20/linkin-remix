const fs = require('fs');
const path = require('path');

function addNodePrefixToImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const updatedContent = content
    .replace(/from 'process'/g, "from 'node:process'")
    .replace(/from 'readline'/g, "from 'node:readline'");

  fs.writeFileSync(filePath, updatedContent, 'utf-8');
  console.log(`Updated imports in ${filePath}`);
}

function traverseDirectory(directory) {
  fs.readdirSync(directory).forEach(file => {
    const fullPath = path.join(directory, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.ts')) {
      addNodePrefixToImports(fullPath);
    }
  });
}

const puppeteerDir = path.dirname(require.resolve('puppeteer'));
traverseDirectory(puppeteerDir);
console.log('Finished updating Puppeteer imports');
