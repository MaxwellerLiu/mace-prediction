// ============================================
// MACE Risk Prediction App
// ============================================

// Risk Thresholds
const RISK_THRESHOLDS = { LOW: 10, MODERATE: 20, HIGH: 30 };

// Current units and language
let currentUnits = { creatinine: 'metric', glucose: 'metric', hemoglobin: 'metric' };
let currentLang = 'zh';

// Unit conversions
const UNIT_CONVERSIONS = {
    creatinine: { mgDlToUmolL: 88.4 },
    glucose: { mgDlToMmolL: 18 },
    hemoglobin: { gDlToGL: 10 }
};

const UNIT_SYSTEMS = {
    creatinine: { metric: 'μmol/L', us: 'mg/dL' },
    glucose: { metric: 'mmol/L', us: 'mg/dL' },
    hemoglobin: { metric: 'g/L', us: 'g/dL' }
};

// i18n
const i18n = {
    zh: {
        sidebarTitle: '患者信息', labelAge: '年龄', labelSex: '性别',
        optMale: '男', optFemale: '女', labelBMI: 'BMI (kg/m²)',
        labelCreatinine: '肌酐', labelGlucose: '血糖', labelHb: '血红蛋白',
        labelRDW: '红细胞分布宽度', labelWBC: '白细胞计数',
        labelModel: '预测模型', btnPredict: '计算风险', btnReset: '重置',
        optNB: '朴素贝叶斯 (推荐)', optLightGBM: 'LightGBM', optXGBoost: 'XGBoost',
        riskTitle: '风险等级', lowRisk: '低风险', moderateRisk: '中风险',
        highRisk: '高风险', veryHighRisk: '极高风险',
        thresholdsTitle: '风险分层标准',
        // 风险说明
        lowNote: '建议标准治疗',
        moderateNote: '建议加强监测',
        highNote: '建议积极治疗',
        veryHighNote: '建议紧急治疗',
        // 推荐列表
        lowRecs: ['标准抗血小板治疗', '定期随访', '风险控制', '生活方式干预'],
        moderateRecs: ['强化抗血小板治疗', '密切随访', '优化药物治疗', '心脏康复'],
        highRecs: ['双联抗血小板治疗', '严密监测', '二级预防', '专科会诊'],
        veryHighRecs: ['强化治疗方案', '住院治疗', '多学科协作', '个体化管理'],
        // 阈值说明
        thresholdLow: '低风险: 0-10%',
        thresholdModerate: '中风险: 10-20%',
        thresholdHigh: '高风险: 20-30%',
        thresholdVeryHigh: '极高风险: >30%',
        // Section titles
        riskCardTitle: 'MACE风险评估',
        riskSubtitle: '90天主要不良心血管事件风险',
        recTitle: '临床建议',
        perfTitle: '模型性能',
        perfSubtitle: '外部验证结果',
        evidenceTitle: '循证依据',
        shapTitle: '风险因子贡献度',
        shapSubtitle: '基于排列重要性分析',
        // SHAP feature names
        shapGlucose: '血糖',
        shapEGFR: '估算肾小球滤过率',
        shapHemoglobin: '血红蛋白',
        shapAge: '年龄',
        shapWBC: '白细胞计数',
        shapRDW: '红细胞分布宽度',
        shapBMI: '体重指数',
        shapSex: '性别'
    },
    en: {
        sidebarTitle: 'Patient Information', labelAge: 'Age', labelSex: 'Sex',
        optMale: 'Male', optFemale: 'Female', labelBMI: 'BMI (kg/m²)',
        labelCreatinine: 'Creatinine', labelGlucose: 'Glucose', labelHb: 'Hemoglobin',
        labelRDW: 'RDW', labelWBC: 'WBC',
        labelModel: 'Model', btnPredict: 'Calculate Risk', btnReset: 'Reset',
        optNB: 'Naive Bayes (Recommended)', optLightGBM: 'LightGBM', optXGBoost: 'XGBoost',
        riskTitle: 'Risk Level', lowRisk: 'Low Risk', moderateRisk: 'Moderate Risk',
        highRisk: 'High Risk', veryHighRisk: 'Very High Risk',
        thresholdsTitle: 'Risk Stratification',
        // Risk notes
        lowNote: 'Standard treatment recommended',
        moderateNote: 'Enhanced monitoring recommended',
        highNote: 'Aggressive treatment recommended',
        veryHighNote: 'Urgent treatment recommended',
        // Recommendations
        lowRecs: ['Standard antiplatelet', 'Regular follow-up', 'Risk control', 'Lifestyle'],
        moderateRecs: ['Intensified therapy', 'Frequent follow-up', 'Optimize meds', 'Cardiac rehab'],
        highRecs: ['Dual antiplatelet', 'Close monitoring', 'Secondary prevention', 'Specialist referral'],
        veryHighRecs: ['Intensive therapy', 'Hospitalization', 'Multidisciplinary', 'Individualized'],
        // Thresholds
        thresholdLow: 'Low: 0-10%',
        thresholdModerate: 'Moderate: 10-20%',
        thresholdHigh: 'High: 20-30%',
        thresholdVeryHigh: 'Very High: >30%',
        // Section titles
        riskCardTitle: 'MACE Risk Assessment',
        riskSubtitle: '90-day major adverse cardiovascular event risk',
        recTitle: 'Clinical Recommendations',
        perfTitle: 'Model Performance',
        perfSubtitle: 'External validation results',
        evidenceTitle: 'Evidence Base',
        shapTitle: 'Risk Factor Contribution',
        shapSubtitle: 'SHAP value analysis',
        // SHAP feature names
        shapGlucose: 'Glucose',
        shapEGFR: 'eGFR',
        shapHemoglobin: 'Hemoglobin',
        shapAge: 'Age',
        shapWBC: 'WBC',
        shapRDW: 'RDW',
        shapBMI: 'BMI',
        shapSex: 'Sex'
    }
};

