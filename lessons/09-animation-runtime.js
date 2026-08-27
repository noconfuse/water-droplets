// 09 · 动画循环与时间
// 知识点：requestAnimationFrame 循环 · 时间增量 dt 驱动位移 · clearRect 重绘 · 拖尾
// 场景：弹跳小球。调速度看位移快慢；打开「拖尾」体会不清屏的效果。
window.LESSON = {
    no: '09',
    phase: '阶段三',
    title: '动画循环与时间',
    subtitle: 'requestAnimationFrame · 时间驱动 · 拖尾',
    width: 900,
    height: 500,
    liveStep: true,
    persist: true, // 拖尾需要保留上一帧，画布由课程自己控制

    params: [
        { key: 'speed', label: '速度 px/s', min: 50, max: 600, step: 10, value: 240 },
        { key: 'size', label: '小球半径', min: 5, max: 40, step: 1, value: 20 },
        { key: 'color', label: '颜色', type: 'color', value: '#4cc2ff' },
        { key: 'trails', label: '拖尾效果', type: 'bool', value: true },
    ],

    code: [
        { template: 'function animate(dt) {', keys: [] },
        { template: "  ctx.fillStyle = 'rgba(14,19,32,0.14)'; // 不清屏 → 留下痕迹", keys: [], show: (p) => p.trails },
        { template: '  ctx.clearRect(0, 0, W, H); // 清屏 → 无拖尾', keys: [], show: (p) => !p.trails },
        { template: '  x += ${speed} * dt;', keys: ['speed'] },
        { template: '  if (x > W - ${size}) vx *= -1;', keys: ['size'] },
        { template: "  ctx.fillStyle = '${color}';", keys: ['color'] },
        { template: '  ctx.arc(x, y, ${size}, 0, Math.PI * 2);', keys: ['size'] },
        { template: '  requestAnimationFrame(animate);', keys: [] },
    ],

    steps: [
        { at: 0.1, label: '① requestAnimationFrame 循环' },
        { at: 0.35, label: '② 时间增量 dt 驱动位移' },
        { at: 0.65, label: '③ 边界反弹' },
        { at: 0.9, label: '④ 拖尾（不清屏）' },
    ],

    challenge: {
        desc: '让小球跑得快一点：速度 ≥ 400。',
        check: (p) => p.speed >= 400,
    },

    ball: null,
    prevT: null,

    draw(ctx, p, t, step) {
        const W = this.width, H = this.height;

        // 拖尾：不清屏，只叠一层半透明背景 → 上一帧的画面淡出成尾巴
        if (p.trails) {
            ctx.fillStyle = 'rgba(14,19,32,0.12)';
        } else {
            ctx.fillStyle = '#0e1320';
        }
        ctx.fillRect(0, 0, W, H);

        if (step < 0.1) return;

        // 网格
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let gx = 0; gx <= W; gx += 50) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
        for (let gy = 0; gy <= H; gy += 50) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

        if (step < 0.35) return;

        // 初始化小球
        if (!this.ball) this.ball = { x: 140, y: H / 2, vx: p.speed, vy: p.speed * 0.6 };

        // 速度参数 → 实时作用于速度方向（保留反弹后的符号）
        const b = this.ball;
        b.vx = (Math.sign(b.vx) || 1) * p.speed;
        b.vy = (Math.sign(b.vy) || 1) * p.speed * 0.6;

        const dt = Math.min(t - (this.prevT ?? t), 0.05);
        this.prevT = t;

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // 边界反弹
        if (b.x < p.size) { b.x = p.size; b.vx *= -1; }
        if (b.x > W - p.size) { b.x = W - p.size; b.vx *= -1; }
        if (b.y < p.size) { b.y = p.size; b.vy *= -1; }
        if (b.y > H - p.size) { b.y = H - p.size; b.vy *= -1; }

        // 绘制小球（发光）
        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 22;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(b.x, b.y, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // 速度方向箭头
        if (step >= 0.65) {
            const L2 = Math.hypot(b.vx, b.vy);
            const ax = b.x + b.vx / L2 * (p.size + 18);
            const ay = b.y + b.vy / L2 * (p.size + 18);
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(ax, ay); ctx.stroke();
        }

        if (step >= 0.9 && p.trails) {
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '12px sans-serif';
            ctx.fillText('不清屏 → 上一帧的痕迹保留 = 拖尾', 20, 22);
        }
    },
};