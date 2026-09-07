#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const command = args[0];
const skillId = args[1];

const BANNER = `
\x1b[36m╔══════════════════════════════════════════════════════════════╗
║               🚀 SuperSkill Package Manager                  ║
║         The Next-Generation Package Manager for AI Agents    ║
╚══════════════════════════════════════════════════════════════╝\x1b[0m
`;

console.log(BANNER);

if (!command || command === 'help' || command === '--help' || command === '-h') {
  console.log(`\x1b[1m사용법:\x1b[0m`);
  console.log(`  npx superskill add <스킬ID>     에이전트 스킬을 현재 프로젝트에 100% 지능 구조로 자동 설치`);
  console.log(`  npx superskill list            설치 가능한 추천 스킬 목록 확인`);
  console.log(`  npx superskill info <스킬ID>    스킬 상세 정보 및 프롬프트 미리보기\n`);
  console.log(`\x1b[1m예시:\x1b[0m`);
  console.log(`  npx superskill add luxury-agency-web-designer`);
  console.log(`  npx superskill add ai-agency-master-playbook`);
  console.log(`  npx superskill add opencode-agent-powerpack\n`);
  process.exit(0);
}

if (command === 'list') {
  console.log(`\x1b[32m✔ 마켓플레이스 핵심 추천 스킬 목록:\x1b[0m\n`);
  console.log(`  • \x1b[33mluxury-agency-web-designer\x1b[0m : 💎 [하이엔드] 럭셔리 웹에이전시 수석 디자이너`);
  console.log(`  • \x1b[33mai-agency-master-playbook\x1b[0m  : 🏆 [실무 프로세스] 1인 AI 웹에이전시 마스터 플레이북`);
  console.log(`  • \x1b[33mopencode-agent-powerpack\x1b[0m   : ⚡ [올인원] Claude Code 에이전트 파워팩 (11개 핵심 엔진)`);
  console.log(`  • \x1b[33mhallmark-design-architect\x1b[0m  : 🎨 [끝판왕] Hallmark 안티-AI 디자인 아키텍트`);
  console.log(`  • \x1b[33mclaude-code-superpower\x1b[0m     : 👑 [최고급] 자율형 AI 에이전트 각성 팩\n`);
  console.log(`자세한 둘러보기는 웹사이트(https://superskill.ai/marketplace.html)를 방문하세요.\n`);
  process.exit(0);
}

if (command === 'add' || command === 'install') {
  if (!skillId) {
    console.error(`\x1b[31m✖ 에러: 설치할 스킬 ID를 입력하세요.\x1b[0m`);
    console.log(`  예: npx superskill add luxury-agency-web-designer\n`);
    process.exit(1);
  }

  installSkill(skillId);
} else {
  console.log(`\x1b[33m알 수 없는 명령어: ${command}\x1b[0m. 'npx superskill help'를 참조하세요.`);
}

async function installSkill(id) {
  console.log(`\x1b[34mℹ '${id}' 스킬 패키지를 찾는 중...\x1b[0m`);

  // Target directory: .agents/skills/<id>/
  const cwd = process.cwd();
  const targetDir = path.join(cwd, '.agents', 'skills', id);

  try {
    // 1. Check if we have local bundled package in this repo
    const localSkillDir = path.join(__dirname, '..', '.agents', 'skills', id);

    if (fs.existsSync(localSkillDir)) {
      copyRecursiveSync(localSkillDir, targetDir);
      finishInstall(id, targetDir);
      return;
    }

    // 2. Fetch from registry online
    const registryUrl = 'https://antigravity-skills-alpha.vercel.app/data/skill-registry.json';
    const registryData = await fetchJson(registryUrl);
    const skill = registryData.skills.find(s => s.id === id);

    if (!skill) {
      console.error(`\x1b[31m✖ 등록되지 않은 스킬입니다: '${id}'\x1b[0m`);
      console.log(`  'npx superskill list'로 등록된 스킬 목록을 확인하세요.\n`);
      process.exit(1);
    }

    // Create target dir
    fs.mkdirSync(targetDir, { recursive: true });

    // Write SKILL.md
    const skillMd = skill.skillContent || `# ${skill.name}\n\n${skill.description}`;
    fs.writeFileSync(path.join(targetDir, 'SKILL.md'), skillMd, 'utf8');

    // Write manifest.json
    fs.writeFileSync(path.join(targetDir, 'manifest.json'), JSON.stringify(skill, null, 2), 'utf8');

    finishInstall(id, targetDir, skill.name);
  } catch (err) {
    console.error(`\x1b[31m✖ 설치 실패:\x1b[0m`, err.message);
    process.exit(1);
  }
}

function finishInstall(id, targetDir, skillName) {
  console.log(`\n\x1b[32m✔ [성공] 스킬 패키지 설치가 완료되었습니다!\x1b[0m`);
  console.log(`  📁 설치 경로: \x1b[33m${targetDir}\x1b[0m`);
  console.log(`  ⚡ 에이전트 지능: \x1b[32m100% 해금 (Progressive Disclosure 활성화)\x1b[0m`);
  console.log(`\n\x1b[1m💡 사용 팁:\x1b[0m`);
  console.log(`  Antigravity, Cursor, Windsurf, Claude Code 환경에서 AI에게 바로 지시하세요:`);
  console.log(`  \x1b[36m"이 프로젝트에 설치된 ${id} 스킬 규칙을 적용해 줘."\x1b[0m\n`);
}

function copyRecursiveSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchJson(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}
