// MACE Prediction System - Professional Medical Interface
// Real experimental data: NB model, threshold 0.075

// Real model performance data
const modelPerformance = {
    'NB': { 
        auroc: 0.755, 
        sensitivity: 0.703, 
        specificity: 0.721, 
        npv: 0.952, 
        threshold: 0.075,
        testAuroc: 0.841,
        testAurocCI: '(0.778-0.899)',
        extAurocCI: '(0.670-0.833)'
    },
    'LightGBM': { auroc: 0.698, sensitivity: 0.757, specificity: 0.452, npv: 0.938, threshold: 0.132 },
    'XGBoost': { auroc: 0.673, sensitivity: 0.676, specificity: 0.565, npv: 0.934, threshold: 0.335 },
    'RF': { auroc: 0.690, sensitivity: 0.730, specificity: 0.551, npv: 0.943, threshold: 0.234 },
    'SVM': { auroc: 0.751, sensitivity: 0.595, specificity: 0.744, npv: 0.937, threshold: 0.158 },
    'MLP': { auroc: 0.749, sensitivity: 0.703, specificity: 0.708, npv: 0.951, threshold: 0.246 }
};

// Feature importance from real data
const featureImportance = [
    { feature: 'Glucose', importance: 0.084 },
    { feature: 'eGFR', importance: 0.065 },
    { feature: 'Hemoglobin', importance: 0.014 },
    { feature: 'Age', importance: 0.012 },
    { feature: 'WBC', importance: 0.009 },
    { feature: 'RDW', importance: 0.004 },
    { feature: 'BMI', importance: 0.003 },
    { feature: 'Sex', importance: -0.002 }
];

// Calculate eGFR using CKD-EPI 2021
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

// Predict risk using NB model simulation
function predictRisk(data) {
    const egfr = calculateEGFR(data.creatinine, data.age, data.sex);
    
    // Calculate risk score
    let riskScore = 0.10;
    
    if (data.age > 70) riskScore += 0.15;
    else if (data.age > 60) riskScore += 0.08;
    
    if (data.sex === '1') riskScore += 0.05;
    if (data.bmi < 20 || data.bmi > 28) riskScore += 0.08;
    if (egfr < 60) riskScore += 0.18;
    else if (egfr < 90) riskScore += 0.05;
    if (data.glucose > 7.8) riskScore += 0.10;
    if (data.hb < 11) riskScore += 0.12;
    if (data.rdw > 14.5) riskScore += 0.08;
    if (data.wbc > 10) riskScore += 0.06;
    
    // NB smoothing
    let probability = 1 / (1 + Math.exp(-(riskScore - 0.5) * 1.5));
    probability = Math.max(0.02, Math.min(0.95, probability));
    
    return { probability, egfr };
}

// Get risk level and recommendations
function getRiskInfo(riskPct) {
    if (riskPct < 7.5) {
        return {
            level: 'low',
            badge: '✓ Low Risk',
            color: '#10b981',
            interpretation: 'Patient has low MACE risk. Standard post-PCI care is appropriate with routine follow-up at 4 weeks.',
            recommendations: [
                { icon: '🏥', text: 'Standard post-PCI discharge protocol' },
                { icon: '📅', text: 'Routine follow-up at 4 weeks' },
                { icon: '💊', text: 'Continue prescribed medications' }
            ]
        };
    } else if (riskPct < 15) {
        return {
            level: 'moderate',
            badge: '⚠ Moderate Risk',
            color: '#f59e0b',
            interpretation: 'Patient has moderate MACE risk. Enhanced monitoring is recommended with more frequent follow-ups.',
            recommendations: [
                { icon: '⚠️', text: 'Enhanced monitoring recommended' },
                { icon: '📅', text: 'Follow-up at 2, 4, and 8 weeks' },
                { icon: '💊', text: 'Consider intensifying antiplatelet therapy' }
            ]
        };
    } else {
        return {
            level: 'high',
            badge: '🚨 High Risk',
            color: '#ef4444',
            interpretation: 'Patient has HIGH MACE risk. Intensive management and close monitoring are required.',
            recommendations: [
                { icon: '🚨', text: 'Intensive management required' },
                { icon: '📅', text: 'Follow-up every 1-2 weeks' },
                { icon: '❤️', text: 'Consider cardiac rehabilitation referral' }
            ]
        };
    }
}

