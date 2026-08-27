// 03 · 样式与渐变色
// 知识点：createLinearGradient 线性渐变 · addColorStop 色标 · createRadialGradient 径向渐变
// 场景：海上落日。拖渐变终点，天空颜色方向跟着变；拖太阳参数，落日发光位置变化。
window.LESSON = {
    no: '03',
    phase: '阶段一',
    title: '样式与渐变色',
    subtitle: 'createLinearGradient · addColorStop · createRadialGradient',
    width: 900,
    height: 500,

    params: [
        { key: 'gx1', label: '渐变终点 X', min: 0, max: 900, step: 10, value: 900 },
        { key: 'gy1', label: '渐变终点 Y', min: 0, max: 300, step: 10, value: 100 },
        { key: 'c1', label: '天空上色', type: 'color', value: '#ff9a56' },
        { key: 'c2', label: '天空下色', type: 'color', value: '#ff4e6e' },
        { key: 'sunX', label: '太阳 X', min: 100, max: 800, step: 10, value: 450 },
        { key: 'sunY', label: '太阳 Y', min: 60, max: 300, step: 10, value: 175 },
        { key: 'sunR', label: '太阳半径', min: 20, max: 180, step: 2, value: 95 },
    ],

    code: [
        { template: 'const sky = ctx.createLinearGradient(0, 0, ${gx1}, ${gy1});', keys: ['gx1', 'gy1'] },
        { template: "sky.addColorStop(0, '${c1}');", keys: ['c1'] },
        { template: "sky.addColorStop(1, '${c2}');", keys: ['c2'] },
        { template: 'const sun = ctx.createRadialGradient(${sunX}, ${sunY}, 0, ${sunX}, ${sunY}, ${sunR});', keys: ['sunX', 'sunY', 'sunR'] },
    ],

    steps: [
        { at: 0.12, label: '① 铺底色' },
        { at: 0.38, label: '② 线性渐变天空' },
        { at: 0.62, label: '③ 径向渐变太阳' },
        { at: 0.85, label: '④ 海面与光柱' },
    ],

    challenge: {
        desc: '把天空调成「黑夜」：上色深蓝、下色偏黑、太阳缩到最小。',
        check: (p) => {
            const lum = (hex) => {
                const v = hex.slice(1);
                const r = parseInt(v.slice(0, 2), 16);
                const g = parseInt(v.slice(2, 4), 16);
                const b = parseInt(v.slice(4, 6), 16);
                return 0.299 * r + 0.587 * g + 0.114 * b;
            };
            return lum(p.c1) < 90 && lum(p.c2) < 70 && p.sunR <= 22;
        },
    },

    draw(ctx, p, t, step) {
        const W = this.width, H = this.height;
        const skyTop = Math.round(H * 0.6);

        // ① 底色
        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);
        if (step < 0.12) return;

        // ② 天空线性渐变
        const skyA = Math.min(1, (step - 0.38) / 0.15);
        if (skyA > 0) {
            const sky = ctx.createLinearGradient(0, 0, p.gx1, p.gy1);
            sky.addColorStop(0, p.c1);
            sky.addColorStop(1, p.c2);
            ctx.globalAlpha = skyA;
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, W, skyTop);
            ctx.globalAlpha = 1;
        }

        // ③ 径向渐变太阳
        const sunA = Math.min(1, (step - 0.62) / 0.18);
        if (sunA > 0) {
            ctx.globalAlpha = sunA;
            const sun = ctx.createRadialGradient(p.sunX, p.sunY, 0, p.sunX, p.sunY, p.sunR);
            sun.addColorStop(0, '#fff7e0');
            sun.addColorStop(0.7, p.c2);
            sun.addColorStop(1, 'rgba(255,78,110,0)');
            ctx.fillStyle = sun;
            ctx.beginPath();
            ctx.arc(p.sunX, p.sunY, p.sunR, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // ④ 海面与光柱
        const seaA = Math.min(1, (step - 0.85) / 0.12);
        if (seaA > 0) {
            ctx.globalAlpha = seaA;
            const sea = ctx.createLinearGradient(0, skyTop, 0, H);
            sea.addColorStop(0, p.c2);
            sea.addColorStop(1, '#171f38');
            ctx.fillStyle = sea;
            ctx.fillRect(0, skyTop, W, H - skyTop);

            // 太阳倒影光柱（半透明竖条，随太阳位置走）
            for (let i = 0; i < 7; i++) {
                const bw = 6 + i * 5;
                ctx.fillStyle = `rgba(255,255,255,${0.05 + i * 0.012})`;
                ctx.fillRect(p.sunX - bw / 2, skyTop + 4 + i * 8, bw, H - skyTop - 4 - i * 8);
            }
            ctx.globalAlpha = 1;
        }

        // 正常模式下：阳光微微呼吸
        if (step >= 1) {
            const pulse = 0.5 + 0.5 * Math.sin(t * 1.6);
            const glow = ctx.createRadialGradient(p.sunX, p.sunY, p.sunR * 0.5, p.sunX, p.sunY, p.sunR * 2);
            glow.addColorStop(0, `rgba(255,210,150,${0.18 + 0.12 * pulse})`);
            glow.addColorStop(1, 'rgba(255,210,150,0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(p.sunX, p.sunY, p.sunR * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    },
};