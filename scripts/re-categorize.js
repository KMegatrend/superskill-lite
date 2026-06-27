import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.join(__dirname, '../public/data/skill-registry.json');

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));

// Helper to assign categories based on tags/description
function assignCategory(skill) {
  const text = `${skill.nameEn} ${skill.descriptionEn} ${skill.tags.join(' ')}`.toLowerCase();
  
  if (text.includes('security') || text.includes('auth') || text.includes('jwt')) return '02-security';
  if (text.includes('test') || text.includes('jest') || text.includes('cypress') || text.includes('qa')) return '03-test-qa';
  if (text.includes('doc') || text.includes('readme') || text.includes('guide')) return '04-docs';
  if (text.includes('design') || text.includes('ui') || text.includes('css') || text.includes('tailwind') || text.includes('frontend')) return '05-design-ui';
  if (text.includes('git') || text.includes('ci') || text.includes('cd') || text.includes('devops') || text.includes('deploy') || text.includes('docker') || text.includes('github action')) return '06-devops';
  if (text.includes('business') || text.includes('saas') || text.includes('startup') || text.includes('payment') || text.includes('stripe')) return '07-business';
  
  return '01-development'; // Default
}

let changedCount = 0;
let recategorizedCount = 0;

registry.skills.forEach(skill => {
  // 1. Rename author
  let contentChanged = false;
  
  if (skill.author === 'Antigravity & Master') {
    skill.author = 'AI Super Skill';
    contentChanged = true;
  }
  if (skill.skillContent && skill.skillContent.includes('Antigravity & Master')) {
    skill.skillContent = skill.skillContent.replace(/Antigravity & Master/g, 'AI Super Skill');
    contentChanged = true;
  }
  
  if (contentChanged) changedCount++;

  // 2. Re-categorize real skills
  if (skill.id.startsWith('real-')) {
    const newCat = assignCategory(skill);
    if (skill.categoryId !== newCat) {
      skill.categoryId = newCat;
      recategorizedCount++;
    }
  }
});

fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');

console.log(`✅ Done!`);
console.log(`- Changed Author 'Antigravity & Master' to 'AI Super Skill' in ${changedCount} skills.`);
console.log(`- Re-categorized ${recategorizedCount} real skills intelligently.`);
