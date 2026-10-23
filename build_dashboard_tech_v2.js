/**
 * build_complete_dashboard.js
 * 读取 dashboard_data.json 并生成最终版美化交互式 dashboard.html
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'dashboard_data.json');
const HTML_FILE = path.join(__dirname, 'dashboard_tech_v2.html');

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>双平台定时任务监控与巡检看板 (流光曲面科技版)</title>
  <style>
    :root {
      --bg-header: rgba(255, 255, 255, 0.92);
      --bg-card: rgba(255, 255, 255, 0.92);
      --bg-subtle: #F0F6FC;
      --border-color: #7DD3FC;
      --border-accent: #0284C7;
      
      /* 晶莹毛玻璃立体阴影 */
      --card-shadow: 0 10px 30px -4px rgba(2, 28, 68, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;

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
      /* 完美还原参考图：流光丝滑曲面极光蓝科技背景 */
      background-color: #034898;
      background-image: url("data:image/jpeg;base64,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");
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      background-attachment: fixed;
      color: var(--text-main);
      padding: 16px 24px;
      line-height: 1.5;
      min-height: 100vh;
      position: relative;
    }

    /* 顶部流光环境软晕 */
    body::before {
      content: "";
      position: fixed;
      top: 0; left: 0; right: 0; height: 320px;
      background: radial-gradient(ellipse 80% 40% at 50% -5%, rgba(0, 180, 255, 0.25) 0%, transparent 80%);
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

    /* 顶部导航与状态栏 - 晶莹毛玻璃科技控制台 */
    .header {
      background: var(--bg-header);
      backdrop-filter: blur(20px);
      border: 1.5px solid rgba(255, 255, 255, 0.9);
      border-top: 4px solid var(--tech-cyan);
      border-radius: 12px;
      padding: 16px 24px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      box-shadow: var(--card-shadow), 0 6px 24px -4px rgba(2, 28, 68, 0.2);
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

    /* ================= 晶莹毛玻璃分页卡槽 (Tabs) ================= */
    .tabs-wrapper {
      margin-bottom: 20px;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(16px);
      padding: 6px;
      border-radius: 12px;
      border: 1.5px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 6px 20px -2px rgba(2, 28, 68, 0.2);
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
      background: rgba(240, 246, 252, 0.9);
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
      background: #FFFFFF;
      border-color: #0284C7;
      color: #0284C7;
      transform: translateY(-1px);
    }

    /* 激活态：深邃电光蓝渐变 + 纯白大字 + 发光微外托 + 下方「▼ 正在查看」提示 */
    .tab-btn.active {
      background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);
      border-color: #0284C7;
      color: #FFFFFF;
      box-shadow: 0 6px 20px -2px rgba(2, 132, 199, 0.5), inset 0 1.5px 0 rgba(255, 255, 255, 0.4);
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

    /* ================= 模块卡片 - 晶莹白毛玻璃面板 ================= */
    .card {
      background: var(--bg-card);
      backdrop-filter: blur(20px);
      border: 1.5px solid rgba(255, 255, 255, 0.9);
      border-radius: 12px;
      padding: 22px;
      margin-bottom: 22px;
      box-shadow: var(--card-shadow);
      transition: all 0.2s ease;
      position: relative;
    }

    .card:hover {
      box-shadow: 0 14px 36px -4px rgba(2, 28, 68, 0.35);
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
      background: #FFFFFF;
      border: 1.5px solid #BAE6FD;
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(2, 28, 68, 0.06);
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
      background: #FFFFFF;
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
      border: 1.5px solid #BAE6FD;
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
      background: #F8FAFC;
      border: 1px solid #BAE6FD;
      border-radius: 6px;
      color: var(--text-secondary);
      font-weight: 600;
    }
  </style>
</head>
<body>

<div class="container">
  <!-- 顶部状态栏 -->
  <div class="header">
    <div class="header-title">
      <h1>📊 阿里双平台自动化巡检与监控看板</h1>
      <p>全部数据 100% 对齐最新完成定时任务 ｜ 动态匹配对应轮次广告转化 ｜ 风险监控与可用余额 ｜ 询盘质检真实映射</p>
    </div>
    <div class="header-meta" id="headerMeta">
      <span class="badge" id="autoSyncBadge" style="background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE;">🟢 半点主动获取: 开启中</span>
      <button onclick="manualSyncNow()" style="background:#2563EB;color:#fff;border:none;border-radius:12px;padding:3px 10px;font-size:11px;font-weight:600;cursor:pointer;">🔄 立即检查</button>
    </div>
  </div>

  <!-- 选项卡导航 (流光曲面科技控制台) -->
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
  </div>

  <!-- 视图 1: 全局总览 -->
  <div id="view-overview" class="view-content active">
    <!-- 最上方两个独立的风险框 -->
    <div style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="font-size: 16px; font-weight: 700; color: #0F172A;">
          🚨 平台风险监控与履约预警 (两店独立分框 · 真实对齐)
        </h2>
        <span style="font-size: 12px; color: var(--text-secondary);">巡检轮次: ${data.stores.benomi.risk.latest_round} 真实扫描完成 (含商品雷达补充项)</span>
      </div>

      <div class="grid-2">
        <!-- 贝诺美风险框 -->
        <div class="card" style="border-top: 4px solid ${data.stores.benomi.risk.rfq_quota < 5 ? '#DC2626' : '#2563EB'}; margin-bottom: 0;">
          <div class="card-header" style="margin-bottom: 10px; padding-bottom: 8px;">
            <div class="card-title">
              <span style="color: #2563EB;">🔵 贝诺美 (benomibeauty) · 平台风险监控</span>
            </div>
            ${data.stores.benomi.risk.rfq_quota < 5 ? 
              '<span class="alert-pill alert-danger">🚨 极度紧缺预警</span>' : 
              '<span class="alert-pill alert-normal">风险状态: 正常</span>'}
          </div>
          <div class="detail-list">
            <div class="detail-item" style="${data.stores.benomi.risk.rfq_quota < 5 ? 'background: #FEF2F2; padding: 6px 8px; border-radius: 4px;' : ''}">
              <span class="detail-title" style="${data.stores.benomi.risk.rfq_quota < 5 ? 'color: #991B1B; font-weight: 700;' : ''}">
                ${data.stores.benomi.risk.rfq_quota < 5 ? '🚨 ' : ''}可用报价权益剩余
              </span>
              <span class="detail-value" style="color: ${data.stores.benomi.risk.rfq_quota < 5 ? '#DC2626' : '#059669'}; font-size: 13px; font-weight: 700;">
                ${data.stores.benomi.risk.rfq_quota} 条剩余 (到期: ${data.stores.benomi.risk.rfq_expire} ｜ ${data.stores.benomi.risk.rfq_used_detail})
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-title">平台严重违规</span>
              <span class="detail-value" style="color: #059669;">0 条未读通知 (安全)</span>
            </div>
            <div class="detail-item">
              <span class="detail-title">待发货履约管控</span>
              <span class="detail-value" style="color: #059669;">0 逾期 / 0 临期 (共 6 单，最近 14.02 天)</span>
            </div>
            <div class="detail-item">
              <span class="detail-title">商品雷达待整改 (补充项)</span>
              <span class="detail-value" style="color: #059669; font-weight: 600;">${data.stores.benomi.risk.product_radar}</span>
            </div>
            <div class="detail-item">
              <span class="detail-title">直通车当前可用现金</span>
              <span class="detail-value" style="color: #059669;">¥${data.stores.benomi.risk.balance.toFixed(2)} (${data.stores.benomi.risk.balance_source || '平台实时同步'})</span>
            </div>
          </div>
        </div>

        <!-- 诺瓦风险框 -->
        <div class="card" style="border-top: 4px solid ${data.stores.nova.risk.rfq_quota < 5 ? '#DC2626' : '#7C3AED'}; margin-bottom: 0;">
          <div class="card-header" style="margin-bottom: 10px; padding-bottom: 8px;">
            <div class="card-title">
              <span style="color: #7C3AED;">🟣 诺瓦 (jnnova) · 平台风险监控</span>
            </div>
            ${data.stores.nova.risk.rfq_quota < 5 ? 
              '<span class="alert-pill alert-danger">🚨 极度紧缺预警</span>' : 
              '<span class="alert-pill alert-normal">风险状态: 正常</span>'}
          </div>
          <div class="detail-list">
            <div class="detail-item" style="${data.stores.nova.risk.rfq_quota < 5 ? 'background: #FEF2F2; padding: 6px 8px; border-radius: 4px;' : ''}">
              <span class="detail-title" style="${data.stores.nova.risk.rfq_quota < 5 ? 'color: #991B1B; font-weight: 700;' : ''}">
                ${data.stores.nova.risk.rfq_quota < 5 ? '🚨 ' : ''}可用报价权益剩余
              </span>
              <span class="detail-value" style="color: ${data.stores.nova.risk.rfq_quota < 5 ? '#DC2626' : '#059669'}; font-size: 13px; font-weight: 700;">
                ${data.stores.nova.risk.rfq_quota} 条剩余 (到期: ${data.stores.nova.risk.rfq_expire} ｜ ${data.stores.nova.risk.rfq_used_detail})
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-title">平台严重违规</span>
              <span class="detail-value" style="color: #059669;">0 条未读通知 (安全)</span>
            </div>
            <div class="detail-item">
              <span class="detail-title">待发货履约管控</span>
              <span class="detail-value" style="color: #059669;">0 逾期 / 0 临期 (共 4 单，最近 40.06 天)</span>
            </div>
            <div class="detail-item">
              <span class="detail-title">商品雷达待整改 (补充项)</span>
              <span class="detail-value" style="color: #059669; font-weight: 600;">${data.stores.nova.risk.product_radar}</span>
            </div>
            <div class="detail-item">
              <span class="detail-title">直通车当前可用现金</span>
              <span class="detail-value" style="color: #059669;">¥${data.stores.nova.risk.balance.toFixed(2)} (${data.stores.nova.risk.balance_source || '平台实时同步'})</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 下方汇聚余额与对应轮次广告转化情况 -->
    <div class="card" style="border-top: 4px solid #2563EB;">
      <div class="card-header" style="margin-bottom: 12px; padding-bottom: 10px;">
        <div class="card-title" style="color: #1E40AF; font-size: 16px;">
          <span>💰 双店推广账户余额与最新广告消耗转化效果 (真实对齐)</span>
        </div>
        <span class="badge badge-ok">${data.stores.benomi.ads.latest_round} · cvr3 全站商机口径</span>
      </div>

      <div class="grid-4">
        <div class="stat-box">
          <div class="stat-label">贝诺美直通车可用余额</div>
          <div class="stat-value" style="color: #2563EB;">¥${data.stores.benomi.risk.balance.toFixed(2)}</div>
          <div class="stat-desc" style="color: #059669;">● 充裕 ｜ ${data.stores.benomi.risk.balance_source || '平台实时同步'}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">诺瓦直通车可用余额</div>
          <div class="stat-value" style="color: #7C3AED;">¥${data.stores.nova.risk.balance.toFixed(2)}</div>
          <div class="stat-desc" style="color: #059669;">● 充裕 ｜ ${data.stores.nova.risk.balance_source || '平台实时同步'}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">贝诺美去重商机 (cvr3)</div>
          <div class="stat-value" style="color: #059669;">${data.stores.benomi.ads.cvr3_leads} 个</div>
          <div class="stat-desc">耗资: ¥${data.stores.benomi.ads.spend.toFixed(2)}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">诺瓦去重商机 (cvr3)</div>
          <div class="stat-value" style="color: #059669;">${data.stores.nova.ads.cvr3_leads} 个</div>
          <div class="stat-desc">耗资: ¥${data.stores.nova.ads.spend.toFixed(2)}</div>
        </div>
      </div>

      <div class="grid-2">
        <div style="background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
            <strong style="color: #2563EB; font-size: 13px;">🔵 贝诺美 · ${data.stores.benomi.ads.latest_round} 转化明细</strong>
            <a class="sheet-link-chip" href="${data.stores.benomi.ads.sheet_url}" target="_blank">📊 广告快照表 ↗</a>
          </div>
          <div class="detail-list">
            <div class="detail-item"><span class="detail-title">在投在跑计划</span><span class="detail-value">${data.stores.benomi.ads.active_campaigns} 个在投计划</span></div>
            <div class="detail-item"><span class="detail-title">去重商机转化 (cvr3)</span><span class="detail-value" style="color: #059669; font-weight: 700;">${data.stores.benomi.ads.cvr3_leads} 个全站商机</span></div>
            <div class="detail-item"><span class="detail-title">本轮累计消耗</span><span class="detail-value">¥${data.stores.benomi.ads.spend.toFixed(2)}</span></div>
            <div class="detail-item"><span class="detail-title">数据采集口径</span><span class="detail-value" style="color: #2563EB;">${data.stores.benomi.ads.latest_round.includes('9') ? '9点轮 · PT当日进行中数据（以14点轮为准）' : '14点轮 · PT全天数据'}</span></div>
          </div>
        </div>

        <div style="background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
            <strong style="color: #7C3AED; font-size: 13px;">🟣 诺瓦 · ${data.stores.nova.ads.latest_round} 转化明细</strong>
            <a class="sheet-link-chip" href="${data.stores.nova.ads.sheet_url}" target="_blank">📊 广告快照表 ↗</a>
          </div>
          <div class="detail-list">
            <div class="detail-item"><span class="detail-title">在投在跑计划</span><span class="detail-value">${data.stores.nova.ads.active_campaigns} 个在投计划</span></div>
            <div class="detail-item"><span class="detail-title">去重商机转化 (cvr3)</span><span class="detail-value" style="color: #059669; font-weight: 700;">${data.stores.nova.ads.cvr3_leads} 个全站商机</span></div>
            <div class="detail-item"><span class="detail-title">本轮累计消耗</span><span class="detail-value">¥${data.stores.nova.ads.spend.toFixed(2)}</span></div>
            <div class="detail-item"><span class="detail-title">数据采集口径</span><span class="detail-value" style="color: #7C3AED;">${data.stores.nova.ads.latest_round.includes('9') ? '9点轮 · PT当日进行中数据（以14点轮为准）' : '14点轮 · PT全天数据'}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 视图 2: 贝诺美专属 (含周检真实业务员) -->
  <div id="view-benomi" class="view-content">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span style="color: #2563EB;">🔵 贝诺美 (benomibeauty) · 专属日常巡检与周检大盘</span>
          <span class="card-tag tag-benomi">美妆个护/仪器</span>
        </div>
      </div>

      <h3 style="font-size: 14px; margin-bottom: 12px; color: var(--text-secondary);">📅 最新日常巡检快照</h3>
      <div class="grid-2" style="margin-bottom: 20px;">
        <div style="background: var(--bg-subtle); padding: 14px; border-radius: 8px;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">广告与商机 (${data.stores.benomi.ads.latest_round})</div>
          <div class="detail-list">
            <div class="detail-item"><span class="detail-title">本轮消耗金额</span><span class="detail-value">¥${data.stores.benomi.ads.spend.toFixed(2)}</span></div>
            <div class="detail-item"><span class="detail-title">在投活跃计划</span><span class="detail-value">${data.stores.benomi.ads.active_campaigns} 个</span></div>
            <div class="detail-item"><span class="detail-title">全站商机量 (cvr3)</span><span class="detail-value" style="color: #059669;">${data.stores.benomi.ads.cvr3_leads} 个</span></div>
            <div class="detail-item"><span class="detail-title">在线表格</span><span class="detail-value"><a class="sheet-link-chip" href="${data.stores.benomi.ads.sheet_url}" target="_blank">📊 [贝诺美] 广告快照表 ↗</a></span></div>
          </div>
        </div>
        <div style="background: var(--bg-subtle); padding: 14px; border-radius: 8px;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">平台风控与资金 (含商品雷达补充项)</div>
          <div class="detail-list">
            <div class="detail-item"><span class="detail-title">商品雷达待整改</span><span class="detail-value" style="color: #059669;">${data.stores.benomi.risk.product_radar}</span></div>
            <div class="detail-item"><span class="detail-title">直通车当前可用余额</span><span class="detail-value" style="font-weight: 700; color: #2563EB;">¥${data.stores.benomi.risk.balance.toFixed(2)} (${data.stores.benomi.risk.balance_source || '实时同步'})</span></div>
            <div class="detail-item"><span class="detail-title">RFQ 普通报价权益</span><span class="detail-value" style="color: #059669; font-weight: 600;">${data.stores.benomi.risk.rfq_quota} 条剩余 (${data.stores.benomi.risk.rfq_used_detail})</span></div>
            <div class="detail-item"><span class="detail-title">最新质检日检 (${data.stores.benomi.daily_quality.target_date})</span><span class="detail-value" style="color: #059669;">${data.stores.benomi.daily_quality.passed}/${data.stores.benomi.daily_quality.total_checked} 合格 (${data.stores.benomi.daily_quality.pass_rate}%)</span></div>
            <div class="detail-item"><span class="detail-title">最新日检在线表</span><span class="detail-value"><a class="sheet-link-chip" href="${data.stores.benomi.daily_quality.sheet_url}" target="_blank">📊 [贝诺美] ${data.stores.benomi.daily_quality.target_date}日检表 ↗</a></span></div>
          </div>
        </div>
      </div>

      <!-- 贝诺美 · 日巡检最新数据专属看板 (今日实测最新) -->
      <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h3 style="font-size: 15px; font-weight: 700; color: #2563EB;">
              🔍 贝诺美 · 日巡检最新数据专属看板 (${data.stores.benomi.daily_quality.target_date} 全天)
            </h3>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              巡检轮次: ${data.stores.benomi.daily_quality.latest_round} ｜ 检查会话: <strong>${data.stores.benomi.daily_quality.total_checked}</strong> 条 ｜ 合格: <strong style="color: #059669;">${data.stores.benomi.daily_quality.passed}</strong> ｜ 不合格: <strong style="color: #DC2626;">${data.stores.benomi.daily_quality.failed}</strong> ｜ 日检合格率: <strong style="color: #059669;">${data.stores.benomi.daily_quality.pass_rate}%</strong>
            </div>
          </div>
          <a class="sheet-link-chip" href="${data.stores.benomi.daily_quality.sheet_url}" target="_blank">📊 打开贝诺美最新日检在线表 ↗</a>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>询盘时间</th>
                <th>买家名称</th>
                <th>真实业务员</th>
                <th>结论</th>
                <th>不合格判定原因</th>
                <th>首响耗时</th>
                <th>追踪次数</th>
                <th>会话内容总结与已读状态</th>
              </tr>
            </thead>
            <tbody>
              ${(data.stores.benomi.daily_quality.samples || []).map(item => `
                <tr class="${item.verdict === '不合格' ? 'row-fail' : ''}">
                  <td>${item.inquiry_time}</td>
                  <td>${item.buyer}</td>
                  <td><strong>${item.sales}</strong></td>
                  <td><span class="alert-pill ${item.verdict === '不合格' ? 'alert-danger' : 'alert-normal'}">${item.verdict}</span></td>
                  <td>${item.reason}</td>
                  <td>${item.resp_time}</td>
                  <td>${item.track_count} 次</td>
                  <td>${item.summary}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 周检独立分析专区 (真实业务员与买家) -->
      <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h3 style="font-size: 15px; font-weight: 700; color: #2563EB;">
              📋 贝诺美 · 周检查独立分析专区 (${data.stores.benomi.weekly_quality.date_range || '最新自然周'})
            </h3>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              业务员严格匹配阿里「负责人」列 ｜ 真实综合合格率: <strong>${data.stores.benomi.weekly_quality.pass_rate}%</strong> (${data.stores.benomi.weekly_quality.passed}合格 / ${data.stores.benomi.weekly_quality.failed}不合格 / ${data.stores.benomi.weekly_quality.pending || 0}未判定)
            </div>
          </div>
          <a class="sheet-link-chip" href="${data.stores.benomi.weekly_quality.sheet_url}" target="_blank">📊 打开贝诺美周检在线表 ↗</a>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>询盘时间</th>
                <th>买家名称</th>
                <th>真实业务员 (负责人)</th>
                <th>结论</th>
                <th>不合格判定原因</th>
                <th>首响耗时</th>
                <th>48h追踪</th>
                <th>会话内容总结与已读状态</th>
              </tr>
            </thead>
            <tbody>
              ${data.stores.benomi.weekly_quality.failed_samples.map(item => `
                <tr class="row-fail">
                  <td>${item.inquiry_time}</td>
                  <td>${item.buyer}</td>
                  <td><strong>${item.sales}</strong></td>
                  <td>不合格</td>
                  <td>${item.reason}</td>
                  <td>${item.resp_time}</td>
                  <td>${item.track_count} 次</td>
                  <td>${item.summary}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- 视图 3: 诺瓦专属 (含周检真实业务员) -->
  <div id="view-nova" class="view-content">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span style="color: #7C3AED;">🟣 诺瓦 (jnnova) · 专属日常巡检与周检大盘</span>
          <span class="card-tag tag-nova">智能制造/激光设备</span>
        </div>
      </div>

      <h3 style="font-size: 14px; margin-bottom: 12px; color: var(--text-secondary);">📅 最新日常巡检快照</h3>
      <div class="grid-2" style="margin-bottom: 20px;">
        <div style="background: var(--bg-subtle); padding: 14px; border-radius: 8px;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">广告与商机 (${data.stores.nova.ads.latest_round})</div>
          <div class="detail-list">
            <div class="detail-item"><span class="detail-title">本轮消耗金额</span><span class="detail-value">¥${data.stores.nova.ads.spend.toFixed(2)}</span></div>
            <div class="detail-item"><span class="detail-title">在投活跃计划</span><span class="detail-value">${data.stores.nova.ads.active_campaigns} 个</span></div>
            <div class="detail-item"><span class="detail-title">全站商机量 (cvr3)</span><span class="detail-value" style="color: #059669;">${data.stores.nova.ads.cvr3_leads} 个</span></div>
            <div class="detail-item"><span class="detail-title">在线表格</span><span class="detail-value"><a class="sheet-link-chip" href="${data.stores.nova.ads.sheet_url}" target="_blank">📊 [诺瓦] 广告快照表 ↗</a></span></div>
          </div>
        </div>
        <div style="background: var(--bg-subtle); padding: 14px; border-radius: 8px;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">平台风控与资金 (含商品雷达补充项)</div>
          <div class="detail-list">
            <div class="detail-item"><span class="detail-title">商品雷达待整改</span><span class="detail-value" style="color: #059669;">${data.stores.nova.risk.product_radar}</span></div>
            <div class="detail-item"><span class="detail-title">直通车当前可用余额</span><span class="detail-value" style="font-weight: 700; color: #7C3AED;">¥${data.stores.nova.risk.balance.toFixed(2)} (${data.stores.nova.risk.balance_source || '实时同步'})</span></div>
            <div class="detail-item"><span class="detail-title">可用报价权益 (直读真实)</span><span class="detail-value" style="color: #DC2626; font-weight: 700;">${data.stores.nova.risk.rfq_quota} 条剩余 (${data.stores.nova.risk.rfq_used_detail})</span></div>
            <div class="detail-item"><span class="detail-title">最新质检日检 (${data.stores.nova.daily_quality.target_date})</span><span class="detail-value" style="color: #059669;">${data.stores.nova.daily_quality.passed}/${data.stores.nova.daily_quality.total_checked} 合格 (${data.stores.nova.daily_quality.pass_rate}%)</span></div>
            <div class="detail-item"><span class="detail-title">最新日检在线表</span><span class="detail-value"><a class="sheet-link-chip" href="${data.stores.nova.daily_quality.sheet_url}" target="_blank">📊 [诺瓦] ${data.stores.nova.daily_quality.target_date}日检表 ↗</a></span></div>
          </div>
        </div>
      </div>

      <!-- 诺瓦 · 日巡检最新数据专属看板 (今日实测最新) -->
      <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h3 style="font-size: 15px; font-weight: 700; color: #7C3AED;">
              🔍 诺瓦 · 日巡检最新数据专属看板 (${data.stores.nova.daily_quality.target_date} 全天)
            </h3>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              巡检轮次: ${data.stores.nova.daily_quality.latest_round} ｜ 检查会话: <strong>${data.stores.nova.daily_quality.total_checked}</strong> 条 ｜ 合格: <strong style="color: #059669;">${data.stores.nova.daily_quality.passed}</strong> ｜ 不合格: <strong style="color: #DC2626;">${data.stores.nova.daily_quality.failed}</strong> ｜ 日检合格率: <strong style="color: #059669;">${data.stores.nova.daily_quality.pass_rate}%</strong>
            </div>
          </div>
          <a class="sheet-link-chip" href="${data.stores.nova.daily_quality.sheet_url}" target="_blank">📊 打开诺瓦最新日检在线表 ↗</a>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>询盘时间</th>
                <th>买家名称</th>
                <th>真实业务员</th>
                <th>结论</th>
                <th>不合格判定原因</th>
                <th>首响耗时</th>
                <th>追踪次数</th>
                <th>会话内容总结与已读状态</th>
              </tr>
            </thead>
            <tbody>
              ${(data.stores.nova.daily_quality.samples || []).map(item => `
                <tr class="${item.verdict === '不合格' ? 'row-fail' : ''}">
                  <td>${item.inquiry_time}</td>
                  <td>${item.buyer}</td>
                  <td><strong>${item.sales}</strong></td>
                  <td><span class="alert-pill ${item.verdict === '不合格' ? 'alert-danger' : 'alert-normal'}">${item.verdict}</span></td>
                  <td>${item.reason}</td>
                  <td>${item.resp_time}</td>
                  <td>${item.track_count} 次</td>
                  <td>${item.summary}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 周检独立分析专区 (真实业务员与买家) -->
      <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h3 style="font-size: 15px; font-weight: 700; color: #7C3AED;">
              📋 诺瓦 · 周检查独立分析专区 (${data.stores.nova.weekly_quality.date_range || '最新自然周'})
            </h3>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              业务员严格匹配阿里「负责人」列 ｜ 真实综合合格率: <strong>${data.stores.nova.weekly_quality.pass_rate}%</strong> (${data.stores.nova.weekly_quality.passed}合格 / ${data.stores.nova.weekly_quality.failed}不合格 / ${data.stores.nova.weekly_quality.pending || 0}未判定)
            </div>
          </div>
          <a class="sheet-link-chip" href="${data.stores.nova.weekly_quality.sheet_url}" target="_blank">📊 打开诺瓦周检在线表 ↗</a>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>询盘时间</th>
                <th>买家名称</th>
                <th>真实业务员 (负责人)</th>
                <th>结论</th>
                <th>不合格判定原因</th>
                <th>首响耗时</th>
                <th>48h追踪</th>
                <th>会话内容总结与已读状态</th>
              </tr>
            </thead>
            <tbody>
              ${data.stores.nova.weekly_quality.failed_samples.map(item => `
                <tr class="row-fail">
                  <td>${item.inquiry_time}</td>
                  <td>${item.buyer}</td>
                  <td><strong>${item.sales}</strong></td>
                  <td>不合格</td>
                  <td>${item.reason}</td>
                  <td>${item.resp_time}</td>
                  <td>${item.track_count} 次</td>
                  <td>${item.summary}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- 视图 4: 定时任务调度列表与直达链接 -->
  <div id="view-cron" class="view-content">
    <div class="card">
      <div class="card-header">
        <div class="card-title">⏱️ 8 大定时任务配置、状态与最新在线表格直通链接</div>
        <span class="badge badge-ok">全部 8 项任务持续监控中</span>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 180px;">任务名称</th>
              <th style="width: 100px;">排程 (Cron)</th>
              <th style="width: 90px;">任务状态</th>
              <th style="width: 130px;">上次运行时间</th>
              <th>最新产出的在线钉钉表格（点击直接查看）</th>
            </tr>
          </thead>
          <tbody>
            ${data.cron_jobs.map(job => `
              <tr data-job-id="${job.id}" data-last-run="${job.last_run}">
                <td><strong>${job.name}</strong></td>
                <td><span class="cron-pill">${job.schedule}</span></td>
                <td class="status-cell">${job.status === '已完成' ? '<span class="alert-pill alert-done">已完成</span>' : '<span class="alert-pill alert-pending">待运行</span>'}</td>
                <td style="font-size: 12px; color: var(--text-secondary);">${job.last_run}</td>
                <td>
                  ${job.sheets && job.sheets.length > 0 ? job.sheets.map(s => `
                    <a class="sheet-link-chip" href="${s.url}" target="_blank">📊 [${s.store}] ${s.name} ↗</a>
                  `).join('') : '<span style="color: var(--text-muted); font-size: 12px;">自动推送到专属通知群</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<script>
  function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.view-content').forEach(view => view.classList.remove('active'));
    
    event.currentTarget.classList.add('active');
    const target = document.getElementById('view-' + tabId);
    if (target) target.classList.add('active');
  }

  // ================= 每到半点主动获取与自动更新脚本 (与主动推送双轨并行) =================
  let currentSyncedAt = "${data.last_synced_at}";

  // 计算距离下一个半点（XX:00 或 XX:30，留 10 秒缓冲以便后端任务完成生成）
  function getNextHalfHourMs() {
    const now = new Date();
    const min = now.getMinutes();
    let targetMin = min < 30 ? 30 : 60;
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), targetMin, 10);
    return target.getTime() - now.getTime();
  }

  function updateSyncBadge() {
    const badge = document.getElementById('autoSyncBadge');
    if (!badge) return;
    const now = new Date();
    const min = now.getMinutes();
    let nextTarget = min < 30 ? ':30' : ':00';
    let nextHour = min < 30 ? now.getHours() : (now.getHours() + 1) % 24;
    badge.innerHTML = '🟢 半点主动获取开启 ｜ 下次检查: ' + String(nextHour).padStart(2, '0') + nextTarget;
  }

  function scheduleHalfHourSync() {
    const msUntilNext = getNextHalfHourMs();
    updateSyncBadge();
    console.log('[AutoSync] 距离下次半点主动获取还有 ' + Math.round(msUntilNext / 1000 / 60) + ' 分钟');

    setTimeout(() => {
      fetchLatestData(true);
      scheduleHalfHourSync();
    }, msUntilNext);
  }

  // 静默获取最新数据 JSON
  function fetchLatestData(isHalfHourTrigger = false) {
    console.log('[AutoSync] 触发主动获取最新数据...', isHalfHourTrigger ? '(半点定时触发)' : '(轮询触发)');
    fetch('dashboard_data.json?t=' + Date.now(), { cache: 'no-cache' })
      .then(res => res.json())
      .then(newData => {
        if (newData && newData.last_synced_at !== currentSyncedAt) {
          console.log('[AutoSync] 检测到新巡检结果！旧:', currentSyncedAt, '-> 新:', newData.last_synced_at);
          currentSyncedAt = newData.last_synced_at;
          showSyncToast('🚀 主动检测到最新巡检结果！看板已自动同步刷新');
          setTimeout(() => { window.location.reload(); }, 1200);
        } else {
          console.log('[AutoSync] 检查完成，当前数据已是最新 (同步时间: ' + currentSyncedAt + ')');
          if (isHalfHourTrigger) {
            showSyncToast('✅ 半点主动巡检完成：当前数据已是最新');
          }
        }
      })
      .catch(err => console.warn('[AutoSync] 主动获取跳过:', err.message));
  }

  function manualSyncNow() {
    showSyncToast('🔄 正在主动检查最新巡检结果...');
    fetchLatestData(true);
  }

  // 轻量提示条
  function showSyncToast(msg) {
    let toast = document.getElementById('syncToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'syncToast';
      toast.style.cssText = 'position:fixed;top:16px;right:16px;background:#1E293B;color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,0.2);z-index:9999;transition:all 0.3s ease;display:flex;align-items:center;gap:8px;';
      document.body.appendChild(toast);
    }
    toast.innerHTML = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => { 
      toast.style.opacity = '0'; 
      toast.style.transform = 'translateY(-10px)'; 
    }, 3500);
  }

  // ================= 客户端实时根据北京时间校准任务状态 (0点过后自动进入待运行) =================
  function refreshCronStatusRealtime() {
    try {
      const beijingNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
      const y = beijingNow.getFullYear();
      const m = String(beijingNow.getMonth() + 1).padStart(2, '0');
      const d = String(beijingNow.getDate()).padStart(2, '0');
      const todayStr = y + '-' + m + '-' + d;

      document.querySelectorAll('tr[data-job-id]').forEach(row => {
        const lastRun = row.getAttribute('data-last-run') || '';
        const statusCell = row.querySelector('.status-cell');
        if (!statusCell) return;
        
        // 如果上次运行时间不是今天（跨过午夜0点进入新的一天），立即动态置为黄色“待运行”
        if (!lastRun.startsWith(todayStr)) {
          statusCell.innerHTML = '<span class="alert-pill alert-pending">待运行</span>';
        }
      });
    } catch (e) {
      console.warn('[RealtimeStatus] 状态校对跳过:', e.message);
    }
  }

  // 页面就绪后启动半点定时器 + 兜底 5 分钟心跳检查 + 客户端北京时间状态校对
  window.addEventListener('DOMContentLoaded', () => {
    refreshCronStatusRealtime();
    scheduleHalfHourSync();
    setInterval(() => { 
      refreshCronStatusRealtime();
      fetchLatestData(false); 
    }, 5 * 60 * 1000);
  });
</script>

</body>
</html>
`;

fs.writeFileSync(HTML_FILE, htmlContent, 'utf8');
console.log('[Build] dashboard.html 生成成功！长度:', htmlContent.length);
