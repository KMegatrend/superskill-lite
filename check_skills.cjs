const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/skill-registry.json'));

let total = 0;
let placeholders = 0;
let shortContent = 0;

data.skills.forEach(s => {
  total++;
  const len = s.skillContent ? s.skillContent.length : 0;
  const isPlaceholder = s.skillContent && s.skillContent.includes('향후 업데이트');
  
  if (isPlaceholder) {
    placeholders++;
    console.log(`[Placeholder] ${s.id} (${s.name})`);
  } else if (len < 100) {
    shortContent++;
    console.log(`[Too Short] ${s.id} (${s.name}) - length: ${len}`);
  }
});

console.log(`\nTotal skills: ${total}`);
console.log(`Placeholders: ${placeholders}`);
console.log(`Too short (<100 chars): ${shortContent}`);
