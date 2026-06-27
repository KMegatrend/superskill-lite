const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'public', 'data', 'skill-registry.json');
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

const newSkill = {
  id: 'opencode-power-pack',
  categoryId: 'saas-master',
  name: 'OpenCode Power Pack',
  nameEn: 'opencode-power-pack',
  description: 'Eleven Claude Code skills ported to OpenCode: code-review, security-review, feature-dev, frontend-design + 7 more.',
  descriptionEn: 'Eleven Claude Code skills ported to OpenCode: code-review, security-review, feature-dev, frontend-design + 7 more.',
  author: 'waybarrios',
  version: '1.0.0',
  tags: ['opencode', 'power-pack', 'skills', 'bundle'],
  downloads: 1200,
  rating: 5.0,
  skillContent: '---\\nname: "OpenCode Power Pack"\\ndescription: "Eleven Claude Code skills ported to OpenCode: code-review, security-review, feature-dev, frontend-design + 7 more."\\n---\\n\\n# OpenCode Power Pack\\n\\n이 스킬은 11개의 주요 Claude Code 스킬(code-review, security-review, feature-dev, frontend-design 등)을 OpenCode용으로 이식한 파워팩입니다.\\n단 한 줄의 설정으로 다양한 강력한 기능을 프로젝트에 추가할 수 있습니다.\\n우측의 GitHub 링크를 통해 저장소에서 자세한 사용법을 확인하세요.',
  sourceUrl: 'https://github.com/waybarrios/opencode-power-pack'
};

// Remove if exists
data.skills = data.skills.filter(s => s.id !== newSkill.id);

// Prepend to top
data.skills.unshift(newSkill);

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('OpenCode Power Pack skill injected successfully!');
