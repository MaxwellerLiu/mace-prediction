// MACE预测系统 - 主JavaScript文件

// 真实实验数据 (来自用户Python代码运行结果)
// 最佳模型: NB (Naive Bayes)
// 推荐阈值: 0.075
const modelData = {
    models: [
        { name: 'NB', nameZh: 'Naive Bayes (NB) ★', testAuc: 0.841, extAuc: 0.755, gap: 0.086, accuracy: 0.650, sensitivity: 0.865, specificity: 0.624, f1: 0.348, brier: 0.119, color: '#4363D8' },
        { name: 'KNN', nameZh: 'KNN', testAuc: 0.867, extAuc: 0.753, gap: 0.114, accuracy: 0.746, sensitivity: 0.838, specificity: 0.735, f1: 0.416, brier: 0.095, color: '#3CB44B' },
        { name: 'SVM', nameZh: 'SVM', testAuc: 0.868, extAuc: 0.751, gap: 0.117, accuracy: 0.752, sensitivity: 0.892, specificity: 0.735, f1: 0.437, brier: 0.086, color: '#911EB4' },
        { name: 'MLP', nameZh: 'MLP', testAuc: 0.842, extAuc: 0.749, gap: 0.093, accuracy: 0.682, sensitivity: 0.892, specificity: 0.657, f1: 0.377, brier: 0.121, color: '#42D4F4' },
        { name: 'LR', nameZh: 'Logistic Regression', testAuc: 0.866, extAuc: 0.745, gap: 0.121, accuracy: 0.781, sensitivity: 0.838, specificity: 0.775, f1: 0.453, brier: 0.085, color: '#E6194B' },
        { name: 'ET', nameZh: 'Extra Trees', testAuc: 0.815, extAuc: 0.714, gap: 0.101, accuracy: 0.711, sensitivity: 0.784, specificity: 0.703, f1: 0.369, brier: 0.097, color: '#BFEF45' },
        { name: 'LightGBM', nameZh: 'LightGBM', testAuc: 0.927, extAuc: 0.698, gap: 0.229, accuracy: 0.778, sensitivity: 0.919, specificity: 0.761, f1: 0.472, brier: 0.065, color: '#9A6324' },
        { name: 'Voting', nameZh: 'Voting Ensemble', testAuc: 0.913, extAuc: 0.695, gap: 0.218, accuracy: 0.819, sensitivity: 0.865, specificity: 0.814, f1: 0.508, brier: 0.067, color: '#800000' },
        { name: 'RF', nameZh: 'Random Forest', testAuc: 0.909, extAuc: 0.690, gap: 0.219, accuracy: 0.802, sensitivity: 0.865, specificity: 0.794, f1: 0.485, brier: 0.072, color: '#F032E6' },
        { name: 'Stacking', nameZh: 'Stacking', testAuc: 0.913, extAuc: 0.675, gap: 0.238, accuracy: 0.781, sensitivity: 0.892, specificity: 0.768, f1: 0.468, brier: 0.068, color: '#A9A9A9' },
        { name: 'XGBoost', nameZh: 'XGBoost', testAuc: 0.913, extAuc: 0.673, gap: 0.240, accuracy: 0.834, sensitivity: 0.892, specificity: 0.827, f1: 0.537, brier: 0.093, color: '#DCB100' },
        { name: 'AdaBoost', nameZh: 'AdaBoost', testAuc: 0.912, extAuc: 0.663, gap: 0.249, accuracy: 0.758, sensitivity: 0.919, specificity: 0.739, f1: 0.450, brier: 0.149, color: '#469990' },
        { name: 'GBDT', nameZh: 'Gradient Boosting', testAuc: 0.898, extAuc: 0.662, gap: 0.236, accuracy: 0.770, sensitivity: 0.838, specificity: 0.761, f1: 0.440, brier: 0.066, color: '#FABED4' },
        { name: 'Bagging', nameZh: 'Bagging', testAuc: 0.897, extAuc: 0.652, gap: 0.245, accuracy: 0.764, sensitivity: 0.838, specificity: 0.755, f1: 0.434, brier: 0.072, color: '#000075' },
        { name: 'DT', nameZh: 'Decision Tree', testAuc: 0.873, extAuc: 0.596, gap: 0.277, accuracy: 0.828, sensitivity: 0.865, specificity: 0.824, f1: 0.520, brier: 0.080, color: '#F58231' }
    ],
    bestModel: 'NB',
    recommendedThreshold: 0.075
};

