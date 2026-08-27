// 23 · 透明折射球
// 知识点：用 2D 技巧"伪造"透明球 —— clip 圆内放大背景=折射 · 边缘暗环 · 高光 · 底部阴影
// 场景：网格+彩色圆点背景让折射效果一目了然；鼠标移进画布可移动透明球。
window.LESSON = {
    no: '23',
    phase: '阶段七',
    title: '透明折射球',
    subtitle: '折射 · 高光 · 边缘暗环 · 阴影',
    width: 900,
    height: 500,
    liveStep: true,

    params: [
        { key: 'radius', label: '球体半径', min: 30, max: 160, step: 2, value: 90 },
        { key: 'magnify', label: '折射放大', min: 1, max: 1.6, step: 0.02, value: 1.3 },
        { key: 'highlight', label: '高光强度', min: 0, max: 1, step: 0.05, value: 0.8 },
        { key: 'shadow', label: '阴影强度', min: 0, max: 1, step: 0.05, value: 0.5 },
        { key: 'showGuide', label: '结构标注', type: 'bool', value: true },
    ],

    code: [
        { template: 'ctx.save(); ctx.beginPath(); ctx.arc(450, 250, ${radius}, 0, Math.PI * 2); ctx.clip();', keys: ['radius'] },
        { template: 'drawScene(x, y, ${magnify}); // 圆内重画放大 N 倍的场景 = 折射', keys: ['magnify'] },
        { template: 'ctx.restore();', keys: [] },
        { template: 'ring.addColorStop(0.85, "rgba(0,0,0,0.2)"); ring.addColorStop(1, "rgba(0,0,0,0.5)"); // 边缘暗环', keys: [] },
        { template: 'ctx.ellipse(x - r*0.35, y - r*0.45, r*0.24, r*0.15, -0.6, 0, 2π); // 高光', keys: [], show: (p) => p.highlight > 0 },
        { template: 'ctx.ellipse(x, y + r*1.1, r*0.95, r*0.18, 0, 0, 2π); // 底部阴影', keys: [], show: (p) => p.shadow > 0 },
        { template: 'ctx.fillText("高光", x - r - 30, y - r - 24); // 结构标注', keys: [], show: (p) => p.showGuide },
    ],

    steps: [
        { at: 0.12, label: '① 网格背景' },
        { at: 0.35, label: '② 折射：clip 圆内重画放大场景' },
        { at: 0.6, label: '③ 边缘暗环 + 底部阴影' },
        { at: 0.82, label: '④ 高光' },
        { at: 0.94, label: '⑤ 结构标注' },
    ],

    challenge: {
        desc: '折射拉满 + 半径 ≥ 130，看网格线被明显放大。',
        check: (p) => p.magnify >= 1.5 && p.radius >= 130,
    },

    draw(ctx, p, t, step, mouse) {
        const W = this.width, H = this.height;
        const r = p.radius;

        // 球心：鼠标在画布内则跟随
        const x = mouse.inside ? mouse.x : W / 2;
        const y = mouse.inside ? mouse.y : H / 2;

        // ① 正常场景（网格 + 彩色圆点）
        this.scene(ctx, W, H, 0, 0, 1);
        if (step < 0.12) return;

        // ② 折射：clip 圆形 + 圆内重画放大场景（网格线被放大 → 一目了然）
        if (step >= 0.35) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.clip();
            this.scene(ctx, W, H, x, y, p.magnify);
            ctx.restore();
        }

        // ③ 边缘暗环（让透明球"鼓"起来）
        if (step >= 0.6) {
            const ring = ctx.createRadialGradient(x, y, r * 0.88, x, y, r);
            ring.addColorStop(0, 'rgba(0,0,0,0)');
            ring.addColorStop(0.85, 'rgba(0,0,0,0.2)');
            ring.addColorStop(1, 'rgba(0,0,0,0.5)');
            ctx.fillStyle = ring;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // 底部阴影
        if (step >= 0.6 && p.shadow > 0) {
            ctx.fillStyle = `rgba(0,0,0,${0.28 * p.shadow})`;
            ctx.beginPath();
            ctx.ellipse(x, y + r * 1.1, r * 0.95, r * 0.18, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // ④ 高光（主高光 + 小反光）
        if (step >= 0.82 && p.highlight > 0) {
            ctx.save();
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 10;
            ctx.fillStyle = `rgba(255,255,255,${0.75 * p.highlight})`;
            ctx.beginPath();
            ctx.ellipse(x - r * 0.35, y - r * 0.45, r * 0.24, r * 0.15, -0.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.fillStyle = `rgba(255,255,255,${0.35 * p.highlight})`;
            ctx.beginPath();
            ctx.ellipse(x + r * 0.35, y + r * 0.4, r * 0.09, r * 0.06, 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // ⑤ 结构标注
        if (p.showGuide && step >= 0.94) {
            ctx.font = '12px sans-serif';
            ctx.lineWidth = 1;
            const label = (lx, ly, tx, ty, text) => {
                ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(tx, ty); ctx.stroke();
                ctx.fillStyle = '#fff';
                ctx.fillText(text, tx, ty + 4);
            };
            label(x - r * 0.35, y - r * 0.45, x - r - 30, y - r - 24, '高光');
            label(x, y - r * 0.2, x + r + 26, y - r - 16, '折射区');
            label(x, y + r, x + r * 0.6, y + r + 22, '阴影');
        }
    },

    // 画"场景"：渐变 + 网格 + 彩色圆点。支持以 (cx,cy) 为中心放大 sc 倍 —— 折射就靠它。
    scene(ctx, W, H, cx, cy, sc) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(sc, sc);
        ctx.translate(-cx, -cy);

        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#2a6a9f');
        g.addColorStop(1, '#5a3a8f');
        ctx.fillStyle = g;
        ctx.fillRect(-W, -H, W * 3, H * 3);

        // 网格线
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1;
        for (let x = -W; x <= W * 2; x += 36) { ctx.beginPath(); ctx.moveTo(x, -H); ctx.lineTo(x, H * 2); ctx.stroke(); }
        for (let y = -H; y <= H * 2; y += 36) { ctx.beginPath(); ctx.moveTo(-W, y); ctx.lineTo(W * 2, y); ctx.stroke(); }

        // 彩色圆点（位置由索引决定，放大后依然稳定）
        for (let i = 0; i < 30; i++) {
            const dx = (i * 137.5) % W;
            const dy = (i * 91.7) % H;
            ctx.fillStyle = `hsla(${i * 30}, 85%, 65%, 0.85)`;
            ctx.beginPath();
            ctx.arc(dx, dy, 8 + (i % 4) * 5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    },
};