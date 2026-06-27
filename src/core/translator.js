/**
 * 마크다운 번역 유틸리티 (로컬 백엔드 대체용)
 * 프론트엔드에서 구글 번역 API를 직접 호출합니다.
 */

// 구글 번역 API 호출 유틸
export async function translateParagraph(text) {
  if (!text || !text.trim()) return text;
  // 너무 긴 단락 방지
  const chunk = text.slice(0, 3000);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(chunk)}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    let result = '';
    if (data && data[0]) {
      for (const segment of data[0]) {
        if (segment[0]) result += segment[0];
      }
    }
    return result || text;
  } catch (err) {
    console.error('Google Translate API failed:', err);
    return text; // 실패 시 원문 반환
  }
}

// 마크다운 전체 번역 함수
export async function translateMarkdownFull(text) {
  if (!text) return '';
  // --- 1. 코드 블록 마스킹 ---
  const codeBlocks = [];
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `\n___CODE_BLOCK_${codeBlocks.length - 1}___\n`;
  });

  // 인라인 코드 마스킹
  const inlineCodes = [];
  text = text.replace(/`[^`\n]+`/g, (match) => {
    inlineCodes.push(match);
    return `___INLINE_CODE_${inlineCodes.length - 1}___`;
  });

  // --- 2. YAML Frontmatter 처리 ---
  let yamlPrefix = '';
  const yamlMatch = text.match(/^---\n([\s\S]*?)\n---/);
  if (yamlMatch) {
    const yamlContent = yamlMatch[1];
    let translatedYaml = yamlContent;
    const valueMatches = [...yamlContent.matchAll(/([a-zA-Z0-9_-]+):\s*("[^"]+"|.+)/g)];
    
    for (const m of valueMatches) {
      const key = m[1];
      const fullValue = m[2]; // 큰따옴표가 있으면 포함된 값
      
      const isQuoted = fullValue.startsWith('"') && fullValue.endsWith('"');
      const originalValue = isQuoted ? fullValue.slice(1, -1) : fullValue.trim();

      if (['name', 'description', 'title'].includes(key)) {
        const tv = await translateParagraph(originalValue);
        const newValue = isQuoted ? `"${tv}"` : tv;
        translatedYaml = translatedYaml.replace(`${key}: ${fullValue}`, `${key}: ${newValue}`);
      }
    }
    yamlPrefix = `---\n${translatedYaml}\n---\n`;
    text = text.replace(/^---\n[\s\S]*?\n---/, ''); // 본문에서 제거
  }

  // --- 3. 단락별 분리 및 번역 ---
  const paragraphs = text.split(/\n\n+/);
  const translatedParagraphs = [];

  for (const p of paragraphs) {
    if (!p.trim() || p.includes('___CODE_BLOCK_')) {
      translatedParagraphs.push(p);
      continue;
    }
    const trans = await translateParagraph(p);
    translatedParagraphs.push(trans);
  }

  let finalText = yamlPrefix + translatedParagraphs.join('\n\n');

  // --- 4. 언마스킹 ---
  finalText = finalText.replace(/___INLINE_CODE_(\d+)___/g, (match, p1) => inlineCodes[p1]);
  finalText = finalText.replace(/___CODE_BLOCK_(\d+)___/g, (match, p1) => codeBlocks[p1]);

  return finalText;
}
