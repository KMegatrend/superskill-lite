const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'public', 'data', 'skill-registry.json');
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

const knownLinks = {
  'frontend-design': 'https://github.com/anthropics/skills/tree/main/skills/frontend-design',
  'react-best-practices': 'https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices',
  'next-best-practices': 'https://github.com/vercel-labs/agent-skills',
  'composition-patterns': 'https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns',
  'web-design-guidelines': 'https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines',
  'webapp-testing': 'https://github.com/anthropics/skills/tree/main/skills/webapp-testing',
  'find-skills': 'https://github.com/vercel-labs/skills/tree/main/skills/find-skills',
  'update-docs': 'https://github.com/vercel/next.js/tree/canary/.claude/skills/update-docs',
  'pr-creator': 'https://github.com/google-gemini/gemini-cli/tree/main/.gemini/skills/pr-creator'
};

data.skills = data.skills.map(s => {
  if (knownLinks[s.id]) {
    s.sourceUrl = knownLinks[s.id];
    s.skillContent = s.skillContent.replace(
      '이 스킬에 대한 구체적인 내용은 향후 업데이트될 예정입니다.',
      '이 스킬의 구체적인 내용 및 설치 방법은 공식 GitHub 저장소를 참고하세요.'
    );
  }
  return s;
});

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('Known links updated');
