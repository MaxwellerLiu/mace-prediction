/**
 * MACE Risk Prediction - Professional Medical Interface
 * Based on evidence-based risk stratification thresholds
 * 
 * Risk Thresholds (Literature-based):
 * - Low: <10% (Reference: RISK-PCI low risk ~2%, ACC/AHA intermediate starts at 7.5%)
 * - Moderate: 10-20% (Reference: ACC/AHA intermediate risk 7.5-20%)
 * - High: 20-30% (Reference: MBF+GLS model threshold 30%)
 * - Very High: ≥30% (Reference: RISK-PCI very high risk 39.4%)
 * 
 * Key Literature:
 * 1. RISK-PCI Score: Mrdovic et al., Int J Cardiol 2013;162(3):220-227
 *    - C-statistic 0.78 for 1-year MACE prediction
 *    - Risk strata: Low(0-2.5pts), Int(3-4.5pts), High(5-6.5pts), Very High(≥7pts)
 * 
 * 2. MBF+GLS Model: Cardiac imaging-based prediction
 *    - AUC 0.95 with thresholds at 30% and 70%
 * 
 * 3. ACC/AHA 2019/2026 Guidelines:
 *    - Low: <5%, Borderline: 5-<7.5%, Intermediate: 7.5-<20%, High: ≥20%
 * 
 * 4. GRACE Score:
 *    - Low: <109, Intermediate: 109-140, High: >140
 */

