const fs = require('fs');
const html = fs.readFileSync('C:/Users/an203/.gemini/antigravity-ide/brain/b2c883e4-4526-48de-9dc0-d5d3d6775d49/.system_generated/steps/65/content.md', 'utf8');

// The ChatGPT share page contains hydration data. 
// We can use a regex to extract the conversation messages.
const regex = /"parts":\["([^"]+)"\]/g;
let match;
const messages = [];
while ((match = regex.exec(html)) !== null) {
  let text = match[1];
  // Basic unescape
  text = text.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  messages.push(text);
}

fs.writeFileSync('extracted-chat.txt', messages.join('\n\n---\n\n'));
console.log('Extracted ' + messages.length + ' messages');
