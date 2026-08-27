// 24 · 综合大作业 · Canvas 篇 —— 音画粒子宇宙
// 知识点：整合前段全部技能 —— 渐变(03) · 径向渐变发光(04) · 三角函数螺旋(05) · 变换自转(08)
//        拖尾(09) · 鼠标力场(11/17) · 混合叠加(12) · 音频节拍(13-15) · 粒子系统(16)
// 场景：螺旋星系随音乐呼吸；低频节拍掀起冲击波，鼠标制造力场扰动粒子。
window.LESSON = {
    no: '24',
    phase: '阶段七',
    title: '综合大作业 · 音画粒子宇宙',
    subtitle: '渐变 · 螺旋粒子 · 鼠标力场 · 音频爆发 · 发光拖尾',
    width: 900,
    height: 500,
    liveStep: true,
    persist: true, // 半透明层叠 → 发光拖尾
    audio: true,

    params: [
        { key: 'count', label: '粒子数量', min: 100, max: 900, step: 20, value: 450 },
        { key: 'spin', label: '星系转速', min: 0, max: 3, step: 0.1, value: 0.6 },
        { key: 'force', label: '鼠标力场', min: 0, max: 3, step: 0.1, value: 1.2 },
        { key: 'sensitivity', label: '音频灵敏度', min: 0.5, max: 3, step: 0.1, value: 1.5 },
        { key: 'color', label: '颜色', type: 'color', value: '#4cc2ff' },
        { key: 'glow', label: '发光叠加', type: 'bool', value: true },
    ],

    code: [
        { template: 'ctx.fillStyle = "rgba(8,11,20,0.16)"; // 半透明叠底 = 拖尾', keys: [] },
        { template: 'const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3); // 星系核', keys: [] },
        { template: 'coreR = 24 + (bass / 255) * ${sensitivity} * 24; // 音频 → 核心膨胀', keys: ['sensitivity'] },
        { template: 'const a = pt.arm * (2π / 6) + pt.t0 * 3.4 + t * ${spin}; // 螺旋自转', keys: ['spin'] },
        { template: 'pt.vx -= dx / d * ${force} * 40 * dt; // 鼠标力场', keys: ['force'] },
        { template: 'if (bass > ema * 1.25 + 22) waves.push({ r: 0 }); // 节拍 → 冲击波', keys: [] },
        { template: 'ctx.globalCompositeOperation = "lighter"; // 叠加发光', keys: [], show: (p) => p.glow },
        { template: "ctx.fillStyle = '${color}';", keys: ['color'] },
        { template: 'for (let i = 0; i < ${count}; i++) {', keys: ['count'] },
    ],

    steps: [
        { at: 0.12, label: '① 渐变背景 + 拖尾' },
        { at: 0.32, label: '② 星系核（径向渐变 + 发光）' },
        { at: 0.52, label: '③ 螺旋粒子（三角函数 + 自转）' },
        { at: 0.72, label: '④ 鼠标力场 + 冲击波' },
        { at: 0.9, label: '⑤ 音频爆发 + 叠加发光' },
    ],

    challenge: {
        desc: '开发光，音频灵敏度拉到 2.5，感受音画爆发。',
        check: (p) => p.glow === true && p.sensitivity >= 2.5,
    },

    particles: [],
    waves: [],
    ema: 0,
    prevBass: 0,
    prevT: null,

    draw(ctx, p, t, step, mouse, sound) {
        const W = this.width, H = this.height;
        const cx = W / 2, cy = H / 2;

        // ① 渐变背景 + 拖尾（不清屏，上一帧淡出成轨迹）
        ctx.fillStyle = 'rgba(8,11,20,0.16)';
        ctx.fillRect(0, 0, W, H);
        if (step < 0.12) return;

        // 音频低频能量（未播放时用演示节拍）
        let bass = 40;
        if (sound.playing && sound.dataArray) {
            bass = 0;
            for (let i = 0; i < sound.dataArray.length * 0.06; i++) bass = Math.max(bass, sound.dataArray[i]);
        } else {
            bass = 40 + 30 * Math.sin(t * 3);
        }
        const dt = Math.min(t - (this.prevT ?? t), 0.05);
        this.prevT = t;

        // 节拍检测 → 冲击波
        const th = this.ema * 1.25 + 22;
        if (bass > th && bass > 55 && this.prevBass <= th) this.waves.push({ r: 0 });
        this.ema = this.ema * 0.8 + bass * 0.2;
        this.prevBass = bass;
        for (let i = this.waves.length - 1; i >= 0; i--) {
            this.waves[i].r += 190 * dt;
            if (this.waves[i].r > 300) this.waves.splice(i, 1);
        }

        // ② 星系核（径向渐变 + 发光）
        const coreR = 24 + (bass / 255) * p.sensitivity * 24;
        ctx.save();
        if (p.glow && step >= 0.9) { ctx.shadowColor = '#fff'; ctx.shadowBlur = 28; }
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
        core.addColorStop(0, 'rgba(255,255,255,0.95)');
        core.addColorStop(0.25, p.color);
        core.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = core;
        ctx.beginPath(); ctx.arc(cx, cy, coreR * 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // 冲击波环（lighter 叠加）
        if (step >= 0.72) {
            ctx.save();
            if (p.glow) ctx.globalCompositeOperation = 'lighter';
            for (const w of this.waves) {
                ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 1 - w.r / 300) * 0.6})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(cx, cy, w.r, w.r * 0.45, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }

        // ③④⑤ 粒子：螺旋分布 + 鼠标力场 + 冲击波推动 + 发光
        this.ensure(p.count);
        const arms = 6;
        ctx.save();
        if (p.glow && step >= 0.9) ctx.globalCompositeOperation = 'lighter';
        for (const pt of this.particles) {
            // 螺旋目标位置（三角函数 + 自转）
            const baseA = pt.arm * (Math.PI * 2 / arms) + pt.t0 * 3.4 + t * p.spin * (0.2 + pt.t0);
            const baseR = 26 + pt.t0 * 250;
            const tx = cx + Math.cos(baseA) * baseR;
            const ty = cy + Math.sin(baseA) * baseR;

            // 鼠标力场（排斥）
            if (mouse.inside) {
                const dx = mouse.x - pt.x, dy = mouse.y - pt.y;
                const d = Math.hypot(dx, dy);
                if (d < 180 && d > 0.01) {
                    pt.vx -= dx / d * p.force * 40 * dt;
                    pt.vy -= dy / d * p.force * 40 * dt;
                }
            }
            // 冲击波推开粒子
            for (const w of this.waves) {
                const dx = pt.x - cx, dy = pt.y - cy;
                const d = Math.hypot(dx, dy) || 1;
                if (Math.abs(d - w.r) < 40) {
                    const k = 1 - Math.abs(d - w.r) / 40;
                    pt.vx += dx / d * 140 * k * dt;
                    pt.vy += dy / d * 140 * k * dt;
                }
            }
            // 积分 + 阻尼 + 弹簧拉回螺旋轨道
            pt.vx *= 0.97; pt.vy *= 0.97;
            pt.x += pt.vx * dt; pt.y += pt.vy * dt;
            const k2 = Math.min(1, 2.5 * dt);
            pt.x += (tx - pt.x) * k2;
            pt.y += (ty - pt.y) * k2;
            // 边界包裹
            if (pt.x < -20) pt.x = W + 20;
            if (pt.x > W + 20) pt.x = -20;
            if (pt.y < -20) pt.y = H + 20;
            if (pt.y > H + 20) pt.y = -20;

            // 绘制（外层暗、内层亮）
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.25 + 0.75 * (1 - pt.t0);
            ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.sz, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
        ctx.globalAlpha = 1;

        if (step >= 0.38) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '12px sans-serif';
            ctx.fillText(`低频 ${Math.round(bass)} · 播放音乐看爆发 · 移动鼠标扰动粒子`, 16, 22);
        }
    },

    ensure(count) {
        if (this.particles.length === count) return;
        this.particles = [];
        const cx = this.width / 2, cy = this.height / 2;
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2, r = Math.random() * 120;
            this.particles.push({
                arm: Math.floor(Math.random() * 6),
                t0: Math.random(),
                sz: 0.8 + Math.random() * 1.4,
                x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r,
                vx: 0, vy: 0,
            });
        }
    },
};