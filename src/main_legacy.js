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

// ─── 스타터 팩 로직 ───
const starterPacks = [
  {
    id: "pack-frontend",
    title: "나만의 멋진 웹사이트 만들기 팩",
    desc: "복잡한 코딩 없이, 그림을 그리듯 화면을 꾸미고 버튼을 누르면 작동하게 만들어주는 마법 같은 도구 모음입니다. 초보자도 10분 만에 멋진 화면을 만들 수 있어요!",
    marketing: "초보자도 10분 만에 전문가급 웹사이트를 완성할 수 있는 마법의 패키지입니다! 🚀<br><br>**🔥 왜 이 팩을 선택해야 할까요?**<br>👉 **디자인 고민 끝!** '요즘 유행하는 스타일로 예쁘게 만들어줘' 한마디면 고급스러운 디자인이 뚝딱 완성됩니다.<br>👉 **복잡한 코딩 제로!** 레고 블록을 맞추듯 화면을 쉽게 조립하는 **React** 스킬이 모든 복잡한 작업을 대신해 줍니다.<br>👉 **완벽한 모바일 최적화!** 스마트폰, 태블릿, PC 어디서든 깨지지 않고 완벽하게 보이는 반응형 웹을 알아서 구성해 드립니다.<br><br>단 한 번의 설치로 **수백만 원짜리 외주 개발** 부럽지 않은 나만의 전속 프론트엔드 개발팀을 컴퓨터 안에 고용해보세요!",
    skills: ["react-tutor", "tailwind-expert", "ui-ux-pro-max"]
  },
  {
    id: "pack-data",
    title: "똑똑한 데이터 탐정 팩",
    desc: "어려운 숫자와 표 대신, AI가 알아서 데이터를 분석하고 예쁜 차트로 그려줍니다. 수학이나 엑셀을 몰라도 누구나 데이터를 읽어내는 탐정이 될 수 있어요!",
    marketing: "어려운 수학이나 엑셀 수식은 이제 안녕! AI가 내 데이터를 대신 읽고 황금 같은 정답을 찾아주는 패키지입니다. 📊<br><br>**🔥 이 팩이 가져다 줄 놀라운 변화:**<br>👉 **1초 만에 데이터 찾기!** 방대한 자료의 바다 속에서 내가 원하는 데이터만 쏙쏙 뽑아주는 **SQL 마법사**가 도와줍니다.<br>👉 **한눈에 들어오는 예쁜 차트!** 골치 아픈 숫자들을 누구나 이해하기 쉬운 아름다운 그래프로 자동 변환해 줍니다.<br>👉 **AI 데이터 비서 고용!** 데이터를 알아서 분석하고 '어떻게 하면 실적이 오를지' 힌트까지 찾아내는 **Python 비서**가 내장되어 있습니다.<br><br>**코딩을 몰라도, 통계를 몰라도 괜찮습니다!** 클릭 한 번으로 최고의 데이터 분석가를 내 팀에 합류시키세요!",
    skills: ["python-auto", "sql-maker"]
  }
];

