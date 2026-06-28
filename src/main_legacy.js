/**
 * Claude → Antigravity 스킬 변환기
 * 메인 애플리케이션 진입점
 */

import './style.css';
import { fetchAiRecommendation } from './core/ai-client.js';
import { t, setLang, getLang, applyTranslations } from './core/i18n.js';
import { installSkillToAI, uninstallSkillFromAI, getInstallState, showCustomAlert } from './core/installer.js';

// ─── 상태 관리 ───
let currentResults = null;

// ─── DOM 요소 ───
const elements = {
  skillList: document.getElementById('skill-list'),
};

// ─── 탭 전환 ───
let activeTab = 'github';

function switchTab(tab) {
  activeTab = tab;
  elements.tabGithub.classList.toggle('active', tab === 'github');
  elements.tabPaste.classList.toggle('active', tab === 'paste');
  elements.inputGithub.style.display = tab === 'github' ? 'block' : 'none';
  elements.inputPaste.style.display = tab === 'paste' ? 'block' : 'none';
}

elements.tabGithub.addEventListener('click', () => switchTab('github'));
elements.tabPaste.addEventListener('click', () => switchTab('paste'));

// ─── 로그 출력 ───
function addLog(message, type = '') {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = `${new Date().toLocaleTimeString('ko-KR')} ${message}`;
  elements.logContainer.appendChild(entry);
  elements.logContainer.scrollTop = elements.logContainer.scrollHeight;
}

function clearLogs() {
  elements.logContainer.innerHTML = '';
}

// ─── 진행 상태 표시 ───
function showProgress() {
  elements.progressSection.classList.add('visible');
  elements.resultsSection.classList.remove('visible');
  elements.progressBar.style.width = '0%';
  elements.progressBar.classList.add('indeterminate');
  clearLogs();
}

function updateProgress(percent) {
  elements.progressBar.classList.remove('indeterminate');
  elements.progressBar.style.width = `${percent}%`;
}

function hideProgress() {
  elements.progressBar.classList.remove('indeterminate');
  elements.progressBar.style.width = '100%';
}

// ─── 메인 변환 파이프라인 ───
async function runConversion(input) {
  const startTime = Date.now();
  showProgress();

  try {
    // 버튼 비활성화
    elements.btnConvert.disabled = true;
    elements.btnConvert.innerHTML = '<span class="spinner"></span> 변환 중...';

    // 1단계: 스킬 수집
    addLog('📡 스킬 수집 시작...');
    const { skills, source } = await collectSkills(input, addLog);

    if (skills.length === 0) {
      addLog('❌ 변환할 스킬을 찾을 수 없습니다.', 'error');
      return;
    }

    updateProgress(30);
    addLog(`✅ ${skills.length}개 스킬 수집 완료`, 'success');

    // 2단계: 규칙 로드
    addLog('📋 변환 규칙 로드...');
    const rules = loadRules();
    addLog(`✅ 규칙 로드 완료 (v${rules.version})`, 'success');

    // 3단계: 각 스킬을 파싱, 변환, 패키징, 검증
    const packages = [];
    const validationResults = [];
    const totalSkills = skills.length;

    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      const progress = 30 + ((i + 1) / totalSkills) * 60;
      updateProgress(progress);

      addLog(`🔧 [${i + 1}/${totalSkills}] ${skill.name} 처리 중...`);

      if (skill.error || !skill.skillMdContent) {
        // 로드 실패된 스킬 처리
        const parsed = {
          hasFrontmatter: false,
          frontmatter: {},
          body: '',
          metadata: { name: skill.name, description: '' },
          sections: [],
          originalContent: '',
        };
        const validation = validateSkill(parsed, null, skill);
        validationResults.push(validation);
        packages.push({ name: skill.name, files: [], changes: [] });
        addLog(`❌ ${skill.name}: 로드 실패`, 'error');
        continue;
      }

      // 파싱
      const parsed = parseSkillMd(skill.skillMdContent, skill.name);

      // 이름이 비어있으면 디렉토리 이름 사용
      if (!parsed.metadata.name && skill.name) {
        parsed.metadata.name = skill.name;
      }

      // 변환 규칙 적용
      const transformed = applyAllRules(parsed, rules);

      // 패키징
      const pkg = packageSkill(parsed, transformed, skill);
      packages.push(pkg);

      // 검증
      const validation = validateSkill(parsed, pkg, skill);
      validationResults.push(validation);

      const statusIcon =
        validation.status === 'success' ? '✅' :
          validation.status === 'warning' ? '⚠️' : '❌';
      addLog(
        `${statusIcon} ${skill.name}: ${validation.status} (이슈 ${validation.issues.length}건)`
      );
    }

    // 4단계: 결과 요약
    updateProgress(95);
    const summary = summarizeValidation(validationResults);
    const timestamp = new Date().toISOString();

    addLog('─'.repeat(40));
    addLog(
      `📊 완료! 전체: ${summary.total}, 성공: ${summary.success}, 경고: ${summary.warning}, 실패: ${summary.failed}`,
      'success'
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    addLog(`⏱️ 소요 시간: ${elapsed}초`, 'success');

    updateProgress(100);
    hideProgress();

    // 결과 저장
    currentResults = {
      source,
      summary,
      validationResults,
      packages,
      timestamp,
      jsonReport: generateJsonReport(source, summary, validationResults, packages, timestamp),
      htmlReport: generateHtmlReport(source, summary, validationResults, packages, timestamp),
      downloadablePackage: createDownloadablePackage(packages),
    };

    // 결과 렌더링
    renderResults(currentResults);
  } catch (error) {
    addLog(`❌ 오류 발생: ${error.message}`, 'error');
    console.error(error);
  } finally {
    elements.btnConvert.disabled = false;
    elements.btnConvert.innerHTML = '🔄 변환 시작';
  }
}

