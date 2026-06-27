/**
 * 검증기 모듈
 * 변환된 스킬의 품질을 검증하고 성공/경고/실패로 분류합니다.
 */

/**
 * 검증 결과 상태
 */
export const STATUS = {
  SUCCESS: 'success',
  WARNING: 'warning',
  FAILED: 'failed',
};

/**
 * 단일 스킬을 검증합니다.
 */
export function validateSkill(parsedSkill, packageResult, originalSkill) {
  const issues = [];
  let status = STATUS.SUCCESS;

  // 1. SKILL.md 존재 여부
  if (!originalSkill.skillMdContent && !parsedSkill.originalContent) {
    issues.push({
      severity: 'error',
      code: 'MISSING_SKILL_MD',
      message: 'SKILL.md 파일을 찾을 수 없습니다.',
    });
    status = STATUS.FAILED;
  }

  // 2. Frontmatter 존재 여부
  if (!parsedSkill.hasFrontmatter) {
    issues.push({
      severity: 'warning',
      code: 'NO_FRONTMATTER',
      message: 'YAML frontmatter가 없습니다. 기본값이 자동 생성됩니다.',
    });
    if (status !== STATUS.FAILED) status = STATUS.WARNING;
  }

  // 3. Frontmatter 파싱 오류
  if (parsedSkill.parseError) {
    issues.push({
      severity: 'warning',
      code: 'FRONTMATTER_PARSE_ERROR',
      message: `Frontmatter 파싱 오류: ${parsedSkill.parseError}`,
    });
    if (status !== STATUS.FAILED) status = STATUS.WARNING;
  }

  // 4. name 필드 검증
  if (!parsedSkill.metadata.name) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_NAME',
      message: 'name 필드가 누락되었습니다. 폴더 이름에서 추론합니다.',
    });
    if (status !== STATUS.FAILED) status = STATUS.WARNING;
  } else if (parsedSkill.metadata.name.length > 64) {
    issues.push({
      severity: 'warning',
      code: 'NAME_TOO_LONG',
      message: `name이 64자를 초과합니다 (${parsedSkill.metadata.name.length}자). 잘림 처리됩니다.`,
    });
    if (status !== STATUS.FAILED) status = STATUS.WARNING;
  }

  // 5. description 필드 검증
  if (!parsedSkill.metadata.description) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_DESCRIPTION',
      message: 'description 필드가 누락되었습니다. 본문에서 추론을 시도합니다.',
    });
    if (status !== STATUS.FAILED) status = STATUS.WARNING;
  }

  // 6. 본문 길이 확인
  if (parsedSkill.body && parsedSkill.body.length > 50000) {
    issues.push({
      severity: 'warning',
      code: 'BODY_TOO_LONG',
      message: `본문이 매우 깁니다 (${parsedSkill.body.length}자). 컨텍스트 윈도우 영향이 있을 수 있습니다.`,
    });
    if (status !== STATUS.FAILED) status = STATUS.WARNING;
  }

  // 7. 누락 참조 파일
  if (originalSkill.relatedFiles) {
    const skippedFiles = originalSkill.relatedFiles.filter((f) => f.skipped);
    if (skippedFiles.length > 0) {
      issues.push({
        severity: 'warning',
        code: 'SKIPPED_FILES',
        message: `${skippedFiles.length}개 파일이 건너뛰어졌습니다.`,
        details: skippedFiles.map((f) => ({
          path: f.path,
          reason: f.skipReason,
        })),
      });
      if (status !== STATUS.FAILED) status = STATUS.WARNING;
    }
  }

  // 8. 로드 오류
  if (originalSkill.error) {
    issues.push({
      severity: 'error',
      code: 'LOAD_ERROR',
      message: `스킬 로드 실패: ${originalSkill.error}`,
    });
    status = STATUS.FAILED;
  }

  // 9. Claude 전용 참조 잔존 확인
  if (packageResult) {
    const skillMdFile = packageResult.files.find((f) =>
      f.path.endsWith('/SKILL.md')
    );
    if (skillMdFile && skillMdFile.content) {
      const claudeRefs = detectClaudeReferences(skillMdFile.content);
      if (claudeRefs.length > 0) {
        issues.push({
          severity: 'warning',
          code: 'CLAUDE_REFS_REMAINING',
          message: `변환 후에도 Claude 전용 참조가 ${claudeRefs.length}건 남아있습니다. 수동 확인 권장.`,
          details: claudeRefs,
        });
        if (status !== STATUS.FAILED) status = STATUS.WARNING;
      }
    }
  }

  return {
    skillName: parsedSkill.metadata.name || originalSkill.name,
    status,
    issues,
    issueCount: {
      errors: issues.filter((i) => i.severity === 'error').length,
      warnings: issues.filter((i) => i.severity === 'warning').length,
      info: issues.filter((i) => i.severity === 'info').length,
    },
  };
}

/**
 * 변환 후에도 남아있는 Claude 전용 참조를 감지합니다.
 */
export function detectClaudeReferences(content) {
  const refs = [];
  const patterns = [
    { pattern: /\.claude\//gi, label: '.claude/ 경로 참조' },
    { pattern: /CLAUDE\.md/g, label: 'CLAUDE.md 파일 참조' },
    { pattern: /claude\s+code/gi, label: '"Claude Code" 텍스트' },
    { pattern: /\/claude\s/gi, label: '/claude 명령어' },
  ];

  for (const { pattern, label } of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      refs.push({
        label,
        count: matches.length,
        examples: matches.slice(0, 3),
      });
    }
  }

  return refs;
}

/**
 * 전체 변환 결과를 요약합니다.
 */
export function summarizeValidation(validationResults) {
  const summary = {
    total: validationResults.length,
    success: 0,
    warning: 0,
    failed: 0,
    totalIssues: 0,
  };

  for (const result of validationResults) {
    summary[result.status]++;
    summary.totalIssues += result.issues.length;
  }

  return summary;
}
