// 05 · 三角函数与圆形运动
// 知识点：Math.sin / Math.cos 单位圆 · 极坐标 → 直角坐标 · 动画驱动
// 场景：行星绕恒星公转。x = cx + r·cos(θ)，y = cy + r·sin(θ)。
window.LESSON = {
    no: '05',
    phase: '阶段二',
    title: '三角函数与圆形运动',
    subtitle: 'Math.sin · Math.cos · 极坐标转直角坐标',
    width: 900,
    height: 500,

    params: [
        { key: 'count', label: '行星数量', min: 1, max: 24, step: 1, value: 8 },
        { key: 'radius', label: '轨道半径', min: 40, max: 230, step: 2, value: 170 },
        { key: 'speed', label: '公转速度', min: 0, max: 5, step: 0.1, value: 1.2 },
        { key: 'dotSize', label: '行星大小', min: 2, max: 12, step: 1, value: 6 },
        { key: 'color', label: '行星颜色', type: 'color', value: '#4cc2ff' },
    ],

    code: [
        { template: 'for (let i = 0; i < ${count}; i++) {', keys: ['count'] },
        { template: '  const angle = i / ${count} * Math.PI * 2 + t * ${speed};', keys: ['count', 'speed'] },
        { template: '  const x = 450 + ${radius} * Math.cos(angle);', keys: ['radius'] },
        { template: '  const y = 250 + ${radius} * Math.sin(angle);', keys: ['radius'] },
        { template: "  ctx.fillStyle = '${color}';", keys: ['color'] },
        { template: '  ctx.arc(x, y, ${dotSize}, 0, Math.PI * 2);', keys: ['dotSize'] },
    ],

    steps: [
        { at: 0.1, label: '① 恒星（径向渐变）' },
        { at: 0.22, label: '② 轨道圆' },
        { at: 0.4, label: '③ 一个行星：cos/sin 定位' },
        { at: 0.68, label: '④ 多行星按相位排布' },
        { at: 0.9, label: '⑤ 时间驱动 → 公转' },
    ],

    challenge: {
        desc: '来一条壮观的「行星环」：至少 16 颗行星。',
        check: (p) => p.count >= 16,
    },

    draw(ctx, p, t, step) {
        const W = this.width, H = this.height;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);
        if (step < 0.1) return;

        const cx = W / 2, cy = H / 2;

        // ① 恒星
        const star = ctx.createRadialGradient(cx, cy, 0, cx, cy, 64);
        star.addColorStop(0, '#fff7e0');
        star.addColorStop(0.5, p.color);
        star.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = star;
        ctx.beginPath(); ctx.arc(cx, cy, 64, 0, Math.PI * 2); ctx.fill();
        if (step < 0.22) return;

        // ② 轨道
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 7]);
        ctx.beginPath(); ctx.arc(cx, cy, p.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);

        // ③④ 行星（随 step 增多）
        const prog = Math.min(1, Math.max(0, (step - 0.4) / 0.28));
        const n = Math.max(1, Math.floor(p.count * prog));

        for (let i = 0; i < n; i++) {
            const phase = i / p.count * Math.PI * 2;
            const a = phase + (step >= 0.9 ? t * p.speed : 0);
            const x = cx + p.radius * Math.cos(a);
            const y = cy + p.radius * Math.sin(a);

            // 行星带一点发光
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.9;
            ctx.beginPath(); ctx.arc(x, y, p.dotSize, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.beginPath(); ctx.arc(x - p.dotSize * 0.3, y - p.dotSize * 0.3, p.dotSize * 0.35, 0, Math.PI * 2); ctx.fill();
        }

        // 公式标注
        if (step >= 0.9) {
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('x = cx + r·cos(θ)     y = cy + r·sin(θ)', cx, cy + 105);
        }
    },
};