// ─── 결과 렌더링 ───
function renderResults(results) {
  const { summary, validationResults, packages } = results;

  // 통계 카운터 애니메이션으로 업데이트
  animateCounter(elements.statTotal, summary.total);
  animateCounter(elements.statSuccess, summary.success);
  animateCounter(elements.statWarning, summary.warning);
  animateCounter(elements.statFailed, summary.failed);

  // 스킬 카드 렌더링
  elements.skillList.innerHTML = '';

  const statusWeight = {
    'success': 1,
    'warning': 2,
    'failed': 3
  };

  const combined = validationResults.map((vr, index) => ({
    vr,
    pkg: packages[index]
  }));

  combined.sort((a, b) => statusWeight[a.vr.status] - statusWeight[b.vr.status]);

  combined.forEach(({ vr, pkg }) => {
    const card = createSkillCard(vr, pkg);
    elements.skillList.appendChild(card);
  });

  // 결과 섹션 표시
  elements.resultsSection.classList.add('visible');

  // 결과로 부드럽게 스크롤
  setTimeout(() => {
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
}

function animateCounter(element, target) {
  const duration = 600;
  const start = 0;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(start + (target - start) * eased);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function createSkillCard(validationResult, pkg) {
  const card = document.createElement('div');
  card.className = 'skill-card';
  card.dataset.status = validationResult.status;

  const issueCount = validationResult.issues.length;
  const fileCount = pkg ? pkg.files.length : 0;
  const changeCount = pkg ? pkg.changes.length : 0;

  card.innerHTML = `
    <div class="skill-card-header">
      <div class="skill-status-dot ${validationResult.status}"></div>
      <div class="skill-card-info">
        <div class="skill-card-name">${validationResult.skillName}</div>
        <div class="skill-card-meta">
          ${fileCount}개 파일 · ${changeCount}건 변환 · ${issueCount}건 이슈
        </div>
      </div>
      <span class="skill-card-badge ${validationResult.status}">
        ${validationResult.status.toUpperCase()}
      </span>
      <span class="skill-card-chevron">▼</span>
    </div>
    <div class="skill-card-body">
      ${issueCount > 0 ? `
        <div class="detail-section">
          <div class="detail-section-title">🔍 이슈</div>
          <ul class="detail-list">
            ${validationResult.issues.map(issue => `
              <li>
                <span style="color: ${issue.severity === 'error' ? 'var(--accent-red)' : 'var(--accent-amber)'}; font-weight: 600;">
                  [${issue.code}]
                </span>
                ${issue.message}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      ${changeCount > 0 ? `
        <div class="detail-section">
          <div class="detail-section-title">🔄 적용된 변환</div>
          <ul class="detail-list">
            ${pkg.changes.map(c => `
              <li>
                <code style="color: var(--accent-red);">${c.from}</code>
                →
                <code style="color: var(--accent-green);">${c.to}</code>
                ${c.count ? `(${c.count}건)` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      ${pkg && pkg.files.length > 0 ? `
        <div class="detail-section">
          <div class="detail-section-title">📁 생성 파일</div>
          <ul class="detail-list">
            ${pkg.files.map(f => `
              <li><code>${f.path}</code></li>
            `).join('')}
          </ul>
        </div>
        ${pkg.files[0] ? `
          <div class="detail-section">
            <div class="detail-section-title">👁️ SKILL.md 미리보기</div>
            <div class="preview-panel">
              <div class="preview-header">
                <span class="preview-filename">${pkg.files[0].path}</span>
                <div style="display: flex; gap: 0.5rem;">
                  <button class="btn btn-ghost btn-copy-preview" data-content="${encodeURIComponent(pkg.files[0].content)}">
                    📋 복사
                  </button>
                  <button class="btn btn-secondary btn-download-single" data-filename="${pkg.files[0].path.replace(/\//g, '_')}" data-content="${encodeURIComponent(pkg.files[0].content)}" style="padding: 4px 12px; font-size: 0.85rem; height: auto;">
                    ⬇️ 개별 다운로드
                  </button>
                  <button class="btn btn-primary btn-install-preview" data-id="${validationResult.skillName}" data-content="${encodeURIComponent(pkg.files[0].content)}" style="padding: 4px 12px; font-size: 0.85rem; height: auto;">
                    🚀 내 IDE에 설치
                  </button>
                </div>
              </div>
              <pre class="preview-content">${escapeHtml(pkg.files[0].content)}</pre>
            </div>
          </div>
        ` : ''}
      ` : ''}
    </div>
  `;

  // 카드 확장/축소 토글
  const header = card.querySelector('.skill-card-header');
  header.addEventListener('click', () => {
    card.classList.toggle('expanded');
  });

  // 복사 버튼
  const copyBtn = card.querySelector('.btn-copy-preview');
  if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const content = decodeURIComponent(copyBtn.dataset.content);
      navigator.clipboard.writeText(content).then(() => {
        copyBtn.textContent = '✅ 복사됨!';
        setTimeout(() => { copyBtn.textContent = '📋 복사'; }, 2000);
      });
    });
  }

  // 설치 버튼
  const installBtn = card.querySelector('.btn-install-preview');
  if (installBtn) {
    installBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const content = decodeURIComponent(installBtn.dataset.content);
      const mockSkill = {
        id: installBtn.dataset.id,
        name: installBtn.dataset.id,
        description: '변환된 스킬',
        skillContent: content
      };
      openInstallModal(mockSkill);
    });
  }

  // 개별 다운로드 버튼
  const downloadSingleBtn = card.querySelector('.btn-download-single');
  if (downloadSingleBtn) {
    downloadSingleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const content = decodeURIComponent(downloadSingleBtn.dataset.content);
      const filename = downloadSingleBtn.dataset.filename || `skill-${Date.now()}.md`;
      downloadReport(content, filename, 'text/plain');
    });
  }

  return card;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ─── 이벤트 리스너 ───

// 변환 버튼
elements.btnConvert.addEventListener('click', () => {
  let input = '';

  if (activeTab === 'github') {
    input = elements.githubUrl.value.trim();
    if (!input) {
      elements.githubUrl.focus();
      elements.githubUrl.style.borderColor = 'var(--accent-red)';
      setTimeout(() => {
        elements.githubUrl.style.borderColor = '';
      }, 2000);
      return;
    }
  } else {
    input = elements.pasteContent.value.trim();
    if (!input) {
      elements.pasteContent.focus();
      elements.pasteContent.style.borderColor = 'var(--accent-red)';
      setTimeout(() => {
        elements.pasteContent.style.borderColor = '';
      }, 2000);
      return;
    }
  }

  runConversion(input);
});

// 샘플 테스트 버튼
elements.btnSample.addEventListener('click', () => {
  // 테스트용 샘플 SKILL.md 로드
  switchTab('paste');
  elements.pasteContent.value = `---
name: code-reviewer
description: 코드 변경 사항의 보안 취약점, 스타일 문제, 모범 사례를 검토합니다. 사용자가 코드 리뷰를 요청할 때 실행됩니다.
version: 1.0.0
author: anthropic
tags:
  - development
  - security
  - code-review
allowed-tools:
  - Read
  - Grep
  - Glob
---

# 코드 리뷰어 스킬

## 개요
이 스킬은 Claude Code 프로젝트의 코드 변경 사항을 체계적으로 검토하기 위한 체크리스트를 제공합니다.

## 사용 시점
- 사용자가 코드 리뷰를 요청할 때
- 풀 리퀘스트를 검토할 때
- 중요한 변경 사항을 머지하기 전

## 지침
1. \`.claude/skills/code-reviewer/\` 패턴을 사용하여 변경된 파일을 읽습니다.
2. SQL 인젝션, XSS 등 OWASP Top 10 취약점을 확인합니다.
3. 네이밍 컨벤션이 프로젝트의 CLAUDE.md 가이드라인을 따르는지 검증합니다.
4. 적절한 에러 처리와 엣지 케이스를 확인합니다.
5. 성능 이슈와 불필요한 복잡성을 찾습니다.
6. 심각도 수준별 요약을 제공합니다.

## 출력 형식
\`\`\`markdown
## 코드 리뷰 요약

### 심각한 문제
- [심각한 보안 또는 로직 문제 목록]

### 경고
- [잠재적 문제 목록]

### 개선 제안
- [개선 아이디어 목록]

### 종합 평가
[간략한 종합 평가]
\`\`\`

## 사용 예시
- "src/auth.js 변경 사항을 리뷰해줘" → 전체 보안 리뷰 실행
- "utils.py 간단히 리뷰해줘" → 간략한 스타일 검사 실행
`;

  addLog('📦 샘플 스킬 로드됨', 'success');
  runConversion(elements.pasteContent.value);
});

// GitHub URL 입력창에서 Enter 키 처리
elements.githubUrl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    elements.btnConvert.click();
  }
});

