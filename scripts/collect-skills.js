/**
 * Claude Code 스킬 대규모 수집 및 Antigravity 변환 스크립트
 * 
 * GitHub API로 주요 저장소에서 스킬을 수집하고,
 * 카테고리별로 원본 보관 + Antigravity 변환을 수행합니다.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR = path.resolve(__dirname, '..');
const ORIGINAL_DIR = path.join(BASE_DIR, 'skills-original');
const CONVERTED_DIR = path.join(BASE_DIR, 'skills-converted');

const GITHUB_API = 'https://api.github.com';

// ─── 카테고리 분류 키워드 ───
const CATEGORIES = {
  '01-개발-엔지니어링': [
    'code', 'develop', 'engineer', 'architect', 'refactor', 'debug',
    'fullstack', 'frontend', 'backend', 'api', 'web', 'app', 'react',
    'next', 'typescript', 'python', 'rust', 'golang', 'java', 'swift',
    'flutter', 'tailwind', 'supabase', 'stripe', 'database', 'sql',
    'component', 'library', 'framework', 'crud', 'migration', 'build',
    'agency', 'production', 'enterprise', 'senior', 'junior', 'review',
  ],
  '02-보안': [
    'security', 'secure', 'vulnerability', 'owasp', 'auth', 'encrypt',
    'penetration', 'audit', 'compliance', 'privacy', 'firewall', 'xss',
    'injection', 'csrf', 'pentest', 'threat',
  ],
  '03-테스트-QA': [
    'test', 'testing', 'qa', 'quality', 'unit', 'integration', 'e2e',
    'jest', 'cypress', 'playwright', 'vitest', 'coverage', 'tdd', 'bdd',
    'mock', 'fixture', 'assert', 'spec',
  ],
  '04-문서화': [
    'document', 'documentation', 'readme', 'docs', 'api-doc', 'jsdoc',
    'comment', 'changelog', 'wiki', 'guide', 'tutorial', 'reference',
    'specification', 'swagger', 'openapi',
  ],
  '05-디자인-UI': [
    'design', 'ui', 'ux', 'css', 'style', 'theme', 'layout', 'responsive',
    'accessibility', 'a11y', 'color', 'font', 'animation', 'figma',
    'storybook', 'shadcn', 'radix',
  ],
  '06-Git-DevOps': [
    'git', 'github', 'gitlab', 'ci', 'cd', 'deploy', 'docker', 'kubernetes',
    'pipeline', 'workflow', 'action', 'release', 'version', 'branch',
    'merge', 'commit', 'pull-request', 'pr', 'devops', 'infra', 'terraform',
    'aws', 'azure', 'gcp',
  ],
  '07-비즈니스': [
    'business', 'marketing', 'seo', 'project', 'manage', 'plan', 'strategy',
    'product', 'startup', 'saas', 'pricing', 'analytics', 'growth',
    'content', 'copy', 'email', 'social',
  ],
  '08-데이터-AI': [
    'data', 'ai', 'ml', 'machine-learning', 'prompt', 'model', 'train',
    'dataset', 'analysis', 'visualization', 'chart', 'graph', 'nlp',
    'llm', 'embedding', 'vector', 'rag',
  ],
};

// ─── 치환 규칙 (Antigravity 변환용) ───
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
  ],
  fieldMappings: { 'allowed-tools': 'requires' },
};

// ─── 유틸리티 함수 ───

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (remaining === '0') {
      const resetTime = res.headers.get('x-ratelimit-reset');
      const waitSec = resetTime ? (parseInt(resetTime) - Math.floor(Date.now() / 1000)) : 60;
      console.log(`⏳ Rate limit 도달. ${waitSec}초 대기...`);
      await sleep(Math.min(waitSec * 1000, 60000));
      return fetchJson(url); // 재시도
    }
    throw new Error(`API 오류 ${res.status}: ${url}`);
  }
  return res.json();
}

async function fetchFileContent(owner, repo, filePath, branch = 'main') {
  try {
    const data = await fetchJson(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`
    );
    if (data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return data.content || '';
  } catch (e) {
    // main 실패 시 master 시도
    if (branch === 'main') {
      return fetchFileContent(owner, repo, filePath, 'master');
    }
    throw e;
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ─── 카테고리 분류 ───

function classifySkill(name, content) {
  const text = `${name} ${content}`.toLowerCase();
  const scores = {};

  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    scores[category] = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) {
        scores[category]++;
      }
    }
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : '09-기타';
}

// ─── SKILL.md 파싱 ───

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

// ─── Antigravity 변환 ───

function convertToAntigravity(content, skillName) {
  const { frontmatter, body } = parseFrontmatter(content);

  // 필드 매핑
  if (frontmatter['allowed-tools']) {
    frontmatter.requires = frontmatter['allowed-tools'];
    delete frontmatter['allowed-tools'];
  }

  // name 보장
  if (!frontmatter.name) frontmatter.name = skillName;

  // 텍스트 치환
  let convertedBody = body;
  for (const rule of RULES.textReplacements) {
    convertedBody = convertedBody.split(rule.from).join(rule.to);
  }

  // description 치환
  if (frontmatter.description) {
    for (const rule of RULES.textReplacements) {
      frontmatter.description = frontmatter.description.split(rule.from).join(rule.to);
    }
  }

  // YAML 재생성
  const yamlStr = yaml.dump(frontmatter, { lineWidth: -1 }).trim();
  return `---\n${yamlStr}\n---\n\n${convertedBody}`;
}

// ─── 저장소 스캔 ───

async function scanRepo(owner, repo) {
  console.log(`\n📡 저장소 스캔: ${owner}/${repo}`);
  const skills = [];

  try {
    // 트리 API로 전체 구조 가져오기 (1회 호출)
    let treeData;
    try {
      treeData = await fetchJson(`${GITHUB_API}/repos/${owner}/${repo}/git/trees/main?recursive=1`);
    } catch {
      treeData = await fetchJson(`${GITHUB_API}/repos/${owner}/${repo}/git/trees/master?recursive=1`);
    }

    const branch = treeData.url?.includes('main') ? 'main' : 'master';
    const skillFiles = treeData.tree.filter(
      item => item.type === 'blob' && item.path.endsWith('SKILL.md')
    );

    console.log(`  📦 ${skillFiles.length}개 SKILL.md 발견`);

    for (let i = 0; i < skillFiles.length; i++) {
      const sf = skillFiles[i];
      const skillDir = sf.path === 'SKILL.md' ? '' : sf.path.replace(/\/SKILL\.md$/, '');
      const skillName = skillDir ? skillDir.split('/').pop() : `${repo}-root`;

      try {
        console.log(`  📄 [${i + 1}/${skillFiles.length}] ${skillName}`);
        const content = await fetchFileContent(owner, repo, sf.path, branch);

        skills.push({
          name: skillName,
          path: sf.path,
          content,
          source: `${owner}/${repo}`,
          sourceUrl: `https://github.com/${owner}/${repo}/blob/${branch}/${sf.path}`,
        });

        // Rate limit 방지를 위한 딜레이
        if (i > 0 && i % 10 === 0) {
          await sleep(1000);
        }
      } catch (e) {
        console.log(`  ⚠️ ${skillName} 로드 실패: ${e.message}`);
      }
    }
  } catch (e) {
    console.log(`  ❌ 저장소 스캔 실패: ${e.message}`);
  }

  return skills;
}

// ─── 메인 실행 ───

async function main() {
  console.log('═'.repeat(60));
  console.log('🔄 Claude Code 스킬 대규모 수집 및 Antigravity 변환');
  console.log('═'.repeat(60));

  // 출력 디렉토리 생성
  ensureDir(ORIGINAL_DIR);
  ensureDir(CONVERTED_DIR);

  // 사용자 제공 스킬 추가
  const userSkill = {
    name: 'senior-web-agency',
    path: 'user-provided/SKILL.md',
    content: `---
name: senior-web-agency
description: 시니어 웹 에이전시 팀으로 구성된 프로덕션급 풀스택 개발 스킬. Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Stripe 기반.
version: 1.0.0
author: user
tags:
  - fullstack
  - nextjs
  - typescript
  - production
  - enterprise
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---

# Senior Web Agency Team Skill

## 역할 구성

시니어 웹 에이전시 팀으로 다음 역할을 수행합니다:

- Creative Director
- UX/UI Designer
- Senior Next.js Developer
- Senior TypeScript Engineer
- Tailwind CSS Specialist
- shadcn/ui Specialist
- Supabase Architect
- Stripe Billing Expert
- SEO Specialist
- Security Engineer

## 기술 스택

- Next.js latest
- TypeScript strict mode
- Tailwind CSS latest
- shadcn/ui
- Supabase
- Stripe
- React Hook Form
- Zod
- Framer Motion

## 요구 사항

- Production-ready code
- Agency-quality UI
- Mobile-first responsive
- SEO optimized
- Accessibility compliant
- High Lighthouse score
- Reusable components
- Clean architecture
- Feature-based folder structure
- Secure authentication
- Subscription billing support
- Admin dashboard support

## 지침

항상 엔터프라이즈 프로덕션 배포에 적합한 코드를 생성하세요.
초보자 패턴과 AI처럼 보이는 디자인을 피하세요.
Claude Code 프로젝트의 .claude/skills/ 구조를 따르세요.
`,
    source: 'user-provided',
    sourceUrl: 'user-provided',
  };

  const allSkills = [userSkill];
  const report = {
    timestamp: new Date().toISOString(),
    repos: [],
    categories: {},
    totalOriginal: 0,
    totalConverted: 0,
    errors: [],
  };

  // 저장소별 스킬 수집
  const repos = [
    ['anthropics', 'skills'],
    ['alirezarezvani', 'claude-skills'],
    ['karanb192', 'awesome-claude-skills'],
    ['obviousworks', 'Claude-AI-skills-collection-2026'],
  ];

  for (const [owner, repo] of repos) {
    try {
      const skills = await scanRepo(owner, repo);
      allSkills.push(...skills);
      report.repos.push({
        name: `${owner}/${repo}`,
        skillCount: skills.length,
        status: 'success',
      });
    } catch (e) {
      console.log(`❌ ${owner}/${repo} 실패: ${e.message}`);
      report.repos.push({
        name: `${owner}/${repo}`,
        skillCount: 0,
        status: 'failed',
        error: e.message,
      });
      report.errors.push({ repo: `${owner}/${repo}`, error: e.message });
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📦 총 ${allSkills.length}개 스킬 수집 완료. 분류 및 저장 시작...`);
  console.log('═'.repeat(60));

  // 카테고리별 분류 및 저장
  for (const skill of allSkills) {
    const category = classifySkill(skill.name, skill.content);

    // 카테고리 통계
    if (!report.categories[category]) {
      report.categories[category] = { count: 0, skills: [] };
    }
    report.categories[category].count++;
    report.categories[category].skills.push({
      name: skill.name,
      source: skill.source,
    });

    // 원본 저장
    const origDir = path.join(ORIGINAL_DIR, category, skill.name);
    ensureDir(origDir);
    fs.writeFileSync(path.join(origDir, 'SKILL.md'), skill.content, 'utf-8');
    report.totalOriginal++;

    // Antigravity 변환 저장
    try {
      const converted = convertToAntigravity(skill.content, skill.name);
      const convDir = path.join(CONVERTED_DIR, category, skill.name);
      ensureDir(convDir);
      fs.writeFileSync(path.join(convDir, 'SKILL.md'), converted, 'utf-8');
      report.totalConverted++;
    } catch (e) {
      console.log(`  ⚠️ ${skill.name} 변환 실패: ${e.message}`);
      report.errors.push({ skill: skill.name, error: e.message });
    }
  }

  // 리포트 저장
  const reportPath = path.join(BASE_DIR, 'conversion-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  // 결과 출력
  console.log(`\n${'═'.repeat(60)}`);
  console.log('📊 수집 및 변환 결과');
  console.log('═'.repeat(60));
  console.log(`  총 스킬: ${allSkills.length}개`);
  console.log(`  원본 저장: ${report.totalOriginal}개`);
  console.log(`  변환 완료: ${report.totalConverted}개`);
  console.log(`  오류: ${report.errors.length}건`);
  console.log('\n  카테고리별:');
  for (const [cat, data] of Object.entries(report.categories).sort()) {
    console.log(`    ${cat}: ${data.count}개`);
  }
  console.log(`\n  리포트: ${reportPath}`);
  console.log('═'.repeat(60));
}

main().catch(console.error);
