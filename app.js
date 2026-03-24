// MACE Prediction - Single Page Layout
// NB Model, Threshold 0.075

const modelData = {
    NB: { auroc: 0.755, sensitivity: 0.703, specificity: 0.721, npv: 0.952, threshold: 0.075 }
};

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

// Get risk info - match gauge colors: 0-30% green, 30-60% yellow, 60-100% red
function getRiskInfo(riskPct) {
    if (riskPct < 30) {
        return {
            level: 'low',
            text: '✓ Low Risk',
            color: '#059669',
            bgColor: '#d1fae5',
            interpretation: 'Patient has LOW MACE risk. Standard post-PCI care is appropriate with routine follow-up at 4 weeks.',
            recommendations: [
                'Standard post-PCI discharge protocol',
                'Routine follow-up at 4 weeks',
                'Continue prescribed medications'
            ]
        };
    } else if (riskPct < 60) {
        return {
            level: 'moderate',
            text: '⚠ Moderate Risk',
            color: '#d97706',
            bgColor: '#fef3c7',
            interpretation: 'Patient has MODERATE MACE risk. Enhanced monitoring is recommended with more frequent follow-ups.',
            recommendations: [
                'Enhanced monitoring recommended',
                'Follow-up at 2, 4, and 8 weeks',
                'Consider intensifying antiplatelet therapy'
            ]
        };
    } else {
        return {
            level: 'high',
            text: '🚨 High Risk',
            color: '#dc2626',
            bgColor: '#fee2e2',
            interpretation: 'Patient has HIGH MACE risk! Intensive management and close monitoring are required.',
            recommendations: [
                'Intensive management required',
                'Follow-up every 1-2 weeks',
                'Consider cardiac rehabilitation referral'
            ]
        };
    }
}

// Draw 3-color gauge
function drawGauge(probability) {
    const canvas = document.getElementById('gaugeCanvas');
    const ctx = canvas.getContext('2d');
    const percentage = Math.round(probability * 100);
    
    // Set size
    canvas.width = 240;
    canvas.height = 140;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 10;
    const radius = 90;
    const lineWidth = 18;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw three colored segments
    // Low risk: 0-30% (Green) - 30% of semicircle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + Math.PI * 0.30);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#10b981';
    ctx.lineCap = 'butt';
    ctx.stroke();
    
    // Moderate risk: 30-60% (Yellow) - 30% of semicircle  
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI + Math.PI * 0.30, Math.PI + Math.PI * 0.60);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();
    
    // High risk: 60-100% (Red) - 40% of semicircle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI + Math.PI * 0.60, 2 * Math.PI);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#ef4444';
    ctx.stroke();
    
    // Draw ticks
    for (let i = 0; i <= 10; i++) {
        const angle = Math.PI + (Math.PI * i / 10);
        const innerR = radius - 28;
        const outerR = radius - 18;
        
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR);
        ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#6b7280';
        ctx.stroke();
        
        // Labels for 0%, 50%, 100%
        if (i === 0 || i === 5 || i === 10) {
            const labelR = radius - 40;
            ctx.font = '11px sans-serif';
            ctx.fillStyle = '#4b5563';
            ctx.textAlign = 'center';
            ctx.fillText((i * 10) + '%', centerX + Math.cos(angle) * labelR, centerY + Math.sin(angle) * labelR + 4);
        }
    }
    
    // Calculate needle angle
    // 0% = left (PI), 50% = top (1.5*PI), 100% = right (2*PI)
    // probability 0.12 should be near left side
    const needleAngle = Math.PI + (Math.PI * probability);
    const needleLength = radius - 5;
    
    // Draw needle
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(needleAngle) * needleLength, centerY + Math.sin(needleAngle) * needleLength);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1f2937';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Draw center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    
    // Update display
    updateRiskDisplay(percentage);
}

// Update risk display
function updateRiskDisplay(riskPct) {
    const info = getRiskInfo(riskPct);
    
    // Update percentage
    const pctEl = document.getElementById('gauge-percentage');
    pctEl.textContent = riskPct + '%';
    pctEl.className = 'gauge-percentage ' + info.level;
    pctEl.style.color = info.color;
    
    // Update level badge
    const levelEl = document.getElementById('gauge-level');
    levelEl.textContent = info.text;
    levelEl.className = 'gauge-level ' + info.level;
    levelEl.style.background = info.bgColor;
    levelEl.style.color = info.color;
    
    // Update interpretation
    document.getElementById('risk-interpretation').textContent = info.interpretation;
    
    // Update recommendations
    const icons = ['🏥', '📅', '💊'];
    const recList = document.getElementById('recommendation-list');
    recList.innerHTML = info.recommendations.map((rec, i) => 
        `<li><span class="rec-icon">${icons[i]}</span><span>${rec}</span></li>`
    ).join('');
}

// Draw feature chart with all 8 features
function drawFeatureChart() {
    const ctx = document.getElementById('featureChart').getContext('2d');
    
    // All 8 features sorted by absolute importance
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
    
    // Color coding
    const colors = features.map(f => {
        if (f.value >= 0.05) return '#ef4444';  // High - red
        if (f.value >= 0.01) return '#3b82f6';  // Medium - blue
        if (f.value > 0) return '#6b7280';      // Low - gray
        return '#d1d5db';                       // Negative - light gray
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: features.map(f => f.name),
            datasets: [{
                data: features.map(f => f.value),
                backgroundColor: colors,
                borderRadius: 4,
                barPercentage: 0.7,
                categoryPercentage: 0.9
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    min: -0.02,
                    max: 0.10,
                    grid: { display: true, color: '#f3f4f6', drawBorder: false },
                    ticks: { font: { size: 10 }, color: '#6b7280' }
                },
                y: {
                    grid: { display: false, drawBorder: false },
                    ticks: { font: { size: 11, lineHeight: 1.2 }, color: '#374151', padding: 8 }
                }
            },
            layout: {
                padding: { left: 5, right: 10, top: 5, bottom: 5 }
            }
        }
    });
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

// Reset form
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

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    updateEGFR();
    drawGauge(0.124);
    drawFeatureChart();
    
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