// 다운로드 버튼들
elements.btnDownloadJson.addEventListener('click', () => {
  if (!currentResults) return;
  downloadReport(
    currentResults.jsonReport,
    `skill-conversion-report-${Date.now()}.json`,
    'application/json'
  );
});

elements.btnDownloadHtml.addEventListener('click', () => {
  if (!currentResults) return;
  downloadReport(
    currentResults.htmlReport,
    `skill-conversion-report-${Date.now()}.html`,
    'text/html'
  );
});

elements.btnDownloadPack.addEventListener('click', () => {
  if (!currentResults) return;

  // 성공 및 경고 상태인 패키지만 필터링 (실패 제외)
  const successfulPackages = currentResults.packages.filter((pkg, i) => {
    return currentResults.validationResults[i].status !== 'failed';
  });

  if (successfulPackages.length === 0) {
    alert('다운로드할 수 있는 성공한 스킬이 없습니다.');
    return;
  }

  // 성공한 패키지만 포함하여 다운로드 객체 생성
  const files = createDownloadablePackage(successfulPackages);
  if (files.length === 0) return;

  // 각 SKILL.md (혹은 단일 파일) 다운로드
  for (const file of files) {
    if (file.path.endsWith('/SKILL.md') || file.path.endsWith('.mdc') || file.path.endsWith('.cursorrules')) {
      downloadReport(file.content, file.path.replace(/\//g, '_'), 'text/plain');
    }
  }

  // 전체 패키지도 JSON으로 다운로드
  downloadReport(
    { files: files.map(f => ({ path: f.path, content: f.content, type: f.type })) },
    `antigravity-pack-success-${Date.now()}.json`,
    'application/json'
  );
});

// ─── 글래스 카드 글로우 효과용 마우스 추적 ───
document.addEventListener('mousemove', (e) => {
  const cards = document.querySelectorAll('.glass-card');
  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  });
});

// ─── 초기화 ───
console.log('🔄 Claude → Antigravity 스킬 변환기 로드 완료');
applyTranslations(); // 초기 언어 적용

