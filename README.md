# AI Super Skill 

전문가의 AI 스킬을 한 번의 클릭으로 장착할 수 있도록 돕는 서비스의 공식 랜딩 페이지 (Webzine) 플랫폼입니다.
이 프로젝트는 유지보수성과 확장성을 위해 **React + Vite + Tailwind CSS** 기반의 모던 스택으로 재구축되었습니다.

## 🚀 주요 기능 (Features)
*   **컴포넌트 기반 아키텍처**: UI가 기능별로 분리되어 있어 수정 및 확장이 용이합니다.
*   **완벽한 데이터 분리**: 텍스트 데이터(`landingData.js`)와 UI 코드가 완전히 분리되어 있어 마케터/기획자도 코드를 망가뜨리지 않고 쉽게 텍스트를 수정할 수 있습니다.
*   **Tailwind CSS 유틸리티**: 빠르고 일관성 있는 스타일링 관리가 가능하며 인라인 스타일의 부작용을 제거했습니다.

## 📦 시작하기 (Getting Started)

### 요구 사항
*   Node.js (v18 이상 권장)

### 설치 및 실행
```bash
# 1. 의존성 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev

# 3. 브라우저에서 접속 (기본: http://localhost:3000)
```

## 🛠️ 콘텐츠 업데이트 가이드 (유지보수 방법)

자세한 화면 문구 수정 및 FAQ 추가 방법은 `MAINTENANCE_GUIDE.md`를 참고해 주세요.

## 📁 프로젝트 구조 (Folder Structure)

```text
src/
├── components/          # React UI 컴포넌트 모음
│   ├── App.jsx          # 전체 레이아웃 조합
│   ├── Header.jsx       # 상단 내비게이션
│   ├── Hero.jsx         # 메인 캐치프레이즈 영역
│   ├── Showcase.jsx     # 스킬 팩 안내 섹션 (지그재그)
│   └── FAQ.jsx          # 자주 묻는 질문 섹션
├── data/
│   └── landingData.js   # 화면에 출력될 텍스트 데이터 저장소 (FAQ, 스킬 설명 등)
├── index.css            # Tailwind CSS 진입점 및 커스텀 애니메이션
└── main.jsx             # React 애플리케이션 진입점
```

---
*Built with AI Super Skill • Just Build It.*