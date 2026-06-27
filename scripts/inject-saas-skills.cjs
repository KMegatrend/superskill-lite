const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'public', 'data', 'skill-registry.json');
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

const saasCategories = [
  { id: 'saas-ui', name: 'SaaS: UI/Frontend' },
  { id: 'saas-react', name: 'SaaS: React/Next.js' },
  { id: 'saas-ts', name: 'SaaS: TypeScript' },
  { id: 'saas-backend', name: 'SaaS: Backend' },
  { id: 'saas-db', name: 'SaaS: Database' },
  { id: 'saas-supabase', name: 'SaaS: Supabase' },
  { id: 'saas-payments', name: 'SaaS: Payments' },
  { id: 'saas-test', name: 'SaaS: Testing' },
  { id: 'saas-quality', name: 'SaaS: Quality' },
  { id: 'saas-deploy', name: 'SaaS: Deployment' },
  { id: 'saas-seo', name: 'SaaS: SEO & Marketing' },
  { id: 'saas-architecture', name: 'SaaS: Architecture' },
  { id: 'saas-master', name: '웹에이전시급 SaaS 개발' }
];

// Add categories if they don't exist
saasCategories.forEach(c => {
  if (!data.categories.find(x => x.id === c.id)) {
    data.categories.push(c);
  }
});

const masterPrompt = `You are a senior web agency team consisting of:
- Creative Director
- UX/UI Designer
- Senior Next.js Developer
- Senior TypeScript Engineer
- Tailwind CSS Specialist
- shadcn/ui Specialist
- Supabase Architect
- Stripe Billing Expert
- SEO Specialist
- Security Engineer

Tech Stack:
- Next.js latest
- TypeScript strict mode
- Tailwind CSS latest
- shadcn/ui
- Supabase
- Stripe
- React Hook Form
- Zod
- Framer Motion

Requirements:
- Production-ready code
- Agency-quality UI
- Mobile-first responsive
- SEO optimized
- Accessibility compliant
- High Lighthouse score
- Reusable components
- Clean architecture
- Feature-based folder structure
- Secure authentication
- Subscription billing support
- Admin dashboard support

Always generate code suitable for enterprise production deployment.
Avoid beginner patterns and AI-looking designs.`;

