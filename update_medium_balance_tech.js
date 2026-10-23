const fs = require('fs');
const path = require('path');

const srcCode = fs.readFileSync(path.join(__dirname, 'build_complete_dashboard.js'), 'utf8');

// 1. 修改输出文件名
let v2Code = srcCode.replace(
  "const HTML_FILE = path.join(__dirname, 'dashboard.html');",
  "const HTML_FILE = path.join(__dirname, 'dashboard_tech_v2.html');"
);

// 2. 替换 title
v2Code = v2Code.replace(
  '<title>双平台定时任务监控与巡检看板 (最新全量对齐版)</title>',
  '<title>双平台定时任务监控与巡检看板 (中度科技蓝版)</title>'
);

// 3. 居中中度科技蓝 CSS + 主题配色切换器
const mediumTechCss = `
  <style>
    :root {
      /* 默认：居中中度科技蓝 (Medium Slate Azure) - 既不泛白，也不发黑，色彩饱满沉稳 */
      --theme-bg-gradient: linear-gradient(135deg, #99BFE0 0%, #82A9CE 50%, #6C94BE 100%);
      --tech-grid-color: rgba(2, 132, 199, 0.08);

      --bg-header: rgba(240, 247, 255, 0.94);
      --bg-card: rgba(244, 249, 255, 0.94);
      --bg-subtle: #FFFFFF;
      --border-color: #38BDF8;
      --border-accent: #0284C7;
      --card-shadow: 0 6px 22px -2px rgba(15, 35, 60, 0.18), 0 1px 3px rgba(0, 0, 0, 0.05);

      /* 高清晰深墨蓝文字，字字锐利 */
      --text-main: #0A1C2E;
      --text-secondary: #1E3A5F;
      --text-muted: #475569;

      --tech-cyan: #0284C7;
      --tech-blue: #0369A1;

      --benomi-accent: #0284C7;
      --benomi-bg: #E0F2FE;
      --benomi-border: #0284C7;

      --nova-accent: #6366F1;
      --nova-bg: #EEF2FF;
      --nova-border: #6366F1;

      --status-success-bg: #ECFDF5;
      --status-success-text: #047857;
      --status-success-border: #10B981;

      --status-warning-bg: #FEF3C7;
      --status-warning-text: #B45309;
      --status-warning-border: #F59E0B;

      --status-error-bg: #FEF2F2;
      --status-error-text: #DC2626;
      --status-error-border: #EF4444;
    }

    /* 预置 4 档精选科技主题供您随时一键微调 */
    body.theme-steel {
      /* 雾霾钢灰蓝 (中偏灰冷调) */
      --theme-bg-gradient: linear-gradient(135deg, #8798A8 0%, #6F8294 50%, #576B7D 100%);
      --bg-header: rgba(240, 244, 248, 0.95);
      --bg-card: rgba(245, 248, 250, 0.95);
      --border-color: #60A5FA;
    }
    body.theme-dark {
      /* 大屏深海蓝 (沉浸暗色) */
      --theme-bg-gradient: radial-gradient(circle at 15% 15%, #1C334E 0%, #15273C 50%, #0E1C2C 100%);
      --bg-header: rgba(21, 38, 59, 0.95);
      --bg-card: rgba(21, 38, 59, 0.94);
      --bg-subtle: #192E46;
      --border-color: rgba(56, 189, 248, 0.35);
      --text-main: #FFFFFF;
      --text-secondary: #CBD5E1;
      --text-muted: #94A3B8;
    }
    body.theme-light {
      /* 冰川浅蓝 (明亮清爽) */
      --theme-bg-gradient: radial-gradient(circle at 15% 15%, #F4F9FD 0%, #E8F2FA 50%, #DCEAF7 100%);
      --bg-header: #FFFFFF;
      --bg-card: #FFFFFF;
      --bg-subtle: #F0F6FC;
      --border-color: #BAE6FD;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      background: var(--theme-bg-gradient);
      background-attachment: fixed;
      color: var(--text-main);
      padding: 16px 24px;
      line-height: 1.5;
      min-height: 100vh;
      position: relative;
      transition: background 0.3s ease, color 0.3s ease;
    }

    body::before {
      content: "";
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: 
        linear-gradient(var(--tech-grid-color) 1px, transparent 1px),
        linear-gradient(90deg, var(--tech-grid-color) 1px, transparent 1px);
      background-size: 28px 28px;
      pointer-events: none;
      z-index: 0;
    }

    .container {
      width: 100%;
      max-width: 1920px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    /* 顶部导航与状态栏 */
    .header {
      background: var(--bg-header);
      backdrop-filter: blur(14px);
      border: 1.5px solid var(--border-color);
      border-top: 4px solid var(--tech-cyan);
      border-radius: 12px;
      padding: 16px 24px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      box-shadow: var(--card-shadow);
    }
    .header-title h1 {
      font-size: 20px;
      font-weight: 800;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: -0.2px;
    }
    .header-title p {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-top: 4px;
    }
    .header-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.2px;
    }
    .badge-ok {
      background: var(--status-success-bg);
      color: var(--status-success-text);
      border: 1px solid var(--status-success-border);
    }
    .badge-danger {
      background: var(--status-error-bg);
      color: var(--status-error-text);
      border: 1px solid var(--status-error-border);
    }
    .badge-neutral {
      background: #E2E8F0;
      color: var(--text-secondary);
      border: 1px solid #CBD5E1;
    }

    /* 调色板快捷选择器 */
    .theme-picker {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(255,255,255,0.7);
      padding: 3px 6px;
      border-radius: 20px;
      border: 1px solid rgba(2, 132, 199, 0.3);
      font-size: 11px;
      font-weight: 700;
    }
    .theme-chip {
      border: none;
      background: transparent;
      padding: 3px 8px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-secondary);
      transition: all 0.2s ease;
    }
    .theme-chip.active, .theme-chip:hover {
      background: #0284C7;
      color: #FFFFFF;
    }

    /* ================= 中度科技蓝分页控制台 (Tabs) ================= */
    .tabs-wrapper {
      margin-bottom: 20px;
      background: rgba(240, 247, 255, 0.88);
      backdrop-filter: blur(12px);
      padding: 6px;
      border-radius: 12px;
      border: 1.5px solid var(--border-color);
      box-shadow: 0 4px 16px -2px rgba(15, 35, 60, 0.12);
    }

    .tabs {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      border-bottom: none;
      padding-bottom: 0;
    }

    @media (max-width: 960px) {
      .tabs { grid-template-columns: repeat(2, 1fr); }
    }

    /* 选项卡按钮：高度56px、居中对齐、无上方小字、下方保留「▼ 正在查看」 */
    .tab-btn {
      background: #FFFFFF;
      border: 1px solid #BAE6FD;
      padding: 10px 16px;
      min-height: 56px;
      font-size: 15px;
      font-weight: 800;
      color: var(--text-main);
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      white-space: nowrap;
      user-select: none;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }

    .tab-btn:hover {
      background: #EFF6FF;
      border-color: #0284C7;
      color: #0284C7;
      transform: translateY(-1px);
    }

    /* 激活态：深邃青蓝渐变 + 纯白大字 + 发光微外托 + 下方「▼ 正在查看」提示 */
    .tab-btn.active {
      background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);
      border-color: #0284C7;
      color: #FFFFFF;
      box-shadow: 0 6px 18px -2px rgba(2, 132, 199, 0.42), 0 0 0 2px rgba(186, 230, 253, 0.7);
      padding-bottom: 16px;
    }

    .tab-btn.active::after {
      content: "▼ 正在查看";
      position: absolute;
      bottom: 3px;
      font-size: 9px;
      font-weight: 700;
      color: #BAE6FD;
      letter-spacing: 0.5px;
    }

    .view-content { display: none; }
    .view-content.active { display: block; animation: tabFadeIn 0.2s ease-out; }

    @keyframes tabFadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ================= 模块卡片 - 中度科技立体分层 ================= */
    .card {
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: 12px;
      padding: 22px;
      margin-bottom: 22px;
      box-shadow: var(--card-shadow);
      transition: all 0.2s ease;
      position: relative;
    }

    .card:hover {
      box-shadow: 0 10px 28px -2px rgba(15, 35, 60, 0.22);
      border-color: #0284C7;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1.5px solid rgba(2, 132, 199, 0.18);
      padding-bottom: 12px;
    }
    .card-title {
      font-size: 16px;
      font-weight: 800;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: -0.2px;
    }
    .card-tag {
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 6px;
      font-weight: 700;
    }
    .tag-benomi { background: var(--benomi-bg); color: var(--benomi-accent); border: 1.5px solid var(--benomi-border); }
    .tag-nova { background: var(--nova-bg); color: var(--nova-accent); border: 1.5px solid var(--nova-border); }

    /* 网格布局 */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    @media (max-width: 960px) {
      .grid-2 { grid-template-columns: 1fr; }
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    @media (max-width: 1200px) {
      .grid-4 { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .grid-4 { grid-template-columns: 1fr; }
    }

    /* 科技数显指标盒 */
    .stat-box {
      background: var(--bg-subtle);
      border: 1.5px solid var(--border-color);
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(15, 35, 60, 0.06);
      transition: all 0.2s ease;
    }
    .stat-box:hover {
      transform: translateY(-2px);
      border-color: #0284C7;
      box-shadow: 0 6px 18px rgba(2, 132, 199, 0.18);
    }
    .stat-label { 
      font-size: 12px; 
      font-weight: 700; 
      color: var(--text-secondary); 
      margin-bottom: 6px; 
    }
    .stat-value { 
      font-size: 22px; 
      font-weight: 800; 
      color: var(--text-main); 
      letter-spacing: -0.4px;
    }
    .stat-desc { 
      font-size: 11px; 
      font-weight: 600; 
      color: var(--text-muted); 
      margin-top: 6px; 
    }

    /* 明细列表 */
    .detail-list { display: flex; flex-direction: column; gap: 8px; }
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      padding: 8px 12px;
      border-radius: 6px;
      background: var(--bg-subtle);
      border-bottom: 1px dashed rgba(2, 132, 199, 0.18);
      transition: background 0.15s ease;
    }
    .detail-item:last-child { border-bottom: none; }
    .detail-item:hover { background: #E0F2FE; }
    .detail-title { color: var(--text-secondary); font-weight: 600; }
    .detail-value { font-weight: 700; color: var(--text-main); text-align: right; }

    /* 表格与科技表头 */
    .table-container {
      overflow-x: auto;
      border: 1.5px solid var(--border-color);
      border-radius: 10px;
      margin-top: 14px;
      background: var(--bg-subtle);
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }
    th {
      background: linear-gradient(180deg, #E0F2FE 0%, #BAE6FD 100%);
      color: #0369A1;
      font-weight: 800;
      padding: 12px 14px;
      border-bottom: 2px solid #0284C7;
      white-space: nowrap;
      letter-spacing: 0.2px;
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #E2E8F0;
      color: var(--text-main);
      vertical-align: middle;
      font-weight: 500;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #EBF5FE; }

    /* 不合格整行标红硬约束 */
    tr.row-fail td {
      color: #DC2626 !important;
      background-color: #FEF2F2 !important;
      font-weight: 700;
      border-bottom-color: #FECACA;
    }

    .sheet-link-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin: 2px 4px 2px 0;
      padding: 4px 10px;
      background: #EFF6FF;
      color: #1D4ED8;
      border: 1.5px solid #0284C7;
      border-radius: 6px;
      text-decoration: none;
      font-size: 11px;
      font-weight: 700;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(2, 132, 199, 0.08);
    }
    .sheet-link-chip:hover {
      background: #DBEAFE;
      border-color: #1D4ED8;
      color: #1E40AF;
      transform: translateY(-1px);
    }

    .alert-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.2px;
    }
    .alert-done { 
      background: var(--status-success-bg); 
      color: var(--status-success-text); 
      border: 1px solid var(--status-success-border); 
      box-shadow: 0 1px 2px rgba(4,120,87,0.08);
    }
    .alert-pending { 
      background: var(--status-warning-bg); 
      color: var(--status-warning-text); 
      border: 1px solid var(--status-warning-border); 
      box-shadow: 0 1px 2px rgba(180,83,9,0.08);
    }
    .alert-normal { 
      background: var(--status-success-bg); 
      color: var(--status-success-text); 
      border: 1px solid var(--status-success-border); 
    }
    .alert-danger { 
      background: var(--status-error-bg); 
      color: var(--status-error-text); 
      border: 1px solid var(--status-error-border); 
    }

    .cron-pill {
      font-size: 11px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      padding: 3px 8px;
      background: var(--bg-subtle);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      font-weight: 600;
    }
  </style>
`;