function renderStarterPacks() {
  const container = document.getElementById('starter-packs-container');
  const section = document.getElementById('starter-packs-section');
  if (!container || !section) return;
  
  // 전체보기 & 검색어 없을 때만 보이기
  if (marketState.activeCategory !== 'all' || marketState.searchQuery !== '') {
    section.style.display = 'none';
    return;
  }
  
  container.innerHTML = starterPacks.map(pack => `
    <div class="market-card" style="border: 2px solid #8b5cf6; cursor: pointer; display: flex; flex-direction: column; height: 100%; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.1);" onclick="openStarterPackModal('${pack.id}')" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
      <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1)); padding: 1.5rem; border-radius: 12px 12px 0 0; border-bottom: 1px solid rgba(139, 92, 246, 0.2); flex-shrink: 0;">
        <h4 style="font-size: 1.3rem; font-weight: 800; color: var(--accent-indigo); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
          <span>🎁</span> ${pack.title}
        </h4>
        <p style="font-size: 0.95rem; color: var(--text-primary); line-height: 1.5; margin: 0; word-break: keep-all;">${pack.desc}</p>
      </div>
      <div style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="font-weight: bold; color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.8rem;">📦 핵심 스킬 (${pack.skills.length}개)</div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
            ${pack.skills.map(skillId => {
              const skillData = marketState.data.skills.find(s => s.id === skillId);
              const skillName = skillData ? skillData.name : skillId;
              return `<span class="market-tag">#${skillName}</span>`;
            }).join('')}
          </div>
        </div>
        <button class="btn btn-primary" style="width: 100%; background: linear-gradient(135deg, #8b5cf6, #3b82f6); border: none; padding: 1rem; font-size: 1.05rem;">✨ 마법의 패키지 열어보기</button>
      </div>
    </div>
  `).join('');
  
  section.style.display = 'block';
}

let currentStarterPack = null;
let currentSpAiType = null;

window.openStarterPackModal = function(packId) {
  const pack = starterPacks.find(p => p.id === packId);
  if (!pack) return;
  currentStarterPack = pack;
  currentSpAiType = null;
  
  document.getElementById('sp-modal-title').textContent = pack.title;
  document.getElementById('sp-modal-desc').textContent = pack.desc;
  
  // 마케팅 문구 볼드처리 렌더링
  const mkHtml = pack.marketing.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  document.getElementById('sp-modal-marketing').innerHTML = mkHtml;
  
  // 스킬 리스트
  const skillsContainer = document.getElementById('sp-modal-skills');
  skillsContainer.innerHTML = pack.skills.map(skillId => {
    const skillData = marketState.data.skills.find(s => s.id === skillId);
    if (!skillData) return '';
    return `
      <label style="display: flex; align-items: flex-start; gap: 12px; background: var(--bg-card); padding: 1rem; border: 1px solid var(--border-primary); border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--accent-indigo)'" onmouseout="this.style.borderColor='var(--border-primary)'">
        <input type="checkbox" class="sp-skill-checkbox" value="${skillId}" checked style="margin-top: 4px; width: 18px; height: 18px; cursor: pointer;">
        <div>
          <div style="font-weight: bold; color: var(--text-primary); font-size: 1.05rem; margin-bottom: 4px;">${skillData.name}</div>
          <div style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.4;">${skillData.description}</div>
        </div>
      </label>
    `;
  }).join('');
  
  // 버튼 초기화
  document.querySelectorAll('.sp-ai-btn').forEach(btn => {
    btn.style.borderColor = 'transparent';
    btn.style.background = 'var(--bg-secondary)';
  });
  const installBtn = document.getElementById('sp-modal-install');
  installBtn.disabled = true;
  installBtn.style.background = 'var(--bg-secondary)';
  installBtn.style.color = 'var(--text-muted)';
  installBtn.textContent = '어디에 설치할지 선택해주세요';
  
  document.getElementById('starter-pack-modal').style.display = 'flex';
};

document.querySelectorAll('.sp-ai-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sp-ai-btn').forEach(b => {
      b.style.borderColor = 'transparent';
      b.style.background = 'var(--bg-secondary)';
    });
    btn.style.borderColor = 'var(--accent-indigo)';
    btn.style.background = 'rgba(99, 102, 241, 0.1)';
    
    currentSpAiType = btn.dataset.ai;
    
    const installBtn = document.getElementById('sp-modal-install');
    installBtn.disabled = false;
    installBtn.style.background = 'linear-gradient(135deg, #3b82f6, #a855f7)';
    installBtn.style.color = 'white';
    
    const selectedCount = document.querySelectorAll('.sp-skill-checkbox:checked').length;
    let envName = currentSpAiType === 'clipboard' ? '웹 복사본으로' : 
                  currentSpAiType === 'cursor' ? 'Cursor에' : 
                  currentSpAiType === 'windsurf' ? 'Windsurf에' : 'Copilot에';
    installBtn.textContent = `🚀 선택한 ${selectedCount}개 스킬 ${envName} 즉시 설치`;
  });
});

document.addEventListener('change', (e) => {
  if (e.target.classList.contains('sp-skill-checkbox')) {
    if (currentSpAiType) {
      const selectedCount = document.querySelectorAll('.sp-skill-checkbox:checked').length;
      let envName = currentSpAiType === 'clipboard' ? '웹 복사본으로' : 
                    currentSpAiType === 'cursor' ? 'Cursor에' : 
                    currentSpAiType === 'windsurf' ? 'Windsurf에' : 'Copilot에';
      document.getElementById('sp-modal-install').textContent = `🚀 선택한 ${selectedCount}개 스킬 ${envName} 즉시 설치`;
    }
  }
});

document.getElementById('starter-pack-close')?.addEventListener('click', () => {
  document.getElementById('starter-pack-modal').style.display = 'none';
});
document.getElementById('sp-modal-cancel')?.addEventListener('click', () => {
  document.getElementById('starter-pack-modal').style.display = 'none';
});
document.getElementById('starter-pack-backdrop')?.addEventListener('click', () => {
  document.getElementById('starter-pack-modal').style.display = 'none';
});

document.getElementById('sp-modal-install')?.addEventListener('click', async () => {
  if (!currentStarterPack || !currentSpAiType) return;
  const checkboxes = document.querySelectorAll('.sp-skill-checkbox:checked');
  if (checkboxes.length === 0) {
    alert('설치할 스킬을 하나 이상 선택해주세요.');
    return;
  }
  
  const installBtn = document.getElementById('sp-modal-install');
  installBtn.disabled = true;
  installBtn.textContent = '설치 중...';
  
  for (let box of checkboxes) {
    const skillId = box.value;
    const skillData = marketState.data.skills.find(s => s.id === skillId);
    if (skillData) {
      await installSkillToAI(currentSpAiType, skillData);
    }
  }
  
  document.getElementById('starter-pack-modal').style.display = 'none';
  renderMarketSkills();
  showCustomAlert('🎁 스타터 팩 설치가 완료되었습니다!');
});


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

    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category');
    const highlightParam = urlParams.get('highlight');
    if (catParam) {
      marketState.activeCategory = catParam;
    }

    renderCategories();
    renderMarketSkills();
    renderStarterPacks();

    if (highlightParam) {
      const targetSkill = data.skills.find(s => s.id === highlightParam);
      if (targetSkill) {
        setTimeout(() => {
          const rating = parseFloat(targetSkill.rating) || 4.5;
          const aiInstalled = getInstallState(targetSkill.id);
          const tagsHtml = targetSkill.tags.map(t => `<span class="market-tag">#${t}</span>`).join('');
          let authorBadgeHtml = '';
          if (targetSkill.author === 'AI Super Skill') {
            authorBadgeHtml = `<span class="market-tag" style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; border: none; font-weight: bold; margin-bottom: 0.5rem; display: inline-block;">👑 공식 인증 스킬</span>`;
          } else {
            authorBadgeHtml = `<span class="market-tag" style="background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border-primary); margin-bottom: 0.5rem; display: inline-block; font-size: 0.75rem;">🛡️ 검증된 스킬</span>`;
          }
          showSkillDetail(targetSkill, aiInstalled, rating, '', authorBadgeHtml, '', tagsHtml);
        }, 100);
      }
    }

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
      renderStarterPacks();
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
    if (typeof hideSkillDetail === 'function') hideSkillDetail();
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
    const sourceLink = ''; // 내부 프리미엄 스킬임을 강조하기 위해 외부 GitHub 링크 제거
    const rating = parseFloat(skill.rating) || 4.5;

    const isPlaceholder = skill.sourceUrl && skill.sourceUrl.includes('github.com/search');
    
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
    card.style.cursor = 'pointer';
    if (isRecommended) {
      card.style.border = '2px solid #ec4899';
      card.style.boxShadow = '0 0 15px rgba(236, 72, 153, 0.3)';
    }
    
    card.innerHTML = `
      ${statusBadge}
      <div class="market-card-header" style="display: block;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem;">
          <div>
            ${badgeHtml}
            ${authorBadgeHtml}
          </div>
          <div class="market-card-rating">★ ${rating.toFixed(1)}</div>
        </div>
        <div class="market-card-title">${skill.name}</div>
        <div class="market-card-author">${t('skill_author')} ${skill.author} | v${skill.version}${skill.createdAt ? ` | 📅 ${skill.createdAt}` : ''}</div>
      </div>
      <div class="market-card-desc">${skill.description}</div>
      <div class="market-card-tags">${tagsHtml}</div>
      <div class="market-card-footer">
        <div style="font-size: 0.75rem; color: var(--text-secondary);">⬇️ ${skill.downloads.toLocaleString()}</div>
        ${sourceLink}
      </div>
    `;
    
    // 카드 클릭 시 상세 페이지로 이동
    card.addEventListener('click', () => {
      showSkillDetail(skill, aiInstalled, rating, badgeHtml, authorBadgeHtml, statusBadge, tagsHtml);
    });

    
    container.appendChild(card);
  });

  const topPicksSection = document.getElementById('top-picks-section');
  const topPicksContainer = document.getElementById('top-picks-container');
  if (topPicksSection && topPicksContainer) {
    if (marketState.activeCategory === 'all' && marketState.searchQuery === '' && !append) {
      const topSkills = [...marketState.data.skills].sort((a,b) => parseFloat(b.rating) - parseFloat(a.rating)).slice(0, 4);
      topPicksContainer.innerHTML = '';
      topSkills.forEach((skill, index) => {
        const rating = parseFloat(skill.rating) || 4.5;
        const aiInstalled = getInstallState(skill.id);
        const tagsHtml = skill.tags.map(t => `<span class="market-tag">#${t}</span>`).join('');
        const badgeHtml = `<span class="market-tag" style="background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; border: none; font-weight: bold; margin-bottom: 0.5rem; display: inline-block;">🔥 에디터 추천</span>`;
        let authorBadgeHtml = '';
        if (skill.author === 'AI Super Skill') {
          authorBadgeHtml = `<span class="market-tag" style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; border: none; font-weight: bold; margin-bottom: 0.5rem; display: inline-block;">👑 공식 인증 스킬</span>`;
        } else {
          authorBadgeHtml = `<span class="market-tag" style="background: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border-primary); margin-bottom: 0.5rem; display: inline-block; font-size: 0.75rem;">🛡️ 검증된 스킬</span>`;
        }
        
        const card = document.createElement('div');
        card.className = 'market-card';
        card.style.cursor = 'pointer';
        card.style.border = '1px solid #f59e0b';
        card.innerHTML = `
          <div class="market-card-header" style="display: block;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem;">
              <div>
                ${badgeHtml}
                ${authorBadgeHtml}
              </div>
              <div class="market-card-rating">★ ${rating.toFixed(1)}</div>
            </div>
            <div class="market-card-title">${skill.name}</div>
            <div class="market-card-author">${t('skill_author')} ${skill.author} | v${skill.version}</div>
          </div>
          <div class="market-card-desc">${skill.description}</div>
          <div class="market-card-tags">${tagsHtml}</div>
          <div class="market-card-footer">
            <div style="font-size: 0.75rem; color: var(--text-secondary);">⬇️ ${skill.downloads.toLocaleString()}</div>
          </div>
        `;
        card.addEventListener('click', () => {
          showSkillDetail(skill, aiInstalled, rating, badgeHtml, authorBadgeHtml, '', tagsHtml);
        });
        topPicksContainer.appendChild(card);
      });
      topPicksSection.style.display = 'block';
    } else if (!append) {
      topPicksSection.style.display = 'none';
    }
  }

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

