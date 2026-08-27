// 19 · 像素操作
// 知识点：getImageData 读取像素 · putImageData 写回 · RGBA 通道遍历 · 像素级特效
// 场景：对背景图做灰度/反色/马赛克/阈值。改参数时重新处理一次并缓存，保证流畅。
window.LESSON = {
    no: '19',
    phase: '阶段六',
    title: '像素操作',
    subtitle: 'getImageData · putImageData · 通道遍历',
    width: 900,
    height: 500,

    params: [
        { key: 'mode', label: '特效', type: 'select', value: '灰度', options: ['原图', '灰度', '反色', '马赛克', '阈值'] },
        { key: 'blockSize', label: '马赛克块大小', min: 2, max: 30, step: 1, value: 10 },
        { key: 'threshold', label: '阈值', min: 0, max: 255, step: 1, value: 128 },
    ],

    code: [
        { template: 'const data = ctx.getImageData(0, 0, W, H).data;', keys: [] },
        { template: 'const gray = 0.299 * r + 0.587 * g + 0.114 * b;', keys: [], show: (p) => p.mode === '灰度' },
        { template: 'data[i] = 255 - data[i]; // 反色', keys: [], show: (p) => p.mode === '反色' },
        { template: 'const r = d[si], g = d[si + 1], b = d[si + 2]; // 取块色', keys: [], show: (p) => p.mode === '马赛克' },
        { template: 'd[i] = r; d[i + 1] = g; d[i + 2] = b; // 填满 ${blockSize}px 块', keys: ['blockSize'], show: (p) => p.mode === '马赛克' },
        { template: 'data[i] = data[i] > ${threshold} ? 255 : 0; // 阈值', keys: ['threshold'], show: (p) => p.mode === '阈值' },
        { template: 'ctx.putImageData(img, 0, 0);', keys: [] },
    ],

    steps: [
        { at: 0.12, label: '① 原图 drawImage' },
        { at: 0.35, label: '② getImageData 读取像素' },
        { at: 0.6, label: '③ 灰度 / 反色：通道变换' },
        { at: 0.85, label: '④ 马赛克 / 阈值' },
    ],

    challenge: {
        desc: '把画面变成大块马赛克：块大小 ≥ 20。',
        check: (p) => p.mode === '马赛克' && p.blockSize >= 20,
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

        // 参数变化时才重算像素，结果缓存到离屏画布
        const key = `${p.mode}|${p.blockSize}|${p.threshold}`;
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

        if (p.mode !== '原图') {
            const img = oc.getImageData(0, 0, W, H);
            const d = img.data;

            if (p.mode === '灰度') {
                for (let i = 0; i < d.length; i += 4) {
                    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
                    d[i] = d[i + 1] = d[i + 2] = g;
                }
            } else if (p.mode === '反色') {
                for (let i = 0; i < d.length; i += 4) {
                    d[i] = 255 - d[i];
                    d[i + 1] = 255 - d[i + 1];
                    d[i + 2] = 255 - d[i + 2];
                }
            } else if (p.mode === '阈值') {
                for (let i = 0; i < d.length; i += 4) {
                    const v = d[i] > p.threshold ? 255 : 0;
                    d[i] = d[i + 1] = d[i + 2] = v;
                }
            } else if (p.mode === '马赛克') {
                const bs = p.blockSize;
                for (let by = 0; by < H; by += bs) {
                    for (let bx = 0; bx < W; bx += bs) {
                        const si = (by * W + bx) * 4;
                        const r = d[si], g = d[si + 1], b = d[si + 2];
                        for (let y = by; y < Math.min(by + bs, H); y++) {
                            for (let x = bx; x < Math.min(bx + bs, W); x++) {
                                const i = (y * W + x) * 4;
                                d[i] = r; d[i + 1] = g; d[i + 2] = b;
                            }
                        }
                    }
                }
            }
            oc.putImageData(img, 0, 0);
        }
        this.cached = off;
    },
};