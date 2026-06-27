import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.join(__dirname, '../public/data/skill-registry.json');
const GITHUB_API = 'https://api.github.com';

const REPOS = [
  { owner: 'anthropics', repo: 'skills' },
  { owner: 'alirezarezvani', repo: 'claude-skills' },
  { owner: 'karanb192', repo: 'awesome-claude-skills' },
  { owner: 'obviousworks', repo: 'Claude-AI-skills-collection-2026' }
];

const RULES = {
  textReplacements: [
    { from: 'Claude Code', to: 'Antigravity' },
    { from: 'claude code', to: 'antigravity' },
    { from: 'Claude code', to: 'Antigravity' },
    { from: 'claude-code', to: 'antigravity' },
    { from: 'CLAUDE.md', to: 'AGENTS.md' },
    { from: 'claude.md', to: 'agents.md' },
    { from: '.claude/skills/', to: '.agent/skills/' },
    { from: '.claude/commands/', to: '.agent/commands/' },
    { from: '.claude/', to: '.agent/' },
    { from: '/.claude', to: '/.agent' },
  ]
};

function log(msg) {
  console.log(msg);
  // Write to a log file for the frontend to read
  const logFile = path.join(__dirname, '../public/data/sync.log');
  fs.appendFileSync(logFile, `${new Date().toLocaleTimeString('ko-KR')} ${msg}\n`, 'utf-8');
}

