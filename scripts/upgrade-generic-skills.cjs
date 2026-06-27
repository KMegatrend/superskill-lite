const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'public', 'data', 'skill-registry.json');
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

const templates = {
  frontend: (name) => `---
name: "${name}"
description: "프론트엔드 및 React/Next.js 전문가를 위한 최고 수준의 가이드라인"
tags:
  - frontend
  - react
  - nextjs
---

# 🚀 ${name} 전문가 가이드라인

## 🎯 스킬 목적
이 스킬은 **${name}** 관련 프론트엔드 작업을 수행할 때, AI(Claude)가 반드시 지켜야 할 웹에이전시급 프로덕션 표준을 강제합니다. 단순한 동작을 넘어 유지보수성과 성능이 극대화된 코드를 작성해야 합니다.

## 📋 핵심 아키텍처 원칙 (Frontend)
1. **컴포넌트 분리**: 하나의 파일이 150줄을 넘지 않도록 논리적으로 분리합니다. UI 컴포넌트와 비즈니스 로직(Custom Hook)을 철저히 분리하세요.
2. **Server/Client 컴포넌트**: Next.js App Router 환경에서는 기본적으로 Server Component를 사용하고, 상호작용(onClick, useState 등)이 필요한 최소한의 하위 트리만 \`"use client"\`로 선언합니다.
3. **상태 관리 최적화**: 전역 상태(Zustand 등)의 남용을 피하고, 로컬 상태와 서버 상태(SWR/React Query 등)를 명확히 구분하세요.
4. **렌더링 성능**: 불필요한 리렌더링을 막기 위해 \`useMemo\`, \`useCallback\`, \`React.memo\`를 적재적소에 사용하고, 의존성 배열(deps)을 완벽하게 관리하세요.

## 🛠️ 실행 지침 (AI Prompt)
- 코드를 작성하기 전에 사용자에게 "이 컴포넌트가 어디서 재사용될지" 먼저 물어보고 설계를 확정하세요.
- 접근성(a11y) 속성(aria-*, role 등)을 기본적으로 포함하세요.
- 에러 바운더리(Error Boundary)와 서스펜스(Suspense)를 활용한 로딩/에러 상태 UI를 반드시 구현하세요.

## 💡 필수 자가 검토 (Self-Review)
- [ ] 반응형(Mobile-first) 디자인이 고려되었는가?
- [ ] 하드코딩된 문자열 대신 상수(Constants) 파일이나 다국어(i18n) 대응 구조를 썼는가?
- [ ] 콘솔 에러나 React 경고(Warning)를 유발할 요소는 없는가?
`,

  backend: (name) => `---
name: "${name}"
description: "백엔드 및 API 아키텍처를 위한 최고 수준의 가이드라인"
tags:
  - backend
  - api
  - architecture
---

# 🚀 ${name} 백엔드 가이드라인

## 🎯 스킬 목적
이 스킬은 **${name}** 관련 백엔드/API 작업을 수행할 때, 안정성, 확장성, 보안성이 담보된 엔터프라이즈급 코드를 생성하기 위한 엄격한 규칙입니다.

## 📋 핵심 아키텍처 원칙 (Backend)
1. **RESTful/GraphQL 표준 준수**: 명확한 리소스 명명 규칙과 올바른 HTTP 메서드(GET, POST, PUT, DELETE) 및 상태 코드(200, 201, 400, 401, 403, 404, 500)를 엄격하게 사용하세요.
2. **레이어드 아키텍처(Layered Architecture)**: 라우터(Controller), 비즈니스 로직(Service), 데이터베이스 접근(Repository) 계층을 분리하여 결합도를 낮추세요.
3. **데이터 유효성 검사 (Validation)**: Zod, Joi 등을 활용해 클라이언트로부터 들어오는 모든 입력값을 최상단 라우터 레벨에서 검증하세요. (절대 DB 쿼리까지 잘못된 값이 도달하게 하지 마세요.)
4. **에러 핸들링**: 모든 에러는 중앙 집중식 에러 핸들러(Middleware)를 통해 처리하고, 클라이언트에게 내부 서버의 스택 트레이스(Stack trace)가 노출되지 않도록 안전하게 정제하세요.

## 🛠️ 실행 지침 (AI Prompt)
- 데이터베이스 쿼리를 작성할 때는 N+1 문제를 방지하고, 쿼리 실행 계획(인덱스 등)을 고려하여 최적화하세요.
- 트랜잭션(Transaction)이 필요한 로직(결제, 재고 차감 등)은 반드시 ACID 속성을 보장하도록 작성하세요.
- 비동기 작업(Promise) 처리 시 \`try-catch\` 블록을 꼼꼼하게 구성하세요.

## 💡 필수 자가 검토 (Self-Review)
- [ ] 모든 API 엔드포인트에 인증/인가(Auth/Role) 로직이 적용되어 있는가?
- [ ] 대량의 데이터를 응답할 때 페이지네이션(Pagination)이 적용되었는가?
- [ ] API 응답 속도를 높이기 위한 캐싱(Redis 등) 전략이 고려되었는가?
`,

  database: (name) => `---
name: "${name}"
description: "데이터베이스 및 Supabase 전문가를 위한 데이터 모델링 가이드라인"
tags:
  - database
  - supabase
  - sql
---

# 🚀 ${name} 마스터 가이드라인

## 🎯 스킬 목적
이 스킬은 **${name}** (DB 스키마 설계, Supabase 연동, 마이그레이션 등) 관련 작업을 할 때 데이터 무결성과 압도적인 읽기/쓰기 성능을 달성하기 위한 지침입니다.

## 📋 핵심 아키텍처 원칙 (Database)
1. **정규화 및 반정규화**: 중복 데이터를 최소화하기 위해 기본적으로 3정규화(3NF)를 따르되, 읽기 성능이 매우 중요한 지점에서는 의도적인 반정규화나 Materialized View를 활용하세요.
2. **인덱스 최적화**: WHERE 조건, JOIN, ORDER BY에 자주 사용되는 컬럼에는 반드시 적절한 인덱스(B-Tree, GIN 등)를 생성하세요. 단, 과도한 인덱스는 쓰기 성능을 저하시키므로 균형을 맞추세요.
3. **Supabase & RLS (Row Level Security)**: Supabase를 사용할 경우 데이터베이스 접근을 클라이언트에서 직접 허용할 수 있으므로, 반드시 모든 테이블에 엄격한 RLS 정책을 설정하여 타인의 데이터 접근을 차단하세요.
4. **외래키(FK) 및 제약조건**: 데이터 무결성을 위해 참조 무결성(ON DELETE CASCADE/SET NULL 등)과 필수 제약조건(NOT NULL, UNIQUE, CHECK)을 데이터베이스 레벨에서 강제하세요.

## 🛠️ 실행 지침 (AI Prompt)
- 새로운 테이블을 설계할 때는 사용자에게 ERD(개체 관계도) 개념의 마크다운 표를 먼저 제시하여 승인을 받은 후 마이그레이션 스크립트를 작성하세요.
- ORM(Prisma, Drizzle 등)을 사용할 때는 생성되는 실제 SQL 쿼리가 무엇인지 예측하고 비효율적인 쿼리가 발생하지 않도록 주의하세요.

## 💡 필수 자가 검토 (Self-Review)
- [ ] 삭제 로직은 Hard Delete가 아닌 Soft Delete(deleted_at 컬럼)를 고려했는가?
- [ ] RLS 정책이 인증된 사용자(auth.uid())에게만 안전하게 열려 있는가?
- [ ] 타임존(Timezone) 처리는 항상 UTC 기준으로 저장되도록 설계했는가?
`,

  design: (name) => `---
name: "${name}"
description: "UI/UX 및 디자인 시스템 마스터를 위한 시각적 완벽주의 가이드라인"
tags:
  - ui
  - ux
  - design
---

# 🚀 ${name} 디자인 가이드라인

## 🎯 스킬 목적
이 스킬은 **${name}** 관련 디자인 시스템, CSS 마크업, UI 컴포넌트 작업을 할 때 사용자가 한눈에 "Wow!" 할 수 있는 에이전시급 하이엔드 퀄리티를 만들어내기 위한 지침입니다.

## 📋 핵심 아키텍처 원칙 (Design)
1. **일관된 디자인 토큰**: 하드코딩된 색상값(#FFF)이나 픽셀(14px)을 피하고, Tailwind의 설정 파일(tailwind.config.js)이나 CSS 변수를 활용한 시맨틱 토큰(primary, spacing-4 등)을 사용하세요.
2. **마이크로 인터랙션 (Micro-interactions)**: 버튼 호버, 팝업 등장, 페이지 전환 시 부드러운 트랜지션(transition-all duration-200)과 애니메이션을 적극 활용하여 앱이 "살아있는 느낌"을 주도록 하세요.
3. **타이포그래피 및 여백 (Typography & Spacing)**: 가독성이 UI의 생명입니다. 행간(leading), 자간(tracking), 여백(margin/padding)의 리듬감을 수학적으로 계산하여 화면의 여백을 우아하게 관리하세요.
4. **접근성과 다크모드**: 색상 대비(Contrast Ratio)를 검증하고, 모든 컴포넌트가 다크모드(dark: prefix)에서도 완벽하게 아름답도록 설계하세요.

## 🛠️ 실행 지침 (AI Prompt)
- UI를 구현할 때 단순한 "작동하는 수준"에 만족하지 마세요. "Glassmorphism", "부드러운 그라데이션", "입체적인 그림자(Shadows)" 등을 사용하여 퀄리티를 극한으로 끌어올리세요.
- shadcn/ui나 Radix UI 등의 Headless UI를 사용할 경우, 프로젝트의 메인 테마에 맞춰 디자인을 세련되게 덮어씌우세요(Override).

## 💡 필수 자가 검토 (Self-Review)
- [ ] 데스크톱, 태블릿, 모바일 뷰(Responsive)에서 모두 레이아웃이 깨지지 않는가?
- [ ] 포커스(focus-visible) 상태가 명확히 보여서 키보드 탐색이 가능한가?
- [ ] 빈 상태(Empty State)나 로딩 스켈레톤(Skeleton) UI가 매끄럽게 디자인되었는가?
`,

  testing: (name) => `---
name: "${name}"
description: "테스트, 품질 보증(QA) 및 보안 검증을 위한 무결성 가이드라인"
tags:
  - testing
  - qa
  - security
---

# 🚀 ${name} 품질/보안 가이드라인

## 🎯 스킬 목적
이 스킬은 **${name}** 관련 테스트 코드 작성, 보안 감사, CI/CD 구축 시 버그 발생 확률을 0%에 수렴시키고 해킹 공격으로부터 시스템을 방어하기 위한 지침입니다.

## 📋 핵심 아키텍처 원칙 (Testing & Security)
1. **TDD 및 테스트 커버리지**: 비즈니스 핵심 로직과 유틸리티 함수에 대해 우선적으로 단위 테스트(Unit Test)를 작성하세요. (Jest, Vitest 활용)
2. **E2E 테스트 (Playwright/Cypress)**: 사용자의 핵심 흐름(회원가입, 결제 등)은 브라우저 렌더링 레벨에서 철저히 E2E 테스트를 작성하여 회귀 버그(Regression)를 방어하세요.
3. **OWASP Top 10 방어**: SQL Injection, XSS, CSRF 공격을 방지하기 위한 보안 처리(Sanitization, CSRF Token, Secure Cookie 등)를 코드 레벨에서 강제하세요.
4. **정적 분석 (Static Analysis)**: ESLint, Prettier, TypeScript의 strict 모드를 활성화하여 컴파일/빌드 타임에 에러를 최대한 잡아내세요.

## 🛠️ 실행 지침 (AI Prompt)
- 새로운 기능을 추가한 후 "테스트 코드를 작성하라"는 명령이 없어도 스스로 어떤 테스트가 필요한지 사용자에게 제안하세요.
- 비밀번호 등 민감 정보는 절대로 평문으로 저장하거나 로그(console.log)에 남기지 말고 철저히 마스킹/해싱 처리하세요.

## 💡 필수 자가 검토 (Self-Review)
- [ ] 엣지 케이스(Edge case - null, undefined, 빈 배열, 아주 큰 값 등)에 대한 테스트가 포함되었는가?
- [ ] 입력 폼(Form)에서 발생할 수 있는 악의적인 스크립트 주입(XSS)을 방어했는가?
- [ ] API Rate Limiting이나 인증 재시도 공격(Brute Force)에 대한 방어 로직이 있는가?
`
};

function getTemplateKey(categoryId) {
  if (!categoryId) return 'frontend';
  if (categoryId.includes('react') || categoryId.includes('development')) return 'frontend';
  if (categoryId.includes('backend') || categoryId.includes('ts')) return 'backend';
  if (categoryId.includes('db') || categoryId.includes('supabase')) return 'database';
  if (categoryId.includes('design') || categoryId.includes('ui')) return 'design';
  if (categoryId.includes('test') || categoryId.includes('qa') || categoryId.includes('security') || categoryId.includes('quality')) return 'testing';
  return 'frontend';
}

let updatedCount = 0;

data.skills = data.skills.map(skill => {
  // Check if it's one of the generic ones
  if (skill.skillContent && skill.skillContent.includes('이 스킬은 웹에이전시급 SaaS 프로젝트에서')) {
    const templateKey = getTemplateKey(skill.categoryId);
    const generator = templates[templateKey];
    skill.skillContent = generator(skill.name);
    updatedCount++;
    console.log(`Upgraded [${templateKey}] : ${skill.name}`);
  }
  return skill;
});

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log(`\nSuccessfully upgraded ${updatedCount} generic skills to Expert Level!`);
