import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경변수에서 API 키 읽기
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
  console.error('실행 방법 (Windows PowerShell):');
  console.error('$env:GEMINI_API_KEY="여러분의_제미나이_API_키"');
  console.error('node scripts/translate-db.js');
  process.exit(1);
}

const DB_PATH = path.join(__dirname, '../public/data/skill-registry.json');
const DELAY_MS = 2000; // API Rate Limit 방지를 위한 지연 시간 (2초)

async function translateText(text, isContent = false) {
  if (!text) return text;
  
  let prompt = `다음 텍스트를 자연스러운 한국어로 번역해 주세요. 다른 설명 없이 번역된 결과만 출력하세요:\n\n${text}`;
  
  if (isContent) {
    prompt = `다음 마크다운(Markdown) 프롬프트를 한국어로 번역해 주세요. 
규칙:
1. \${variable_name} 형태의 변수는 절대 번역하지 말고 원본 그대로 유지하세요.
2. 마크다운 문법(#, -, *, \`\`\`)과 코드 블록은 그대로 유지하세요.
3. 다른 설명 없이 번역된 결과만 출력하세요.

원본 텍스트:
${text}`;
  }
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
      })
    });
    
    const json = await response.json();
    if (json.error) throw new Error(json.error.message);
    
    return json.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('번역 API 오류:', error.message);
    return text; // 오류 시 원본 유지
  }
}

// 딜레이 함수
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  console.log('🔄 스킬 데이터베이스 번역 스크립트 시작...');
  
  let rawData;
  try {
    rawData = fs.readFileSync(DB_PATH, 'utf8');
  } catch (e) {
    console.error('❌ skill-registry.json 파일을 찾을 수 없습니다.');
    return;
  }

  const db = JSON.parse(rawData);
  let translatedCount = 0;

  console.log(`총 ${db.skills.length}개의 스킬을 검사합니다...`);

  for (let i = 0; i < db.skills.length; i++) {
    const skill = db.skills[i];
    
    // 영어 알파벳이 포함되어 있고, nameEn과 name이 똑같거나 한글이 없는 경우 번역 대상
    const needsNameTranslation = skill.name && /[a-zA-Z]/.test(skill.name) && !/[가-힣]/.test(skill.name);
    const needsDescTranslation = skill.description && /[a-zA-Z]/.test(skill.description) && !/[가-힣]/.test(skill.description);
    const needsContentTranslation = skill.skillContent && /[a-zA-Z]/.test(skill.skillContent) && !/[가-힣]/.test(skill.skillContent);

    if (needsNameTranslation || needsDescTranslation || needsContentTranslation) {
      console.log(`\n[${i + 1}/${db.skills.length}] 번역 중: ${skill.name}`);
      
      if (needsNameTranslation) {
        skill.nameEn = skill.nameEn || skill.name;
        skill.name = await translateText(skill.nameEn, false);
        console.log(`  제목: ${skill.name}`);
        await delay(DELAY_MS);
      }
      
      if (needsDescTranslation) {
        skill.descriptionEn = skill.descriptionEn || skill.description;
        skill.description = await translateText(skill.descriptionEn, false);
        console.log(`  설명: ${skill.description.substring(0, 30)}...`);
        await delay(DELAY_MS);
      }

      if (needsContentTranslation) {
        skill.skillContentEn = skill.skillContentEn || skill.skillContent;
        skill.skillContent = await translateText(skill.skillContentEn, true);
        console.log(`  본문: 프롬프트 원문 번역 완료!`);
        await delay(DELAY_MS);
      }
      
      translatedCount++;
      
      // 진행 상황 중간 저장 (만약을 대비해 매번 덮어쓰기)
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    }
  }

  console.log(`\n✅ 번역 완료! 총 ${translatedCount}개의 스킬이 성공적으로 한글화되었습니다.`);
}

run();
