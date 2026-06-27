/**
 * 규칙 엔진 모듈
 * 치환 규칙을 로드하고 적용합니다.
 */

import defaultRules from '../../rules/default-rules.json';

/**
 * 규칙을 로드합니다. 커스텀 규칙이 없으면 기본 규칙을 사용합니다.
 */
export function loadRules(customRules = null) {
  const rules = customRules || defaultRules;
  return {
    version: rules.version || '1.0.0',
    pathReplacements: rules.pathReplacements || [],
    textReplacements: rules.textReplacements || [],
    fieldMappings: rules.fieldMappings || {},
    ignoredFiles: rules.ignoredFiles || [],
    binaryExtensions: rules.binaryExtensions || [],
  };
}

/**
 * 경로에 치환 규칙을 적용합니다.
 */
export function applyPathRules(path, rules) {
  let result = path;
  const changes = [];

  for (const rule of rules.pathReplacements) {
    if (result.includes(rule.from)) {
      const before = result;
      result = result.split(rule.from).join(rule.to);
      changes.push({
        type: 'path',
        from: rule.from,
        to: rule.to,
        before,
        after: result,
      });
    }
  }

  return { result, changes };
}

/**
 * 텍스트 내용에 치환 규칙을 적용합니다.
 */
export function applyTextRules(text, rules) {
  let result = text;
  const changes = [];

  for (const rule of rules.textReplacements) {
    const flags = rule.caseSensitive === false ? 'gi' : 'g';
    const escaped = rule.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, flags);

    const matches = result.match(regex);
    if (matches && matches.length > 0) {
      result = result.replace(regex, rule.to);
      changes.push({
        type: 'text',
        from: rule.from,
        to: rule.to,
        count: matches.length,
      });
    }
  }

  return { result, changes };
}

/**
 * frontmatter 필드 매핑을 적용합니다.
 */
export function applyFieldMappings(frontmatter, rules) {
  const result = { ...frontmatter };
  const changes = [];

  for (const [fromField, toField] of Object.entries(rules.fieldMappings)) {
    if (result[fromField] !== undefined) {
      result[toField] = result[fromField];
      delete result[fromField];
      changes.push({
        type: 'field',
        from: fromField,
        to: toField,
        value: result[toField],
      });
    }
  }

  return { result, changes };
}

/**
 * 파일이 바이너리인지 확인합니다.
 */
export function isBinaryFile(filePath, rules) {
  const ext = '.' + filePath.split('.').pop().toLowerCase();
  return rules.binaryExtensions.includes(ext);
}

/**
 * 파일이 무시 대상인지 확인합니다.
 */
export function isIgnoredFile(filePath, rules) {
  return rules.ignoredFiles.some(
    (ignored) =>
      filePath.includes(ignored) ||
      filePath.split('/').pop() === ignored
  );
}

/**
 * 전체 스킬 콘텐츠에 모든 규칙을 적용합니다.
 */
export function applyAllRules(parsedSkill, rules) {
  const allChanges = [];

  // 1. frontmatter에 필드 매핑 적용
  const { result: mappedFrontmatter, changes: fieldChanges } =
    applyFieldMappings(parsedSkill.frontmatter, rules);
  allChanges.push(...fieldChanges);

  // 2. 본문에 텍스트 치환 규칙 적용
  const { result: transformedBody, changes: bodyChanges } = applyTextRules(
    parsedSkill.body,
    rules
  );
  allChanges.push(...bodyChanges);

  // 3. 설명 필드에 텍스트 치환 규칙 적용
  let transformedDescription = parsedSkill.metadata.description;
  if (transformedDescription) {
    const { result, changes } = applyTextRules(transformedDescription, rules);
    transformedDescription = result;
    allChanges.push(...changes);
  }

  return {
    frontmatter: mappedFrontmatter,
    body: transformedBody,
    description: transformedDescription,
    changes: allChanges,
  };
}