const newSkillsData = [
  { id: 'saas-master-prompt', cat: 'saas-master', name: '웹에이전시급 SaaS 개발 마스터', tags: ['saas', 'nextjs', 'master'], desc: '프로젝트 시작 시 사용하는 통합 마스터 프롬프트입니다.', content: masterPrompt },
  { id: 'frontend-design', cat: 'saas-ui', name: 'frontend-design', tags: ['ui', 'frontend'], desc: '프론트엔드 디자인 스킬' },
  { id: 'ui-ux-audit', cat: 'saas-ui', name: 'ui-ux-audit', tags: ['ui', 'ux'], desc: 'UI/UX 오딧 스킬' },
  { id: 'tailwind-expert', cat: 'saas-ui', name: 'tailwind-expert', tags: ['tailwind', 'css'], desc: 'Tailwind CSS 전문가 스킬' },
  { id: 'shadcn-ui', cat: 'saas-ui', name: 'shadcn-ui', tags: ['shadcn', 'ui'], desc: 'shadcn/ui 스킬' },
  { id: 'responsive-design', cat: 'saas-ui', name: 'responsive-design', tags: ['responsive', 'design'], desc: '반응형 디자인 스킬' },
  { id: 'landing-page-builder', cat: 'saas-ui', name: 'landing-page-builder', tags: ['landing', 'page'], desc: '랜딩 페이지 빌더 스킬' },
  { id: 'react-best-practices', cat: 'saas-react', name: 'react-best-practices', tags: ['react', 'best-practices'], desc: 'React 베스트 프랙티스 스킬' },
  { id: 'react-performance', cat: 'saas-react', name: 'react-performance', tags: ['react', 'performance'], desc: 'React 성능 최적화 스킬' },
  { id: 'nextjs-app-router', cat: 'saas-react', name: 'nextjs-app-router', tags: ['nextjs', 'app-router'], desc: 'Next.js App Router 스킬' },
  { id: 'nextjs-server-actions', cat: 'saas-react', name: 'nextjs-server-actions', tags: ['nextjs', 'server-actions'], desc: 'Next.js Server Actions 스킬' },
  { id: 'nextjs-seo', cat: 'saas-react', name: 'nextjs-seo', tags: ['nextjs', 'seo'], desc: 'Next.js SEO 스킬' },
  { id: 'nextjs-performance', cat: 'saas-react', name: 'nextjs-performance', tags: ['nextjs', 'performance'], desc: 'Next.js 성능 최적화 스킬' },
  { id: 'typescript-expert', cat: 'saas-ts', name: 'typescript-expert', tags: ['typescript', 'expert'], desc: 'TypeScript 전문가 스킬' },
  { id: 'typescript-refactoring', cat: 'saas-ts', name: 'typescript-refactoring', tags: ['typescript', 'refactoring'], desc: 'TypeScript 리팩토링 스킬' },
  { id: 'type-safety-audit', cat: 'saas-ts', name: 'type-safety-audit', tags: ['typescript', 'type-safety'], desc: '타입 안정성 검사 스킬' },
  { id: 'nodejs-api-design', cat: 'saas-backend', name: 'nodejs-api-design', tags: ['nodejs', 'api'], desc: 'Node.js API 설계 스킬' },
  { id: 'rest-api-designer', cat: 'saas-backend', name: 'rest-api-designer', tags: ['rest', 'api'], desc: 'REST API 설계자 스킬' },
  { id: 'openapi-generator', cat: 'saas-backend', name: 'openapi-generator', tags: ['openapi', 'generator'], desc: 'OpenAPI 생성기 스킬' },
  { id: 'backend-architecture', cat: 'saas-backend', name: 'backend-architecture', tags: ['backend', 'architecture'], desc: '백엔드 아키텍처 스킬' },
  { id: 'postgresql-expert', cat: 'saas-db', name: 'postgresql-expert', tags: ['postgresql', 'expert'], desc: 'PostgreSQL 전문가 스킬' },
  { id: 'prisma-expert', cat: 'saas-db', name: 'prisma-expert', tags: ['prisma', 'expert'], desc: 'Prisma 전문가 스킬' },
  { id: 'database-architect', cat: 'saas-db', name: 'database-architect', tags: ['database', 'architect'], desc: '데이터베이스 아키텍트 스킬' },
  { id: 'supabase-auth', cat: 'saas-supabase', name: 'supabase-auth', tags: ['supabase', 'auth'], desc: 'Supabase 인증 스킬' },
  { id: 'supabase-rbac', cat: 'saas-supabase', name: 'supabase-rbac', tags: ['supabase', 'rbac'], desc: 'Supabase RBAC 스킬' },
  { id: 'supabase-storage', cat: 'saas-supabase', name: 'supabase-storage', tags: ['supabase', 'storage'], desc: 'Supabase 스토리지 스킬' },
  { id: 'stripe-subscriptions', cat: 'saas-payments', name: 'stripe-subscriptions', tags: ['stripe', 'subscriptions'], desc: 'Stripe 구독 스킬' },
  { id: 'stripe-webhooks', cat: 'saas-payments', name: 'stripe-webhooks', tags: ['stripe', 'webhooks'], desc: 'Stripe 웹훅 스킬' },
  { id: 'stripe-saas-billing', cat: 'saas-payments', name: 'stripe-saas-billing', tags: ['stripe', 'billing'], desc: 'Stripe SaaS 빌링 스킬' },
  { id: 'playwright-testing', cat: 'saas-test', name: 'playwright-testing', tags: ['playwright', 'testing'], desc: 'Playwright 테스트 스킬' },
  { id: 'tdd-development', cat: 'saas-test', name: 'tdd-development', tags: ['tdd', 'development'], desc: 'TDD 개발 스킬' },
  { id: 'systematic-debugging', cat: 'saas-quality', name: 'systematic-debugging', tags: ['debugging', 'quality'], desc: '체계적인 디버깅 스킬' },
  { id: 'code-review', cat: 'saas-quality', name: 'code-review', tags: ['code-review', 'quality'], desc: '코드 리뷰 스킬' },
  { id: 'security-review', cat: 'saas-quality', name: 'security-review', tags: ['security', 'review'], desc: '보안 리뷰 스킬' },
  { id: 'owasp-security', cat: 'saas-quality', name: 'owasp-security', tags: ['owasp', 'security'], desc: 'OWASP 보안 스킬' },
  { id: 'vercel-deployment', cat: 'saas-deploy', name: 'vercel-deployment', tags: ['vercel', 'deployment'], desc: 'Vercel 배포 스킬' },
  { id: 'cloudflare-workers', cat: 'saas-deploy', name: 'cloudflare-workers', tags: ['cloudflare', 'workers'], desc: 'Cloudflare Workers 스킬' },
  { id: 'cloudflare-pages', cat: 'saas-deploy', name: 'cloudflare-pages', tags: ['cloudflare', 'pages'], desc: 'Cloudflare Pages 스킬' },
  { id: 'seo-optimizer', cat: 'saas-seo', name: 'seo-optimizer', tags: ['seo', 'optimizer'], desc: 'SEO 최적화 스킬' },
  { id: 'analytics-setup', cat: 'saas-seo', name: 'analytics-setup', tags: ['analytics', 'setup'], desc: '애널리틱스 설정 스킬' },
  { id: 'saas-builder', cat: 'saas-architecture', name: 'saas-builder', tags: ['saas', 'builder'], desc: 'SaaS 빌더 스킬' },
  { id: 'admin-dashboard', cat: 'saas-architecture', name: 'admin-dashboard', tags: ['admin', 'dashboard'], desc: '어드민 대시보드 스킬' },
  { id: 'multi-tenant-saas', cat: 'saas-architecture', name: 'multi-tenant-saas', tags: ['multi-tenant', 'saas'], desc: '멀티테넌트 SaaS 스킬' }
];

const newSkills = newSkillsData.map(s => {
  const content = s.content || "이 스킬에 대한 구체적인 내용은 향후 업데이트될 예정입니다. SaaS 프로젝트 빌딩에 활용하세요.";
  const mdContent = `---\nname: "${s.name}"\ndescription: "${s.desc}"\n---\n\n# ${s.name}\n\n${content}\n`;
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
console.log('Skills and categories successfully injected!');
