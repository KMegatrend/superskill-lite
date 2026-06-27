// 브라우저 내장 스마트 추천 엔진 (비용 제로, 속도 최적화)

// 💡 스마트 동의어 사전 (확장 가능)
// 한국어로 검색해도 영문 기반 스킬이 검색되도록 핵심 개발 용어 매핑
const synonymMap = {
  '회원가입': ['signup', 'register', 'registration', 'auth', 'authentication', 'login', '회원가입'],
  '로그인': ['login', 'signin', 'auth', 'authentication', '회원가입', '로그인'],
  '결제': ['payment', 'stripe', 'billing', 'checkout', '결제'],
  '디비': ['db', 'database', 'sql', 'postgres', 'supabase', '디비', '데이터베이스'],
  '데이터베이스': ['db', 'database', 'sql', 'postgres', 'supabase', '데이터베이스'],
  '프론트': ['frontend', 'react', 'nextjs', 'ui', '프론트', '프론트엔드'],
  '프론트엔드': ['frontend', 'react', 'nextjs', 'ui', '프론트엔드'],
  '백엔드': ['backend', 'api', 'server', 'node', '백엔드'],
  '서버': ['backend', 'api', 'server', '서버'],
  '배포': ['deploy', 'vercel', 'hosting', 'aws', '배포'],
  '보안': ['security', 'auth', 'firewall', '보안'],
  '디자인': ['design', 'ui', 'ux', 'css', 'tailwind', '디자인'],
  '문서': ['docs', 'documentation', 'readme', '문서'],
  '테스트': ['test', 'testing', 'qa', 'jest', '테스트']
};

/**
 * 텍스트에서 핵심 키워드(형태소) 및 동의어 추출
 */
function extractKeywords(text) {
  // 소문자 변환, 기호 제거, 공백 단위 분리
  const cleaned = text.toLowerCase().replace(/[^a-z0-9가-힣\s]/g, ' ');
  const tokens = cleaned.split(/\s+/).filter(t => t.length > 1);
  
  // 불용어(Stopwords) 무시
  const stopwords = new Set([
    '하고', '있는', '입니다', '합니다', '만들고', '싶은데', '어떤', '스킬이', '좋을까', '추천해줘', 
    '도와줘', '사용할', '위한', '관련된', '그리고', '그래서', '하지만', '어떻게', '할지', '만들기',
    'the', 'and', 'for', 'with', 'how', 'to', 'make', 'create', 'build', 'using', 'want', 'need', 'help', 'can', 'you'
  ]);
  
  const validTokens = tokens.filter(t => !stopwords.has(t));
  
  // 동의어 확장 (예: 회원가입 -> signup, auth 등 추가)
  let expandedKeywords = [];
  validTokens.forEach(token => {
    expandedKeywords.push(token);
    // 동의어 사전에 있는 단어면 해당 단어들을 전부 키워드로 추가
    Object.keys(synonymMap).forEach(key => {
      if (token.includes(key)) {
        expandedKeywords.push(...synonymMap[key]);
      }
    });
  });
  
  return [...new Set(expandedKeywords)];
}

/**
 * 로컬 매칭 알고리즘을 사용하여 상위 스킬 ID 추천
 */
export async function fetchAiRecommendation(query, skills, apiKey = null) {
  // 0. 진짜 AI 엔진 연동 (API 통신)
  if (apiKey) {
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'gemini',
          apiKey: apiKey,
          query: query,
          skills: skills
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.recommendedIds)) {
          return result.recommendedIds;
        }
      }
    } catch (err) {
      console.warn('Real AI recommendation failed, falling back to local algorithm', err);
    }
  }

  // Fallback: 로컬 매칭 알고리즘을 사용하여 상위 스킬 ID 추천
  return new Promise((resolve) => {
    // 1. 키워드 추출
    const keywords = extractKeywords(query);
    
    if (keywords.length === 0) {
      resolve([]); // 매칭되는 키워드가 없으면 빈 배열 반환
      return;
    }

    // 2. 모든 스킬을 순회하며 키워드 매칭 점수 계산
    const scoredSkills = skills.map(skill => {
      let score = 0;
      
      const skillName = (skill.name || '').toLowerCase();
      const skillNameEn = (skill.nameEn || '').toLowerCase();
      const skillDesc = (skill.description || '').toLowerCase();
      const skillDescEn = (skill.descriptionEn || '').toLowerCase();
      const skillTags = (skill.tags || []).map(t => t.toLowerCase());
      
      keywords.forEach(kw => {
        // [강력한 가중치] 태그 정확히 매칭: +10점
        if (skillTags.includes(kw)) score += 10;
        // 태그 내 부분 포함: +5점
        else if (skillTags.some(t => t.includes(kw))) score += 5; 
        
        // [중간 가중치] 제목(이름)에 포함: +5점
        if (skillName.includes(kw) || skillNameEn.includes(kw)) score += 5;
        
        // [낮은 가중치] 설명에 포함: +1점 (단어 출현 횟수만큼 가점할 수도 있지만 단순 포함 여부만 체크)
        if (skillDesc.includes(kw)) score += 1;
        if (skillDescEn.includes(kw)) score += 1;
      });
      
      // 인기도(다운로드 수, 평점)를 미세한 보너스 점수로 부여하여 동점자 정렬 (최대 약 0.9점)
      const popularityBonus = Math.min((skill.downloads || 0) / 100000, 0.5) + Math.min((skill.rating || 0) / 10, 0.4);
      if (score > 0) score += popularityBonus;
      
      return { id: skill.id, score };
    });
    
    // 3. 점수가 0보다 큰 스킬 필터링 및 내림차순 정렬
    const sorted = scoredSkills
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);
      
    // 4. 상위 5개 추출
    const topIds = sorted.slice(0, 5).map(s => s.id);
    
    // 5. 너무 빨리 뜨면 어색할 수 있으므로, 진짜 AI가 분석하는 듯한 느낌을 위해 800ms 지연 (UX 고려)
    setTimeout(() => {
      resolve(topIds);
    }, 800);
  });
}
