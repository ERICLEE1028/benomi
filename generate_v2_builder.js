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
  '<title>双平台定时任务监控与巡检看板 (浅蓝科技风预览版)</title>'
);

// 3. 科技风增强 CSS
const techCss = `
  <style>
    :root {
      /* 浅蓝科技调色盘 */
      --tech-bg: #EAF4FC;
      --tech-gradient: radial-gradient(circle at 12% 18%, #F2F8FE 0%, #E5F2FC 45%, #D7EBFB 100%);
      --tech-grid-color: rgba(2, 132, 199, 0.05);

      --bg-card: rgba(255, 255, 255, 0.90);
      --bg-subtle: #F0F7FD;
      --border-color: #BAE6FD;
      --border-glow: rgba(14, 165, 233, 0.3);

      --text-main: #0B2545;
      --text-secondary: #2C4A6F;
      --text-muted: #5F7E9F;

      --brand-blue: #0284C7;
      --brand-blue-accent: #2563EB;
      --brand-blue-soft: #E0F2FE;

      --benomi-accent: #0284C7;
      --benomi-bg: #E0F2FE;
      --nova-accent: #6366F1;
      --nova-bg: #EEF2FF;

      --status-success-bg: #ECFDF5;
      --status-success-text: #047857;
      --status-success-border: #6EE7B7;

      --status-warning-bg: #FEF3C7;
      --status-warning-text: #B45309;
      --status-warning-border: #FCD34D;

      --status-error-bg: #FEE2E2;
      --status-error-text: #B91C1C;
      --status-error-border: #FCA5A5;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      background: var(--tech-gradient);
      background-attachment: fixed;
      color: var(--text-main);
      padding: 18px 24px;
      line-height: 1.5;
      min-height: 100vh;
      position: relative;
    }

    /* 科技感背景网格微纹理 */
    body::before {
      content: "";
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: 
        linear-gradient(var(--tech-grid-color) 1px, transparent 1px),
        linear-gradient(90deg, var(--tech-grid-color) 1px, transparent 1px);
      background-size: 32px 32px;
      pointer-events: none;
      z-index: 0;
    }

    /* 全屏自适应容器：打破1280px硬限制，常规1080P/2K屏幕自动撑满并留有合适呼吸间距 */
    .container {
      width: 100%;
      max-width: 1920px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    /* 顶部导航与状态栏 - 科技控制台风格 */
    .header {
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(14px);
      border: 1px solid var(--border-color);
      border-top: 3.5px solid var(--brand-blue);
      border-radius: 14px;
      padding: 18px 24px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      box-shadow: 0 4px 20px -2px rgba(14, 165, 233, 0.08), 0 1px 3px rgba(0,0,0,0.03);
    }
    .header-title h1 {
      font-size: 21px;
      font-weight: 800;
      color: #0B2545;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: -0.2px;
    }
    .header-title p {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-top: 6px;
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
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
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

    /* ================= 极其醒目的科技分页导航卡槽 (Tab Console) ================= */
    .tabs-wrapper {
      margin-bottom: 22px;
      background: rgba(255, 255, 255, 0.72);
      backdrop-filter: blur(12px);
      padding: 6px;
      border-radius: 14px;
      border: 1.5px solid #BAE6FD;
      box-shadow: 0 4px 16px -2px rgba(14, 165, 233, 0.08);
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

    .tab-btn {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      padding: 12px 16px;
      min-height: 56px;
      font-size: 14px;
      font-weight: 800;
      color: #334155;
      cursor: pointer;
      border-radius: 10px;
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
      background: #EFF6FF;
      border-color: #93C5FD;
      color: #0284C7;
      transform: translateY(-1px);
    }

    /* 激活态：深邃科技蓝渐变 + 发光科技底托 + 下方保留「▼ 正在查看」提示 */
    .tab-btn.active {
      background: linear-gradient(135deg, #0284C7 0%, #2563EB 100%);
      border-color: #0284C7;
      color: #FFFFFF;
      box-shadow: 0 6px 18px -2px rgba(37, 99, 235, 0.42), 0 0 0 2px rgba(186, 230, 253, 0.5);
      padding-bottom: 18px; /* 为下方提示语预留对称间距，保持大字居中 */
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
    .view-content.active { display: block; animation: tabFadeIn 0.22s ease-out; }

    @keyframes tabFadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ================= 模块卡片 - 高对比立体分层 ================= */
    .card {
      background: var(--bg-card);
      backdrop-filter: blur(14px);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 22px;
      margin-bottom: 24px;
      box-shadow: 0 4px 18px -2px rgba(14, 165, 233, 0.08), 0 1px 3px rgba(0,0,0,0.02);
      transition: all 0.2s ease;
      position: relative;
    }

    .card:hover {
      box-shadow: 0 8px 28px -4px rgba(14, 165, 233, 0.15);
      border-color: #7DD3FC;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid #E0F2FE;
      padding-bottom: 12px;
    }
    .card-title {
      font-size: 16px;
      font-weight: 800;
      color: #0B2545;
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
      letter-spacing: 0.3px;
    }
    .tag-benomi { background: var(--benomi-bg); color: #0369A1; border: 1px solid #BAE6FD; }
    .tag-nova { background: var(--nova-bg); color: #4F46E5; border: 1px solid #C7D2FE; }

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
      background: linear-gradient(180deg, #F8FAFC 0%, #F0F7FD 100%);
      border: 1px solid #BAE6FD;
      border-radius: 12px;
      padding: 16px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.9);
      transition: all 0.2s ease;
    }
    .stat-box:hover {
      transform: translateY(-2px);
      border-color: #38BDF8;
      box-shadow: 0 6px 14px -2px rgba(14, 165, 233, 0.16);
    }
    .stat-label { 
      font-size: 12px; 
      font-weight: 600; 
      color: var(--text-secondary); 
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
      padding: 8px 10px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.6);
      border-bottom: 1px dashed #CBD5E1;
      transition: background 0.15s ease;
    }
    .detail-item:last-child { border-bottom: none; }
    .detail-item:hover { background: #F0F9FF; }
    .detail-title { color: var(--text-secondary); font-weight: 500; }
    .detail-value { font-weight: 700; color: #0B2545; text-align: right; }

    /* 表格与科技表头 */
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
      color: #1E3A8A;
      font-weight: 700;
      padding: 12px 14px;
      border-bottom: 1.5px solid #BAE6FD;
      white-space: nowrap;
      letter-spacing: 0.2px;
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #F1F5F9;
      color: #1E293B;
      vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #F0F9FF; }

    /* 不合格整行标红硬约束 */
    tr.row-fail td {
      color: #DC2626 !important;
      background-color: #FEF2F2 !important;
      font-weight: 600;
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
      border: 1px solid #93C5FD;
      border-radius: 6px;
      text-decoration: none;
      font-size: 11px;
      font-weight: 700;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(37,99,235,0.05);
    }
    .sheet-link-chip:hover {
      background: #DBEAFE;
      border-color: #3B82F6;
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
      background: #ECFDF5; 
      color: #047857; 
      border: 1px solid #6EE7B7; 
      box-shadow: 0 1px 2px rgba(4,120,87,0.08);
    }
    .alert-pending { 
      background: #FEF3C7; 
      color: #B45309; 
      border: 1px solid #FCD34D; 
      box-shadow: 0 1px 2px rgba(180,83,9,0.08);
    }
    .alert-normal { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
    .alert-danger { background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; }

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
v2Code = v2Code.replace(styleRegex, techCss.trim());

// 4. 替换 tabs 导航标签为高辨识度标签
const oldTabsHtml = `  <!-- 选项卡导航 -->
  <div class="tabs">
    <button class="tab-btn active" onclick="switchTab('overview')">总览</button>
    <button class="tab-btn" onclick="switchTab('benomi')">贝诺美专属</button>
    <button class="tab-btn" onclick="switchTab('nova')">诺瓦专属</button>
    <button class="tab-btn" onclick="switchTab('cron')">定时任务与表格</button>
  </div>`;

const newTabsHtml = `  <!-- 选项卡导航 (超醒目科技分页控制台) -->
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
