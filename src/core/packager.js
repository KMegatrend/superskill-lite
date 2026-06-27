/**
 * 패키저 모듈
 * 파싱된 스킬을 Antigravity 규격 폴더 구조로 패키징합니다.
 */

import yaml from 'js-yaml';

/**
 * Antigravity용 SKILL.md 콘텐츠를 생성합니다.
 */
export function buildAntigravitySkillMd(metadata, body, transformedFrontmatter) {
  const fm = {};

  // 필수 필드
  fm.name = metadata.name || 'unnamed-skill';
  fm.description = metadata.description || 'No description provided.';

  // 선택 필드
  if (metadata.version) fm.version = metadata.version;
  if (metadata.author) fm.author = metadata.author;
  if (metadata.tags && metadata.tags.length > 0) fm.tags = metadata.tags;

  // allowed-tools → requires 매핑 (규칙 엔진에서 아직 매핑되지 않은 경우)
  if (transformedFrontmatter.requires) {
    fm.requires = transformedFrontmatter.requires;
  } else if (metadata.allowedTools && metadata.allowedTools.length > 0) {
    fm.requires = metadata.allowedTools;
  }

  // 사용자 정의 필드 유지
  if (metadata.customFields && Object.keys(metadata.customFields).length > 0) {
    for (const [key, value] of Object.entries(metadata.customFields)) {
      if (!fm[key]) {
        fm[key] = value;
      }
    }
  }

  const yamlStr = yaml.dump(fm, {
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
  }).trim();

  return `---\n${yamlStr}\n---\n\n${body}`;
}

/**
 * 스킬의 관련 파일을 Antigravity 폴더 구조에 맞게 정리합니다.
 */
export function organizeRelatedFiles(relatedFiles, skillDir) {
  const organized = {
    scripts: [],
    references: [],
    resources: [],
    examples: [],
    other: [],
  };

  for (const file of relatedFiles) {
    if (file.skipped) continue;

    // 스킬 디렉토리 기준 상대 경로 결정
    let relativePath = file.path;
    if (skillDir && file.path.startsWith(skillDir + '/')) {
      relativePath = file.path.substring(skillDir.length + 1);
    }

    // 디렉토리 또는 확장자 기준으로 분류
    const lowerPath = relativePath.toLowerCase();

    if (
      lowerPath.startsWith('scripts/') ||
      lowerPath.endsWith('.sh') ||
      lowerPath.endsWith('.py') ||
      lowerPath.endsWith('.ps1')
    ) {
      organized.scripts.push({ ...file, relativePath, category: 'scripts' });
    } else if (
      lowerPath.startsWith('references/') ||
      lowerPath.startsWith('docs/') ||
      lowerPath.startsWith('ref/')
    ) {
      organized.references.push({ ...file, relativePath, category: 'references' });
    } else if (
      lowerPath.startsWith('resources/') ||
      lowerPath.startsWith('assets/') ||
      lowerPath.startsWith('templates/')
    ) {
      organized.resources.push({ ...file, relativePath, category: 'resources' });
    } else if (
      lowerPath.startsWith('examples/') ||
      lowerPath.startsWith('example/') ||
      lowerPath.startsWith('samples/')
    ) {
      organized.examples.push({ ...file, relativePath, category: 'examples' });
    } else {
      organized.other.push({ ...file, relativePath, category: 'other' });
    }
  }

  return organized;
}

/**
 * 단일 스킬을 Antigravity 패키지로 변환합니다.
 */
export function packageSkill(parsedSkill, transformResult, originalSkill) {
  const skillName = parsedSkill.metadata.name || originalSkill.name || 'unnamed-skill';

  // SKILL.md 생성
  const skillMdContent = buildAntigravitySkillMd(
    parsedSkill.metadata,
    transformResult.body,
    transformResult.frontmatter
  );

  // 관련 파일 정리
  const organizedFiles = organizeRelatedFiles(
    originalSkill.relatedFiles || [],
    originalSkill.directory
  );

  // 패키지용 파일 목록 생성
  const packageFiles = [
    {
      path: `${skillName}/SKILL.md`,
      content: skillMdContent,
      type: 'converted',
    },
  ];

  // 정리된 파일을 패키지에 추가
  for (const [category, files] of Object.entries(organizedFiles)) {
    for (const file of files) {
      if (file.content !== undefined) {
        packageFiles.push({
          path: `${skillName}/${category}/${file.relativePath.split('/').pop()}`,
          content: file.content,
          type: 'copied',
          originalPath: file.path,
        });
      }
    }
  }

  return {
    name: skillName,
    files: packageFiles,
    organizedFiles,
    metadata: parsedSkill.metadata,
    changes: transformResult.changes,
  };
}

/**
 * 패키지를 다운로드 가능한 ZIP-like 구조로 변환합니다.
 * (실제 ZIP은 생성하지 않고, 파일 목록과 내용을 반환)
 */
export function createDownloadablePackage(packages) {
  const allFiles = [];

  for (const pkg of packages) {
    for (const file of pkg.files) {
      allFiles.push({
        path: `antigravity-pack/${file.path}`,
        content: file.content,
        type: file.type,
      });
    }
  }

  return allFiles;
}