// ─── 로그인(접근 제어) 로직 ───
const validUsers = {
  'master': 'admin1234!',
  'member01': 'member1234!'
};
const viewWebzine = document.getElementById('view-webzine');
const overlay = document.getElementById('login-overlay');
const appContainer = document.getElementById('app');
const loginInput = document.getElementById('login-id');
const passwordInput = document.getElementById('login-password');
const btnLogin = document.getElementById('btn-login');
const btnOpenLogin = document.getElementById('btn-open-login');
const btnCloseLogin = document.getElementById('btn-close-login');
const loginError = document.getElementById('login-error');
const btnLogout = document.getElementById('btn-logout');

export function checkLogin() {
  const loggedInUser = localStorage.getItem('antigravity_user_id');
  if (loggedInUser && Object.keys(validUsers).includes(loggedInUser)) {
    if(overlay) overlay.style.display = 'none';
    if(viewWebzine) viewWebzine.style.display = 'none';
    if(appContainer) appContainer.style.display = 'block';
  } else {
    if(overlay) overlay.style.display = 'none'; // Modal hidden by default
    if(viewWebzine) viewWebzine.style.display = 'block';
    if(appContainer) appContainer.style.display = 'block'; // Patched to always show
  }
}

if (btnOpenLogin) {
  if (btnOpenLogin) btnOpenLogin.addEventListener('click', () => {
    if(overlay) overlay.style.display = 'flex';
    if(loginInput) loginInput.focus();
  });
}

if (btnCloseLogin) {
  if (btnCloseLogin) btnCloseLogin.addEventListener('click', () => {
    if(overlay) overlay.style.display = 'none';
  });
}

if (btnLogin) {
  if (btnLogin) btnLogin.addEventListener('click', () => {
    const userId = loginInput.value.trim();
    const userPw = passwordInput ? passwordInput.value.trim() : '';
    
    if (validUsers[userId] && validUsers[userId] === userPw) {
      localStorage.setItem('antigravity_user_id', userId);
      loginError.style.display = 'none';
      checkLogin();
      
      // 로그인 성공 시 데이터 로드
      if (typeof loadMarketplaceData === 'function' && !marketState.loaded) {
        loadMarketplaceData();
      }
    } else {
      loginError.style.display = 'block';
    }
  });

  if (loginInput) loginInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (passwordInput) passwordInput.focus();
      else btnLogin.click();
    }
  });
  
  if (passwordInput) {
    if (passwordInput) passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnLogin.click();
    });
  }
}

if (btnLogout) {
  if (btnLogout) btnLogout.addEventListener('click', () => {
    localStorage.removeItem('antigravity_user_id');
    if(loginInput) loginInput.value = '';
    if(passwordInput) passwordInput.value = '';
    checkLogin();
  });
}

checkLogin();

const langToggleBtn = document.getElementById('btn-lang-toggle');
if (langToggleBtn) {
  if (langToggleBtn) langToggleBtn.addEventListener('click', () => {
    const newLang = getLang() === 'ko' ? 'en' : 'ko';
    setLang(newLang);
    if (marketState.loaded) {
      renderCategories();
      renderMarketSkills();
    }
  });
}

// ============================================
// ─── 마켓플레이스 로직 복구 ───
// ============================================

const marketState = {
  data: { categories: [], skills: [] },
  activeCategory: 'all',
  searchQuery: '',
  loaded: false,
  installed: [],
  visibleCount: 20,
  recommendedIds: []
};

// 1. JSON에서 데이터 로드
async function loadMarketplaceData() {
  const grid = document.getElementById('market-skill-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:2rem;">⏳ 스킬 목록 로딩 중...</div>';

  try {
    // 설치된 스킬 목록 먼저 로드
    try {
      // 클라우드 환경이므로 로컬 IDE 폴더 조회를 생략합니다.
      marketState.installed = [];
    } catch (e) {
      console.error('설치된 스킬 목록 조회 실패:', e);
    }

    const res = await fetch('/data/skill-registry.json?t=' + Date.now());
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    marketState.data = data;
    marketState.loaded = true;
    renderCategories();
    renderMarketSkills();

    // 검색창 실시간 필터링 및 버튼 이벤트 연동
    const searchInput = document.getElementById('search-input');
    const btnSearch = document.getElementById('btn-search');
    
    const handleSearch = () => {
      marketState.searchQuery = searchInput.value.trim();
      marketState.recommendedIds = []; // 검색 시 AI 추천 결과 초기화
      renderMarketSkills();
    };

    if (searchInput) {
      searchInput.addEventListener('input', handleSearch);
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
      });
    }
    if (btnSearch) {
      if (btnSearch) btnSearch.addEventListener('click', handleSearch);
    }
  } catch (err) {
    console.error('스킬 데이터 로드 실패:', err);
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:2rem;display:flex;flex-direction:column;align-items:center;gap:1rem;"><div class="spinner"></div><div>로딩중입니다...</div></div>';
  }
}

// 2. 카테고리 렌더링
function renderCategories() {
  const container = document.getElementById('category-list');
  if (!container || !marketState.data.categories) return;

  container.innerHTML = marketState.data.categories.map(cat => {
    const count = cat.id === 'all'
      ? marketState.data.skills.length
      : marketState.data.skills.filter(s => s.categoryId === cat.id).length;
    return `
    <li class="category-item ${cat.id === marketState.activeCategory ? 'active' : ''}" data-id="${cat.id}">
      <span class="category-name">${cat.name}</span>
      <span class="category-count">${count}</span>
    </li>
    `;
  }).join('');

  container.querySelectorAll('.category-item').forEach(el => {
    el.addEventListener('click', () => {
      container.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
      el.classList.add('active');
      marketState.activeCategory = el.dataset.id;
      // 카테고리를 직접 클릭했다는 것은 추천 필터를 해제하고 전체를 보겠다는 의미이므로 초기화
      marketState.recommendedIds = [];
      renderMarketSkills();
    });
  });
}