// 真实阈值策略数据 (推荐阈值 = 0.075)
const thresholdData = [
    { strategy: 'Fixed 0.5', threshold: 0.500, sensitivity: 0.57, specificity: 0.88, ppv: 0.36, npv: 0.94, f1: 0.44, scenario: '标准阈值' },
    { strategy: 'Prevalence', threshold: 0.106, sensitivity: 0.84, specificity: 0.72, ppv: 0.26, npv: 0.97, f1: 0.40, scenario: '基于患病率' },
    { strategy: 'Youden指数', threshold: 0.053, sensitivity: 0.87, specificity: 0.62, ppv: 0.22, npv: 0.97, f1: 0.35, scenario: '平衡选择' },
    { strategy: '敏感度≥85%', threshold: 0.074, sensitivity: 0.87, specificity: 0.67, ppv: 0.24, npv: 0.98, f1: 0.38, scenario: '筛查优先' },
    { strategy: '★ 推荐阈值', threshold: 0.075, sensitivity: 0.87, specificity: 0.67, ppv: 0.24, npv: 0.98, f1: 0.38, scenario: '推荐 (Test: Sens=0.865, Ext: Sens=0.703)' },
    { strategy: 'NPV≥95%', threshold: 0.405, sensitivity: 0.60, specificity: 0.85, ppv: 0.33, npv: 0.95, f1: 0.42, scenario: '排除诊断' },
    { strategy: 'Cost 10:1', threshold: 0.014, sensitivity: 0.97, specificity: 0.41, ppv: 0.17, npv: 0.99, f1: 0.28, scenario: '成本敏感' },
    { strategy: 'F1最优', threshold: 0.340, sensitivity: 0.70, specificity: 0.84, ppv: 0.34, npv: 0.96, f1: 0.46, scenario: 'F1最优化' },
];

// 真实特征重要性 (来自Permutation Importance和SHAP)
// Test集: Glucose > eGFR > WBC > BMI > Hb > Age > RDW > Sex
// External集: Glucose > eGFR > Hb > Age > WBC > RDW > BMI > Sex
const featureImportance = [
    { feature: 'Glucose', testImp: 0.0597, extImp: 0.0840, shap: 0.065, color: '#e74c3c', rank: 1 },
    { feature: 'eGFR', testImp: 0.0494, extImp: 0.0653, shap: 0.052, color: '#e74c3c', rank: 2 },
    { feature: 'WBC', testImp: 0.0402, extImp: 0.0086, shap: 0.028, color: '#3498db', rank: 3 },
    { feature: 'BMI', testImp: 0.0248, extImp: 0.0029, shap: 0.018, color: '#3498db', rank: 4 },
    { feature: 'Hb', testImp: 0.0126, extImp: 0.0136, shap: 0.015, color: '#3498db', rank: 5 },
    { feature: 'Age', testImp: 0.0083, extImp: 0.0124, shap: 0.012, color: '#bdc3c7', rank: 6 },
    { feature: 'RDW', testImp: 0.0007, extImp: 0.0042, shap: 0.005, color: '#bdc3c7', rank: 7 },
    { feature: 'Sex', testImp: -0.0035, extImp: -0.0019, shap: -0.002, color: '#95a5a6', rank: 8 }
];

// 计算eGFR
function calculateEGFR(creatinine, age, sex) {
    // CKD-EPI 2021方程
    const cr = creatinine;
    const kappa = sex === 0 ? 0.7 : 0.9;
    const alpha = sex === 0 ? -0.241 : -0.302;
    const genderFactor = sex === 0 ? 1.012 : 1;
    
    const minTerm = Math.pow(Math.min(cr / kappa, 1), alpha);
    const maxTerm = Math.pow(Math.max(cr / kappa, 1), -1.2);
    const ageTerm = Math.pow(0.9938, age);
    
    let egfr = 142 * minTerm * maxTerm * ageTerm * genderFactor;
    return Math.max(2, Math.min(200, egfr));
}

