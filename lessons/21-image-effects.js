// 21 · 视频 / 图片特效
// 知识点：drawImage 变形（缩放/旋转） · imageSmoothingEnabled · 逐行绘制
// 场景：对背景图做水波纹 / 像素风 / 扫描线 / 旋转缩放。
window.LESSON = {
    no: '21',
    phase: '阶段六',
    title: '视频 / 图片特效',
    subtitle: 'drawImage 变形 · 像素风 · 水波纹 · 扫描线',
    width: 900,
    height: 500,
    liveStep: true,

    params: [
        { key: 'effect', label: '特效', type: 'select', value: '水波纹', options: ['原图', '水波纹', '像素风', '扫描线', '旋转缩放'] },
        { key: 'strength', label: '强度', min: 0.2, max: 1, step: 0.05, value: 0.6 },
        { key: 'speed', label: '速度', min: 0, max: 4, step: 0.1, value: 1 },
    ],

    code: [
        { template: 'ctx.drawImage(img, 0, 0, W, H);', keys: [] },
        { template: 'ctx.drawImage(img, 0, y, W, 1, 0, y + sin(t + y) * ${strength}, W, 1); // 水波纹', keys: ['strength'], show: (p) => p.effect === '水波纹' },
        { template: 'ctx.imageSmoothingEnabled = false; // 像素风', keys: [], show: (p) => p.effect === '像素风' },
        { template: 'ctx.fillRect(0, y, W, 1.5); // 扫描线', keys: [], show: (p) => p.effect === '扫描线' },
        { template: 'ctx.rotate(t * ${speed}); // 旋转缩放', keys: ['speed'], show: (p) => p.effect === '旋转缩放' },
    ],

    steps: [
        { at: 0.12, label: '① drawImage 绘制图片帧' },
        { at: 0.4, label: '② drawImage 缩放 / 旋转' },
        { at: 0.65, label: '③ 像素风 / 扫描线' },
        { at: 0.85, label: '④ 水波纹逐行偏移' },
    ],

    challenge: {
        desc: '水波纹强度拉高到 ≥ 0.9。',
        check: (p) => p.effect === '水波纹' && p.strength >= 0.9,
    },

    small: null,

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

        // 源图缓存到离屏画布
        if (!this.src) {
            this.src = document.createElement('canvas');
            this.src.width = W; this.src.height = H;
            this.src.getContext('2d').drawImage(bg, 0, 0, W, H);
        }
        const off = this.src;

        switch (p.effect) {
            case '原图':
                ctx.drawImage(off, 0, 0, W, H);
                break;

            case '水波纹':
                const amp = 4 + p.strength * 10;
                for (let y = 0; y < H; y++) {
                    const dy = Math.sin(y * 0.06 + t * p.speed * 4) * amp;
                    ctx.drawImage(off, 0, y, W, 1, 0, y + dy, W, 1);
                }
                break;

            case '像素风':
                const sw = 80, sh = Math.round(80 * H / W);
                if (!this.small) {
                    this.small = document.createElement('canvas');
                    this.small.width = sw; this.small.height = sh;
                }
                this.small.getContext('2d').drawImage(off, 0, 0, sw, sh);
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(this.small, 0, 0, W, H);
                ctx.imageSmoothingEnabled = true;
                break;

            case '扫描线':
                ctx.drawImage(off, 0, 0, W, H);
                ctx.fillStyle = `rgba(0,0,0,${0.25 + p.strength * 0.3})`;
                for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1.5);
                break;

            case '旋转缩放':
                ctx.save();
                ctx.translate(W / 2, H / 2);
                const sca = 1.4 + p.strength * 0.6;
                const rot = t * p.speed * 0.3;
                ctx.rotate(Math.sin(rot) * 0.6);
                ctx.scale(sca, sca);
                ctx.drawImage(off, -W / 2, -H / 2, W, H);
                ctx.restore();
                break;
        }
    },
};