const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'public', 'data', 'skill-registry.json');
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

const newSkillsData = [
  { id: 'webapp-testing', cat: 'saas-test', name: 'Webapp Testing (Anthropic)', tags: ['testing', 'qa'], desc: 'Anthropic 핵심 스킬 - 웹앱 테스트' },
  { id: 'web-design-guidelines', cat: 'saas-ui', name: 'Web Design Guidelines (Vercel)', tags: ['design', 'ui'], desc: 'Vercel 공식/추천 스킬 - 웹 디자인 가이드라인' },
  { id: 'composition-patterns', cat: 'saas-react', name: 'Composition Patterns (Vercel)', tags: ['react', 'patterns'], desc: 'Vercel 공식/추천 스킬 - 컴포지션 패턴' },
  { id: 'next-best-practices', cat: 'saas-react', name: 'Next.js Best Practices (Vercel)', tags: ['nextjs', 'best-practices'], desc: 'Vercel 공식/추천 스킬 - Next.js 베스트 프랙티스' },
  { id: 'find-skills', cat: '01-development', name: 'Find Skills (Vercel)', tags: ['skills', 'search'], desc: 'Vercel - 스킬 검색 및 연동' },
  { id: 'update-docs', cat: '04-docs', name: 'Update Docs (Next.js)', tags: ['docs', 'nextjs'], desc: 'Next.js 문서 업데이트 스킬' },
  { id: 'pr-creator', cat: '06-devops', name: 'PR Creator (Google Gemini)', tags: ['pr', 'git', 'gemini'], desc: 'Google Gemini PR 자동 생성 스킬' },
  { id: 'web-artifacts-builder', cat: '01-development', name: 'Web Artifacts Builder', tags: ['artifacts', 'builder'], desc: '웹 아티팩트 빌더 스킬' },
  { id: 'firecrawl-integration', cat: 'saas-backend', name: 'Firecrawl Integration', tags: ['crawling', 'data'], desc: '웹 크롤링, 경쟁사 분석, 데이터 수집 자동화 스킬' },
  { id: 'accessibility-a11y', cat: 'saas-ui', name: 'Accessibility (a11y)', tags: ['a11y', 'accessibility'], desc: 'WCAG 웹 접근성 가이드 준수 및 접근성 검사 스킬' }
];

const newSkills = newSkillsData.map(s => {
  const mdContent = "---\nname: \"" + s.name + "\"\ndescription: \"" + s.desc + "\"\n---\n\n# " + s.name + "\n\n이 스킬에 대한 구체적인 내용은 향후 업데이트될 예정입니다. SaaS 프로젝트 빌딩에 활용하세요.\n";
  return {
    id: s.id,
    categoryId: s.cat,
    name: s.name,
    nameEn: s.id,
    description: s.desc,
    descriptionEn: s.desc,
    author: 'SaaS Team',
    version: '1.0.0',
    tags: s.tags,
    downloads: Math.floor(Math.random() * 5000) + 1000,
    rating: 5.0,
    skillContent: mdContent,
    sourceUrl: 'https://github.com/saas-agency-skills'
  };
});

// Remove existing ones to avoid duplicates
data.skills = data.skills.filter(s => !newSkillsData.find(ns => ns.id === s.id));

// Prepend so they appear at the top
data.skills = [...newSkills, ...data.skills];

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('Additional skills successfully injected!');