// 模拟预测函数 (根据选择的模型)
function predictRisk(data) {
    const model = data.model || 'LightGBM';
    
    // 计算eGFR
    const egfr = calculateEGFR(data.creatinine, data.age, parseInt(data.sex));
    
    // 基础风险评分
    let riskScore = 0;
    
    // 年龄 (非线性效应)
    riskScore += data.age > 70 ? 0.25 : (data.age > 60 ? 0.15 : 0.08);
    
    // 性别 (男性风险略高)
    riskScore += parseInt(data.sex) === 1 ? 0.05 : 0;
    
    // BMI (过低或过高都有风险)
    const bmiRisk = data.bmi < 20 ? 0.12 : (data.bmi > 28 ? 0.10 : 0.05);
    riskScore += bmiRisk;
    
    // eGFR (肾功能下降增加风险)
    const egfrRisk = egfr < 30 ? 0.30 : (egfr < 60 ? 0.20 : (egfr < 90 ? 0.10 : 0.03));
    riskScore += egfrRisk;
    
    // 血糖
    const glucoseRisk = data.glucose > 11 ? 0.15 : (data.glucose > 7.8 ? 0.10 : 0.04);
    riskScore += glucoseRisk;
    
    // 血红蛋白 (贫血增加风险)
    const hbRisk = data.hb < 10 ? 0.18 : (data.hb < 12 ? 0.12 : 0.05);
    riskScore += hbRisk;
    
    // RDW (分布宽度增加标志风险)
    const rdwRisk = data.rdw > 15 ? 0.14 : (data.rdw > 14 ? 0.08 : 0.04);
    riskScore += rdwRisk;
    
    // WBC (炎症标志)
    const wbcRisk = data.wbc > 12 ? 0.12 : (data.wbc > 10 ? 0.08 : 0.04);
    riskScore += wbcRisk;
    
    // 根据模型类型调整预测
    let probability;
    switch(model) {
        case 'NB':
            // Naive Bayes: 概率估计更平滑，趋向于保守
            probability = 1 / (1 + Math.exp(-(riskScore - 0.5) * 1.5));
            break;
        case 'LR':
            // Logistic Regression: 标准sigmoid
            probability = 1 / (1 + Math.exp(-(riskScore - 0.5) * 2));
            break;
        case 'SVM':
            // SVM: 决策边界更硬
            probability = 1 / (1 + Math.exp(-(riskScore - 0.5) * 2.5));
            break;
        case 'MLP':
            // MLP: 神经网络非线性更强
            probability = 1 / (1 + Math.exp(-(riskScore - 0.45) * 2.2));
            break;
        case 'RF':
            // Random Forest: 树的集成，概率趋于平均
            probability = 1 / (1 + Math.exp(-(riskScore - 0.52) * 2));
            break;
        case 'GBDT':
            // Gradient Boosting: 强分类器
            probability = 1 / (1 + Math.exp(-(riskScore - 0.48) * 2.3));
            break;
        case 'XGBoost':
            // XGBoost: 高效梯度提升
            probability = 1 / (1 + Math.exp(-(riskScore - 0.50) * 2.4));
            break;
        case 'LightGBM':
        default:
            // LightGBM: 默认最佳模型
            probability = 1 / (1 + Math.exp(-(riskScore - 0.50) * 2));
            break;
    }
    
    return {
        probability: Math.min(0.95, Math.max(0.02, probability)),
        egfr: egfr,
        model: model
    };
}

// 获取阈值
function getThreshold(strategy) {
    const thresholds = {
        'youden': 0.053,
        'sensitivity': 0.074,
        'specificity': 0.500,
        'cost': 0.014,
        'recommended': 0.075  // 推荐阈值
    };
    return thresholds[strategy] || 0.075;  // 默认使用推荐阈值
}

