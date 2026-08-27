// 18 · 文字粒子
// 知识点：离屏 canvas 渲染文字 · getImageData 采样像素坐标 · 文字变成点阵粒子
// 场景：文字由粒子拼成，轻轻浮动；点击画布会爆散，随后重新聚回字形。
window.LESSON = {
    no: '18',
    phase: '阶段五',
    title: '文字粒子',
    subtitle: '离屏 canvas · getImageData 采样 · 粒子形变',
    width: 900,
    height: 500,
    liveStep: true,

    params: [
        { key: 'word', label: '文字', type: 'select', value: 'CANVAS', options: ['CANVAS', 'HELLO', '粒子', 'LOVE', 'FLOW'] },
        { key: 'sampleStep', label: '采样间隔', min: 2, max: 10, step: 1, value: 4 },
        { key: 'size', label: '粒子大小', min: 1, max: 6, step: 0.5, value: 3 },
        { key: 'sway', label: '浮动幅度', min: 0, max: 30, step: 1, value: 10 },
        { key: 'color', label: '颜色', type: 'color', value: '#ee6c8e' },
    ],

    code: [
        { template: "offscreenCtx.font = 'bold 150px sans-serif';", keys: [] },
        { template: "offscreenCtx.fillText('${word}', 0, 0);", keys: ['word'] },
        { template: 'const data = offscreenCtx.getImageData(0, 0, W, H).data;', keys: [] },
        { template: 'for (let y = 0; y < H; y += ${sampleStep}) {', keys: ['sampleStep'] },
        { template: '  if (data[i] > 128) particles.push({ x, y });', keys: [] },
        { template: 'p.x += Math.sin(t * 1.5 + p.phase) * ${sway};', keys: ['sway'] },
        { template: "ctx.fillStyle = '${color}';", keys: ['color'] },
        { template: 'ctx.arc(p.x, p.y, ${size}, 0, Math.PI * 2);', keys: ['size'] },
    ],

    steps: [
        { at: 0.12, label: '① 离屏画布写出文字' },
        { at: 0.4, label: '② getImageData 采样像素坐标' },
        { at: 0.65, label: '③ 在采样点画粒子' },
        { at: 0.85, label: '④ 浮动 + 点击爆散' },
    ],

    challenge: {
        desc: '把文字换成「粒子」两个字。',
        check: (p) => p.word === '粒子',
    },

    particles: [],
    burst: null,
    prevDown: false,
    prevT: null,
    lastWord: null,
    lastStep: null,

    draw(ctx, p, t, step) {
        const W = this.width, H = this.height;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);
        if (step < 0.12) return;

        // 文字/采样间隔变化时重新采样
        this.ensureText(p.word, p.sampleStep, step);

        // 点击 → 爆散冲击波
        if (mouse.down && !this.prevDown && mouse.inside) {
            this.burst = { x: mouse.x, y: mouse.y, t };
        }
        this.prevDown = mouse.down;

        const dt = Math.min(t - (this.prevT ?? t), 0.05);
        this.prevT = t;

        // 更新：冲击 + 阻尼 + 浮动 + 弹簧拉回字形
        const spring = Math.min(1, 2.2 * dt);
        for (const pt of this.particles) {
            if (this.burst) {
                const dx = pt.x - this.burst.x, dy = pt.y - this.burst.y;
                const d = Math.hypot(dx, dy);
                if (d < 150 && d > 0.01) {
                    const f = (1 - d / 150) * 500;
                    pt.vx += dx / d * f * dt;
                    pt.vy += dy / d * f * dt;
                }
            }
            pt.vx *= 0.9;
            pt.vy *= 0.9;
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            if (step >= 0.85) {
                pt.x += Math.sin(t * 1.5 + pt.phase) * p.sway * 0.02;
            }
            pt.x += (pt.tx - pt.x) * spring;
            pt.y += (pt.ty - pt.y) * spring;
        }

        // 绘制
        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        for (const pt of this.particles) {
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        ctx.globalAlpha = 1;

        if (step >= 0.65) {
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '12px sans-serif';
            ctx.fillText('点击画布 → 粒子爆散后重新聚回字形', 16, 22);
        }
    },

    ensureText(word, sampleStep, step) {
        if (this.lastWord === word && this.lastStep === sampleStep && this.particles.length) return;
        this.lastWord = word;
        this.lastStep = sampleStep;

        const W = this.width, H = this.height;
        const off = document.createElement('canvas');
        off.width = W; off.height = H;
        const oc = off.getContext('2d', { willReadFrequently: true });
        oc.fillStyle = '#000';
        oc.fillRect(0, 0, W, H);
        oc.fillStyle = '#fff';
        oc.font = 'bold 150px sans-serif';
        oc.textAlign = 'center';
        oc.textBaseline = 'middle';
        oc.fillText(word, W / 2, H / 2);

        const data = oc.getImageData(0, 0, W, H).data;
        this.particles = [];
        for (let y = 0; y < H; y += sampleStep) {
            for (let x = 0; x < W; x += sampleStep) {
                const i = (y * W + x) * 4;
                // 白字黑底：用红色通道判断文字像素（背景 alpha 是 255，不能看 alpha）
                if (data[i] > 128) {
                    this.particles.push({ tx: x, ty: y, x, y, vx: 0, vy: 0, phase: Math.random() * Math.PI * 2 });
                }
            }
        }
        if (this.particles.length === 0 && step >= 0.4) {
            this.particles.push({ tx: W / 2, ty: H / 2, x: W / 2, y: H / 2, vx: 0, vy: 0, phase: 0 });
        }
    },
};