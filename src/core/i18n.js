export const translations = {
  ko: {
    // Navigation
    "nav_marketplace": "마켓플레이스",
    "nav_converter": "스킬 변환기",
    "nav_translator": "스킬 번역기",
    
    // Marketplace Header
    "market_title": "스킬 둘러보기",
    "market_search_placeholder": "스킬 검색... (예: Next.js, 보안)",
    "market_sync_btn": "🔄 깃허브 스킬 동기화",
    "market_ai_recommend_btn": "✨ AI 스킬 추천",
    
    // Skill Cards
    "skill_author": "제작:",
    "btn_install": "설치하기",
    "btn_uninstall": "삭제하기",
    "btn_load_more": "더보기",
    "btn_github_search": "GitHub에서 검색",
    "btn_github_source": "GitHub 원본 ↗",
    
    // Modal
    "modal_install_title": "스킬 설치하기",
    "modal_install_desc": "이 스킬을 적용할 AI 도구를 선택하세요.",
    "ai_cursor": "Cursor (.cursorrules)",
    "ai_windsurf": "Windsurf (.windsurfrules)",
    "ai_copilot": "GitHub Copilot (.github/copilot-instructions.md)",
    "ai_clipboard": "ChatGPT / Claude (클립보드 복사)",
    "modal_btn_cancel": "취소",
    "modal_btn_confirm_install": "설치 폴더 선택하기",
    "modal_btn_copy": "클립보드 복사",
    
    // Messages
    "msg_copied": "스킬 내용이 클립보드에 복사되었습니다! ChatGPT나 Claude 대화창에 붙여넣기 하세요.",
    "msg_installed": "스킬이 성공적으로 설치되었습니다!",
    "msg_uninstalled": "스킬이 성공적으로 삭제되었습니다!",
    "msg_install_error": "설치 중 오류가 발생했습니다: ",
    "msg_cancel_dir": "폴더 선택이 취소되었습니다."
  },
  en: {
    // Navigation
    "nav_marketplace": "Marketplace",
    "nav_converter": "Skill Converter",
    "nav_translator": "Skill Translator",
    
    // Marketplace Header
    "market_title": "스킬 둘러보기",
    "market_search_placeholder": "Search skills... (e.g. Next.js, Security)",
    "market_sync_btn": "🔄 Sync GitHub Skills",
    "market_ai_recommend_btn": "✨ AI Recommendation",
    
    // Skill Cards
    "skill_author": "By:",
    "btn_install": "Install",
    "btn_uninstall": "Uninstall",
    "btn_load_more": "Load More",
    "btn_github_search": "Search on GitHub",
    "btn_github_source": "GitHub Source ↗",
    
    // Modal
    "modal_install_title": "Install Skill",
    "modal_install_desc": "Select the AI tool to apply this skill to.",
    "ai_cursor": "Cursor (.cursorrules)",
    "ai_windsurf": "Windsurf (.windsurfrules)",
    "ai_copilot": "GitHub Copilot (.github/copilot-instructions.md)",
    "ai_clipboard": "ChatGPT / Claude (Copy to Clipboard)",
    "modal_btn_cancel": "Cancel",
    "modal_btn_confirm_install": "Select Installation Folder",
    "modal_btn_copy": "Copy to Clipboard",
    
    // Messages
    "msg_copied": "Skill copied to clipboard! Paste it into your ChatGPT or Claude chat.",
    "msg_installed": "Skill successfully installed!",
    "msg_uninstalled": "Skill successfully uninstalled!",
    "msg_install_error": "Error during installation: ",
    "msg_cancel_dir": "Folder selection cancelled."
  }
};

let currentLang = localStorage.getItem('app_lang') || 
                 (navigator.language.startsWith('ko') ? 'ko' : 'en');

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    applyTranslations();
  }
}

export function t(key) {
  return translations[currentLang][key] || key;
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'INPUT' && el.type === 'text') {
      el.placeholder = t(key);
    } else {
      // Keep existing innerHTML structures if necessary, but for now just textContent
      // Except for elements that might have icons inside.
      // A safer approach: replace only the text node, or just use textContent and rely on the HTML structure.
      // Let's use innerHTML but be careful not to overwrite child spans if we use data-i18n on the exact text element.
      el.textContent = t(key);
    }
  });
  
  // Custom button toggles for sync/recommendation which have emojis
  const syncBtn = document.getElementById('btn-sync-github');
  if (syncBtn) syncBtn.innerHTML = `🔄 ${t('market_sync_btn').replace('🔄 ', '')}`;
  
  const recommendBtn = document.getElementById('btn-ai-recommend');
  if (recommendBtn) recommendBtn.innerHTML = `✨ ${t('market_ai_recommend_btn').replace('✨ ', '')}`;
  
  // Custom toggle button text
  const langToggleBtn = document.getElementById('btn-lang-toggle');
  if (langToggleBtn) {
    langToggleBtn.textContent = currentLang === 'ko' ? '🌐 English' : '🌐 한국어';
  }
}
