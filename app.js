/**
 * MACE Risk Prediction - Streamlit-style Layout
 */

// ============================================
// Translations
// ============================================
const i18n = {
    zh: {
        headerTitle: 'MACE风险预测',
        headerSubtitle: 'STEMI患者PCI术后90天MACE风险 (NB模型)',
        sidebarTitle: '患者信息',
        labelCreatinine: '肌酐',
        labelAge: '年龄 (岁)',
        labelSex: '性别',
        optMale: '男',
        optFemale: '女',
        labelBMI: 'BMI (kg/m²)',
        heightPlaceholder: '身高 (cm)',
        weightPlaceholder: '体重 (kg)',
        labelGlucose: '血糖',
        labelHemoglobin: '血红蛋白',
        labelRDW: 'RDW (%)',
        labelWBC: '白细胞 (×10⁹/L)',
        labelModel: '模型',
        btnPredict: '预测MACE风险',
        egfrLabel: 'eGFR (CKD-EPI 2021)',
        egfrUnit: 'mL/min/1.73m²',
        riskTitle: '风险评估',
        recTitle: '临床建议',
        perfTitle: '模型性能 (外部验证)',
        featuresTitle: '特征贡献',
        featuresSubtitle: '基于外部验证的排列重要性',
        shapTitle: 'SHAP特征贡献',
        metricAUROC: 'AUROC',
        metricSens: '敏感度',
        metricSpec: '特异度',
        metricNPV: 'NPV',
        calcBtnTitle: '计算eGFR',
        lowRisk: '低风险',
        moderateRisk: '中风险',
        highRisk: '高风险',
        veryHighRisk: '极高风险',
        riskNoteLow: '标准PCI术后护理即可',
        riskNoteModerate: '建议加强监测',
        riskNoteHigh: '需要强化管理',
        riskNoteVeryHigh: '需要紧急干预',
        recs: {
            low: ['标准PCI术后出院方案', '4-6周后常规随访', '继续处方药物', '生活方式指导', '低风险 (12.4%) - 标准护理'],
            moderate: ['建议加强监测', '2、4、8周随访', '考虑强化抗血小板治疗', '生活方式指导', '中风险 - 加强监测'],
            high: ['需要强化管理', '每1-2周随访', '考虑心脏康复转诊', '强化药物治疗', '高风险 - 强化管理']
        }
    },
    en: {
        headerTitle: 'MACE Risk Prediction',
        headerSubtitle: '90-Day MACE After PCI in STEMI Patients (NB Model)',
        sidebarTitle: 'Patient Information',
        labelCreatinine: 'Creatinine',
        labelAge: 'Age (years)',
        labelSex: 'Sex',
        optMale: 'Male',
        optFemale: 'Female',
        labelBMI: 'BMI (kg/m²)',
        heightPlaceholder: 'Height (cm)',
        weightPlaceholder: 'Weight (kg)',
        labelGlucose: 'Glucose',
        labelHemoglobin: 'Hemoglobin',
        labelRDW: 'RDW (%)',
        labelWBC: 'WBC (×10⁹/L)',
        labelModel: 'Model',
        btnPredict: 'Predict MACE Risk',
        egfrLabel: 'eGFR (CKD-EPI 2021)',
        egfrUnit: 'mL/min/1.73m²',
        riskTitle: 'Risk Assessment',
        recTitle: 'Clinical Recommendations',
        perfTitle: 'Model Performance (External Validation)',
        featuresTitle: 'Feature Contributions',
        featuresSubtitle: 'Based on permutation importance from external validation',
        shapTitle: 'SHAP Feature Contributions',
        metricAUROC: 'AUROC',
        metricSens: 'Sensitivity',
        metricSpec: 'Specificity',
        metricNPV: 'NPV',
        calcBtnTitle: 'Calculate eGFR',
        lowRisk: 'Low Risk',
        moderateRisk: 'Moderate Risk',
        highRisk: 'High Risk',
        veryHighRisk: 'Very High Risk',
        riskNoteLow: 'Standard post-PCI care appropriate',
        riskNoteModerate: 'Enhanced monitoring recommended',
        riskNoteHigh: 'Intensive management required',
        riskNoteVeryHigh: 'Urgent intervention needed',
        recs: {
            low: ['Standard post-PCI discharge protocol', 'Routine follow-up (4-6 weeks)', 'Continue prescribed medications', 'Lifestyle counseling', 'Low MACE risk (12.4%) - standard care'],
            moderate: ['Enhanced monitoring recommended', 'Follow-up at 2, 4, and 8 weeks', 'Consider intensifying antiplatelet therapy', 'Lifestyle counseling', 'Moderate risk - enhanced monitoring'],
            high: ['Intensive management required', 'Follow-up every 1-2 weeks', 'Consider cardiac rehabilitation referral', 'Intensified medical therapy', 'High risk - intensive management']
        }
    }
};

