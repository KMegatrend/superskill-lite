export const faqs = [
  {
    id: 1,
    question: "AI Super Skill이란 정확히 무엇인가요?",
    answer: "AI에게 일일이 어떻게 해달라고 길게 설명할 필요 없이, 전문가가 미리 세팅해 둔 '업무 지시서(프롬프트)'를 클릭 한 번으로 AI에게 장착시키는 마법 같은 기능입니다."
  },
  {
    id: 2,
    question: "코딩을 전혀 모르는 왕초보도 사용할 수 있나요?",
    answer: "네, 물론입니다! 복잡한 전문 용어를 몰라도 '초보자 가이드 스킬'이나 '기획 팩' 등을 켜기만 하면, AI가 친절하게 질문을 던지며 아이디어를 앱이나 웹사이트로 만들어줍니다."
  },
  {
    id: 3,
    question: "스킬을 사용하면 무엇이 좋은가요? (어떤 점이 편해지나요?)",
    answer: "기존에는 AI에게 원하는 결과를 얻기 위해 수십 번 대화하며 시행착오를 겪어야 했습니다. 스킬을 사용하면 이 과정이 단 3번의 클릭으로 단축되며, 최고 전문가의 노하우가 담겨 있어 결과물의 품질이 압도적으로 높아집니다."
  },
  {
    id: 4,
    question: "여러 개의 스킬을 동시에 섞어서 사용할 수도 있나요?",
    answer: "네, 가능합니다. 예를 들어 'UI 디자이너 스킬'과 '클린 코드 스킬'을 함께 활성화하면, 디자인도 예쁘면서 내부 코드도 깔끔한 엔터프라이즈급 결과물을 한 번에 얻을 수 있습니다."
  },
  {
    id: 5,
    question: "스킬을 설치하면 제 소스코드가 유출되거나 해킹당할 위험은 없나요?",
    answer: "Antigravity의 공식 인증(Verified) 스킬은 자체 보안 검수를 통과한 안전한 프롬프트만을 제공합니다. 악의적인 코드 주입(프롬프트 인젝션) 방어가 완벽히 되어 있으니 안심하고 사용하세요."
  },
  {
    id: 6,
    question: "제가 직접 나만의 스킬을 만들어서 쓸 수도 있나요?",
    answer: "네, 물론입니다! 평소 자주 사용하는 나만의 업무 지시사항 패턴이 있다면, 이를 '커스텀 스킬'로 간편하게 등록하여 팀원들과 공유하거나 나만의 무기로 활용할 수 있습니다."
  },
  {
    id: 7,
    question: "새로운 스킬이나 콘텐츠는 주기적으로 업데이트 되나요?",
    answer: "네! AI 전문가와 실무진들이 직접 써보고 100% 효과를 검증한 최고의 스킬들만 엄선하여 매일 '오늘의 스킬' 뉴스 피드로 신선하게 배달해 드립니다."
  },
  {
    id: 8,
    question: "서비스 이용 비용은 어떻게 되나요? 유료인가요?",
    answer: "기본적으로 꼭 필요한 에센셜 스킬과 필수 기능들은 모두 무료로 제공됩니다. 특정 전문 분야에 특화된 프리미엄 스킬 팩만 선택적으로 구독하실 수 있도록 운영됩니다."
  },
  {
    id: 9,
    question: "윈도우와 맥(Mac) 환경에서 모두 사용 가능한가요?",
    answer: "네, 웹 브라우저 기반으로 동작하며 기존 IDE(개발 도구) 내부 확장 프로그램으로도 완벽히 지원하므로 OS에 상관없이 어디서나 동일하게 이용하실 수 있습니다."
  },
  {
    id: 10,
    question: "사용 중 막히거나 모르는 부분이 생기면 어디에 문의하나요?",
    answer: "하단의 '의견 남기기' 버튼을 눌러 질문하시거나, 공식 커뮤니티(Discord/슬랙)에 오시면 개발팀과 수많은 사용자 멤버들로부터 빠르고 친절한 도움을 받을 수 있습니다."
  }
];

export const packFeatures = [
  {
    id: 'designer',
    badgeText: '🎨 Designer Pack',
    badgeColor: 'text-purple-700',
    badgeBg: 'bg-purple-100',
    title: '전문가급 UI/UX 디자인',
    description: "ui-ux-pro-max, canvas-design 스킬을 통해 단순한 와이어프레임을 모던하고 매력적인 인터페이스로 변환합니다.",
    features: [
      'Glassmorphism & Gradient 효과',
      '반응형 모바일 우선 설계',
      '사용자 경험(UX) 최적화 로직'
    ],
    imageMock: 'designer'
  },
  {
    id: 'wizard',
    badgeText: '⚡ Web Wizard Pack',
    badgeColor: 'text-blue-700',
    badgeBg: 'bg-blue-100',
    title: '클린 코드 & 최신 기술 스택',
    description: "react-patterns, tailwind-patterns 스킬이 스파게티 코드를 방지하고, 유지보수 가능한 엔터프라이즈급 코드를 작성합니다.",
    features: [
      'React Best Practices (Custom Hooks 등)',
      'SEO & Accessibility 최적화',
      'Tailwind CSS 유틸리티 적극 활용'
    ],
    imageMock: 'wizard'
  },
  {
    id: 'pm',
    badgeText: '📊 Product Manager Pack',
    badgeColor: 'text-green-700',
    badgeBg: 'bg-green-100',
    title: '완벽한 기획 & 로직 설계',
    description: "pm-master, logic-architect 스킬을 통해 모호한 아이디어를 구체적인 PRD(제품 요구사항 정의서)와 비즈니스 로직으로 구조화합니다.",
    features: [
      'User Journey & 페르소나 분석',
      '데이터베이스 스키마 설계',
      '엣지 케이스 및 예외 처리 가이드'
    ],
    imageMock: 'pm'
  }
];
