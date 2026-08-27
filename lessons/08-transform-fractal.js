// 08 · 变换矩阵
// 知识点：translate 平移 · rotate 旋转 · scale 缩放 · save/restore 状态栈 · 递归分形
// 场景：旋转花环 —— 只画一片花瓣，用 save + rotate 复制一圈；再递归嵌套出分形。
window.LESSON = {
    no: '08',
    phase: '阶段二',
    title: '变换矩阵',
    subtitle: 'translate · rotate · scale · save/restore · 递归分形',
    width: 900,
    height: 500,

    params: [
        { key: 'arms', label: '花瓣数量', min: 3, max: 10, step: 1, value: 7 },
        { key: 'petal', label: '花瓣大小', min: 10, max: 44, step: 1, value: 28 },
        { key: 'scale', label: '嵌套缩放', min: 0.35, max: 0.85, step: 0.05, value: 0.55 },
        { key: 'depth', label: '递归深度', min: 0, max: 3, step: 1, value: 1 },
        { key: 'rot', label: '旋转速度', min: 0, max: 3, step: 0.1, value: 0.8 },
        { key: 'color', label: '颜色', type: 'color', value: '#4a7cf7' },
    ],

    code: [
        { template: 'const angle = t * ${rot};', keys: ['rot'] },
        { template: 'for (let i = 0; i < ${arms}; i++) {', keys: ['arms'] },
        { template: '  ctx.save();', keys: [] },
        { template: '  ctx.rotate(i / ${arms} * Math.PI * 2 + angle);', keys: ['arms'] },
        { template: '  ctx.translate(130, 0);', keys: [] },
        { template: '  ctx.scale(${scale}, ${scale});', keys: ['scale'] },
        { template: '  drawPetal(${petal});', keys: ['petal'] },
        { template: "  ctx.fillStyle = '${color}';", keys: ['color'] },
        { template: '  ctx.restore();', keys: [] },
        { template: 'ring(ctx, p, rot, x, y, r, depth); // 递归深度 ${depth}', keys: ['depth'] },
    ],

    steps: [
        { at: 0.12, label: '① save → translate 到中心' },
        { at: 0.35, label: '② rotate 旋转一圈画花瓣' },
        { at: 0.6, label: '③ 调整花瓣大小与数量' },
        { at: 0.82, label: '④ 递归嵌套（depth）' },
    ],

    challenge: {
        desc: '长出满屏的分形：递归深度 ≥ 2、花瓣 ≥ 6。',
        check: (p) => p.depth >= 2 && p.arms >= 6,
    },

    draw(ctx, p, t, step) {
        const W = this.width, H = this.height;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);
        if (step < 0.12) return;

        // ②③ 花瓣数量随进度渐增
        const prog = Math.min(1, Math.max(0, (step - 0.35) / 0.25));
        const arms = Math.max(1, Math.round(p.arms * prog));
        const depth = step >= 0.82 ? p.depth : 0;
        const rot = step >= 1 ? t * p.rot : 0;

        ring(ctx, p, rot, W / 2, H / 2, arms, 130, depth);

        if (step >= 0.9) {
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`save → translate → rotate → 画花瓣 → restore  × ${p.arms}`, W / 2, H - 16);
        }
    },
};

function ring(ctx, p, rot, x, y, n, r, depth) {
    // 在 (x, y) 处画一圈 n 片花瓣
    ctx.save();
    ctx.translate(x, y);
    for (let i = 0; i < n; i++) {
        ctx.save();
        ctx.rotate(i / n * Math.PI * 2 + rot);
        ctx.translate(r, 0);        // 花瓣落在半径 r 处
        ctx.scale(p.scale, p.scale);
        petal(ctx, p);
        ctx.restore();
    }
    ctx.restore();

    // ④ 递归：在每片花瓣尖端再生一圈（等比例缩小）
    if (depth > 0) {
        for (let i = 0; i < n; i++) {
            const a = i / n * Math.PI * 2 + rot;
            ring(ctx, p, rot * 0.8,
                x + r * Math.cos(a), y + r * Math.sin(a),
                n, r * p.scale, depth - 1);
        }
    }
}

function petal(ctx, p) {
    // 一片泪滴形花瓣（用二次贝塞尔，画在局部原点）
    ctx.beginPath();
    ctx.moveTo(0, -p.petal);
    ctx.quadraticCurveTo(p.petal * 0.95, 0, 0, p.petal);
    ctx.quadraticCurveTo(-p.petal * 0.95, 0, 0, -p.petal);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 0, p.petal * 0.3, 0, Math.PI * 2); ctx.fill();
}