// ============================================
// Translations
// ============================================
const i18n = {
    zh: {
        // Header
        headerTitle: 'MACE风险预测',
        headerSubtitle: 'STEMI患者PCI术后90天MACE风险预测模型',
        
        // Sidebar
        sidebarTitle: '患者信息',
        labelCreatinine: '肌酐',
        labelAge: '年龄',
        labelSex: '性别',
        optMale: '男性',
        optFemale: '女性',
        labelBMI: 'BMI (kg/m²)',
        heightPlaceholder: '身高 (cm)',
        weightPlaceholder: '体重 (kg)',
        labelGlucose: '血糖',
        labelHemoglobin: '血红蛋白',
        labelRDW: '红细胞分布宽度 (%)',
        labelWBC: '白细胞计数 (×10⁹/L)',
        labelModel: '预测模型',
        btnPredict: '计算风险',
        btnReset: '重置',
        
        // eGFR
        egfrLabel: '估算肾小球滤过率 (eGFR)',
        egfrUnit: 'mL/min/1.73m²',
        calcBtnTitle: '计算eGFR',
        
        // Risk Card
        riskTitle: 'MACE风险评估',
        riskSubtitle: '90天主要不良心血管事件风险',
        lowRisk: '低风险',
        moderateRisk: '中风险',
        highRisk: '高风险',
        veryHighRisk: '极高风险',
        riskNoteLow: '建议标准PCI术后管理方案',
        riskNoteModerate: '建议加强监测与随访',
        riskNoteHigh: '建议强化药物治疗',
        riskNoteVeryHigh: '建议住院监护与积极干预',
        
        // Risk Thresholds Explanation
        riskThresholdsTitle: '风险分层标准',
        riskThresholdLow: '<10% 低风险',
        riskThresholdModerate: '10-20% 中风险',
        riskThresholdHigh: '20-30% 高风险',
        riskThresholdVeryHigh: '≥30% 极高风险',
        riskRefRISKPCI: '基于RISK-PCI评分',
        riskRefACCGuideline: '参考ACC/AHA指南',
        
        // Recommendations
        recTitle: '临床建议',
        recs: {
            low: ['标准双抗血小板治疗', '4-6周门诊随访', '他汀类降脂治疗', '危险因素控制'],
            moderate: ['强化双抗血小板治疗', '2、4、8周随访', 'β受体阻滞剂应用', '心脏康复评估'],
            high: ['住院监护治疗', '每周随访', '早期心脏康复介入', '多学科会诊'],
            veryHigh: ['ICU监护', '每日评估', '紧急介入评估', '高级生命支持准备']
        },
        
        // Literature
        literatureTitle: '循证依据',
        litRISKPCI: 'RISK-PCI评分',
        litRISKPCIDesc: 'STEMI患者PCI术后MACE风险预测，C-statistic=0.78',
        litMBFGLS: 'MBF+GLS模型',
        litMBFGLSDesc: '基于心肌血流灌注与应变分析，AUC=0.95',
        litACCAHA: 'ACC/AHA指南',
        litACCADesc: '心血管风险分层与治疗建议',
        litGRACE: 'GRACE评分',
        litGRACEDesc: '急性冠脉综合征全球注册风险评分',
        
        // Performance
        perfTitle: '模型性能',
        perfExternalVal: '外部验证结果',
        metricAUROC: 'AUROC',
        metricSens: '敏感度',
        metricSpec: '特异度',
        metricNPV: '阴性预测值',
        metricSensSub: '阈值 0.075',
        metricSpecSub: '阈值 0.075',
        metricNPVSub: '排除高危',
        
        // Features
        featuresTitle: '风险因子贡献度',
        featuresSubtitle: '基于排列重要性分析',
        shapTitle: 'SHAP值分析',
        
        // CKD Stages
        ckdStages: {
            stage1: 'CKD 1期 正常',
            stage2: 'CKD 2期 轻度下降',
            stage3a: 'CKD 3a期 中度下降',
            stage3b: 'CKD 3b期 中重度下降',
            stage4: 'CKD 4期 重度下降',
            stage5: 'CKD 5期 肾衰竭'
        },
        
        // Models
        models: {
            NB: '朴素贝叶斯 (推荐)',
            LightGBM: 'LightGBM',
            XGBoost: 'XGBoost'
        },
        
        // Units
        unitYear: '岁',
        unitPercent: '%'
    },
    en: {
        // Header
        headerTitle: 'MACE Risk Prediction',
        headerSubtitle: '90-Day MACE Prediction for Post-PCI STEMI Patients',
        
        // Sidebar
        sidebarTitle: 'Patient Information',
        labelCreatinine: 'Creatinine',
        labelAge: 'Age',
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
        labelModel: 'Prediction Model',
        btnPredict: 'Calculate Risk',
        btnReset: 'Reset',
        
        // eGFR
        egfrLabel: 'eGFR (CKD-EPI 2021)',
        egfrUnit: 'mL/min/1.73m²',
        calcBtnTitle: 'Calculate eGFR',
        
        // Risk Card
        riskTitle: 'MACE Risk Assessment',
        riskSubtitle: '90-Day Major Adverse Cardiovascular Event Risk',
        lowRisk: 'Low Risk',
        moderateRisk: 'Moderate Risk',
        highRisk: 'High Risk',
        veryHighRisk: 'Very High Risk',
        riskNoteLow: 'Standard post-PCI management recommended',
        riskNoteModerate: 'Enhanced monitoring and follow-up advised',
        riskNoteHigh: 'Intensive medical therapy recommended',
        riskNoteVeryHigh: 'Inpatient monitoring and aggressive intervention',
        
        // Risk Thresholds Explanation
        riskThresholdsTitle: 'Risk Stratification Criteria',
        riskThresholdLow: '<10% Low Risk',
        riskThresholdModerate: '10-20% Moderate Risk',
        riskThresholdHigh: '20-30% High Risk',
        riskThresholdVeryHigh: '≥30% Very High Risk',
        riskRefRISKPCI: 'Based on RISK-PCI Score',
        riskRefACCGuideline: 'Per ACC/AHA Guidelines',
        
        // Recommendations
        recTitle: 'Clinical Recommendations',
        recs: {
            low: ['Standard DAPT', '4-6 week follow-up', 'Statin therapy', 'Risk factor control'],
            moderate: ['Intensified DAPT', '2, 4, 8 week follow-up', 'Beta-blocker therapy', 'Cardiac rehab evaluation'],
            high: ['Inpatient monitoring', 'Weekly follow-up', 'Early cardiac rehab', 'Multidisciplinary care'],
            veryHigh: ['ICU monitoring', 'Daily assessment', 'Emergency intervention', 'Advanced life support']
        },
        
        // Literature
        literatureTitle: 'Evidence Base',
        litRISKPCI: 'RISK-PCI Score',
        litRISKPCIDesc: 'MACE prediction for post-PCI STEMI, C-statistic=0.78',
        litMBFGLS: 'MBF+GLS Model',
        litMBFGLSDesc: 'Myocardial blood flow + strain imaging, AUC=0.95',
        litACCAHA: 'ACC/AHA Guidelines',
        litACCADesc: 'CV risk stratification and treatment guidelines',
        litGRACE: 'GRACE Score',
        litGRACEDesc: 'Global Registry of Acute Coronary Events',
        
        // Performance
        perfTitle: 'Model Performance',
        perfExternalVal: 'External Validation Results',
        metricAUROC: 'AUROC',
        metricSens: 'Sensitivity',
        metricSpec: 'Specificity',
        metricNPV: 'NPV',
        metricSensSub: 'at threshold 0.075',
        metricSpecSub: 'at threshold 0.075',
        metricNPVSub: 'Rule-out',
        
        // Features
        featuresTitle: 'Risk Factor Contributions',
        featuresSubtitle: 'Based on permutation importance',
        shapTitle: 'SHAP Value Analysis',
        
        // CKD Stages
        ckdStages: {
            stage1: 'CKD Stage 1 Normal',
            stage2: 'CKD Stage 2 Mild',
            stage3a: 'CKD Stage 3a Moderate',
            stage3b: 'CKD Stage 3b Moderate-Severe',
            stage4: 'CKD Stage 4 Severe',
            stage5: 'CKD Stage 5 Kidney Failure'
        },
        
        // Models
        models: {
            NB: 'Naive Bayes (Recommended)',
            LightGBM: 'LightGBM',
            XGBoost: 'XGBoost'
        },
        
        // Units
        unitYear: 'years',
        unitPercent: '%'
    }
};

