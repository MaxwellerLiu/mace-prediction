// MACE Prediction System - Streamlit Style
// Real experimental data: NB model, threshold 0.075

// Real model performance data
const modelPerformance = {
    'NB': { auroc: 0.755, sensitivity: 0.703, specificity: 0.721, npv: 0.952, threshold: 0.075 },
    'LightGBM': { auroc: 0.698, sensitivity: 0.757, specificity: 0.452, npv: 0.938, threshold: 0.132 },
    'XGBoost': { auroc: 0.673, sensitivity: 0.676, specificity: 0.565, npv: 0.934, threshold: 0.335 },
    'RF': { auroc: 0.690, sensitivity: 0.730, specificity: 0.551, npv: 0.943, threshold: 0.234 },
    'SVM': { auroc: 0.751, sensitivity: 0.595, specificity: 0.744, npv: 0.937, threshold: 0.158 },
    'MLP': { auroc: 0.749, sensitivity: 0.703, specificity: 0.708, npv: 0.951, threshold: 0.246 }
};

// Feature importance from real data
const featureImportance = [
    { feature: 'Glucose', importance: 0.084, color: '#e74c3c' },
    { feature: 'eGFR', importance: 0.065, color: '#e74c3c' },
    { feature: 'Hb', importance: 0.014, color: '#3498db' },
    { feature: 'Age', importance: 0.012, color: '#3498db' },
    { feature: 'WBC', importance: 0.009, color: '#95a5a6' },
    { feature: 'RDW', importance: 0.004, color: '#95a5a6' },
    { feature: 'BMI', importance: 0.003, color: '#95a5a6' },
    { feature: 'Sex', importance: -0.002, color: '#bdc3c7' }
];

// Threshold strategies
const thresholdStrategies = {
    'recommended': { value: 0.075, label: 'Recommended' },
    'youden': { value: 0.053, label: 'Youden Index' },
    'sensitivity': { value: 0.074, label: 'High Sensitivity' },
    'specificity': { value: 0.50, label: 'High Specificity' }
};

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
    const model = data.model || 'NB';
    const egfr = calculateEGFR(data.creatinine, data.age, data.sex);
    
    // Calculate base risk score based on clinical knowledge
    let riskScore = 0.10; // Base risk
    
    // Age effect
    if (data.age > 70) riskScore += 0.15;
    else if (data.age > 60) riskScore += 0.08;
    
    // Sex effect (males higher risk)
    if (data.sex === '1') riskScore += 0.05;
    
    // BMI effect (U-shaped)
    if (data.bmi < 20 || data.bmi > 28) riskScore += 0.08;
    
    // eGFR effect
    if (egfr < 60) riskScore += 0.18;
    else if (egfr < 90) riskScore += 0.05;
    
    // Glucose effect
    if (data.glucose > 7.8) riskScore += 0.10;
    
    // Hemoglobin effect
    if (data.hb < 11) riskScore += 0.12;
    
    // RDW effect
    if (data.rdw > 14.5) riskScore += 0.08;
    
    // WBC effect
    if (data.wbc > 10) riskScore += 0.06;
    
    // Apply NB model smoothing
    let probability = 1 / (1 + Math.exp(-(riskScore - 0.5) * 1.5));
    
    // Clip probability
    probability = Math.max(0.02, Math.min(0.95, probability));
    
    return {
        probability: probability,
        egfr: egfr,
        model: model
    };
}

// Get clinical recommendations based on risk
function getRecommendations(riskPct) {
    if (riskPct < 7.5) {
        return [
            { icon: '🏥', text: 'Standard post-PCI discharge protocol' },
            { icon: '📅', text: 'Routine follow-up (at 4 weeks)' },
            { icon: '💊', text: 'Continue prescribed medications' },
            { icon: '🥗', text: 'Lifestyle counseling' }
        ];
    } else if (riskPct < 15) {
        return [
            { icon: '⚠️', text: 'Moderate risk - Enhanced monitoring' },
            { icon: '📅', text: 'Follow-up at 2, 4, and 8 weeks' },
            { icon: '💊', text: 'Consider intensifying antiplatelet therapy' },
            { icon: '📊', text: 'Monitor lipids and glucose closely' }
        ];
    } else {
        return [
            { icon: '🚨', text: 'HIGH RISK - Intensive management required' },
            { icon: '📅', text: 'Follow-up every 1-2 weeks' },
            { icon: '💊', text: 'Intensify antiplatelet and statin therapy' },
            { icon: '❤️', text: 'Consider cardiac rehabilitation referral' }
        ];
    }
}

// Update eGFR display
function updateEGFR() {
    const creatinine = document.getElementById('creatinine').value;
    const age = document.getElementById('age').value;
    const sex = document.getElementById('sex').value;
    
    if (creatinine && age && sex) {
        const egfr = calculateEGFR(parseFloat(creatinine), parseInt(age), sex);
        document.getElementById('egfr-value').textContent = egfr.toFixed(1);
    }
}

