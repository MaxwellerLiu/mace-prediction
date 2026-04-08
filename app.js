// ============================================
// MACE Risk Prediction App
// ============================================

// Risk Thresholds
const RISK_THRESHOLDS = {
    LOW: 10,
    MODERATE: 20,
    HIGH: 30
};

// Current units state
let currentUnits = {
    creatinine: 'metric',
    glucose: 'metric',
    hemoglobin: 'metric'
};

// Current language
let currentLang = 'zh';

// Unit conversion factors
const UNIT_CONVERSIONS = {
    creatinine: { mgDlToUmolL: 88.4 },
    glucose: { mgDlToMmolL: 18 },
    hemoglobin: { gDlToGL: 10 }
};

// Unit systems
const UNIT_SYSTEMS = {
    creatinine: { metric: 'μmol/L', us: 'mg/dL' },
    glucose: { metric: 'mmol/L', us: 'mg/dL' },
    hemoglobin: { metric: 'g/L', us: 'g/dL' }
};

// ============================================
// i18n Translations
// ============================================
const i18n = {
    zh: {
        sidebarTitle: '患者信息',
        labelAge: '年龄',
        labelSex: '性别',
        optMale: '男',
        optFemale: '女',
        labelBMI: 'BMI',
        labelCreatinine: '肌酐',
        labelGlucose: '血糖',
        labelHb: '血红蛋白',
        labelRDW: '红细胞分布宽度',
        labelWBC: '白细胞计数',
        labelModel: '预测模型',
        btnPredict: '计算风险',
        btnReset: '重置',
        riskTitle: '风险等级',
        lowRisk: '低风险',
        moderateRisk: '中风险',
        highRisk: '高风险',
        veryHighRisk: '极高风险',
        riskNoteLow: '建议标准治疗和随访',
        riskNoteModerate: '建议加强监测和干预',
        riskNoteHigh: '建议积极治疗和密切监测',
        riskNoteVeryHigh: '建议紧急处理和专科会诊',
        recTitle: '临床建议',
        recs: {
            low: ['标准抗血小板治疗', '定期门诊随访', '控制危险因素', '生活方式干预'],
            moderate: ['强化抗血小板治疗', '更频繁的随访', '优化药物治疗', '考虑心脏康复'],
            high: ['双重抗血小板治疗', '密切监测', '积极二级预防', '专科会诊'],
            veryHigh: ['强化药物治疗', '住院观察', '多学科会诊', '个体化治疗方案']
        },
        perfTitle: '模型性能',
        metricAUROC: 'AUROC',
        metricSens: '敏感性',
        metricSpec: '特异性',
        metricNPV: '阴性预测值',
        featuresTitle: '风险因子贡献度',
        featuresSubtitle: '基于排列重要性分析',
        shapTitle: 'SHAP值分析',
        egfrResult: 'eGFR',
        literatureTitle: '循证依据',
        refRiskPCI: 'RISK-PCI评分',
        refACC: 'ACC/AHA指南',
        thresholdsTitle: '风险分层标准',
        thresholdLow: '<10% 低风险',
        thresholdModerate: '10-20% 中风险',
        thresholdHigh: '20-30% 高风险',
        thresholdVeryHigh: '≥30% 极高风险'
    },
    en: {
        sidebarTitle: 'Patient Information',
        labelAge: 'Age',
        labelSex: 'Sex',
        optMale: 'Male',
        optFemale: 'Female',
        labelBMI: 'BMI',
        labelCreatinine: 'Creatinine',
        labelGlucose: 'Glucose',
        labelHb: 'Hemoglobin',
        labelRDW: 'RDW',
        labelWBC: 'WBC',
        labelModel: 'Model',
        btnPredict: 'Calculate Risk',
        btnReset: 'Reset',
        riskTitle: 'Risk Level',
        lowRisk: 'Low Risk',
        moderateRisk: 'Moderate Risk',
        highRisk: 'High Risk',
        veryHighRisk: 'Very High Risk',
        riskNoteLow: 'Standard treatment and follow-up recommended',
        riskNoteModerate: 'Enhanced monitoring and intervention recommended',
        riskNoteHigh: 'Aggressive treatment and close monitoring recommended',
        riskNoteVeryHigh: 'Urgent treatment and specialist consultation recommended',
        recTitle: 'Recommendations',
        recs: {
            low: ['Standard antiplatelet therapy', 'Regular outpatient follow-up', 'Risk factor control', 'Lifestyle intervention'],
            moderate: ['Intensified antiplatelet therapy', 'More frequent follow-up', 'Optimize medication', 'Consider cardiac rehab'],
            high: ['Dual antiplatelet therapy', 'Close monitoring', 'Aggressive secondary prevention', 'Specialist consultation'],
            veryHigh: ['Intensive medical therapy', 'Hospitalization', 'Multidisciplinary consultation', 'Individualized treatment']
        },
        perfTitle: 'Model Performance',
        metricAUROC: 'AUROC',
        metricSens: 'Sensitivity',
        metricSpec: 'Specificity',
        metricNPV: 'NPV',
        featuresTitle: 'Risk Factor Contributions',
        featuresSubtitle: 'Based on permutation importance',
        shapTitle: 'SHAP Analysis',
        egfrResult: 'eGFR',
        literatureTitle: 'Evidence Base',
        refRiskPCI: 'RISK-PCI Score',
        refACC: 'ACC/AHA Guidelines',
        thresholdsTitle: 'Risk Stratification',
        thresholdLow: '<10% Low',
        thresholdModerate: '10-20% Moderate',
        thresholdHigh: '20-30% High',
        thresholdVeryHigh: '≥30% Very High'
    }
};