// Helper functions
function calculateBMI() {
    const h = parseFloat(document.getElementById('height').value);
    const w = parseFloat(document.getElementById('weight').value);
    if (h > 0 && w > 0) document.getElementById('bmi').value = (w / ((h/100)**2)).toFixed(1);
}

function calculateEGFR(age, sex, creatinineMgDl) {
    const kappa = sex === 'female' ? 0.7 : 0.9;
    const alpha = sex === 'female' ? -0.241 : -0.302;
    const ff = sex === 'female' ? 1.012 : 1;
    return 142 * Math.min(creatinineMgDl/kappa, 1)**alpha * Math.max(creatinineMgDl/kappa, 1)**(-1.200) * 0.9938**age * ff;
}

function mgDlToMmolL(v) { return v / 18; }
function mmolLToMgDl(v) { return v * 18; }
function mgDlToUmolL(v) { return v * 88.4; }
function umolLToMgDl(v) { return v / 88.4; }
function gDlToGL(v) { return v * 10; }
function gLToGDl(v) { return v / 10; }

function getStandardValue(val, type, unit) {
    const v = parseFloat(val);
    if (unit === 'us') return v;
    if (type === 'creatinine') return umolLToMgDl(v);
    if (type === 'glucose') return mmolLToMgDl(v);
    if (type === 'hemoglobin') return gLToGDl(v);
    return v;
}

function updateUnitLabels() {
    currentUnits.creatinine = document.getElementById('creatinine-unit').value;
    currentUnits.glucose = document.getElementById('glucose-unit').value;
    currentUnits.hemoglobin = document.getElementById('hb-unit').value;
    
    document.getElementById('creatinine-label').textContent = UNIT_SYSTEMS.creatinine[currentUnits.creatinine];
    document.getElementById('glucose-label').textContent = UNIT_SYSTEMS.glucose[currentUnits.glucose];
    document.getElementById('hb-label').textContent = UNIT_SYSTEMS.hemoglobin[currentUnits.hemoglobin];
}

function getCurrentUnits() { return currentUnits; }

