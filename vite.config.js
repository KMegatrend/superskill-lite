import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const localSkillInstallerPlugin = () => ({
  name: 'local-skill-installer',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      // 1. 스킬 자동 저장 API
      if (req.url === '/api/install' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const { skillId, filename, content } = data;
            const pluginDir = path.join(process.cwd(), '.agent', 'skills');
            fs.mkdirSync(pluginDir, { recursive: true });
            // 파일명 중복을 피하기 위해 안전한 이름 사용
            const safeFilename = filename || `SKILL_${skillId}.md`;
            const savePath = path.join(pluginDir, safeFilename);
            
            // 저장 전 자동 번역 적용
            const finalContent = await translateMarkdownFull(content);
            
            fs.writeFileSync(savePath, finalContent, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, path: savePath }));
          } catch (err) {
            console.error('Install Error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      } 
      // 1.5. 설치된 스킬 목록 조회 API
      else if (req.url === '/api/installed-skills' && req.method === 'GET') {
        try {
          const homeDir = os.homedir();
          const pluginsDir = path.join(homeDir, '.gemini', 'config', 'plugins');
          let installed = [];
          if (fs.existsSync(pluginsDir)) {
            const dirs = fs.readdirSync(pluginsDir);
            for (const d of dirs) {
              const skillMdPath = path.join(pluginsDir, d, 'skills', 'SKILL.md');
              if (fs.existsSync(skillMdPath)) {
                installed.push(d);
              }
            }
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, installed }));
        } catch (err) {
          console.error('List Install Error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      }
      // 1.6 폴더 열기 API
      else if (req.url === '/api/open-folder' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const folderPath = data.path;
            
            // OS별 폴더 열기 명령어
            if (process.platform === 'win32') {
              exec(`start "" "${folderPath}"`);
            } else if (process.platform === 'darwin') {
              exec(`open "${folderPath}"`);
            } else {
              exec(`xdg-open "${folderPath}"`);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            console.error('Open Folder Error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      }
      // 1.7 깃허브 스킬 동기화 API
      else if (req.url === '/api/sync' && req.method === 'POST') {
        try {
          const logPath = path.join(process.cwd(), 'public', 'data', 'sync.log');
          fs.writeFileSync(logPath, '🔄 동기화 프로세스 시작 중...\n', 'utf-8');
          
          // 백그라운드에서 스크립트 기동
          exec(`"${process.execPath}" scripts/sync.js`);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (err) {
          console.error('Sync Error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      }
      // 1.8 동기화 로그 조회 API
      else if (req.url === '/api/sync-log' && req.method === 'GET') {
        try {
          const logPath = path.join(process.cwd(), 'public', 'data', 'sync.log');
          let logContent = '🔄 로그 파일을 찾을 수 없습니다.';
          if (fs.existsSync(logPath)) {
            logContent = fs.readFileSync(logPath, 'utf-8');
          }
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(logContent);
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      }
      // 2. 마크다운 한글 번역 API
      else if (req.url === '/api/translate-markdown' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            let text = data.text || '';

            const finalText = await translateMarkdownFull(text);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, text: finalText }));
          } catch (err) {
            console.error('Translation Error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      } 
      // 3. AI 스킬 추천 API
      else if (req.url === '/api/recommend' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const { provider, apiKey, query, skills } = data;
            
            if (!provider || !apiKey || !query || !skills) {
              throw new Error('Missing required fields');
            }

            const prompt = `다음은 사용 가능한 스킬 목록입니다:\n${JSON.stringify(skills.map(s => ({ id: s.id, name: s.name, desc: s.description })))}\n\n사용자의 다음 작업에 가장 적합한 스킬 ID를 최대 5개 추천해주세요. 반드시 ["id1", "id2"] 와 같은 순수 JSON 배열 형태로만 응답하고 다른 말은 절대 하지 마세요.\n사용자 작업: ${query}`;

            let resultIds = [];

            if (provider === 'gemini') {
              const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: { temperature: 0.2 }
                })
              });
              const json = await res.json();
              if (json.error) throw new Error(json.error.message);
              let text = json.candidates[0].content.parts[0].text;
              text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
              resultIds = JSON.parse(text);
            } else if (provider === 'openai') {
              const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini',
                  messages: [{ role: 'user', content: prompt }],
                  temperature: 0.2
                })
              });
              const json = await res.json();
              if (json.error) throw new Error(json.error.message);
              let text = json.choices[0].message.content;
              text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
              resultIds = JSON.parse(text);
            } else {
              throw new Error('Unsupported provider');
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, recommendedIds: resultIds }));
          } catch (err) {
            console.error('AI Recommend Error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      }
      // 4. 로컬 테스트용 로그인 API (React App용)
      else if (req.url === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.id === 'admin' && data.password === '1234') {
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Set-Cookie': 'site_auth=local-mock-token; Path=/; HttpOnly'
              });
              res.end(JSON.stringify({ success: true, role: 'admin' }));
            } else if (data.id === 'master' && data.password === 'admin1234!') {
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Set-Cookie': 'site_auth=master-token; Path=/; HttpOnly'
              });
              res.end(JSON.stringify({ success: true, role: 'master' }));
            } else if (data.id === 'member' && data.password === '1234!') {
              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Set-Cookie': 'site_auth=local-mock-token; Path=/; HttpOnly'
              });
              res.end(JSON.stringify({ success: true, role: 'user', plan: 'PRO' }));
            } else {
              res.writeHead(401, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: '아이디 또는 비밀번호가 틀립니다.' }));
            }
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      }
      // 4-1. 로그아웃 API
      else if (req.url === '/api/logout' && req.method === 'POST') {
        res.writeHead(200, { 
          'Content-Type': 'application/json',
          'Set-Cookie': 'site_auth=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        });
        res.end(JSON.stringify({ success: true }));
      }
      // 5. 로컬 테스트용 인증 확인 API
      else if (req.url === '/api/check-auth' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ authenticated: req.headers.cookie && req.headers.cookie.includes('site_auth=') }));
      }
      // 6. 메일 발송 API (Nodemailer + Ethereal Mail)
      else if (req.url === '/api/send-mail' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const nodemailer = (await import('nodemailer')).default;
            let testAccount = await nodemailer.createTestAccount();
            let transporter = nodemailer.createTransport({
              host: "smtp.ethereal.email",
              port: 587,
              secure: false,
              auth: { user: testAccount.user, pass: testAccount.pass },
            });
            let info = await transporter.sendMail({
              from: '"AI Super Skill" <system@aisuperskill.com>',
              to: "admin@aisuperskill.com",
              subject: `[${data.category || '문의'}] ${data.title || '새로운 문의가 접수되었습니다.'}`,
              text: `작성자: ${data.email || '익명'}\n\n${data.content}`,
              html: `<p><b>카테고리:</b> ${data.category || '문의'}</p><p><b>작성자:</b> ${data.email || '익명'}</p><p><b>제목:</b> ${data.title || '새로운 문의'}</p><hr/><p>${(data.content||'').replace(/\n/g, '<br/>')}</p>`
            });
            console.log("-----------------------------------------");
            console.log("📧 메일이 발송되었습니다!");
            console.log("미리보기 URL: %s", nodemailer.getTestMessageUrl(info));
            console.log("-----------------------------------------");
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, previewUrl: nodemailer.getTestMessageUrl(info) }));
          } catch (err) {
            console.error('Send Mail Error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      }
      else {
        next();
      }
    });
  }
});

