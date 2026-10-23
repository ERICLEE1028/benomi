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
  '<title>双平台定时任务监控与巡检看板 (大屏科技风版)</title>'
);

// 3. 大屏科技风配色方案 (参考大屏：中度冷调青蓝灰底色，科技青蓝发光线与数显，绝不死黑，保持清晰阅读)
const techScreenCss = `
  <style>
    :root {
      /* 大屏科技冷色调（中深冷青蓝，不过深死黑） */
      --tech-bg: #0F1D2B;
      --tech-gradient: radial-gradient(circle at 15% 15%, #182C40 0%, #102030 50%, #0A1624 100%);
      --tech-grid-color: rgba(56, 189, 248, 0.06);

      --bg-card: rgba(18, 33, 49, 0.88);
      --bg-subtle: #142537;
      --border-color: rgba(56, 189, 248, 0.22);
      --border-glow: rgba(56, 189, 248, 0.45);

      --text-main: #F1F5F9;
      --text-secondary: #94A3B8;
      --text-muted: #64748B;

      --tech-cyan: #00F0FF;
      --tech-blue: #38BDF8;
      --tech-blue-accent: #0284C7;
      --tech-gold: #FBBF24;
      --tech-emerald: #10B981;

      /* 双店专属冷调科技标色 */
      --benomi-accent: #38BDF8;
      --benomi-bg: rgba(56, 189, 248, 0.12);
      --benomi-border: rgba(56, 189, 248, 0.45);

      --nova-accent: #A78BFA;
      --nova-bg: rgba(167, 139, 250, 0.12);
      --nova-border: rgba(167, 139, 250, 0.45);

      /* 状态色（暗底高辨识度） */
      --status-success-bg: rgba(16, 185, 129, 0.16);
      --status-success-text: #34D399;
      --status-success-border: rgba(16, 185, 129, 0.4);

      --status-warning-bg: rgba(245, 158, 11, 0.16);
      --status-warning-text: #FBBF24;
      --status-warning-border: rgba(245, 158, 11, 0.4);

      --status-error-bg: rgba(239, 68, 68, 0.18);
      --status-error-text: #F87171;
      --status-error-border: rgba(239, 68, 68, 0.45);
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

    /* 大屏微细科技点阵网格 */
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

    /* 顶部导航与状态栏 - 大屏控制台 */
    .header {
      background: rgba(18, 33, 49, 0.92);
      backdrop-filter: blur(14px);
      border: 1px solid var(--border-color);
      border-top: 3px solid var(--tech-cyan);
      border-radius: 12px;
      padding: 16px 24px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      box-shadow: 0 4px 20px -2px rgba(0,0,0,0.35), 0 0 16px -4px rgba(56, 189, 248, 0.15);
    }
    .header-title h1 {
      font-size: 20px;
      font-weight: 800;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: 0.3px;
      text-shadow: 0 0 12px rgba(56, 189, 248, 0.35);
    }
    .header-title p {
      font-size: 13px;
      font-weight: 500;
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
      padding: 5px 12px;
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
      background: #1E293B;
      color: var(--text-secondary);
      border: 1px solid #334155;
    }

    /* ================= 大屏科技分页卡槽 (Tabs) ================= */
    .tabs-wrapper {
      margin-bottom: 20px;
      background: rgba(14, 26, 39, 0.85);
      backdrop-filter: blur(12px);
      padding: 6px;
      border-radius: 12px;
      border: 1px solid rgba(56, 189, 248, 0.25);
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
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

    /* 选项卡按钮：保持原高度、无上方小字、下方保留「▼ 正在查看」 */
    .tab-btn {
      background: rgba(22, 38, 56, 0.7);
      border: 1px solid rgba(56, 189, 248, 0.18);
      padding: 10px 16px;
      min-height: 56px;
      font-size: 14px;
      font-weight: 800;
      color: #94A3B8;
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
    }

    .tab-btn:hover {
      background: rgba(30, 52, 76, 0.9);
      border-color: rgba(56, 189, 248, 0.4);
      color: #38BDF8;
      transform: translateY(-1px);
    }

    /* 激活态：深邃青蓝渐变 + 发光外托 + 保留下方「▼ 正在查看」提示 */
    .tab-btn.active {
      background: linear-gradient(135deg, #0369A1 0%, #0F4871 100%);
      border-color: #38BDF8;
      color: #FFFFFF;
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.35), inset 0 1px 0 rgba(255,255,255,0.2);
      padding-bottom: 16px;
    }

    .tab-btn.active::after {
      content: "▼ 正在查看";
      position: absolute;
      bottom: 3px;
      font-size: 9px;
      font-weight: 700;
      color: #38BDF8;
      letter-spacing: 0.5px;
    }

    .view-content { display: none; }
    .view-content.active { display: block; animation: tabFadeIn 0.2s ease-out; }

    @keyframes tabFadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ================= 模块卡片 - 大屏立体暗青分层 ================= */
    .card {
      background: var(--bg-card);
      backdrop-filter: blur(14px);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 22px;
      box-shadow: 0 4px 18px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
      position: relative;
    }

    .card:hover {
      box-shadow: 0 6px 24px rgba(56, 189, 248, 0.12);
      border-color: rgba(56, 189, 248, 0.4);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      border-bottom: 1px solid rgba(56, 189, 248, 0.15);
      padding-bottom: 10px;
    }
    .card-title {
      font-size: 16px;
      font-weight: 800;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: 0.2px;
    }
    .card-tag {
      font-size: 11px;
      padding: 3px 9px;
      border-radius: 4px;
      font-weight: 700;
    }
    .tag-benomi { background: var(--benomi-bg); color: var(--benomi-accent); border: 1px solid var(--benomi-border); }
    .tag-nova { background: var(--nova-bg); color: var(--nova-accent); border: 1px solid var(--nova-border); }

    /* 网格布局 */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 18px;
    }
    @media (max-width: 960px) {
      .grid-2 { grid-template-columns: 1fr; }
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 18px;
    }
    @media (max-width: 1200px) {
      .grid-4 { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .grid-4 { grid-template-columns: 1fr; }
    }

    /* 科技数显指标盒 - 大屏数字发光 */
    .stat-box {
      background: linear-gradient(180deg, #152638 0%, #101F2F 100%);
      border: 1px solid rgba(56, 189, 248, 0.22);
      border-radius: 10px;
      padding: 14px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
      transition: all 0.2s ease;
    }
    .stat-box:hover {
      transform: translateY(-2px);
      border-color: #38BDF8;
      box-shadow: 0 4px 14px rgba(56, 189, 248, 0.2);
    }
    .stat-label { 
      font-size: 12px; 
      font-weight: 600; 
      color: #94A3B8; 
      margin-bottom: 5px; 
    }
    .stat-value { 
      font-size: 22px; 
      font-weight: 800; 
      color: #FFFFFF; 
      letter-spacing: -0.2px;
      text-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
    }
    .stat-desc { 
      font-size: 11px; 
      font-weight: 600; 
      color: #64748B; 
      margin-top: 5px; 
    }

    /* 明细列表 */
    .detail-list { display: flex; flex-direction: column; gap: 7px; }
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      padding: 7px 10px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px dashed rgba(56, 189, 248, 0.12);
      transition: background 0.15s ease;
    }
    .detail-item:last-child { border-bottom: none; }
    .detail-item:hover { background: rgba(56, 189, 248, 0.08); }
    .detail-title { color: #94A3B8; font-weight: 500; }
    .detail-value { font-weight: 700; color: #F1F5F9; text-align: right; }

    /* 表格与大屏表头 */
    .table-container {
      overflow-x: auto;
      border: 1px solid rgba(56, 189, 248, 0.22);
      border-radius: 8px;
      margin-top: 12px;
      background: #0E1B28;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }
    th {
      background: linear-gradient(180deg, #182C40 0%, #122232 100%);
      color: #38BDF8;
      font-weight: 700;
      padding: 11px 12px;
      border-bottom: 1.5px solid rgba(56, 189, 248, 0.35);
      white-space: nowrap;
      letter-spacing: 0.2px;
    }
    td {
      padding: 11px 12px;
      border-bottom: 1px solid rgba(56, 189, 248, 0.08);
      color: #CBD5E1;
      vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(56, 189, 248, 0.06); }

    /* 不合格整行标红硬约束（大屏暗红微光） */
    tr.row-fail td {
      color: #F87171 !important;
      background-color: rgba(239, 68, 68, 0.14) !important;
      font-weight: 700;
      border-bottom-color: rgba(239, 68, 68, 0.25);
    }

    .sheet-link-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin: 2px 4px 2px 0;
      padding: 4px 9px;
      background: rgba(56, 189, 248, 0.12);
      color: #38BDF8;
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: 4px;
      text-decoration: none;
      font-size: 11px;
      font-weight: 700;
      transition: all 0.2s ease;
    }
    .sheet-link-chip:hover {
      background: rgba(56, 189, 248, 0.22);
      border-color: #38BDF8;
      color: #FFFFFF;
      transform: translateY(-1px);
    }

    .alert-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 9px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.2px;
    }
    .alert-done { 
      background: var(--status-success-bg); 
      color: var(--status-success-text); 
      border: 1px solid var(--status-success-border); 
    }
    .alert-pending { 
      background: var(--status-warning-bg); 
      color: var(--status-warning-text); 
      border: 1px solid var(--status-warning-border); 
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
      padding: 2px 7px;
      background: #152638;
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 4px;
      color: #94A3B8;
      font-weight: 600;
    }
  </style>
`;

// 替换原 style 标签
const styleRegex = /<style>[\s\S]*?<\/style>/;
v2Code = v2Code.replace(styleRegex, techScreenCss.trim());

// 4. 替换 tabs 导航标签（无上方副标小字，保留下方「▼ 正在查看」）
const oldTabsHtml = `  <!-- 选项卡导航 -->
  <div class="tabs">
    <button class="tab-btn active" onclick="switchTab('overview')">总览</button>
    <button class="tab-btn" onclick="switchTab('benomi')">贝诺美专属</button>
    <button class="tab-btn" onclick="switchTab('nova')">诺瓦专属</button>
    <button class="tab-btn" onclick="switchTab('cron')">定时任务与表格</button>
  </div>`;

const newTabsHtml = `  <!-- 选项卡导航 (大屏科技风格) -->
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
