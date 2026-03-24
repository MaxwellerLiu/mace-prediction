// MACE Risk Prediction - Clean Version

const features = [
    { name: 'Glucose', value: 0.084, color: '#ef4444' },
    { name: 'eGFR', value: 0.065, color: '#ef4444' },
    { name: 'Hemoglobin', value: 0.014, color: '#3b82f6' },
    { name: 'Age', value: 0.012, color: '#3b82f6' },
    { name: 'WBC', value: 0.009, color: '#6b7280' },
    { name: 'RDW', value: 0.004, color: '#6b7280' },
    { name: 'BMI', value: 0.003, color: '#6b7280' },
    { name: 'Sex', value: -0.002, color: '#9ca3af' }
];

// Calculate eGFR
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

// Predict risk
function predictRisk(data) {
    const egfr = calculateEGFR(data.creatinine, data.age, data.sex);
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
    
    let probability = 1 / (1 + Math.exp(-(riskScore - 0.5) * 1.5));
    return Math.max(0.02, Math.min(0.95, probability));
}

// Get risk info
function getRiskInfo(riskPct) {
    if (riskPct < 30) {
        return {
            level: 'low',
            text: '✓ Low Risk',
            interpretation: 'Patient has LOW MACE risk. Standard post-PCI care is appropriate.',
            recommendations: ['Standard post-PCI discharge protocol', 'Routine follow-up at 4 weeks', 'Continue prescribed medications']
        };
    } else if (riskPct < 60) {
        return {
            level: 'moderate',
            text: '⚠ Moderate Risk',
            interpretation: 'Patient has MODERATE MACE risk. Enhanced monitoring is recommended.',
            recommendations: ['Enhanced monitoring recommended', 'Follow-up at 2, 4, and 8 weeks', 'Consider intensifying antiplatelet therapy']
        };
    } else {
        return {
            level: 'high',
            text: '🚨 High Risk',
            interpretation: 'Patient has HIGH MACE risk! Intensive management is required.',
            recommendations: ['Intensive management required', 'Follow-up every 1-2 weeks', 'Consider cardiac rehabilitation referral']
        };
    }
}

// Draw gauge
function drawGauge(probability) {
    const canvas = document.getElementById('gaugeCanvas');
    const ctx = canvas.getContext('2d');
    const percentage = Math.round(probability * 100);
    
    canvas.width = 240;
    canvas.height = 130;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 10;
    const radius = 85;
    const lineWidth = 16;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();
    
    // Green: 0-30%
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + Math.PI * 0.30);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#22c55e';
    ctx.stroke();
    
    // Yellow: 30-60%
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI + Math.PI * 0.30, Math.PI + Math.PI * 0.60);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();
    
    // Red: 60-100%
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI + Math.PI * 0.60, 2 * Math.PI);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#ef4444';
    ctx.stroke();
    
    // Ticks and labels
    for (let i = 0; i <= 10; i++) {
        const angle = Math.PI + (Math.PI * i / 10);
        const innerR = radius - 22;
        const outerR = radius - 14;
        
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR);
        ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#94a3b8';
        ctx.stroke();
        
        if (i % 5 === 0) {
            const labelR = radius - 32;
            ctx.font = '11px sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.textAlign = 'center';
            ctx.fillText((i * 10) + '%', centerX + Math.cos(angle) * labelR, centerY + Math.sin(angle) * labelR + 4);
        }
    }
    
    // Needle
    const needleAngle = Math.PI + (Math.PI * probability);
    const needleLength = radius - 5;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(needleAngle) * needleLength, centerY + Math.sin(needleAngle) * needleLength);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1e293b';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    
    // Update display
    const info = getRiskInfo(percentage);
    const pctEl = document.getElementById('gauge-percentage');
    pctEl.textContent = percentage + '%';
    pctEl.className = 'gauge-percentage ' + info.level;
    
    const levelEl = document.getElementById('gauge-level');
    levelEl.textContent = info.text;
    levelEl.className = 'gauge-level ' + info.level;
    
    document.getElementById('risk-interpretation').textContent = info.interpretation;
    
    const icons = ['🏥', '📅', '💊'];
    const recList = document.getElementById('recommendation-list');
    recList.innerHTML = info.recommendations.map((rec, i) => 
        `<li><span>${icons[i]}</span><span>${rec}</span></li>`
    ).join('');
}

// Update eGFR
function updateEGFR() {
    const crea = parseFloat(document.getElementById('creatinine').value) || 0;
    const age = parseInt(document.getElementById('age').value) || 0;
    const sex = document.getElementById('sex').value;
    
    if (crea > 0 && age > 0) {
        const egfr = calculateEGFR(crea, age, sex);
        document.getElementById('egfr-value').textContent = egfr.toFixed(1);
    }
}

// Reset
function resetForm() {
    document.getElementById('prediction-form').reset();
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
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateEGFR();
    drawGauge(0.124);
    
    ['creatinine', 'age', 'sex'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateEGFR);
    });
    
    document.getElementById('prediction-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const data = {
            age: parseInt(document.getElementById('age').value),
            sex: document.getElementById('sex').value,
            bmi: parseFloat(document.getElementById('bmi').value),
            creatinine: parseFloat(document.getElementById('creatinine').value),
            glucose: parseFloat(document.getElementById('glucose').value),
            hb: parseFloat(document.getElementById('hb').value),
            rdw: parseFloat(document.getElementById('rdw').value),
            wbc: parseFloat(document.getElementById('wbc').value)
        };
        
        const probability = predictRisk(data);
        drawGauge(probability);
    });
});
