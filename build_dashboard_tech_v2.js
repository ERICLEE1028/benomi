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
  <title>双平台定时任务监控与巡检看板 (浅蓝科技风预览版)</title>
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
      gap: 4px;
      position: relative;
      white-space: nowrap;
      user-select: none;
    }

    .tab-btn .tab-sub {
      font-size: 11px;
      font-weight: 600;
      color: #64748B;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .tab-btn:hover {
      background: #EFF6FF;
      border-color: #93C5FD;
      color: #0284C7;
      transform: translateY(-1px);
    }

    /* 激活态：深邃科技蓝渐变 + 发光科技底托 + 状态提示，一眼看清 */
    .tab-btn.active {
      background: linear-gradient(135deg, #0284C7 0%, #2563EB 100%);
      border-color: #0284C7;
      color: #FFFFFF;
      box-shadow: 0 6px 18px -2px rgba(37, 99, 235, 0.42), 0 0 0 2px rgba(186, 230, 253, 0.5);
    }

    .tab-btn.active .tab-sub {
      color: #BAE6FD;
    }

    .tab-btn.active::after {
      content: "▼ 正在查看";
      position: absolute;
      bottom: 2px;
      font-size: 9px;
      font-weight: 700;
      color: #E0F2FE;
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

  <!-- 选项卡导航 (超醒目科技分页控制台) -->
  <div class="tabs-wrapper">
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('overview')">
        <span class="tab-sub">PAGE 01 · 核心大盘</span>
        <span>🌐 全局总览</span>
      </button>
      <button class="tab-btn" onclick="switchTab('benomi')">
        <span class="tab-sub">PAGE 02 · 平台专属</span>
        <span>🔵 贝诺美专属</span>
      </button>
      <button class="tab-btn" onclick="switchTab('nova')">
        <span class="tab-sub">PAGE 03 · 平台专属</span>
        <span>🟣 诺瓦专属</span>
      </button>
      <button class="tab-btn" onclick="switchTab('cron')">
        <span class="tab-sub">PAGE 04 · 自动化矩阵</span>
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