// 替换原 style 标签
const styleRegex = /<style>[\s\S]*?<\/style>/;
v2Code = v2Code.replace(styleRegex, mediumTechCss.trim());

// 4. 替换 tabs 导航标签（无上方副标小字，保留下方「▼ 正在查看」）
const oldTabsHtml = `  <!-- 选项卡导航 -->
  <div class="tabs">
    <button class="tab-btn active" onclick="switchTab('overview')">总览</button>
    <button class="tab-btn" onclick="switchTab('benomi')">贝诺美专属</button>
    <button class="tab-btn" onclick="switchTab('nova')">诺瓦专属</button>
    <button class="tab-btn" onclick="switchTab('cron')">定时任务与表格</button>
  </div>`;

const newTabsHtml = `  <!-- 选项卡导航 (中度科技蓝控制台) -->
  <div class="tabs-wrapper">
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('overview')">
        <span>🌐 全局总览</span>
      </button>
      <button class="tab-btn" onclick="switchTab('benomi')">
        <span>🔵 贝诺美专属</span>
      </button>
      <button class="tab-btn" onclick="switchTab('nova')">
        <span>🟣 诺瓦专属</span>
      </button>
      <button class="tab-btn" onclick="switchTab('cron')">
        <span>⏱️ 定时任务与表格</span>
      </button>
    </div>
  </div>`;

