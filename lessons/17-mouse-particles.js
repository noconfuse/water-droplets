// 17 · 鼠标交互粒子
// 知识点：lerp 插值朝向目标 · 随机偏移形成聚集 · globalCompositeOperation 发光
// 场景：把鼠标移进画布，粒子会聚成跟随鼠标的光团。
window.LESSON = {
    no: '17',
    phase: '阶段五',
    title: '鼠标交互粒子',
    subtitle: 'lerp 插值 · 聚集偏移 · 发光合成',
    width: 900,
    height: 500,
    liveStep: true,

    params: [
        { key: 'count', label: '粒子数量', min: 50, max: 800, step: 10, value: 260 },
        { key: 'spread', label: '聚集半径', min: 10, max: 120, step: 2, value: 70 },
        { key: 'speed', label: '跟随速度', min: 0.5, max: 4, step: 0.1, value: 1.6 },
        { key: 'size', label: '粒子大小', min: 1, max: 8, step: 0.5, value: 3.5 },
        { key: 'color', label: '颜色', type: 'color', value: '#4a7cf7' },
        { key: 'glow', label: '发光叠加', type: 'bool', value: true },
    ],

    code: [
        { template: 'for (let i = 0; i < ${count}; i++) {', keys: ['count'] },
        { template: 'const tx = mouse.x + ${spread} * Math.cos(seed);', keys: ['spread'] },
        { template: 'const ty = mouse.y + ${spread} * Math.sin(seed);', keys: ['spread'] },
        { template: 'p.x += (tx - p.x) * ${speed} * dt;', keys: ['speed'] },
        { template: 'ctx.globalCompositeOperation = "lighter";', keys: [], show: (p) => p.glow },
        { template: "ctx.fillStyle = '${color}';", keys: ['color'] },
        { template: 'ctx.arc(p.x, p.y, ${size}, 0, Math.PI * 2);', keys: ['size'] },
    ],

    steps: [
        { at: 0.1, label: '① 初始化粒子' },
        { at: 0.3, label: '② lerp 朝鼠标插值移动' },
        { at: 0.55, label: '③ 随机偏移 → 聚成光团' },
        { at: 0.75, label: '④ lighter 发光叠加' },
    ],

    challenge: {
        desc: '聚成一个又大又亮的光团：聚集半径 ≥ 100，开启发光。',
        check: (p) => p.spread >= 100 && p.glow === true,
    },

    particles: [],
    prevT: null,

    draw(ctx, p, t, step, mouse) {
        const W = this.width, H = this.height;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);
        if (step < 0.1) return;

        this.ensure(p.count);
        const dt = Math.min(t - (this.prevT ?? t), 0.05);
        this.prevT = t;

        // 朝向目标（鼠标 + 随机偏移）做 lerp，速度独立于帧率
        const k = 1 - Math.exp(-p.speed * 3 * dt);
        const tx0 = mouse.inside ? mouse.x : W / 2;
        const ty0 = mouse.inside ? mouse.y : H / 2;
        for (const pt of this.particles) {
            pt.x += (tx0 + pt.ox - pt.x) * k;
            pt.y += (ty0 + pt.oy - pt.y) * k;
        }

        // 绘制（可选 lighter 叠加发光）
        ctx.save();
        if (p.glow && step >= 0.75) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
        }
        for (const pt of this.particles) {
            ctx.globalAlpha = step < 0.3 ? 0 : 0.7;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, p.size * pt.sz, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        ctx.globalAlpha = 1;

        if (step >= 0.3) {
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '12px sans-serif';
            ctx.fillText('粒子朝鼠标聚集：p.x += (目标 - p.x) × lerp', 16, 22);
        }
    },

    ensure(count) {
        if (this.particles.length === count) return;
        this.particles = [];
        for (let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const r = Math.random();
            this.particles.push({
                x: this.width / 2, y: this.height / 2,
                ox: Math.cos(ang) * r * 100,
                oy: Math.sin(ang) * r * 100,
                sz: 0.7 + Math.random() * 0.6,
            });
        }
    },
};