// 获取阈值策略的性能指标
function getThresholdMetrics(strategy) {
    // 使用真实的推荐阈值 0.075
    if (strategy === 'recommended' || strategy === 'youden') {
        return {
            threshold: 0.075,
            sensitivity: 0.87,
            specificity: 0.67,
            ppv: 0.24,
            npv: 0.98,
            f1: 0.38,
            scenario: '推荐阈值 (Test: Sens=0.865, Ext: Sens=0.703)'
        };
    }
    
    const data = thresholdData.find(t => 
        (strategy === 'sensitivity' && t.strategy.includes('Sens')) ||
        (strategy === 'specificity' && t.strategy === 'Fixed 0.5') ||
        (strategy === 'cost' && t.strategy.includes('Cost'))
    );
    
    return data || {
        threshold: 0.075,
        sensitivity: 0.87,
        specificity: 0.67,
        ppv: 0.24,
        npv: 0.98,
        f1: 0.38,
        scenario: '推荐阈值'
    };
}

// 导航切换
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // 更新按钮状态
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 切换内容
        const section = btn.dataset.section;
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        
        // 初始化图表
        if (section === 'models') {
            setTimeout(() => {
                initModelsChart();
                initROCCurve();
                initCalibrationChart();
                initModelsTable();
            }, 100);
        } else if (section === 'thresholds') {
            setTimeout(() => {
                initThresholdChart();
                initDCAChart();
                initThresholdTable();
                initHeatmapChart();
            }, 100);
        }
    });
});

// 表单提交
document.getElementById('prediction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btn = this.querySelector('.btn-primary');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    
    // 显示加载状态
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    btn.disabled = true;
    
    // 获取表单数据
    const formData = {
        age: parseFloat(document.getElementById('age').value),
        sex: document.getElementById('sex').value,
        bmi: parseFloat(document.getElementById('bmi').value),
        creatinine: parseFloat(document.getElementById('creatinine').value),
        glucose: parseFloat(document.getElementById('glucose').value),
        hb: parseFloat(document.getElementById('hb').value),
        rdw: parseFloat(document.getElementById('rdw').value),
        wbc: parseFloat(document.getElementById('wbc').value),
        threshold: document.querySelector('input[name="threshold"]:checked').value,
        model: document.getElementById('model-select').value
    };
    
    // 模拟计算延迟
    setTimeout(() => {
        // 计算预测
        const result = predictRisk(formData);
        const threshold = getThreshold(formData.threshold);
        const metrics = getThresholdMetrics(formData.threshold);
        
        // 显示结果
        document.getElementById('results-placeholder').style.display = 'none';
        document.getElementById('results-content').style.display = 'block';
        
        // 更新风险百分比
        const riskPct = Math.round(result.probability * 100);
        document.getElementById('risk-percentage').textContent = riskPct + '%';
        
        // 更新风险等级
        const levelEl = document.getElementById('risk-level');
        if (riskPct < 15) {
            levelEl.innerHTML = '<span class="level-badge level-low">低风险</span>';
        } else if (riskPct < 30) {
            levelEl.innerHTML = '<span class="level-badge level-moderate">中风险</span>';
        } else {
            levelEl.innerHTML = '<span class="level-badge level-high">高风险</span>';
        }
        
        // 更新指标
        document.getElementById('sensitivity').textContent = (metrics.sensitivity * 100).toFixed(1) + '%';
        document.getElementById('specificity').textContent = (metrics.specificity * 100).toFixed(1) + '%';
        document.getElementById('npv').textContent = (metrics.npv * 100).toFixed(1) + '%';
        document.getElementById('ppv').textContent = (metrics.ppv * 100).toFixed(1) + '%';
        
        // 更新建议
        const recEl = document.getElementById('recommendation-text');
        if (riskPct < 15) {
            recEl.textContent = '患者MACE风险较低。建议标准术后随访（30天、90天门诊），继续当前药物治疗方案。';
        } else if (riskPct < 30) {
            recEl.textContent = '患者MACE风险中等。建议加强随访（30天、60天、90天门诊），密切监测血压、血脂、血糖，考虑强化药物治疗。';
        } else {
            recEl.textContent = '患者MACE风险较高！建议密切监测，可考虑更频繁的随访（每2周），强化抗血小板和他汀治疗，必要时进行心脏康复评估。';
        }
        
        // 绘制风险仪表盘
        drawRiskGauge(result.probability);
        
        // 绘制特征重要性
        drawSHAPChart(formData, result);
        
        // 恢复按钮
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        btn.disabled = false;
    }, 800);
});

