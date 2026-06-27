# Antigravity AI Handover Context

## 최근 작업 내역 요약 (Last Updated: 2026-06-24)

### 🚨 긴급 복구 작업: 마켓플레이스 (Vanilla JS -> React -> 복구)
1. **문제 발생**: 기존 Vanilla JS 기반의 마켓플레이스(스킬 변환기, 번역기 포함)를 React 컴포넌트로 마이그레이션 하려는 시도가 있었으나, 기존 코드의 방대한 DOM 제어 로직과 의존성을 모두 포팅하지 못해 기능이 유실됨.
2. **복구 조치**:
   - `0d29229` 및 `3d023fb` 커밋을 추적하여 **가장 완성된 Vanilla JS 상태**의 `index.html`과 `src/main.js`를 각각 `marketplace.html`과 `src/main_legacy.js`로 분리하여 복구함.
   - 유실되었던 2,394개의 스킬 데이터베이스(`skill-registry.json`)를 10MB 크기 원본으로 다시 복원함.
3. **Vite MPA(Multi-page App) 통합**:
   - `vite.config.js`를 수정하여 `/` 경로는 최신 React 앱(랜딩/대시보드)으로, `/marketplace.html` 경로는 기존 Vanilla JS 레거시 앱으로 빌드되도록 설정함.
   - Vercel의 `cleanUrls` 기능 때문에 발생한 라우팅 오류 및 404 문제를 해결하기 위해 `vercel.json`에서 `cleanUrls: false`로 설정하고 명시적 라우팅을 추가함.
4. **마지막 확인 사항**:
   - Vercel 배포 완료 및 DOM ID 매칭(`Missing IDs: []`)까지 모두 확인하여 코드상 문제는 해결됨.
   - 단, 사용자 브라우저의 강력한 캐시(Cache)로 인해 Vercel 상에서 즉시 확인되지 않는 현상이 있었음.

### 💡 다른 PC/노트북에서 이어서 작업하실 다음 AI 에이전트에게:
- 사용자가 "마켓플레이스가 안 나온다"고 할 경우, 코드 자체의 에러(JS/HTML)가 아니라 **브라우저 캐시**나 **로컬 개발 서버(Vite Dev Server)의 SPA 폴백 설정** 때문일 가능성이 큽니다.
- **절대 `main_legacy.js`를 React 컴포넌트로 섣불리 바꾸려 하지 마세요.** 방대한 DOM 이벤트 리스너가 포함되어 있어 Multi-page 형태로 유지해야 합니다.
- 사용자가 `git pull`을 통해 최신 코드를 받았는지 먼저 확인해주세요.