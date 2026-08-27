// 06 · 参数方程曲线
// 知识点：参数方程 · 采样点连线 · 心形公式
// 场景：心形由参数方程采样连线而成；点击画布任意位置，会在那里生成一颗心。
window.LESSON = {
    no: '06',
    phase: '阶段二',
    title: '参数方程曲线',
    subtitle: '心形曲线 · 采样连线 · 点击生成',
    width: 900,
    height: 500,
    liveStep: true,

    params: [
        { key: 'sample', label: '采样点数', min: 12, max: 120, step: 1, value: 48 },
        { key: 'scale', label: '大小', min: 1, max: 6, step: 0.1, value: 3.5 },
        { key: 'color', label: '颜色', type: 'color', value: '#ee6c8e' },
        { key: 'glow', label: '发光', type: 'bool', value: true },
    ],

    code: [
        { template: 'for (let i = 0; i < ${sample}; i++) {', keys: ['sample'] },
        { template: '  const t = i / ${sample} * Math.PI * 2;', keys: ['sample'] },
        { template: '  x = 15 * ${scale} * Math.sin(t) ** 3;', keys: ['scale'] },
        { template: '  y = -${scale} * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));', keys: ['scale'] },
        { template: '  ctx.lineTo(x, y);', keys: [] },
        { template: "ctx.fillStyle = '${color}';", keys: ['color'] },
        { template: 'ctx.shadowBlur = 22; // 发光', keys: [], show: (p) => p.glow },
    ],

    steps: [
        { at: 0.1, label: '① 参数方程：角度 t 采样' },
        { at: 0.35, label: '② 计算 x, y（心形公式）' },
        { at: 0.6, label: '③ lineTo 连线成心' },
        { at: 0.82, label: '④ 填充 + 发光 · 点击多心' },
    ],

    challenge: {
        desc: '让心更圆润：采样点数 ≥ 80。',
        check: (p) => p.sample >= 80,
    },

    hearts: [],
    prevDown: false,

    draw(ctx, p, t, step, mouse) {
        const W = this.width, H = this.height;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);
        if (step < 0.1) return;

        // 点击生成一颗心
        if (mouse.down && !this.prevDown && mouse.inside) {
            this.hearts.push({ x: mouse.x, y: mouse.y, born: t });
        }
        this.prevDown = mouse.down;

        // 中心心（带动静呼吸）
        const pulse = step >= 1 ? 1 + 0.06 * Math.sin(t * 3) : 1;
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.scale(p.scale * pulse, p.scale * pulse);
        ctx.globalAlpha = step < 0.3 ? 0 : 1;
        this.heartShape(ctx, p, step);
        ctx.restore();

        // 点击生成的心
        for (const h of this.hearts) {
            const appear = Math.min(1, (t - h.born) * 2);
            ctx.save();
            ctx.translate(h.x, h.y);
            ctx.scale(p.scale * 0.5 * appear, p.scale * 0.5 * appear);
            ctx.globalAlpha = appear;
            this.heartShape(ctx, p, step);
            ctx.restore();
        }
        ctx.globalAlpha = 1;

        if (step >= 0.35) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('x = 15·sin³(t)      y = -(13·cos(t) - 5·cos(2t) - 2·cos(3t) - cos(4t))', W / 2, H - 16);
            ctx.textAlign = 'left';
        }
    },

    heartShape(ctx, p, step) {
        // 采样点数随拆解进度渐增：顶点从少到多，看清"连线成心"
        const n = Math.max(4, Math.floor(p.sample * Math.min(1, (step - 0.35) / 0.25)));
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            const a = i / p.sample * Math.PI * 2;
            const x = 15 * Math.sin(a) ** 3;
            const y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        if (p.glow && step >= 0.82) {
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 22;
        }
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    },
};