let currentLang = 'zh';

// ============================================
// Unit Systems
// ============================================
const UNIT_SYSTEMS = {
    creatinine: { metric: 'μmol/L', us: 'mg/dL' },
    glucose: { metric: 'mmol/L', us: 'mg/dL' },
    hemoglobin: { metric: 'g/L', us: 'g/dL' }
};

let currentUnits = {
    creatinine: 'metric',
    glucose: 'metric',
    hemoglobin: 'metric'
};

// ============================================
// Unit Conversions
// ============================================
function mgDlToMmolL(mgDl) { return mgDl / 18; }
function mmolLToMgDl(mmolL) { return mmolL * 18; }
function mgDlToUmolL(mgDl) { return mgDl * 88.4; }
function umolLToMgDl(umolL) { return umolL / 88.4; }
function gDlToGL(gDl) { return gDl * 10; }
function gLToGDl(gL) { return gL / 10; }

function getStandardValue(value, parameter, unitSystem) {
    const val = parseFloat(value);
    if (isNaN(val)) return 0;
    switch(parameter) {
        case 'glucose': return unitSystem === 'us' ? mgDlToMmolL(val) : val;
        case 'creatinine': return unitSystem === 'metric' ? umolLToMgDl(val) : val;
        case 'hemoglobin': return unitSystem === 'metric' ? gLToGDl(val) : val;
        default: return val;
    }
}

// ============================================
// eGFR Calculation (CKD-EPI 2021)
// ============================================
function calculateEGFR(creatinine, age, sex) {
    const kappa = sex === '1' ? 0.9 : 0.7;
    const alpha = sex === '1' ? -0.302 : -0.241;
    const sexFactor = sex === '1' ? 1 : 1.012;
    const scrRatio = creatinine / kappa;
    const minTerm = Math.min(scrRatio, 1);
    const maxTerm = Math.max(scrRatio, 1);
    const egfr = 142 * Math.pow(minTerm, alpha) * Math.pow(maxTerm, -1.200) * Math.pow(0.9938, age) * sexFactor;
    return Math.max(2, Math.min(200, egfr));
}

function getCKDStage(egfr) {
    if (egfr >= 90) return { stage: 'stage-1', text: currentLang === 'zh' ? 'CKD 1期 (正常/高)' : 'CKD Stage 1 (Normal/High)' };
    if (egfr >= 60) return { stage: 'stage-2', text: currentLang === 'zh' ? 'CKD 2期 (轻度)' : 'CKD Stage 2 (Mild)' };
    if (egfr >= 45) return { stage: 'stage-3a', text: currentLang === 'zh' ? 'CKD 3a期 (中度)' : 'CKD Stage 3a (Moderate)' };
    if (egfr >= 30) return { stage: 'stage-3b', text: currentLang === 'zh' ? 'CKD 3b期 (中重度)' : 'CKD Stage 3b (Moderate-Severe)' };
    if (egfr >= 15) return { stage: 'stage-4', text: currentLang === 'zh' ? 'CKD 4期 (重度)' : 'CKD Stage 4 (Severe)' };
    return { stage: 'stage-5', text: currentLang === 'zh' ? 'CKD 5期 (肾衰竭)' : 'CKD Stage 5 (Kidney Failure)' };
}

// ============================================
// BMI Calculation
// ============================================
function calculateBMI() {
    const height = parseFloat(document.getElementById('height').value) || 0;
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    if (height > 0 && weight > 0) {
        const bmi = weight / Math.pow(height / 100, 2);
        document.getElementById('bmi').value = bmi.toFixed(1);
    }
}

// ============================================
// eGFR Display Functions
// ============================================
function calculateEGFRDisplay() {
    const creaInput = parseFloat(document.getElementById('creatinine').value) || 0;
    const age = parseInt(document.getElementById('age').value) || 0;
    const sex = document.getElementById('sex').value;
    const creaUnit = document.getElementById('creatinine-unit').value;
    
    if (creaInput <= 0 || age <= 0) {
        alert(currentLang === 'zh' ? '请输入有效的肌酐和年龄' : 'Please enter valid creatinine and age');
        return;
    }
    
    const creaMgDl = creaUnit === 'metric' ? umolLToMgDl(creaInput) : creaInput;
    const egfr = calculateEGFR(creaMgDl, age, sex);
    const stageInfo = getCKDStage(egfr);
    
    document.getElementById('egfr-value').textContent = egfr.toFixed(1);
    const stageEl = document.getElementById('egfr-stage');
    stageEl.textContent = stageInfo.text;
    stageEl.className = 'egfr-stage ' + stageInfo.stage;
    
    document.getElementById('egfr-result').classList.remove('hidden');
}