// 3. 스킬 그리드 렌더링
function renderMarketSkills(append = false) {
  const container = document.getElementById('market-skill-grid');
  if (!container) return;

  // 동적 타이틀 변경 (현재 카테고리 이름으로 표시)
  const marketTitle = document.querySelector('.marketplace-header h2');
  if (marketTitle && !append) {
    if (marketState.activeCategory === 'all' || marketState.recommendedIds.length > 0) {
      marketTitle.textContent = t('market_title');
      marketTitle.setAttribute('data-i18n', 'market_title');
    } else {
      const activeCatObj = marketState.data.categories.find(c => c.id === marketState.activeCategory);
      if (activeCatObj) {
        marketTitle.textContent = activeCatObj.name;
        marketTitle.removeAttribute('data-i18n');
      }
    }
  }

  if (!append) {
    container.innerHTML = '';
    marketState.visibleCount = 20;
  } else {
    // 기존에 있던 더보기 버튼 제거
    const existingBtn = document.getElementById('load-more-btn');
    if (existingBtn) existingBtn.remove();
  }
  
  let filtered = marketState.data.skills.filter(skill => {
    const matchCat = marketState.activeCategory === 'all' || skill.categoryId === marketState.activeCategory;
    const matchQuery = marketState.searchQuery === '' || 
      skill.name.toLowerCase().includes(marketState.searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(marketState.searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  if (marketState.recommendedIds && marketState.recommendedIds.length > 0) {
    filtered = filtered.filter(s => marketState.recommendedIds.includes(s.id));
    filtered.sort((a, b) => marketState.recommendedIds.indexOf(a.id) - marketState.recommendedIds.indexOf(b.id));
  } else {
    // 설치된 스킬 우선 정렬
    filtered.sort((a, b) => {
      const aInstalled = !!getInstallState(a.id);
      const bInstalled = !!getInstallState(b.id);
      if (aInstalled && !bInstalled) return -1;
      if (!aInstalled && bInstalled) return 1;
      return 0;
    });
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">검색 결과가 없습니다.</div>`;
    return;
  }
  
  const visibleSkills = filtered.slice(append ? marketState.visibleCount - 20 : 0, marketState.visibleCount);

  // GitHub 검색 링크 배너 제거됨

  visibleSkills.forEach((skill, index) => {
    const aiInstalled = getInstallState(skill.id);
    const tagsHtml = skill.tags.map(t => `<span class="market-tag">#${t}</span>`).join('');
    const sourceLink = skill.sourceUrl
      ? `<a href="${skill.sourceUrl}" target="_blank" class="market-source-link" title="GitHub 원본">${t('btn_github_source')}</a>`
      : '';
    const rating = parseFloat(skill.rating) || 4.5;

    const isPlaceholder = skill.sourceUrl && skill.sourceUrl.includes('github.com/search');
    
    let actionButton = '';
    if (aiInstalled) {
      actionButton = `
        <button class="btn-uninstall" data-id="${skill.id}" style="background: white; color: var(--text-secondary); border: 1px solid var(--border-primary); padding: 0.8rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: all 0.2s;">
          ✅ 추가됨
        </button>
      `;
    } else {
      actionButton = `
        <button class="btn-install" data-id="${skill.id}" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 0.8rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(59,130,246,0.2);">
          ⬇️ 추가하기
        </button>
      `;
    }

    const isRecommended = marketState.recommendedIds && marketState.recommendedIds.includes(skill.id);
    const badgeHtml = isRecommended ? `<span class="market-tag" style="background: linear-gradient(135deg, #6366f1, #ec4899); color: white; border: none; font-weight: bold; margin-bottom: 0.5rem; display: inline-block;">✨ AI 추천</span>` : '';

    let authorBadgeHtml = '';
    if (skill.author === 'AI Super Skill') {
      authorBadgeHtml = `<span class="market-tag" style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; border: none; font-weight: bold; margin-bottom: 0.5rem; display: inline-block;">👑 공식 인증 스킬</span>`;
    } else {
      authorBadgeHtml = `<span class="market-tag" style="background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border-primary); margin-bottom: 0.5rem; display: inline-block; font-size: 0.75rem;">🛡️ 검증된 스킬</span>`;
    }

    let statusBadge = '';
    // 모의(Mock) 데이터: 인덱스를 기반으로 최근 등록/업데이트된 스킬에 뱃지 부여
    if (skill.status === 'new' || index === 0 || index === 3) {
      statusBadge = '<div class="skill-badge">✨ NEW</div>';
    } else if (skill.status === 'updated' || index === 1 || index === 5) {
      statusBadge = '<div class="skill-badge updated">🚀 UPDATED</div>';
    }

    const card = document.createElement('div');
    card.className = 'market-card';
    if (isRecommended) {
      card.style.border = '2px solid #ec4899';
      card.style.boxShadow = '0 0 15px rgba(236, 72, 153, 0.3)';
    }
    
    card.innerHTML = `
      ${statusBadge}
      <div class="market-card-header">
        <div>
          ${badgeHtml}
          ${authorBadgeHtml}
          <div class="market-card-title">${skill.name}</div>
          <div class="market-card-author">${t('skill_author')} ${skill.author} | v${skill.version}${skill.createdAt ? ` | 📅 ${skill.createdAt}` : ''}</div>
        </div>
        <div class="market-card-rating">★ ${rating.toFixed(1)}</div>
      </div>
      <div class="market-card-desc">${skill.description}</div>
      <div class="market-card-tags">${tagsHtml}</div>
      <div class="market-card-footer">
        <div style="font-size: 0.75rem; color: var(--text-muted);">⬇️ ${skill.downloads.toLocaleString()}</div>
        ${sourceLink}
        ${actionButton}
      </div>
    `;
    
    // 설치/삭제 버튼 이벤트
    if (!isPlaceholder) {
      if (aiInstalled) {
        const uninstallBtn = card.querySelector('.btn-uninstall');
        uninstallBtn.addEventListener('click', async () => {
          const success = await uninstallSkillFromAI(aiInstalled, skill.id);
          if (success) renderMarketSkills();
        });
      } else {
        const installBtn = card.querySelector('.btn-install');
        installBtn.addEventListener('click', async () => {
          const success = await installSkillToAI('ide', skill);
          if (success) {
            renderMarketSkills();
          }
        });
      }
    }
    
    container.appendChild(card);
  });

  // 더보기 버튼 추가
  if (filtered.length > marketState.visibleCount) {
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.id = 'load-more-btn';
    loadMoreBtn.className = 'btn';
    loadMoreBtn.style.gridColumn = '1 / -1';
    loadMoreBtn.style.margin = '20px auto';
    loadMoreBtn.style.display = 'flex';
    loadMoreBtn.style.justifyContent = 'center';
    loadMoreBtn.style.background = 'var(--bg-card)';
    loadMoreBtn.style.color = 'var(--text-primary)';
    loadMoreBtn.textContent = t('btn_load_more');
    loadMoreBtn.addEventListener('click', () => {
      marketState.visibleCount += 20;
      renderMarketSkills(true);
    });
    container.appendChild(loadMoreBtn);
  }
}

// 3.5 내 스킬 관리 (프로그램 추가/삭제 UI) 렌더링
async function renderMySkills() {
  const container = document.getElementById('my-skills-list-container');
  if (!container) return;
  
  const installedStates = JSON.parse(localStorage.getItem('installed_skills') || '{}');
  const installedIds = Object.keys(installedStates);
  
  if (installedIds.length === 0) {
    container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">설치된 스킬이 없습니다. 마켓플레이스에서 스킬을 설치해보세요!</div>';
    return;
  }
  
  container.innerHTML = '';
  
  installedIds.forEach(id => {
    const aiType = installedStates[id];
    const skill = marketState.data.skills.find(s => s.id === id) || { id, name: id, description: 'Unknown Skill' };
    
    const row = document.createElement('div');
    row.style.cssText = 'padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-primary); display: grid; grid-template-columns: 2fr 1fr 80px; align-items: center;';
    
    // Name col
    const nameCol = document.createElement('div');
    nameCol.innerHTML = `<div style="font-weight: 500; margin-bottom: 4px;">${skill.name}</div><div style="font-size: 0.85rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${skill.description}</div>`;
    
    // AI col
    const aiCol = document.createElement('div');
    aiCol.style.color = 'var(--accent-indigo)';
    aiCol.innerHTML = `<span>${aiType}</span>`;
    
    // Action col
    const actionCol = document.createElement('div');
    actionCol.style.textAlign = 'right';
    const btnDel = document.createElement('button');
    btnDel.className = 'btn';
    btnDel.style.cssText = 'background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 6px 12px; font-size: 0.85rem;';
    btnDel.textContent = '삭제';
    
    btnDel.addEventListener('click', async () => {
      btnDel.disabled = true;
      btnDel.textContent = '삭제중...';
      const success = await uninstallSkillFromAI(aiType, id);
      if (success) {
        renderMySkills();
        renderMarketSkills();
      } else {
        btnDel.disabled = false;
        btnDel.textContent = '삭제';
      }
    });
    
    actionCol.appendChild(btnDel);
    
    row.appendChild(nameCol);
    row.appendChild(aiCol);
    row.appendChild(actionCol);
    container.appendChild(row);
  });
}

// 4. 검색창 이벤트
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    marketState.searchQuery = e.target.value;
    // 검색할 때는 AI 추천 필터 해제 및 전체 카테고리로 강제 전환
    if (e.target.value.trim() !== '') {
      marketState.recommendedIds = [];
      marketState.activeCategory = 'all'; // 검색 시 무조건 전체 카테고리에서 찾기
      renderCategories(); // 탭 UI 업데이트
    }
    renderMarketSkills();
  });
}

// 5. 멀티 AI 설치 모달 로직
let currentInstallSkill = null;
let currentInstallAiType = null;

function openInstallModal(skill) {
  currentInstallSkill = skill;
  
  // 모달 상단 '상품 요약부' 렌더링
  document.getElementById('modal-title').textContent = skill.name || skill.id;
  document.getElementById('modal-filename').textContent = skill.description || '이 스킬을 적용할 방식을 선택하세요.';
  
  const dateAuthor = document.getElementById('modal-date-author');
  if (dateAuthor) {
    dateAuthor.textContent = skill.createdAt || '최근 등록됨';
  }
  
  document.getElementById('install-modal').style.display = 'flex';
  
  const okBtn = document.getElementById('install-modal-ok');
  okBtn.disabled = true;
  okBtn.style.background = 'var(--bg-secondary)';
  okBtn.style.color = 'var(--text-muted)';
  
  document.getElementById('install-btn-icon').textContent = '📦';
  document.getElementById('install-btn-text').textContent = '적용 방식을 선택하세요';
  
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.style.borderColor = 'transparent';
    btn.style.background = 'var(--bg-primary)';
  });
}

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // 모든 버튼 초기화
    document.querySelectorAll('.preset-btn').forEach(b => {
      b.style.borderColor = 'transparent';
      b.style.background = 'var(--bg-primary)';
    });
    
    // 선택된 버튼 하이라이트
    btn.style.borderColor = 'var(--accent-indigo)';
    btn.style.background = 'rgba(99, 102, 241, 0.1)';
    
    currentInstallAiType = btn.dataset.ai;
    
    // 결제 액션 버튼 동적 변경
    const okBtn = document.getElementById('install-modal-ok');
    okBtn.disabled = false;
    okBtn.style.background = 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))';
    okBtn.style.color = 'white';
    
    const iconEl = document.getElementById('install-btn-icon');
    const textEl = document.getElementById('install-btn-text');
    
    if (currentInstallAiType === 'clipboard') {
      iconEl.textContent = '📋';
      textEl.textContent = '프롬프트 즉시 복사하기';
    } else {
      let ideName = 'IDE';
      if (currentInstallAiType === 'cursor') ideName = 'Cursor';
      if (currentInstallAiType === 'windsurf') ideName = 'Windsurf';
      if (currentInstallAiType === 'copilot') ideName = 'Copilot';
      iconEl.textContent = '🚀';
      textEl.textContent = `${ideName} 스킬 폴더 지정하기`;
    }
  });
});

