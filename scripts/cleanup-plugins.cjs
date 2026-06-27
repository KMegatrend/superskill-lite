const fs = require('fs');
const path = require('path');
const os = require('os');

const pluginsDir = path.join(os.homedir(), '.gemini', 'config', 'plugins');

const keepList = [
  'agency-global-rules',
  'android-cli-plugin',
  'chrome-devtools-plugin',
  'firebase',
  'google-antigravity-sdk',
  'modern-web-guidance-plugin'
];

let deletedCount = 0;

if (fs.existsSync(pluginsDir)) {
  const dirs = fs.readdirSync(pluginsDir);
  for (const d of dirs) {
    const fullPath = path.join(pluginsDir, d);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!keepList.includes(d)) {
        console.log(`Deleting unnecessary skill folder: ${d}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
        deletedCount++;
      } else {
        console.log(`Keeping system/global plugin: ${d}`);
      }
    }
  }
}

console.log(`\nCleanup complete! Deleted ${deletedCount} unnecessary plugin folders.`);