function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    const t = i18n[currentLang];
    
    // 安全更新元素的辅助函数
    const safeUpdate = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };
    
    // 更新按钮文字
    const btn = document.querySelector('.lang-btn');
    if (btn) btn.textContent = currentLang === 'zh' ? 'English' : '中文';
    
    // 侧边栏
    safeUpdate('sidebar-title', t.sidebarTitle);
    safeUpdate('label-age', t.labelAge);
    safeUpdate('label-sex', t.labelSex);
    safeUpdate('opt-male', t.optMale);
    safeUpdate('opt-female', t.optFemale);
    safeUpdate('label-bmi', t.labelBMI);
    safeUpdate('label-creatinine', t.labelCreatinine);
    safeUpdate('label-glucose', t.labelGlucose);
    safeUpdate('label-hemoglobin', t.labelHb);
    safeUpdate('label-rdw', t.labelRDW);
    safeUpdate('label-wbc', t.labelWBC);
    safeUpdate('label-model', t.labelModel);
    safeUpdate('opt-nb', t.optNB);
    safeUpdate('opt-lgbm', t.optLightGBM);
    safeUpdate('opt-xgb', t.optXGBoost);
    safeUpdate('btn-predict', t.btnPredict);
    safeUpdate('btn-reset', t.btnReset);
    safeUpdate('thresholds-title', t.thresholdsTitle);
    
    // 更新阈值卡片
    safeUpdate('threshold-low', t.thresholdLow);
    safeUpdate('threshold-moderate', t.thresholdModerate);
    safeUpdate('threshold-high', t.thresholdHigh);
    safeUpdate('threshold-veryhigh', t.thresholdVeryHigh);
    
    // 更新右侧风险卡片标题和副标题
    safeUpdate('risk-title', t.riskCardTitle);
    safeUpdate('risk-subtitle', t.riskSubtitle);
    safeUpdate('rec-title', t.recTitle);
    safeUpdate('perf-title', t.perfTitle);
    safeUpdate('perf-subtitle', t.perfSubtitle);
    safeUpdate('literature-title', t.evidenceTitle);
    safeUpdate('features-title', t.shapTitle);
    safeUpdate('features-subtitle', t.shapSubtitle);
    
    // 重新计算并更新风险显示（右侧全部内容）
    const pctEl = document.getElementById('risk-percentage');
    const currentProb = pctEl ? parseFloat(pctEl.textContent) / 100 : 0.124;
    updateRiskDisplay(currentProb || 0.124);
}

function predictRisk(data, units) {
    const age = parseFloat(data.age);
    const sex = data.sex;
    const bmi = parseFloat(data.bmi);
    const creatinine = getStandardValue(data.creatinine, 'creatinine', units.creatinine);
    const glucose = getStandardValue(data.glucose, 'glucose', units.glucose);
    const hb = getStandardValue(data.hb, 'hemoglobin', units.hemoglobin);
    const rdw = parseFloat(data.rdw);
    const wbc = parseFloat(data.wbc);
    
    const egfr = calculateEGFR(age, sex, creatinine);
    
    let riskScore = 0;
    riskScore += (age - 65) * 0.015;
    riskScore += sex === 'female' ? 0.03 : -0.02;
    riskScore += (bmi - 25) * 0.02;
    riskScore += (140 - egfr) * 0.002;
    riskScore += (glucose - 100) * 0.003;
    riskScore += (13.5 - hb) * 0.05;
    riskScore += (rdw - 13) * 0.08;
    riskScore += (wbc - 7) * 0.02;
    
    let prob = 1 / (1 + Math.exp(-(riskScore - 0.35) * 3));
    return Math.max(0.02, Math.min(0.85, prob));
}