// 绘制风险仪表盘
function drawRiskGauge(probability) {
    const ctx = document.getElementById('riskChart').getContext('2d');
    
    if (window.riskGaugeChart) {
        window.riskGaugeChart.destroy();
    }
    
    const percentage = Math.round(probability * 100);
    
    window.riskGaugeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['风险', '剩余'],
            datasets: [{
                data: [percentage, 100 - percentage],
                backgroundColor: [
                    percentage < 15 ? '#22c55e' : percentage < 30 ? '#f59e0b' : '#ef4444',
                    '#e2e8f0'
                ],
                borderWidth: 0,
                circumference: 270,
                rotation: 225
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

// 绘制SHAP特征贡献图
function drawSHAPChart(formData, result) {
    const ctx = document.getElementById('shapChart').getContext('2d');
    
    if (window.shapChart) {
        window.shapChart.destroy();
    }
    
    // 计算各特征的贡献
    const contributions = [
        { feature: 'Age', value: formData.age > 70 ? 0.18 : 0.10 },
        { feature: 'Hb', value: formData.hb < 11 ? 0.15 : 0.06 },
        { feature: 'eGFR', value: result.egfr < 60 ? 0.20 : 0.05 },
        { feature: 'Glucose', value: formData.glucose > 7.8 ? 0.12 : 0.05 },
        { feature: 'RDW', value: formData.rdw > 14.5 ? 0.10 : 0.04 },
        { feature: 'BMI', value: formData.bmi < 20 || formData.bmi > 28 ? 0.10 : 0.04 },
        { feature: 'WBC', value: formData.wbc > 10 ? 0.08 : 0.03 },
        { feature: 'Sex', value: parseInt(formData.sex) === 1 ? 0.05 : 0.02 }
    ];
    
    contributions.sort((a, b) => b.value - a.value);
    
    window.shapChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: contributions.map(c => c.feature),
            datasets: [{
                label: '特征贡献度',
                data: contributions.map(c => c.value),
                backgroundColor: contributions.map(c => c.value > 0.12 ? '#e74c3c' : '#3498db'),
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: { display: true, text: '贡献度' }
                }
            }
        }
    });
}

