// 20 · 卷积滤镜
// 知识点：卷积核（3×3 矩阵） · 邻域加权求和 · 模糊/锐化/浮雕/边缘
// 场景：对背景图应用卷积滤镜，strength 控制与原图的混合比例。
window.LESSON = {
    no: '20',
    phase: '阶段六',
    title: '卷积滤镜',
    subtitle: '卷积核 · 邻域加权 · 模糊/锐化/浮雕/边缘',
    width: 900,
    height: 500,

    params: [
        { key: 'mode', label: '滤镜', type: 'select', value: '锐化', options: ['原图', '模糊', '锐化', '浮雕', '边缘'] },
        { key: 'strength', label: '强度', min: 0, max: 1, step: 0.05, value: 1 },
    ],

    code: [
        { template: 'const kernel = [1,1,1, 1,1,1, 1,1,1] / 9; // 模糊核', keys: [], show: (p) => p.mode === '模糊' },
        { template: 'const kernel = [0,-1,0, -1,5,-1, 0,-1,0]; // 锐化核', keys: [], show: (p) => p.mode === '锐化' },
        { template: 'const kernel = [-2,-1,0, -1,1,1, 0,1,2]; // 浮雕核', keys: [], show: (p) => p.mode === '浮雕' },
        { template: 'const kernel = [-1,-1,-1, -1,8,-1, -1,-1,-1]; // 边缘核', keys: [], show: (p) => p.mode === '边缘' },
        { template: 'for (ky = -1..1) for (kx = -1..1) sum += source[idx] * kernel[k];', keys: [] },
        { template: 'out = Math.max(0, Math.min(255, sum));', keys: [] },
        { template: 'out = orig * (1 - ${strength}) + filtered * ${strength};', keys: ['strength'] },
    ],

    steps: [
        { at: 0.12, label: '① 原图' },
        { at: 0.35, label: '② 卷积：3×3 邻域 × 核' },
        { at: 0.6, label: '③ 模糊 / 锐化' },
        { at: 0.85, label: '④ 浮雕 / 边缘' },
    ],

    challenge: {
        desc: '锐化并拉满强度。',
        check: (p) => p.mode === '锐化' && p.strength >= 0.95,
    },

    cacheKey: null,
    cached: null,

    draw(ctx, p, t, step) {
        const W = this.width, H = this.height;
        const bg = window.BG_IMG;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);
        if (step < 0.12) return;

        if (!bg) {
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '13px sans-serif';
            ctx.fillText('背景图加载中…', 20, 30);
            return;
        }

        const key = `${p.mode}|${p.strength}`;
        if (this.cacheKey !== key) {
            this.process(bg, p);
            this.cacheKey = key;
        }
        ctx.drawImage(this.cached, 0, 0, W, H);
    },

    process(bg, p) {
        const W = this.width, H = this.height;
        const off = document.createElement('canvas');
        off.width = W; off.height = H;
        const oc = off.getContext('2d', { willReadFrequently: true });
        oc.drawImage(bg, 0, 0, W, H);

        const KERNELS = {
            模糊: [1, 1, 1, 1, 1, 1, 1, 1, 1].map(v => v / 9),
            锐化: [0, -1, 0, -1, 5, -1, 0, -1, 0],
            浮雕: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
            边缘: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
        };
        const k = KERNELS[p.mode] || [0, 0, 0, 0, 1, 0, 0, 0, 0];

        const src = oc.getImageData(0, 0, W, H);
        const sd = src.data;
        const out = oc.createImageData(W, H);
        const od = out.data;

        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                const oi = (y * W + x) * 4;
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const yy = Math.min(H - 1, Math.max(0, y + ky));
                            const xx = Math.min(W - 1, Math.max(0, x + kx));
                            sum += sd[(yy * W + xx) * 4 + c] * k[(ky + 1) * 3 + (kx + 1)];
                        }
                    }
                    // 与原图按 strength 混合
                    const orig = sd[oi + c];
                    const v = orig * (1 - p.strength) + sum * p.strength;
                    od[oi + c] = Math.max(0, Math.min(255, v));
                }
                od[oi + 3] = 255;
            }
        }
        oc.putImageData(out, 0, 0);
        this.cached = off;
    },
};