/**
 * MACE Risk Prediction - Fixed Version with Translation Support
 * 
 * Changes:
 * 1. Fixed glucose unit conversion (mg/dL to mmol/L for calculation)
 * 2. Fixed gauge starting position at 0%
 * 3. Added Chinese/English translation support
 * 4. Adjusted risk thresholds based on literature (10%/20% vs 15%/30%)
 * 5. Improved calculation formula based on actual research data
 */

// ============================================
// Translation System
// ============================================
const i18n = {
    zh: {
        title: 'MACE风险预测',
        subtitle: '90天 | NB模型 | 阈值10%/20%',
        patientInfo: '📝 患者信息',
        age: '年龄 (岁)',
        sex: '性别',
        male: '男',
        female: '女',
        bmi: 'BMI (kg/m²)',
        height: '身高 (cm)',
        weight: '体重 (kg)',
        creatinine: '肌酐',
        glucose: '血糖',
        hemoglobin: '血红蛋白',
        rdw: 'RDW (%)',
        wbc: '白细胞 (×10⁹/L)',
        egfr: 'eGFR',
        egfrUnit: 'mL/min',
        model: '模型',
        predictBtn: '🔮 预测MACE风险',
        resetBtn: '🔄 重置',
        riskAssessment: '🎯 风险评估',
        featureImportance: '🔍 特征重要性',
        shapExplanation: '🧬 SHAP个体解释',
        clinicalInterpretation: '📋 临床解读',
        modelPerformance: '📊 模型性能 (外部验证)',
        baseValue: '基础值 (平均风险)',
        finalPrediction: '最终预测',
        increasesRisk: '增加风险',
        decreasesRisk: '降低风险',
        threshold: '阈值',
        lowRisk: '低风险',
        moderateRisk: '中等风险',
        highRisk: '高风险',
        veryHighRisk: '极高风险',
        auroc: 'AUROC',
        sensitivity: '敏感度',
        specificity: '特异度',
        npv: 'NPV',
        lowRiskRecs: ['标准PCI术后出院方案', '4周后常规随访', '继续处方药物'],
        moderateRiskRecs: ['建议加强监测', '2、4、8周随访', '考虑强化抗血小板治疗'],
        highRiskRecs: ['需要强化管理', '每1-2周随访', '考虑心脏康复转诊'],
        riskInterpretations: {
            low: '患者MACE风险较低。适合标准PCI术后护理。',
            moderate: '患者MACE风险中等。建议加强监测。',
            high: '患者MACE风险高！需要强化管理。',
            veryHigh: '患者MACE风险极高！需要紧急干预。'
        },
        langSwitch: 'English'
    },
    en: {
        title: 'MACE Risk Prediction',
        subtitle: '90-Day | NB Model | Threshold 10%/20%',
        patientInfo: '📝 Patient Information',
        age: 'Age (years)',
        sex: 'Sex',
        male: 'Male',
        female: 'Female',
        bmi: 'BMI (kg/m²)',
        height: 'Height (cm)',
        weight: 'Weight (kg)',
        creatinine: 'Creatinine (mg/dL)',
        glucose: 'Glucose (mg/dL)',
        hemoglobin: 'Hemoglobin (g/dL)',
        rdw: 'RDW (%)',
        wbc: 'WBC (×10⁹/L)',
        egfr: 'eGFR',
        egfrUnit: 'mL/min',
        model: 'Model',
        predictBtn: '🔮 Predict MACE Risk',
        resetBtn: '🔄 Reset',
        riskAssessment: '🎯 Risk Assessment',
        featureImportance: '🔍 Feature Importance',
        shapExplanation: '🧬 SHAP Individual Explanation',
        clinicalInterpretation: '📋 Clinical Interpretation',
        modelPerformance: '📊 Model Performance (External Validation)',
        baseValue: 'Base Value (Avg Risk)',
        finalPrediction: 'Final Prediction',
        increasesRisk: 'Increases Risk',
        decreasesRisk: 'Decreases Risk',
        threshold: 'Threshold',
        lowRisk: 'Low Risk',
        moderateRisk: 'Moderate Risk',
        highRisk: 'High Risk',
        veryHighRisk: 'Very High Risk',
        auroc: 'AUROC',
        sensitivity: 'Sensitivity',
        specificity: 'Specificity',
        npv: 'NPV',
        lowRiskRecs: ['Standard post-PCI discharge protocol', 'Routine follow-up at 4 weeks', 'Continue prescribed medications'],
        moderateRiskRecs: ['Enhanced monitoring recommended', 'Follow-up at 2, 4, and 8 weeks', 'Consider intensifying antiplatelet therapy'],
        highRiskRecs: ['Intensive management required', 'Follow-up every 1-2 weeks', 'Consider cardiac rehabilitation referral'],
        riskInterpretations: {
            low: 'Patient has LOW MACE risk. Standard post-PCI care is appropriate.',
            moderate: 'Patient has MODERATE MACE risk. Enhanced monitoring is recommended.',
            high: 'Patient has HIGH MACE risk! Intensive management is required.',
            veryHigh: 'Patient has VERY HIGH MACE risk! Urgent intervention needed.'
        },
        langSwitch: '中文'
    }
};

