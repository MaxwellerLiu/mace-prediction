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
        thresholdsTitle: '风险分层标准'
    },
    en: {
        sidebarTitle: 'Patient Information', labelAge: 'Age', labelSex: 'Sex',
        optMale: 'Male', optFemale: 'Female', labelBMI: 'BMI',
        labelCreatinine: 'Creatinine', labelGlucose: 'Glucose', labelHb: 'Hemoglobin',
        labelRDW: 'RDW', labelWBC: 'WBC',
        labelModel: 'Model', btnPredict: 'Calculate Risk', btnReset: 'Reset',
        riskTitle: 'Risk Level', lowRisk: 'Low Risk', moderateRisk: 'Moderate Risk',
        highRisk: 'High Risk', veryHighRisk: 'Very High Risk',
        thresholdsTitle: 'Risk Stratification'
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
    document.getElementById('sidebar-title').textContent = t.sidebarTitle;
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
// GAUGE - Clean Implementation
// ============================================
function drawGauge(probability, riskLevelText, riskColor) {
    const canvas = document.getElementById('gaugeCanvas');
    const ctx = canvas.getContext('2d');
    const percentage = Math.round(probability * 100);
    
    // Canvas size
    canvas.width = 500;
    canvas.height = 280;
    
    const cx = canvas.width / 2;
    const cy = canvas.height - 40;
    const r = 170;
    const thickness = 35;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Angle mapping: 0% = Math.PI (180°, left), 100% = 0 (0°, right)
    // Zone boundaries:
    // 0-10%: Math.PI to Math.PI*0.9
    // 10-20%: Math.PI*0.9 to Math.PI*0.8
    // 20-30%: Math.PI*0.8 to Math.PI*0.7
    // 30-100%: Math.PI*0.7 to 0
    
    const zones = [
        { start: Math.PI, end: Math.PI * 0.9, color: '#22c55e', label: 'Low' },      // 0-10% Green
        { start: Math.PI * 0.9, end: Math.PI * 0.8, color: '#fbbf24', label: 'Mod' }, // 10-20% Yellow
        { start: Math.PI * 0.8, end: Math.PI * 0.7, color: '#f97316', label: 'High' }, // 20-30% Orange
        { start: Math.PI * 0.7, end: 0, color: '#ef4444', label: 'VHigh' }            // 30-100% Red
    ];
    
    // Draw each zone as a thick arc
    zones.forEach(z => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, z.start, z.end);
        ctx.lineWidth = thickness;
        ctx.strokeStyle = z.color;
        ctx.lineCap = 'butt';
        ctx.stroke();
    });
    
    // White separators at boundaries (10%, 20%, 30%)
    const separators = [Math.PI * 0.9, Math.PI * 0.8, Math.PI * 0.7];
    separators.forEach(angle => {
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * (r - thickness/2 - 2), cy + Math.sin(angle) * (r - thickness/2 - 2));
        ctx.lineTo(cx + Math.cos(angle) * (r + thickness/2 + 2), cy + Math.sin(angle) * (r + thickness/2 + 2));
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
    });
    
    // Tick marks and labels
    const ticks = [
        { pct: 0, angle: Math.PI },
        { pct: 10, angle: Math.PI * 0.9 },
        { pct: 20, angle: Math.PI * 0.8 },
        { pct: 30, angle: Math.PI * 0.7 },
        { pct: 50, angle: Math.PI * 0.5 },
        { pct: 75, angle: Math.PI * 0.25 },
        { pct: 100, angle: 0 }
    ];
    
    ticks.forEach(t => {
        const isMain = [0, 10, 20, 30, 100].includes(t.pct);
        const tickLen = isMain ? 16 : 10;
        
        // Draw tick
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(t.angle) * (r - thickness/2 - tickLen), cy + Math.sin(t.angle) * (r - thickness/2 - tickLen));
        ctx.lineTo(cx + Math.cos(t.angle) * (r + thickness/2 + tickLen), cy + Math.sin(t.angle) * (r + thickness/2 + tickLen));
        ctx.lineWidth = isMain ? 3 : 2;
        ctx.strokeStyle = '#374151';
        ctx.stroke();
        
        // Draw label
        const labelR = r + thickness/2 + 30;
        ctx.font = isMain ? 'bold 14px sans-serif' : 'bold 11px sans-serif';
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.pct + '%', cx + Math.cos(t.angle) * labelR, cy + Math.sin(t.angle) * labelR);
    });
    
    // Needle pointing to probability
    // probability 0.12 -> angle = Math.PI * (1 - 0.12) = Math.PI * 0.88
    const needleAngle = Math.PI * (1 - probability);
    const needleLen = r - thickness/2 - 10;
    
    // Needle shadow
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy + 2);
    ctx.lineTo(cx + 2 + Math.cos(needleAngle) * needleLen, cy + 2 + Math.sin(needleAngle) * needleLen);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Needle body
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(needleAngle) * needleLen, cy + Math.sin(needleAngle) * needleLen);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#1f2937';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    
    // Center text background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 70, cy - 70, 140, 75);
    
    // Percentage
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(percentage + '%', cx, cy - 45);
    
    // Risk level text
    if (riskLevelText) {
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = riskColor || '#6b7280';
        ctx.fillText(riskLevelText, cx, cy - 20);
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
        noteText = 'Standard treatment recommended';
        recs = ['Standard antiplatelet', 'Regular follow-up', 'Risk control', 'Lifestyle'];
        riskColor = '#22c55e';
        riskCard.className = 'risk-card';
    } else if (pct < RISK_THRESHOLDS.MODERATE) {
        riskText = t.moderateRisk;
        noteText = 'Enhanced monitoring recommended';
        recs = ['Intensified therapy', 'Frequent follow-up', 'Optimize meds', 'Cardiac rehab'];
        riskColor = '#fbbf24';
        riskCard.className = 'risk-card moderate';
    } else if (pct < RISK_THRESHOLDS.HIGH) {
        riskText = t.highRisk;
        noteText = 'Aggressive treatment recommended';
        recs = ['Dual antiplatelet', 'Close monitoring', 'Secondary prevention', 'Specialist referral'];
        riskColor = '#f97316';
        riskCard.className = 'risk-card high';
    } else {
        riskText = t.veryHighRisk;
        noteText = 'Urgent treatment recommended';
        recs = ['Intensive therapy', 'Hospitalization', 'Multidisciplinary', 'Individualized'];
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
    
    document.querySelector('.gauge-with-thresholds').scrollIntoView({ behavior: 'smooth', block: 'center' });
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
