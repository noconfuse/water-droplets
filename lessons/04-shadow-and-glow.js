// 04 · 阴影与透明度
// 知识点：shadowColor / shadowBlur / shadowOffsetX/Y 阴影四件套 · globalAlpha 透明度 · save/restore
// 场景：霓虹发光。调 blur 看光晕扩散，调 offset 看影子偏移，调 alpha 看叠加透明。
window.LESSON = {
    no: '04',
    phase: '阶段一',
    title: '阴影与透明度',
    subtitle: 'shadowColor · shadowBlur · shadowOffsetX/Y · globalAlpha',
    width: 900,
    height: 500,

    params: [
        { key: 'shadowColor', label: '光晕颜色', type: 'color', value: '#4a7cf7' },
        { key: 'blur', label: '光晕强度', min: 0, max: 60, step: 1, value: 32 },
        { key: 'offsetX', label: '偏移 X', min: -40, max: 40, step: 1, value: 0 },
        { key: 'offsetY', label: '偏移 Y', min: -40, max: 40, step: 1, value: 0 },
        { key: 'alpha', label: '透明度', min: 0.1, max: 1, step: 0.05, value: 1 },
    ],

    code: [
        { template: "ctx.shadowColor = '${shadowColor}';", keys: ['shadowColor'] },
        { template: 'ctx.shadowBlur = ${blur};', keys: ['blur'] },
        { template: 'ctx.shadowOffsetX = ${offsetX};', keys: ['offsetX'] },
        { template: 'ctx.shadowOffsetY = ${offsetY};', keys: ['offsetY'] },
        { template: 'ctx.globalAlpha = ${alpha};', keys: ['alpha'] },
    ],

    steps: [
        { at: 0.15, label: '① 普通的圆（无阴影）' },
        { at: 0.35, label: '② shadowColor + shadowBlur 发光' },
        { at: 0.5, label: '③ shadowOffsetX/Y 影子偏移' },
        { at: 0.68, label: '④ globalAlpha 透明度' },
        { at: 0.85, label: '⑤ 霓虹文字' },
    ],

    challenge: {
        desc: '调出强烈的霓虹光晕：光晕强度拉到最大，不偏移。',
        check: (p) => p.blur >= 55 && p.offsetX === 0 && p.offsetY === 0,
    },

    draw(ctx, p, t, step) {
        const W = this.width, H = this.height;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);
        if (step < 0.15) return;

        const cx = W / 2, cy = H * 0.42, R = 120;

        ctx.save();
        // 阴影四件套，随拆解进度逐个启用
        ctx.shadowColor = p.shadowColor;
        ctx.shadowBlur = step < 0.35 ? 0 : (p.blur + (step >= 1 ? Math.sin(t * 2) * 6 : 0));
        ctx.shadowOffsetX = step < 0.5 ? 0 : p.offsetX;
        ctx.shadowOffsetY = step < 0.5 ? 0 : p.offsetY;
        ctx.globalAlpha = step < 0.68 ? 1 : p.alpha;

        // 主圆
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

        // 内圆（用光晕色，让整体色调随滑块变化）
        ctx.fillStyle = p.shadowColor;
        ctx.beginPath(); ctx.arc(cx, cy, R * 0.5, 0, Math.PI * 2); ctx.fill();

        // 霓虹文字
        if (step >= 0.85) {
            ctx.font = 'bold 52px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText('NEON', W / 2, H * 0.78);
        }
        ctx.restore();
    },
};