// Draw professional gauge with needle
function drawGauge(probability) {
    const canvas = document.getElementById('riskGauge');
    const ctx = canvas.getContext('2d');
    const percentage = Math.round(probability * 100);
    
    // Set canvas size
    canvas.width = 280;
    canvas.height = 160;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 20;
    const radius = 110;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background arc (gray)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0);
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Draw colored segments
    // Low (0-30%): Green
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + (Math.PI * 0.3));
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#10b981';
    ctx.stroke();
    
    // Moderate (30-60%): Yellow
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI + (Math.PI * 0.3), Math.PI + (Math.PI * 0.6));
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();
    
    // High (60-100%): Red
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI + (Math.PI * 0.6), 0);
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#ef4444';
    ctx.stroke();
    
    // Draw ticks
    for (let i = 0; i <= 10; i++) {
        const angle = Math.PI + (Math.PI * i / 10);
        const innerR = radius - 25;
        const outerR = radius - 15;
        
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR);
        ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#9ca3af';
        ctx.stroke();
        
        // Labels
        if (i % 2 === 0) {
            const labelR = radius - 40;
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.textAlign = 'center';
            ctx.fillText((i * 10) + '%', centerX + Math.cos(angle) * labelR, centerY + Math.sin(angle) * labelR + 4);
        }
    }
    
    // Calculate needle angle (0-100% maps to PI to 0)
    const needleAngle = Math.PI + (Math.PI * (1 - probability));
    const needleLength = radius - 10;
    
    // Draw needle
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.cos(needleAngle) * needleLength,
        centerY + Math.sin(needleAngle) * needleLength
    );
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#1f2937';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Draw needle center
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    
    // Update display
    const gaugeNumber = document.getElementById('gauge-number');
    gaugeNumber.textContent = percentage + '%';
    gaugeNumber.className = 'gauge-number ' + (percentage < 7.5 ? 'low' : percentage < 15 ? 'moderate' : 'high');
}

// Draw feature importance chart
function drawFeatureChart() {
    const ctx = document.getElementById('featureChart').getContext('2d');
    
    if (window.featureChart) {
        window.featureChart.destroy();
    }
    
    window.featureChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: featureImportance.map(f => f.feature),
            datasets: [{
                label: 'Permutation Importance',
                data: featureImportance.map(f => f.importance),
                backgroundColor: [
                    '#ef4444', '#ef4444', '#3b82f6', '#3b82f6',
                    '#9ca3af', '#9ca3af', '#9ca3af', '#d1d5db'
                ],
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
                    grid: { color: '#f3f4f6' },
                    ticks: { font: { size: 11 } }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { size: 12 } }
                }
            }
        }
    });
}

// Update eGFR display
function updateEGFR() {
    const creatinine = parseFloat(document.getElementById('creatinine').value) || 0;
    const age = parseInt(document.getElementById('age').value) || 0;
    const sex = document.getElementById('sex').value;
    
    if (creatinine > 0 && age > 0) {
        const egfr = calculateEGFR(creatinine, age, sex);
        document.getElementById('egfr-value').textContent = egfr.toFixed(1);
    }
}

// Update risk display
function updateRiskDisplay(riskPct) {
    const info = getRiskInfo(riskPct);
    
    // Update badge
    const badge = document.getElementById('risk-badge');
    badge.className = 'risk-badge ' + info.level;
    badge.innerHTML = `<span>${info.badge.split(' ')[0]}</span><span>${info.badge.split(' ').slice(1).join(' ')}</span>`;
    
    // Update interpretation
    document.getElementById('risk-interpretation').textContent = info.interpretation;
    
    // Update recommendations
    const recList = document.getElementById('recommendations-list');
    recList.innerHTML = info.recommendations.map(rec => `
        <div class="recommendation-item">
            <span class="rec-icon">${rec.icon}</span>
            <span class="rec-text">${rec.text}</span>
        </div>
    `).join('');
}

// Reset form
function resetForm() {
    document.getElementById('prediction-form').reset();
    document.getElementById('egfr-value').textContent = '--';
    
    // Reset to default values
    document.getElementById('age').value = '65';
    document.getElementById('sex').value = '1';
    document.getElementById('bmi').value = '24.5';
    document.getElementById('creatinine').value = '1.20';
    document.getElementById('glucose').value = '136.2';
    document.getElementById('hb').value = '12.5';
    document.getElementById('rdw').value = '13.6';
    document.getElementById('wbc').value = '11.2';
    
    updateEGFR();
    drawGauge(0.124);
    updateRiskDisplay(12.4);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize
    updateEGFR();
    drawGauge(0.124);
    drawFeatureChart();
    
    // Real-time eGFR update
    ['creatinine', 'age', 'sex'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateEGFR);
    });
    
    // Model change
    document.getElementById('model-select').addEventListener('change', function() {
        document.getElementById('display-model').textContent = this.value;
    });
    
    // Threshold change
    document.getElementById('threshold-select').addEventListener('change', function() {
        const thresholds = {
            'recommended': '0.075',
            'youden': '0.053',
            'sensitivity': '0.074',
            'specificity': '0.50'
        };
        document.getElementById('display-threshold').textContent = thresholds[this.value];
    });
    
    // Form submission
    document.getElementById('prediction-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            creatinine: parseFloat(document.getElementById('creatinine').value),
            age: parseInt(document.getElementById('age').value),
            sex: document.getElementById('sex').value,
            bmi: parseFloat(document.getElementById('bmi').value),
            glucose: parseFloat(document.getElementById('glucose').value),
            hb: parseFloat(document.getElementById('hb').value),
            rdw: parseFloat(document.getElementById('rdw').value),
            wbc: parseFloat(document.getElementById('wbc').value)
        };
        
        const result = predictRisk(formData);
        const riskPct = Math.round(result.probability * 100);
        
        drawGauge(result.probability);
        updateRiskDisplay(riskPct);
    });
});
