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
  '<title>双平台定时任务监控与巡检看板 (明亮浅蓝科技版)</title>'
);

// 3. 明亮浅蓝科技风 CSS（彻底告别死黑，浅色通透底，高对比深黑墨蓝文字，字字清晰锐利）
const lightTechCss = `
  <style>
    :root {
      /* 明亮浅蓝科技调色盘 */
      --tech-bg: #EDF5FC;
      --tech-gradient: radial-gradient(circle at 15% 15%, #F4F9FD 0%, #E8F2FA 50%, #DCEAF7 100%);
      --tech-grid-color: rgba(2, 132, 199, 0.04);

      --bg-card: #FFFFFF;
      --bg-subtle: #F0F6FC;
      --border-color: #BAE6FD;
      --border-glow: rgba(14, 165, 233, 0.25);

      /* 文字必须极高对比度，深黑墨蓝，像印刷品一样清晰 */
      --text-main: #0F172A;
      --text-secondary: #334155;
      --text-muted: #64748B;

      --tech-cyan: #0284C7;
      --tech-blue: #2563EB;
      --tech-blue-accent: #0369A1;

      /* 双店专属冷调科技标色 */
      --benomi-accent: #0284C7;
      --benomi-bg: #E0F2FE;
      --benomi-border: #7DD3FC;

      --nova-accent: #6366F1;
      --nova-bg: #EEF2FF;
      --nova-border: #C7D2FE;

      /* 状态色（明亮底高辨识度） */
      --status-success-bg: #ECFDF5;
      --status-success-text: #047857;
      --status-success-border: #6EE7B7;

      --status-warning-bg: #FEF3C7;
      --status-warning-text: #B45309;
      --status-warning-border: #FCD34D;

      --status-error-bg: #FEF2F2;
      --status-error-text: #DC2626;
      --status-error-border: #FCA5A5;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      background: var(--tech-gradient);
      background-attachment: fixed;
      color: var(--text-main);
      padding: 16px 24px;
      line-height: 1.5;
      min-height: 100vh;
      position: relative;
    }

    /* 淡雅科技微网格底纹 */
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

    /* 全屏自适应容器 */
    .container {
      width: 100%;
      max-width: 1920px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    /* 顶部导航与状态栏 - 明亮科技控制台 */
    .header {
      background: #FFFFFF;
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
      box-shadow: 0 4px 18px -2px rgba(2, 132, 199, 0.08), 0 1px 3px rgba(0,0,0,0.03);
    }
    .header-title h1 {
      font-size: 20px;
      font-weight: 800;
      color: #0F172A;
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
      background: #F1F5F9;
      color: var(--text-secondary);
      border: 1px solid #CBD5E1;
    }

    /* ================= 选项卡导航卡槽 (明亮科技 Tabs) ================= */
    .tabs-wrapper {
      margin-bottom: 20px;
      background: #E4F0FA;
      padding: 6px;
      border-radius: 12px;
      border: 1.5px solid #BAE6FD;
      box-shadow: 0 4px 14px -2px rgba(2, 132, 199, 0.08);
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

    /* 选项卡按钮：维持原有高度56px、居中对齐、无上方小字、下方保留「▼ 正在查看」 */
    .tab-btn {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      padding: 10px 16px;
      min-height: 56px;
      font-size: 15px;
      font-weight: 800;
      color: #1E293B;
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
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }

    .tab-btn:hover {
      background: #EFF6FF;
      border-color: #38BDF8;
      color: #0284C7;
      transform: translateY(-1px);
    }

    /* 激活态：深邃青蓝渐变 + 纯白大字 + 发光微外托 + 下方「▼ 正在查看」提示 */
    .tab-btn.active {
      background: linear-gradient(135deg, #0284C7 0%, #2563EB 100%);
      border-color: #0284C7;
      color: #FFFFFF;
      box-shadow: 0 6px 18px -2px rgba(37, 99, 235, 0.38), 0 0 0 2px rgba(186, 230, 253, 0.6);
      padding-bottom: 16px;
    }

    .tab-btn.active::after {
      content: "▼ 正在查看";
      position: absolute;
      bottom: 3px;
      font-size: 9px;
      font-weight: 700;
      color: #E0F2FE;
      letter-spacing: 0.5px;
    }

    .view-content { display: none; }
    .view-content.active { display: block; animation: tabFadeIn 0.2s ease-out; }

    @keyframes tabFadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ================= 模块卡片 - 高对比明亮立体卡片 ================= */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 22px;
      margin-bottom: 22px;
      box-shadow: 0 4px 18px -2px rgba(2, 132, 199, 0.08), 0 1px 3px rgba(0,0,0,0.03);
      transition: all 0.2s ease;
      position: relative;
    }

    .card:hover {
      box-shadow: 0 8px 24px -2px rgba(2, 132, 199, 0.14);
      border-color: #7DD3FC;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1.5px solid #E2E8F0;
      padding-bottom: 12px;
    }
    .card-title {
      font-size: 16px;
      font-weight: 800;
      color: #0F172A;
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
    .tag-benomi { background: var(--benomi-bg); color: #0369A1; border: 1px solid var(--benomi-border); }
    .tag-nova { background: var(--nova-bg); color: #4338CA; border: 1px solid var(--nova-border); }

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

    /* 科技数显指标盒 - 白底深字，高反差高可读性 */
    .stat-box {
      background: linear-gradient(180deg, #FFFFFF 0%, #F0F7FD 100%);
      border: 1.5px solid #BAE6FD;
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 2px 6px rgba(2, 132, 199, 0.04);
      transition: all 0.2s ease;
    }
    .stat-box:hover {
      transform: translateY(-2px);
      border-color: #38BDF8;
      box-shadow: 0 6px 16px -2px rgba(2, 132, 199, 0.12);
    }
    .stat-label { 
      font-size: 12px; 
      font-weight: 700; 
      color: #334155; 
      margin-bottom: 6px; 
    }
    .stat-value { 
      font-size: 22px; 
      font-weight: 800; 
      color: #0F172A; 
      letter-spacing: -0.4px;
    }
    .stat-desc { 
      font-size: 11px; 
      font-weight: 600; 
      color: #64748B; 
      margin-top: 6px; 
    }

    /* 明细列表 */
    .detail-list { display: flex; flex-direction: column; gap: 8px; }
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      padding: 8px 10px;
      border-radius: 6px;
      background: #F8FAFC;
      border-bottom: 1px dashed #CBD5E1;
      transition: background 0.15s ease;
    }
    .detail-item:last-child { border-bottom: none; }
    .detail-item:hover { background: #EFF6FF; }
    .detail-title { color: #334155; font-weight: 600; }
    .detail-value { font-weight: 700; color: #0F172A; text-align: right; }

    /* 表格与科技表头 - 纯白数据行，文字高对比 */
    .table-container {
      overflow-x: auto;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      margin-top: 14px;
      background: #FFFFFF;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }
    th {
      background: linear-gradient(180deg, #F0F7FF 0%, #E2EFFC 100%);
      color: #0369A1;
      font-weight: 800;
      padding: 12px 14px;
      border-bottom: 2px solid #BAE6FD;
      white-space: nowrap;
      letter-spacing: 0.2px;
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #F1F5F9;
      color: #0F172A;
      vertical-align: middle;
      font-weight: 500;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #F0F9FF; }

    /* 不合格整行标红硬约束（醒目红底红字） */
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
      border: 1.5px solid #93C5FD;
      border-radius: 6px;
      text-decoration: none;
      font-size: 11px;
      font-weight: 700;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(37,99,235,0.04);
    }
    .sheet-link-chip:hover {
      background: #DBEAFE;
      border-color: #2563EB;
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
      background: #F1F5F9;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      color: #334155;
      font-weight: 600;
    }
  </style>
`;

// 替换原 style 标签
const styleRegex = /<style>[\s\S]*?<\/style>/;
v2Code = v2Code.replace(styleRegex, lightTechCss.trim());

// 4. 替换 tabs 导航标签（无上方副标小字，保留下方「▼ 正在查看」）
const oldTabsHtml = `  <!-- 选项卡导航 -->
  <div class="tabs">
    <button class="tab-btn active" onclick="switchTab('overview')">总览</button>
    <button class="tab-btn" onclick="switchTab('benomi')">贝诺美专属</button>
    <button class="tab-btn" onclick="switchTab('nova')">诺瓦专属</button>
    <button class="tab-btn" onclick="switchTab('cron')">定时任务与表格</button>
  </div>`;

const newTabsHtml = `  <!-- 选项卡导航 (明亮浅蓝科技控制台) -->
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

// 写入脚本并输出
fs.writeFileSync(path.join(__dirname, 'build_dashboard_tech_v2.js'), v2Code, 'utf8');
console.log('build_dashboard_tech_v2.js 生成成功！');
