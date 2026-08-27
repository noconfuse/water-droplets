// 14 · 波形与声控动画
// 知识点：getByteTimeDomainData 时域采样 · 采样点连线成波形 · 低频驱动心跳
// 场景：波形线随音乐起伏；中间的心随低频节奏跳动。
window.LESSON = {
    no: '14',
    phase: '阶段四',
    title: '波形与声控动画',
    subtitle: 'getByteTimeDomainData · 时域波形 · 声控心跳',
    width: 900,
    height: 500,
    liveStep: true,
    audio: true,

    params: [
        { key: 'mode', label: '显示模式', type: 'select', value: 'both', options: ['both', 'wave', 'heart'] },
        { key: 'color', label: '颜色', type: 'color', value: '#4cc2ff' },
        { key: 'thickness', label: '线宽', min: 1, max: 8, step: 1, value: 3 },
        { key: 'sensitivity', label: '心跳敏感度', min: 0.5, max: 3, step: 0.1, value: 1.5 },
        { key: 'scale', label: '心大小', min: 1, max: 6, step: 0.1, value: 3.2 },
    ],

    code: [
        { template: 'analyser.getByteTimeDomainData(dataArray); // 时域采样', keys: [] },
        { template: 'const v = (dataArray[i] - 128) / 128;', keys: [] },
        { template: 'ctx.lineTo(x, 250 + v * 190);', keys: [], show: (p) => p.mode !== 'heart' },
        { template: 'beat = 1 + ${sensitivity} * bass / 255; // 心跳缩放', keys: ['sensitivity'], show: (p) => p.mode !== 'wave' },
        { template: 'ctx.scale(${scale} * beat, ${scale} * beat);', keys: ['scale'], show: (p) => p.mode !== 'wave' },
        { template: "ctx.fillStyle = '${color}';", keys: ['color'] },
        { template: 'ctx.strokeStyle = ctx.fillStyle;', keys: [] },
        { template: 'ctx.lineWidth = ${thickness};', keys: ['thickness'] },
    ],

    steps: [
        { at: 0.12, label: '① 时域采样 getByteTimeDomainData' },
        { at: 0.35, label: '② 采样点连线成波形' },
        { at: 0.6, label: '③ 波形随音乐起伏' },
        { at: 0.85, label: '④ 低频驱动心跳' },
    ],

    challenge: {
        desc: '把模式切到「wave」，只显示波形。',
        check: (p) => p.mode === 'wave',
    },

    draw(ctx, p, t, step, mouse, sound) {
        const W = this.width, H = this.height;

        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);

        if (!sound.playing) {
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('点击上方「▶ 播放音乐」开始', W / 2, H * 0.4);
            ctx.textAlign = 'left';
        }
        if (step < 0.12) return;

        const playing = sound.playing && sound.wave;

        // 波形
        if (p.mode !== 'heart' && step >= 0.35) {
            const n = playing ? sound.wave.length : 1024;
            ctx.beginPath();
            for (let i = 0; i < 700; i++) {
                let v;
                if (playing) {
                    const idx = Math.floor(i / 700 * n);
                    v = (sound.wave[idx] - 128) / 128;
                } else {
                    v = Math.sin(i * 0.05 + t * 6) * 0.3 + Math.sin(i * 0.013 - t * 2) * 0.3;
                }
                const x = i * W / 700;
                const y = H * 0.5 + v * H * 0.38;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.thickness;
            ctx.lineJoin = 'round';
            ctx.globalAlpha = step < 0.35 ? 0 : 0.9;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // 声控心跳（低频 bass 驱动）
        if (p.mode !== 'wave' && step >= 0.85) {
            let bass = 40;
            if (sound.dataArray) {
                bass = 0;
                for (let i = 0; i < sound.dataArray.length * 0.06; i++) bass = Math.max(bass, sound.dataArray[i]);
            }
            if (!sound.playing) bass = 50 + 30 * Math.sin(t * 3);
            const beat = 1 + (bass / 255) * p.sensitivity * 0.5;

            ctx.save();
            ctx.translate(W / 2, H * 0.48);
            ctx.scale(p.scale * beat, p.scale * beat);
            ctx.globalAlpha = 0.92;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 18;
            heartPath(ctx);
            ctx.fill();
            ctx.restore();
        }
    },

    heartPath(ctx) {
        ctx.beginPath();
        for (let i = 0; i < 60; i++) {
            const a = i / 60 * Math.PI * 2;
            const x = 15 * Math.sin(a) ** 3;
            const y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
    },
};