// ============================================
// BMI Calculator
// ============================================
function calculateBMI() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const bmiInput = document.getElementById('bmi');
    
    if (height > 0 && weight > 0) {
        const bmi = weight / ((height / 100) ** 2);
        bmiInput.value = bmi.toFixed(1);
    }
}

// ============================================
// eGFR Calculator (CKD-EPI 2021)
// ============================================
function calculateEGFR(age, sex, creatinineMgDl) {
    const kappa = sex === 'female' ? 0.7 : 0.9;
    const alpha = sex === 'female' ? -0.241 : -0.302;
    const femaleFactor = sex === 'female' ? 1.012 : 1;
    
    let egfr = 142 * Math.min(creatinineMgDl / kappa, 1) ** alpha * 
               Math.max(creatinineMgDl / kappa, 1) ** (-1.200) * 
               0.9938 ** age * femaleFactor;
    
    return egfr;
}

function getCKDStage(egfr) {
    if (egfr >= 90) return { stage: 'G1', desc: 'Normal/High' };
    if (egfr >= 60) return { stage: 'G2', desc: 'Mildly decreased' };
    if (egfr >= 45) return { stage: 'G3a', desc: 'Mildly to moderately decreased' };
    if (egfr >= 30) return { stage: 'G3b', desc: 'Moderately to severely decreased' };
    if (egfr >= 15) return { stage: 'G4', desc: 'Severely decreased' };
    return { stage: 'G5', desc: 'Kidney failure' };
}

// ============================================
// Unit Conversion Functions
// ============================================
function mgDlToMmolL(mgDl) { return mgDl / UNIT_CONVERSIONS.glucose.mgDlToMmolL; }
function mmolLToMgDl(mmolL) { return mmolL * UNIT_CONVERSIONS.glucose.mgDlToMmolL; }
function mgDlToUmolL(mgDl) { return mgDl * UNIT_CONVERSIONS.creatinine.mgDlToUmolL; }
function umolLToMgDl(umolL) { return umolL / UNIT_CONVERSIONS.creatinine.mgDlToUmolL; }
function gDlToGL(gDl) { return gDl * UNIT_CONVERSIONS.hemoglobin.gDlToGL; }
function gLToGDl(gL) { return gL / UNIT_CONVERSIONS.hemoglobin.gDlToGL; }

