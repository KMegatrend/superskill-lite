// File System Access API 기반 스킬 설치기
import { t } from './i18n.js';
import { saveDirHandle, getDirHandle, removeDirHandle } from './db.js';

// 설치된 스킬 마커 형식
const MARKER_BEGIN = (id) => `\n# --- BEGIN AI SKILL: ${id} ---\n`;
const MARKER_END = (id) => `\n# --- END AI SKILL: ${id} ---\n`;

export function showCustomAlert(message, title = '알림', icon = '💡') {
  return new Promise((resolve) => {
    const modal = document.getElementById('custom-alert-modal');
    const titleEl = document.getElementById('custom-alert-title');
    const msgEl = document.getElementById('custom-alert-message');
    const okBtn = document.getElementById('custom-alert-ok');
    const iconEl = document.getElementById('custom-alert-icon');

    if (!modal) {
      alert(message);
      resolve();
      return;
    }

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (iconEl) iconEl.textContent = icon;
    
    modal.style.display = 'flex';

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

    // 2. AI 타입별 파일 접근
    if (aiType === 'cursor') {
      fileHandle = await dirHandle.getFileHandle('.cursorrules', { create: true });
      pathLabel = '.cursorrules';
    } else if (aiType === 'windsurf') {
      fileHandle = await dirHandle.getFileHandle('.windsurfrules', { create: true });
      pathLabel = '.windsurfrules';
    } else if (aiType === 'copilot') {
      // .github 폴더 안에 생성해야 함
      const githubDir = await dirHandle.getDirectoryHandle('.github', { create: true });
      fileHandle = await githubDir.getFileHandle('copilot-instructions.md', { create: true });
      pathLabel = '.github/copilot-instructions.md';
    } else {
      throw new Error("Unsupported AI Type");
    }

    // 3. 파일 읽기
    const file = await fileHandle.getFile();
    let content = await file.text();

    // 4. 중복 체크 및 삭제 (기존에 설치된 버전이 있다면 먼저 삭제)
    content = removeSkillBlock(content, skill.id);

    // 5. 스킬 블록 추가
    const contentToInstall = skill.skillContent || '';
    const skillBlock = `${MARKER_BEGIN(skill.id)}${contentToInstall}${MARKER_END(skill.id)}`;
    content += skillBlock;

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
        fileHandle = await dirHandle.getFileHandle('.cursorrules', { create: false });
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

    if (fileHandle) {
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
