import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.join(__dirname, '../public/data/skill-registry.json');

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));

let fixedCount = 0;

registry.skills.forEach(skill => {
  if (skill.author === 'SaaS Team') {
    skill.author = 'AI Super Skill';
    fixedCount++;
  }
});

fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');

console.log(`✅ Changed Author for ${fixedCount} 'SaaS Team' skills to 'AI Super Skill'.`);