function getStandardValue(value, type, unitSystem) {
    if (unitSystem === 'us') {
        if (type === 'creatinine') return parseFloat(value);
        if (type === 'glucose') return parseFloat(value);
        if (type === 'hemoglobin') return parseFloat(value);
    } else {
        if (type === 'creatinine') return umolLToMgDl(parseFloat(value));
        if (type === 'glucose') return mmolLToMgDl(parseFloat(value));
        if (type === 'hemoglobin') return gLToGDl(parseFloat(value));
    }
    return parseFloat(value);
}

// ============================================
// Update Unit Labels
// ============================================
function updateUnitLabels() {
    currentUnits.creatinine = document.getElementById('creatinine-unit').value;
    currentUnits.glucose = document.getElementById('glucose-unit').value;
    currentUnits.hemoglobin = document.getElementById('hb-unit').value;
    
    document.getElementById('creatinine-label').textContent = UNIT_SYSTEMS.creatinine[currentUnits.creatinine];
    document.getElementById('glucose-label').textContent = UNIT_SYSTEMS.glucose[currentUnits.glucose];
    document.getElementById('hb-label').textContent = UNIT_SYSTEMS.hemoglobin[currentUnits.hemoglobin];
    
    const creatinineInput = document.getElementById('creatinine');
    const glucoseInput = document.getElementById('glucose');
    const hbInput = document.getElementById('hb');
    
    const currentCreatinine = parseFloat(creatinineInput.value);
    const currentGlucose = parseFloat(glucoseInput.value);
    const currentHb = parseFloat(hbInput.value);
    
    if (!isNaN(currentCreatinine)) {
        creatinineInput.value = currentUnits.creatinine === 'metric' 
            ? (currentCreatinine * UNIT_CONVERSIONS.creatinine.mgDlToUmolL).toFixed(0)
            : (currentCreatinine / UNIT_CONVERSIONS.creatinine.mgDlToUmolL).toFixed(2);
    }
    if (!isNaN(currentGlucose)) {
        glucoseInput.value = currentUnits.glucose === 'metric'
            ? (currentGlucose / UNIT_CONVERSIONS.glucose.mgDlToMmolL).toFixed(1)
            : (currentGlucose * UNIT_CONVERSIONS.glucose.mgDlToMmolL).toFixed(0);
    }
    if (!isNaN(currentHb)) {
        hbInput.value = currentUnits.hemoglobin === 'metric'
            ? (currentHb * UNIT_CONVERSIONS.hemoglobin.gDlToGL).toFixed(0)
            : (currentHb / UNIT_CONVERSIONS.hemoglobin.gDlToGL).toFixed(1);
    }
    
    creatinineInput.step = currentUnits.creatinine === 'metric' ? '1' : '0.01';
    glucoseInput.step = '0.1';
    hbInput.step = currentUnits.hemoglobin === 'metric' ? '1' : '0.1';
}

function getCurrentUnits() {
    return currentUnits;
}

// ============================================
// Toggle Language
// ============================================
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
    document.getElementById('features-title').textContent = t.featuresTitle;
    document.getElementById('features-subtitle').textContent = t.featuresSubtitle;
    document.getElementById('shap-title').textContent = t.shapTitle;
    document.getElementById('thresholds-title').textContent = t.thresholdsTitle;
    document.getElementById('threshold-low').textContent = t.thresholdLow;
    document.getElementById('threshold-moderate').textContent = t.thresholdModerate;
    document.getElementById('threshold-high').textContent = t.thresholdHigh;
    document.getElementById('threshold-veryhigh').textContent = t.thresholdVeryHigh;
}

// ============================================
// Risk Prediction (Naive Bayes Model)
// ============================================
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
    
    let probability = 1 / (1 + Math.exp(-(riskScore - 0.35) * 3));
    return Math.max(0.02, Math.min(0.85, probability));
}

