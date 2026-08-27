// 13 · Web Audio 频谱分析
// 知识点：AudioContext · AnalyserNode · getByteFrequencyData · FFT 分箱 → 柱状图
// 场景：点击工具栏「▶ 播放音乐」用本地 mp4 驱动频谱柱状图。
window.LESSON = {
    no: '13',
    phase: '阶段四',
    title: 'Web Audio 频谱分析',
    subtitle: 'AudioContext · AnalyserNode · getByteFrequencyData',
    width: 900,
    height: 500,
    audio: true,

    params: [
        { key: 'bands', label: '频段数', min: 16, max: 256, step: 8, value: 64 },
        { key: 'barScale', label: '柱宽倍率', min: 0.5, max: 3, step: 0.1, value: 1.2 },
        { key: 'color', label: '柱色', type: 'color', value: '#4cc2ff' },
        { key: 'log', label: '对数频段', type: 'bool', value: true },
        { key: 'mirror', label: '镜像', type: 'bool', value: true },
        { key: 'smooth', label: '平滑', type: 'bool', value: true },
    ],

    code: [
        { template: 'analyser.getByteFrequencyData(dataArray);', keys: [] },
        { template: 'const barHeight = dataArray[i]; // 频率 → 高度', keys: [] },
        { template: 'barHeight = prev * 0.6 + barHeight * 0.4; // 平滑', keys: [], show: (p) => p.smooth },
        { template: 'const f = Math.pow(i / ${bands}, 2.2); // 对数频段：低频密集', keys: ['bands'], show: (p) => p.log },
        { template: 'const barWidth = W / ${bands} * ${barScale};', keys: ['bands', 'barScale'] },
        { template: "ctx.fillStyle = '${color}';", keys: ['color'] },
        { template: 'ctx.fillRect(x, H - barHeight, barWidth, barHeight);', keys: [] },
        { template: 'ctx.fillRect(x, 0, barWidth, barHeight); // 镜像', keys: [], show: (p) => p.mirror },
    ],

    steps: [
        { at: 0.12, label: '① AudioContext + Analyser 频谱' },
        { at: 0.4, label: '② 频率数据 → 柱高' },
        { at: 0.65, label: '③ 频段分组 bands' },
        { at: 0.85, label: '④ 镜像与平滑' },
    ],

    challenge: {
        desc: '柱子加宽并打开镜像。',
        check: (p) => p.barScale >= 2 && p.mirror === true,
    },

    prev: [],

    draw(ctx, p, t, step, mouse, sound) {
        const W = this.width, H = this.height;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);

        // 未开始播放时提示
        if (!sound.playing) {
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('点击上方「▶ 播放音乐」开始频谱分析', W / 2, H / 2);
            ctx.textAlign = 'left';
        }
        if (step < 0.12) return;

        // 电平读数：始终显示，实时确认音频数据在流动
        ctx.fillStyle = sound.playing ? '#37d67a' : 'rgba(255,255,255,0.4)';
        ctx.font = '13px "SF Mono", Menlo, monospace';
        ctx.fillText(sound.playing ? `● 播放中 · 电平 ${Math.round(sound.level)}` : `○ 未播放 · 电平 0`, 16, 22);

        const N = p.bands;
        const srcLen = sound.dataArray ? sound.dataArray.length : 1024;
        const perW = W / N;
        const barW = perW * p.barScale;

        if (this.prev.length !== N) this.prev = new Array(N).fill(0);

        for (let i = 0; i < N; i++) {
            let val = 0;
            if (sound.playing) {
                // 对数频段：能量集中在低频，线性均分会把右半留空；
                // Math.pow 让低频占更多柱条、高频聚合，视觉更均衡
                let f0, f1;
                if (p.log) {
                    f0 = Math.pow(i / N, 2.2);
                    f1 = Math.pow((i + 1) / N, 2.2);
                } else {
                    f0 = i / N;
                    f1 = (i + 1) / N;
                }
                const a = Math.floor(f0 * srcLen);
                const b = Math.max(a + 1, Math.floor(f1 * srcLen));
                for (let j = a; j < b; j++) val = Math.max(val, sound.dataArray[j]);
            } else {
                // 演示数据：让画面先有个样子
                val = 60 + 40 * Math.sin(i * 0.3 + t * 4) + 30 * Math.sin(i * 0.7 - t * 2);
            }
            if (p.smooth && step >= 0.85) {
                val = this.prev[i] * 0.6 + val * 0.4;
            }
            this.prev[i] = val;

            const x = i * perW + (perW - barW) / 2;
            const h = Math.min(val, H / 2 - 4);
            const a = step < 0.4 ? 0 : 0.85;
            ctx.globalAlpha = a;
            ctx.fillStyle = p.color;
            ctx.fillRect(x, H - h, barW, h);
            if (p.mirror) {
                ctx.globalAlpha = a * 0.6;
                ctx.fillRect(x, 0, barW, h);
            }
        }
        ctx.globalAlpha = 1;
    },
};