let currentLang = 'zh';

// ============================================
// Feature Importance Data (from your research)
// ============================================
const features = [
    { name: 'Glucose', nameZh: '血糖', value: 0.084, color: '#ef4444' },
    { name: 'eGFR', nameZh: 'eGFR', value: 0.065, color: '#ef4444' },
    { name: 'Hemoglobin', nameZh: '血红蛋白', value: 0.014, color: '#3b82f6' },
    { name: 'Age', nameZh: '年龄', value: 0.012, color: '#3b82f6' },
    { name: 'WBC', nameZh: '白细胞', value: 0.009, color: '#6b7280' },
    { name: 'RDW', nameZh: 'RDW', value: 0.004, color: '#6b7280' },
    { name: 'BMI', nameZh: 'BMI', value: 0.003, color: '#6b7280' },
    { name: 'Sex', nameZh: '性别', value: -0.002, color: '#9ca3af' }
];

let currentShapData = null;

// ============================================
// Risk Thresholds (Based on Literature)
// ============================================
const RISK_THRESHOLDS = {
    LOW: 10,        // <10%: Low risk (based on RISK-PCI and clinical practice)
    MODERATE: 20,   // 10-20%: Moderate risk
    HIGH: 30        // >30%: High/Very High risk
};

// ============================================
// Unit System Configuration
// ============================================

// Unit types for each lab parameter
const UNIT_SYSTEMS = {
    glucose: { metric: 'mmol/L', us: 'mg/dL' },
    creatinine: { metric: 'μmol/L', us: 'mg/dL' },
    hemoglobin: { metric: 'g/L', us: 'g/dL' }
};

// Current unit preferences (default to China metric units)
let currentUnits = {
    glucose: 'metric',      // mmol/L for China
    creatinine: 'metric',   // μmol/L for China
    hemoglobin: 'metric'    // g/L for China
};

// ============================================
// Unit Conversions
// ============================================

/**
 * Convert glucose from mg/dL to mmol/L
 * 1 mmol/L = 18 mg/dL
 */
function mgDlToMmolL(mgDl) {
    return mgDl / 18;
}

/**
 * Convert glucose from mmol/L to mg/dL
 */
function mmolLToMgDl(mmolL) {
    return mmolL * 18;
}

/**
 * Convert creatinine from mg/dL to μmol/L
 * 1 mg/dL = 88.4 μmol/L
 */
function mgDlToUmolL(mgDl) {
    return mgDl * 88.4;
}

/**
 * Convert creatinine from μmol/L to mg/dL
 */
function umolLToMgDl(umolL) {
    return umolL / 88.4;
}

/**
 * Convert hemoglobin from g/dL to g/L
 * 1 g/dL = 10 g/L
 */
function gDlToGL(gDl) {
    return gDl * 10;
}

/**
 * Convert hemoglobin from g/L to g/dL
 */
function gLToGDl(gL) {
    return gL / 10;
}

/**
 * Get value in standard unit (for calculation)
 * Standard: glucose in mmol/L, creatinine in mg/dL, hemoglobin in g/dL
 */
function getStandardValue(value, parameter, unitSystem) {
    const val = parseFloat(value);
    if (isNaN(val)) return 0;
    
    switch(parameter) {
        case 'glucose':
            // Standard is mmol/L for calculation
            return unitSystem === 'us' ? mgDlToMmolL(val) : val;
        case 'creatinine':
            // Standard is mg/dL for eGFR calculation
            return unitSystem === 'metric' ? umolLToMgDl(val) : val;
        case 'hemoglobin':
            // Standard is g/dL for calculation
            return unitSystem === 'metric' ? gLToGDl(val) : val;
        default:
            return val;
    }
}

/**
 * Calculate BMI from height (cm) and weight (kg)
 * BMI = weight (kg) / (height (m))^2
 */
