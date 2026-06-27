const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'public', 'data', 'skill-registry.json');
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

let updatedCount = 0;

data.skills = data.skills.map(skill => {
  // SaaS 카테고리이면서 github.com/search 링크인 경우(즉, 임시 스킬)
  if (skill.categoryId && skill.categoryId.startsWith('saas-') && skill.sourceUrl && skill.sourceUrl.includes('github.com/search')) {
    
    // 기본 SKILL.md 컨텐츠 생성
    const skillContent = `---
name: "${skill.nameEn || skill.name}"
description: "${skill.description}"
tags:
  - saas
  - ${skill.categoryId.replace('saas-', '')}
---

# ${skill.name}

## 🎯 스킬 개요
이 스킬은 웹에이전시급 SaaS 프로젝트에서 **${skill.name}** 관련 태스크를 수행할 때 Claude가 반드시 참고해야 할 표준 가이드라인과 베스트 프랙티스를 정의합니다.

## 📋 핵심 원칙
1. **최적화 및 성능**: 불필요한 연산을 줄이고 확장 가능한 구조로 코드를 작성합니다.
2. **보안성 (Security-First)**: 사용자 데이터와 권한을 안전하게 다룹니다.
3. **유지보수성**: 가독성이 높고 모듈화된 패턴을 사용합니다.
4. **최신 스택 활용**: Next.js, Tailwind, Supabase, Stripe 등의 권장 API와 패턴을 준수합니다.

## 🚀 실행 지침 (Claude Code)
- \`${skill.nameEn || skill.name}\` 관련된 파일(컴포넌트, API, DB 스키마 등)을 수정할 때 이 규칙들을 최우선으로 적용하세요.
- 코드 작성 후 스스로 검토(Self-review) 단계를 거쳐 잠재적인 취약점이나 성능 저하 요소가 없는지 확인하세요.
- 불명확한 요구사항이 있다면 개발자에게 명확한 가이드를 요청하세요.

## 💡 사용 예시
- "새로운 ${skill.name} 기능을 구현해줘"
- "현재 코드에서 ${skill.name} 관련 문제점을 찾고 개선해줘"`;

    skill.skillContent = skillContent;
    // sourceUrl을 빈 문자열로 변경하면 'GitHub 검색' 버튼 대신 '설치하기' 버튼이 표시됨
    skill.sourceUrl = '';
    
    updatedCount++;
  }
  return skill;
});

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log(`Successfully converted ${updatedCount} SaaS placeholder skills to real downloadable skills!`);