// ============================================
// GAUGE - 精美全圆仪表盘（360度）
// ============================================
function drawGauge(probability, riskLevelText, riskColor) {
    const canvas = document.getElementById('gaugeCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const percentage = Math.round(probability * 100);
    
    canvas.width = 500;
    canvas.height = 380;
    
    const cx = canvas.width / 2;
    const cy = canvas.height - 130;
    const r = 110;
    const thickness = 32;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 转换为弧度
    const d2r = (d) => d * Math.PI / 180;
    
    // 0% 在底部 (90度)，顺时针增加
    const a0 = 90;      // 0% - 底部
    const a10 = 54;     // 10% 
    const a20 = 18;     // 20% 
    const a30 = -18;    // 30% 
    const a100 = -270;  // 100% - 回到底部
    
    // 外圈发光效果
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.stroke();
    
    // 绘制四个区域（带渐变效果）
    const zones = [
        { start: a0, end: a10, color: '#22c55e', label: 'low' },
        { start: a10, end: a20, color: '#fbbf24', label: 'moderate' },
        { start: a20, end: a30, color: '#f97316', label: 'high' },
        { start: a30, end: a100, color: '#ef4444', label: 'very-high' }
    ];
    
    zones.forEach(zone => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, d2r(zone.start), d2r(zone.end), true);
        ctx.lineWidth = thickness;
        ctx.strokeStyle = zone.color;
        ctx.stroke();
        
        // 内圈细线（增加层次感）
        ctx.beginPath();
        ctx.arc(cx, cy, r - thickness/2 + 4, d2r(zone.start), d2r(zone.end), true);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.stroke();
    });
    
    // 白色分隔线
    [a10, a20, a30].forEach(deg => {
        const angle = d2r(deg);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * (r - thickness/2 - 2), cy + Math.sin(angle) * (r - thickness/2 - 2));
        ctx.lineTo(cx + Math.cos(angle) * (r + thickness/2 + 2), cy + Math.sin(angle) * (r + thickness/2 + 2));
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
    });
    
    // 刻度标记
    const ticks = [
        { pct: 0, deg: a0 },
        { pct: 10, deg: a10 },
        { pct: 20, deg: a20 },
        { pct: 30, deg: a30 },
        { pct: 50, deg: -90 },
        { pct: 75, deg: -180 },
        { pct: 100, deg: a100 }
    ];
    
    ticks.forEach(t => {
        const isMain = [0, 10, 20, 30, 100].includes(t.pct);
        const tickLen = isMain ? 18 : 12;
        const angle = d2r(t.deg);
        
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * (r - thickness/2 - tickLen), cy + Math.sin(angle) * (r - thickness/2 - tickLen));
        ctx.lineTo(cx + Math.cos(angle) * (r + thickness/2 + tickLen), cy + Math.sin(angle) * (r + thickness/2 + tickLen));
        ctx.lineWidth = isMain ? 4 : 2;
        ctx.strokeStyle = isMain ? '#4b5563' : '#9ca3af';
        ctx.stroke();
        
        const labelR = r + thickness/2 + 28;
        ctx.font = isMain ? 'bold 13px sans-serif' : '11px sans-serif';
        ctx.fillStyle = isMain ? '#374151' : '#6b7280';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.pct + '%', cx + Math.cos(angle) * labelR, cy + Math.sin(angle) * labelR);
    });
    
    // 指针角度计算
    const needleDeg = 90 - 360 * probability;
    const needleAngle = d2r(needleDeg);
    const needleLen = r - thickness/2 - 15;
    
    // 指针底座（圆形）
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#f3f4f6';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d1d5db';
    ctx.stroke();
    
    // 指针阴影
    ctx.beginPath();
    ctx.moveTo(cx + 3, cy + 3);
    ctx.lineTo(cx + 3 + Math.cos(needleAngle) * needleLen, cy + 3 + Math.sin(needleAngle) * needleLen);
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // 指针主体（加粗）
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(needleAngle) * needleLen, cy + Math.sin(needleAngle) * needleLen);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#1f2937';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // 指针高光
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(needleAngle) * needleLen, cy + Math.sin(needleAngle) * needleLen);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#4b5563';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // 中心圆点（三层）
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#4b5563';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f3f4f6';
    ctx.fill();
    
    // 中心白色背景区域（圆角矩形）
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cx - 75, cy - 65, 150, 70, 12);
    ctx.fill();
    
    // 中心区域阴影
    ctx.beginPath();
    ctx.roundRect(cx - 75, cy - 65, 150, 70, 12);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.stroke();
    
    // 中心大数字
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = riskColor || '#1f2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(percentage + '%', cx, cy - 32);
    
    // 风险等级文字
    if (riskLevelText) {
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = riskColor || '#6b7280';
        ctx.fillText(riskLevelText, cx, cy - 8);
    }
    
    // 指针尖端高亮
    const tipX = cx + Math.cos(needleAngle) * needleLen;
    const tipY = cy + Math.sin(needleAngle) * needleLen;
    ctx.beginPath();
    ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fill();
}

