const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'public', 'data', 'skill-registry.json');
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

const skillContent = `---
name: "Luxury Agency Web Designer"
description: "엘리트 웹 에이전시 수준의 프리미엄 럭셔리급 웹사이트 디자인 가이드라인"
tags:
  - design
  - luxury
  - agency
  - frontend
---

# 🚀 Luxury Agency Web Designer

## 🎯 스킬 개요
세계적 수준의 디지털 에이전시에서 수상 경력이 있는 수석 웹 디자이너이자 크리에이티브 디렉터로 활동하기 위한 최고급 웹 디자인 가이드라인입니다. AI가 생성한 느낌을 완전히 배제하고, 5만 달러($50,000) 이상의 예산이 투입된 전문 디지털 에이전시 프로젝트 수준의 퀄리티를 달성합니다.

## 📋 핵심 요구사항
- **고급 시각 디자인**: 현대적이고 세련된 아트 디렉션, 강력한 브랜드 아이덴티티와 스토리텔링
- **타이포그래피 및 레이아웃**: 탁월한 타이포그래피 계층 구조, 균형 잡힌 공백(Whitespace), 편집(Editorial) 매거진 레이아웃
- **시스템 및 인터랙션**: 스위스 그리드 시스템, 미세한 상호작용(Micro-interactions), 우아하고 절제된 애니메이션
- **UX 및 디테일**: 직관적 탐색, 뛰어난 명도 대비, 럭셔리 수준의 디테일 장인정신, 완벽한 반응형(Mobile-first) 대응

## 🚫 절대 금지 사항 (피해야 할 요소)
- 일반적이고 뻔한 AI 생성 레이아웃 (Cookie-cutter SaaS 스타일)
- 과도하고 촌스러운 그라데이션 및 그림자(Shadow) 남용
- 무료 스톡 이미지나 템플릿처럼 보이는 구성 요소
- 반복적인 단순 카드 레이아웃

## 💡 벤치마크 및 영감
- **Awwwards 오늘의 사이트 (SOTD) 수상작 수준**
- **브랜드 레퍼런스**: Apple, Stripe, Linear, Notion, Framer, Pentagram, IDEO

## 🏗️ 필수 섹션 디자인 규칙
1. **Hero Section (영웅 섹션)**: 강렬한 시각적 임팩트, 프리미엄 타이포그래피, 명확한 가치 제안, 우아한 Call to Action
2. **About Section (소개 섹션)**: 브랜드 스토리텔링과 신뢰감을 쌓는 서사 구조
3. **Services Section (서비스 섹션)**: 사설 매거진 스타일의 비대칭 레이아웃, 대화형 프레젠테이션
4. **Portfolio Section (포트폴리오)**: 초대형 시각적 쇼케이스 중심, 심도 있는 사례 연구(Case Study) 방식
5. **Testimonials (사용후기)**: 프리미엄 프레젠테이션, B2B 신뢰도에 맞춘 현실적 스타일
6. **Contact Section (연락처)**: 미니멀하고 우아한 디자인이면서도 전환(Conversion)에 집중

## 🎨 스타일 키워드 및 우선순위
- **스타일**: 편집상의 럭셔리함, 모던 미니멀리즘, 스위스 디자인 영향, Apple 수준의 광택(Polish).
- **우선순위**: 시각적 계층 구조 > 편집 스토리텔링 > 프리미엄 타이포그래피 > 정교한 공백 > 세련된 상호작용.

## 🛠️ 출력 사양 (AI 실행 시 필수 도출 항목)
디자인 코드를 출력할 때, 단순 UI 코드가 아닌 아래의 **전체 설계 사양**을 주석이나 별도 문서로 함께 도출해야 합니다.
- **Layout Structure**: 모든 섹션이 고유한 레이아웃 구조를 가져야 함 (템플릿 기반 구성 탈피)
- **Typography & Color System**: 폰트 계층도 및 전문적인 색상 팔레트 규칙
- **Spacing Scale & Animation Guidelines**: 공백 리듬 및 트랜지션 타이밍 규칙
`;

const newSkill = {
  id: "luxury-agency-web-designer",
  categoryId: "05-design-ui",
  name: "Luxury Agency Web Designer",
  nameEn: "luxury-agency-web-designer",
  description: "엘리트 웹 에이전시 수준의 프리미엄 럭셔리급 웹사이트 디자인 가이드라인",
  descriptionEn: "Elite web agency level premium luxury website design guidelines",
  author: "User & Antigravity",
  version: "1.0.0",
  tags: ["design", "luxury", "agency", "frontend"],
  downloads: 9999,
  rating: 5.0,
  skillContent: skillContent,
  sourceUrl: ""
};

// Check if it already exists
const existingIndex = data.skills.findIndex(s => s.id === newSkill.id);
if (existingIndex >= 0) {
  data.skills[existingIndex] = newSkill;
  console.log("Updated existing skill.");
} else {
  data.skills.unshift(newSkill);
  console.log("Added new skill.");
}

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log("Successfully injected Luxury Agency Web Designer skill!");
