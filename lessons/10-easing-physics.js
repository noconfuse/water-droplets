// 10 · 缓动与物理
// 知识点：初速度与抛射角 · 重力每帧累加到速度 · 抛物线轨迹 · 落地反弹
// 场景：大炮抛射。调角度/力度/重力看抛物线变化；打开「反弹」看落地回弹。
window.LESSON = {
    no: '10',
    phase: '阶段三',
    title: '缓动与物理',
    subtitle: '重力加速度 · 抛物线轨迹 · 反弹',
    width: 900,
    height: 500,
    liveStep: true,

    params: [
        { key: 'angle', label: '抛射角°', min: 5, max: 85, step: 1, value: 45 },
        { key: 'power', label: '初速力度', min: 4, max: 12, step: 0.5, value: 7 },
        { key: 'gravity', label: '重力', min: 0.05, max: 1, step: 0.05, value: 0.5 },
        { key: 'bounce', label: '落地反弹', type: 'bool', value: true },
    ],

    code: [
        { template: 'const rad = ${angle} * Math.PI / 180;', keys: ['angle'] },
        { template: 'vy = -${power} * Math.sin(rad);', keys: ['power'] },
        { template: 'vy += ${gravity} * 400 * dt;', keys: ['gravity'] },
        { template: 'if (y > ground) { vy *= -0.7; } // 反弹', keys: [], show: (p) => p.bounce },
        { template: 'if (y > ground) { vy = 0; } // 落地即停', keys: [], show: (p) => !p.bounce },
    ],

    steps: [
        { at: 0.1, label: '① 初速度与抛射角' },
        { at: 0.35, label: '② 重力每帧改变 vy' },
        { at: 0.55, label: '③ 抛物线轨迹' },
        { at: 0.8, label: '④ 落地反弹' },
    ],

    challenge: {
        desc: '打出一个「高抛物线」：角度 60° 以上、力度 ≥ 8。',
        check: (p) => p.angle >= 60 && p.power >= 8,
    },

    state: null,
    trail: [],
    launchT: null,
    lastAngle: null,
    lastPower: null,
    prevT: null,

    draw(ctx, p, t, step) {
        const W = this.width, H = this.height;
        const ground = H - 60;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);

        // 地面
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(W, ground); ctx.stroke();
        if (step < 0.1) return;

        // 初始化 / 参数变更即重新发射
        if (!this.state) this.launch(t, p, ground);
        if (this.lastAngle !== p.angle || this.lastPower !== p.power) this.launch(t, p, ground);
        this.lastAngle = p.angle;
        this.lastPower = p.power;

        // 每 6 秒重新发射
        if (t - this.launchT > 6) this.launch(t, p, ground);

        const dt = Math.min(t - (this.prevT ?? t), 0.05);
        this.prevT = t;
        const b = this.state;

        // 重力
        b.vy += p.gravity * 400 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // 落地
        if (b.y > ground) {
            b.y = ground;
            if (p.bounce) { b.vy *= -0.7; b.vx *= 0.98; }
            else { b.vy = 0; b.vx = 0; }
        }

        // 轨迹
        this.trail.push({ x: b.x, y: b.y });
        if (this.trail.length > 130) this.trail.shift();

        // 轨迹点（渐隐）
        for (let i = 0; i < this.trail.length; i++) {
            const q = this.trail[i];
            ctx.fillStyle = `rgba(76,194,255,${i / this.trail.length * 0.6})`;
            ctx.beginPath(); ctx.arc(q.x, q.y, 2.5, 0, Math.PI * 2); ctx.fill();
        }

        // 初速度方向箭头（发射瞬间）
        if (step < 0.35) {
            ctx.strokeStyle = '#ff6b8a';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(b.x0, b.y0);
            ctx.lineTo(b.x0 + b.vx * 0.12, b.y0 + b.vy * 0.12); ctx.stroke();
            ctx.fillStyle = '#ff6b8a';
            ctx.font = '12px sans-serif';
            ctx.fillText(`θ = ${Math.round(p.angle)}°`, b.x0 + 10, b.y0 - 14);
        }

        // 小球
        ctx.save();
        ctx.shadowColor = '#4cc2ff';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#4cc2ff';
        ctx.beginPath(); ctx.arc(b.x, b.y, 10, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        if (step >= 0.8 && p.bounce) {
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '12px sans-serif';
            ctx.fillText('落地后 vy *= -0.7，继续弹跳', 20, 22);
        }
    },

    launch(t, p, ground) {
        const rad = p.angle * Math.PI / 180;
        const v = p.power * 80;
        this.state = {
            x: 40, y: ground, x0: 40, y0: ground,
            vx: v * Math.cos(rad),
            vy: -v * Math.sin(rad),
        };
        this.trail = [{ x: 40, y: ground }];
        this.launchT = t;
        this.prevT = t;
    },
};