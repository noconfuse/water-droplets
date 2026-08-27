// 02 · 路径与形状
// 知识点：beginPath 开启路径 · moveTo 起点 · lineTo 连线 · closePath 闭合 · arc 圆弧 · fill/stroke
// 场景：顶点逐渐连成多边形；右侧还有一个用 arc + lineTo 画的时钟
window.LESSON = {
    no: '02',
    phase: '阶段一',
    title: '路径与形状',
    subtitle: 'beginPath · moveTo · lineTo · closePath · arc · fill · stroke',
    width: 900,
    height: 500,

    params: [
        { key: 'sides', label: '多边形边数', min: 3, max: 20, step: 1, value: 8 },
        { key: 'radius', label: '半径', min: 30, max: 220, step: 2, value: 150 },
        { key: 'rot', label: '旋转角°', min: 0, max: 360, step: 1, value: 0 },
        { key: 'fill', label: '填充色', type: 'color', value: '#4a7cf7' },
        { key: 'clock', label: '显示时钟', type: 'bool', value: true },
    ],

    code: [
        { template: 'ctx.beginPath();', keys: [] },
        { template: 'const rot = ${rot} * Math.PI / 180;', keys: ['rot'] },
        { template: 'for (let i = 0; i < ${sides}; i++) {', keys: ['sides'] },
        { template: '  const x = 450 + ${radius} * Math.cos(i / ${sides} * Math.PI * 2);', keys: ['radius', 'sides'] },
        { template: '  ctx.lineTo(x, y);', keys: [] },
        { template: 'ctx.closePath();', keys: [] },
        { template: "ctx.fillStyle = '${fill}';", keys: ['fill'] },
        { template: 'ctx.arc(765, 120, 82, 0, Math.PI * 2); // 表盘', keys: [], show: (p) => p.clock },
        { template: 'ctx.lineTo(x, y); // 指针', keys: [], show: (p) => p.clock },
    ],

    steps: [
        { at: 0.08, label: '① 画布与顶点' },
        { at: 0.3, label: '② lineTo 逐点连线' },
        { at: 0.72, label: '③ closePath 闭合 + 填充' },
        { at: 0.92, label: '④ arc / lineTo 画时钟' },
    ],

    challenge: {
        desc: '把它调成一个正方形，并点亮时钟。',
        check: (p) => p.sides === 4 && p.clock === true,
    },

    draw(ctx, p, t, step) {
        const W = this.width, H = this.height;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);

        // 网格
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let gx = 0; gx <= W; gx += 50) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
        for (let gy = 0; gy <= H; gy += 50) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
        if (step < 0.08) return;

        const cx = W / 2, cy = H / 2;
        const base = p.rot * Math.PI / 180 + (step >= 1 ? t * 0.3 : 0);

        // 计算顶点
        const verts = [];
        for (let i = 0; i < p.sides; i++) {
            const a = -Math.PI / 2 + i / p.sides * Math.PI * 2 + base;
            verts.push([cx + p.radius * Math.cos(a), cy + p.radius * Math.sin(a)]);
        }

        // ② 逐点连线：进度决定连到第几个顶点
        const prog = Math.min(1, Math.max(0, (step - 0.3) / 0.35));
        const nShow = Math.floor(verts.length * prog);

        // 顶点圆点（arc）
        ctx.fillStyle = '#ffd479';
        for (let i = 0; i <= nShow && i < verts.length; i++) {
            ctx.beginPath();
            ctx.arc(verts[i][0], verts[i][1], 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // 已连的线段
        if (step >= 0.3 && nShow > 0) {
            ctx.beginPath();
            ctx.moveTo(verts[0][0], verts[0][1]);
            for (let i = 1; i <= nShow && i < verts.length; i++) ctx.lineTo(verts[i][0], verts[i][1]);
            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // ③ 闭合 + 填充
        if (step >= 0.72) {
            ctx.beginPath();
            ctx.moveTo(verts[0][0], verts[0][1]);
            for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i][0], verts[i][1]);
            ctx.closePath();
            ctx.globalAlpha = 0.28;
            ctx.fillStyle = p.fill;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = p.fill;
            ctx.lineWidth = 3;
            ctx.lineJoin = 'round';
            ctx.stroke();
        }

        // ④ 时钟：arc 表盘 + lineTo 刻度/指针
        if (step >= 0.92 && p.clock) {
            const ccx = W - 135, ccy = 120, R = 82;
            ctx.strokeStyle = 'rgba(255,255,255,0.45)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(ccx, ccy, R, 0, Math.PI * 2); ctx.stroke();
            for (let i = 0; i < 12; i++) {
                const a = i / 12 * Math.PI * 2;
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#fff';
                ctx.beginPath();
                ctx.moveTo(ccx + Math.cos(a) * (R - 12), ccy + Math.sin(a) * (R - 12));
                ctx.lineTo(ccx + Math.cos(a) * R, ccy + Math.sin(a) * R);
                ctx.stroke();
            }
            const sa = t * 1.2, ma = t * 0.12;
            ctx.strokeStyle = '#ff6b8a';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(ccx, ccy); ctx.lineTo(ccx + Math.cos(sa) * R * 0.75, ccy + Math.sin(sa) * R * 0.75); ctx.stroke();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(ccx, ccy); ctx.lineTo(ccx + Math.cos(ma) * R * 0.5, ccy + Math.sin(ma) * R * 0.5); ctx.stroke();
        }
    },
};