// ============================================
// Gauge Drawing - Fixed Implementation
// ============================================
function drawGauge(probability, riskLevelText, riskColor) {
    const canvas = document.getElementById('gaugeCanvas');
    const ctx = canvas.getContext('2d');
    const percentage = Math.round(probability * 100);
    
    canvas.width = 500;
    canvas.height = 280;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 40;
    const radius = 170;
    const thickness = 35;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Angles: 0% = Math.PI (left, 180deg), 100% = 0 (right, 0deg)
    const angles = {
        p0: Math.PI,          // 0%
        p10: Math.PI * 0.9,   // 10%
        p20: Math.PI * 0.8,   // 20%
        p30: Math.PI * 0.7,   // 30%
        p100: 0               // 100%
    };
    
    // Draw colored zones using thick strokes - each zone is drawn separately
    const zones = [
        { start: angles.p0, end: angles.p10, color: '#22c55e' },    // Green: 0-10%
        { start: angles.p10, end: angles.p20, color: '#fbbf24' },   // Yellow: 10-20%
        { start: angles.p20, end: angles.p30, color: '#f97316' },   // Orange: 20-30%
        { start: angles.p30, end: angles.p100, color: '#ef4444' }   // Red: 30-100%
    ];
    
    zones.forEach(zone => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, zone.start, zone.end);
        ctx.lineWidth = thickness;
        ctx.strokeStyle = zone.color;
        ctx.lineCap = 'butt';
        ctx.stroke();
    });
    
    // White separators at 10%, 20%, 30%
    [angles.p10, angles.p20, angles.p30].forEach(angle => {
        ctx.beginPath();
        ctx.moveTo(
            centerX + Math.cos(angle) * (radius - thickness/2 - 2),
            centerY + Math.sin(angle) * (radius - thickness/2 - 2)
        );
        ctx.lineTo(
            centerX + Math.cos(angle) * (radius + thickness/2 + 2),
            centerY + Math.sin(angle) * (radius + thickness/2 + 2)
        );
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
    });
    
    // Tick marks
    const ticks = [0, 0.1, 0.2, 0.3, 0.5, 0.75, 1.0];
    ticks.forEach(pct => {
        const angle = Math.PI * (1 - pct);
        const isMain = (pct === 0 || pct === 0.1 || pct === 0.2 || pct === 0.3 || pct === 1.0);
        const len = isMain ? 16 : 10;
        
        ctx.beginPath();
        ctx.moveTo(
            centerX + Math.cos(angle) * (radius - thickness/2 - len),
            centerY + Math.sin(angle) * (radius - thickness/2 - len)
        );
        ctx.lineTo(
            centerX + Math.cos(angle) * (radius + thickness/2 + len),
            centerY + Math.sin(angle) * (radius + thickness/2 + len)
        );
        ctx.lineWidth = isMain ? 3 : 2;
        ctx.strokeStyle = '#374151';
        ctx.stroke();
        
        // Labels
        ctx.font = isMain ? 'bold 14px sans-serif' : 'bold 11px sans-serif';
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labelR = radius + thickness/2 + 30;
        ctx.fillText(Math.round(pct * 100) + '%', 
            centerX + Math.cos(angle) * labelR,
            centerY + Math.sin(angle) * labelR
        );
    });
    
    // Needle
    const needleAngle = Math.PI * (1 - probability);
    const needleLen = radius - thickness/2 - 10;
    
    // Shadow
    ctx.beginPath();
    ctx.moveTo(centerX + 2, centerY + 2);
    ctx.lineTo(
        centerX + 2 + Math.cos(needleAngle) * needleLen,
        centerY + 2 + Math.sin(needleAngle) * needleLen
    );
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Needle body
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.cos(needleAngle) * needleLen,
        centerY + Math.sin(needleAngle) * needleLen
    );
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#1f2937';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    
    // Center text background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - 70, centerY - 70, 140, 75);
    
    // Percentage
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(percentage + '%', centerX, centerY - 45);
    
    // Risk level
    if (riskLevelText) {
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = riskColor || '#6b7280';
        ctx.fillText(riskLevelText, centerX, centerY - 20);
    }
}