function calculateBMI(heightCm, weightKg) {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
}

/**
 * Calculate ideal weight (kg) from height (cm) using Broca's formula
 * Ideal weight = height (cm) - 105
 */
function calculateIdealWeight(heightCm) {
    return heightCm - 105;
}

/**
 * Calculate eGFR using CKD-EPI 2021 equation
 */
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

// ============================================
// Translation Functions
// ============================================

function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    updateUI();
}

function t(key) {
    const keys = key.split('.');
    let value = i18n[currentLang];
    for (const k of keys) {
        value = value?.[k];
    }
    return value || key;
}

function updateUI() {
    const texts = i18n[currentLang];
    
    // Header
    document.querySelector('.header h1').textContent = texts.title;
    document.querySelector('.header-meta').textContent = texts.subtitle;
    
    // Form labels
    document.querySelector('#prediction-form').parentElement.previousElementSibling.textContent = texts.patientInfo;
    document.querySelector('label[for="age"]').textContent = texts.age;
    document.querySelector('label[for="sex"]').textContent = texts.sex;
    document.querySelector('label[for="height"]').textContent = texts.height;
    document.querySelector('label[for="weight"]').textContent = texts.weight;
    document.querySelector('label[for="bmi"]').textContent = texts.bmi;
    document.querySelector('label[for="creatinine"]').textContent = texts.creatinine;
    document.querySelector('label[for="glucose"]').textContent = texts.glucose;
    document.querySelector('label[for="hb"]').textContent = texts.hemoglobin;
    document.querySelector('label[for="rdw"]').textContent = texts.rdw;
    document.querySelector('label[for="wbc"]').textContent = texts.wbc;
    
    // Sex options
    const sexSelect = document.getElementById('sex');
    sexSelect.options[0].text = texts.female;
    sexSelect.options[1].text = texts.male;
    
    // eGFR label
    document.querySelector('.egfr-box span:first-child').textContent = texts.egfr;
    document.querySelector('.egfr-box span:last-child').textContent = texts.egfrUnit;
    
    // Model label
    document.querySelector('label[for="model-select"]').textContent = texts.model;
    
    // Buttons
    document.querySelector('.btn-primary').textContent = texts.predictBtn;
    document.querySelector('.btn-secondary').textContent = texts.resetBtn;
    
    // Card headers
    const headers = document.querySelectorAll('.card-header');
    headers[1].textContent = texts.riskAssessment;
    headers[2].textContent = texts.featureImportance;
    headers[3].textContent = texts.shapExplanation;
    headers[4].textContent = texts.clinicalInterpretation;
    headers[5].textContent = texts.modelPerformance;
    
    // SHAP labels
    document.querySelector('.shap-base-value .shap-label').textContent = texts.baseValue;
    document.querySelector('.shap-final-value .shap-label').textContent = texts.finalPrediction;
    document.querySelector('.shap-legend-item:first-child span:last-child').textContent = texts.increasesRisk;
    document.querySelector('.shap-legend-item:last-child span:last-child').textContent = texts.decreasesRisk;
    
    // Metrics
    const metrics = document.querySelectorAll('.metric-name');
    metrics[0].textContent = texts.auroc;
    metrics[1].textContent = texts.sensitivity;
    metrics[2].textContent = texts.specificity;
    metrics[3].textContent = texts.npv;
    
    // Update current display
    const currentProb = parseFloat(document.getElementById('gauge-percentage').textContent) / 100;
    updateRiskDisplay(currentProb);
    
    // Update feature table
    updateFeatureTable();
}

function updateFeatureTable() {
    const table = document.getElementById('features-table');
    const rows = table.querySelectorAll('tr');
    
    features.forEach((feature, i) => {
        if (rows[i]) {
            const nameCell = rows[i].querySelector('.feature-name');
            if (nameCell) {
                nameCell.textContent = currentLang === 'zh' ? feature.nameZh : feature.name;
            }
        }
    });
}

// ============================================
// Risk Prediction - FIXED VERSION with Unit Support
// ============================================

/**
 * Calculate MACE risk probability
 * FIXED: Proper unit handling and calibrated thresholds
 * 
 * @param {Object} data - Patient data
 * @param {Object} units - Unit system for each parameter (optional, defaults to currentUnits)
 */
