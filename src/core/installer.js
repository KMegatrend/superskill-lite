// File System Access API 기반 스킬 설치기
import { t } from './i18n.js';
import { saveDirHandle, getDirHandle, removeDirHandle } from './db.js';

// 설치된 스킬 마커 형식
const MARKER_BEGIN = (id) => `\n# --- BEGIN AI SKILL: ${id} ---\n`;
const MARKER_END = (id) => `\n# --- END AI SKILL: ${id} ---\n`;

export function showCustomAlert(message, title = '알림', icon = '💡') {
  return new Promise((resolve) => {
    let modal = document.getElementById('custom-alert-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'custom-alert-modal';
      modal.className = 'install-modal';
      modal.style.cssText = 'display: none; position: fixed; inset: 0; z-index: 10000; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);';
      modal.innerHTML = `
        <div class="install-modal-box" style="max-width: 450px; width: 90%; background: #0c0c14; border: 1px solid var(--border-primary); border-radius: var(--radius-lg); padding: 2rem; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
          <div class="modal-icon" style="font-size: 3rem; margin-bottom: 1rem;">${icon}</div>
          <h3 class="modal-title" style="font-size: 1.4rem; color: var(--text-primary); margin-bottom: 1rem;">${title}</h3>
          <p class="modal-message" style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; word-break: keep-all; margin-bottom: 1.5rem; white-space: pre-line;">${message}</p>
          <button class="btn btn-primary" id="custom-alert-ok" style="width: 100%; padding: 12px; font-size: 1rem;">확인</button>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const titleEl = modal.querySelector('.modal-title');
    const messageEl = modal.querySelector('.modal-message');
    const iconEl = modal.querySelector('.modal-icon');
    
    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    if (iconEl) iconEl.textContent = icon;

    modal.style.display = 'flex';

    const okBtn = modal.querySelector('#custom-alert-ok');
    const handleOk = () => {
      modal.style.display = 'none';
      okBtn.removeEventListener('click', handleOk);
      resolve();
    };
    okBtn.addEventListener('click', handleOk);
  });
}

export function showCustomConfirmModal({ title = '알림', icon = '💡', message = '', confirmText = '확인', cancelText = '닫기' }) {
  return new Promise((resolve) => {
    let modal = document.getElementById('custom-confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'custom-confirm-modal';
      modal.className = 'install-modal';
      modal.style.cssText = 'display: none; position: fixed; inset: 0; z-index: 10000; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px);';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="install-modal-box" style="max-width: 480px; width: 90%; background: #0c0c14; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: var(--radius-lg); padding: 2rem; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">${icon}</div>
        <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); margin-bottom: 1rem;">${title}</h3>
        <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; word-break: keep-all; margin-bottom: 1.8rem; white-space: pre-line;">${message}</p>
        <div style="display: flex; gap: 10px;">
          <button id="custom-confirm-cancel" class="btn btn-secondary" style="flex: 1; padding: 12px; font-size: 0.95rem;">${cancelText}</button>
          <button id="custom-confirm-ok" class="btn btn-primary" style="flex: 1.5; padding: 12px; font-size: 0.95rem; background: linear-gradient(135deg, #10b981, #059669); border: none; font-weight: bold; color: white;">${confirmText}</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    const btnOk = modal.querySelector('#custom-confirm-ok');
    const btnCancel = modal.querySelector('#custom-confirm-cancel');

    const handleOk = () => {
      modal.style.display = 'none';
      resolve(true);
    };
    const handleCancel = () => {
      modal.style.display = 'none';
      resolve(false);
    };

    btnOk.addEventListener('click', handleOk, { once: true });
    btnCancel.addEventListener('click', handleCancel, { once: true });
  });
}

export function generateChatGptMasterPrompt(skill) {
  const starters = (skill.starterPrompts && skill.starterPrompts.length > 0)
    ? skill.starterPrompts.map((p, idx) => `${idx + 1}. "${p}"`).join('\n')
    : `1. "이 프로젝트에 ${skill.name} 최적 워크플로우를 가동해줘."\n2. "현재 구현 상태를 점검하고 개선 가이드를 제시해줘."`;

  return `# 🤖 [AI SuperSkill] ${skill.name} 전문 에이전트 모드

당신은 지금부터 **${skill.name}** 분야의 최고 권위자이자 전문 실행 에이전트(Autonomous Expert Agent)로 작동합니다.
${skill.role ? `- **수행 페르소나**: ${skill.role}\n` : ''}${skill.description ? `- **목표 및 핵심 가치**: ${skill.description}\n` : ''}
---

## 🎯 핵심 행동 지침 및 작업 원칙
${skill.skillContent || skill.manual || '전문적인 분석과 최적화된 워크플로우에 따라 체계적으로 문제를 해결합니다.'}

---

## 💬 즉시 실행 가능한 마스터 프롬프트 예시
${starters}

---

## ⚡ 에이전트 행동 규칙
1. **명확한 로직 분리**: 복잡한 작업은 반드시 단계별(Step-by-Step) 계획을 먼저 브리핑한 후 실행합니다.
2. **생산성 극대화**: 사용자가 불필요한 질문을 반복하지 않도록, 최선의 모범 사례(Best Practice)를 먼저 제안합니다.
3. **즉시 준비 완료**: 위 지침을 완벽히 숙지했다면, "준비되었습니다! **${skill.name}** 전문 모드가 활성화되었습니다. 어떤 작업부터 시작할까요?"라고만 간결하게 첫 인사를 건네고 사용자의 입력을 대기하세요.`;
}

export function generateClaudeMasterPrompt(skill) {
  const starters = (skill.starterPrompts && skill.starterPrompts.length > 0)
    ? skill.starterPrompts.map((p, idx) => `${idx + 1}. "${p}"`).join('\n')
    : `1. "이 프로젝트에 ${skill.name} 최적 워크플로우를 가동해줘."\n2. "현재 구현 상태를 점검하고 아티팩트(Artifact)로 작성해줘."`;

  return `<skill_directive>
<title>${skill.name}</title>
<persona>${skill.role || skill.name + ' 전문 AI 에이전트'}</persona>
<objective>${skill.description || '최고 수준의 전문 역량을 발휘하여 사용자의 요구사항을 완벽하게 해결합니다.'}</objective>

<core_instructions>
${skill.skillContent || skill.manual || '전문적인 분석과 최적화된 워크플로우에 따라 체계적으로 문제를 해결합니다.'}
</core_instructions>

<recommended_prompts>
${starters}
</recommended_prompts>

<operational_rules>
1. 사용자가 코드 또는 긴 산출물을 요청할 경우, Claude Artifacts를 적극적으로 활용하세요.
2. 불필요한 서론을 줄이고, 정밀하고 검증된 해결책을 한국어로 친절히 제공하세요.
3. 지침이 로드되면 "준비되었습니다! [${skill.name}] 모드가 활성화되었습니다. 어떤 작업을 시작할까요?"라고만 첫 인사를 건네세요.
</operational_rules>
</skill_directive>`;
}

export function generateGeminiMasterPrompt(skill) {
  const starters = (skill.starterPrompts && skill.starterPrompts.length > 0)
    ? skill.starterPrompts.map((p, idx) => `${idx + 1}. "${p}"`).join('\n')
    : `1. "이 프로젝트에 ${skill.name} 최적 워크플로우를 가동해줘."\n2. "현재 구현 상태를 점검하고 개선 가이드를 제시해줘."`;

  return `# ✨ [Google Gemini SuperSkill] ${skill.name} 전문 모드

당신은 Google Gemini 기반의 최고 수준 전문가이자 실행 에이전트입니다.
${skill.role ? `* **전문 분야/페르소나**: ${skill.role}\n` : ''}${skill.description ? `* **목표**: ${skill.description}\n` : ''}

---

## 🎯 핵심 지침 및 작업 원칙
${skill.skillContent || skill.manual || '전문적인 분석과 최적화된 워크플로우에 따라 체계적으로 문제를 해결합니다.'}

---

## 💬 추천 시작 프롬프트
${starters}

---

## ⚡ Gemini 실행 규칙
1. 200만 토큰 컨텍스트를 활용하여 프로젝트의 전체 맥락을 폭넓게 파악하고 종합적인 솔루션을 제시하세요.
2. 모든 답변은 명확한 마크다운 구조로 작성하고, 핵심 결론을 서두에 명시하세요.
3. 지침 숙지가 완료되면 "준비되었습니다! ✨ [${skill.name}] 전문 모드가 로드되었습니다. 어떤 작업을 도와드릴까요?"라고만 짧게 응답하세요.`;
}

export function generateGptsInstructions(skill) {
  return `# Role & Persona
You are a top-tier industry specialist acting as "${skill.name}".
${skill.role ? `Role: ${skill.role}\n` : ''}${skill.description ? `Objective: ${skill.description}\n` : ''}

# Instructions & Workflow
${skill.skillContent || skill.manual || 'Provide world-class expert advice, automated workflow steps, and production-ready output.'}

# Execution Guidelines
- Deliver clear, well-structured, production-ready responses.
- Always communicate primarily in natural, professional Korean unless specified otherwise.
- Proactively anticipate edge cases and security best practices.`;
}

export async function installSkillToAI(aiType, skill, onProgress) {
  if (aiType === 'chatgpt') {
    const prompt = generateChatGptMasterPrompt(skill);
    await navigator.clipboard.writeText(prompt);
    const go = await showCustomConfirmModal({
      title: 'ChatGPT 마스터 프롬프트 복사 완료!',
      icon: '🤖',
      message: `"${skill.name}" 마스터 프롬프트가 클립보드에 복사되었습니다.\n\n지금 ChatGPT 대화창(chatgpt.com)으로 이동하여 붙여넣기(Ctrl+V)하시겠습니까?`,
      confirmText: '🚀 ChatGPT 대화창 열기',
      cancelText: '닫기'
    });
    if (go) {
      window.open('https://chatgpt.com/', '_blank');
    }
    return true;
  }

  if (aiType === 'claude') {
    const prompt = generateClaudeMasterPrompt(skill);
    await navigator.clipboard.writeText(prompt);
    const go = await showCustomConfirmModal({
      title: 'Claude 맞춤 프롬프트 복사 완료!',
      icon: '🧠',
      message: `"${skill.name}" Claude 전용(Artifacts/XML 최적화) 프롬프트가 복사되었습니다.\n\n지금 Claude 대화창(claude.ai)으로 이동하여 붙여넣기(Ctrl+V)하시겠습니까?`,
      confirmText: '🚀 Claude 대화창 열기',
      cancelText: '닫기'
    });
    if (go) {
      window.open('https://claude.ai/new', '_blank');
    }
    return true;
  }

  if (aiType === 'gemini') {
    const prompt = generateGeminiMasterPrompt(skill);
    await navigator.clipboard.writeText(prompt);
    const go = await showCustomConfirmModal({
      title: 'Gemini 맞춤 프롬프트 복사 완료!',
      icon: '✨',
      message: `"${skill.name}" Gemini 전용(대용량 컨텍스트 최적화) 프롬프트가 복사되었습니다.\n\n지금 Gemini 대화창(gemini.google.com)으로 이동하여 붙여넣기(Ctrl+V)하시겠습니까?`,
      confirmText: '🚀 Gemini 대화창 열기',
      cancelText: '닫기'
    });
    if (go) {
      window.open('https://gemini.google.com/app', '_blank');
    }
    return true;
  }

  if (aiType === 'gpts') {
    const prompt = generateGptsInstructions(skill);
    await navigator.clipboard.writeText(prompt);
    const go = await showCustomConfirmModal({
      title: 'Custom GPTs 맞춤지침 복사 완료!',
      icon: '🧩',
      message: `"${skill.name}" GPTs 맞춤지침(Instructions)이 복사되었습니다.\n\nChatGPT의 'Explore GPTs > Create a GPT'의 [Instructions] 란에 그대로 붙여넣으세요!`,
      confirmText: '🚀 GPTs 만들기 창 열기',
      cancelText: '닫기'
    });
    if (go) {
      window.open('https://chatgpt.com/gpts/editor', '_blank');
    }
    return true;
  }

  if (aiType === 'clipboard') {
    const textToCopy = `[Skill: ${skill.name}]\n\n${skill.skillContent || ''}`;
    await navigator.clipboard.writeText(textToCopy);
    await showCustomAlert(t('msg_copied'), '복사 완료', '📋');
    return true;
  }

  try {
    // 1. 사용자 폴더 선택 요청 전 사전 안내창 띄우기
    await showCustomAlert(`스킬을 설치할 준비가 되었습니다.\n\n👉 확인을 누르신 후, 스킬을 적용할 "프로젝트 폴더"를 선택해 주세요.\n(상단에 파일 수정 권한 알림이 뜨면 "허용"을 눌러주세요)`, '설치 안내', '🚀');
    
    const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    
    // [안전망] 엉뚱한 폴더 차단 로직 (Validation)
    const forbiddenNames = ['desktop', 'downloads', 'documents', 'windows', 'system32', 'program files', 'users'];
    const selectedName = dirHandle.name.toLowerCase();
    
    // 바탕화면, 다운로드 등 상위/시스템 폴더를 통째로 지정하는 것을 방지
    if (forbiddenNames.some(name => selectedName.includes(name)) || selectedName.length <= 1) {
      await showCustomAlert('바탕화면이나 다운로드 폴더 전체를 선택할 수 없습니다!\n안전을 위해 스킬을 적용할 "진짜 코딩 프로젝트 폴더"를 선택해 주세요.', '접근 차단됨', '🚫');
      return false;
    }

    let fileHandle;
    let pathLabel = '';

    // 2. AI 타입별 파일 접근 및 내용 구성
    let contentToInstall = skill.skillContent || '';
    let content = '';

    if (aiType === 'cursor') {
      const cursorDir = await dirHandle.getDirectoryHandle('.cursor', { create: true });
      const rulesDir = await cursorDir.getDirectoryHandle('rules', { create: true });
      fileHandle = await rulesDir.getFileHandle(`${skill.id}.mdc`, { create: true });
      pathLabel = `.cursor/rules/${skill.id}.mdc`;
      
      // Cursor는 개별 파일 덮어쓰기 (Frontmatter 포함)
      content = `---
description: ${skill.description || skill.name}
globs: *
---
${contentToInstall}`;
    } else if (aiType === 'windsurf') {
      fileHandle = await dirHandle.getFileHandle('.windsurfrules', { create: true });
      pathLabel = '.windsurfrules';
    } else if (aiType === 'copilot') {
      const githubDir = await dirHandle.getDirectoryHandle('.github', { create: true });
      fileHandle = await githubDir.getFileHandle('copilot-instructions.md', { create: true });
      pathLabel = '.github/copilot-instructions.md';
    } else {
      throw new Error("Unsupported AI Type");
    }

    if (aiType !== 'cursor') {
      // 3. 기존 파일 읽기
      const file = await fileHandle.getFile();
      content = await file.text();

      // 4. 중복 체크 및 삭제
      content = removeSkillBlock(content, skill.id);

      // 5. 스킬 블록 추가
      const skillBlock = `${MARKER_BEGIN(skill.id)}${contentToInstall}${MARKER_END(skill.id)}`;
      content += skillBlock;
    }

    // 6. 파일 쓰기
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();

    // 7. 로컬 스토리지에 설치 상태 기록 및 IDB에 폴더 권한 저장
    saveInstallState(skill.id, aiType);
    await saveDirHandle(skill.id, dirHandle);
    
    await showCustomAlert(t('msg_installed') + `\n(${pathLabel})`, '설치 성공!', '🎉');
    return true;

  } catch (err) {
    if (err.name === 'AbortError') {
      console.log(t('msg_cancel_dir'));
      return false;
    }
    console.error(err);
    await showCustomAlert(t('msg_install_error') + '\n' + err.message, '설치 오류', '❌');
    return false;
  }
}

export async function installSkillsBatchToAI(aiType, skills) {
  if (!skills || skills.length === 0) return true;

  if (aiType === 'chatgpt') {
    let combinedPrompt = `# 🤖 [AI SuperSkill] 통합 멀티 스킬 전문 에이전트 모드\n\n당신은 지금부터 아래 ${skills.length}개 핵심 스킬을 통합 탑재한 슈퍼 에이전트로 작동합니다.\n\n`;
    skills.forEach((skill, idx) => {
      combinedPrompt += `## [스킬 ${idx + 1}] ${skill.name}\n${skill.role ? `**역할**: ${skill.role}\n` : ''}${skill.description ? `**목표**: ${skill.description}\n` : ''}\n### 핵심 지침:\n${skill.skillContent || skill.manual || ''}\n\n---\n\n`;
    });
    combinedPrompt += `\n위 모든 스킬의 지침을 통합 수행할 준비가 완료되었으면, "선택하신 ${skills.length}개 통합 스킬 팩이 로드되었습니다. 어떤 작업을 시작할까요?"라고만 짧게 응답하세요.`;
    await navigator.clipboard.writeText(combinedPrompt);
    const go = await showCustomConfirmModal({
      title: 'ChatGPT 통합 마스터 프롬프트 복사 완료!',
      icon: '🤖',
      message: `선택하신 ${skills.length}개 스킬이 모두 통합된 ChatGPT 마스터 프롬프트가 복사되었습니다.\n\n지금 ChatGPT 대화창을 열어 바로 붙여넣으시겠습니까?`,
      confirmText: '🚀 ChatGPT 대화창 열기',
      cancelText: '닫기'
    });
    if (go) window.open('https://chatgpt.com/', '_blank');
    return true;
  }

  if (aiType === 'claude') {
    let combinedPrompt = `<multi_skill_bundle count="${skills.length}">\n<system_directive>\nYou are equipped with the following ${skills.length} expert skills. Utilize them synergistically.\n</system_directive>\n\n`;
    skills.forEach((skill, idx) => {
      combinedPrompt += `<skill index="${idx + 1}" name="${skill.name}">\n${skill.role ? `<role>${skill.role}</role>\n` : ''}${skill.description ? `<objective>${skill.description}</objective>\n` : ''}<instructions>\n${skill.skillContent || skill.manual || ''}\n</instructions>\n</skill>\n\n`;
    });
    combinedPrompt += `</multi_skill_bundle>\n\n위 모든 스킬의 지침을 통합 수행할 준비가 완료되었으면, "선택하신 ${skills.length}개 통합 스킬 팩이 로드되었습니다. 어떤 작업을 시작할까요?"라고만 짧게 응답하세요.`;
    await navigator.clipboard.writeText(combinedPrompt);
    const go = await showCustomConfirmModal({
      title: 'Claude 통합 프롬프트 복사 완료!',
      icon: '🧠',
      message: `선택하신 ${skills.length}개 스킬이 모두 통합된 Claude 맞춤 프롬프트가 복사되었습니다.\n\n지금 Claude 대화창(claude.ai)을 열어 바로 붙여넣으시겠습니까?`,
      confirmText: '🚀 Claude 대화창 열기',
      cancelText: '닫기'
    });
    if (go) window.open('https://claude.ai/new', '_blank');
    return true;
  }

  if (aiType === 'gemini') {
    let combinedPrompt = `# ✨ [Google Gemini] 통합 멀티 스킬 전문 에이전트 팩\n\n당신은 지금부터 아래 ${skills.length}개 전문 스킬을 통합 탑재한 슈퍼 에이전트로 작동합니다.\n\n`;
    skills.forEach((skill, idx) => {
      combinedPrompt += `## [스킬 ${idx + 1}] ${skill.name}\n${skill.role ? `* **역할**: ${skill.role}\n` : ''}${skill.description ? `* **목표**: ${skill.description}\n` : ''}\n### 핵심 지침:\n${skill.skillContent || skill.manual || ''}\n\n---\n\n`;
    });
    combinedPrompt += `\n위 모든 스킬의 지침을 통합 수행할 준비가 완료되었으면, "선택하신 ${skills.length}개 통합 스킬 팩이 Gemini에 로드되었습니다. 어떤 작업을 시작할까요?"라고만 짧게 응답하세요.`;
    await navigator.clipboard.writeText(combinedPrompt);
    const go = await showCustomConfirmModal({
      title: 'Gemini 통합 프롬프트 복사 완료!',
      icon: '✨',
      message: `선택하신 ${skills.length}개 스킬이 모두 통합된 Gemini 맞춤 프롬프트가 복사되었습니다.\n\n지금 Gemini 대화창(gemini.google.com)을 열어 바로 붙여넣으시겠습니까?`,
      confirmText: '🚀 Gemini 대화창 열기',
      cancelText: '닫기'
    });
    if (go) window.open('https://gemini.google.com/app', '_blank');
    return true;
  }

  if (aiType === 'gpts') {
    let combinedInstructions = `# Integrated Multi-Skill Persona\n\nYou possess the capabilities of the following ${skills.length} professional skills:\n\n`;
    skills.forEach((skill, idx) => {
      combinedInstructions += `## Skill ${idx + 1}: ${skill.name}\n${skill.role ? `Role: ${skill.role}\n` : ''}${skill.description ? `Objective: ${skill.description}\n` : ''}\nInstructions:\n${skill.skillContent || skill.manual || ''}\n\n`;
    });
    await navigator.clipboard.writeText(combinedInstructions);
    const go = await showCustomConfirmModal({
      title: 'Custom GPTs 통합 지침 복사 완료!',
      icon: '🧩',
      message: `선택하신 ${skills.length}개 스킬의 GPTs 통합 맞춤지침(Instructions)이 복사되었습니다.\n\nGPTs 만들기 창을 여시겠습니까?`,
      confirmText: '🚀 GPTs 만들기 열기',
      cancelText: '닫기'
    });
    if (go) window.open('https://chatgpt.com/gpts/editor', '_blank');
    return true;
  }

  if (aiType === 'clipboard') {
    let combinedText = '';
    skills.forEach(skill => {
      combinedText += `[Skill: ${skill.name}]\n\n${skill.skillContent || ''}\n\n`;
    });
    await navigator.clipboard.writeText(combinedText.trim());
    await showCustomAlert(`선택하신 ${skills.length}개의 스킬이 클립보드에 모두 복사되었습니다.`, '일괄 복사 완료', '📋');
    return true;
  }

  try {
    await showCustomAlert(`${skills.length}개의 스킬을 한 번에 설치합니다!\n\n👉 확인을 누르신 후, 스킬을 적용할 "프로젝트 폴더"를 선택해 주세요.\n(상단에 권한 알림이 뜨면 "허용"을 눌러주세요)`, '일괄 설치 안내', '🚀');
    
    const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    
    const forbiddenNames = ['desktop', 'downloads', 'documents', 'windows', 'system32', 'program files', 'users'];
    const selectedName = dirHandle.name.toLowerCase();
    
    if (forbiddenNames.some(name => selectedName.includes(name)) || selectedName.length <= 1) {
      await showCustomAlert('바탕화면이나 다운로드 폴더 전체를 선택할 수 없습니다!\n안전을 위해 스킬을 적용할 "진짜 코딩 프로젝트 폴더"를 선택해 주세요.', '접근 차단됨', '🚫');
      return false;
    }

    let pathLabel = '';

    if (aiType === 'cursor') {
      const cursorDir = await dirHandle.getDirectoryHandle('.cursor', { create: true });
      const rulesDir = await cursorDir.getDirectoryHandle('rules', { create: true });
      pathLabel = '.cursor/rules/ 폴더';
      
      for (const skill of skills) {
        const fileHandle = await rulesDir.getFileHandle(`${skill.id}.mdc`, { create: true });
        let contentToInstall = skill.skillContent || '';
        let content = `---
description: ${skill.description || skill.name}
globs: *
---
${contentToInstall}`;
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
      }
    } else {
      let fileHandle;
      if (aiType === 'windsurf') {
        fileHandle = await dirHandle.getFileHandle('.windsurfrules', { create: true });
        pathLabel = '.windsurfrules';
      } else if (aiType === 'copilot') {
        const githubDir = await dirHandle.getDirectoryHandle('.github', { create: true });
        fileHandle = await githubDir.getFileHandle('copilot-instructions.md', { create: true });
        pathLabel = '.github/copilot-instructions.md';
      } else {
        throw new Error("Unsupported AI Type");
      }

      const file = await fileHandle.getFile();
      let content = await file.text();

      for (const skill of skills) {
        content = removeSkillBlock(content, skill.id);
        const contentToInstall = skill.skillContent || '';
        const skillBlock = `${MARKER_BEGIN(skill.id)}${contentToInstall}${MARKER_END(skill.id)}`;
        content += skillBlock;
      }

      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
    }

    for (const skill of skills) {
      saveInstallState(skill.id, aiType);
      await saveDirHandle(skill.id, dirHandle);
    }
    
    await showCustomAlert(`선택하신 ${skills.length}개의 스킬이 성공적으로 일괄 설치되었습니다!\n(${pathLabel})`, '일괄 설치 성공!', '🎉');
    return true;

  } catch (err) {
    if (err.name === 'AbortError') return false;
    console.error(err);
    await showCustomAlert('일괄 설치 중 오류가 발생했습니다.\n' + err.message, '설치 오류', '❌');
    return false;
  }
}

export async function uninstallSkillFromAI(aiType, skillId) {
  if (aiType === 'clipboard') return true; // 클립보드는 삭제 개념 없음

  try {
    let dirHandle = await getDirHandle(skillId);
    
    if (dirHandle) {
      // IndexedDB에 저장된 핸들이 있는 경우, 권한 확인 및 재요청 (폴더창 안 띄움)
      const perm = await dirHandle.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') {
        const newPerm = await dirHandle.requestPermission({ mode: 'readwrite' });
        if (newPerm !== 'granted') {
          await showCustomAlert('폴더 접근 권한이 거부되어 삭제를 취소합니다.', '권한 거부', '🚫');
          return false;
        }
      }
    } else {
      // 저장된 핸들이 없는 경우 (구버전 호환용)
      await showCustomAlert('저장된 폴더 권한이 없습니다.\n스킬이 설치되었던 폴더를 다시 선택해 주세요.', '권한 필요', '📂');
      dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    }

    let fileHandle;

    try {
      if (aiType === 'cursor') {
        const cursorDir = await dirHandle.getDirectoryHandle('.cursor', { create: false });
        const rulesDir = await cursorDir.getDirectoryHandle('rules', { create: false });
        await rulesDir.removeEntry(`${skillId}.mdc`);
      } else if (aiType === 'windsurf') {
        fileHandle = await dirHandle.getFileHandle('.windsurfrules', { create: false });
      } else if (aiType === 'copilot') {
        const githubDir = await dirHandle.getDirectoryHandle('.github', { create: false });
        fileHandle = await githubDir.getFileHandle('copilot-instructions.md', { create: false });
      }
    } catch (e) {
      // 파일이 애초에 없으면 삭제할 것도 없음
      removeInstallState(skillId);
      await showCustomAlert(t('msg_uninstalled'), '삭제 완료', '🗑️');
      return true;
    }

    if (aiType !== 'cursor' && fileHandle) {
      const file = await fileHandle.getFile();
      let content = await file.text();
      
      const newContent = removeSkillBlock(content, skillId);
      
      if (content !== newContent) {
        const writable = await fileHandle.createWritable();
        await writable.write(newContent);
        await writable.close();
      }
    }

    removeInstallState(skillId);
    await removeDirHandle(skillId); // DB에서도 핸들 삭제
    await showCustomAlert(t('msg_uninstalled'), '삭제 완료', '🗑️');
    return true;

  } catch (err) {
    if (err.name === 'AbortError') return false;
    console.error(err);
    await showCustomAlert('오류가 발생했습니다:\n' + err.message, '오류', '❌');
    return false;
  }
}

function removeSkillBlock(content, id) {
  // BEGIN과 END 마커 사이의 모든 텍스트를 삭제하는 정규식
  const regex = new RegExp(`\\n# --- BEGIN AI SKILL: ${id} ---[\\s\\S]*?# --- END AI SKILL: ${id} ---\\n`, 'g');
  return content.replace(regex, '');
}

export function getInstallState(skillId) {
  const states = JSON.parse(localStorage.getItem('installed_skills') || '{}');
  return states[skillId]; // returns aiType or undefined
}

export function getInstalledSkillsCount() {
  const states = JSON.parse(localStorage.getItem('installed_skills') || '{}');
  return Object.keys(states).length;
}

function saveInstallState(skillId, aiType) {
  const states = JSON.parse(localStorage.getItem('installed_skills') || '{}');
  states[skillId] = aiType;
  localStorage.setItem('installed_skills', JSON.stringify(states));
}

function removeInstallState(skillId) {
  const states = JSON.parse(localStorage.getItem('installed_skills') || '{}');
  delete states[skillId];
  localStorage.setItem('installed_skills', JSON.stringify(states));
}
