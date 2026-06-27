/**
 * 수집기 모듈
 * GitHub 저장소 또는 로컬 폴더에서 Claude Code 스킬을 수집합니다.
 */

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * GitHub URL을 파싱하여 owner/repo 정보를 추출합니다.
 */
export function parseGitHubUrl(url) {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/\s#?]+)/,
    /^([^\/]+)\/([^\/\s]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      };
    }
  }
  return null;
}

/**
 * GitHub API를 사용하여 저장소의 전체 파일 트리를 가져옵니다.
 */
export async function fetchGitHubTree(owner, repo, branch = 'main', onLog) {
  const log = onLog || (() => {});

  log(`📡 GitHub API 호출: ${owner}/${repo} (branch: ${branch})`);

  // main 브랜치를 먼저 시도하고, 없으면 master로 시도
  const branches = [branch, 'master'];
  let treeData = null;
  let usedBranch = branch;

  for (const b of branches) {
    try {
      const res = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${b}?recursive=1`
      );
      if (res.ok) {
        treeData = await res.json();
        usedBranch = b;
        break;
      } else {
        if (res.status === 403) {
          throw new Error(`GitHub API 요청 제한(Rate Limit) 초과. 잠시 후 다시 시도해주세요.`);
        } else if (res.status !== 404) {
          throw new Error(`GitHub API 오류: ${res.status} ${res.statusText}`);
        }
      }
    } catch (e) {
      if (e.message.includes('Rate Limit') || e.message.includes('API 오류')) {
        throw e; // Rate Limit 등의 치명적 오류는 바로 던짐
      }
      // 404의 경우 다음 브랜치 시도
    }
  }

  if (!treeData) {
    throw new Error(`저장소를 찾을 수 없습니다 (또는 빈 저장소): ${owner}/${repo}`);
  }

  log(`✅ 트리 로드 완료 (${treeData.tree.length}개 항목, branch: ${usedBranch})`);

  return {
    tree: treeData.tree,
    branch: usedBranch,
    owner,
    repo,
  };
}

/**
 * GitHub 트리에서 스킬 파일을 찾습니다. (SKILL.md 및 단일 파일 프롬프트 포맷 지원)
 */
export function findSkillsInTree(tree) {
  const skills = [];
  const skillPattern = /(\.mdc|\.cursorrules|\.windsurfrules|\.prompt|SKILL\.md)$/i;

  const skillFiles = tree.filter(
    (item) => item.type === 'blob' && skillPattern.test(item.path)
  );

  for (const skillFile of skillFiles) {
    const isSingleFile = !skillFile.path.endsWith('SKILL.md');
    
    let skillDir = '';
    let skillName = '';
    
    if (isSingleFile) {
      skillDir = skillFile.path.includes('/') ? skillFile.path.substring(0, skillFile.path.lastIndexOf('/')) : '';
      skillName = skillFile.path.split('/').pop().replace(/\.[^/.]+$/, ""); // 확장자 제거
    } else {
      skillDir = skillFile.path === 'SKILL.md' ? '' : skillFile.path.replace(/\/SKILL\.md$/, '');
      skillName = skillDir ? skillDir.split('/').pop() : 'root-skill';
    }

    // 해당 스킬 디렉토리의 관련 파일 탐색 (단일 파일이 아닌 경우에만 폴더 내 전체 스캔)
    let relatedFiles = [];
    if (!isSingleFile) {
      relatedFiles = tree.filter(
        (item) =>
          item.type === 'blob' &&
          item.path !== skillFile.path &&
          (skillDir ? item.path.startsWith(skillDir + '/') : true)
      );
    }

    skills.push({
      name: skillName,
      directory: skillDir,
      skillMdPath: skillFile.path,
      skillMdSha: skillFile.sha,
      isSingleFile: isSingleFile,
      relatedFiles: relatedFiles.map((f) => ({
        path: f.path,
        sha: f.sha,
        size: f.size,
      })),
    });
  }

  return skills;
}

/**
 * GitHub에서 파일 내용을 가져옵니다.
 */
export async function fetchFileContent(owner, repo, path, branch = 'main') {
  const res = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
  );

  if (!res.ok) {
    throw new Error(`파일을 가져올 수 없습니다: ${path}`);
  }

  const data = await res.json();

  if (data.encoding === 'base64') {
    return atob(data.content.replace(/\n/g, ''));
  }

  return data.content || '';
}

/**
 * 로컬 텍스트 입력에서 스킬을 파싱합니다.
 * (웹 UI에서 직접 SKILL.md 텍스트를 붙여넣는 경우)
 */
export function parseLocalInput(text, name = 'pasted-skill') {
  return [
    {
      name,
      directory: '',
      skillMdContent: text,
      relatedFiles: [],
      source: 'local-paste',
    },
  ];
}

/**
 * 전체 수집 프로세스를 실행합니다.
 */
export async function collectSkills(input, onLog) {
  const log = onLog || (() => {});

  // GitHub URL인지 확인
  const ghInfo = parseGitHubUrl(input);

  if (ghInfo) {
    log(`🔍 GitHub 저장소 감지: ${ghInfo.owner}/${ghInfo.repo}`);
    const { tree, branch, owner, repo } = await fetchGitHubTree(
      ghInfo.owner,
      ghInfo.repo,
      'main',
      log
    );

    const skills = findSkillsInTree(tree);
    log(`📦 ${skills.length}개 스킬 발견`);

    // 각 스킬의 SKILL.md 내용 가져오기
    for (const skill of skills) {
      try {
        log(`📄 스킬 로드: ${skill.name}`);
        skill.skillMdContent = await fetchFileContent(
          owner,
          repo,
          skill.skillMdPath,
          branch
        );
        skill.source = 'github';
        skill.sourceUrl = `https://github.com/${owner}/${repo}`;

        // 관련 파일 내용 가져오기 (텍스트 파일만, 대용량 파일 제외)
        for (const file of skill.relatedFiles) {
          if (file.size && file.size > 500000) {
            file.skipped = true;
            file.skipReason = '파일 크기 초과 (500KB+)';
            continue;
          }
          try {
            file.content = await fetchFileContent(owner, repo, file.path, branch);
          } catch (e) {
            file.skipped = true;
            file.skipReason = e.message;
          }
        }
      } catch (e) {
        skill.error = e.message;
        log(`⚠️ 스킬 로드 실패: ${skill.name} - ${e.message}`);
      }
    }

    return { skills, source: { type: 'github', url: input, owner, repo, branch } };
  }

  // 로컬 텍스트 입력으로 처리
  log('📋 로컬 텍스트 입력으로 처리');
  const skills = parseLocalInput(input);
  return { skills, source: { type: 'local', path: input } };
}