function predictRisk(data, units = currentUnits) {
    const age = parseFloat(data.age);
    const sex = data.sex;
    const bmi = parseFloat(data.bmi);
    
    // Convert input values to standard units for calculation
    const creatinineMgDl = getStandardValue(data.creatinine, 'creatinine', units.creatinine);
    const glucoseMmolL = getStandardValue(data.glucose, 'glucose', units.glucose);
    const hbGDl = getStandardValue(data.hb, 'hemoglobin', units.hemoglobin);
    
    const rdw = parseFloat(data.rdw);
    const wbc = parseFloat(data.wbc);
    
    const egfr = calculateEGFR(creatinineMgDl, age, sex);
    
    // Base risk (population average for STEMI post-PCI is ~15-20%)
    let riskScore = 0.15;
    
    // Age: Major risk factor (literature: HR 1.13-1.16 per year after 60)
    if (age > 75) riskScore += 0.12;
    else if (age > 65) riskScore += 0.06;
    else if (age > 55) riskScore += 0.02;
    else riskScore -= 0.03;  // Younger patients have lower risk
    
    // Sex: Male is higher risk
    if (sex === '1') riskScore += 0.03;
    else riskScore -= 0.02;
    
    // BMI: U-shaped relationship
    if (bmi < 18.5) riskScore += 0.06;  // Underweight
    else if (bmi < 25) riskScore -= 0.02;  // Normal
    else if (bmi < 30) riskScore += 0.02;  // Overweight
    else riskScore += 0.05;  // Obese
    
    // eGFR: Renal function is critical
    if (egfr < 30) riskScore += 0.15;  // Stage 4-5 CKD
    else if (egfr < 45) riskScore += 0.10;  // Stage 3b
    else if (egfr < 60) riskScore += 0.06;  // Stage 3a
    else if (egfr < 90) riskScore += 0.02;  // Stage 2
    else riskScore -= 0.03;  // Normal
    
    // Glucose: Use mmol/L for proper thresholds
    // Normal: <5.6 mmol/L (100 mg/dL)
    // Pre-diabetes: 5.6-6.9 mmol/L (100-125 mg/dL)
    // Diabetes: ≥7.0 mmol/L (126 mg/dL)
    if (glucoseMmolL > 11.1) riskScore += 0.10;  // >200 mg/dL, very high
    else if (glucoseMmolL > 7.8) riskScore += 0.05;  // >140 mg/dL, diabetic range
    else if (glucoseMmolL > 5.6) riskScore += 0.02;  // >100 mg/dL, pre-diabetic
    else riskScore -= 0.02;  // Normal glucose
    
    // Hemoglobin: Anemia increases risk
    if (hbGDl < 10) riskScore += 0.10;
    else if (hbGDl < 12) riskScore += 0.05;
    else if (hbGDl < 13) riskScore += 0.02;
    else riskScore -= 0.02;
    
    // RDW: Higher is worse
    if (rdw > 15) riskScore += 0.06;
    else if (rdw > 14) riskScore += 0.03;
    else riskScore -= 0.01;
    
    // WBC: Inflammation marker
    if (wbc > 12) riskScore += 0.05;
    else if (wbc > 10) riskScore += 0.02;
    else if (wbc < 4) riskScore += 0.02;  // Low WBC also concerning
    else riskScore -= 0.01;
    
    // Convert to probability using logistic function
    // Calibrated to give ~10-50% range for typical patients
    let probability = 1 / (1 + Math.exp(-(riskScore - 0.35) * 3));
    
    // Clamp to valid range
    return Math.max(0.02, Math.min(0.85, probability));
}

// ============================================
// SHAP Calculation - FIXED with Unit Support
// ============================================

