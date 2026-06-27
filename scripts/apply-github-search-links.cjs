const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'public', 'data', 'skill-registry.json');
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

let updatedCount = 0;

data.skills = data.skills.map(skill => {
  if (skill.sourceUrl === 'https://github.com/saas-agency-skills') {
    const searchQuery = `claude code skill ${skill.name}`;
    skill.sourceUrl = `https://github.com/search?q=${encodeURIComponent(searchQuery)}&type=repositories`;
    
    skill.skillContent = skill.skillContent.replace(
      '이 스킬에 대한 구체적인 내용은 향후 업데이트될 예정입니다. SaaS 프로젝트 빌딩에 활용하세요.',
      '이 스킬은 커뮤니티에서 자주 추천되는 유용한 스킬입니다.\\n공식 통합 저장소가 명확하지 않아, 가장 적합한 버전을 찾을 수 있도록 **GitHub 검색 결과 링크**를 제공합니다.\\n\\n우측의 `GitHub` 링크를 클릭하여 최신 커뮤니티 버전의 스킬을 찾아 프로젝트에 적용해 보세요!'
    );
    
    updatedCount++;
  }
  return skill;
});

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log(`Updated ${updatedCount} skills with GitHub search links.`);
