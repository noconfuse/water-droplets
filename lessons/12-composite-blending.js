// 12 · 合成与混合模式
// 知识点：globalCompositeOperation 合成模式 · clip 裁剪区域 · 透明叠加
// 场景：多个光斑叠加，切换合成模式看颜色如何混合；打开「裁剪」看 clip 限制绘制区域。
window.LESSON = {
    no: '12',
    phase: '阶段三',
    title: '合成与混合模式',
    subtitle: 'globalCompositeOperation · clip · 透明叠加',
    width: 900,
    height: 500,
    liveStep: true,

    params: [
        {
            key: 'mode', label: '合成模式', type: 'select', value: 'lighter',
            options: ['source-over', 'lighter', 'screen', 'multiply', 'overlay', 'xor', 'destination-out'],
        },
        { key: 'blobCount', label: '光斑数量', min: 2, max: 8, step: 1, value: 5 },
        { key: 'alpha', label: '不透明度', min: 0.1, max: 1, step: 0.05, value: 0.6 },
        { key: 'showClip', label: '裁剪演示', type: 'bool', value: true },
    ],

    code: [
        { template: "ctx.globalCompositeOperation = '${mode}';", keys: ['mode'] },
        { template: 'ctx.globalAlpha = ${alpha};', keys: ['alpha'] },
        { template: 'for (let i = 0; i < ${blobCount}; i++) {', keys: ['blobCount'] },
        { template: 'ctx.beginPath(); ctx.arc(738, 160, 105, 0, Math.PI * 2);', keys: [], show: (p) => p.showClip },
        { template: 'ctx.clip(); // 蒙版：之后的绘制只露出圆内', keys: [], show: (p) => p.showClip },
        { template: 'ctx.fillRect(0, 0, W, H); // 铺满画布，但被裁剪进圆', keys: [], show: (p) => p.showClip },
    ],

    steps: [
        { at: 0.12, label: '① 半透明色块叠加' },
        { at: 0.4, label: '② globalCompositeOperation 切换' },
        { at: 0.7, label: '③ clip 裁剪绘制区域' },
    ],

    challenge: {
        desc: '调出「相加发光」：合成模式 lighter + 不透明度 ≥ 0.8。',
        check: (p) => p.mode === 'lighter' && p.alpha >= 0.8,
    },

    draw(ctx, p, t, step) {
        const W = this.width, H = this.height;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);
        if (step < 0.12) return;

        const cx = W / 2, cy = H / 2;
        const mode = step < 0.4 ? 'source-over' : p.mode;

        // ①② 光斑叠加
        ctx.save();
        ctx.globalCompositeOperation = mode;
        ctx.globalAlpha = p.alpha;
        const n = p.blobCount;
        for (let i = 0; i < n; i++) {
            const a = i / n * Math.PI * 2 + (step >= 1 ? t * 0.15 : 0);
            const bx = cx + Math.cos(a) * 130;
            const by = cy + Math.sin(a) * 90;
            const r = 90 + Math.sin(i * 3.7) * 40;
            const hue = (i / n * 360 + 20) % 360;
            const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
            g.addColorStop(0, `hsla(${hue}, 90%, 70%, 1)`);
            g.addColorStop(1, `hsla(${hue}, 90%, 70%, 0)`);
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();

        // 分区标注：两个演示互不影响
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.font = '12px sans-serif';
        ctx.fillText('① 光斑 · globalCompositeOperation 颜色混合', 16, 20);

        // ③ clip 裁剪演示：画满整张画布的斜条纹，被圆裁掉只剩圆内
        if (step >= 0.7 && p.showClip) {
            const cx2 = W * 0.82, cy2 = H * 0.32, cr = 105;
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('② clip() 裁剪蒙版', cx2 - cr - 2, cy2 - cr - 8);
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx2, cy2, cr, 0, Math.PI * 2);
            ctx.clip(); // 之后的绘制只出现在这个圆里

            // 这些斜条纹本来会铺满整个画布，但被蒙版裁到只剩圆内
            const stripe = 22;
            const off = step >= 1 ? t * 40 : 0;
            for (let x = -H - stripe; x < W + H; x += stripe) {
                const hue = ((x + off) / stripe * 24 + 180) % 360;
                ctx.fillStyle = `hsla(${hue}, 85%, 60%, 0.85)`;
                ctx.beginPath();
                ctx.moveTo(x + off, 0);
                ctx.lineTo(x + off + H, H);
                ctx.lineTo(x + off + H + stripe, H);
                ctx.lineTo(x + off + stripe, 0);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();

            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.setLineDash([5, 7]);
            ctx.beginPath(); ctx.arc(cx2, cy2, cr, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('这些斜条纹本应铺满整张画布，', cx2, cy2 + cr + 18);
            ctx.fillText('但 clip() 之后只露出圆内的部分', cx2, cy2 + cr + 34);
            ctx.textAlign = 'left';
        }

        if (step >= 0.4) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`globalCompositeOperation = '${mode}'`, cx, H - 18);
            ctx.textAlign = 'left';
        }
    },
};