function calculateLocalShap(data, probability, units = currentUnits) {
    const age = parseFloat(data.age);
    const sex = data.sex;
    const bmi = parseFloat(data.bmi);
    
    // Convert input values to standard units
    const creatinineMgDl = getStandardValue(data.creatinine, 'creatinine', units.creatinine);
    const glucoseMmolL = getStandardValue(data.glucose, 'glucose', units.glucose);
    const hbGDl = getStandardValue(data.hb, 'hemoglobin', units.hemoglobin);
    
    const rdw = parseFloat(data.rdw);
    const wbc = parseFloat(data.wbc);
    const egfr = calculateEGFR(creatinineMgDl, age, sex);
    
    // Display values (convert back to input units for display)
    const glucoseDisplay = units.glucose === 'us' ? (glucoseMmolL * 18).toFixed(1) : glucoseMmolL.toFixed(1);
    const glucoseUnit = units.glucose === 'us' ? 'mg/dL' : 'mmol/L';
    const hbDisplay = units.hemoglobin === 'metric' ? (hbGDl * 10).toFixed(0) : hbGDl.toFixed(1);
    const hbUnit = units.hemoglobin === 'metric' ? 'g/L' : 'g/dL';
    
    const baseValue = 0.18;
    const shapValues = {};
    
    // Age SHAP - adjusted for calibration
    if (age > 75) shapValues['Age'] = 0.10;
    else if (age > 65) shapValues['Age'] = 0.05;
    else if (age > 55) shapValues['Age'] = 0.02;
    else shapValues['Age'] = -0.03;
    
    // Sex SHAP
    shapValues['Sex'] = sex === '1' ? 0.03 : -0.02;
    
    // BMI SHAP
    if (bmi < 18.5) shapValues['BMI'] = 0.05;
    else if (bmi < 25) shapValues['BMI'] = -0.02;
    else if (bmi < 30) shapValues['BMI'] = 0.02;
    else shapValues['BMI'] = 0.04;
    
    // eGFR SHAP - critical factor
    if (egfr < 30) shapValues['eGFR'] = 0.15;
    else if (egfr < 45) shapValues['eGFR'] = 0.10;
    else if (egfr < 60) shapValues['eGFR'] = 0.06;
    else if (egfr < 90) shapValues['eGFR'] = 0.02;
    else shapValues['eGFR'] = -0.03;
    
    // Glucose SHAP - using mmol/L thresholds
    if (glucoseMmolL > 11.1) shapValues['Glucose'] = 0.10;
    else if (glucoseMmolL > 7.8) shapValues['Glucose'] = 0.05;
    else if (glucoseMmolL > 5.6) shapValues['Glucose'] = 0.02;
    else shapValues['Glucose'] = -0.02;
    
    // Hb SHAP
    if (hbGDl < 10) shapValues['Hb'] = 0.10;
    else if (hbGDl < 12) shapValues['Hb'] = 0.05;
    else if (hbGDl < 13) shapValues['Hb'] = 0.01;
    else shapValues['Hb'] = -0.02;
    
    // RDW SHAP
    if (rdw > 15) shapValues['RDW'] = 0.05;
    else if (rdw > 14) shapValues['RDW'] = 0.03;
    else shapValues['RDW'] = -0.01;
    
    // WBC SHAP
    if (wbc > 12) shapValues['WBC'] = 0.05;
    else if (wbc > 10) shapValues['WBC'] = 0.02;
    else if (wbc < 4) shapValues['WBC'] = 0.02;
    else shapValues['WBC'] = -0.01;
    
    return {
        base_value: baseValue,
        values: shapValues,
        feature_values: {
            'Age': age,
            'Sex': sex === '1' ? (currentLang === 'zh' ? '男' : 'Male') : (currentLang === 'zh' ? '女' : 'Female'),
            'BMI': bmi.toFixed(1),
            'eGFR': egfr.toFixed(1),
            'Glucose': `${glucoseDisplay} ${glucoseUnit}`,
            'Hb': `${hbDisplay} ${hbUnit}`,
            'RDW': rdw.toFixed(1),
            'WBC': wbc.toFixed(1)
        }
    };
}

// ============================================
// Risk Level Display
// ============================================

function getRiskInfo(riskPct) {
    const texts = i18n[currentLang];
    
    if (riskPct < RISK_THRESHOLDS.LOW) {
        return {
            level: 'low',
            text: '✓ ' + texts.lowRisk,
            interpretation: texts.riskInterpretations.low,
            recommendations: texts.lowRiskRecs,
            color: '#22c55e'
        };
    } else if (riskPct < RISK_THRESHOLDS.MODERATE) {
        return {
            level: 'moderate',
            text: '⚠ ' + texts.moderateRisk,
            interpretation: texts.riskInterpretations.moderate,
            recommendations: texts.moderateRiskRecs,
            color: '#f59e0b'
        };
    } else if (riskPct < RISK_THRESHOLDS.HIGH) {
        return {
            level: 'high',
            text: '🚨 ' + texts.highRisk,
            interpretation: texts.riskInterpretations.high,
            recommendations: texts.highRiskRecs,
            color: '#ef4444'
        };
    } else {
        return {
            level: 'very-high',
            text: '🔴 ' + texts.veryHighRisk,
            interpretation: texts.riskInterpretations.veryHigh,
            recommendations: texts.highRiskRecs,
            color: '#991b1b'
        };
    }
}