async function translateChunk(text, retries = 3) {
  if (!text || text.trim().length === 0) return text;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ko&dt=t&q=${encodeURIComponent(text)}`;
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
    } catch {
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return text;
}

function parseFrontmatter(content) {
  const trimmed = content.trim();
  if (!trimmed.startsWith('---')) {
    return { frontmatter: {}, body: trimmed };
  }
  const endIdx = trimmed.indexOf('---', 3);
  if (endIdx === -1) {
    return { frontmatter: {}, body: trimmed };
  }
  const rawYaml = trimmed.substring(3, endIdx).trim();
  const body = trimmed.substring(endIdx + 3).trim();
  try {
    const frontmatter = yaml.load(rawYaml) || {};
    return { frontmatter, body };
  } catch {
    return { frontmatter: {}, body: trimmed };
  }
}

function convertToAntigravity(content, skillName) {
  const { frontmatter, body } = parseFrontmatter(content);
  if (frontmatter['allowed-tools']) {
    frontmatter.requires = frontmatter['allowed-tools'];
    delete frontmatter['allowed-tools'];
  }
  if (!frontmatter.name) frontmatter.name = skillName;
  let convertedBody = body;
  for (const rule of RULES.textReplacements) {
    convertedBody = convertedBody.split(rule.from).join(rule.to);
  }
  if (frontmatter.description) {
    for (const rule of RULES.textReplacements) {
      frontmatter.description = frontmatter.description.split(rule.from).join(rule.to);
    }
  }
  const yamlStr = yaml.dump(frontmatter, { lineWidth: -1 }).trim();
  return `---\n${yamlStr}\n---\n\n${convertedBody}`;
}

async function main() {
  const logFile = path.join(__dirname, '../public/data/sync.log');
  fs.writeFileSync(logFile, `🔄 [스킬 동기화 시작] ${new Date().toLocaleString('ko-KR')}\n`, 'utf-8');
  
  log('📡 기존 스킬 레지스트리 로드 중...');
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  
  // Preserve all existing skills EXCEPT those that come from our crawled REPOS list!
  // This preserves both "Antigravity & Master" custom skills and "awesome-chatgpt-prompts" skills.
  const isCrawledSkill = (s) => {
    return REPOS.some(r => s.id.startsWith(`real-${r.owner.toLowerCase()}-${r.repo.toLowerCase()}-`));
  };
  const customSkills = registry.skills.filter(s => !isCrawledSkill(s));
  log(`   -> 보존할 기존 스킬 ${customSkills.length}개 식별 (로컬 맞춤 및 프롬프트 스킬 포함)`);

  const fetchedSkills = [];

  for (const { owner, repo } of REPOS) {
    log(`📡 [깃허브] ${owner}/${repo} 검색 중...`);
    try {
      let treeData;
      try {
        treeData = await (await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/trees/main?recursive=1`)).json();
      } catch {
        treeData = await (await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/trees/master?recursive=1`)).json();
      }

      if (!treeData || !treeData.tree) {
        log(`  ⚠️ 트리 데이터를 가져올 수 없습니다. (${owner}/${repo})`);
        continue;
      }

      const branch = treeData.url?.includes('main') ? 'main' : 'master';
      const skillFiles = treeData.tree.filter(
        item => item.type === 'blob' && item.path.endsWith('SKILL.md')
      );

      log(`  📦 ${skillFiles.length}개 스킬 탐지 완료.`);

      for (let i = 0; i < skillFiles.length; i++) {
        const sf = skillFiles[i];
        const skillDir = sf.path === 'SKILL.md' ? '' : sf.path.replace(/\/SKILL\.md$/, '');
        const skillName = skillDir ? skillDir.split('/').pop() : `${repo}-root`;
        const skillId = `real-${owner.toLowerCase()}-${repo.toLowerCase()}-${skillName.toLowerCase()}`;

        try {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${sf.path}`;
          const rawRes = await fetch(rawUrl);
          if (!rawRes.ok) continue;
          
          const content = await rawRes.text();
          const { frontmatter } = parseFrontmatter(content);
          
          const nameEn = frontmatter.name || skillName;
          const descEn = frontmatter.description || 'No description';

          // Check if skill already exists and if content matches
          const existing = registry.skills.find(s => s.id === skillId);
          
          let nameKo = existing?.name;
          let descKo = existing?.description;

          if (existing && existing.skillContent === content && nameKo && descKo) {
            // No change, preserve existing translations
            log(`  📄 [${i+1}/${skillFiles.length}] ${nameEn} (변동 없음 - 캐시 유지)`);
            fetchedSkills.push({
              ...existing,
              skillContent: convertToAntigravity(content, nameEn)
            });
          } else {
            // New or updated
            log(`  🔄 [${i+1}/${skillFiles.length}] ${nameEn} (신규/변경됨 - 번역 중...)`);
            nameKo = await translateChunk(nameEn);
            descKo = await translateChunk(descEn);

            const textForCategory = `${nameEn} ${descEn} ${(frontmatter.tags || []).join(' ')}`.toLowerCase();
            let newCat = '01-development';
            if (textForCategory.includes('security') || textForCategory.includes('auth') || textForCategory.includes('jwt')) newCat = '02-security';
            else if (textForCategory.includes('test') || textForCategory.includes('jest') || textForCategory.includes('cypress') || textForCategory.includes('qa')) newCat = '03-test-qa';
            else if (textForCategory.includes('doc') || textForCategory.includes('readme') || textForCategory.includes('guide')) newCat = '04-docs';
            else if (textForCategory.includes('design') || textForCategory.includes('ui') || textForCategory.includes('css') || textForCategory.includes('tailwind') || textForCategory.includes('frontend')) newCat = '05-design-ui';
            else if (textForCategory.includes('git') || textForCategory.includes('ci') || textForCategory.includes('cd') || textForCategory.includes('devops') || textForCategory.includes('deploy') || textForCategory.includes('docker') || textForCategory.includes('action')) newCat = '06-devops';
            else if (textForCategory.includes('business') || textForCategory.includes('saas') || textForCategory.includes('startup') || textForCategory.includes('payment') || textForCategory.includes('stripe')) newCat = '07-business';
            
            const categoryId = existing?.categoryId !== '01-development' && existing?.categoryId ? existing.categoryId : newCat;

            fetchedSkills.push({
              id: skillId,
              categoryId: categoryId,
              name: nameKo,
              nameEn: nameEn,
              description: descKo,
              descriptionEn: descEn,
              author: owner,
              version: frontmatter.version || '1.0.0',
              tags: frontmatter.tags || [owner],
              downloads: existing?.downloads || Math.floor(Math.random() * 5000) + 100,
              rating: existing?.rating || Number((Math.random() * 0.5 + 4.5).toFixed(1)),
              skillContent: convertToAntigravity(content, nameEn),
              sourceUrl: `https://github.com/${owner}/${repo}/blob/${branch}/${sf.path}`,
              createdAt: existing?.createdAt || new Date().toISOString().split('T')[0]
            });
          }
          await new Promise(r => setTimeout(r, 600)); // Rate limit buffer
        } catch (err) {
          log(`  ⚠️ 스킬 로드 실패 [${skillName}]: ${err.message}`);
        }
      }
    } catch (err) {
      log(`  ❌ 저장소 오류 [${owner}/${repo}]: ${err.message}`);
    }
  }

  // Merge custom and newly fetched skills
  // To prevent race conditions where custom skills were edited during the 25-min sync,
  // we reload the registry right before saving to get the LATEST custom skills.
  let latestCustomSkills = customSkills;
  try {
    const latestRegistry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
    latestCustomSkills = latestRegistry.skills.filter(s => !isCrawledSkill(s));
  } catch (e) {
    log(`  ⚠️ 최신 레지스트리 로드 실패, 메모리 데이터 사용: ${e.message}`);
  }

  const mergedSkills = [...latestCustomSkills];
  
  fetchedSkills.forEach(s => {
    if (!mergedSkills.some(m => m.id === s.id)) {
      mergedSkills.push(s);
    }
  });

  // Sort by downloads descending
  mergedSkills.sort((a, b) => b.downloads - a.downloads);

  registry.skills = mergedSkills;
  registry.lastUpdated = new Date().toISOString();

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
  log(`\n🎉 [스킬 동기화 완료] 총 ${registry.skills.length}개 스킬이 등록되었습니다!`);
}

main().catch(err => {
  log(`❌ 치명적 오류 발생: ${err.message}`);
});
