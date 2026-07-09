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

export async function installSkillToAI(aiType, skill, onProgress) {
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