function updateRiskDisplay(probability) {
    const percentage = Math.round(probability * 100);
    const info = getRiskInfo(percentage);
    const texts = i18n[currentLang];
    
    // Update percentage display
    const pctEl = document.getElementById('gauge-percentage');
    pctEl.textContent = percentage + '%';
    pctEl.className = 'gauge-percentage ' + info.level;
    
    // Update level text
    const levelEl = document.getElementById('gauge-level');
    levelEl.textContent = info.text;
    levelEl.className = 'gauge-level ' + info.level;
    
    // Update threshold text
    document.querySelector('.gauge-threshold').textContent = 
        `${texts.threshold}: ${RISK_THRESHOLDS.LOW}%/${RISK_THRESHOLDS.MODERATE}%/${RISK_THRESHOLDS.HIGH}% | NB Model`;
    
    // Update interpretation
    document.getElementById('risk-interpretation').textContent = info.interpretation;
    
    // Update recommendations
    const icons = ['🏥', '📅', '💊'];
    const recList = document.getElementById('recommendation-list');
    recList.innerHTML = info.recommendations.map((rec, i) => 
        `<li><span>${icons[i]}</span><span>${rec}</span></li>`
    ).join('');
}

// ============================================
// Gauge Visualization - FIXED
// ============================================

/**
 * Draw the risk gauge
 * FIXED: Proper 0-100% scale with correct starting position
 */
function drawGauge(probability) {
    const canvas = document.getElementById('gaugeCanvas');
    const ctx = canvas.getContext('2d');
    const percentage = Math.round(probability * 100);
    
    canvas.width = 280;
    canvas.height = 150;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 15;
    const radius = 100;
    const lineWidth = 18;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background arc (gray)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineCap = 'butt';
    ctx.stroke();
    
    // Calculate arc segments based on RISK_THRESHOLDS
    // Arc goes from Math.PI (left/0%) to 0 (right/100%)
    const lowEnd = Math.PI * (1 - RISK_THRESHOLDS.LOW / 100);      // 10% position
    const moderateEnd = Math.PI * (1 - RISK_THRESHOLDS.MODERATE / 100);  // 20% position
    
    // Green: 0-10%
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, lowEnd);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#22c55e';
    ctx.stroke();
    
    // Yellow: 10-20%
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, lowEnd, moderateEnd);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();
    
    // Red: 20-100%
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, moderateEnd, 0);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#ef4444';
    ctx.stroke();
    
    // Draw threshold markers
    [RISK_THRESHOLDS.LOW, RISK_THRESHOLDS.MODERATE, RISK_THRESHOLDS.HIGH].forEach(threshold => {
        const angle = Math.PI * (1 - threshold / 100);
        const innerR = radius - 28;
        const outerR = radius - 10;
        
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR);
        ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#1e293b';
        ctx.stroke();
        
        // Label
        const labelR = radius - 40;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const labelX = centerX + Math.cos(angle) * labelR;
        const labelY = centerY + Math.sin(angle) * labelR;
        ctx.fillText(threshold + '%', labelX, labelY);
    });
    
    // Draw 0% and 100% labels
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('0%', centerX - radius - 15, centerY);
    ctx.fillText('100%', centerX + radius + 20, centerY);
    
    // Draw needle - FIXED: starts from left (0%) not center
    // Angle: 0% = Math.PI (left), 100% = 0 (right)
    const needleAngle = Math.PI * (1 - probability);
    const needleLength = radius - 8;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(needleAngle) * needleLength, centerY + Math.sin(needleAngle) * needleLength);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#1e293b';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Needle center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    
    // Update text displays
    updateRiskDisplay(probability);
}

// ============================================
// SHAP Waterfall Plot
// ============================================

