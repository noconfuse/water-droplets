// 16 · 粒子系统
// 知识点：粒子对象数组 · 生命周期（出生/更新/移除） · 批量绘制 · 数量限制
// 场景：雪花飘落 或 星空漂移，切换 mode 看两种粒子行为。
window.LESSON = {
    no: '16',
    phase: '阶段五',
    title: '粒子系统',
    subtitle: '粒子数组 · 更新循环 · 批量绘制',
    width: 900,
    height: 500,
    liveStep: true,

    params: [
        { key: 'mode', label: '粒子模式', type: 'select', value: 'snow', options: ['snow', 'stars'] },
        { key: 'count', label: '粒子数量', min: 50, max: 800, step: 10, value: 300 },
        { key: 'speed', label: '移动速度', min: 0, max: 3, step: 0.1, value: 1 },
        { key: 'size', label: '粒子大小', min: 1, max: 8, step: 0.5, value: 3 },
        { key: 'color', label: '颜色', type: 'color', value: '#4cc2ff' },
        { key: 'twinkle', label: '闪烁', type: 'bool', value: true },
    ],

    code: [
        { template: 'particles = [];', keys: [] },
        { template: 'for (let i = 0; i < ${count}; i++) {', keys: ['count'] },
        { template: '  particles.push({ x, y, vx, vy });', keys: [] },
        { template: 'p.y += ${speed} * 40 * dt; // 雪花：下落', keys: ['speed'], show: (p) => p.mode === 'snow' },
        { template: 'p.x += ${speed} * 10 * dt; // 星空：漂移', keys: ['speed'], show: (p) => p.mode === 'stars' },
        { template: "ctx.fillStyle = '${color}';", keys: ['color'] },
        { template: 'ctx.arc(p.x, p.y, ${size}, 0, Math.PI * 2);', keys: ['size'] },
        { template: 'ctx.globalAlpha = Math.abs(Math.sin(t * 2 + p.phase)); // 闪烁', keys: [], show: (p) => p.twinkle },
    ],

    steps: [
        { at: 0.1, label: '① 初始化粒子数组' },
        { at: 0.3, label: '② 每帧更新位置' },
        { at: 0.55, label: '③ 批量绘制粒子' },
        { at: 0.75, label: '④ 闪烁与边界循环' },
    ],

    challenge: {
        desc: '下大一点的雪：数量 ≥ 500，同时开着闪烁。',
        check: (p) => p.count >= 500 && p.twinkle === true,
    },

    particles: [],
    prevT: null,

    draw(ctx, p, t, step) {
        const W = this.width, H = this.height;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);
        if (step < 0.1) return;

        this.ensure(p.count);
        const dt = Math.min(t - (this.prevT ?? t), 0.05);
        this.prevT = t;
        const sp = p.speed * 40;

        // 更新
        for (const pt of this.particles) {
            if (p.mode === 'snow') {
                pt.y += sp * dt;
                pt.x += Math.sin(t * 2 + pt.phase) * 0.5;
                if (pt.y > H + 8) { pt.y = -8; pt.x = Math.random() * W; }
            } else {
                pt.x += sp * 0.25 * dt;
                pt.y += Math.sin(t * 0.6 + pt.phase) * 8 * dt;
                if (pt.x > W + 8) pt.x = -8;
                if (pt.x < -8) pt.x = W + 8;
                if (pt.y > H + 8) pt.y = -8;
                if (pt.y < -8) pt.y = H + 8;
            }
        }

        // 绘制
        const tw = p.twinkle && step >= 0.75;
        for (const pt of this.particles) {
            const a = step < 0.3 ? 0 : (tw ? 0.25 + 0.75 * Math.abs(Math.sin(t * 2 + pt.phase)) : 0.85);
            ctx.globalAlpha = a;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, p.size * pt.sz, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        if (step >= 0.55) {
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '12px sans-serif';
            ctx.fillText(p.mode === 'snow' ? '雪花：下落 + 左右飘摆，触底回顶部' : '星空：缓慢漂移，出界从另一侧回来', 16, 22);
        }
    },

    ensure(count) {
        if (this.particles.length === count) return;
        this.particles = [];
        const W = this.width, H = this.height;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                phase: Math.random() * Math.PI * 2,
                sz: 0.7 + Math.random() * 0.6,
            });
        }
    },
};