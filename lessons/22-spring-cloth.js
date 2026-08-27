// 22 · 弹簧与摆
// 知识点：胡克定律 F = -kx · 重力 · 阻尼 · 欧拉积分 · 约束迭代（布料）
// 场景：三种力学模拟：单摆 / 弹簧振子 / 布料网格。布料可用鼠标拖拽。
window.LESSON = {
    no: '22',
    phase: '阶段七',
    title: '弹簧与摆',
    subtitle: '胡克定律 · 阻尼 · 欧拉积分 · 布料约束',
    width: 900,
    height: 500,
    liveStep: true,

    params: [
        { key: 'mode', label: '模式', type: 'select', value: '摆', options: ['摆', '弹簧', '布料'] },
        { key: 'gravity', label: '重力', min: 0.1, max: 1, step: 0.05, value: 0.5 },
        { key: 'damping', label: '阻尼', min: 0.01, max: 0.08, step: 0.005, value: 0.02 },
        { key: 'stiffness', label: '刚度', min: 0.02, max: 0.2, step: 0.01, value: 0.1 },
        { key: 'gridX', label: '布料网格列数', min: 6, max: 20, step: 1, value: 12 },
    ],

    code: [
        { template: 'angVel += -((${gravity} * 400 / L) * Math.sin(ang)) * dt; // 摆', keys: ['gravity'], show: (p) => p.mode === '摆' },
        { template: 'F = -${stiffness} * (y - restY); // 胡克定律', keys: ['stiffness'], show: (p) => p.mode === '弹簧' },
        { template: 'vy += ${gravity} * 400 * dt; // 重力', keys: ['gravity'] },
        { template: 'v *= (1 - ${damping}); // 阻尼', keys: ['damping'] },
        { template: 'const diff = (d - rest) / d;', keys: [], show: (p) => p.mode === '布料' },
        { template: 'A.x += dx * diff * 0.5; A.y += dy * diff * 0.5; B.x -= dx * diff * 0.5; B.y -= dy * diff * 0.5; // 约束拉回', keys: [], show: (p) => p.mode === '布料' },
        { template: 'const cols = ${gridX}, rows = Math.round(cols * 0.6); // 布料网格', keys: ['gridX'], show: (p) => p.mode === '布料' },
    ],

    steps: [
        { at: 0.12, label: '① 单摆：重力力矩' },
        { at: 0.38, label: '② 弹簧：F = -kx 胡克定律' },
        { at: 0.62, label: '③ 布料：质点网格 + 约束迭代' },
        { at: 0.85, label: '④ 鼠标拖拽交互' },
    ],

    challenge: {
        desc: '把模式切到「布料」。',
        check: (p) => p.mode === '布料',
    },

    state: null,
    mode: null,
    prevT: null,

    draw(ctx, p, t, step, mouse) {
        const W = this.width, H = this.height;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);
        if (step < 0.12) return;

        const dt = Math.min(t - (this.prevT ?? t), 0.05);
        this.prevT = t;

        if (p.mode !== this.mode) { this.mode = p.mode; this.state = null; this.cloth = null; }

        if (p.mode === '摆') this.drawPendulum(ctx, p, dt, step);
        else if (p.mode === '弹簧') this.drawSpring(ctx, p, dt, step, mouse);
        else this.drawCloth(ctx, p, dt, step, mouse);
    },

    // —— 单摆 ——
    drawPendulum(ctx, p, dt, step) {
        const W = this.width;
        if (!this.state) this.state = { th: 0.6, w: 0 };
        const px = W / 2, py = 70, L = 260;
        const s = this.state;
        const g = p.gravity * 400;
        s.w += (-(g / L) * Math.sin(s.th)) * dt;
        s.w *= (1 - p.damping);
        s.th += s.w * dt;
        const bx = px + L * Math.sin(s.th);
        const by = py + L * Math.cos(s.th);

        // 支架
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
        // 摆球
        ctx.save();
        ctx.shadowColor = p.color || '#4cc2ff';
        ctx.shadowBlur = 12;
        ctx.fillStyle = p.color || '#4cc2ff';
        ctx.beginPath(); ctx.arc(bx, by, 16, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // 角度弧线
        if (step >= 0.85) {
            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.beginPath(); ctx.arc(px, py, 60, 0, s.th, false); ctx.stroke();
        }
    },

    // —— 弹簧振子 ——
    drawSpring(ctx, p, dt, step, mouse) {
        const W = this.width;
        if (!this.state) this.state = { y: 300, v: 0, restY: 300 };
        const s = this.state;
        const ax = W / 2, ay = 70;
        // 鼠标可拖拽质量块
        if (mouse.down && mouse.inside && Math.abs(mouse.y - s.y) < 50 && Math.abs(mouse.x - ax) < 60) {
            s.y = mouse.y; s.v = 0;
        }
        const F = -p.stiffness * 30 * (s.y - s.restY) + p.gravity * 400;
        s.v += F * dt;
        s.v *= (1 - p.damping);
        s.y += s.v * dt;

        // 弹簧折线
        const segs = 8;
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        for (let i = 1; i < segs; i++) {
            const yy = ay + (s.y - ay) * i / segs;
            ctx.lineTo(ax + (i % 2 ? 18 : -18), yy);
        }
        ctx.lineTo(ax, s.y);
        ctx.stroke();
        // 质量块
        ctx.save();
        ctx.shadowColor = '#4cc2ff';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#4cc2ff';
        ctx.beginPath(); ctx.arc(ax, s.y, 22, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        if (step >= 0.6) {
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '12px sans-serif';
            ctx.fillText('拖住方块上下拉', W / 2 - 50, s.y + 45);
        }
    },

    // —— 布料（Verlet 约束） ——
    drawCloth(ctx, p, dt, step, mouse) {
        const W = this.width, H = this.height;
        const cols = p.gridX, rows = Math.max(3, Math.round(cols * 0.6));
        const cw = W * 0.72, ch = H * 0.5;
        const x0 = (W - cw) / 2, y0 = H * 0.1;

        if (!this.cloth) {
            this.cloth = [];
            this.constr = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    this.cloth.push({
                        x: x0 + c * cw / (cols - 1), y: y0 + r * ch / (rows - 1),
                        px: x0 + c * cw / (cols - 1), py: y0 + r * ch / (rows - 1),
                        pinned: r === 0,
                    });
                }
            }
            const id = (r, c) => r * cols + c;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (c < cols - 1) this.constr.push([id(r, c), id(r, c + 1)]);
                    if (r < rows - 1) this.constr.push([id(r, c), id(r + 1, c)]);
                }
            }
        }
        const pts = this.cloth;

        // 拖拽：抓最近的质点
        if (mouse.down && mouse.inside) {
            let best = -1, bd = 45;
            for (let i = 0; i < pts.length; i++) {
                const d = Math.hypot(pts[i].x - mouse.x, pts[i].y - mouse.y);
                if (d < bd) { bd = d; best = i; }
            }
            this.drag = best;
        } else this.drag = -1;

        const g = p.gravity * 3000;
        const dmp = 1 - p.damping;
        const rest = cw / (cols - 1);
        for (const pt of pts) {
            if (pt.pinned) continue;
            let vx = (pt.x - pt.px) * dmp;
            let vy = (pt.y - pt.py) * dmp;
            pt.px = pt.x; pt.py = pt.y;
            pt.x += vx;
            pt.y += vy + g * dt * dt;
        }
        if (this.drag >= 0) {
            const d = pts[this.drag];
            d.x = mouse.x; d.y = mouse.y; d.px = mouse.x; d.py = mouse.y;
        }
        // 约束迭代
        const iters = 4;
        for (let it = 0; it < iters; it++) {
            for (const [a, b] of this.constr) {
                const A = pts[a], B = pts[b];
                let dx = B.x - A.x, dy = B.y - A.y;
                let d = Math.hypot(dx, dy) || 0.001;
                const diff = (d - rest) / d;
                if (A.pinned && B.pinned) continue;
                if (A.pinned) { B.x -= dx * diff; B.y -= dy * diff; }
                else if (B.pinned) { A.x += dx * diff; A.y += dy * diff; }
                else { A.x += dx * diff * 0.5; A.y += dy * diff * 0.5; B.x -= dx * diff * 0.5; B.y -= dy * diff * 0.5; }
            }
        }

        // 绘制：填充 + 连线
        ctx.fillStyle = 'rgba(76,194,255,0.25)';
        ctx.strokeStyle = 'rgba(76,194,255,0.7)';
        ctx.lineWidth = 1;
        for (const [a, b] of this.constr) {
            const A = pts[a], B = pts[b];
            ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
        }
        for (const pt of pts) {
            ctx.beginPath(); ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = pt.pinned ? '#fff' : 'rgba(76,194,255,0.9)';
            ctx.fill();
        }
        if (step >= 0.85) {
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '12px sans-serif';
            ctx.fillText('顶排固定，其余随重力下垂，用约束拉回——拖住任意点甩一甩', 20, 22);
        }
    },
};