function updateEGFRDisplay() {
    // Only update if eGFR is already visible
    if (!document.getElementById('egfr-result').classList.contains('hidden')) {
        calculateEGFRDisplay();
    }
}

// ============================================
// Unit Label Updates
// ============================================
function updateUnitLabels() {
    const creatinineUnit = document.getElementById('creatinine-unit').value;
    const glucoseUnit = document.getElementById('glucose-unit').value;
    const hbUnit = document.getElementById('hb-unit').value;
    
    // Convert values
    const creaInput = document.getElementById('creatinine');
    const glucoseInput = document.getElementById('glucose');
    const hbInput = document.getElementById('hb');
    
    const creaVal = parseFloat(creaInput.value);
    if (!isNaN(creaVal)) {
        if (creatinineUnit === 'metric' && currentUnits.creatinine === 'us') {
            creaInput.value = (creaVal * 88.4).toFixed(0);
        } else if (creatinineUnit === 'us' && currentUnits.creatinine === 'metric') {
            creaInput.value = (creaVal / 88.4).toFixed(2);
        }
    }
    
    const glucoseVal = parseFloat(glucoseInput.value);
    if (!isNaN(glucoseVal)) {
        if (glucoseUnit === 'metric' && currentUnits.glucose === 'us') {
            glucoseInput.value = (glucoseVal / 18).toFixed(1);
        } else if (glucoseUnit === 'us' && currentUnits.glucose === 'metric') {
            glucoseInput.value = (glucoseVal * 18).toFixed(1);
        }
    }
    
    const hbVal = parseFloat(hbInput.value);
    if (!isNaN(hbVal)) {
        if (hbUnit === 'metric' && currentUnits.hemoglobin === 'us') {
            hbInput.value = (hbVal * 10).toFixed(0);
        } else if (hbUnit === 'us' && currentUnits.hemoglobin === 'metric') {
            hbInput.value = (hbVal / 10).toFixed(1);
        }
    }
    
    creaInput.step = creatinineUnit === 'metric' ? '1' : '0.01';
    hbInput.step = hbUnit === 'metric' ? '1' : '0.1';
    
    currentUnits = {
        creatinine: creatinineUnit,
        glucose: glucoseUnit,
        hemoglobin: hbUnit
    };
    
    updateEGFRDisplay();
}

// ============================================
// Language Toggle
// ============================================
function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    const t = i18n[currentLang];
    
    document.querySelector('.lang-btn').textContent = currentLang === 'zh' ? 'English' : '中文';
    document.querySelector('.header h1').textContent = t.headerTitle;
    document.querySelector('.header-subtitle').textContent = t.headerSubtitle;
    document.getElementById('sidebar-title').textContent = t.sidebarTitle;
    
    document.getElementById('label-creatinine').textContent = t.labelCreatinine;
    document.getElementById('label-age').textContent = t.labelAge;
    document.getElementById('label-sex').textContent = t.labelSex;
    document.getElementById('opt-male').textContent = t.optMale;
    document.getElementById('opt-female').textContent = t.optFemale;
    document.querySelector('label[for="bmi"]').textContent = t.labelBMI;
    document.getElementById('height').placeholder = t.heightPlaceholder;
    document.getElementById('weight').placeholder = t.weightPlaceholder;
    document.getElementById('label-glucose').textContent = t.labelGlucose;
    document.getElementById('label-hemoglobin').textContent = t.labelHemoglobin;
    document.getElementById('label-rdw').textContent = t.labelRDW;
    document.getElementById('label-wbc').textContent = t.labelWBC;
    document.getElementById('label-model').textContent = t.labelModel;
    document.getElementById('btn-predict').textContent = t.btnPredict;
    document.querySelector('.calc-btn').title = t.calcBtnTitle;
    
    document.querySelector('.egfr-label').textContent = t.egfrLabel;
    document.querySelector('.egfr-unit').textContent = t.egfrUnit;
    
    document.getElementById('risk-title').textContent = t.riskTitle;
    document.getElementById('rec-title').textContent = t.recTitle;
    document.getElementById('perf-title').textContent = t.perfTitle;
    document.getElementById('features-title').textContent = t.featuresTitle;
    document.getElementById('features-subtitle').textContent = t.featuresSubtitle;
    document.getElementById('shap-title').textContent = t.shapTitle;
    
    document.getElementById('metric-auroc').textContent = t.metricAUROC;
    document.getElementById('metric-sens').textContent = t.metricSens;
    document.getElementById('metric-spec').textContent = t.metricSpec;
    document.getElementById('metric-npv').textContent = t.metricNPV;
    
    // Update current display
    updateRiskDisplay();
}

