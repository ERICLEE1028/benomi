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
  '<title>双平台定时任务监控与巡检看板 (金属颗粒泛光质感版)</title>'
);

// 3. 高级金属反光 + 金属细腻磨砂颗粒 CSS
// 核心技术：
// - 135°金属各向异性光束反光带（Metallic Specular Sheen）
// - 顶部中心金属聚光晕（Ambient Top Bloom）
// - SVG 微米级真实阳极氧化磨砂金属噪点微颗粒（Anodized Metal Grain）
const metallicReflectCss = `
  <style>
    :root {
      /* 中度金属科技蓝基调 */
      --metal-base-1: #82A4C6;
      --metal-base-2: #A2C3E2;
      --metal-base-3: #6B90B5;
      --metal-base-4: #91B5D8;
      --metal-base-5: #5F85AC;

      --bg-header: rgba(240, 247, 255, 0.94);
      --bg-card: rgba(244, 249, 255, 0.94);
      --bg-subtle: #FFFFFF;
      --border-color: #38BDF8;
      --border-accent: #0284C7;
      
      /* 金属立体边缘与高光阴影 */
      --card-shadow: 0 8px 24px -2px rgba(15, 35, 60, 0.2), inset 0 1.5px 0 rgba(255, 255, 255, 0.95);

      /* 高清晰深墨蓝文字，字字锐利如印刷 */
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

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      /* 复合金属光泽折射渐变背景（多重金属高光折射带） */
      background-color: #7B9EBF;
      background-image:
        /* 顶部聚光泛光 */
        radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255, 255, 255, 0.5) 0%, transparent 70%),
        /* 右侧冷光环境泛光 */
        radial-gradient(circle at 85% 25%, rgba(224, 242, 254, 0.4) 0%, transparent 50%),
        /* 135° 金属对角强折射高光束带 (Specular Reflection Beam) */
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.35) 0%, 
          rgba(255, 255, 255, 0.08) 18%, 
          transparent 35%, 
          rgba(255, 255, 255, 0.28) 52%, 
          rgba(255, 255, 255, 0.05) 65%, 
          transparent 80%, 
          rgba(255, 255, 255, 0.2) 100%
        ),
        /* 金属本体中度蓝质感底 */
        linear-gradient(135deg, var(--metal-base-1) 0%, var(--metal-base-2) 25%, var(--metal-base-3) 50%, var(--metal-base-4) 75%, var(--metal-base-5) 100%);
      background-attachment: fixed;
      color: var(--text-main);
      padding: 16px 24px;
      line-height: 1.5;
      min-height: 100vh;
      position: relative;
    }

    /* 真实微米级磨砂金属颗粒质感纹理层（无网格，纯阳极氧化金属细腻磨砂粒子） */
    body::before {
      content: "";
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      /* 内嵌高精密度微粒噪点，呈现细腻的高端磨砂金属颗粒 */
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.12 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      opacity: 0.85;
      pointer-events: none;
      z-index: 0;
      mix-blend-mode: overlay;
    }

    .container {
      width: 100%;
      max-width: 1920px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    /* 顶部导航与状态栏 - 精密金属控制台 */
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
      box-shadow: var(--card-shadow), 0 4px 16px -2px rgba(15, 35, 60, 0.15);
      position: relative;
      overflow: hidden;
    }

    /* 顶部金属流光微反光 */
    .header::after {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; height: 1.5px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent);
      pointer-events: none;
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

    /* ================= 金属质感分页卡槽 (Tabs) ================= */
    .tabs-wrapper {
      margin-bottom: 20px;
      background: rgba(235, 244, 255, 0.9);
      backdrop-filter: blur(12px);
      padding: 6px;
      border-radius: 12px;
      border: 1.5px solid var(--border-color);
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.08), 0 4px 14px -2px rgba(15, 35, 60, 0.12);
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
      box-shadow: 0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9);
    }

    .tab-btn:hover {
      background: #EFF6FF;
      border-color: #0284C7;
      color: #0284C7;
      transform: translateY(-1px);
    }

    /* 激活态：金属渐变 + 纯白大字 + 顶部流光高亮 + 下方保留「▼ 正在查看」提示 */
    .tab-btn.active {
      background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);
      border-color: #0284C7;
      color: #FFFFFF;
      box-shadow: 0 6px 18px -2px rgba(2, 132, 199, 0.42), inset 0 1.5px 0 rgba(255, 255, 255, 0.4);
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

    /* ================= 模块卡片 - 精密金属面板 ================= */
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
      box-shadow: 0 12px 30px -2px rgba(15, 35, 60, 0.25), inset 0 1.5px 0 rgba(255, 255, 255, 1);
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

    /* 科技数显指标盒 - 金属倒角小面板 */
    .stat-box {
      background: var(--bg-subtle);
      border: 1.5px solid var(--border-color);
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(15, 35, 60, 0.06), inset 0 1px 0 rgba(255,255,255,0.9);
      transition: all 0.2s ease;
    }
    .stat-box:hover {
      transform: translateY(-2px);
      border-color: #0284C7;
      box-shadow: 0 6px 18px rgba(2, 132, 199, 0.2);
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

    /* 表格与金属表头 */
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
v2Code = v2Code.replace(styleRegex, metallicReflectCss.trim());

// 4. 替换 tabs 导航标签（无上方副标小字，保留下方「▼ 正在查看」）
const oldTabsHtml = `  <!-- 选项卡导航 -->
  <div class="tabs">
    <button class="tab-btn active" onclick="switchTab('overview')">总览</button>
    <button class="tab-btn" onclick="switchTab('benomi')">贝诺美专属</button>
    <button class="tab-btn" onclick="switchTab('nova')">诺瓦专属</button>
    <button class="tab-btn" onclick="switchTab('cron')">定时任务与表格</button>
  </div>`;

const newTabsHtml = `  <!-- 选项卡导航 (金属控制台) -->
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
console.log('build_dashboard_tech_v2.js (金属反光+颗粒质感版) 生成成功！');
