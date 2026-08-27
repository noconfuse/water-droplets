// 07 · 贝塞尔曲线
// 知识点：quadraticCurveTo 二次贝塞尔 · 控制点决定弯曲方向 · 多段连成波浪
// 场景：流动的旗帜。打开「显示控制点」就能看到每段曲线的控制点如何决定弯曲。
window.LESSON = {
    no: '07',
    phase: '阶段二',
    title: '贝塞尔曲线',
    subtitle: 'quadraticCurveTo · 控制点 · 波浪与旗帜',
    width: 900,
    height: 500,

    params: [
        { key: 'amplitude', label: '波幅', min: 10, max: 160, step: 2, value: 85 },
        { key: 'wavelength', label: '波长', min: 40, max: 300, step: 5, value: 150 },
        { key: 'speed', label: '波速', min: 0, max: 6, step: 0.1, value: 2 },
        { key: 'thickness', label: '线宽', min: 1, max: 10, step: 1, value: 4 },
        { key: 'color', label: '颜色', type: 'color', value: '#ee6c8e' },
        { key: 'showCtrl', label: '显示控制点', type: 'bool', value: true },
    ],

    code: [
        { template: 'const my = 275 + ${amplitude} * Math.sin(t * ${speed} + x / ${wavelength} * Math.PI * 2);', keys: ['amplitude', 'speed', 'wavelength'] },
        { template: 'ctx.quadraticCurveTo(mx, my, x, y);', keys: [] },
        { template: 'ctx.arc(mx, my, 4, 0, Math.PI * 2); // 控制点', keys: [], show: (p) => p.showCtrl },
        { template: 'ctx.lineWidth = ${thickness};', keys: ['thickness'] },
        { template: "ctx.strokeStyle = '${color}';", keys: ['color'] },
    ],

    steps: [
        { at: 0.1, label: '① 基线' },
        { at: 0.32, label: '② 一条二次贝塞尔线段' },
        { at: 0.58, label: '③ 多段连成波浪' },
        { at: 0.82, label: '④ 闭合填充成旗面' },
        { at: 1, label: '⑤ 时间驱动 → 流动' },
    ],

    challenge: {
        desc: '让波浪「又急又快」：波长 ≤ 100、波速 ≥ 4。',
        check: (p) => p.wavelength <= 100 && p.speed >= 4,
    },

    draw(ctx, p, t, step) {
        const W = this.width, H = this.height;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);
        if (step < 0.1) return;

        const base = H * 0.55;
        const segW = 40;

        // ① 基线
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 7]);
        ctx.beginPath(); ctx.moveTo(10, base); ctx.lineTo(W - 10, base); ctx.stroke();
        ctx.setLineDash([]);

        // 波浪函数
        const wave = (s) => base + Math.sin(t * p.speed + s / p.wavelength * Math.PI * 2) * p.amplitude;

        const full = step >= 0.58;
        const maxX = full ? W : segW;

        // ②③ 二次贝塞尔连线
        if (step >= 0.32) {
            ctx.beginPath();
            ctx.moveTo(0, wave(0));
            for (let x = 0; x < maxX; x += segW) {
                const mx = x + segW / 2, my = wave(mx);
                const nx = x + segW, ny = wave(nx);
                ctx.quadraticCurveTo(mx, my, nx, ny);

                // 控制点（教学示意）
                if (p.showCtrl) {
                    ctx.fillStyle = '#ff6b8a';
                    ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = 'rgba(255,107,138,0.4)';
                    ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx, base); ctx.stroke();
                }
            }

            // ④ 填充旗面
            if (full && step >= 0.82) {
                ctx.lineTo(W, H);
                ctx.lineTo(0, H);
                ctx.closePath();
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.22;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.thickness;
            ctx.lineJoin = 'round';
            ctx.stroke();
        }
    },
};