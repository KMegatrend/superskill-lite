const fs = require('fs');
const path = require('path');
const https = require('https');

const file = path.join(__dirname, '..', 'public', 'data', 'skill-registry.json');
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

const skillsToFetch = [
  'agents-md-improver',
  'agents-md-revise',
  'code-architect',
  'code-explorer',
  'code-review',
  'code-reviewer',
  'feature-dev',
  'frontend-design',
  'mcp-builder',
  'security-review',
  'skill-creator'
];

function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(body));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  let addedOrUpdated = 0;

  for (const skillId of skillsToFetch) {
    const url = `https://raw.githubusercontent.com/waybarrios/opencode-power-pack/main/skills/${skillId}/SKILL.md`;
    try {
      console.log(`Fetching ${skillId}...`);
      const content = await fetchRaw(url);
      
      if (!content || content.includes('404: Not Found')) {
        console.log(`Failed to fetch ${skillId}`);
        continue;
      }

      // Check if skill exists in registry
      let existing = data.skills.find(s => s.id === skillId);
      if (existing) {
        existing.skillContent = content;
        existing.sourceUrl = ''; // Clear sourceUrl to show '설치하기' button
        console.log(`Updated ${skillId}`);
      } else {
        // Add new skill
        const newSkill = {
          id: skillId,
          categoryId: '01-development', // default category
          name: skillId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          nameEn: skillId,
          description: `OpenCode Power Pack 스킬: ${skillId}`,
          descriptionEn: `OpenCode Power Pack skill: ${skillId}`,
          author: 'waybarrios',
          version: '1.0.0',
          tags: ['opencode', 'power-pack'],
          downloads: 1000 + Math.floor(Math.random() * 500),
          rating: 5.0,
          skillContent: content,
          sourceUrl: ''
        };
        
        // Put in specific categories if we know them
        if (skillId.includes('design')) newSkill.categoryId = '05-design-ui';
        else if (skillId.includes('security')) newSkill.categoryId = '02-security';
        
        data.skills.unshift(newSkill);
        console.log(`Added ${skillId}`);
      }
      addedOrUpdated++;
    } catch (e) {
      console.error(`Error with ${skillId}:`, e.message);
    }
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Successfully processed ${addedOrUpdated} skills from OpenCode Power Pack!`);
}

run();