v2Code = v2Code.replace(oldTabsHtml, newTabsHtml);

// 5. 在顶部 headerMeta 中追加微调色系选择器，方便用户在页面上一键秒切对比
const oldHeaderMeta = '<div class="header-meta" id="headerMeta">';
const newHeaderMeta = `<div class="header-meta" id="headerMeta">
      <div class="theme-picker" title="快速切换色彩明暗度">
        <span>🎨 色度:</span>
        <button class="theme-chip active" onclick="switchTheme('medium')">中度蓝</button>
        <button class="theme-chip" onclick="switchTheme('steel')">雾霾钢青</button>
        <button class="theme-chip" onclick="switchTheme('dark')">深邃大屏</button>
        <button class="theme-chip" onclick="switchTheme('light')">冰川浅蓝</button>
      </div>`;
v2Code = v2Code.replace(oldHeaderMeta, newHeaderMeta);

// 6. 追加 switchTheme 脚本
const scriptThemeAddon = `
  function switchTheme(theme) {
    document.body.className = '';
    document.querySelectorAll('.theme-chip').forEach(c => c.classList.remove('active'));
    if (theme !== 'medium') {
      document.body.classList.add('theme-' + theme);
    }
    const targetBtn = Array.from(document.querySelectorAll('.theme-chip')).find(b => b.innerText.includes(
      theme === 'medium' ? '中度' : (theme === 'steel' ? '钢青' : (theme === 'dark' ? '深邃' : '浅蓝'))
    ));
    if (targetBtn) targetBtn.classList.add('active');
    try { localStorage.setItem('dashboard_theme', theme); } catch(e){}
  }

  // 恢复上次选择的色度
  try {
    const saved = localStorage.getItem('dashboard_theme');
    if (saved) switchTheme(saved);
  } catch(e){}
`;
v2Code = v2Code.replace("function switchTab(tabId) {", scriptThemeAddon + "\n  function switchTab(tabId) {");

// 写入脚本并输出
fs.writeFileSync(path.join(__dirname, 'build_dashboard_tech_v2.js'), v2Code, 'utf8');
console.log('build_dashboard_tech_v2.js 生成成功！');