document.getElementById('install-modal-cancel')?.addEventListener('click', () => {
  document.getElementById('install-modal').style.display = 'none';
});

document.getElementById('install-modal-close')?.addEventListener('click', () => {
  document.getElementById('install-modal').style.display = 'none';
});

document.getElementById('install-modal-ok')?.addEventListener('click', async () => {
  if (!currentInstallSkill || !currentInstallAiType) return;
  document.getElementById('install-modal').style.display = 'none';
  const success = await installSkillToAI(currentInstallAiType, currentInstallSkill);
  if (success) {
    renderMarketSkills();
  }
});

// 6. 자체 스마트 추천 로직 및 모달 이벤트
const btnAiRecommend = document.getElementById('btn-ai-recommend');
const aiModal = document.getElementById('ai-modal');
const aiModalClose = document.getElementById('ai-modal-close');
const aiModalBackdrop = document.getElementById('ai-modal-backdrop');
const btnAiSubmit = document.getElementById('btn-ai-submit');
const aiQueryInput = document.getElementById('ai-query-input');
const aiLoading = document.getElementById('ai-loading');

// 7. 시스템 설정 모달 (API Key)
const btnAiSettings = document.getElementById('btn-ai-settings');
const aiSettingsModal = document.getElementById('ai-settings-modal');
const aiSettingsClose = document.getElementById('ai-settings-close');
const aiSettingsBackdrop = document.getElementById('ai-settings-backdrop');
const btnAiSettingsSave = document.getElementById('btn-ai-settings-save');
const aiApikeyInput = document.getElementById('ai-apikey-input');

