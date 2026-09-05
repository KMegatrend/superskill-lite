---
name: "hallmark"
description: "Anti-AI-slop design skill for greenfield pages, audits, redesigns, and design extraction from URLs or screenshots. Use when the user asks to build a new app or landing page, wants to redesign something, invokes Hallmark by name, or uses audit/redesign/study."
version: 1.1.0
---

# Hallmark (안티-AI-Slop 디자인 아키텍트)

AI 코딩 어시스턴트가 생성하는 결과물이 "AI가 찍어낸 듯한(AI-generated)" 느낌을 벗어나 사람이 직접 심미안으로 빚어낸 것처럼 보이도록 제어하는 엄격한 디자인 스킬입니다.

---

## ⚡ 4대 실행 모드 (Verbs)

| Invocation | What it does |
| --- | --- |
| *(기본 모드)* | 새로운 앱이나 랜딩페이지 제작 요청 시 실행. 21가지 카탈로그 테마 또는 커스텀 테마를 적용하고 매크로 레이아웃을 기획하여 개발. |
| `hallmark audit <target>` | 대상 코드의 시각적 위계, 반응형, 여백, 안티패턴을 57개 관문 기준으로 점수화하고 개선 목록 리포트만 출력 (**코드 수정 없음**). |
| `hallmark redesign <target>` | 기존 라우팅 구조, 컴포넌트 소유권, 비즈니스 로직은 유지하면서 **시각적 레이아웃과 인터랙션 레이어만 전면 재설계**. |
| `hallmark study <screenshot | URL>` | 레퍼런스 웹페이지나 이미지에서 디자인 DNA(타이포그래피, 컬러, 리듬)를 추출하여 `design.md`로 정리. |

---

## 🛡️ 6대 절대 원칙 (Universal Disciplines)

1. **사전 자가 평가 (Pre-emit self-critique)**: 결과물 출력 전 6개 축(철학, 위계, 실행, 구체성, 절제, 다양성)을 1~5점으로 채점하여 3점 미만 시 재작업.
2. **정직한 카피 (Honest copy — no fabricated content)**: 허위 통계(+47% 전환율 등), 가짜 로고, 조작된 고객 리뷰 금지. 미확인 수치는 대시(`—`) 처리.
3. **토큰 잠금 (Locked tokens)**: 임의의 인라인 헥사코드나 폰트 사용 금지. 반드시 사전에 정의된 `tokens.css`의 CSS 변수 참조.
4. **가짜 브라우저 창 금지 (No re-drawn chrome)**: 신호등 점 3개 달린 가짜 브라우저 창이나 모바일 프레임 모조 제작 금지.
5. **모바일 4대 해상도 완벽 대응**: `320px`, `375px`, `414px`, `768px` 가로 스크롤 방지 및 버튼 텍스트 줄바꿈 방지.
6. **제목 이탤릭 금지 (Typography purity — no italic headers)**: 제목이나 헤딩에 이탤릭(`<em>`, `font-style: italic`) 태그 사용 금지.

---

## 🧩 컴포넌트 8대 필수 인터랙션 상태
단일 컴포넌트 작업 시 다음 8개 상태를 100% 빠짐없이 구현하고, 한눈에 확인할 수 있는 독립형 `.preview.html` 파일을 함께 제공합니다:
- `default`, `hover`, `:focus-visible`, `:active`, `disabled`, `loading`, `error`, `success`