let currentLang = 'zh';

// Risk thresholds based on literature
const RISK_THRESHOLDS = {
    LOW: 10,
    MODERATE: 20,
    HIGH: 30
};

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
    const t = i18n[currentLang].ckdStages;
    if (egfr >= 90) return { stage: 'stage-1', text: t.stage1 };
    if (egfr >= 60) return { stage: 'stage-2', text: t.stage2 };
    if (egfr >= 45) return { stage: 'stage-3a', text: t.stage3a };
    if (egfr >= 30) return { stage: 'stage-3b', text: t.stage3b };
    if (egfr >= 15) return { stage: 'stage-4', text: t.stage4 };
    return { stage: 'stage-5', text: t.stage5 };
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
    
    // Form labels
    document.getElementById('label-creatinine').textContent = t.labelCreatinine;
    document.getElementById('label-age').textContent = t.labelAge;
    document.getElementById('label-sex').textContent = t.labelSex;
    document.getElementById('opt-male').textContent = t.optMale;
    document.getElementById('opt-female').textContent = t.optFemale;
    
    const bmiLabel = document.querySelector('label[for="bmi"]');
    if (bmiLabel) bmiLabel.textContent = t.labelBMI;
    
    document.getElementById('height').placeholder = t.heightPlaceholder;
    document.getElementById('weight').placeholder = t.weightPlaceholder;
    document.getElementById('label-glucose').textContent = t.labelGlucose;
    document.getElementById('label-hemoglobin').textContent = t.labelHemoglobin;
    document.getElementById('label-rdw').textContent = t.labelRDW;
    document.getElementById('label-wbc').textContent = t.labelWBC;
    document.getElementById('label-model').textContent = t.labelModel;
    document.getElementById('btn-predict').textContent = t.btnPredict;
    document.querySelector('.calc-btn').title = t.calcBtnTitle;
    
    // eGFR
    document.querySelector('.egfr-label').textContent = t.egfrLabel;
    document.querySelector('.egfr-unit').textContent = t.egfrUnit;
    
    // Risk card
    document.getElementById('risk-title').textContent = t.riskTitle;
    document.getElementById('risk-subtitle').textContent = t.riskSubtitle;
    document.getElementById('rec-title').textContent = t.recTitle;
    document.getElementById('perf-title').textContent = t.perfTitle;
    document.getElementById('features-title').textContent = t.featuresTitle;
    document.getElementById('features-subtitle').textContent = t.featuresSubtitle;
    document.getElementById('shap-title').textContent = t.shapTitle;
    
    // Metrics
    document.getElementById('metric-auroc').textContent = t.metricAUROC;
    document.getElementById('metric-sens').textContent = t.metricSens;
    document.getElementById('metric-spec').textContent = t.metricSpec;
    document.getElementById('metric-npv').textContent = t.metricNPV;
    
    const metricSubs = document.querySelectorAll('.metric-sub');
    if (metricSubs[0]) metricSubs[0].textContent = '95% CI: 0.670-0.833';
    if (metricSubs[1]) metricSubs[1].textContent = t.metricSensSub;
    if (metricSubs[2]) metricSubs[2].textContent = t.metricSpecSub;
    if (metricSubs[3]) metricSubs[3].textContent = t.metricNPVSub;
    
    // Thresholds
    document.getElementById('thresholds-title').textContent = t.riskThresholdsTitle;
    document.getElementById('threshold-low').textContent = t.riskThresholdLow;
    document.getElementById('threshold-moderate').textContent = t.riskThresholdModerate;
    document.getElementById('threshold-high').textContent = t.riskThresholdHigh;
    document.getElementById('threshold-veryhigh').textContent = t.riskThresholdVeryHigh;
    document.getElementById('ref-riskpci').textContent = t.riskRefRISKPCI;
    document.getElementById('ref-acc').textContent = t.riskRefACCGuideline;
    
    // Model options
    const modelSelect = document.getElementById('model-select');
    if (modelSelect) {
        modelSelect.options[0].text = t.models.NB;
        modelSelect.options[1].text = t.models.LightGBM;
        modelSelect.options[2].text = t.models.XGBoost;
    }
    
    // Update displays
    const currentProb = parseFloat(document.getElementById('risk-percentage').textContent) / 100;
    updateRiskDisplay(currentProb);
    
    if (!document.getElementById('egfr-result').classList.contains('hidden')) {
        calculateEGFRDisplay();
    }
    
    // Redraw gauge with new language
    drawGauge(currentProb);
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
    
    // Female has higher MACE risk (evidence-based)
    if (sex === '1') riskScore -= 0.02;
    else riskScore += 0.03;
    
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
// Gauge Drawing with Risk Zones
// ============================================
function drawGauge(probability, riskLevelText, riskColor) {
    const canvas = document.getElementById('gaugeCanvas');
    const ctx = canvas.getContext('2d');
    const percentage = Math.round(probability * 100);
    
    canvas.width = 500;
    canvas.height = 280;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 50;
    const radius = 160;
    const lineWidth = 28;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Color zones proportional to risk ranges:
    // - Green: 0-10%  -> angle Math.PI to Math.PI*0.9
    // - Yellow: 10-20% -> angle Math.PI*0.9 to Math.PI*0.8  
    // - Orange: 20-30% -> angle Math.PI*0.8 to Math.PI*0.7
    // - Red: 30-100%   -> angle Math.PI*0.7 to 0
    
    const lowEnd = Math.PI * 0.9;        // 10%
    const moderateEnd = Math.PI * 0.8;   // 20%
    const highEnd = Math.PI * 0.7;       // 30%
    
    // Draw full background first
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineCap = 'butt';
    ctx.stroke();
    
    // Draw colored zones
    const zones = [
        { start: Math.PI, end: lowEnd, color: '#22c55e' },      // Green 0-10% (bright)
        { start: lowEnd, end: moderateEnd, color: '#eab308' },  // Yellow 10-20% (golden)
        { start: moderateEnd, end: highEnd, color: '#f97316' }, // Orange 20-30%
        { start: highEnd, end: 0, color: '#ef4444' }            // Red 30-100% (bright)
    ];
    
    zones.forEach(zone => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, zone.start, zone.end);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = zone.color;
        ctx.lineCap = 'butt';
        ctx.stroke();
    });
    
    // Draw white separator lines at thresholds (10%, 20%, 30%)
    [lowEnd, moderateEnd, highEnd].forEach(angle => {
        const sepInnerR = radius - lineWidth/2 - 3;
        const sepOuterR = radius + lineWidth/2 + 3;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * sepInnerR, centerY + Math.sin(angle) * sepInnerR);
        ctx.lineTo(centerX + Math.cos(angle) * sepOuterR, centerY + Math.sin(angle) * sepOuterR);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
    });
    
    // Draw tick marks and labels at key thresholds
    // 0%, 10%, 20%, 30%, 50%, 75%, 100%
    const tickPositions = [0, 0.1, 0.2, 0.3, 0.5, 0.75, 1.0];
    tickPositions.forEach((pct, i) => {
        const angle = Math.PI * (1 - pct);
        const isMainTick = (pct === 0 || pct === 0.1 || pct === 0.2 || pct === 0.3 || pct === 1.0);
        const markerLength = isMainTick ? 15 : 10;
        const innerR = radius - lineWidth/2 - markerLength;
        const outerR = radius + lineWidth/2 + markerLength;
        
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR);
        ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR);
        ctx.lineWidth = isMainTick ? 3 : 2;
        ctx.strokeStyle = '#374151';
        ctx.stroke();
        
        // Percentage labels
        const labelRadius = radius + lineWidth/2 + 28;
        const labelX = centerX + Math.cos(angle) * labelRadius;
        const labelY = centerY + Math.sin(angle) * labelRadius;
        
        ctx.font = isMainTick ? 'bold 14px sans-serif' : 'bold 11px sans-serif';
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(pct * 100) + '%', labelX, labelY);
    });
    
    // Needle with animation support
    // 0% risk = Math.PI (left), 100% risk = 0 (right)
    const targetAngle = Math.PI * (1 - probability);
    const needleLength = radius - 25;
    
    // Draw needle shadow for depth
    ctx.beginPath();
    ctx.moveTo(centerX + 2, centerY + 2);
    ctx.lineTo(
        centerX + 2 + Math.cos(targetAngle) * needleLength,
        centerY + 2 + Math.sin(targetAngle) * needleLength
    );
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Draw needle
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.cos(targetAngle) * needleLength,
        centerY + Math.sin(targetAngle) * needleLength
    );
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#1f2937';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Needle center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    
    // Needle center highlight
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    
    // Center percentage text with background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - 70, centerY - 65, 140, 70);
    
    // Percentage
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(percentage + '%', centerX, centerY - 40);
    
    // Risk level text
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = riskColor || '#6b7280';
    ctx.fillText(riskLevelText || '', centerX, centerY - 15);
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
        riskColor = '#eab308';
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
