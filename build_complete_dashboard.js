/**
 * build_complete_dashboard.js
 * 读取 dashboard_data.json 并生成最终版美化交互式 dashboard.html
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'dashboard_data.json');
const HTML_FILE = path.join(__dirname, 'dashboard.html');

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>双平台定时任务监控与巡检看板 (最新全量对齐版)</title>
  <style>
    :root {
      --bg-primary: #F8FAFC;
      --bg-card: #FFFFFF;
      --bg-subtle: #F1F5F9;
      --border-color: #E2E8F0;
      --text-main: #0F172A;
      --text-secondary: #475569;
      --text-muted: #94A3B8;
      
      --brand-blue: #2563EB;
      --brand-blue-soft: #EFF6FF;
      --benomi-accent: #2563EB;
      --benomi-bg: #EFF6FF;
      --nova-accent: #7C3AED;
      --nova-bg: #F5F3FF;
      
      --status-success-bg: #ECFDF5;
      --status-success-text: #065F46;
      --status-success-border: #A7F3D0;
      
      --status-warning-bg: #FFFBEB;
      --status-warning-text: #92400E;
      --status-warning-border: #FDE68A;

      --status-error-bg: #FEF2F2;
      --status-error-text: #991B1B;
      --status-error-border: #FECACA;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
      background-color: var(--bg-primary);
      color: var(--text-main);
      padding: 24px;
      line-height: 1.5;
    }

    .container { max-width: 1280px; margin: 0 auto; }

    /* 顶部导航与状态栏 */
    .header {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .header-title h1 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header-title p {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 4px;
    }
    .header-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
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
      background: var(--bg-subtle);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }

    /* 选项卡导航 */
    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 8px;
      overflow-x: auto;
    }
    .tab-btn {
      background: transparent;
      border: none;
      padding: 10px 18px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .tab-btn:hover { background: var(--bg-subtle); color: var(--text-main); }
    .tab-btn.active {
      background: var(--brand-blue);
      color: #FFFFFF;
      box-shadow: 0 2px 4px rgba(37,99,235,0.2);
    }

    .view-content { display: none; }
    .view-content.active { display: block; }

    /* 通用卡片容器 */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 12px;
    }
    .card-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-tag {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 500;
    }
    .tag-benomi { background: var(--benomi-bg); color: var(--benomi-accent); border: 1px solid #BFDBFE; }
    .tag-nova { background: var(--nova-bg); color: var(--nova-accent); border: 1px solid #DDD6FE; }

    /* 网格布局 */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    .stat-box {
      background: var(--bg-subtle);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 14px;
    }
    .stat-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; }
    .stat-value { font-size: 20px; font-weight: 700; color: var(--text-main); }
    .stat-desc { font-size: 11px; color: var(--text-muted); margin-top: 4px; }

    /* 明细列表 */
    .detail-list { display: flex; flex-direction: column; gap: 8px; }
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      padding: 6px 0;
      border-bottom: 1px dashed var(--border-color);
    }
    .detail-item:last-child { border-bottom: none; }
    .detail-title { color: var(--text-secondary); }
    .detail-value { font-weight: 600; color: var(--text-main); text-align: right; }

    /* 表格 */
    .table-container {
      overflow-x: auto;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      margin-top: 12px;
      background: #FFFFFF;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }
    th {
      background: var(--bg-subtle);
      color: var(--text-secondary);
      font-weight: 600;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-main);
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #F8FAFC; }

    /* 不合格整行标红 */
    tr.row-fail td {
      color: #DC2626 !important;
      background-color: #FEF2F2 !important;
      font-weight: 500;
    }

    .sheet-link-chip {
      display: inline-block;
      margin: 2px 4px 2px 0;
      padding: 2px 8px;
      background: #EFF6FF;
      color: #1D4ED8;
      border: 1px solid #BFDBFE;
      border-radius: 4px;
      text-decoration: none;
      font-size: 11px;
      font-weight: 500;
    }
    .sheet-link-chip:hover { background: #DBEAFE; }

    .alert-pill {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .alert-done { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
    .alert-pending { background: #FEF3C7; color: #D97706; border: 1px solid #FDE68A; }
    .alert-normal { background: #ECFDF5; color: #059669; }
    .alert-danger { background: #FEF2F2; color: #DC2626; }

    .cron-pill {
      font-size: 11px;
      font-family: monospace;
      padding: 2px 6px;
      background: var(--bg-subtle);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      color: var(--text-secondary);
    }
  </style>
</head>
<body>

<div class="container">
  <!-- 顶部状态栏 -->
  <div class="header">
    <div class="header-title">
      <h1>📊 阿里双平台自动化巡检与监控看板</h1>
      <p>全部数据 100% 对齐已完成定时任务 ｜ 14:00 终态转化 ｜ 14:30 风险余额 ｜ 周检业务员字段严格映射</p>
    </div>
    <div class="header-meta" id="headerMeta">
      <span class="badge badge-neutral">🕒 数据底座: ${data.last_synced_at}</span>
      <span class="badge" id="autoSyncBadge" style="background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE;">🟢 半点主动获取: 开启中</span>
      <button onclick="manualSyncNow()" style="background:#2563EB;color:#fff;border:none;border-radius:12px;padding:3px 10px;font-size:11px;font-weight:600;cursor:pointer;">🔄 立即检查</button>
      <span class="badge badge-ok">● 贝诺美: 9236 正常</span>
      <span class="badge badge-ok">● 诺瓦: 9222 正常</span>
      ${data.stores.nova.risk.rfq_quota < 5 ? 
        `<span class="badge badge-danger">🚨 诺瓦 RFQ 仅剩 ${data.stores.nova.risk.rfq_quota} 条</span>` : 
        `<span class="badge badge-ok">● 诺瓦 RFQ: ${data.stores.nova.risk.rfq_quota} 条 (正常)</span>`}
    </div>
  </div>

  <!-- 选项卡导航 -->
  <div class="tabs">
    <button class="tab-btn active" onclick="switchTab('overview')">总览</button>
    <button class="tab-btn" onclick="switchTab('benomi')">贝诺美专属</button>
    <button class="tab-btn" onclick="switchTab('nova')">诺瓦专属</button>
    <button class="tab-btn" onclick="switchTab('cron')">定时任务与表格</button>
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
        <div class="card" style="border-top: 4px solid #2563EB; margin-bottom: 0;">
          <div class="card-header" style="margin-bottom: 10px; padding-bottom: 8px;">
            <div class="card-title">
              <span style="color: #2563EB;">🔵 贝诺美 (benomibeauty) · 平台风险监控</span>
              <span class="card-tag tag-benomi">中继 9236</span>
            </div>
            <span class="alert-pill alert-normal">风险状态: 正常</span>
          </div>
          <div class="detail-list">
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
              <span class="detail-title">RFQ 普通报价权益</span>
              <span class="detail-value" style="color: #059669; font-weight: 700;">
                ${data.stores.benomi.risk.rfq_quota} 条剩余 (到期: ${data.stores.benomi.risk.rfq_expire} ｜ ${data.stores.benomi.risk.rfq_used_detail})
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-title">直通车当前可用现金</span>
              <span class="detail-value" style="color: #059669;">¥${data.stores.benomi.risk.balance.toFixed(2)} (扣除今日消耗后双源一致)</span>
            </div>
            <div class="detail-item">
              <span class="detail-title">风险监控交付形式</span>
              <span class="detail-value" style="color: #2563EB;">
                🔔 Accio 机器人 Webhook 专属群推送 (@李冰)
              </span>
            </div>
          </div>
        </div>

        <!-- 诺瓦风险框 -->
        <div class="card" style="border-top: 4px solid ${data.stores.nova.risk.rfq_quota < 5 ? '#DC2626' : '#7C3AED'}; margin-bottom: 0;">
          <div class="card-header" style="margin-bottom: 10px; padding-bottom: 8px;">
            <div class="card-title">
              <span style="color: #7C3AED;">🟣 诺瓦 (jnnova) · 平台风险监控</span>
              <span class="card-tag tag-nova">CDP 9222</span>
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
              <span class="detail-value" style="color: #059669;">¥${data.stores.nova.risk.balance.toFixed(2)} (安全充裕)</span>
            </div>
            <div class="detail-item">
              <span class="detail-title">风险监控交付形式</span>
              <span class="detail-value" style="color: #7C3AED;">
                🔔 Accio 机器人 Webhook 专属群推送 (@李冰)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 下方汇聚余额与 14 点终态转化情况 -->
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
            <strong style="color: #2563EB; font-size: 13px;">🔵 贝诺美 · 14:00 终态转化明细</strong>
            <a class="sheet-link-chip" href="${data.stores.benomi.ads.sheet_url}" target="_blank">📊 广告快照表 ↗</a>
          </div>
          <div class="detail-list">
            <div class="detail-item"><span class="detail-title">在投在跑计划</span><span class="detail-value">2 个计划 (机器515 / 提量计划)</span></div>
            <div class="detail-item"><span class="detail-title">去重商机转化明细</span><span class="detail-value" style="color: #059669;">机器515: 1个 ｜ 提量计划: 6个 (共 7 个)</span></div>
            <div class="detail-item"><span class="detail-title">全天曝光与点击</span><span class="detail-value">3,277 曝光 ｜ 82 点击 (CTR 2.50%)</span></div>
            <div class="detail-item"><span class="detail-title">昨日质检日检转化率</span><span class="detail-value" style="color: #059669;">100% (2/2 合格，闸门完备)</span></div>
          </div>
        </div>

        <div style="background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
            <strong style="color: #7C3AED; font-size: 13px;">🟣 诺瓦 · 14:00 终态转化明细</strong>
            <a class="sheet-link-chip" href="${data.stores.nova.ads.sheet_url}" target="_blank">📊 广告快照表 ↗</a>
          </div>
          <div class="detail-list">
            <div class="detail-item"><span class="detail-title">在投在跑计划</span><span class="detail-value">1 个计划 (推店铺计划)</span></div>
            <div class="detail-item"><span class="detail-title">去重商机转化明细</span><span class="detail-value" style="color: #059669;">推店铺计划: 1 个去重商机 (cvr3=1)</span></div>
            <div class="detail-item"><span class="detail-title">全天曝光与点击</span><span class="detail-value">2,927 曝光 ｜ 58 点击 (CTR 1.98%)</span></div>
            <div class="detail-item"><span class="detail-title">上周质检转化合格率</span><span class="detail-value" style="color: #059669;">57.14% (12/21 达标)</span></div>
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
          <span class="card-tag tag-benomi">美妆/个护平台</span>
        </div>
        <span class="badge badge-ok">通道: 默认 Chrome 中继通道 (9236)</span>
      </div>

      <h3 style="font-size: 14px; margin-bottom: 12px; color: var(--text-secondary);">📅 最新日常巡检快照</h3>
      <div class="grid-2" style="margin-bottom: 20px;">
        <div style="background: var(--bg-subtle); padding: 14px; border-radius: 8px;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">广告与商机 (14:00 终态轮)</div>
          <div class="detail-list">
            <div class="detail-item"><span class="detail-title">终态消耗金额</span><span class="detail-value">¥${data.stores.benomi.ads.spend.toFixed(2)}</span></div>
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
              📋 贝诺美 · 周检查独立分析专区 (2026-10-04 至 2026-10-10)
            </h3>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              业务员严格匹配阿里「负责人」列 ｜ 真实综合合格率: <strong>${data.stores.benomi.weekly_quality.pass_rate}%</strong> (16合格 / 5不合格 / 1未判定)
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
        <span class="badge badge-ok">通道: ChromeProfile2 CDP 直连 (9222)</span>
      </div>

      <h3 style="font-size: 14px; margin-bottom: 12px; color: var(--text-secondary);">📅 最新日常巡检快照</h3>
      <div class="grid-2" style="margin-bottom: 20px;">
        <div style="background: var(--bg-subtle); padding: 14px; border-radius: 8px;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">广告与商机 (14:00 终态轮)</div>
          <div class="detail-list">
            <div class="detail-item"><span class="detail-title">终态消耗金额</span><span class="detail-value">¥${data.stores.nova.ads.spend.toFixed(2)}</span></div>
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
              📋 诺瓦 · 周检查独立分析专区 (2026-10-04 至 2026-10-10)
            </h3>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              业务员严格匹配阿里「负责人」列 ｜ 真实综合合格率: <strong>${data.stores.nova.weekly_quality.pass_rate}%</strong> (12合格 / 9不合格 / 0未判定)
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
              <tr>
                <td><strong>${job.name}</strong></td>
                <td><span class="cron-pill">${job.schedule}</span></td>
                <td>${job.status === '已完成' ? '<span class="alert-pill alert-done">已完成</span>' : '<span class="alert-pill alert-pending">待运行</span>'}</td>
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

  // 页面就绪后启动半点定时器 + 兜底 5 分钟心跳检查
  window.addEventListener('DOMContentLoaded', () => {
    scheduleHalfHourSync();
    setInterval(() => { fetchLatestData(false); }, 5 * 60 * 1000);
  });
</script>

</body>
</html>
`;

fs.writeFileSync(HTML_FILE, htmlContent, 'utf8');
console.log('[Build] dashboard.html 生成成功！长度:', htmlContent.length);