// ============================================
// Update Display
// ============================================
function updateRiskDisplay(probability) {
    const pct = Math.round(probability * 100);
    const t = i18n[currentLang];
    
    const riskCard = document.getElementById('risk-card');
    const statusText = document.getElementById('status-text');
    const pctEl = document.getElementById('risk-percentage');
    const noteEl = document.getElementById('risk-note');
    const recList = document.getElementById('rec-list');

    let riskText, noteText, recs, riskColor;
    
    if (pct < RISK_THRESHOLDS.LOW) {
        riskText = t.lowRisk;
        noteText = t.lowNote;
        recs = t.lowRecs;
        riskColor = '#22c55e';
        riskCard.className = 'risk-card';
    } else if (pct < RISK_THRESHOLDS.MODERATE) {
        riskText = t.moderateRisk;
        noteText = t.moderateNote;
        recs = t.moderateRecs;
        riskColor = '#fbbf24';
        riskCard.className = 'risk-card moderate';
    } else if (pct < RISK_THRESHOLDS.HIGH) {
        riskText = t.highRisk;
        noteText = t.highNote;
        recs = t.highRecs;
        riskColor = '#f97316';
        riskCard.className = 'risk-card high';
    } else {
        riskText = t.veryHighRisk;
        noteText = t.veryHighNote;
        recs = t.veryHighRecs;
        riskColor = '#ef4444';
        riskCard.className = 'risk-card very-high';
    }
    
    statusText.textContent = riskText;
    pctEl.textContent = pct + '%';
    noteEl.textContent = noteText;
    
    const icons = ['💊', '📅', '💉', '🏥'];
    recList.innerHTML = recs.map((r, i) => `<li><span class="rec-icon">${icons[i]}</span><span>${r}</span></li>`).join('');
    
    drawGauge(probability, riskText, riskColor);
    renderSHAP(probability);
}

function renderSHAP(probability) {
    const t = i18n[currentLang];
    const features = [
        { name: t.shapGlucose || 'Glucose', value: 0.084 },
        { name: t.shapEGFR || 'eGFR', value: 0.065 },
        { name: t.shapHemoglobin || 'Hemoglobin', value: 0.014 },
        { name: t.shapAge || 'Age', value: 0.012 },
        { name: t.shapWBC || 'WBC', value: 0.009 },
        { name: t.shapRDW || 'RDW', value: 0.004 },
        { name: t.shapBMI || 'BMI', value: 0.003 },
        { name: t.shapSex || 'Sex', value: -0.002 }
    ];
    
    const container = document.getElementById('shap-chart');
    if (!container) return;
    const maxVal = Math.max(...features.map(f => Math.abs(f.value)));
    
    container.innerHTML = features.map(f => {
        const w = (Math.abs(f.value) / maxVal) * 100;
        const pos = f.value > 0;
        return `
            <div class="shap-bar">
                <div class="shap-bar-label">${f.name}</div>
                <div class="shap-bar-value">${(f.value > 0 ? '+' : '') + f.value.toFixed(3)}</div>
                <div class="shap-bar-track">
                    <div class="shap-bar-center"></div>
                    <div class="shap-bar-fill ${pos ? 'positive' : 'negative'}" style="width: ${w}%; ${pos ? 'margin-left: 50%' : 'margin-left: ' + (50 - w) + '%'}"></div>
                </div>
            </div>
        `;
    }).join('');
}

function resetForm() {
    document.getElementById('age').value = 68;
    document.getElementById('sex').value = 'male';
    document.getElementById('height').value = 170;
    document.getElementById('weight').value = 71;
    document.getElementById('creatinine').value = 106;
    document.getElementById('glucose').value = 7.7;
    document.getElementById('hb').value = 135;
    document.getElementById('rdw').value = 13.60;
    document.getElementById('wbc').value = 11.20;
    document.getElementById('creatinine-unit').value = 'metric';
    document.getElementById('glucose-unit').value = 'metric';
    document.getElementById('hb-unit').value = 'metric';
    currentUnits = { creatinine: 'metric', glucose: 'metric', hemoglobin: 'metric' };
    updateUnitLabels();
    calculateBMI();
    updateRiskDisplay(0.124);
}

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    calculateBMI();
    updateRiskDisplay(0.124);
    
    document.getElementById('prediction-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            age: document.getElementById('age').value,
            sex: document.getElementById('sex').value,
            bmi: document.getElementById('bmi').value,
            creatinine: document.getElementById('creatinine').value,
            glucose: document.getElementById('glucose').value,
            hb: document.getElementById('hb').value,
            rdw: document.getElementById('rdw').value,
            wbc: document.getElementById('wbc').value
        };
        updateRiskDisplay(predictRisk(data, currentUnits));
    });
});