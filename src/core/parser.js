/**
 * 파서 모듈
 * SKILL.md 파일의 YAML frontmatter와 Markdown 본문을 파싱합니다.
 */

import yaml from 'js-yaml';

/**
 * SKILL.md 콘텐츠에서 YAML frontmatter와 본문을 분리합니다.
 */
export function splitFrontmatter(content) {
  const trimmed = content.trim();

  // YAML frontmatter 구분자(---) 존재 여부 확인
  if (!trimmed.startsWith('---')) {
    return {
      hasFrontmatter: false,
      frontmatter: {},
      rawFrontmatter: '',
      body: trimmed,
    };
  }

  const endIndex = trimmed.indexOf('---', 3);
  if (endIndex === -1) {
    return {
      hasFrontmatter: false,
      frontmatter: {},
      rawFrontmatter: '',
      body: trimmed,
    };
  }

  const rawFrontmatter = trimmed.substring(3, endIndex).trim();
  const body = trimmed.substring(endIndex + 3).trim();

  let frontmatter = {};
  try {
    frontmatter = yaml.load(rawFrontmatter) || {};
  } catch (e) {
    return {
      hasFrontmatter: true,
      frontmatter: {},
      rawFrontmatter,
      body,
      parseError: `YAML 파싱 실패: ${e.message}`,
    };
  }

  return {
    hasFrontmatter: true,
    frontmatter,
    rawFrontmatter,
    body,
  };
}

/**
 * frontmatter에서 메타데이터를 추출하고 정규화합니다.
 */
export function extractMetadata(frontmatter) {
  const metadata = {
    name: '',
    description: '',
    version: '',
    author: '',
    tags: [],
    requires: [],
    allowedTools: [],
    customFields: {},
  };

  if (!frontmatter || typeof frontmatter !== 'object') {
    return metadata;
  }

  // 이름 필드
  if (frontmatter.name) {
    metadata.name = normalizeName(String(frontmatter.name));
  }

  // 설명 필드
  if (frontmatter.description) {
    metadata.description = String(frontmatter.description).trim();
  }

  // 버전 필드
  if (frontmatter.version) {
    metadata.version = String(frontmatter.version);
  }

  // 작성자 필드
  if (frontmatter.author) {
    metadata.author = String(frontmatter.author);
  }

  // 태그 필드
  if (Array.isArray(frontmatter.tags)) {
    metadata.tags = frontmatter.tags.map((t) => String(t).toLowerCase().trim());
  }

  // allowed-tools (Claude Code 전용 필드)
  if (frontmatter['allowed-tools']) {
    const tools = frontmatter['allowed-tools'];
    metadata.allowedTools = Array.isArray(tools) ? tools : [tools];
  }

  // 의존성 필드
  if (frontmatter.requires) {
    const reqs = frontmatter.requires;
    metadata.requires = Array.isArray(reqs) ? reqs : [reqs];
  }

  // 메타데이터 (사용자 정의 맵)
  if (frontmatter.metadata && typeof frontmatter.metadata === 'object') {
    metadata.customFields = { ...frontmatter.metadata };
  }

  // 알 수 없는 필드는 customFields에 수집
  const knownFields = new Set([
    'name', 'description', 'version', 'author', 'tags',
    'allowed-tools', 'requires', 'metadata',
  ]);

  for (const [key, value] of Object.entries(frontmatter)) {
    if (!knownFields.has(key)) {
      metadata.customFields[key] = value;
    }
  }

  return metadata;
}

/**
 * 스킬 이름을 kebab-case로 정규화합니다.
 */
export function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\-\s_]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 64);
}

/**
 * Markdown 본문에서 섹션을 추출합니다.
 */
export function extractSections(body) {
  const sections = [];
  const lines = body.split('\n');
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim();
        sections.push(currentSection);
      }
      currentSection = {
        level: headingMatch[1].length,
        title: headingMatch[2].trim(),
        content: '',
      };
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentSection) {
    currentSection.content = currentContent.join('\n').trim();
    sections.push(currentSection);
  }

  return sections;
}

/**
 * SKILL.md 전체를 파싱합니다.
 */
export function parseSkillMd(content, fallbackName = '') {
  const { hasFrontmatter, frontmatter, rawFrontmatter, body, parseError } =
    splitFrontmatter(content);

  const metadata = extractMetadata(frontmatter);
  const sections = extractSections(body);

  // frontmatter에 name이 없으면 첫 번째 제목이나 폴백 이름에서 추론
  if (!metadata.name) {
    const firstHeading = sections.find((s) => s.level === 1);
    if (firstHeading) {
      metadata.name = normalizeName(firstHeading.title);
    } else if (fallbackName) {
      metadata.name = normalizeName(fallbackName);
    }
  }

  // description이 없으면 본문에서 추론 시도
  if (!metadata.description) {
    const overviewSection = sections.find(
      (s) =>
        s.title.toLowerCase().includes('overview') ||
        s.title.toLowerCase().includes('description') ||
        s.title.toLowerCase().includes('개요')
    );
    if (overviewSection && overviewSection.content) {
      metadata.description = overviewSection.content
        .split('\n')[0]
        .substring(0, 200);
    } else {
      // 본문에서 가장 첫 번째 줄(공백이나 해딩 제외)을 설명으로 사용
      const lines = body.split('\n').filter(line => line.trim().length > 0 && !line.startsWith('#'));
      if (lines.length > 0) {
        metadata.description = lines[0].substring(0, 200);
      } else {
        metadata.description = '이 스킬에 대한 설명이 없습니다.';
      }
    }
  }

  return {
    hasFrontmatter,
    frontmatter,
    rawFrontmatter,
    body,
    metadata,
    sections,
    parseError,
    originalContent: content,
  };
}