// ============================================
// Update Risk Display
// ============================================
function updateRiskDisplay(probability) {
    const percentage = Math.round(probability * 100);
    const t = i18n[currentLang];
    
    const riskCard = document.getElementById('risk-card');
    const statusText = document.getElementById('status-text');
    const percentageEl = document.getElementById('risk-percentage');
    const riskNote = document.getElementById('risk-note');
    const recList = document.getElementById('rec-list');
    
    let riskLevel, riskText, noteText, recs, riskColor;
    
    if (percentage < RISK_THRESHOLDS.LOW) {
        riskLevel = 'low';
        riskText = t.lowRisk;
        noteText = t.riskNoteLow;
        recs = t.recs.low;
        riskColor = '#22c55e';
        riskCard.className = 'risk-card';
    } else if (percentage < RISK_THRESHOLDS.MODERATE) {
        riskLevel = 'moderate';
        riskText = t.moderateRisk;
        noteText = t.riskNoteModerate;
        recs = t.recs.moderate;
        riskColor = '#fbbf24';
        riskCard.className = 'risk-card moderate';
    } else if (percentage < RISK_THRESHOLDS.HIGH) {
        riskLevel = 'high';
        riskText = t.highRisk;
        noteText = t.riskNoteHigh;
        recs = t.recs.high;
        riskColor = '#f97316';
        riskCard.className = 'risk-card high';
    } else {
        riskLevel = 'very-high';
        riskText = t.veryHighRisk;
        noteText = t.riskNoteVeryHigh;
        recs = t.recs.veryHigh;
        riskColor = '#ef4444';
        riskCard.className = 'risk-card very-high';
    }
    
    statusText.textContent = riskText;
    percentageEl.textContent = percentage + '%';
    riskNote.textContent = noteText;
    
    // Update recommendations
    const icons = ['💊', '📅', '💉', '🏥'];
    recList.innerHTML = recs.map((rec, i) =>
        `<li><span class="rec-icon">${icons[i]}</span><span>${rec}</span></li>`
    ).join('');

    // Update gauge with risk info
    drawGauge(probability, riskText, riskColor);
    renderSHAP(probability);

    // Scroll to gauge to show result
    document.querySelector('.gauge-with-thresholds').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ============================================
// SHAP Visualization
// ============================================
function renderSHAP(probability) {
    const features = [
        { name: 'Glucose', value: 0.084 },
        { name: 'eGFR', value: 0.065 },
        { name: 'Hemoglobin', value: 0.014 },
        { name: 'Age', value: 0.012 },
        { name: 'WBC', value: 0.009 },
        { name: 'RDW', value: 0.004 },
        { name: 'BMI', value: 0.003 },
        { name: 'Sex', value: -0.002 }
    ];
    
    const container = document.getElementById('shap-chart');
    const maxVal = Math.max(...features.map(f => Math.abs(f.value)));
    
    container.innerHTML = features.map(f => {
        const width = (Math.abs(f.value) / maxVal) * 100;
        const isPositive = f.value > 0;
        const displayVal = (f.value > 0 ? '+' : '') + f.value.toFixed(3);
        
        return `
            <div class="shap-bar">
                <div class="shap-bar-label">${f.name}</div>
                <div class="shap-bar-value">${displayVal}</div>
                <div class="shap-bar-track">
                    <div class="shap-bar-center"></div>
                    <div class="shap-bar-fill ${isPositive ? 'positive' : 'negative'}" 
                         style="width: ${width}%; ${isPositive ? 'margin-left: 50%' : 'margin-left: ' + (50 - width) + '%'}"></div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// Reset Form
// ============================================
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
    
    const defaultProb = 0.124;
    updateRiskDisplay(defaultProb);
}

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    calculateBMI();
    
    const defaultProb = 0.124;
    updateRiskDisplay(defaultProb);
    
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
        
        const probability = predictRisk(data, currentUnits);
        updateRiskDisplay(probability);
    });
});
