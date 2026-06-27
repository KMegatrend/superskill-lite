import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REGISTRY_PATH = path.join(__dirname, '../public/data/skill-registry.json');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 대상 저장소: PatrickJS/awesome-cursorrules (전 세계 가장 큰 Cursor Rules 저장소 중 하나)
const TARGET_REPO = 'PatrickJS/awesome-cursorrules';
const FETCH_LIMIT = 30; // 데모/테스트용으로 상위 30개만 가져옵니다.

// 미리 정의된 카테고리 목록
const categories = [
  { id: 'all', name: '전체보기' },
  { id: '01-development', name: '개발/엔지니어링' },
  { id: '02-security', name: '보안' },
  { id: '03-test-qa', name: '테스트/QA' },
  { id: '04-docs', name: '문서화' },
  { id: '05-design', name: '디자인/UI' },
  { id: '06-devops', name: 'Git/DevOps' },
  { id: '07-business', name: '비즈니스' }
];

// GitHub API Fetcher
async function fetchGithub(url) {
  const headers = { 'User-Agent': 'Antigravity-Skill-Crawler' };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Gemini 번역기 및 분류기
async function translateAndCategorize(skillName, content) {
  if (!GEMINI_API_KEY) {
    return {
      name: skillName,
      description: "No description available (Gemini API key missing)",
      categoryId: "01-development",
      tags: [skillName.toLowerCase()]
    };
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
당신은 개발자 스킬(프롬프트) 분석가입니다.
주어진 스킬(프롬프트) 파일의 내용을 분석하고, 한국어로 된 제목, 설명, 적절한 카테고리, 태그를 JSON 포맷으로 반환하세요.

[카테고리 ID 목록]
01-development, 02-security, 03-test-qa, 04-docs, 05-design, 06-devops, 07-business

[스킬 파일 원문]
이름: ${skillName}
내용:
${content.substring(0, 1000)} // (최대 1000자까지만 제공)

[출력 형식 - 순수 JSON만 출력하세요]
{
  "name": "한국어 번역된 스킬 제목 (최대 30자)",
  "description": "스킬이 어떤 역할을 하는지 한국어로 요약 설명 (최대 80자)",
  "categoryId": "위 카테고리 ID 목록 중 가장 적합한 1개",
  "tags": ["영문태그1", "영문태그2", "영문태그3"]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error(`  ⚠️ AI 분석 실패 (${skillName}):`, err.message);
    return {
      name: skillName,
      description: "AI 분석 실패",
      categoryId: "01-development",
      tags: ["error"]
    };
  }
}

// 메인 크롤링 함수
async function buildRegistry() {
  console.log(`🚀 리얼 데이터 파이프라인 시작... (대상: ${TARGET_REPO})`);
  
  try {
    // 1. 저장소의 rules 디렉토리 목록 가져오기
    console.log(`📡 GitHub API에서 규칙 목록 가져오는 중...`);
    const contents = await fetchGithub(`https://api.github.com/repos/${TARGET_REPO}/contents/rules`);
    
    // 파일 형태(.mdc 등) 필터링
    const rules = contents.filter(item => item.type === 'file' && item.name.endsWith('.mdc')).slice(0, FETCH_LIMIT);
    console.log(`✅ ${rules.length}개의 규칙 파일을 찾았습니다. 분석 및 번역을 시작합니다...\n`);

    const skillsData = [];
    
    // 2. 각 규칙 파일 내용 가져오기 및 AI 번역
    for (let i = 0; i < rules.length; i++) {
      const ruleFile = rules[i];
      const skillId = ruleFile.name.replace('.mdc', '');
      console.log(`[${i+1}/${rules.length}] 처리 중: ${skillId}`);

      try {
        const fileData = await fetchGithub(`https://api.github.com/repos/${TARGET_REPO}/contents/rules/${ruleFile.name}`);
        const fileContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
        
        // AI 번역 및 메타데이터 추출
        const aiMetadata = await translateAndCategorize(skillId, fileContent);
        
        // 트렌딩 스코어 계산 (데모용: 랜덤 인기도 부여 + 최신성(가짜))
        // 실제 운영 시에는 GitHub API의 커밋 날짜나 Star 수를 가져와야 함.
        const fakeStars = Math.floor(Math.random() * 5000);
        const ageHours = Math.floor(Math.random() * 100);
        const trendingScore = fakeStars / Math.pow(ageHours + 2, 1.5);

        const skillObj = {
          id: skillId,
          categoryId: aiMetadata.categoryId,
          name: aiMetadata.name,
          nameEn: skillId,
          description: aiMetadata.description,
          descriptionEn: "Fetched from PatrickJS/awesome-cursorrules",
          author: "community",
          version: "1.0.0",
          tags: aiMetadata.tags,
          downloads: fakeStars * 10,
          rating: (4.0 + Math.random()).toFixed(1),
          skillContent: fileContent,
          sourceUrl: `https://github.com/${TARGET_REPO}/blob/main/rules/${ruleFile.name}`,
          trendingScore: trendingScore,
          createdAt: new Date(Date.now() - ageHours * 3600000).toISOString()
        };

        skillsData.push(skillObj);
      } catch (err) {
        console.error(`  ❌ 실패 (${skillId}):`, err.message);
      }
      
      // API Rate Limit 방지를 위해 1초 대기 (특히 Gemini API 제한 고려)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 3. 트렌딩 스코어 기준으로 정렬
    skillsData.sort((a, b) => b.trendingScore - a.trendingScore);

    // 4. JSON 파일 저장
    const registry = {
      lastUpdated: new Date().toISOString(),
      source: TARGET_REPO,
      categories: categories,
      skills: skillsData
    };

    // public 디렉토리가 없으면 생성
    const publicDir = path.dirname(REGISTRY_PATH);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
    console.log(`\n🎉 성공적으로 ${skillsData.length}개의 스킬을 수집하고 AI 번역을 완료했습니다!`);
    console.log(`💾 저장 위치: ${REGISTRY_PATH}`);

  } catch (error) {
    console.error('❌ 스크립트 실행 실패:', error);
  }
}

buildRegistry();
