import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.join(__dirname, '../public/data/skill-registry.json');

const rawData = fs.readFileSync(REGISTRY_PATH, 'utf-8');
const registry = JSON.parse(rawData);

const categories = registry.categories.filter(c => c.id !== 'all');

const prefixes = ['고급', '스마트', 'AI', '자동화', '프로', '다이내믹', '매직', '수퍼', '울트라', '마스터'];
const nouns = {
  '01-development': ['리팩토링', '코드 리뷰어', '디버깅', '최적화', '보일러플레이트', '알고리즘', '아키텍처', 'API 생성기', 'DB 스키마', '타입스크립트'],
  '02-security': ['취약점 점검', '침투 테스트', '암호화', '토큰 검증', '방화벽 룰', 'XSS 방어', 'SQL 인젝션 탐지', '권한 관리', '보안 감사', '데이터 보호'],
  '03-test-qa': ['유닛 테스트', 'E2E 테스트', '통합 테스트', '모의 데이터 생성', '테스트 커버리지', '성능 부하', '스트레스 테스트', 'QA 봇', '버그 리포터', '자동화 스크립트'],
  '04-docs': ['README 생성', 'API 문서화', '주석 작성기', '테크 블로그', '릴리즈 노트', '사용자 매뉴얼', '튜토리얼', '위키 작성', '마크다운 변환', 'PDF 내보내기'],
  '05-design-ui': ['UI 컴포넌트', '디자인 시스템', '퍼블리싱', '접근성(a11y) 검사', 'CSS 최적화', '테마 제너레이터', 'SVG 애니메이션', '반응형 레이아웃', '글래스모피즘', '다크모드 변환'],
  '06-devops': ['CI/CD 파이프라인', '도커파일', '쿠버네티스 매니페스트', '배포 자동화', '서버 모니터링', '로그 분석기', 'AWS 인프라', '테라폼 작성', '깃 훅(Git hook)', '백업 자동화'],
  '07-business': ['비즈니스 이메일', '마케팅 카피', 'SEO 최적화', '시장 조사', '데이터 시각화', '기획서 작성', '제안서 템플릿', '고객 응대 봇', '소셜 미디어 분석', '트렌드 리포트']
};

const suffixes = ['도우미', '엔진', '스킬', '플러그인', '봇', '마법사', '툴', '어시스턴트', '패키지', '모듈'];

let mockCount = 0;

categories.forEach(cat => {
  // 현재 카테고리에 있는 스킬 수 확인
  const existingCount = registry.skills.filter(s => s.categoryId === cat.id).length;
  const needed = 20 - existingCount;

  for (let i = 0; i < needed; i++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const nounList = nouns[cat.id];
    const noun = nounList[Math.floor(Math.random() * nounList.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    const skillName = `${prefix} ${noun} ${suffix}`;
    const id = `mock-${cat.id}-${Date.now()}-${i}`;
    
    registry.skills.push({
      id: id,
      categoryId: cat.id,
      name: skillName,
      nameEn: `Mock ${skillName}`,
      description: `이 스킬은 Antigravity IDE에서 ${noun} 작업을 획기적으로 향상시켜주는 ${skillName}입니다. 빠르고 정확한 처리를 지원합니다.`,
      descriptionEn: `This is a mock skill for ${noun}.`,
      author: 'antigravity-community',
      version: `1.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
      tags: [noun.replace(/\s+/g, ''), cat.name.split('/')[0]],
      downloads: Math.floor(Math.random() * 95000) + 5000, // 5000 ~ 100000
      rating: Number((Math.random() * 1.0 + 4.0).toFixed(1)),
      skillContent: `---\nname: "${skillName}"\ndescription: "${noun} 도우미"\n---\n\n# ${skillName}\n이것은 시연을 위해 자동 생성된 목업 스킬 데이터입니다.`,
      sourceUrl: ''
    });
    mockCount++;
  }
});

// 전체 스킬을 다운로드 순으로 내림차순 정렬
registry.skills.sort((a, b) => b.downloads - a.downloads);

fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
console.log(`✅ ${mockCount}개의 목업 스킬이 추가되었으며 다운로드 순으로 정렬되었습니다.`);