// 3.1 스킬 상세 페이지 렌더링 및 전환
function showSkillDetail(skill, aiInstalled, rating, badgeHtml, authorBadgeHtml, statusBadge, tagsHtml) {
  try {
    console.log('showSkillDetail called for:', skill.name);
    // 리스트 뷰 숨기기
    document.querySelector('.marketplace-header').style.display = 'none';
    const grid = document.getElementById('market-skill-grid');
    if (grid) grid.style.display = 'none';
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    const topPicks = document.getElementById('top-picks-section');
    if (topPicks) topPicks.style.display = 'none';

    // 디테일 뷰 채우기
    const detailView = document.getElementById('skill-detail-view');
  const roleBadge = skill.role ? `<span class="market-tag" style="background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); font-weight: bold; margin-bottom: 0.5rem; display: inline-block; margin-right: 0.5rem;">${skill.role}</span>` : '';
  document.getElementById('detail-badges').innerHTML = `${badgeHtml} ${authorBadgeHtml} ${roleBadge} ${statusBadge}`;
  document.getElementById('detail-title').textContent = skill.name;
  document.getElementById('detail-meta').innerHTML = `
    <span>${t('skill_author')} ${skill.author}</span>
    <span>v${skill.version}</span>
    <span>★ ${rating.toFixed(1)}</span>
    <span>⬇️ ${skill.downloads.toLocaleString()}</span>
    ${skill.createdAt ? `<span>📅 ${skill.createdAt}</span>` : ''}
  `;

  // 액션 버튼 생성
  const actionContainer = document.getElementById('detail-action-container');
  actionContainer.innerHTML = '';
  if (aiInstalled) {
    const uninstallBtn = document.createElement('button');
    uninstallBtn.className = 'btn';
    uninstallBtn.style.cssText = 'background: white; color: var(--text-secondary); border: 1px solid var(--border-primary); padding: 1rem; border-radius: var(--radius-md); font-weight: bold; font-size: 1.1rem; width: 100%; cursor: pointer; transition: all 0.2s;';
    uninstallBtn.innerHTML = '✅ 추가됨 (클릭하여 삭제)';
    uninstallBtn.addEventListener('click', async () => {
      uninstallBtn.disabled = true;
      uninstallBtn.textContent = '삭제 중...';
      const success = await uninstallSkillFromAI(aiInstalled, skill.id);
      if (success) {
        showSkillDetail(skill, false, rating, badgeHtml, authorBadgeHtml, statusBadge, tagsHtml); // 새로고침
        renderMySkills();
      } else {
        uninstallBtn.disabled = false;
        uninstallBtn.innerHTML = '✅ 추가됨 (클릭하여 삭제)';
      }
    });
    actionContainer.appendChild(uninstallBtn);
  } else {
    const installBtn = document.createElement('button');
    installBtn.className = 'btn';
    installBtn.style.cssText = 'background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 1rem; border-radius: var(--radius-md); font-weight: bold; font-size: 1.1rem; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 10px rgba(59,130,246,0.3);';
    installBtn.innerHTML = '⬇️ 스킬 추가하기';
    installBtn.addEventListener('click', async () => {
      if (typeof window.openInstallModal === 'function') {
        window.openInstallModal(skill, () => {
          showSkillDetail(skill, 'ide', rating, badgeHtml, authorBadgeHtml, statusBadge, tagsHtml); // 새로고침
          renderMySkills();
        });
      }
    });
    actionContainer.appendChild(installBtn);
  }

  // 매뉴얼 & 리뷰 영역 (더미 텍스트 자동 완성)
  const defaultManual = `<p>이 스킬은 <b>${skill.name}</b> 작업을 자동화하고 최적화하기 위해 설계되었습니다.</p>
    <p>설치 후 AI 채팅창에서 다음과 같이 요청해보세요:</p>
    <ul style="padding-left: 1.5rem; margin-top: 0.5rem; list-style-type: disc;">
      <li>"이 프로젝트에 ${skill.name} 환경을 세팅해줘."</li>
      <li>"관련 설정 파일을 분석하고 개선점을 찾아줘."</li>
    </ul>
    <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;">* 추가적인 프롬프트 작성 없이도 AI가 최적의 워크플로우를 스스로 판단하여 수행합니다.</p>
  `;
  const defaultReview = `<p>이 스킬은 초보자도 쉽게 사용할 수 있는 직관적인 인터페이스를 제공하지만, 내부적으로는 <b>시니어 개발자 수준의 고도화된 프롬프트 엔지니어링(Chain of Thought)</b>이 적용되어 있습니다.</p>
    <p>실제 실무에서도 발생하는 예외 상황을 AI가 스스로 인지하고 해결책을 제시하므로, 단순 반복 작업을 최대 80% 이상 단축시킬 수 있는 <b>강력한 툴</b>입니다.</p>`;
  
  document.getElementById('detail-manual-content').innerHTML = skill.manual || defaultManual;
  document.getElementById('detail-expert-review').innerHTML = skill.expertReview || defaultReview;
  document.getElementById('detail-tags').innerHTML = tagsHtml;

  const startersSection = document.getElementById('detail-starters-section');
  if (skill.starterPrompts && skill.starterPrompts.length > 0) {
    const promptsContainer = document.getElementById('detail-starter-prompts');
    promptsContainer.innerHTML = skill.starterPrompts.map(p => 
      `<button class="starter-prompt-btn" style="font-size: 14px; text-align: left; background: var(--bg-card); border: 1px solid var(--border-primary); padding: 0.8rem 1rem; border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'; this.style.borderColor='var(--accent-indigo)';" onmouseout="this.style.background='var(--bg-card)'; this.style.borderColor='var(--border-primary)';">
         ${p}
       </button>`
    ).join('');
    
    // Add click event for copying
    const btns = promptsContainer.querySelectorAll('.starter-prompt-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(btn.textContent.trim());
          const original = btn.innerHTML;
          btn.innerHTML = '✅ 클립보드에 복사되었습니다!';
          btn.style.color = '#10b981';
          setTimeout(() => {
            btn.innerHTML = original;
            btn.style.color = 'var(--text-secondary)';
          }, 2000);
        } catch (err) {
          console.error('Failed to copy', err);
        }
      });
    });
    startersSection.style.display = 'block';
  } else {
    startersSection.style.display = 'none';
  }

  const beforeAfterSection = document.getElementById('detail-before-after-section');
  if (skill.beforeAfter) {
    document.getElementById('detail-before-text').textContent = skill.beforeAfter.before;
    document.getElementById('detail-after-text').textContent = skill.beforeAfter.after;
    beforeAfterSection.style.display = 'grid';
  } else {
    beforeAfterSection.style.display = 'none';
  }

  // 디테일 뷰 보이기
  detailView.style.display = 'flex';
  
  // 상세 뷰 시작 부분으로 부드럽게 스크롤 (헤더 높이 고려)
  setTimeout(() => {
    const headerOffset = 80;
    const elementPosition = detailView.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }, 50);
  } catch (err) {
    console.error('Error in showSkillDetail:', err);
    alert('상세 페이지를 여는 중 오류가 발생했습니다: ' + err.message);
  }
}

