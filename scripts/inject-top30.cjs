const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'public', 'data', 'skill-registry.json');
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

const top30NewSkills = [
  { id: 'ui-ux-pro-max', cat: 'saas-ui', name: 'UI/UX Pro Max', tags: ['ui', 'ux', 'design'], desc: 'UI/UX 전문가 수준의 디자인 검토 및 개선 스킬' },
  { id: 'tailwind-design-system', cat: 'saas-ui', name: 'Tailwind Design System', tags: ['tailwind', 'design-system'], desc: 'Tailwind CSS 기반 디자인 시스템 구축 스킬' },
  { id: 'canvas-design', cat: 'saas-ui', name: 'Canvas Design', tags: ['canvas', 'design', 'graphics'], desc: 'HTML5 Canvas 기반 그래픽 디자인 및 애니메이션 스킬' },
  { id: 'algorithmic-art', cat: 'saas-ui', name: 'Algorithmic Art', tags: ['art', 'generative', 'design'], desc: '알고리즘 기반 제너러티브 아트 생성 스킬' },
  { id: 'design-review', cat: 'saas-ui', name: 'Design Review', tags: ['design', 'review'], desc: '디자인 리뷰 및 피드백 자동화 스킬' },
  { id: 'react-native-skills', cat: 'saas-react', name: 'React Native Skills', tags: ['react-native', 'mobile'], desc: 'React Native 모바일 앱 개발 스킬' },
  { id: 'expo-app-design', cat: 'saas-react', name: 'Expo App Design', tags: ['expo', 'react-native', 'design'], desc: 'Expo 기반 모바일 앱 디자인 스킬' },
  { id: 'server-components-expert', cat: 'saas-react', name: 'Server Components Expert', tags: ['react', 'rsc', 'nextjs'], desc: 'React Server Components(RSC) 최적화 스킬' },
  { id: 'refactoring-expert', cat: 'saas-architecture', name: 'Refactoring Expert', tags: ['refactoring', 'clean-code'], desc: '레거시 코드 리팩토링 및 클린 코드 최적화 스킬' },
  { id: 'clean-architecture', cat: 'saas-architecture', name: 'Clean Architecture', tags: ['architecture', 'design-patterns'], desc: '클린 아키텍처 및 디자인 패턴 적용 스킬' },
  { id: 'monorepo-architect', cat: 'saas-architecture', name: 'Monorepo Architect', tags: ['monorepo', 'turborepo', 'nx'], desc: 'Turborepo, Nx 등 모노레포 아키텍처 설계 스킬' },
  { id: 'auth-security-audit', cat: 'saas-quality', name: 'Auth Security Audit', tags: ['security', 'auth', 'audit'], desc: '인증 및 인가 보안 취약점 감사 스킬' },
  { id: 'visual-regression-testing', cat: 'saas-test', name: 'Visual Regression Testing', tags: ['testing', 'visual', 'qa'], desc: '시각적 회귀 테스트 자동화 스킬' },
  { id: 'supabase-architect', cat: 'saas-supabase', name: 'Supabase Architect', tags: ['supabase', 'database', 'architecture'], desc: 'Supabase 데이터베이스 및 서버리스 아키텍처 설계 스킬' },
  { id: 'stripe-billing-expert', cat: 'saas-payments', name: 'Stripe Billing Expert', tags: ['stripe', 'billing', 'payments'], desc: 'Stripe 결제 및 SaaS 구독 모델 구축 스킬' }
];

const newSkills = top30NewSkills.map(s => {
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
data.skills = data.skills.filter(s => !top30NewSkills.find(ns => ns.id === s.id));

// Prepend so they appear at the top
data.skills = [...newSkills, ...data.skills];

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('Top 30 skills successfully injected!');
