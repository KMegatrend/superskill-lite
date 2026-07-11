---
name: "스킬 마켓플레이스 신규 스킬 추가 (Add New Marketplace Skill)"
description: "AI Super Skill 마켓플레이스에 새로운 스킬을 추가할 때 반드시 따라야 하는 가이드라인과 절차입니다."
---

# 🚀 신규 스킬 추가 절차 (Skill Injection Protocol)

AI Super Skill 프로젝트에 새로운 스킬을 추가하라는 요청을 받으면, 반드시 다음의 절차와 규칙을 엄격하게 따라야 합니다. 

이 프로젝트는 `fill_skills.cjs` 파일이 마켓플레이스의 **"Source of Truth(진실의 원천)"** 역할을 하므로, 모든 데이터는 이 파일에 주입되어야 하며 `public/skill-registry.json`을 직접 수정해서는 안 됩니다.

## 1. 📝 스킬 소싱 및 프리미엄 카피라이팅 규칙 (Hybrid Strategy)
새로운 스킬을 창작하거나 추가할 때는 두 가지 소스를 혼합하는 **'하이브리드(Hybrid)' 전략**을 기반으로 기존 스킬들과 어울리는 강력한 톤앤매너를 유지해야 합니다.

### 💡 하이브리드(Hybrid) 소싱 전략
1. **GitHub 최신 인기 레포지토리 참조 (코딩/개발, 최상위 에이전트)**: 전 세계 천재 개발자들이 검증한 최신의 강력한 트렌드(AutoGPT, Cursorrules 등) 아키텍처를 가져와 압도적인 성능의 스킬을 제작합니다.
2. **슈퍼스킬V1 기존 데이터 활용 (기획/문서, 일상/유틸, 비즈니스)**: 한국 시장과 실무자의 입맛에 맞게 검증된 기존 유용한 스킬들에 '프리미엄 카피라이팅'과 '에이전트급 규칙'을 입혀 완전히 새로운 명품 스킬로 재탄생시킵니다.

### 카피라이팅 규칙
- **스킬 ID (키 값)**: 영문 소문자와 하이픈으로 구성 (예: `youtube-translator`)
- **제목(name)**: 이모지 1개 + 직관적이고 웅장한 명칭 (예: `🎥 유튜브 영상 다국어 자막 번역기`)
- **설명(description)**: 스킬의 효용성을 전문가 느낌으로 매력적으로 어필
- **카테고리(category)**: 기존 카테고리 중 택 1 (`coding`, `design`, `business`, `docs`, `utility`)
- **배지(role)**: 사용자 타겟 명시 (예: `크리에이터 & 마케터`)
- **버전(version)**: `1.0.0` 으로 시작
- **난이도(difficulty)**: `초급`, `중급`, `고급` 중 택 1

## 2. 🛠️ 프롬프트 및 마크다운 주입 시 주의사항 (Critical)
프롬프트 내용(Instruction)은 JavaScript 템플릿 리터럴(백틱 `` ` ``)을 사용하여 `fill_skills.cjs` 내부에 주입됩니다.
따라서 마크다운 문서 내부에 코드 블록이나 강조를 위해 **백틱을 사용할 경우 반드시 역슬래시로 이스케이프(\`)** 처리해야 합니다.
- ❌ 잘못된 예: `코드 블록`
- ✅ 올바른 예: \`코드 블록\`
(이를 지키지 않으면 Node.js 스크립트 실행 시 100% Syntax Error가 발생합니다.)

## 3. ⚙️ 실행 파이프라인 (Execution Steps)

### Step 1. `fill_skills.cjs` 파일 수정
`fill_skills.cjs` 파일 내의 `const markdownContents = { ... }` 객체 맨 아래에 새로운 스킬 데이터를 마크다운 포맷(프론트매터 포함)으로 추가합니다.

### Step 2. 데이터베이스 동기화 스크립트 실행
터미널에서 아래 명령어를 실행하여 JSON 레지스트리 데이터를 갱신합니다.
```bash
node fill_skills.cjs
```
(명령어가 성공적으로 실행되면 `Successfully updated XX skills in public/data/skill-registry.json`이 출력됩니다.)

### Step 3. 깃허브 배포 (Git Commit & Push)
데이터가 안전하게 갱신되었다면 프로젝트의 기본 규칙(AGENTS.md)에 따라 커밋 후 푸시를 진행합니다.
```bash
git commit -am "[Auto-Backup] 신규 스킬 추가: {추가된 스킬명}"
git push
```

### Step 4. 스킬 기능 정상 작동 검증 (Functional Validation)
추가된 스킬의 핵심 프롬프트나 지시어가 AI 환경(Cursor, Windsurf, ChatGPT 등)에서 정상적으로 작동하는지 논리적/기능적 검증을 수행해야 합니다.
- 스킬 추가 시 누락된 내용이 없는지 확인하고, 필요하다면 검증관 AI를 활용해 프롬프트 품질을 점검합니다.

### Step 5. UI 디자인 검증 (사용자 요청 시에만 실행)
기본적으로 프론트엔드 UI 검증은 생략합니다. 단, 사용자가 명시적으로 "디자인/UI도 확인해줘"라고 요청한 경우에만 아래 절차를 수행합니다.
1. `npm run dev` 로컬 서버가 작동 중인지 확인합니다.
2. 내장된 `browser_subagent` 툴을 사용하여 `http://localhost:3000` 등에 접속합니다.
3. 추가된 스킬 상세 모달 스크린샷을 찍어 타이틀 줄바꿈이나 레이아웃 비율을 시각적으로 교차 검증합니다.
