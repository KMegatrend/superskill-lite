# 🚀 SuperSkill - 작업 인계 및 핸드오프 (Handoff)

> **안내:** 본 문서는 기기 변경(사무실 ↔ 집 노트북/PC) 시 작업 내역과 논의 사항을 원활하게 이어가기 위해 작성되었습니다.
> 집에 도착하셔서 새로운 대화를 시작할 때 `"작업하자"` 또는 `"노트북으로 왔어"`라고 말씀해 주시면, 규칙 3번에 따라 자동으로 `git pull`을 받고 로컬 서버를 구동하여 즉시 이어서 시작합니다.

---

## 🗂️ 전체 문서 보관함 및 색인 (Index)
문서가 많아져도 헷갈리지 않도록 **[회차 번호 + 날짜]** 순으로 정리되어 있습니다. 전체 목록은 [docs/README.md](docs/README.md)에서 확인하실 수 있습니다.

* **최신 문서 바로가기 👉**: [docs/history/006_2026-09-11_ChatGPT_원클릭_프롬프트_및_GPTs_내보내기_구현.md](docs/history/006_2026-09-11_ChatGPT_원클릭_프롬프트_및_GPTs_내보내기_구현.md)
* **이전 문서 👉**: [docs/history/005_2026-09-08_슈퍼스킬_패키지매니저_전면전환_및_랜딩페이지_리브랜딩.md](docs/history/005_2026-09-08_슈퍼스킬_패키지매니저_전면전환_및_랜딩페이지_리브랜딩.md)
* **스킬 등록 문서 👉**: [docs/history/003_2026-09-07_중요문서3종_마켓플레이스_스킬_적용.md](docs/history/003_2026-09-07_중요문서3종_마켓플레이스_스킬_적용.md)

---

## 📅 [최신 회차 #006 요약] 3대 웹 AI(ChatGPT·Claude·Gemini) 원클릭 프롬프트 & GPTs 맞춤지침 내보내기 완성

### 1. 3대 웹 AI 맞춤 프롬프트 엔진 구축
- **프롬프트 조립기 (`src/core/installer.js`)**:
  - `generateChatGptMasterPrompt`: ChatGPT CoT 및 마스터 프롬프트 조립.
  - `generateClaudeMasterPrompt`: Claude 3.5/3.7 Sonnet 맞춤형 XML/Artifacts 가이드라인 탑재.
  - `generateGeminiMasterPrompt`: Google Gemini 200만 토큰 대용량 컨텍스트 및 마크다운 구조화 프롬프트 조립.
  - `generateGptsInstructions`: OpenAI Custom GPTs 맞춤지침(Instructions) 전용 포맷 생성.
  - 원클릭 복사 후 각 사 공식 대화창(`chatgpt.com`, `claude.ai/new`, `gemini.google.com/app`) 자동 열기 모달 연동.

### 2. 마켓플레이스 상세 뷰 및 설치 모달 전면 개편
- **상세 뷰 헤더 액션**: `🤖 ChatGPT`, `🧠 Claude`, `✨ Gemini`, `⚡ 개발툴(IDE)`, `📦 ZIP` 5대 액션 버튼 정렬.
- **전용 퀵 러너 배너**: `ChatGPT로 실행`, `Claude로 실행`, `Gemini로 실행`, `🧩 GPTs 맞춤지침` 4개 브랜드 버튼 신설.
- **설치 모달 프리셋**: `ChatGPT`, `Claude`, `Gemini`, `GPTs`, `전체 원문 복사` 카드형 구분 제공.

### 3. 브라우저 E2E 검증 통과
- 브라우저 서브에이전트 실사용 테스트를 통해 Claude 맞춤 프롬프트 복사/모달, Gemini 맞춤 프롬프트 복사/모달, 설치 모달 내 3대 AI 프리셋 100% 정상 작동 검증.

---

## 🎯 다음 진행할 작업 (Next Action Items)

1. **로컬 확인 및 온라인 배포 (Git Push 승인 대기)**
   - 로컬 환경(`http://localhost:3000/marketplace.html`)에서 ChatGPT 즉시 실행 및 GPTs 지침 복사 기능을 확인하신 후 `git push` 승인.
2. **회원페이지(스킬 변환기, 스킬 번역기) 고도화 및 UI 통일**
3. **도메인 연결 및 npm 공식 패키지 퍼블리싱 준비**
