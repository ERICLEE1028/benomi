const fs = require('fs');
const path = require('path');

const deliverDir = 'C:/Users/Administrator/AccioWork/automation-2026-10-09-11-40-30-647-ed157fa9/deliver';
const bJson = path.join(deliverDir, 'readback_benomi_wk_1026.json');
const nJson = path.join(deliverDir, 'readback_nova_wk_1026.json');

if (fs.existsSync(bJson)) {
  const bd = JSON.parse(fs.readFileSync(bJson, 'utf8'));
  if (bd.csv) {
    fs.writeFileSync(path.join(deliverDir, 'benomi_wk_1018.csv'), bd.csv, 'utf8');
    console.log('已提取 benomi_wk_1018.csv');
  }
}

if (fs.existsSync(nJson)) {
  const nd = JSON.parse(fs.readFileSync(nJson, 'utf8'));
  if (nd.csv) {
    fs.writeFileSync(path.join(deliverDir, 'nova_wk_1018.csv'), nd.csv, 'utf8');
    console.log('已提取 nova_wk_1018.csv');
  }
}