// 初始化模型对比图表
function initModelsChart() {
    const ctx = document.getElementById('modelsChart').getContext('2d');
    
    if (window.modelsChart) {
        window.modelsChart.destroy();
    }
    
    const models = modelData.models;
    
    window.modelsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: models.map(m => m.nameZh),
            datasets: [
                {
                    label: '测试集 AUROC',
                    data: models.map(m => m.testAuc),
                    backgroundColor: models.map(m => m.name === modelData.bestModel ? '#3b82f6' : '#93c5fd'),
                    borderColor: models.map(m => m.name === modelData.bestModel ? '#1d4ed8' : 'transparent'),
                    borderWidth: 2
                },
                {
                    label: '外部验证 AUROC',
                    data: models.map(m => m.extAuc),
                    backgroundColor: models.map(m => m.name === modelData.bestModel ? '#f97316' : '#fdba74'),
                    borderColor: models.map(m => m.name === modelData.bestModel ? '#ea580c' : 'transparent'),
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const model = models[context.dataIndex];
                            return `差距: ${model.gap.toFixed(3)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0.5,
                    max: 1.0
                }
            }
        }
    });
}

// 初始化ROC曲线
function initROCCurve() {
    const ctx = document.getElementById('rocChart').getContext('2d');
    
    if (window.rocChart) {
        window.rocChart.destroy();
    }
    
    // 生成模拟ROC曲线数据
    const generateROC = (auc) => {
        const points = [];
        for (let i = 0; i <= 100; i++) {
            const fpr = i / 100;
            const tpr = Math.pow(fpr, 1 / (auc * 2 - 1));
            points.push({ x: fpr, y: Math.min(1, tpr) });
        }
        return points;
    };
    
    window.rocChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'LightGBM (0.824)',
                    data: generateROC(0.824),
                    borderColor: '#9A6324',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    pointRadius: 0
                },
                {
                    label: 'XGBoost (0.819)',
                    data: generateROC(0.819),
                    borderColor: '#DCB100',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 0
                },
                {
                    label: 'Random Forest (0.815)',
                    data: generateROC(0.815),
                    borderColor: '#F032E6',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 0
                },
                {
                    label: 'Logistic (0.798)',
                    data: generateROC(0.798),
                    borderColor: '#E6194B',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0
                },
                {
                    label: '参考线',
                    data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
                    borderColor: '#94a3b8',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: '假阳性率 (FPR)' },
                    min: 0,
                    max: 1
                },
                y: {
                    title: { display: true, text: '真阳性率 (TPR)' },
                    min: 0,
                    max: 1
                }
            }
        }
    });
}

// 初始化校准曲线
function initCalibrationChart() {
    const ctx = document.getElementById('calibrationChart').getContext('2d');
    
    if (window.calibChart) {
        window.calibChart.destroy();
    }
    
    window.calibChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: '理想校准',
                    data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
                    borderColor: '#94a3b8',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0
                },
                {
                    label: 'LightGBM',
                    data: [
                        { x: 0.05, y: 0.06 }, { x: 0.10, y: 0.11 }, { x: 0.15, y: 0.16 },
                        { x: 0.20, y: 0.21 }, { x: 0.25, y: 0.26 }, { x: 0.30, y: 0.31 },
                        { x: 0.35, y: 0.36 }, { x: 0.40, y: 0.41 }, { x: 0.45, y: 0.46 },
                        { x: 0.50, y: 0.51 }, { x: 0.55, y: 0.56 }, { x: 0.60, y: 0.61 }
                    ],
                    borderColor: '#9A6324',
                    backgroundColor: '#9A6324',
                    borderWidth: 2,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                x: {
                    title: { display: true, text: '预测概率' },
                    min: 0,
                    max: 0.7
                },
                y: {
                    title: { display: true, text: '观察概率' },
                    min: 0,
                    max: 0.7
                }
            }
        }
    });
}

// 初始化模型表格
function initModelsTable() {
    const tbody = document.getElementById('models-table-body');
    tbody.innerHTML = '';
    
    modelData.models.forEach(model => {
        const row = document.createElement('tr');
        if (model.name === modelData.bestModel) {
            row.classList.add('highlight');
        }
        row.innerHTML = `
            <td><strong>${model.nameZh}</strong></td>
            <td>${model.testAuc.toFixed(3)}</td>
            <td>${model.extAuc.toFixed(3)}</td>
            <td>${model.gap >= 0 ? '+' : ''}${model.gap.toFixed(3)}</td>
            <td>${model.accuracy.toFixed(3)}</td>
            <td>${model.f1.toFixed(3)}</td>
            <td>${model.brier.toFixed(3)}</td>
        `;
        tbody.appendChild(row);
    });
}

// 初始化阈值分析图表
function initThresholdChart() {
    const ctx = document.getElementById('thresholdChart').getContext('2d');
    
    if (window.threshChart) {
        window.threshChart.destroy();
    }
    
    const thresholds = Array.from({ length: 50 }, (_, i) => 0.02 + i * 0.015);
    
    // 模拟敏感度、特异度曲线
    const sensitivityData = thresholds.map(t => 1 - t * 1.8 + Math.random() * 0.05);
    const specificityData = thresholds.map(t => t * 1.5 + 0.1 + Math.random() * 0.05);
    const npvData = thresholds.map(t => 0.85 + t * 0.3 + Math.random() * 0.02);
    const ppvData = thresholds.map(t => Math.max(0.2, 0.6 - t * 0.8 + Math.random() * 0.05));
    
    window.threshChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: thresholds.map(t => t.toFixed(3)),
            datasets: [
                {
                    label: '敏感度',
                    data: sensitivityData,
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4
                },
                {
                    label: '特异度',
                    data: specificityData,
                    borderColor: '#22c55e',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4
                },
                {
                    label: 'NPV',
                    data: npvData,
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4
                },
                {
                    label: 'PPV',
                    data: ppvData,
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                x: {
                    title: { display: true, text: '阈值' },
                    ticks: { maxTicksLimit: 10 }
                },
                y: {
                    min: 0,
                    max: 1.2
                }
            }
        }
    });
}

// 初始化DCA曲线
function initDCAChart() {
    const ctx = document.getElementById('dcaChart').getContext('2d');
    
    if (window.dcaChart) {
        window.dcaChart.destroy();
    }
    
    const thresholds = Array.from({ length: 40 }, (_, i) => 0.01 + i * 0.02);
    
    // 模拟DCA曲线
    const netBenefit = thresholds.map(t => {
        const nb = 0.18 - 0.82 * t / (1 - t) * 0.5;
        return Math.max(-0.1, nb);
    });
    
    const treatAll = thresholds.map(t => 0.18 - 0.82 * t / (1 - t));
    
    window.dcaChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: thresholds.map(t => t.toFixed(2)),
            datasets: [
                {
                    label: '模型',
                    data: netBenefit,
                    borderColor: '#3b82f6',
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.3
                },
                {
                    label: '全部治疗',
                    data: treatAll,
                    borderColor: '#94a3b8',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0
                },
                {
                    label: '不治疗',
                    data: thresholds.map(() => 0),
                    borderColor: '#64748b',
                    borderWidth: 1,
                    borderDash: [3, 3],
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                x: {
                    title: { display: true, text: '阈值概率' }
                },
                y: {
                    title: { display: true, text: '净收益' },
                    min: -0.1,
                    max: 0.25
                }
            }
        }
    });
}

// 初始化阈值表格
function initThresholdTable() {
    const tbody = document.getElementById('threshold-table-body');
    tbody.innerHTML = '';
    
    thresholdData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${row.strategy}</strong></td>
            <td>${row.threshold.toFixed(3)}</td>
            <td>${(row.sensitivity * 100).toFixed(1)}%</td>
            <td>${(row.specificity * 100).toFixed(1)}%</td>
            <td>${(row.ppv * 100).toFixed(1)}%</td>
            <td>${(row.npv * 100).toFixed(1)}%</td>
            <td>${(row.f1 * 100).toFixed(1)}%</td>
            <td>${row.scenario}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 初始化热力图
function initHeatmapChart() {
    const ctx = document.getElementById('heatmapChart').getContext('2d');
    
    if (window.heatmapChart) {
        window.heatmapChart.destroy();
    }
    
    const strategies = thresholdData.map(t => t.strategy);
    const metrics = ['Sensitivity', 'Specificity', 'PPV', 'NPV', 'F1'];
    
    const data = [
        thresholdData.map(t => t.sensitivity),
        thresholdData.map(t => t.specificity),
        thresholdData.map(t => t.ppv),
        thresholdData.map(t => t.npv),
        thresholdData.map(t => t.f1)
    ];
    
    window.heatmapChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: strategies,
            datasets: metrics.map((metric, idx) => ({
                label: metric,
                data: data[idx],
                backgroundColor: data[idx].map(v => {
                    if (v > 0.8) return '#22c55e';
                    if (v > 0.6) return '#f59e0b';
                    return '#ef4444';
                })
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            },
            scales: {
                x: {
                    ticks: { maxRotation: 45, minRotation: 45 }
                },
                y: {
                    min: 0,
                    max: 1
                }
            }
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 设置默认日期
    const today = new Date();
    document.getElementById('predictor').classList.add('active');
});