// 마크다운 전체 번역 함수 (자동 설치 및 수동 번역에 공통 사용)
async function translateMarkdownFull(text) {
  if (!text) return '';
  // --- 1. 코드 블록 마스킹 ---
  const codeBlocks = [];
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `\n___CODE_BLOCK_${codeBlocks.length - 1}___\n`;
  });

  // 인라인 코드 마스킹
  const inlineCodes = [];
  text = text.replace(/`[^`\n]+`/g, (match) => {
    inlineCodes.push(match);
    return `___INLINE_CODE_${inlineCodes.length - 1}___`;
  });

  // --- 2. YAML Frontmatter 처리 ---
  let yamlPrefix = '';
  const yamlMatch = text.match(/^---\n([\s\S]*?)\n---/);
  if (yamlMatch) {
    const yamlContent = yamlMatch[1];
    let translatedYaml = yamlContent;
    const valueMatches = [...yamlContent.matchAll(/([a-zA-Z0-9_-]+):\s*("[^"]+"|.+)/g)];
    
    for (const m of valueMatches) {
      const key = m[1];
      const fullValue = m[2]; // 큰따옴표가 있으면 포함된 값
      
      const isQuoted = fullValue.startsWith('"') && fullValue.endsWith('"');
      const originalValue = isQuoted ? fullValue.slice(1, -1) : fullValue.trim();

      if (['name', 'description', 'title'].includes(key)) {
        const tv = await translateParagraph(originalValue);
        const newValue = isQuoted ? `"${tv}"` : tv;
        translatedYaml = translatedYaml.replace(`${key}: ${fullValue}`, `${key}: ${newValue}`);
      }
    }
    yamlPrefix = `---\n${translatedYaml}\n---\n`;
    text = text.replace(/^---\n[\s\S]*?\n---/, ''); // 본문에서 제거
  }

  // --- 3. 단락별 분리 및 번역 ---
  const paragraphs = text.split(/\n\n+/);
  const translatedParagraphs = [];

  for (const p of paragraphs) {
    if (!p.trim() || p.includes('___CODE_BLOCK_')) {
      translatedParagraphs.push(p);
      continue;
    }
    const trans = await translateParagraph(p);
    translatedParagraphs.push(trans);
  }

  let finalText = yamlPrefix + translatedParagraphs.join('\n\n');

  // --- 4. 언마스킹 ---
  finalText = finalText.replace(/___INLINE_CODE_(\d+)___/g, (match, p1) => inlineCodes[p1]);
  finalText = finalText.replace(/___CODE_BLOCK_(\d+)___/g, (match, p1) => codeBlocks[p1]);

  return finalText;
}

// 구글 번역 API 호출 유틸
async function translateParagraph(text) {
  if (!text || !text.trim()) return text;
  // 너무 긴 단락 방지
  const chunk = text.slice(0, 3000);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(chunk)}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    let result = '';
    if (data && data[0]) {
      for (const segment of data[0]) {
        if (segment[0]) result += segment[0];
      }
    }
    return result || text;
  } catch (err) {
    console.error('Google Translate API failed:', err);
    return text; // 실패 시 원문 반환
  }
}

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        marketplace: path.resolve(__dirname, 'marketplace.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true,
  },
  plugins: [react(), tailwindcss(), localSkillInstallerPlugin()]
});
