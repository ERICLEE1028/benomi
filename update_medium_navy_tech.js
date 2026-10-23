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
  '<title>双平台定时任务监控与巡检看板 (中度科技蓝大屏版)</title>'
);

// 3. 中度科技蓝配色方案 (Medium Navy Tech Blue)
// 既不泛白浅淡，也不死黑压抑；中度沉浸科技蓝底，搭配高亮纯白与荧光天蓝高对比文字，字字锐利如印刷
const mediumNavyCss = `
  <style>
    :root {
      /* 中度科技蓝核心调色板 */
      --tech-bg: #15263A;
      --tech-gradient: radial-gradient(circle at 15% 15%, #1C334E 0%, #15273C 50%, #0E1C2C 100%);
      --tech-grid-color: rgba(56, 189, 248, 0.08);

      --bg-card: rgba(21, 38, 59, 0.94);
      --bg-subtle: #192E46;
      --border-color: rgba(56, 189, 248, 0.35);
      --border-glow: rgba(56, 189, 248, 0.5);

      /* 高对比发光文字：纯白与高亮冰蓝，绝不看不清 */
      --text-main: #FFFFFF;
      --text-secondary: #CBD5E1;
      --text-muted: #94A3B8;

      --tech-cyan: #00F0FF;
      --tech-blue: #38BDF8;
      --tech-blue-accent: #0284C7;
      --tech-gold: #FBBF24;
      --tech-emerald: #34D399;

      /* 双店专属冷调科技标色 */
      --benomi-accent: #38BDF8;
      --benomi-bg: rgba(56, 189, 248, 0.16);
      --benomi-border: #38BDF8;

      --nova-accent: #C084FC;
      --nova-bg: rgba(192, 132, 252, 0.16);
      --nova-border: #C084FC;

      /* 状态色（高对比亮色） */
      --status-success-bg: rgba(16, 185, 129, 0.22);
      --status-success-text: #34D399;
      --status-success-border: #10B981;

      --status-warning-bg: rgba(245, 158, 11, 0.22);
      --status-warning-text: #FBBF24;
      --status-warning-border: #F59E0B;

      --status-error-bg: rgba(239, 68, 68, 0.25);
      --status-error-text: #FCA5A5;
      --status-error-border: #EF4444;
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

    /* 科技感大屏精密点阵网格微纹理 */
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

    /* 顶部导航与状态栏 - 科技控制台 */
    .header {
      background: rgba(21, 38, 59, 0.95);
      backdrop-filter: blur(14px);
      border: 1.5px solid var(--border-color);
      border-top: 3.5px solid var(--tech-cyan);
      border-radius: 12px;
      padding: 16px 24px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      box-shadow: 0 6px 24px -2px rgba(0,0,0,0.35), 0 0 16px -2px rgba(56, 189, 248, 0.2);
    }
    .header-title h1 {
      font-size: 20px;
      font-weight: 800;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: 0.3px;
      text-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
    }
    .header-title p {
      font-size: 13px;
      font-weight: 600;
      color: #94A3B8;
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
      background: #1E293B;
      color: #CBD5E1;
      border: 1px solid #334155;
    }

    /* ================= 中度科技蓝分页控制台 (Tabs) ================= */
    .tabs-wrapper {
      margin-bottom: 20px;
      background: rgba(15, 29, 46, 0.88);
      backdrop-filter: blur(12px);
      padding: 6px;
      border-radius: 12px;
      border: 1.5px solid rgba(56, 189, 248, 0.3);
      box-shadow: 0 4px 18px rgba(0,0,0,0.3);
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
      background: rgba(25, 45, 69, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.25);
      padding: 10px 16px;
      min-height: 56px;
      font-size: 15px;
      font-weight: 800;
      color: #CBD5E1;
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
      background: rgba(35, 63, 97, 0.95);
      border-color: #38BDF8;
      color: #38BDF8;
      transform: translateY(-1px);
    }

    /* 激活态：深邃青蓝渐变 + 纯白大字 + 荧光青蓝发光外托 + 下方「▼ 正在查看」提示 */
    .tab-btn.active {
      background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);
      border-color: #38BDF8;
      color: #FFFFFF;
      box-shadow: 0 0 18px rgba(56, 189, 248, 0.4), inset 0 1px 0 rgba(255,255,255,0.3);
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

    /* ================= 模块卡片 - 中度科技蓝立体分层 ================= */
    .card {
      background: var(--bg-card);
      backdrop-filter: blur(14px);
      border: 1.5px solid var(--border-color);
      border-radius: 12px;
      padding: 22px;
      margin-bottom: 22px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.28);
      transition: all 0.2s ease;
      position: relative;
    }

    .card:hover {
      box-shadow: 0 8px 28px rgba(56, 189, 248, 0.18);
      border-color: rgba(56, 189, 248, 0.6);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid rgba(56, 189, 248, 0.22);
      padding-bottom: 12px;
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
      padding: 3px 10px;
      border-radius: 4px;
      font-weight: 700;
    }
    .tag-benomi { background: var(--benomi-bg); color: #38BDF8; border: 1px solid var(--benomi-border); }
    .tag-nova { background: var(--nova-bg); color: #C084FC; border: 1px solid var(--nova-border); }

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

    /* 科技数显指标盒 - 中深蓝底 + 高亮发光数值 */
    .stat-box {
      background: linear-gradient(180deg, #1A314B 0%, #14263B 100%);
      border: 1.5px solid rgba(56, 189, 248, 0.3);
      border-radius: 10px;
      padding: 16px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
      transition: all 0.2s ease;
    }
    .stat-box:hover {
      transform: translateY(-2px);
      border-color: #38BDF8;
      box-shadow: 0 6px 18px rgba(56, 189, 248, 0.25);
    }
    .stat-label { 
      font-size: 12px; 
      font-weight: 700; 
      color: #94A3B8; 
      margin-bottom: 6px; 
    }
    .stat-value { 
      font-size: 22px; 
      font-weight: 800; 
      color: #FFFFFF; 
      letter-spacing: -0.2px;
      text-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
    }
    .stat-desc { 
      font-size: 11px; 
      font-weight: 600; 
      color: #94A3B8; 
      margin-top: 6px; 
    }

    /* 明细列表 - 文字高对比 */
    .detail-list { display: flex; flex-direction: column; gap: 8px; }
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      padding: 8px 12px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.04);
      border-bottom: 1px dashed rgba(56, 189, 248, 0.18);
      transition: background 0.15s ease;
    }
    .detail-item:last-child { border-bottom: none; }
    .detail-item:hover { background: rgba(56, 189, 248, 0.1); }
    .detail-title { color: #CBD5E1; font-weight: 600; }
    .detail-value { font-weight: 700; color: #FFFFFF; text-align: right; }

    /* 表格与大屏表头 - 高对比清晰数据 */
    .table-container {
      overflow-x: auto;
      border: 1.5px solid rgba(56, 189, 248, 0.3);
      border-radius: 10px;
      margin-top: 14px;
      background: #112033;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }
    th {
      background: linear-gradient(180deg, #1C3552 0%, #152940 100%);
      color: #38BDF8;
      font-weight: 800;
      padding: 12px 14px;
      border-bottom: 2px solid rgba(56, 189, 248, 0.4);
      white-space: nowrap;
      letter-spacing: 0.2px;
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid rgba(56, 189, 248, 0.12);
      color: #E2E8F0;
      vertical-align: middle;
      font-weight: 500;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(56, 189, 248, 0.08); }

    /* 不合格整行标红硬约束（高亮红字） */
    tr.row-fail td {
      color: #FCA5A5 !important;
      background-color: rgba(239, 68, 68, 0.2) !important;
      font-weight: 700;
      border-bottom-color: rgba(239, 68, 68, 0.35);
    }

    .sheet-link-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin: 2px 4px 2px 0;
      padding: 4px 10px;
      background: rgba(56, 189, 248, 0.16);
      color: #38BDF8;
      border: 1.5px solid rgba(56, 189, 248, 0.4);
      border-radius: 4px;
      text-decoration: none;
      font-size: 11px;
      font-weight: 700;
      transition: all 0.2s ease;
    }
    .sheet-link-chip:hover {
      background: rgba(56, 189, 248, 0.28);
      border-color: #38BDF8;
      color: #FFFFFF;
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
      padding: 3px 8px;
      background: #182C44;
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 4px;
      color: #CBD5E1;
      font-weight: 600;
    }
  </style>
`;

// 替换原 style 标签
const styleRegex = /<style>[\s\S]*?<\/style>/;
v2Code = v2Code.replace(styleRegex, mediumNavyCss.trim());

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

// 写入脚本并输出
fs.writeFileSync(path.join(__dirname, 'build_dashboard_tech_v2.js'), v2Code, 'utf8');
console.log('build_dashboard_tech_v2.js 生成成功！');
