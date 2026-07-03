---
name: "tailwind-expert"
description: "UI/UX 및 디자인 시스템 마스터를 위한 시각적 완벽주의 가이드라인"
tags:
  - ui
  - ux
  - design
---

# 🚀 tailwind-expert 디자인 가이드라인

## 🎯 스킬 목적
이 스킬은 **tailwind-expert** 관련 디자인 시스템, CSS 마크업, UI 컴포넌트 작업을 할 때 사용자가 한눈에 "Wow!" 할 수 있는 에이전시급 하이엔드 퀄리티를 만들어내기 위한 지침입니다.

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