function getAiConfig() {
  const apiKey = localStorage.getItem('gemini_api_key') || '';
  return { apiKey };
}

function saveAiConfig(apiKey) {
  localStorage.setItem('gemini_api_key', apiKey);
}

function openSettingsModal() {
  const config = getAiConfig();
  if (aiApikeyInput) aiApikeyInput.value = config.apiKey;
  if (aiSettingsModal) aiSettingsModal.style.display = 'flex';
}

function closeSettingsModal() {
  if (aiSettingsModal) aiSettingsModal.style.display = 'none';
}

if (btnAiSettings) btnAiSettings.addEventListener('click', openSettingsModal);
if (aiSettingsClose) aiSettingsClose.addEventListener('click', closeSettingsModal);
if (aiSettingsBackdrop) aiSettingsBackdrop.addEventListener('click', closeSettingsModal);

if (btnAiSettingsSave) {
  btnAiSettingsSave.addEventListener('click', () => {
    const apiKey = aiApikeyInput.value.trim();
    saveAiConfig(apiKey);
    aiSettingsModal.style.display = 'none';
    
    // 버튼 텍스트 변경 피드백
    const oldText = btnAiSettingsSave.textContent;
    btnAiSettingsSave.textContent = '저장됨!';
    setTimeout(() => { btnAiSettingsSave.textContent = oldText; }, 1500);
  });
}

const aiModeBadge = document.getElementById('ai-mode-badge');

if (btnAiRecommend) {
  btnAiRecommend.addEventListener('click', () => {
    aiModal.style.display = 'flex';
    aiQueryInput.focus();
    
    // API 키 유무에 따른 모드 배지 업데이트
    if (aiModeBadge) {
      const config = getAiConfig();
      if (config.apiKey) {
        aiModeBadge.style.background = 'rgba(99, 102, 241, 0.1)';
        aiModeBadge.style.color = '#4f46e5';
        aiModeBadge.innerHTML = '✨ <strong>고성능 AI (Gemini) 추천 모드</strong> 활성화 됨';
      } else {
        aiModeBadge.style.background = 'rgba(100, 116, 139, 0.1)';
        aiModeBadge.style.color = '#475569';
        aiModeBadge.innerHTML = '⚡ <strong>초고속 키워드 검색 모드</strong> 작동 중 <span style="font-weight:400; font-size:0.75rem; margin-left:4px;">(설정에서 API 등록시 AI 문맥추천 지원)</span>';
      }
    }
  });
}

if (aiModalClose) {
  aiModalClose.addEventListener('click', () => {
    aiModal.style.display = 'none';
  });
}

if (aiModalBackdrop) {
  aiModalBackdrop.addEventListener('click', () => {
    aiModal.style.display = 'none';
  });
}

