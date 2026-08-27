// 01 · 画布与坐标系
// 知识点：getContext('2d') · fillRect / strokeRect / clearRect · 原点在左上角，y 向下
window.LESSON = {
    no: '01',
    phase: '阶段一',
    title: '画布与坐标系',
    subtitle: 'getContext · fillRect · strokeRect · clearRect',
    width: 900,
    height: 500,

    params: [
        { key: 'x', label: '矩形左上角 X', min: 0, max: 700, step: 1, value: 140 },
        { key: 'y', label: '矩形左上角 Y', min: 0, max: 380, step: 1, value: 120 },
        { key: 'w', label: '宽度', min: 20, max: 320, step: 1, value: 180 },
        { key: 'h', label: '高度', min: 20, max: 240, step: 1, value: 110 },
        { key: 'color', label: '填充色', type: 'color', value: '#4cc2ff' },
        { key: 'stroke', label: '显示描边', type: 'bool', value: true },
    ],

    code: [
        { template: "ctx.fillStyle = '${color}';", keys: ['color'] },
        { template: 'ctx.fillRect(${x}, ${y}, ${w}, ${h});', keys: ['x', 'y', 'w', 'h'] },
        { template: 'ctx.strokeRect(${x}, ${y}, ${w}, ${h});', keys: ['x', 'y', 'w', 'h'], show: (p) => p.stroke },
    ],

    steps: [
        { at: 0.08, label: '① 画布与坐标网格' },
        { at: 0.4, label: '② fillRect 填充矩形' },
        { at: 0.62, label: '③ strokeRect 描边' },
        { at: 0.85, label: '④ 左上角坐标 (x, y)' },
    ],

    challenge: {
        desc: '把矩形放到画面正中心：X 居中、Y 居中，并放大到最大尺寸。',
        check: (p) => p.x >= 360 && p.x <= 380 && p.y >= 230 && p.y <= 250 && p.w >= 300 && p.h >= 220,
    },

    draw(ctx, p, t, step) {
        const W = this.width, H = this.height;

        // 背景
        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);

        // —— 步骤① 坐标网格：帮助理解坐标系 ——
        if (step < 0.08) return;
        ctx.lineWidth = 1;
        for (let gx = 0; gx <= W; gx += 50) {
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
        }
        for (let gy = 0; gy <= H; gy += 50) {
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
        }

        // 坐标轴与原点
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, H); ctx.stroke();
        ctx.fillStyle = '#ff6b9d';
        ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
        ctx.font = '13px sans-serif';
        ctx.fillText('原点 (0,0)', 10, 22);

        // 轴方向提示
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('x →', W - 44, 16);
        ctx.fillText('y ↓', 12, H - 10);

        // —— 步骤② 填充矩形 ——
        if (step < 0.4) return;
        const fillA = Math.min(1, (step - 0.4) / 0.15);
        ctx.globalAlpha = fillA;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.globalAlpha = 1;

        // —— 步骤③ 描边 ——
        if (step < 0.62) return;
        if (p.stroke) {
            const strokeA = Math.min(1, (step - 0.62) / 0.15);
            ctx.globalAlpha = strokeA;
            ctx.strokeStyle = '#ff6b9d';
            ctx.lineWidth = 3;
            ctx.strokeRect(p.x, p.y, p.w, p.h);
            ctx.globalAlpha = 1;
        }

        // —— 步骤④ 坐标标注 ——
        if (step < 0.85) return;
        const labelA = Math.min(1, (step - 0.85) / 0.1);
        ctx.globalAlpha = labelA;
        ctx.fillStyle = '#ffd479';
        ctx.font = '13px "SF Mono", Menlo, monospace';
        ctx.fillText(`(${Math.round(p.x)}, ${Math.round(p.y)})`, p.x + 6, p.y - 8);
        ctx.globalAlpha = 1;

        // 正常模式下：矩形轻微呼吸
        if (step >= 1) {
            const pulse = 0.5 + 0.5 * Math.sin(t * 2);
            ctx.strokeStyle = `rgba(76,194,255,${0.25 + 0.2 * pulse})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(p.x - 3, p.y - 3, p.w + 6, p.h + 6);
        }
    },
};