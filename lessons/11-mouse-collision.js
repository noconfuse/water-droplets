// 11 · 鼠标交互与碰撞
// 知识点：mousemove 坐标换算 · 鼠标力场（吸引/排斥） · 球-球弹性碰撞 · 边界反弹
// 场景：把鼠标移进画布，小球会被吸引或弹开；调 count 加球看互相碰撞。
window.LESSON = {
    no: '11',
    phase: '阶段三',
    title: '鼠标交互与碰撞',
    subtitle: 'mousemove · 力场 · 碰撞检测',
    width: 900,
    height: 500,
    liveStep: true,

    params: [
        { key: 'count', label: '小球数量', min: 2, max: 18, step: 1, value: 7 },
        { key: 'radius', label: '小球半径', min: 8, max: 34, step: 1, value: 20 },
        { key: 'force', label: '鼠标力场', min: 0, max: 3, step: 0.1, value: 1.2 },
        { key: 'repel', label: '鼠标排斥', type: 'bool', value: true },
        { key: 'showRange', label: '显示力场范围', type: 'bool', value: true },
    ],

    code: [
        { template: 'for (let i = 0; i < ${count}; i++) {', keys: ['count'] },
        { template: 'const d = Math.hypot(dx, dy);', keys: [] },
        { template: 'b.vx -= dx / d * ${force} * 60 * dt; // 排斥', keys: ['force'], show: (p) => p.repel },
        { template: 'b.vx += dx / d * ${force} * 60 * dt; // 吸引', keys: ['force'], show: (p) => !p.repel },
        { template: 'ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2); // 力场范围', keys: [], show: (p) => p.showRange },
        { template: 'if (b.x < ${radius}) b.vx *= -1;', keys: ['radius'] },
        { template: "ctx.arc(b.x, b.y, ${radius}, 0, Math.PI * 2);", keys: ['radius'] },
    ],

    steps: [
        { at: 0.1, label: '① 小球在盒内反弹' },
        { at: 0.4, label: '② 鼠标力场（吸引/排斥）' },
        { at: 0.7, label: '③ 球与球弹性碰撞' },
    ],

    challenge: {
        desc: '来一场「群球乱舞」：至少 14 个小球。',
        check: (p) => p.count >= 14,
    },

    balls: [],
    prevT: null,

    draw(ctx, p, t, step, mouse) {
        const W = this.width, H = this.height;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);

        if (step < 0.1) return;

        this.ensureBalls(p.count, p.radius);
        const dt = Math.min(t - (this.prevT ?? t), 0.05);
        this.prevT = t;

        // ② 鼠标力场
        if (step >= 0.4 && mouse.inside) {
            if (p.showRange) {
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.setLineDash([5, 7]);
                ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2); ctx.stroke();
                ctx.setLineDash([]);
            }
            for (const b of this.balls) {
                const dx = mouse.x - b.x, dy = mouse.y - b.y;
                const d = Math.hypot(dx, dy);
                if (d < 180 && d > 0.01) {
                    const f = (p.repel ? -1 : 1) * p.force * 40;
                    b.vx += dx / d * f * dt;
                    b.vy += dy / d * f * dt;
                }
            }
        }

        // ③ 球-球弹性碰撞
        if (step >= 0.7) {
            for (let i = 0; i < this.balls.length; i++) {
                for (let j = i + 1; j < this.balls.length; j++) {
                    const a = this.balls[i], c = this.balls[j];
                    const dx = c.x - a.x, dy = c.y - a.y;
                    const d = Math.hypot(dx, dy);
                    const min = p.radius * 2;
                    if (d < min && d > 0.01) {
                        const nx = dx / d, ny = dy / d;
                        // 分离重叠
                        const push = (min - d) / 2;
                        a.x -= nx * push; a.y -= ny * push;
                        c.x += nx * push; c.y += ny * push;
                        // 交换法向速度分量
                        const va = a.vx * nx + a.vy * ny;
                        const vc = c.vx * nx + c.vy * ny;
                        a.vx += (vc - va) * nx; a.vy += (vc - va) * ny;
                        c.vx += (va - vc) * nx; c.vy += (va - vc) * ny;
                    }
                }
            }
        }

        // 积分 + 边界反弹 + 阻尼
        for (const b of this.balls) {
            b.vx *= 0.994; b.vy *= 0.994;
            b.x += b.vx * dt; b.y += b.vy * dt;
            if (b.x < p.radius) { b.x = p.radius; b.vx *= -1; }
            if (b.x > W - p.radius) { b.x = W - p.radius; b.vx *= -1; }
            if (b.y < p.radius) { b.y = p.radius; b.vy *= -1; }
            if (b.y > H - p.radius) { b.y = H - p.radius; b.vy *= -1; }
        }

        // 绘制
        for (let i = 0; i < this.balls.length; i++) {
            const b = this.balls[i];
            const hue = (i / this.balls.length * 360 + (step >= 1 ? t * 20 : 0)) % 360;
            const g = ctx.createRadialGradient(b.x - 4, b.y - 4, 2, b.x, b.y, p.radius);
            g.addColorStop(0, `hsl(${hue}, 85%, 82%)`);
            g.addColorStop(1, `hsl(${hue}, 70%, 45%)`);
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(b.x, b.y, p.radius, 0, Math.PI * 2); ctx.fill();
        }

        if (step >= 0.4) {
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '12px sans-serif';
            ctx.fillText(p.repel ? '鼠标排斥：小球被推开' : '鼠标吸引：小球聚拢', 20, 22);
        }
    },

    ensureBalls(count, radius) {
        if (this.balls.length === count) return;
        this.balls = [];
        const W = this.width, H = this.height;
        for (let i = 0; i < count; i++) {
            this.balls.push({
                x: radius + Math.random() * (W - radius * 2),
                y: radius + Math.random() * (H - radius * 2),
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
            });
        }
    },
};