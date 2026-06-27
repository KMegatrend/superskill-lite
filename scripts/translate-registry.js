import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.join(__dirname, '../public/data/skill-registry.json');

async function translateChunk(text, retries = 3) {
  if (!text || text.trim().length === 0) return text;
  
  const chunk = text.slice(0, 3000);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ko&dt=t&q=${encodeURIComponent(chunk)}`;

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      let t = '';
      if (data && data[0]) {
        for (const segment of data[0]) {
          if (segment[0]) t += segment[0];
        }
      }
      if (t) return t;
    } catch (err) {
      console.log(`Translation fetch failed (retry ${i+1}/${retries})...`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return text; // 실패시 원문
}

async function main() {
  console.log('📡 skill-registry.json 데이터 불러오는 중...');
  const rawData = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  const registry = JSON.parse(rawData);
  
  const realSkills = registry.skills.filter(s => s.id.startsWith('real-'));
  
  console.log(`✅ 번역 대상 스킬: ${realSkills.length}개`);
  
  // 전체 스킬 번역 (약 1880개)
  const TOP_N = realSkills.length;
  const targetSkills = realSkills.slice(0, TOP_N);
  
  console.log(`🚀 상위 ${TOP_N}개 스킬에 대해 일괄 번역을 시작합니다...`);

  // 이름 번역 (배치)
  const batchSize = 20;
  for (let i = 0; i < targetSkills.length; i += batchSize) {
    const batch = targetSkills.slice(i, i + batchSize);
    
    // Batch Names
    const namesJoined = batch.map(s => s.nameEn).join(' ||| ');
    const namesTranslated = await translateChunk(namesJoined);
    const namesSplit = namesTranslated.split(/\s*\|\|\|\s*/);
    
    // Batch Descriptions
    const descJoined = batch.map(s => s.descriptionEn).join(' ||| ');
    const descTranslated = await translateChunk(descJoined);
    const descSplit = descTranslated.split(/\s*\|\|\|\s*/);

    batch.forEach((skill, index) => {
      if (namesSplit[index]) skill.name = namesSplit[index].replace(/^"|"$/g, '').trim();
      if (descSplit[index]) skill.description = descSplit[index].replace(/^"|"$/g, '').trim();
    });
    
    console.log(`   ... [${i + batch.length}/${targetSkills.length}] 번역 완료`);
    await new Promise(r => setTimeout(r, 1500)); // Rate limit 방지
  }
  
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
  console.log(`🎉 상위 ${TOP_N}개 스킬의 한글 번역이 적용되었습니다!`);
}

main().catch(console.error);
