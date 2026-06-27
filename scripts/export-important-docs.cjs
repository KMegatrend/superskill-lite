const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'important_documents(중요문서보관소)');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Playbook
const playbookPath = 'C:\\Users\\an203\\.gemini\\antigravity-ide\\brain\\b2c883e4-4526-48de-9dc0-d5d3d6775d49\\AI_Agency_Playbook.md';
if (fs.existsSync(playbookPath)) {
  const content = fs.readFileSync(playbookPath, 'utf8');
  fs.writeFileSync(path.join(targetDir, 'AI_Agency_Playbook(1인_AI_웹에이전시_마스터_플레이북).md'), content, 'utf8');
}

// 2. Luxury Skill
const registryFile = path.join(__dirname, '..', 'public', 'data', 'skill-registry.json');
const data = JSON.parse(fs.readFileSync(registryFile, 'utf8'));
const luxurySkill = data.skills.find(s => s.id === 'luxury-agency-web-designer');
if (luxurySkill) {
  fs.writeFileSync(path.join(targetDir, 'Luxury_Agency_Web_Designer_Skill(럭셔리_웹에이전시_디자이너_스킬).md'), luxurySkill.skillContent, 'utf8');
}

// 3. OpenCode Power Pack (since it was explicitly requested earlier and has 11 great skills inside it)
const opencodeSkill = data.skills.find(s => s.id === 'opencode-power-pack');
if (opencodeSkill) {
  fs.writeFileSync(path.join(targetDir, 'OpenCode_Power_Pack(오픈코드_파워팩_종합가이드).md'), opencodeSkill.skillContent, 'utf8');
}

console.log('Successfully exported important documents.');
