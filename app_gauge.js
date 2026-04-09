// ============================================
// GAUGE - 半圆仪表盘（180度）
// ============================================
function drawGauge(probability, riskLevelText, riskColor) {
    const canvas = document.getElementById('gaugeCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const percentage = Math.round(probability * 100);
    
    // Canvas 设置
    canvas.width = 500;
    canvas.height = 280;
    
    const cx = canvas.width / 2;
    const cy = canvas.height - 40;
    const r = 140;
    const thickness = 30;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 度数转弧度
    const d2r = (d) => d * Math.PI / 180;
    
    // 半圆：0%在左(180度)，100%在右(0度)
    // 使用顺时针方向从180度到0度，经过上方(90度)
    const startAngle = d2r(180);  // 0% = 左
    const endAngle = d2r(0);      // 100% = 右
    
    // 各区域边界（按实际比例）
    // 0-10% = 180度到162度（18度跨度）
    // 10-20% = 162度到144度
    // 20-30% = 144度到126度
    // 30-100% = 126度到0度
    const greenEnd = d2r(180 - 18);   // 10% = 162度
    const yellowEnd = d2r(162 - 18);  // 20% = 144度
    const orangeEnd = d2r(144 - 18);  // 30% = 126度
    
    // 绘制区域（顺时针：180->0经过上方）
    // 绿色：180-162度
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, greenEnd, false);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = '#22c55e';
    ctx.stroke();
    
    // 黄色：162-144度
    ctx.beginPath();
    ctx.arc(cx, cy, r, greenEnd, yellowEnd, false);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();
    
    // 橙色：144-126度
    ctx.beginPath();
    ctx.arc(cx, cy, r, yellowEnd, orangeEnd, false);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = '#f97316';
    ctx.stroke();
    
    // 红色：126-0度
    ctx.beginPath();
    ctx.arc(cx, cy, r, orangeEnd, endAngle, false);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = '#ef4444';
    ctx.stroke();
    
    // 白色分隔线
    [greenEnd, yellowEnd, orangeEnd].forEach(angle => {
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * (r - thickness/2 - 2), cy + Math.sin(angle) * (r - thickness/2 - 2));
        ctx.lineTo(cx + Math.cos(angle) * (r + thickness/2 + 2), cy + Math.sin(angle) * (r + thickness/2 + 2));
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
    });
    
    // 刻度标记
    const ticks = [
        { pct: 0, angle: startAngle },
        { pct: 10, angle: greenEnd },
        { pct: 20, angle: yellowEnd },
        { pct: 30, angle: orangeEnd },
        { pct: 50, angle: d2r(90) },
        { pct: 75, angle: d2r(45) },
        { pct: 100, angle: endAngle }
    ];
    
    ticks.forEach(t => {
        const isMain = [0, 10, 20, 30, 100].includes(t.pct);
        const tickLen = isMain ? 16 : 10;
        
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(t.angle) * (r - thickness/2 - tickLen), cy + Math.sin(t.angle) * (r - thickness/2 - tickLen));
        ctx.lineTo(cx + Math.cos(t.angle) * (r + thickness/2 + tickLen), cy + Math.sin(t.angle) * (r + thickness/2 + tickLen));
        ctx.lineWidth = isMain ? 3 : 2;
        ctx.strokeStyle = '#374151';
        ctx.stroke();
        
        const labelR = r + thickness/2 + 30;
        ctx.font = isMain ? 'bold 14px sans-serif' : 'bold 11px sans-serif';
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.pct + '%', cx + Math.cos(t.angle) * labelR, cy + Math.sin(t.angle) * labelR);
    });
    
    // 指针角度：0%=180度，100%=0度
    const needleDeg = 180 - (180 * probability);
    const needleAngle = d2r(needleDeg);
    const needleLen = r - thickness/2 - 10;
    
    // 指针阴影
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy + 2);
    ctx.lineTo(cx + 2 + Math.cos(needleAngle) * needleLen, cy + 2 + Math.sin(needleAngle) * needleLen);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // 指针主体
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(needleAngle) * needleLen, cy + Math.sin(needleAngle) * needleLen);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#1f2937';
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // 中心圆点
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    
    // 中心文字
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 70, cy - 70, 140, 75);
    
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(percentage + '%', cx, cy - 45);
    
    if (riskLevelText) {
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = riskColor || '#6b7280';
        ctx.fillText(riskLevelText, cx, cy - 20);
    }
}