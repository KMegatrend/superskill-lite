/**
 * 리포터 모듈
 * 변환 결과를 JSON 및 HTML 리포트로 생성합니다.
 */

/**
 * JSON 리포트를 생성합니다.
 */
export function generateJsonReport(source, summary, validationResults, packages, timestamp) {
  return {
    meta: {
      tool: 'Claude to Antigravity Skill Converter',
      version: '1.0.0',
      timestamp: timestamp || new Date().toISOString(),
    },
    source,
    summary,
    skills: validationResults.map((vr, i) => ({
      name: vr.skillName,
      status: vr.status,
      issues: vr.issues,
      issueCount: vr.issueCount,
      files: packages[i]
        ? packages[i].files.map((f) => ({ path: f.path, type: f.type }))
        : [],
      changes: packages[i] ? packages[i].changes : [],
    })),
  };
}

/**
 * HTML 리포트를 생성합니다.
 */
export function generateHtmlReport(source, summary, validationResults, packages, timestamp) {
  const ts = timestamp || new Date().toISOString();
  const statusIcons = {
    success: '✅',
    warning: '⚠️',
    failed: '❌',
  };

  const statusColors = {
    success: '#10b981',
    warning: '#f59e0b',
    failed: '#ef4444',
  };

  const skillRows = validationResults
    .map((vr, i) => {
      const pkg = packages[i];
      const issueList = vr.issues
        .map(
          (issue) =>
            `<li class="issue issue-${issue.severity}">
              <span class="issue-badge ${issue.severity}">${issue.severity.toUpperCase()}</span>
              <span class="issue-code">[${issue.code}]</span> ${issue.message}
            </li>`
        )
        .join('');

      const fileList = pkg
        ? pkg.files
            .map(
              (f) =>
                `<li class="file-item"><code>${f.path}</code> <span class="file-type">${f.type}</span></li>`
            )
            .join('')
        : '<li class="file-item">파일 없음</li>';

      const changeList =
        pkg && pkg.changes.length > 0
          ? pkg.changes
              .map(
                (c) =>
                  `<li class="change-item">
                    <span class="change-type">${c.type}</span>
                    <code>${c.from}</code> → <code>${c.to}</code>
                    ${c.count ? `(${c.count}건)` : ''}
                  </li>`
              )
              .join('')
          : '<li class="change-item">변경 없음</li>';

      return `
        <div class="skill-card" data-status="${vr.status}">
          <div class="skill-header">
            <span class="status-icon">${statusIcons[vr.status]}</span>
            <h3 class="skill-name">${vr.skillName}</h3>
            <span class="status-badge" style="background: ${statusColors[vr.status]}20; color: ${statusColors[vr.status]}; border: 1px solid ${statusColors[vr.status]}40;">
              ${vr.status.toUpperCase()}
            </span>
          </div>
          ${
            vr.issues.length > 0
              ? `<div class="skill-section">
                  <h4>🔍 이슈 (${vr.issues.length}건)</h4>
                  <ul class="issue-list">${issueList}</ul>
                </div>`
              : ''
          }
          <div class="skill-section">
            <h4>📁 생성 파일</h4>
            <ul class="file-list">${fileList}</ul>
          </div>
          <div class="skill-section">
            <h4>🔄 적용된 변환</h4>
            <ul class="change-list">${changeList}</ul>
          </div>
        </div>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>스킬 변환 리포트</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #0a0a0f;
      --bg-secondary: #12121a;
      --bg-card: #1a1a2e;
      --border: #2a2a3e;
      --text-primary: #e8e8f0;
      --text-secondary: #8888a0;
      --accent-blue: #6366f1;
      --accent-green: #10b981;
      --accent-yellow: #f59e0b;
      --accent-red: #ef4444;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      padding: 2rem;
    }
    .report-container { max-width: 1000px; margin: 0 auto; }
    .report-header {
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem;
      background: linear-gradient(135deg, var(--bg-card), #16163a);
      border-radius: 16px;
      border: 1px solid var(--border);
    }
    .report-header h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }
    .report-header .meta { color: var(--text-secondary); font-size: 0.85rem; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .summary-card {
      text-align: center;
      padding: 1.5rem;
      border-radius: 12px;
      background: var(--bg-card);
      border: 1px solid var(--border);
    }
    .summary-card .number { font-size: 2.5rem; font-weight: 700; }
    .summary-card .label { font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem; }
    .skill-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      transition: transform 0.2s;
    }
    .skill-card:hover { transform: translateY(-2px); }
    .skill-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .skill-name { flex: 1; font-size: 1.1rem; }
    .status-badge {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      letter-spacing: 0.05em;
    }
    .skill-section { margin-top: 1rem; }
    .skill-section h4 { font-size: 0.85rem; margin-bottom: 0.5rem; color: var(--text-secondary); }
    .issue-list, .file-list, .change-list { list-style: none; }
    .issue-list li, .file-list li, .change-list li {
      padding: 0.4rem 0;
      font-size: 0.85rem;
      border-bottom: 1px solid var(--border);
    }
    .issue-badge {
      font-size: 0.65rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      margin-right: 0.5rem;
    }
    .issue-badge.error { background: var(--accent-red); color: white; }
    .issue-badge.warning { background: var(--accent-yellow); color: #000; }
    .issue-badge.info { background: var(--accent-blue); color: white; }
    .file-type { font-size: 0.7rem; color: var(--accent-blue); }
    .change-type {
      font-size: 0.65rem;
      background: var(--accent-blue);
      color: white;
      padding: 0.1rem 0.4rem;
      border-radius: 3px;
      margin-right: 0.4rem;
    }
    code {
      background: var(--bg-secondary);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="report-header">
      <h1>🔄 스킬 변환 리포트</h1>
      <p class="meta">
        소스: ${source.type === 'github' ? source.url : source.path || 'Local Input'} ·
        생성: ${new Date(ts).toLocaleString('ko-KR')}
      </p>
    </div>
    <div class="summary-grid">
      <div class="summary-card">
        <div class="number" style="color: var(--accent-blue)">${summary.total}</div>
        <div class="label">전체</div>
      </div>
      <div class="summary-card">
        <div class="number" style="color: var(--accent-green)">${summary.success}</div>
        <div class="label">성공</div>
      </div>
      <div class="summary-card">
        <div class="number" style="color: var(--accent-yellow)">${summary.warning}</div>
        <div class="label">경고</div>
      </div>
      <div class="summary-card">
        <div class="number" style="color: var(--accent-red)">${summary.failed}</div>
        <div class="label">실패</div>
      </div>
    </div>
    <div class="skills-list">
      ${skillRows}
    </div>
  </div>
</body>
</html>`;
}

/**
 * 리포트 데이터를 Blob으로 변환하여 다운로드합니다.
 */
export function downloadReport(content, filename, type = 'application/json') {
  const blob = new Blob([typeof content === 'string' ? content : JSON.stringify(content, null, 2)], {
    type,
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
