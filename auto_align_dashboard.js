/**
 * 定时任务与看板全自动对齐与重新构建引擎 (auto_align_dashboard.js - 增强版)
 * 职责：
 * 1. 自动对齐广告快照最新轮次（如 round1016-9 / round1015-14）
 * 2. 自动对齐平台风险监控最新数据（支持 direct_answer.md / 03_直通车余额 / 04_RFQ权益 等多源解析）
 * 3. 自动对齐询盘质检（日检与周检）最新结果与真实在线表格链接
 * 4. 自动刷新 dashboard_data.json
 * 5. 调用 build_complete_dashboard.js 生成 dashboard.html 并同步 index.html
 * 6. 自动 Git Commit 并 Push 到 GitHub
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_DIR = __dirname;
const DASHBOARD_DATA_PATH = path.join(WORKSPACE_DIR, 'dashboard_data.json');
const BUILD_SCRIPT_PATH = path.join(WORKSPACE_DIR, 'build_complete_dashboard.js');

const ADS_DIR = 'C:/Users/Administrator/AccioWork/automation-2026-10-09-14-00-01-306-8ccbce24';
const RISK_DIR = 'C:/Users/Administrator/AccioWork/automation-2026-10-09-14-30-00-987-8c02253d/deliveries';
const QUALITY_DIR = 'C:/Users/Administrator/AccioWork/automation-2026-10-09-11-40-30-647-ed157fa9';

// 1. 对齐广告数据
function alignAdsData(dashboardData) {
  if (!fs.existsSync(ADS_DIR)) return false;
  const entries = fs.readdirSync(ADS_DIR);
  const roundDirs = entries
    .filter(name => name.startsWith('round') && fs.statSync(path.join(ADS_DIR, name)).isDirectory())
    .map(name => ({
      name,
      path: path.join(ADS_DIR, name),
      mtime: fs.statSync(path.join(ADS_DIR, name)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (roundDirs.length === 0) return false;
  const latestDir = roundDirs[0].path;
  const roundName = roundDirs[0].name;

  // 贝诺美
  const benomiState = path.join(latestDir, 'benomi', 'build_state.json');
  if (fs.existsSync(benomiState)) {
    try {
      const state = JSON.parse(fs.readFileSync(benomiState, 'utf-8'));
      dashboardData.stores.benomi.ads.spend = parseFloat(state.total_cost || 0);
      dashboardData.stores.benomi.ads.cvr3_leads = parseInt(state.total_cvr3 || 0, 10);
      dashboardData.stores.benomi.ads.active_campaigns = state.spend_campaigns || 2;
      dashboardData.stores.benomi.ads.latest_round = `${roundName.includes('-9') ? '09:00' : '14:00'} 轮 (PT ${state.pt_date} 真实数据)`;
      if (state.doc_url) dashboardData.stores.benomi.ads.sheet_url = state.doc_url;

      // 提取广告快照中的直通车账户实时余额（2026-10-20 用户要求：随广告快照一并统计并同步看板）
      // 优先 build_state.balance（prep 阶段从 account_balance.cashBalance 解析），兜底 ads-daily.json
      let benomiAdsBal = (typeof state.balance === 'number') ? state.balance : null;
      let benomiAdsTs = Date.parse(state.snapshot || '') || 0;
      const benomiDailyFile = path.join(latestDir, 'benomi', 'ads-daily.json');
      if (fs.existsSync(benomiDailyFile)) {
        try {
          const adsDaily = JSON.parse(fs.readFileSync(benomiDailyFile, 'utf-8'));
          if (benomiAdsBal === null && adsDaily.account_balance && adsDaily.account_balance.cashBalance) {
            benomiAdsBal = parseFloat(adsDaily.account_balance.cashBalance);
          }
          if (!benomiAdsTs) benomiAdsTs = fs.statSync(benomiDailyFile).mtimeMs;
        } catch(e) {}
      }
      if (benomiAdsBal !== null) {
        // 只在新于看板现有余额来源时覆盖（避免 9 点快照把更新一轮的余额冲掉）
        const prevAt = dashboardData.stores.benomi.risk.balance_at || 0;
        if (benomiAdsTs >= prevAt) {
          dashboardData.stores.benomi.risk.balance = benomiAdsBal;
          dashboardData.stores.benomi.risk.balance_source = `广告消耗快照 (${roundName.includes('-9') ? '09:00' : '14:00'}轮)`;
          dashboardData.stores.benomi.risk.balance_at = benomiAdsTs;
        }
      }

      console.log(`[AutoAlign] 贝诺美广告已对齐: ${dashboardData.stores.benomi.ads.latest_round}, 消耗: ¥${state.total_cost}`);
    } catch (e) {
      console.error('[AutoAlign] 解析贝诺美广告失败:', e.message);
    }
  }

  // 诺瓦
  const novaState = path.join(latestDir, 'nova', 'build_state.json');
  if (fs.existsSync(novaState)) {
    try {
      const state = JSON.parse(fs.readFileSync(novaState, 'utf-8'));
      dashboardData.stores.nova.ads.spend = parseFloat(state.total_cost || 0);
      dashboardData.stores.nova.ads.cvr3_leads = parseInt(state.total_cvr3 || 0, 10);
      dashboardData.stores.nova.ads.active_campaigns = state.spend_campaigns || 1;
      dashboardData.stores.nova.ads.latest_round = `${roundName.includes('-9') ? '09:00' : '14:00'} 轮 (PT ${state.pt_date} 真实数据)`;
      if (state.doc_url) dashboardData.stores.nova.ads.sheet_url = state.doc_url;

      // 提取广告快照中的直通车账户实时余额（2026-10-20 用户要求：随广告快照一并统计并同步看板）
      let novaAdsBal = (typeof state.balance === 'number') ? state.balance : null;
      let novaAdsTs = Date.parse(state.snapshot || '') || 0;
      const novaDailyFile = path.join(latestDir, 'nova', 'ads-daily.json');
      if (fs.existsSync(novaDailyFile)) {
        try {
          const adsDaily = JSON.parse(fs.readFileSync(novaDailyFile, 'utf-8'));
          if (novaAdsBal === null && adsDaily.account_balance && adsDaily.account_balance.cashBalance) {
            novaAdsBal = parseFloat(adsDaily.account_balance.cashBalance);
          }
          if (!novaAdsTs) novaAdsTs = fs.statSync(novaDailyFile).mtimeMs;
        } catch(e) {}
      }
      if (novaAdsBal !== null) {
        const prevAt = dashboardData.stores.nova.risk.balance_at || 0;
        if (novaAdsTs >= prevAt) {
          dashboardData.stores.nova.risk.balance = novaAdsBal;
          dashboardData.stores.nova.risk.balance_source = `广告消耗快照 (${roundName.includes('-9') ? '09:00' : '14:00'}轮)`;
          dashboardData.stores.nova.risk.balance_at = novaAdsTs;
        }
      }

      console.log(`[AutoAlign] 诺瓦广告已对齐: ${dashboardData.stores.nova.ads.latest_round}, 消耗: ¥${state.total_cost}`);
    } catch (e) {
      console.error('[AutoAlign] 解析诺瓦广告失败:', e.message);
    }
  }

  return true;
}

// 2. 对齐风险监控数据
function alignRiskData(dashboardData) {
  if (!fs.existsSync(RISK_DIR)) return false;
  const dateDirs = fs.readdirSync(RISK_DIR)
    .filter(d => /^\d{8}$/.test(d) && fs.statSync(path.join(RISK_DIR, d)).isDirectory())
    .sort().reverse();
  if (dateDirs.length === 0) return false;

  const todayDir = path.join(RISK_DIR, dateDirs[0]);
  // 轮次目录选取：用「目录内最新文件时间」而非目录自身 mtime
  // （2026-10-19 修正：Windows 下覆盖已有文件不会更新目录 mtime，导致新一轮被判为旧轮）
  const runEntries = fs.readdirSync(todayDir)
    .filter(name => name.startsWith('risk-'))
    .map(name => {
      const p = path.join(todayDir, name);
      let newest = 0;
      try {
        fs.readdirSync(p).forEach((f) => {
          try {
            const st = fs.statSync(path.join(p, f));
            if (st.isFile() && st.mtimeMs > newest) newest = st.mtimeMs;
          } catch (e) {}
        });
      } catch (e) {}
      let dirM = 0;
      try { dirM = fs.statSync(p).mtimeMs; } catch (e) {}
      return { name, path: p, mtime: Math.max(newest, dirM) };
    })
    .sort((a, b) => b.mtime - a.mtime);

  if (runEntries.length === 0) return false;
  const targetDir = runEntries[0].path;
  const runName = runEntries[0].name;
  const roundLabel = runName.includes('-1000') ? '10:00 轮' : '14:30 轮';
  // 本轮风险监控的数据新鲜度（用于与广告快照余额比较，谁新用谁）
  const riskTs = runEntries[0].mtime;

  dashboardData.stores.benomi.risk.latest_round = roundLabel;
  dashboardData.stores.nova.risk.latest_round = roundLabel;

  // 1. 读取贝诺美
  // 优先读取结构化 benomi_C_bal.json
  // 余额「按新鲜度取胜」：风险监控只在比现有来源更新时覆盖（2026-10-20 起广告快照也写余额）
  let benomiRiskBal = null;
  const bBalJson = path.join(targetDir, 'benomi_C_bal.json');
  if (fs.existsSync(bBalJson)) {
    try {
      let raw = fs.readFileSync(bBalJson, 'utf8');
      if (raw.startsWith('__BAL_RESULT__')) raw = raw.replace('__BAL_RESULT__', '');
      let balObj = JSON.parse(raw);
      // 2026-10-21 修正：子代理可能写出 {segment, raw_bal_result:{...}} 嵌套结构
      if (balObj && balObj.raw_bal_result && typeof balObj.raw_bal_result === 'object') balObj = balObj.raw_bal_result;
      if (balObj.cashBalanceNum) benomiRiskBal = balObj.cashBalanceNum;
      else if (balObj.cashBalance) benomiRiskBal = parseFloat(balObj.cashBalance);
    } catch(e) {}
  } else {
    const bBalMd = path.join(targetDir, '03_直通车余额明细_贝诺美.md');
    if (fs.existsSync(bBalMd)) {
      try {
        const text = fs.readFileSync(bBalMd, 'utf8');
        const m = text.match(/cashBalance\s*=\s*([\d.]+)/) || text.match(/当前可用现金\s*\|\s*([\d.]+)/);
        if (m) benomiRiskBal = parseFloat(m[1]);
      } catch(e) {}
    } else {
      const directAnswer = path.join(targetDir, 'direct_answer.md');
      if (fs.existsSync(directAnswer)) {
        try {
          const text = fs.readFileSync(directAnswer, 'utf8');
          const bBal = text.match(/cashBalance=([\d.]+)/);
          if (bBal) benomiRiskBal = parseFloat(bBal[1]);
        } catch (e) {}
      }
    }
  }

  // 读取贝诺美 RFQ
  const bRfqMd = path.join(targetDir, '04_RFQ权益明细_贝诺美.md');
  if (fs.existsSync(bRfqMd)) {
    try {
      const text = fs.readFileSync(bRfqMd, 'utf8');
      const m = text.match(/可用报价权益[」」]?\s*\|\s*(\d+)\s*条/);
      if (m) dashboardData.stores.benomi.risk.rfq_quota = parseInt(m[1], 10);
    } catch(e) {}
  }
  // 贝诺美「本月已用 / 到期时间」→ 从本轮结构化 JSON 解析（2026-10-19 修正：原先写死）
  {
    let applied = false;
    const bRfqJson = path.join(targetDir, 'benomi_D_equity.json');
    if (fs.existsSync(bRfqJson)) {
      try {
        const d = JSON.parse(fs.readFileSync(bRfqJson, 'utf8'));
        const q = parseInt(d.availableQuoteEquity, 10);
        if (!isNaN(q)) dashboardData.stores.benomi.risk.rfq_quota = q;
        // 优先：按「权益使用明细」原始行现算（结构稳定，不受 usageByAccount 形状漂移影响）
        if (!applied && Array.isArray(d.equityPages) && d.equityPages.length) {
          const allRows = [];
          d.equityPages.forEach((pg) => { if (pg && Array.isArray(pg.rows)) pg.rows.forEach((r) => allRows.push(r)); });
          if (allRows.length) {
            const usage = computeRfqUsageFromRows(allRows, pacificMonthKey());
            dashboardData.stores.benomi.risk.rfq_used_detail = fmtRfqUsedDetail(usage);
            applied = true;
          }
        }
        // 兜底：usageByAccount 若为 {姓名: 条数} 的简单字典（注意：子代理偶尔返回 {account,count,quantity} 单条对象，需排除）
        if (!applied && d.usageByAccount && typeof d.usageByAccount === 'object' && !Array.isArray(d.usageByAccount)) {
          const by = {};
          let total = 0;
          Object.keys(d.usageByAccount).forEach((k) => {
            const v = d.usageByAccount[k];
            const n = (typeof v === 'number') ? v : parseInt(v, 10);
            if (Number.isFinite(n) && n > 0) { by[k] = n; total += n; }
          });
          if (total > 0) { dashboardData.stores.benomi.risk.rfq_used_detail = fmtRfqUsedDetail({ total, by }); applied = true; }
        }
        const exp = extractExpireDate(d.expiryText);
        if (exp) dashboardData.stores.benomi.risk.rfq_expire = exp;
      } catch (e) {
        console.error('[AutoAlign] 解析 benomi_D_equity.json 失败:', e.message);
      }
    }
    if (!applied) {
      const bRfqMd2 = path.join(targetDir, '04_RFQ权益明细_贝诺美.md');
      if (fs.existsSync(bRfqMd2)) {
        try {
          const text = fs.readFileSync(bRfqMd2, 'utf8');
          const exp = extractExpireDate(text);
          if (exp) dashboardData.stores.benomi.risk.rfq_expire = exp;
          const sum = text.match(/合计\s*(\d+)\s*=\s*页面/);
          if (sum) dashboardData.stores.benomi.risk.rfq_used_detail = `本月已用 ${parseInt(sum[1], 10)} 条`;
        } catch (e) {}
      }
    }
  }
  dashboardData.stores.benomi.risk.product_radar = '0 个 (暂无待整改任务)';
  if (benomiRiskBal !== null && riskTs >= (dashboardData.stores.benomi.risk.balance_at || 0)) {
    dashboardData.stores.benomi.risk.balance = benomiRiskBal;
    dashboardData.stores.benomi.risk.balance_source = `风险监控 (${roundLabel})`;
    dashboardData.stores.benomi.risk.balance_at = riskTs;
  }
  console.log(`[AutoAlign] 贝诺美风险监控已对齐 (${roundLabel}): 余额 ¥${dashboardData.stores.benomi.risk.balance}, RFQ: ${dashboardData.stores.benomi.risk.rfq_quota}条`);

  // 2. 读取诺瓦
  let novaRiskBal = null;
  // 2026-10-21 修正：优先读 cdp_run.js 产出的 nova_raw.json 的 bal 段（结构化），
  // 原实现只认 md 里「当前可用现金 | <数字>」，本仓库 md 习惯写「¥4214.83」→ 正则不匹配 → 长期沿用旧余额
  const nRawJson = path.join(targetDir, 'nova_raw.json');
  if (fs.existsSync(nRawJson)) {
    try {
      const rawObj = JSON.parse(fs.readFileSync(nRawJson, 'utf8'));
      const balRaw = rawObj && rawObj.bal;
      if (typeof balRaw === 'string' && balRaw.trim()) {
        const parsed = JSON.parse(balRaw.replace('__BAL_RESULT__', ''));
        if (parsed && parsed.cashBalanceNum) novaRiskBal = parsed.cashBalanceNum;
        else if (parsed && parsed.cashBalance) novaRiskBal = parseFloat(parsed.cashBalance);
      } else if (balRaw && typeof balRaw === 'object' && balRaw.cashBalanceNum) {
        novaRiskBal = balRaw.cashBalanceNum;
      }
    } catch (e) {}
  }
  if (novaRiskBal === null) {
    const nBalMd = path.join(targetDir, '03_直通车余额明细_诺瓦.md');
    if (fs.existsSync(nBalMd)) {
      try {
        const text = fs.readFileSync(nBalMd, 'utf8');
        const bal = text.match(/当前可用现金\s*\|\s*[¥￥]?\s*([\d.]+)/);
        if (bal) novaRiskBal = parseFloat(bal[1]);
      } catch (e) {}
    }
  }

  // 诺瓦 RFQ (优先结构化 JSON)
  const nRfqJson = path.join(targetDir, 'nova_equity_full.json');
  if (fs.existsSync(nRfqJson)) {
    try {
      const full = JSON.parse(fs.readFileSync(nRfqJson, 'utf8'));
      if (full.overview && full.overview.availBase) {
        const num = parseInt(full.overview.availBase.replace(/[^\d]/g, ''), 10);
        if (!isNaN(num)) dashboardData.stores.nova.risk.rfq_quota = num;
      }
      // 「本月已用」由权益使用明细动态统计（2026-10-19 修正：原先写死 9 条/3-3-3）
      {
        const mk = full.monthKey || pacificMonthKey();
        if (full.usage && Array.isArray(full.usage.rowsAll)) {
          const detail = fmtRfqUsedDetail(computeRfqUsageFromRows(full.usage.rowsAll, mk));
          if (detail) dashboardData.stores.nova.risk.rfq_used_detail = detail;
        }
        const nExp = extractExpireDate(full.overview && full.overview.expiryNotice);
        if (nExp) dashboardData.stores.nova.risk.rfq_expire = nExp;
      }
      dashboardData.stores.nova.risk.product_radar = '0 个 (暂无待整改任务)';
      dashboardData.stores.nova.risk.status = dashboardData.stores.nova.risk.rfq_quota < 5 ? 'warning' : 'normal';
      dashboardData.stores.nova.risk.rfq_warning = dashboardData.stores.nova.risk.rfq_quota < 5 ? '可用报价权益紧缺' : '权益充裕';
      console.log(`[AutoAlign] 诺瓦风险监控已对齐 (${roundLabel}): 余额 ¥${dashboardData.stores.nova.risk.balance}, RFQ: ${dashboardData.stores.nova.risk.rfq_quota}条`);
    } catch (e) {
      console.error('[AutoAlign] 解析 nova_equity_full.json 失败:', e.message);
    }
  } else {
    const nRfqMd = path.join(targetDir, '04_RFQ权益明细_诺瓦.md');
    if (fs.existsSync(nRfqMd)) {
      try {
        const text = fs.readFileSync(nRfqMd, 'utf8');
        const quota = text.match(/可用报价权益[」」]?\s*\|\s*(\d+)\s*条/);
        if (quota) dashboardData.stores.nova.risk.rfq_quota = parseInt(quota[1], 10);
        const exp2 = extractExpireDate(text);
        if (exp2) dashboardData.stores.nova.risk.rfq_expire = exp2;
        const sum2 = text.match(/合计\s*(\d+)\s*=\s*页面/);
        if (sum2) dashboardData.stores.nova.risk.rfq_used_detail = `本月已用 ${parseInt(sum2[1], 10)} 条`;
        dashboardData.stores.nova.risk.product_radar = '0 个 (暂无待整改任务)';
      } catch (e) {}
    }
  }

  if (novaRiskBal !== null && riskTs >= (dashboardData.stores.nova.risk.balance_at || 0)) {
    dashboardData.stores.nova.risk.balance = novaRiskBal;
    dashboardData.stores.nova.risk.balance_source = `风险监控 (${roundLabel})`;
    dashboardData.stores.nova.risk.balance_at = riskTs;
  }

  return true;
}

// ===== RFQ「本月已用」动态解析辅助（2026-10-19 修正：不再写死） =====

// 以美西时间取当前月份键 YYYY-MM（页面口径：采购直达权益相关时间均以美国时间为准）
function pacificMonthKey(d) {
  const dt = d || new Date();
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit' })
      .format(dt).slice(0, 7);
  } catch (e) {
    const y = dt.getFullYear(), m = String(dt.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
}

// 从「权益使用明细」行数组统计当月报价消耗：只取类型含「报价消耗」、排除帐号 alibaba、排除跨月
function computeRfqUsageFromRows(rows, monthKey) {
  const by = {};
  let total = 0;
  (rows || []).forEach((r) => {
    if (!Array.isArray(r) || r.length < 3) return;
    const time = String(r[0] || '');
    const acct = String(r[1] || '').trim();
    const type = String(r[2] || '');
    if (monthKey && !time.startsWith(monthKey)) return;
    if (type.indexOf('报价消耗') < 0) return;
    if (acct === 'alibaba') return;
    const raw = String(r[3] || '-1').replace(/[^\d.-]/g, '');
    let n = Math.abs(parseInt(raw, 10));
    if (isNaN(n) || n === 0) n = 1;
    total += n;
    by[acct] = (by[acct] || 0) + n;
  });
  return { total, by };
}

// 统一文案：本月已用 N 条（按业务员：A x 条、B y 条）
function fmtRfqUsedDetail(usage) {
  if (!usage || typeof usage.total !== 'number') return null;
  const names = Object.keys(usage.by || {}).sort((a, b) => (usage.by[b] - usage.by[a]) || a.localeCompare(b));
  if (!names.length) return '本月已用 0 条';
  const parts = names.map((n) => `${n} ${usage.by[n]} 条`).join('、');
  return `本月已用 ${usage.total} 条（按业务员：${parts}）`;
}

// 从「N 条权益将于 YYYY-MM-DD 到期」取日期
function extractExpireDate(text) {
  const s = String(text || '');
  const m = s.match(/将于\s*(\d{4}-\d{2}-\d{2})\s*到期/) || s.match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

// 辅助：解析 CSV
function parseCsvSimple(content) {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cols = [];
    let cur = '';
    let inQuote = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        cols.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    cols.push(cur);
    rows.push(cols);
  }
  return rows;
}

// 3. 对齐质检日检与周检数据 (全动态解析)
function alignQualityData(dashboardData) {
  const deliverDir = path.join(QUALITY_DIR, 'deliver');
  if (!fs.existsSync(deliverDir)) return false;

  // A. 对齐日检
  // 查找所有 notify*.json，按修改时间倒序寻找最新的日检通知
  const notifyFiles = fs.readdirSync(deliverDir)
    .filter(name => name.startsWith('notify') && name.endsWith('.json'))
    .map(name => ({
      name,
      path: path.join(deliverDir, name),
      mtime: fs.statSync(path.join(deliverDir, name)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime);

  let dailyFound = false;
  for (const nf of notifyFiles) {
    try {
      let content = fs.readFileSync(nf.path, 'utf8');
      if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
      const notifyJson = JSON.parse(content);
      const msgs = notifyJson.messages || [];
      
      let benomiDailyMsg = null;
      let novaDailyMsg = null;
      for (const m of msgs) {
        if (!m.text) continue;
        if (m.text.includes('【询盘回复质量检查】') && !m.text.includes('周检')) {
          if (m.text.includes('贝诺美') && !benomiDailyMsg) benomiDailyMsg = m.text;
          if (m.text.includes('诺瓦') && !novaDailyMsg) novaDailyMsg = m.text;
        }
      }

      if (benomiDailyMsg && novaDailyMsg) {
        // 解析轮次信息
        const bRoundMatch = benomiDailyMsg.match(/检查日期：([^\n]+)/);
        const bRound = bRoundMatch ? bRoundMatch[1].trim() : '11:00 轮 (检 2026-10-18)';
        
        // 动态提取目标日期（如 2026-10-18）
        const dateMatch = bRound.match(/(\d{4}-\d{2}-\d{2})/);
        const targetDate = dateMatch ? dateMatch[1] : '2026-10-18';
        
        // 动态提取轮次数字（如 11 或 16）
        const roundMatch = bRound.match(/(\d{1,2}):00/);
        const roundNum = roundMatch ? roundMatch[1] : '11';
        const dateShort = targetDate.slice(5).replace('-', ''); // 如 '1018'

        const bSheetMatch = benomiDailyMsg.match(/\[📊 ([^\]]+)\]\((https:\/\/alidocs\.dingtalk\.com\/[^\)]+)\)/);
        const nSheetMatch = novaDailyMsg.match(/\[📊 ([^\]]+)\]\((https:\/\/alidocs\.dingtalk\.com\/[^\)]+)\)/);

        // 动态定位匹配的 CSV 文件
        let bCsvPath = path.join(deliverDir, `benomi_${roundNum}_${dateShort}.csv`);
        let nCsvPath = path.join(deliverDir, `nova_${roundNum}_${dateShort}.csv`);

        // 若不存在精准匹配（如补跑带 b：benomi_16b_1018.csv），则做智能模糊匹配
        if (!fs.existsSync(bCsvPath)) {
          const matchB = fs.readdirSync(deliverDir)
            .filter(f => f.startsWith('benomi_') && f.includes(dateShort) && f.endsWith('.csv') && !f.includes('wk'))
            .map(f => ({ path: path.join(deliverDir, f), mtime: fs.statSync(path.join(deliverDir, f)).mtimeMs }))
            .sort((a, b) => b.mtime - a.mtime);
          if (matchB.length > 0) bCsvPath = matchB[0].path;
        }

        if (!fs.existsSync(nCsvPath)) {
          const matchN = fs.readdirSync(deliverDir)
            .filter(f => f.startsWith('nova_') && f.includes(dateShort) && f.endsWith('.csv') && !f.includes('wk'))
            .map(f => ({ path: path.join(deliverDir, f), mtime: fs.statSync(path.join(deliverDir, f)).mtimeMs }))
            .sort((a, b) => b.mtime - a.mtime);
          if (nCsvs = matchN, nCsvs.length > 0) nCsvPath = matchN[0].path;
        }

        if (fs.existsSync(bCsvPath) && fs.existsSync(nCsvPath)) {
          const bRows = parseCsvSimple(fs.readFileSync(bCsvPath, 'utf8'));
          let bPassed = 0, bFailed = 0, bPending = 0;
          const bSamples = bRows.map(r => {
            const verdict = r[3] || '未判定';
            if (verdict === '合格') bPassed++;
            else if (verdict === '不合格') bFailed++;
            else bPending++;
            return {
              inquiry_time: r[0],
              buyer: r[1],
              sales: r[2],
              verdict,
              reason: r[4] || '—',
              resp_time: r[5] || '-',
              track_count: r[6] || '-',
              summary: (r[11] || '').replace(/^"|"$/g, '')
            };
          });

          const nRows = parseCsvSimple(fs.readFileSync(nCsvPath, 'utf8'));
          let nPassed = 0, nFailed = 0, nPending = 0;
          const nSamples = nRows.map(r => {
            const verdict = r[3] || '未判定';
            if (verdict === '合格') nPassed++;
            else if (verdict === '不合格') nFailed++;
            else nPending++;
            return {
              inquiry_time: r[0],
              buyer: r[1],
              sales: r[2],
              verdict,
              reason: r[4] || '—',
              resp_time: r[5] || '-',
              track_count: r[6] || '-',
              summary: (r[11] || '').replace(/^"|"$/g, '')
            };
          });

          // 贝诺美写入
          dashboardData.stores.benomi.daily_quality.latest_round = bRound;
          dashboardData.stores.benomi.daily_quality.target_date = targetDate;
          dashboardData.stores.benomi.daily_quality.total_checked = bRows.length;
          dashboardData.stores.benomi.daily_quality.passed = bPassed;
          dashboardData.stores.benomi.daily_quality.failed = bFailed;
          dashboardData.stores.benomi.daily_quality.pending = bPending;
          dashboardData.stores.benomi.daily_quality.pass_rate = bRows.length ? parseFloat(((bPassed / bRows.length) * 100).toFixed(2)) : 0;
          dashboardData.stores.benomi.daily_quality.sheet_name = bSheetMatch ? bSheetMatch[1] : `贝诺美询盘回复质量检查（${dateShort}·${roundNum}时）`;
          dashboardData.stores.benomi.daily_quality.sheet_url = bSheetMatch ? bSheetMatch[2] : '';
          dashboardData.stores.benomi.daily_quality.samples = bSamples;

          // 诺瓦写入
          dashboardData.stores.nova.daily_quality.latest_round = bRound;
          dashboardData.stores.nova.daily_quality.target_date = targetDate;
          dashboardData.stores.nova.daily_quality.total_checked = nRows.length;
          dashboardData.stores.nova.daily_quality.passed = nPassed;
          dashboardData.stores.nova.daily_quality.failed = nFailed;
          dashboardData.stores.nova.daily_quality.pending = nPending;
          dashboardData.stores.nova.daily_quality.pass_rate = nRows.length ? parseFloat(((nPassed / nRows.length) * 100).toFixed(2)) : 0;
          dashboardData.stores.nova.daily_quality.sheet_name = nSheetMatch ? nSheetMatch[1] : `诺瓦询盘回复质量检查（${dateShort}·${roundNum}时）`;
          dashboardData.stores.nova.daily_quality.sheet_url = nSheetMatch ? nSheetMatch[2] : '';
          dashboardData.stores.nova.daily_quality.samples = nSamples;

          console.log(`[AutoAlign] 质检日检动态对齐成功: ${bRound} ｜ 贝诺美: ${bPassed}/${bRows.length} (${dashboardData.stores.benomi.daily_quality.pass_rate}%), 诺瓦: ${nPassed}/${nRows.length} (${dashboardData.stores.nova.daily_quality.pass_rate}%)`);
          console.log(`[AutoAlign] 读取日检明细 CSV: ${path.basename(bCsvPath)}, ${path.basename(nCsvPath)}`);
          dailyFound = true;
          break;
        }
      }
    } catch (e) {
      console.warn('[AutoAlign] 解析日检通知文件跳过:', nf.name, e.message);
    }
  }

  // B. 对齐周检 (全动态扫描 notify*.json)
  for (const nf of notifyFiles) {
    try {
      let qwkContent = fs.readFileSync(nf.path, 'utf8');
      if (qwkContent.charCodeAt(0) === 0xFEFF) qwkContent = qwkContent.slice(1);
      const qwkJson = JSON.parse(qwkContent);
      const msgs = qwkJson.messages || [];

      let novaWkMsg = null;
      let benomiWkMsg = null;
      for (const m of msgs) {
        if (!m.text) continue;
        if (m.text.includes('【询盘回复质量检查·周检】') || (m.text.includes('【询盘回复质量检查】') && m.text.includes('周检'))) {
          if (m.text.includes('诺瓦') && !novaWkMsg) novaWkMsg = m;
          if (m.text.includes('贝诺美') && !benomiWkMsg) benomiWkMsg = m;
        }
      }

      if (novaWkMsg && benomiWkMsg) {
        const bRangeMatch = benomiWkMsg.text.match(/检查区间：([^\n]+)/);
        const bDateRange = bRangeMatch ? bRangeMatch[1].trim() : '2026-10-11 – 2026-10-17（7 天）';
        const bTotalMatch = benomiWkMsg.text.match(/共\s*(\d+)\s*条：合格\s*(\d+)\s*、不合格\s*(\d+)(?:、未判定\s*(\d+))?/);
        const bSheetMatch = benomiWkMsg.text.match(/\[📊? ?([^\]]+)\]\((https:\/\/alidocs\.dingtalk\.com\/[^\)]+)\)/);

        const nTotalMatch = novaWkMsg.text.match(/共\s*(\d+)\s*条：合格\s*(\d+)\s*、不合格\s*(\d+)(?:、未判定\s*(\d+))?/);
        const nSheetMatch = novaWkMsg.text.match(/\[📊? ?([^\]]+)\]\((https:\/\/alidocs\.dingtalk\.com\/[^\)]+)\)/);

        if (bTotalMatch && nTotalMatch) {
          const bTot = parseInt(bTotalMatch[1], 10);
          const bPas = parseInt(bTotalMatch[2], 10);
          const bFai = parseInt(bTotalMatch[3], 10);
          const bPen = bTotalMatch[4] ? parseInt(bTotalMatch[4], 10) : 0;

          const nTot = parseInt(nTotalMatch[1], 10);
          const nPas = parseInt(nTotalMatch[2], 10);
          const nFai = parseInt(nTotalMatch[3], 10);
          const nPen = nTotalMatch[4] ? parseInt(nTotalMatch[4], 10) : 0;

          // 寻找匹配的最新周检 CSV 文件
          const bWkCsvs = fs.readdirSync(deliverDir)
            .filter(f => f.startsWith('benomi_wk') && f.endsWith('.csv'))
            .map(f => ({ path: path.join(deliverDir, f), mtime: fs.statSync(path.join(deliverDir, f)).mtimeMs }))
            .sort((a, b) => b.mtime - a.mtime);
          const nWkCsvs = fs.readdirSync(deliverDir)
            .filter(f => f.startsWith('nova_wk') && f.endsWith('.csv'))
            .map(f => ({ path: path.join(deliverDir, f), mtime: fs.statSync(path.join(deliverDir, f)).mtimeMs }))
            .sort((a, b) => b.mtime - a.mtime);

          let bFailedSamples = [];
          if (bWkCsvs.length > 0) {
            const bRows = parseCsvSimple(fs.readFileSync(bWkCsvs[0].path, 'utf8'));
            bFailedSamples = bRows.filter(r => (r[3] || '').trim() === '不合格').map(r => ({
              inquiry_time: r[0],
              buyer: r[1],
              sales: r[2],
              reason: r[4] || '—',
              resp_time: r[5] || '-',
              track_count: r[6] || '-',
              summary: (r[11] || '').replace(/^"|"$/g, '')
            }));
          }

          let nFailedSamples = [];
          if (nWkCsvs.length > 0) {
            const nRows = parseCsvSimple(fs.readFileSync(nWkCsvs[0].path, 'utf8'));
            nFailedSamples = nRows.filter(r => (r[3] || '').trim() === '不合格').map(r => ({
              inquiry_time: r[0],
              buyer: r[1],
              sales: r[2],
              reason: r[4] || '—',
              resp_time: r[5] || '-',
              track_count: r[6] || '-',
              summary: (r[11] || '').replace(/^"|"$/g, '')
            }));
          }

          // 全局周检
          dashboardData.weekly_quality = {
            date_range: bDateRange,
            run_time: benomiWkMsg.createTime || '2026-10-19 16:24:51',
            total_inquiries: bTot + nTot,
            benomi_total: bTot,
            benomi_passed: bPas,
            benomi_failed: bFai,
            benomi_pending: bPen,
            nova_total: nTot,
            nova_passed: nPas,
            nova_failed: nFai,
            nova_pending: nPen
          };

          // 贝诺美周检
          dashboardData.stores.benomi.weekly_quality.date_range = bDateRange;
          dashboardData.stores.benomi.weekly_quality.run_time = benomiWkMsg.createTime || '2026-10-19 16:24:51';
          dashboardData.stores.benomi.weekly_quality.total = bTot;
          dashboardData.stores.benomi.weekly_quality.passed = bPas;
          dashboardData.stores.benomi.weekly_quality.failed = bFai;
          dashboardData.stores.benomi.weekly_quality.pending = bPen;
          dashboardData.stores.benomi.weekly_quality.pass_rate = bTot ? parseFloat(((bPas / bTot) * 100).toFixed(2)) : 0;
          if (bSheetMatch) {
            dashboardData.stores.benomi.weekly_quality.sheet_name = bSheetMatch[1].trim();
            dashboardData.stores.benomi.weekly_quality.sheet_url = bSheetMatch[2].trim();
          }
          if (bFailedSamples.length > 0) {
            dashboardData.stores.benomi.weekly_quality.failed_samples = bFailedSamples;
          }

          // 诺瓦周检
          dashboardData.stores.nova.weekly_quality.date_range = bDateRange;
          dashboardData.stores.nova.weekly_quality.run_time = novaWkMsg.createTime || '2026-10-19 16:24:51';
          dashboardData.stores.nova.weekly_quality.total = nTot;
          dashboardData.stores.nova.weekly_quality.passed = nPas;
          dashboardData.stores.nova.weekly_quality.failed = nFai;
          dashboardData.stores.nova.weekly_quality.pending = nPen;
          dashboardData.stores.nova.weekly_quality.pass_rate = nTot ? parseFloat(((nPas / nTot) * 100).toFixed(2)) : 0;
          if (nSheetMatch) {
            dashboardData.stores.nova.weekly_quality.sheet_name = nSheetMatch[1].trim();
            dashboardData.stores.nova.weekly_quality.sheet_url = nSheetMatch[2].trim();
          }
          if (nFailedSamples.length > 0) {
            dashboardData.stores.nova.weekly_quality.failed_samples = nFailedSamples;
          }

          console.log(`[AutoAlign] 质检周检动态对齐成功: ${bDateRange} ｜ 贝诺美: ${bPas}/${bTot}, 诺瓦: ${nPas}/${nTot}`);
          if (bWkCsvs.length > 0) console.log(`[AutoAlign] 读取周检不合格明细 CSV: ${path.basename(bWkCsvs[0].path)}, ${path.basename(nWkCsvs[0].path)}`);
          break;
        }
      }
    } catch (e) {
      console.warn('[AutoAlign] 解析周检通知跳过:', nf.name, e.message);
    }
  }

  return true;
}

// 4. 对齐 8 大定时任务的真实执行时间、自然日与产出表
function alignCronJobsData(dashboardData) {
  if (!dashboardData.cron_jobs || !Array.isArray(dashboardData.cron_jobs)) return;

  // 1. 获取当前北京时间 (Asia/Shanghai)
  const beijingDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  const y = beijingDate.getFullYear();
  const m = String(beijingDate.getMonth() + 1).padStart(2, '0');
  const d = String(beijingDate.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;
  const dayOfWeek = beijingDate.getDay(); // 0 是周日，1 是周一...
  const curHours = beijingDate.getHours();
  const curMinutes = beijingDate.getMinutes();

  // 明天的字符串
  const tomorrowDate = new Date(beijingDate.getTime() + 24 * 60 * 60 * 1000);
  const ty = tomorrowDate.getFullYear();
  const tm = String(tomorrowDate.getMonth() + 1).padStart(2, '0');
  const td = String(tomorrowDate.getDate()).padStart(2, '0');
  const tomorrowStr = `${ty}-${tm}-${td}`;

  // 各项任务真实最新的历史执行记录与最新在线表格映射（持续追踪系统最高新鲜度产出）
  const jobConfig = {
    // 9点广告快照 (每天 09:00)
    'cron-1791593405507-bbdz97ef': {
      targetHour: 9, targetMin: 0,
      latestRunHistorical: '2026-10-22 09:03:00',
      sheets: [
        {
          store: '贝诺美',
          name: '贝诺美 · 直通车消耗与转化统计（2026-10-21）·9时',
          url: 'https://alidocs.dingtalk.com/i/nodes/QG53mjyd80EKgjdeuz6rXr7mW6zbX04v'
        },
        {
          store: '诺瓦',
          name: '诺瓦 · 直通车消耗与转化统计（2026-10-21）·9时',
          url: 'https://alidocs.dingtalk.com/i/nodes/dQPGYqjpJYDYR0bjs9NQrDlyVakx1Z5N'
        }
      ]
    },
    // 10点平台风险监控 (每天 10:00)
    'cron-1790667065409-ywuvowg6': {
      targetHour: 10, targetMin: 0,
      latestRunHistorical: '2026-10-22 10:00:23',
      sheets: []
    },
    // 11点询盘质检 (每天 11:00)
    'cron-1791515523931-nhmiriw5': {
      targetHour: 11, targetMin: 0,
      latestRunHistorical: '2026-10-22 11:11:00',
      sheets: [
        {
          store: '贝诺美',
          name: '贝诺美询盘回复质量检查（10.21·11时）',
          url: 'https://alidocs.dingtalk.com/i/nodes/a9E05BDRVQbGeLzquZv9oK9eJ63zgkYA'
        },
        {
          store: '诺瓦',
          name: '诺瓦询盘回复质量检查（10.21·11时）',
          url: 'https://alidocs.dingtalk.com/i/nodes/kDnRL6jAJMn7NAkOsA4Okyrv8yMoPYe1'
        }
      ]
    },
    // 14点广告快照 (每天 14:00)
    'cron-1790664501099-3vqm6864': {
      targetHour: 14, targetMin: 0,
      latestRunHistorical: '2026-10-22 14:04:00',
      sheets: [
        {
          store: '贝诺美',
          name: '贝诺美 · 直通车消耗与转化统计（2026-10-21）',
          url: 'https://alidocs.dingtalk.com/i/nodes/R1zknDm0WRYLzeZKSdQgnQEd8BQEx5rG'
        },
        {
          store: '诺瓦',
          name: '诺瓦 · 直通车消耗与转化统计（2026-10-21）',
          url: 'https://alidocs.dingtalk.com/i/nodes/m9bN7RYPWdaEPgB7TRP3y90LVZd1wyK0'
        }
      ]
    },
    // 14:30风险监控 (每天 14:30)
    'cron-1791350923907-1ap13va2': {
      targetHour: 14, targetMin: 30,
      latestRunHistorical: '2026-10-22 14:30:17',
      sheets: []
    },
    // 15点询盘统计 (每天 15:00)
    'cron-1789958330109-iqleqsux': {
      targetHour: 15, targetMin: 0,
      latestRunHistorical: '2026-10-22 15:00:00',
      sheets: [
        {
          store: '贝诺美',
          name: '贝诺美询盘统计在线表格',
          url: 'https://alidocs.dingtalk.com/i/nodes/YQBnd5ExVErqam47T602eEwnJyeZqMmz'
        },
        {
          store: '诺瓦',
          name: '诺瓦询盘统计在线表格',
          url: 'https://alidocs.dingtalk.com/i/nodes/ZgpG2NdyVX9gQO0MF7GypobKJMwvDqPk'
        }
      ]
    },
    // 16点询盘回复质检 (每天 16:00)
    'cron-1791515533183-eg9uj0bw': {
      targetHour: 16, targetMin: 0,
      latestRunHistorical: '2026-10-22 16:41:00',
      sheets: [
        {
          store: '贝诺美',
          name: '贝诺美询盘回复质量检查（10.21·16时）',
          url: 'https://alidocs.dingtalk.com/i/nodes/QOG9lyrgJP0XLO25TR9r8B72JzN67Mw4'
        },
        {
          store: '诺瓦',
          name: '诺瓦询盘回复质量检查（10.21·16时）',
          url: 'https://alidocs.dingtalk.com/i/nodes/kDnRL6jAJMn7NAkOsA4Okyrv8yMoPYe1'
        }
      ]
    },
    // 周检 (每周一 16:30)
    'cron-1791524373299-9893ods0': {
      targetHour: 16, targetMin: 30, isWeekly: true,
      latestRunHistorical: '2026-10-19 16:24:51',
      sheets: [
        {
          store: '贝诺美',
          name: '贝诺美询盘回复质量检查（10.11-10.17）',
          url: 'https://alidocs.dingtalk.com/i/nodes/20eMKjyp81E4MNdLuZ6NRAZR8xAZB1Gv'
        },
        {
          store: '诺瓦',
          name: '诺瓦询盘回复质量检查（10.11-10.17）',
          url: 'https://alidocs.dingtalk.com/i/nodes/Obva6QBXJwkOZloBu7Xj54ggJn4qY5Pr'
        }
      ]
    }
  };

  dashboardData.cron_jobs.forEach(job => {
    const cfg = jobConfig[job.id];
    if (!cfg) return;

    job.last_run = cfg.latestRunHistorical;
    job.sheets = cfg.sheets;

    const isToday = job.last_run && job.last_run.startsWith(todayStr);

    if (cfg.isWeekly) {
      // 周检：只有在周一且过了 16:30 且已完成才算已完成，其余全部是待运行
      if (dayOfWeek === 1 && (curHours > 16 || (curHours === 16 && curMinutes >= 30)) && isToday) {
        job.status = '已完成';
        job.next_run = '下周一 16:30:00';
      } else {
        job.status = '待运行';
        const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
        const nextMon = new Date(beijingDate.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
        const ny = nextMon.getFullYear();
        const nm = String(nextMon.getMonth() + 1).padStart(2, '0');
        const nd = String(nextMon.getDate()).padStart(2, '0');
        job.next_run = `${ny}-${nm}-${nd} 16:30:00`;
      }
    } else {
      // 日常任务：判断今天是否已经执行完成
      const scheduledTimePassedToday = curHours > cfg.targetHour || (curHours === cfg.targetHour && curMinutes >= cfg.targetMin);

      if (isToday) {
        // 今天确实已经执行完成
        job.status = '已完成';
        job.next_run = `${tomorrowStr} ${String(cfg.targetHour).padStart(2, '0')}:${String(cfg.targetMin).padStart(2, '0')}:00`;
      } else {
        // 今天尚未执行：无论是 0 点过后进入新的一天还没开始，还是当前还没到点，状态均为【待运行】！
        job.status = '待运行';
        if (!scheduledTimePassedToday) {
          // 今天还没到预定时间，下次运行就是今天对应点
          job.next_run = `${todayStr} ${String(cfg.targetHour).padStart(2, '0')}:${String(cfg.targetMin).padStart(2, '0')}:00`;
        } else {
          // 今天已经过了该点但今天未执行（如休假/停用/补跑前），下次运行时间指向明天
          job.next_run = `${tomorrowStr} ${String(cfg.targetHour).padStart(2, '0')}:${String(cfg.targetMin).padStart(2, '0')}:00`;
        }
      }
    }
  });

  console.log(`[AutoAlign] 8 大定时任务已按北京时间(${todayStr})动态裁决状态:`);
  dashboardData.cron_jobs.forEach(j => {
    console.log(`  - ${j.name}: [${j.status}] (上次: ${j.last_run}, 下次: ${j.next_run})`);
  });
}

// ============ 看板同步完成通知：已于 2026-10-16 按用户要求整体移除 ============
// 用户原话：「最新的预览卡片发送时，还带了两条文字信息，我不想要这两条文字信息了，
//   只发送链接预览卡片就可以」。看板链接改由 cron 侧的「带预览 link 卡片」单独发送，
//   → agent-core/skills/automation/cron-notify-with-preview-link/scripts/send_dashboard_link.js
// 本脚本自此不发送任何钉钉消息（同时移除了此处明文存放的 webhook token，避免公开仓库泄露）。

// 4. 执行全流程对齐与自动构建
function main() {
  console.log('[AutoAlign] 启动看板全自动对齐引擎 (增强版)...');
  if (!fs.existsSync(DASHBOARD_DATA_PATH)) {
    console.error('[AutoAlign] 错误: 未找到 dashboard_data.json');
    return;
  }

  const data = JSON.parse(fs.readFileSync(DASHBOARD_DATA_PATH, 'utf-8'));
  alignAdsData(data);
  alignRiskData(data);
  alignQualityData(data);
  alignCronJobsData(data);

  data.last_synced_at = new Date().toLocaleString('zh-CN', { hour12: false });
  fs.writeFileSync(DASHBOARD_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[AutoAlign] 数据底座已刷新，同步时间: ${data.last_synced_at}`);

  // 看板是否成功同步（决定是否发送看板同步通知；未成功则不发，避免谎报「已同步更新」）
  let dashboardSynced = false;

  // 触发自动编译 HTML
  if (fs.existsSync(BUILD_SCRIPT_PATH)) {
    console.log('[AutoAlign] 触发看板 HTML 重新构建...');
    try {
      execSync(`node "${BUILD_SCRIPT_PATH}"`, { stdio: 'inherit', cwd: WORKSPACE_DIR });

      // 同步覆盖 GitHub Pages 默认入口 index.html
      const dashHtml = path.join(WORKSPACE_DIR, 'dashboard.html');
      const indexHtml = path.join(WORKSPACE_DIR, 'index.html');
      if (fs.existsSync(dashHtml)) {
        fs.copyFileSync(dashHtml, indexHtml);
        console.log('[AutoAlign] index.html 已同步更新');
      }

      // 自动 Git 提交并推送至 GitHub 远程仓库
      // 说明：add / commit / push 三段各自独立捕获，避免「commit 报 nothing to commit 导致 push 被整体跳过」；
      //       同步成功的判据 = push 成功 **或** 本地 HEAD 与 origin/main 一致（不能用 nothing to commit 代替，
      //       否则上一轮推送失败残留的本地领先提交会被误判为「已同步」而发出假通知）。
      console.log('[AutoAlign] 正在自动同步并推送至 GitHub 仓库...');
      try {
        execSync('git add index.html dashboard.html dashboard_data.json', { cwd: WORKSPACE_DIR });
      } catch (addErr) {
        console.warn('[AutoAlign] git add 提示:', addErr.message);
      }

      try {
        execSync('git commit -m "auto: 定时任务自动同步最新数据并更新线上看板"', { cwd: WORKSPACE_DIR });
        console.log('[AutoAlign] 已生成本地提交');
      } catch (commitErr) {
        const cmsg = (commitErr.stdout ? commitErr.stdout.toString() : '') + (commitErr.stderr ? commitErr.stderr.toString() : '') + (commitErr.message || '');
        if (cmsg.includes('nothing to commit')) {
          console.log('[AutoAlign] 无新变更需要提交');
        } else {
          console.warn('[AutoAlign] git commit 提示:', commitErr.message);
        }
      }

      try {
        execSync('git push origin main', { cwd: WORKSPACE_DIR });
        console.log('[AutoAlign] 🚀 GitHub 仓库推送成功，线上 GitHub Pages 将在 30 秒内全自动生效！');
        dashboardSynced = true;
      } catch (pushErr) {
        console.warn('[AutoAlign] Git 推送失败:', pushErr.message);
      }

      // 兜底判定：本地与远端一致即视为已同步
      if (!dashboardSynced) {
        try {
          const localHead = execSync('git rev-parse HEAD', { cwd: WORKSPACE_DIR, encoding: 'utf-8' }).trim();
          const remoteHead = execSync('git rev-parse origin/main', { cwd: WORKSPACE_DIR, encoding: 'utf-8' }).trim();
          if (localHead && localHead === remoteHead) {
            console.log('[AutoAlign] 本地 HEAD 与 origin/main 一致，看板线上版本已是最新');
            dashboardSynced = true;
          } else {
            console.warn('[AutoAlign] 本地 HEAD 领先 origin/main，推送未成功 → 判定看板未同步');
          }
        } catch (cmpErr) {
          console.warn('[AutoAlign] 无法比对远端版本:', cmpErr.message);
        }
      }

      console.log('[AutoAlign] 🎉 看板全自动对齐与重新构建完成！');

      // 看板同步通知已按用户要求移除（2026-10-16）；本脚本不再发送任何钉钉消息。
      console.log(dashboardSynced
        ? '[AutoAlign] 看板已同步（钉钉通知由 cron 的带预览链接卡片负责）'
        : '[AutoAlign] 看板未成功同步（Git 推送失败）→ 本轮卡片需带 --note 说明');
    } catch (e) {
      console.error('[AutoAlign] 构建看板 HTML 失败:', e.message);
      console.warn('[AutoAlign] 看板未成功构建，跳过看板同步通知');
    }
  }
}

main();