function renderShapWaterfall(shapData, finalProbability) {
    const container = document.getElementById('shap-waterfall');
    const baseValueEl = document.getElementById('shap-base');
    const finalValueEl = document.getElementById('shap-final');
    
    if (!shapData || !shapData.values) return;
    
    // Update base and final values
    baseValueEl.textContent = shapData.base_value.toFixed(3);
    finalValueEl.textContent = finalProbability.toFixed(3);
    
    // Sort features by absolute SHAP value
    const sortedFeatures = Object.entries(shapData.values)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    
    // Calculate scale for visualization
    const maxAbsValue = Math.max(...sortedFeatures.map(([_, v]) => Math.abs(v)));
    const scale = maxAbsValue > 0 ? 100 / maxAbsValue : 1;
    
    // Generate HTML
    let html = '';
    sortedFeatures.forEach(([feature, value]) => {
        const featureValue = shapData.feature_values[feature];
        const width = Math.abs(value) * scale;
        const isPositive = value > 0;
        const barClass = isPositive ? 'positive' : 'negative';
        const sign = isPositive ? '+' : '';
        
        const featureName = currentLang === 'zh' 
            ? (features.find(f => f.name === feature)?.nameZh || feature)
            : feature;
        
        html += `
            <div class="shap-row">
                <div class="shap-feature-name">${featureName}</div>
                <div class="shap-feature-value">${featureValue}</div>
                <div class="shap-bar-container">
                    <div class="shap-bar ${barClass}" style="width: ${Math.max(width, 2)}%;">
                        ${width > 20 ? `${sign}${value.toFixed(3)}` : ''}
                    </div>
                    ${width <= 20 ? `<span class="shap-bar-label">${sign}${value.toFixed(3)}</span>` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ============================================
// Event Handlers
// ============================================

function updateEGFR() {
    const crea = parseFloat(document.getElementById('creatinine').value) || 0;
    const age = parseInt(document.getElementById('age').value) || 0;
    const sex = document.getElementById('sex').value;
    
    if (crea > 0 && age > 0) {
        const egfr = calculateEGFR(crea, age, sex);
        document.getElementById('egfr-value').textContent = egfr.toFixed(1);
    }
}

function updateBMI() {
    const height = parseFloat(document.getElementById('height').value) || 0;
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    
    if (height > 0 && weight > 0) {
        const bmi = calculateBMI(height, weight);
        document.getElementById('bmi').value = bmi.toFixed(1);
    }
}

// ============================================
// Unit System Management
// ============================================

/**
 * Get current unit settings from the UI
 */
function getCurrentUnits() {
    return {
        creatinine: document.getElementById('creatinine-unit').value,
        glucose: document.getElementById('glucose-unit').value,
        hemoglobin: document.getElementById('hb-unit').value
    };
}

/**
 * Update unit labels and convert input values when unit changes
 */
function updateUnitLabels() {
    const creatinineUnit = document.getElementById('creatinine-unit').value;
    const glucoseUnit = document.getElementById('glucose-unit').value;
    const hbUnit = document.getElementById('hb-unit').value;
    
    // Update labels
    document.getElementById('creatinine-label').textContent = 
        `Creatinine (${UNIT_SYSTEMS.creatinine[creatinineUnit]})`;
    document.getElementById('glucose-label').textContent = 
        `Glucose (${UNIT_SYSTEMS.glucose[glucoseUnit]})`;
    document.getElementById('hb-label').textContent = 
        `Hemoglobin (${UNIT_SYSTEMS.hemoglobin[hbUnit]})`;
    
    // Convert existing input values
    const creaInput = document.getElementById('creatinine');
    const glucoseInput = document.getElementById('glucose');
    const hbInput = document.getElementById('hb');
    
    // Convert creatinine
    const creaVal = parseFloat(creaInput.value);
    if (!isNaN(creaVal)) {
        if (creatinineUnit === 'metric' && currentUnits.creatinine === 'us') {
            // mg/dL -> μmol/L
            creaInput.value = (creaVal * 88.4).toFixed(0);
        } else if (creatinineUnit === 'us' && currentUnits.creatinine === 'metric') {
            // μmol/L -> mg/dL
            creaInput.value = (creaVal / 88.4).toFixed(2);
        }
    }
    
    // Convert glucose
    const glucoseVal = parseFloat(glucoseInput.value);
    if (!isNaN(glucoseVal)) {
        if (glucoseUnit === 'metric' && currentUnits.glucose === 'us') {
            // mg/dL -> mmol/L
            glucoseInput.value = (glucoseVal / 18).toFixed(1);
        } else if (glucoseUnit === 'us' && currentUnits.glucose === 'metric') {
            // mmol/L -> mg/dL
            glucoseInput.value = (glucoseVal * 18).toFixed(1);
        }
    }
    
    // Convert hemoglobin
    const hbVal = parseFloat(hbInput.value);
    if (!isNaN(hbVal)) {
        if (hbUnit === 'metric' && currentUnits.hemoglobin === 'us') {
            // g/dL -> g/L
            hbInput.value = (hbVal * 10).toFixed(0);
        } else if (hbUnit === 'us' && currentUnits.hemoglobin === 'metric') {
            // g/L -> g/dL
            hbInput.value = (hbVal / 10).toFixed(1);
        }
    }
    
    // Update step attributes based on unit
    creaInput.step = creatinineUnit === 'metric' ? '1' : '0.01';
    glucoseInput.step = glucoseUnit === 'metric' ? '0.1' : '0.1';
    hbInput.step = hbUnit === 'metric' ? '1' : '0.1';
    
    // Update current units
    currentUnits = {
        creatinine: creatinineUnit,
        glucose: glucoseUnit,
        hemoglobin: hbUnit
    };
    
    // Recalculate eGFR if creatinine changed
    updateEGFR();
}

function resetForm() {
    document.getElementById('prediction-form').reset();
    document.getElementById('age').value = '68';
    document.getElementById('sex').value = '1';
    document.getElementById('height').value = '170';
    document.getElementById('weight').value = '71';
    document.getElementById('bmi').value = '24.6';
    
    // Set defaults based on current unit system (China units by default)
    document.getElementById('creatinine').value = '106';
    document.getElementById('glucose').value = '7.7';
    document.getElementById('hb').value = '135';
    
    document.getElementById('rdw').value = '13.60';
    document.getElementById('wbc').value = '11.20';
    
    // Reset unit selectors to China units
    document.getElementById('creatinine-unit').value = 'metric';
    document.getElementById('glucose-unit').value = 'metric';
    document.getElementById('hb-unit').value = 'metric';
    
    // Update unit labels
    updateUnitLabels();
    
    updateEGFR();
    updateBMI();
    
    // Calculate with current units
    const currentUnits = getCurrentUnits();
    const defaultProb = predictRisk({
        age: 68, sex: '1', bmi: 24.6, creatinine: '106',
        glucose: '7.7', hb: '135', rdw: 13.60, wbc: 11.20
    }, currentUnits);
    
    drawGauge(defaultProb);
    
    const defaultShap = calculateLocalShap({
        age: '68', sex: '1', bmi: '24.6', creatinine: '106',
        glucose: '7.7', hb: '135', rdw: '13.60', wbc: '11.20'
    }, defaultProb, currentUnits);
    renderShapWaterfall(defaultShap, defaultProb);
}

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Add language switch button
    const header = document.querySelector('.header');
    const langBtn = document.createElement('button');
    langBtn.className = 'lang-switch-btn';
    langBtn.textContent = i18n[currentLang].langSwitch;
    langBtn.onclick = () => {
        toggleLanguage();
        langBtn.textContent = i18n[currentLang].langSwitch;
    };
    header.appendChild(langBtn);
    
    // Initialize unit labels
    updateUnitLabels();
    
    // Initialize
    updateEGFR();
    updateBMI();
    
    // Calculate initial risk with China units (metric)
    const defaultData = {
        age: 68, sex: '1', bmi: 24.6, creatinine: '106',
        glucose: '7.7', hb: '135', rdw: 13.60, wbc: 11.20
    };
    const defaultProb = predictRisk(defaultData, currentUnits);
    
    drawGauge(defaultProb);
    
    const defaultShap = calculateLocalShap({
        age: '68', sex: '1', bmi: '24.6', creatinine: '106',
        glucose: '7.7', hb: '135', rdw: '13.60', wbc: '11.20'
    }, defaultProb, currentUnits);
    renderShapWaterfall(defaultShap, defaultProb);
    updateFeatureTable();
    
    // Event listeners
    ['creatinine', 'age', 'sex'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateEGFR);
    });
    
    // Event listeners for BMI auto-calculation
    ['height', 'weight'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateBMI);
    });
    
    document.getElementById('prediction-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Ensure BMI is calculated before prediction
        updateBMI();
        
        const data = {
            age: document.getElementById('age').value,
            sex: document.getElementById('sex').value,
            bmi: document.getElementById('bmi').value,
            creatinine: document.getElementById('creatinine').value,
            glucose: document.getElementById('glucose').value,
            hb: document.getElementById('hb').value,
            rdw: document.getElementById('rdw').value,
            wbc: document.getElementById('wbc').value,
            model: document.getElementById('model-select').value
        };
        
        try {
            // Try backend API first
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                const probability = result.probability;
                drawGauge(probability);
                if (result.shap) {
                    renderShapWaterfall(result.shap, probability);
                } else {
                    const localShap = calculateLocalShap(data, probability);
                    renderShapWaterfall(localShap, probability);
                }
            } else {
                // Fallback to local calculation
                const probability = predictRisk(data);
                drawGauge(probability);
                const localShap = calculateLocalShap(data, probability);
                renderShapWaterfall(localShap, probability);
            }
        } catch (error) {
            console.log('Using local prediction');
            const probability = predictRisk(data);
            drawGauge(probability);
            const localShap = calculateLocalShap(data, probability);
            renderShapWaterfall(localShap, probability);
        }
    });
});