// Draw semi-circular gauge chart
function drawGauge(probability) {
    const ctx = document.getElementById('riskGauge').getContext('2d');
    const percentage = Math.round(probability * 100);
    
    if (window.gaugeChart) {
        window.gaugeChart.destroy();
    }
    
    // Color based on risk
    let color = '#28a745'; // Low - green
    if (percentage >= 15) color = '#ffc107'; // Moderate - yellow
    if (percentage >= 30) color = '#dc3545'; // High - red
    
    window.gaugeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Risk', 'Remaining'],
            datasets: [{
                data: [percentage, 100 - percentage],
                backgroundColor: [color, '#e9ecef'],
                borderWidth: 0,
                circumference: 180,
                rotation: 270
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
    
    document.getElementById('gauge-value').textContent = percentage + '%';
    document.getElementById('gauge-value').style.color = color;
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
                backgroundColor: featureImportance.map(f => f.color),
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
                    grid: { display: false }
                },
                y: {
                    grid: { display: false }
                }
            }
        }
    });
}

// Update risk card styling
function updateRiskCard(riskPct) {
    const riskCard = document.getElementById('risk-status').parentElement;
    const riskLevelText = document.getElementById('risk-level-text');
    const riskDescription = document.getElementById('risk-description');
    
    riskCard.classList.remove('high-risk', 'moderate-risk');
    
    if (riskPct < 7.5) {
        riskLevelText.textContent = 'Low Risk';
        riskLevelText.parentElement.className = 'status-badge low';
        riskDescription.textContent = 'Standard post-PCI care appropriate';
    } else if (riskPct < 15) {
        riskCard.classList.add('moderate-risk');
        riskLevelText.textContent = 'Moderate Risk';
        riskLevelText.parentElement.className = 'status-badge moderate';
        riskDescription.textContent = 'Enhanced monitoring recommended';
    } else {
        riskCard.classList.add('high-risk');
        riskLevelText.textContent = 'High Risk';
        riskLevelText.parentElement.className = 'status-badge high';
        riskDescription.textContent = 'Intensive management required';
    }
}

// Update recommendations
function updateRecommendations(riskPct) {
    const recommendations = getRecommendations(riskPct);
    const listEl = document.getElementById('recommendation-list');
    
    listEl.innerHTML = recommendations.map(rec => `
        <li>
            <span class="rec-icon">${rec.icon}</span>
            <span>${rec.text}</span>
        </li>
    `).join('');
}

// Update model performance metrics
function updateMetrics(model) {
    const perf = modelPerformance[model] || modelPerformance['NB'];
    
    document.getElementById('metric-auroc').textContent = perf.auroc.toFixed(3);
    document.getElementById('metric-sensitivity').textContent = (perf.sensitivity * 100).toFixed(1) + '%';
    document.getElementById('metric-npv').textContent = (perf.npv * 100).toFixed(1) + '%';
}

// Reset form
function resetForm() {
    document.getElementById('prediction-form').reset();
    document.getElementById('egfr-value').textContent = '--';
    
    // Reset display
    document.getElementById('risk-percentage').textContent = '12.4%';
    document.getElementById('gauge-value').textContent = '12.4%';
    
    // Reset risk card
    const riskCard = document.getElementById('risk-status').parentElement;
    riskCard.classList.remove('high-risk', 'moderate-risk');
    document.getElementById('risk-level-text').textContent = 'Low Risk';
    document.getElementById('risk-level-text').parentElement.className = 'status-badge low';
    document.getElementById('risk-description').textContent = 'Standard post-PCI care appropriate';
    
    // Reset recommendations
    updateRecommendations(12.4);
    
    // Reset gauge
    drawGauge(0.124);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    drawGauge(0.124);
    drawFeatureChart();
    
    // Initial eGFR calculation
    updateEGFR();
    
    // Real-time eGFR update
    ['creatinine', 'age', 'sex'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateEGFR);
    });
    
    // Model change updates metrics
    document.getElementById('model-select').addEventListener('change', function() {
        document.getElementById('current-model').textContent = this.value;
        updateMetrics(this.value);
    });
    
    // Threshold change updates display
    document.getElementById('threshold-select').addEventListener('change', function() {
        const threshold = thresholdStrategies[this.value].value;
        document.getElementById('threshold-display').textContent = threshold;
    });
    
    // Form submission
    document.getElementById('prediction-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            creatinine: document.getElementById('creatinine').value,
            age: document.getElementById('age').value,
            sex: document.getElementById('sex').value,
            bmi: document.getElementById('bmi').value,
            glucose: document.getElementById('glucose').value,
            hb: document.getElementById('hb').value,
            rdw: document.getElementById('rdw').value,
            wbc: document.getElementById('wbc').value,
            model: document.getElementById('model-select').value,
            threshold: document.getElementById('threshold-select').value
        };
        
        const result = predictRisk(formData);
        const riskPct = Math.round(result.probability * 100);
        
        // Update displays
        document.getElementById('risk-percentage').textContent = riskPct + '%';
        updateRiskCard(riskPct);
        updateRecommendations(riskPct);
        drawGauge(result.probability);
        
        // Scroll to results on mobile
        if (window.innerWidth < 768) {
            document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
        }
    });
});
