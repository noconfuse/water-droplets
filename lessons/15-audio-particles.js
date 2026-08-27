// 15 · 音频驱动视觉
// 知识点：频率 → 粒子参数映射 · 低频 bass 驱动半径 · 高频 treble 驱动亮度 · 轨迹
// 场景：粒子圆环随低频扩散、随高频发光，半透明层叠留下放射轨迹。
window.LESSON = {
    no: '15',
    phase: '阶段四',
    title: '音频驱动视觉',
    subtitle: '频率 → 参数映射 · 声控粒子圆环',
    width: 900,
    height: 500,
    liveStep: true,
    persist: true, // 半透明层叠 → 放射轨迹
    audio: true,

    params: [
        { key: 'count', label: '粒子数量', min: 32, max: 256, step: 4, value: 128 },
        { key: 'sensitivity', label: '敏感度', min: 0.5, max: 4, step: 0.1, value: 2 },
        { key: 'size', label: '粒子大小', min: 1, max: 6, step: 0.5, value: 3 },
        { key: 'speed', label: '自转速度', min: 0, max: 3, step: 0.1, value: 0.5 },
        { key: 'color', label: '颜色', type: 'color', value: '#4cc2ff' },
        { key: 'glow', label: '高频光晕', type: 'bool', value: true },
    ],

    code: [
        { template: 'for (let i = 0; i < n * 0.06; i++) bass = Math.max(bass, data[i]); // 低频能量', keys: [] },
        { template: 'const r = 70 + ${sensitivity} * (bass / 255) * 140;', keys: ['sensitivity'] },
        { template: 'for (let i = 0; i < ${count}; i++) {', keys: ['count'] },
        { template: '  const a = i / ${count} * Math.PI * 2 + t * ${speed}; // 自转', keys: ['count', 'speed'] },
        { template: '  const x = cx + r * Math.cos(a);', keys: [] },
        { template: "  ctx.fillStyle = '${color}';", keys: ['color'] },
        { template: '  ctx.arc(x, y, ${size}, 0, Math.PI * 2);', keys: ['size'] },
        { template: '  ctx.arc(x, y, ${size} * 3, 0, Math.PI * 2); // 高频光晕', keys: ['size'], show: (p) => p.glow },
    ],

    steps: [
        { at: 0.12, label: '① 音频 → 低频/高频' },
        { at: 0.38, label: '② 低频 bass 驱动半径' },
        { at: 0.62, label: '③ 高频 treble 驱动亮度' },
        { at: 0.85, label: '④ 半透明层叠 → 放射轨迹' },
    ],

    challenge: {
        desc: '开启高频光晕，敏感度拉到 ≥ 3。',
        check: (p) => p.glow === true && p.sensitivity >= 3,
    },

    draw(ctx, p, t, step, mouse, sound) {
        const W = this.width, H = this.height;

        // 半透明层叠：不清屏，上一帧粒子淡出成放射轨迹
        ctx.fillStyle = 'rgba(14,19,32,0.18)';
        ctx.fillRect(0, 0, W, H);

        if (!sound.playing) {
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('点击上方「▶ 播放音乐」开始', W / 2, H / 2);
            ctx.textAlign = 'left';
        }
        if (step < 0.12) return;

        // 低频 / 高频能量
        let bass = 0, treble = 0;
        if (sound.playing && sound.dataArray) {
            const n = sound.dataArray.length;
            for (let i = 0; i < n * 0.06; i++) bass = Math.max(bass, sound.dataArray[i]);
            for (let i = Math.floor(n * 0.55); i < n; i += 4) treble = Math.max(treble, sound.dataArray[i]);
        } else {
            bass = 40 + 20 * Math.sin(t * 3);
            treble = 30 + 15 * Math.sin(t * 5);
        }

        const cx = W / 2, cy = H / 2;
        const r = 70 + (bass / 255) * p.sensitivity * 140;
        const base = t * p.speed * 0.5;

        for (let i = 0; i < p.count; i++) {
            const a = i / p.count * Math.PI * 2 + base;
            const rr = r * (0.85 + 0.15 * Math.sin(i * 7.3 + t));
            const x = cx + Math.cos(a) * rr;
            const y = cy + Math.sin(a) * rr;

            ctx.globalAlpha = 0.5 + (treble / 255) * 0.5;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // 高频光晕
            if (p.glow && step >= 0.85) {
                ctx.globalAlpha = (treble / 255) * 0.3;
                ctx.beginPath();
                ctx.arc(x, y, p.size * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 中央核（随 bass 膨胀）
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 16 + (bass / 255) * 26, 0, Math.PI * 2);
        ctx.fill();
    },
};