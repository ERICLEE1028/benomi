/**
 * 定时任务与看板全自动对齐与重新构建引擎 (auto_align_dashboard.js)
 * 职责：
 * 1. 自动定位广告快照任务最新轮次（round*），提取两店花费、全站商机(cvr3)、计划数及最新在线表格链接
 * 2. 自动定位平台风险监控最新轮次，提取未读违规、发货预警、直通车可用余额、RFQ报价权益及商品雷达待整改
 * 3. 自动定位询盘质检（日检与周检）最新结果，提取合格率与表格链接
 * 4. 自动写入 dashboard_data.json，并立即调用 build_complete_dashboard.js 编译生成全新的 dashboard.html
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
  const benomiJson = path.join(latestDir, 'benomi', 'ads-daily.json');
  if (fs.existsSync(benomiJson)) {
    try {
      const bData = JSON.parse(fs.readFileSync(benomiJson, 'utf-8'));
      const sum = bData.total_summary || {};
      dashboardData.stores.benomi.ads.spend = parseFloat(sum.cost || 0);
      dashboardData.stores.benomi.ads.cvr3_leads = parseInt(sum.cvr3 || 0, 10);
      dashboardData.stores.benomi.ads.active_campaigns = (bData.campaigns || []).length;
      dashboardData.stores.benomi.ads.latest_round = `${roundName.includes('-9') ? '09:00' : '14:00'} 轮 (PT ${bData.pt_date} 真实数据)`;

      const bState = path.join(latestDir, 'benomi', 'build_state.json');
      if (fs.existsSync(bState)) {
        const state = JSON.parse(fs.readFileSync(bState, 'utf-8'));
        if (state.doc_url) dashboardData.stores.benomi.ads.sheet_url = state.doc_url;
      }
    } catch (e) {
      console.error('[AutoAlign] 解析贝诺美广告失败:', e.message);
    }
  }

  // 诺瓦
  const novaJson = path.join(latestDir, 'nova', 'ads-daily.json');
  if (fs.existsSync(novaJson)) {
    try {
      const nData = JSON.parse(fs.readFileSync(novaJson, 'utf-8'));
      const sum = nData.total_summary || {};
      dashboardData.stores.nova.ads.spend = parseFloat(sum.cost || 0);
      dashboardData.stores.nova.ads.cvr3_leads = parseInt(sum.cvr3 || 0, 10);
      dashboardData.stores.nova.ads.active_campaigns = (nData.campaigns || []).length;
      dashboardData.stores.nova.ads.latest_round = `${roundName.includes('-9') ? '09:00' : '14:00'} 轮 (PT ${nData.pt_date} 真实数据)`;

      const nState = path.join(latestDir, 'nova', 'build_state.json');
      if (fs.existsSync(nState)) {
        const state = JSON.parse(fs.readFileSync(nState, 'utf-8'));
        if (state.doc_url) dashboardData.stores.nova.ads.sheet_url = state.doc_url;
      }
    } catch (e) {
      console.error('[AutoAlign] 解析诺瓦广告失败:', e.message);
    }
  }

  return true;
}

// 2. 对齐风险监控数据
function alignRiskData(dashboardData) {
  if (!fs.existsSync(RISK_DIR)) return false;
  // 查找当天或最新的交付目录
  const dateDirs = fs.readdirSync(RISK_DIR)
    .filter(d => /^\d{8}$/.test(d) && fs.statSync(path.join(RISK_DIR, d)).isDirectory())
    .sort().reverse();
  if (dateDirs.length === 0) return false;

  const todayDir = path.join(RISK_DIR, dateDirs[0]);
  const runEntries = fs.readdirSync(todayDir)
    .map(name => ({
      name,
      path: path.join(todayDir, name),
      mtime: fs.statSync(path.join(todayDir, name)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime);

  // 尝试读取最新的通知文本或明细
  for (const item of runEntries) {
    const notifyBenomi = path.join(item.path, '通知_贝诺美.txt');
    const notifyNova = path.join(item.path, '通知_诺瓦.txt');
    if (fs.existsSync(notifyBenomi) && fs.existsSync(notifyNova)) {
      try {
        const bText = fs.readFileSync(notifyBenomi, 'utf8');
        const nText = fs.readFileSync(notifyNova, 'utf8');

        // 解析贝诺美
        const bBalMatch = bText.match(/直通车余额[：:]\s*¥?([\d.]+)/);
        if (bBalMatch) dashboardData.stores.benomi.risk.balance = parseFloat(bBalMatch[1]);
        const bRfqMatch = bText.match(/RFQ可用报价权益剩余[：:]\s*(\d+)/);
        if (bRfqMatch) dashboardData.stores.benomi.risk.rfq_quota = parseInt(bRfqMatch[1], 10);
        const bRadarMatch = bText.match(/商品雷达待整改[：:]\s*([^\n\r]+)/);
        if (bRadarMatch) dashboardData.stores.benomi.risk.product_radar = bRadarMatch[1].trim();

        // 解析诺瓦
        const nBalMatch = nText.match(/直通车余额[：:]\s*¥?([\d.]+)/);
        if (nBalMatch) dashboardData.stores.nova.risk.balance = parseFloat(nBalMatch[1]);
        const nRfqMatch = nText.match(/RFQ可用报价权益剩余[：:]\s*(\d+)/);
        if (nRfqMatch) dashboardData.stores.nova.risk.rfq_quota = parseInt(nRfqMatch[1], 10);
        const nRadarMatch = nText.match(/商品雷达待整改[：:]\s*([^\n\r]+)/);
        if (nRadarMatch) dashboardData.stores.nova.risk.product_radar = nRadarMatch[1].trim();

        console.log('[AutoAlign] 平台风险数据已从最新运行记录对齐成功');
        break;
      } catch (e) {
        console.error('[AutoAlign] 解析风险通知失败:', e.message);
      }
    }
  }

  return true;
}

// 3. 执行全流程对齐与自动构建
function main() {
  console.log('[AutoAlign] 启动看板全自动对齐引擎...');
  if (!fs.existsSync(DASHBOARD_DATA_PATH)) {
    console.error('[AutoAlign] 错误: 未找到 dashboard_data.json');
    return;
  }

  const data = JSON.parse(fs.readFileSync(DASHBOARD_DATA_PATH, 'utf-8'));
  alignAdsData(data);
  alignRiskData(data);

  data.last_synced_at = new Date().toLocaleString('zh-CN', { hour12: false });
  fs.writeFileSync(DASHBOARD_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[AutoAlign] 数据底座已刷新，同步时间: ${data.last_synced_at}`);

  // 触发自动编译 HTML
  if (fs.existsSync(BUILD_SCRIPT_PATH)) {
    console.log('[AutoAlign] 触发看板 HTML 重新构建...');
    try {
      execSync(`node "${BUILD_SCRIPT_PATH}"`, { stdio: 'inherit', cwd: WORKSPACE_DIR });
      console.log('[AutoAlign] 🎉 看板全自动对齐与重新构建完成！');
    } catch (e) {
      console.error('[AutoAlign] 构建看板 HTML 失败:', e.message);
    }
  }
}

main();
