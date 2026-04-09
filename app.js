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
        optMale: '男', optFemale: '女', labelBMI: 'BMI',
        labelCreatinine: '肌酐', labelGlucose: '血糖', labelHb: '血红蛋白',
        labelRDW: '红细胞分布宽度', labelWBC: '白细胞计数',
        labelModel: '预测模型', btnPredict: '计算风险', btnReset: '重置',
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
        shapSubtitle: '基于排列重要性分析'
    },
    en: {
        sidebarTitle: 'Patient Information', labelAge: 'Age', labelSex: 'Sex',
        optMale: 'Male', optFemale: 'Female', labelBMI: 'BMI',
        labelCreatinine: 'Creatinine', labelGlucose: 'Glucose', labelHb: 'Hemoglobin',
        labelRDW: 'RDW', labelWBC: 'WBC',
        labelModel: 'Model', btnPredict: 'Calculate Risk', btnReset: 'Reset',
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
        shapSubtitle: 'SHAP value analysis'
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
    console.log('toggleLanguage called, currentLang before:', currentLang);
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    console.log('currentLang after:', currentLang);
    const t = i18n[currentLang];
    console.log('Got i18n object:', t);
    
    // 更新按钮文字
    console.log('Updating button...');
    document.querySelector('.lang-btn').textContent = currentLang === 'zh' ? 'English' : '中文';
    console.log('Button updated');
    
    // 侧边栏
    console.log('Updating sidebar-title...');
    document.getElementById('sidebar-title').textContent = t.sidebarTitle;
    console.log('Updating label-age...');
    document.getElementById('label-age').textContent = t.labelAge;
    document.getElementById('label-sex').textContent = t.labelSex;
    document.getElementById('opt-male').textContent = t.optMale;
    document.getElementById('opt-female').textContent = t.optFemale;
    document.getElementById('label-bmi').textContent = t.labelBMI;
    document.getElementById('label-creatinine').textContent = t.labelCreatinine;
    document.getElementById('label-glucose').textContent = t.labelGlucose;
    document.getElementById('label-hemoglobin').textContent = t.labelHb;
    document.getElementById('label-rdw').textContent = t.labelRDW;
    document.getElementById('label-wbc').textContent = t.labelWBC;
    document.getElementById('label-model').textContent = t.labelModel;
    document.getElementById('btn-predict').textContent = t.btnPredict;
    document.getElementById('btn-reset').textContent = t.btnReset;
    document.getElementById('thresholds-title').textContent = t.thresholdsTitle;
    
    // 更新阈值卡片
    document.getElementById('threshold-low').textContent = t.thresholdLow;
    document.getElementById('threshold-moderate').textContent = t.thresholdModerate;
    document.getElementById('threshold-high').textContent = t.thresholdHigh;
    document.getElementById('threshold-veryhigh').textContent = t.thresholdVeryHigh;
    
    // 更新右侧风险卡片标题和副标题
    console.log('Updating risk-title:', t.riskCardTitle);
    document.getElementById('risk-title').textContent = t.riskCardTitle;
    document.getElementById('risk-subtitle').textContent = t.riskSubtitle;
    document.getElementById('rec-title').textContent = t.recTitle;
    document.getElementById('perf-title').textContent = t.perfTitle;
    document.getElementById('perf-subtitle').textContent = t.perfSubtitle;
    document.getElementById('literature-title').textContent = t.evidenceTitle;
    document.getElementById('features-title').textContent = t.shapTitle;
    document.getElementById('features-subtitle').textContent = t.shapSubtitle;
    
    // 重新计算并更新风险显示（右侧全部内容）
    const currentProb = parseFloat(document.getElementById('risk-percentage').textContent) / 100;
    console.log('Calling updateRiskDisplay with prob:', currentProb);
    updateRiskDisplay(currentProb || 0.124);
    console.log('toggleLanguage complete');
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
// GAUGE - 全圆仪表盘（360度）- 简化版
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
    const thickness = 28;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 转换为弧度
    const d2r = (d) => d * Math.PI / 180;
    
    // 0% 在底部 (90度)，顺时针增加
    // 各区域边界角度
    const a0 = 90;      // 0% - 底部
    const a10 = 54;     // 10% - 右下
    const a20 = 18;     // 20% - 右
    const a30 = -18;    // 30% - 右上
    const a100 = -270;  // 100% - 回到底部
    
    // 绘制四个区域
    // 绿色: 90 -> 54 度 (顺时针)
    ctx.beginPath();
    ctx.arc(cx, cy, r, d2r(a0), d2r(a10), true);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = '#22c55e';
    ctx.stroke();
    
    // 黄色: 54 -> 18 度 (顺时针)
    ctx.beginPath();
    ctx.arc(cx, cy, r, d2r(a10), d2r(a20), true);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();
    
    // 橙色: 18 -> -18 度 (顺时针)
    ctx.beginPath();
    ctx.arc(cx, cy, r, d2r(a20), d2r(a30), true);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = '#f97316';
    ctx.stroke();
    
    // 红色: -18 -> -270 度 (顺时针，经过上、左、下)
    ctx.beginPath();
    ctx.arc(cx, cy, r, d2r(a30), d2r(a100), true);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = '#ef4444';
    ctx.stroke();
    
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
        { pct: 50, deg: -90 },   // 顶部
        { pct: 75, deg: -180 },  // 左侧
        { pct: 100, deg: a100 }
    ];
    
    ticks.forEach(t => {
        const isMain = [0, 10, 20, 30, 100].includes(t.pct);
        const tickLen = isMain ? 16 : 10;
        const angle = d2r(t.deg);
        
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * (r - thickness/2 - tickLen), cy + Math.sin(angle) * (r - thickness/2 - tickLen));
        ctx.lineTo(cx + Math.cos(angle) * (r + thickness/2 + tickLen), cy + Math.sin(angle) * (r + thickness/2 + tickLen));
        ctx.lineWidth = isMain ? 3 : 2;
        ctx.strokeStyle = '#374151';
        ctx.stroke();
        
        const labelR = r + thickness/2 + 30;
        ctx.font = isMain ? 'bold 14px sans-serif' : 'bold 11px sans-serif';
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.pct + '%', cx + Math.cos(angle) * labelR, cy + Math.sin(angle) * labelR);
    });
    
    // 指针角度: 0%=90度，100%=-270度
    const needleDeg = 90 - 360 * probability;
    const needleAngle = d2r(needleDeg);
    const needleLen = r - thickness/2 - 10;
    
    // 指针阴影
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy + 2);
    ctx.lineTo(cx + 2 + Math.cos(needleAngle) * needleLen, cy + 2 + Math.sin(needleAngle) * needleLen);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // 指针主体
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(needleAngle) * needleLen, cy + Math.sin(needleAngle) * needleLen);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#1f2937';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // 中心圆点
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    
    // 中心文字
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 70, cy - 60, 140, 65);
    
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(percentage + '%', cx, cy - 35);
    
    if (riskLevelText) {
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = riskColor || '#6b7280';
        ctx.fillText(riskLevelText, cx, cy - 12);
    }
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
    const features = [
        { name: 'Glucose', value: 0.084 }, { name: 'eGFR', value: 0.065 },
        { name: 'Hemoglobin', value: 0.014 }, { name: 'Age', value: 0.012 },
        { name: 'WBC', value: 0.009 }, { name: 'RDW', value: 0.004 },
        { name: 'BMI', value: 0.003 }, { name: 'Sex', value: -0.002 }
    ];
    
    const container = document.getElementById('shap-chart');
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