function hideSkillDetail() {
  document.getElementById('skill-detail-view').style.display = 'none';
  document.querySelector('.marketplace-header').style.display = 'flex';
  const grid = document.getElementById('market-skill-grid');
  if (grid) grid.style.display = 'grid';
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn && marketState.data.skills.length > marketState.visibleCount) loadMoreBtn.style.display = 'flex';
  const topPicks = document.getElementById('top-picks-section');
  if (topPicks && marketState.activeCategory === 'all' && marketState.searchQuery === '') topPicks.style.display = 'block';
}

// 뒤로가기 버튼 이벤트 바인딩
document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('btn-back-to-list');
  if (backBtn) {
    backBtn.addEventListener('click', hideSkillDetail);
  }
});

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
    nameCol.innerHTML = `<div style="font-weight: 500; margin-bottom: 4px;">${skill.name}</div><div style="font-size: 0.85rem; color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${skill.description}</div>`;
    
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
    renderStarterPacks();
    renderMarketSkills();
  });
}

// 5. 멀티 AI 설치 모달 로직
let currentInstallSkill = null;
let currentInstallAiType = null;

let currentInstallSuccessCb = null;

window.openInstallModal = function(skill, onSuccessCb) {
  currentInstallSkill = skill;
  currentInstallSuccessCb = onSuccessCb;
  
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
  document.getElementById('install-btn-text').textContent = '어떻게 쓸지 위에서 골라주세요';
  
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
      textEl.textContent = '마법 주문(프롬프트) 복사하기';
    } else {
      let ideName = 'IDE';
      if (currentInstallAiType === 'cursor') ideName = 'Cursor';
      if (currentInstallAiType === 'windsurf') ideName = 'Windsurf';
      if (currentInstallAiType === 'copilot') ideName = 'Copilot';
      iconEl.textContent = '🚀';
      textEl.textContent = `${ideName}에 스킬 설치하기`;
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
    if (currentInstallSuccessCb) currentInstallSuccessCb();
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
