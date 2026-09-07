const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const rootDir = path.join(__dirname, '..');
const registryPath = path.join(rootDir, 'public', 'data', 'skill-registry.json');
const packagesDir = path.join(rootDir, 'public', 'packages');

if (!fs.existsSync(packagesDir)) {
  fs.mkdirSync(packagesDir, { recursive: true });
}

const data = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

async function buildAllPackages() {
  console.log(`Building ZIP packages for ${data.skills.length} skills...`);
  let builtCount = 0;

  for (const skill of data.skills) {
    const zip = new JSZip();
    const folder = zip.folder(skill.id);

    // 1. SKILL.md
    let skillMdContent = skill.skillContent;
    if (!skillMdContent) {
      skillMdContent = `---
name: "${skill.name}"
description: "${skill.description || ''}"
tags:${(skill.tags || []).map(t => '\n  - ' + t).join('')}
---

# ${skill.name}

${skill.description || ''}

${skill.role ? `> **역할**: ${skill.role}\n` : ''}

## 🎯 실행 지침
1. 사용자의 요구사항을 파악하고 최적의 결과를 도출합니다.
2. 예외 케이스를 방어하고 완성도 높은 결과물을 제시합니다.
`;
    }
    folder.file("SKILL.md", skillMdContent);

    // 2. manifest.json
    const manifest = {
      name: skill.id,
      version: skill.version || "1.0.0",
      description: skill.description || "",
      author: skill.author || "AI Super Skill",
      role: skill.role || "",
      tags: skill.tags || [],
      starterPrompts: skill.starterPrompts || [],
      beforeAfter: skill.beforeAfter || null,
      superskill: {
        packageVersion: "1.0.0",
        downloadedAt: new Date().toISOString()
      }
    };
    folder.file("manifest.json", JSON.stringify(manifest, null, 2));

    // 3. README.md
    const readmeContent = `# ${skill.name}

> 슈퍼스킬 패키지 매니저(SuperSkill Package Manager)에서 제공하는 에이전트 전용 풀 패키지입니다.

## 🚀 에이전트 설치 및 사용 방법

### 1. Antigravity IDE / Cursor / Claude Code
본 폴더(\`${skill.id}\`)를 프로젝트의 에이전트 스킬 디렉토리에 배치하세요:
- **Antigravity**: \`.agents/skills/${skill.id}/\`
- **Cursor**: \`.cursor/skills/${skill.id}/\` 또는 \`.cursorrules\`
- **Claude Code**: \`~/.claude/skills/${skill.id}/\`

### 2. 점진적 탐색 (Progressive Disclosure)
에이전트가 \`SKILL.md\`를 인식하여 작업 시 100% 지능으로 지침을 자동 수행합니다.
`;
    folder.file("README.md", readmeContent);

    // Check if we have local files in .agents/skills/<skill.id>/ (like references/ etc.)
    const localSkillDir = path.join(rootDir, '.agents', 'skills', skill.id);
    if (fs.existsSync(localSkillDir)) {
      const items = fs.readdirSync(localSkillDir);
      for (const item of items) {
        if (item === 'SKILL.md') continue;
        const itemPath = path.join(localSkillDir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
          addFolderToZip(folder.folder(item), itemPath);
        } else {
          folder.file(item, fs.readFileSync(itemPath));
        }
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    const zipFilePath = path.join(packagesDir, `${skill.id}.zip`);
    fs.writeFileSync(zipFilePath, zipBuffer);
    builtCount++;
  }

  console.log(`Successfully generated ${builtCount} ZIP packages in public/packages/!`);
}

function addFolderToZip(zipFolder, localDirPath) {
  const items = fs.readdirSync(localDirPath);
  for (const item of items) {
    const itemPath = path.join(localDirPath, item);
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      addFolderToZip(zipFolder.folder(item), itemPath);
    } else {
      zipFolder.file(item, fs.readFileSync(itemPath));
    }
  }
}

buildAllPackages().catch(err => {
  console.error("Failed to build packages:", err);
  process.exit(1);
});