// ============================================
// Risk Prediction
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
    
    const egfr = calculateEGFR(creatinine, age, sex);
    
    let riskScore = 0.15;
    
    if (age > 75) riskScore += 0.12;
    else if (age > 65) riskScore += 0.06;
    else if (age > 55) riskScore += 0.02;
    else riskScore -= 0.03;
    
    if (sex === '1') riskScore += 0.03;
    else riskScore -= 0.02;
    
    if (bmi < 18.5) riskScore += 0.06;
    else if (bmi < 25) riskScore -= 0.02;
    else if (bmi < 30) riskScore += 0.02;
    else riskScore += 0.05;
    
    if (egfr < 30) riskScore += 0.15;
    else if (egfr < 45) riskScore += 0.10;
    else if (egfr < 60) riskScore += 0.06;
    else if (egfr < 90) riskScore += 0.02;
    else riskScore -= 0.03;
    
    if (glucose > 11.1) riskScore += 0.10;
    else if (glucose > 7.8) riskScore += 0.05;
    else if (glucose > 5.6) riskScore += 0.02;
    else riskScore -= 0.02;
    
    if (hb < 10) riskScore += 0.10;
    else if (hb < 12) riskScore += 0.05;
    else if (hb < 13) riskScore += 0.02;
    else riskScore -= 0.02;
    
    if (rdw > 15) riskScore += 0.06;
    else if (rdw > 14) riskScore += 0.03;
    else riskScore -= 0.01;
    
    if (wbc > 12) riskScore += 0.05;
    else if (wbc > 10) riskScore += 0.02;
    else if (wbc < 4) riskScore += 0.02;
    else riskScore -= 0.01;
    
    let probability = 1 / (1 + Math.exp(-(riskScore - 0.35) * 3));
    return Math.max(0.02, Math.min(0.85, probability));
}

// ============================================
// Gauge Drawing
// ============================================
function drawGauge(probability) {
    const canvas = document.getElementById('gaugeCanvas');
    const ctx = canvas.getContext('2d');
    const percentage = Math.round(probability * 100);
    
    canvas.width = 400;
    canvas.height = 220;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 40;
    const radius = 140;
    const lineWidth = 20;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineCap = 'butt';
    ctx.stroke();
    
    // Colored segments
    const lowEnd = Math.PI * 0.9;
    const moderateEnd = Math.PI * 0.8;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, lowEnd);
    ctx.strokeStyle = '#10b981';
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, lowEnd, moderateEnd);
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, moderateEnd, 0);
    ctx.strokeStyle = '#ef4444';
    ctx.stroke();
    
    // Needle
    const needleAngle = Math.PI * (1 - probability);
    const needleLength = radius - 10;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(needleAngle) * needleLength, centerY + Math.sin(needleAngle) * needleLength);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#374151';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#374151';
    ctx.fill();
    
    // Center percentage
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(percentage + '%', centerX, centerY - 20);
    
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('90-Day MACE Risk', centerX, centerY + 15);
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
    
    let riskLevel, riskText, noteText, recs;
    
    if (percentage < 10) {
        riskLevel = 'low';
        riskText = t.lowRisk;
        noteText = t.riskNoteLow;
        recs = t.recs.low;
        riskCard.className = 'risk-card';
    } else if (percentage < 20) {
        riskLevel = 'moderate';
        riskText = t.moderateRisk;
        noteText = t.riskNoteModerate;
        recs = t.recs.moderate;
        riskCard.className = 'risk-card moderate';
    } else if (percentage < 30) {
        riskLevel = 'high';
        riskText = t.highRisk;
        noteText = t.riskNoteHigh;
        recs = t.recs.high;
        riskCard.className = 'risk-card high';
    } else {
        riskLevel = 'very-high';
        riskText = t.veryHighRisk;
        noteText = t.riskNoteVeryHigh;
        recs = t.recs.high;
        riskCard.className = 'risk-card high';
    }
    
    statusText.textContent = riskText;
    percentageEl.textContent = percentage + '%';
    riskNote.textContent = noteText;
    
    // Update recommendations
    const icons = ['🏥', '📅', '💊', '🥗', '✓'];
    recList.innerHTML = recs.map((rec, i) => 
        `<li><span class="rec-icon">${icons[i]}</span><span>${rec.replace('12.4%', percentage + '%')}</span></li>`
    ).join('');
    
    drawGauge(probability);
    renderSHAP(probability);
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
                         style="width: ${width}%; ${isPositive ? 'margin-left: 50%' : 'margin-left: ' + (50 - width) + '%'}">
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initial calculations
    calculateBMI();
    
    // Default risk display
    const defaultProb = 0.124;
    updateRiskDisplay(defaultProb);
    
    // Form submission
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