if (btnAiSubmit) {
  btnAiSubmit.addEventListener('click', async () => {
    const query = aiQueryInput.value.trim();
    if (!query) {
      await showCustomAlert('어떤 작업을 하실지 자유롭게 입력해주세요.', '알림', '💡');
      aiQueryInput.focus();
      return;
    }

    const config = getAiConfig();

    try {
      btnAiSubmit.disabled = true;
      aiLoading.style.display = 'flex';

      const recommendedIds = await fetchAiRecommendation(query, marketState.data.skills, config.apiKey);
      
      if (!recommendedIds || recommendedIds.length === 0) {
        await showCustomAlert('입력하신 내용과 일치하는 스킬을 찾을 수 없습니다. 다른 키워드로 검색해 보세요.', '결과 없음', '🔍');
        btnAiSubmit.disabled = false;
        aiLoading.style.display = 'none';
        return;
      }
      
      marketState.recommendedIds = recommendedIds;
      marketState.activeCategory = 'all'; // 모든 카테고리에서 보여줌
      marketState.searchQuery = ''; // 검색어 초기화
      
      const searchInputEl = document.getElementById('search-input');
      if (searchInputEl) searchInputEl.value = '';

      renderCategories(); // 탭 업데이트
      renderMarketSkills(); // 필터링된 스킬 렌더링

      aiModal.style.display = 'none'; // 모달 닫기
    } catch (err) {
      console.error(err);
      alert('AI 추천 중 오류가 발생했습니다:\n' + err.message);
    } finally {
      btnAiSubmit.disabled = false;
      aiLoading.style.display = 'none';
    }
  });
}

// 초기화 로드 시 마켓플레이스 로직 실행
if (document.getElementById('market-skill-grid')) {
  loadMarketplaceData();
}

// 7. 탭 전환 로직
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // 모든 탭/뷰 비활성화
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view-section').forEach(v => {
      v.classList.remove('active');
      v.style.display = 'none';
    });
    
    // 선택된 탭 활성화
    tab.classList.add('active');
    const targetId = 'view-' + tab.dataset.view;
    const targetView = document.getElementById(targetId);
    if (targetView) {
      targetView.classList.add('active');
      if (targetId === 'view-translator') {
        targetView.style.display = 'flex';
        targetView.style.flexDirection = 'column';
      } else {
        targetView.style.display = 'block';
      }
      
      // 내 스킬 관리 탭 클릭 시 렌더링 갱신
      if (targetId === 'view-my-skills') {
        renderMySkills();
      }
    }
  });
});

// 8. 스킬 번역기 로직
const btnTranslateStart = document.getElementById('btn-translate-start');
const btnTranslateCopy = document.getElementById('btn-translate-copy');
const translatorInput = document.getElementById('translator-input');
const translatorOutput = document.getElementById('translator-output');
const translatorLoading = document.getElementById('translator-loading');

if (btnTranslateStart) {
  btnTranslateStart.addEventListener('click', async () => {
    const text = translatorInput.value;
    if (!text.trim()) {
      alert('번역할 영문 SKILL.md 내용을 입력해주세요.');
      return;
    }

    translatorLoading.style.display = 'flex';
    translatorOutput.value = '';
    btnTranslateStart.disabled = true;

    try {
      const finalText = await translateMarkdownFull(text);
      translatorOutput.value = finalText;
    } catch (err) {
      console.error('Translation Error:', err);
      alert('번역 중 오류가 발생했습니다. 브라우저 콘솔의 에러를 확인해주세요.');
      translatorOutput.value = text;
    } finally {
      translatorLoading.style.display = 'none';
      btnTranslateStart.disabled = false;
    }
  });
}

if (btnTranslateCopy) {
  btnTranslateCopy.addEventListener('click', () => {
    if (!translatorOutput.value) return;
    navigator.clipboard.writeText(translatorOutput.value).then(() => {
      const oldText = btnTranslateCopy.textContent;
      btnTranslateCopy.textContent = '✅ 복사 완료!';
      setTimeout(() => btnTranslateCopy.textContent = oldText, 2000);
    });
  });
}

// ============================================
// ─── 깃허브 스킬 동기화 로직 ───
// ============================================

const btnSyncGithub = document.getElementById('btn-sync-github');
const syncModal = document.getElementById('sync-modal');
const syncModalClose = document.getElementById('sync-modal-close');
const syncModalOk = document.getElementById('sync-modal-ok');
const syncLogContainer = document.getElementById('sync-log-container');

let syncInterval = null;

function showSyncModal() {
  syncModal.style.display = 'block';
  syncLogContainer.innerHTML = '🔄 동기화 준비 중...\n';
  syncModalOk.disabled = true;
}

function hideSyncModal() {
  syncModal.style.display = 'none';
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

async function startSync() {
  alert('온라인 호스팅 버전에서는 스킬 동기화를 지원하지 않습니다. (로컬 PC 접근 권한 필요)');
}

async function pollSyncLog() {
  try {
    const res = await fetch('/api/sync-log');
    if (res.ok) {
      const text = await res.text();
      syncLogContainer.textContent = text;
      syncLogContainer.scrollTop = syncLogContainer.scrollHeight;
      
      // 완료 또는 에러 감지 시 폴링 중단 및 완료 확인 버튼 활성화
      if (text.includes('[스킬 동기화 완료]') || text.includes('치명적 오류 발생') || text.includes('❌')) {
        clearInterval(syncInterval);
        syncInterval = null;
        syncModalOk.disabled = false;
        
        // 동기화 성공 완료 시 데이터 재로드
        if (text.includes('[스킬 동기화 완료]')) {
          loadMarketplaceData();
        }
      }
    }
  } catch (err) {
    console.error('Log poll error:', err);
  }
}

if (btnSyncGithub) {
  btnSyncGithub.addEventListener('click', startSync);
}
if (syncModalClose) {
  syncModalClose.addEventListener('click', hideSyncModal);
}
if (syncModalOk) {
  syncModalOk.addEventListener('click', hideSyncModal);
}

// 초기 데이터 로드 호출
loadMarketplaceData();
