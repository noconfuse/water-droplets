// 25 · WebGL 全局观
// 知识点：GPU 渲染管线总览（含深度测试与混合）· WebGL 裁剪空间坐标系
// 场景：两种视图——「管线图」可步进/自动播放看数据流向；「坐标系」对比 WebGL 与 2D 的坐标系。
window.LESSON = {
    no: '25',
    phase: '阶段八',
    title: 'WebGL 全局观',
    subtitle: 'GPU 渲染管线 · 深度测试 · 裁剪空间坐标系',
    width: 900,
    height: 500,
    liveStep: true,

    STAGES: [
        { name: 'CPU · 顶点数据', sub: '三角形 3 个顶点 (x, y) 坐标' },
        { name: 'GPU · 顶点缓冲', sub: '数据上传到 ArrayBuffer' },
        { name: '顶点着色器', sub: '每个顶点执行一次：变换位置' },
        { name: '光栅化', sub: '填充成像素网格（片段）' },
        { name: '片段着色器', sub: '每个像素执行一次：算颜色' },
        { name: '深度测试 · 混合', sub: '逐片段：近的遮远 + 透明混合' },
        { name: '屏幕输出', sub: '最终画面写入帧缓冲' },
    ],

    params: [
        { key: 'view', label: '视图', type: 'select', value: '管线图', options: ['管线图', '坐标系'] },
        { key: 'stage', label: '阶段', min: 0, max: 6, step: 1, value: 0, show: (p) => p.view === '管线图' },
        { key: 'auto', label: '自动播放', type: 'bool', value: true, show: (p) => p.view === '管线图' },
        { key: 'speed', label: '动画速度', min: 0.2, max: 3, step: 0.1, value: 1, show: (p) => p.view === '管线图' },
        { key: 'pointX', label: '点 X', min: -1, max: 1, step: 0.1, value: 0.4, show: (p) => p.view === '坐标系' },
        { key: 'pointY', label: '点 Y', min: -1, max: 1, step: 0.1, value: 0.3, show: (p) => p.view === '坐标系' },
        { key: 'showGrid', label: '显示网格', type: 'bool', value: true, show: (p) => p.view === '坐标系' },
    ],

    code: [
        { template: 'gl_Position = vec4(${pointX}, ${pointY}, 0, 1); // 裁剪空间坐标', keys: ['pointX', 'pointY'], show: (p) => p.view === '坐标系' },
        { template: '// 屏幕像素 x = (${pointX} + 1) / 2 * 900', keys: ['pointX'], show: (p) => p.view === '坐标系' },
        { template: '// 屏幕像素 y = (1 - ${pointY}) / 2 * 500', keys: ['pointY'], show: (p) => p.view === '坐标系' },
        { template: '// 网格显示：${showGrid}', keys: ['showGrid'], show: (p) => p.view === '坐标系' },
        { template: 'const vs = gl.createShader(gl.VERTEX_SHADER); gl.shaderSource(vs, src); gl.compileShader(vs);', keys: [], show: (p) => p.view === '管线图' },
        { template: 'const program = gl.createProgram(); gl.attachShader(program, vs); gl.linkProgram(program);', keys: [], show: (p) => p.view === '管线图' },
        { template: 'gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);', keys: [], show: (p) => p.view === '管线图' },
        { template: 'gl.drawArrays(gl.TRIANGLES, 0, 3); // 触发光栅化 → 逐像素着色', keys: [], show: (p) => p.view === '管线图' },
        { template: '// 深度测试：z 近的遮挡 z 远的（片段着色器之后、写屏之前）', keys: [], show: (p) => p.view === '管线图' && p.stage === 5 },
        { template: '// 当前查看阶段：${stage}', keys: ['stage'], show: (p) => p.view === '管线图' },
        { template: 'advance += ${speed} * dt; // 自动播放', keys: ['speed'], show: (p) => p.auto },
    ],

    steps: [
        { at: 0.12, label: '① CPU 顶点数据' },
        { at: 0.3, label: '② GPU 顶点缓冲' },
        { at: 0.47, label: '③ 顶点着色器（每顶点）' },
        { at: 0.62, label: '④ 光栅化（填充片段）' },
        { at: 0.78, label: '⑤ 片段着色器（每像素）' },
        { at: 0.9, label: '⑥ 深度测试 · 混合' },
    ],

    challenge: {
        desc: '切到「坐标系」视图，看裁剪空间到屏幕像素的映射。',
        check: (p) => p.view === '坐标系',
    },

    draw(ctx, p, t, step) {
        const W = this.width, H = this.height;
        ctx.fillStyle = '#0e1320';
        ctx.fillRect(0, 0, W, H);
        if (step < 0.12) return;

        if (p.view === '坐标系') this.drawCoord(ctx, p, t, step);
        else this.drawPipeline(ctx, p, t, step);
    },

    // ================= 管线图 =================
    drawPipeline(ctx, p, t, step) {
        const W = this.width, H = this.height;
        const active = p.auto ? Math.floor((t * p.speed * 0.4) % 7) : p.stage;

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WebGL 渲染管线', W / 2, 32);
        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#4cc2ff';
        ctx.fillText(`→ 当前阶段：${this.STAGES[active].name}`, W / 2, 54);
        ctx.textAlign = 'left';

        const bw = 110, bh = 150, gap = 14;
        const x0 = (W - (bw * 7 + gap * 6)) / 2;
        const y0 = 82;
        const cx = (i) => x0 + i * (bw + gap) + bw / 2;

        // 箭头 + 流动光点
        for (let i = 0; i < 6; i++) {
            const ax = cx(i) + bw / 2, ay = y0 + bh / 2;
            const bx = cx(i + 1) - bw / 2;
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, ay); ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath(); ctx.moveTo(bx, ay - 5); ctx.lineTo(bx, ay + 5); ctx.lineTo(bx + 9, ay); ctx.closePath(); ctx.fill();
        }
        if (p.auto && active > 0 && step >= 0.3) {
            const k = (t * p.speed * 0.4) % 1;
            const ax = cx(active - 1) + bw / 2, bx = cx(active) - bw / 2;
            ctx.fillStyle = '#4cc2ff';
            ctx.shadowColor = '#4cc2ff';
            ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(ax + (bx - ax) * k, y0 + bh / 2, 5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        }

        for (let i = 0; i < 7; i++) {
            this.drawBox(ctx, x0 + i * (bw + gap), y0, bw, bh, this.STAGES[i], i === active, t, step);
        }

        // 深度测试说明
        if (active === 5 && step >= 0.9) {
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('深度测试发生在片段着色器之后、写入屏幕之前（z-buffer 比较）', W / 2, H - 14);
            ctx.textAlign = 'left';
        }
    },

    drawBox(ctx, x, y, w, h, info, active, t, step) {
        ctx.globalAlpha = active ? 1 : 0.45;
        ctx.fillStyle = active ? '#1a2540' : '#131b2c';
        ctx.strokeStyle = active ? '#4cc2ff' : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = active ? 2 : 1;
        ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill(); ctx.stroke();

        ctx.fillStyle = active ? '#fff' : '#9fb3d1';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(info.name, x + w / 2, y + 16);

        this.drawStageVisual(ctx, info.name, x + w / 2, y + 58, 0.75, t, step);

        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = '9px sans-serif';
        ctx.fillText(info.sub, x + w / 2, y + h - 10);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
    },

    drawStageVisual(ctx, name, cx, cy, sc, t, step) {
        const tri = [[cx, cy - 34 * sc], [cx - 38 * sc, cy + 24 * sc], [cx + 38 * sc, cy + 24 * sc]];
        if (name.includes('顶点数据')) {
            ctx.fillStyle = '#ffd479';
            for (const [px, py] of tri) { ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill(); }
            ctx.font = '9px monospace';
            ctx.fillStyle = '#ffd479';
            ctx.fillText('(x, y)', cx, cy + 38);
        } else if (name.includes('顶点缓冲')) {
            ctx.fillStyle = 'rgba(76,194,255,0.3)';
            ctx.strokeStyle = '#4cc2ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.roundRect(cx - 40, cy - 20, 80, 40, 6); ctx.fill(); ctx.stroke();
            ctx.font = '9px monospace';
            ctx.fillStyle = '#9fb3d1';
            ctx.fillText('[-0.5, 0.8,', cx, cy);
            ctx.fillText(' 0.5, 0.8, ...]', cx, cy + 13);
        } else if (name.includes('顶点着色器')) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(Math.sin(t * 0.6) * 0.3);
            ctx.strokeStyle = '#4cc2ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(0, -34 * sc); ctx.lineTo(-38 * sc, 24 * sc); ctx.lineTo(38 * sc, 24 * sc); ctx.closePath(); ctx.stroke();
            ctx.fillStyle = '#ffd479';
            for (const [px, py] of tri) { ctx.beginPath(); ctx.arc(px - cx, py - cy, 3.5, 0, Math.PI * 2); ctx.fill(); }
            ctx.restore();
            ctx.fillStyle = '#9fb3d1';
            ctx.font = '9px sans-serif';
            ctx.fillText('位置 → clip 空间', cx, cy + 38);
        } else if (name.includes('光栅化')) {
            ctx.fillStyle = 'rgba(76,194,255,0.25)';
            ctx.beginPath(); ctx.moveTo(tri[0][0], tri[0][1]); ctx.lineTo(tri[1][0], tri[1][1]); ctx.lineTo(tri[2][0], tri[2][1]); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.lineWidth = 0.7;
            for (let gx = cx - 38; gx <= cx + 38; gx += 10) { ctx.beginPath(); ctx.moveTo(gx, cy - 32); ctx.lineTo(gx, cy + 22); ctx.stroke(); }
            for (let gy = cy - 32; gy <= cy + 22; gy += 10) { ctx.beginPath(); ctx.moveTo(cx - 38, gy); ctx.lineTo(cx + 38, gy); ctx.stroke(); }
        } else if (name.includes('片段着色器')) {
            const g = ctx.createLinearGradient(tri[0][0], tri[0][1], tri[2][0], tri[2][1]);
            g.addColorStop(0, '#4a7cf7');
            g.addColorStop(1, '#ee6c8e');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(tri[0][0], tri[0][1]); ctx.lineTo(tri[1][0], tri[1][1]); ctx.lineTo(tri[2][0], tri[2][1]); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '9px monospace';
            ctx.fillText('逐像素', cx, cy + 38);
        } else if (name.includes('深度测试')) {
            // 两个重叠三角形：后面被遮挡
            ctx.fillStyle = 'rgba(238,108,142,0.35)';
            ctx.beginPath(); ctx.moveTo(cx - 8, cy - 20); ctx.lineTo(cx - 30, cy + 22); ctx.lineTo(cx + 22, cy + 22); ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(74,124,247,0.9)';
            ctx.beginPath(); ctx.moveTo(cx + 4, cy - 26); ctx.lineTo(cx - 22, cy + 20); ctx.lineTo(cx + 30, cy + 20); ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = '9px sans-serif';
            ctx.fillText('z 近遮 z 远', cx, cy + 38);
        } else if (name.includes('屏幕')) {
            ctx.save();
            ctx.shadowColor = '#4cc2ff';
            ctx.shadowBlur = 14;
            ctx.fillStyle = '#4cc2ff';
            ctx.beginPath(); ctx.moveTo(tri[0][0], tri[0][1]); ctx.lineTo(tri[1][0], tri[1][1]); ctx.lineTo(tri[2][0], tri[2][1]); ctx.closePath(); ctx.fill();
            ctx.restore();
            ctx.fillStyle = '#fff';
            ctx.font = '9px sans-serif';
            ctx.fillText('输出画面', cx, cy + 38);
        }
    },

    // ================= 坐标系视图 =================
    drawCoord(ctx, p, t, step) {
        const W = this.width, H = this.height;

        // 标题：讲清楚"同一个点"的故事
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 17px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('同一个点 (X, Y)，在两个坐标系里的位置完全不同', W / 2, 30);
        ctx.textAlign = 'left';

        // —— ① 左：WebGL 裁剪空间（数学坐标：原点居中、y 向上、-1..1）——
        const lx = 32, ly = 70, lsize = 210;
        ctx.fillStyle = '#101826';
        ctx.strokeStyle = '#2a3350';
        ctx.beginPath(); ctx.roundRect(lx, ly, lsize, lsize, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#9fb3d1';
        ctx.font = '13px sans-serif';
        ctx.fillText('① 裁剪空间（WebGL）', lx, ly - 8);

        if (p.showGrid) {
            ctx.strokeStyle = 'rgba(255,255,255,0.14)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const gx = lx + lsize / 2 + (i - 2) * lsize / 4;
                const gy = ly + lsize / 2 - (i - 2) * lsize / 4;
                ctx.beginPath(); ctx.moveTo(gx, ly); ctx.lineTo(gx, ly + lsize); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(lx, gy); ctx.lineTo(lx + lsize, gy); ctx.stroke();
            }
        }
        // 轴 + 标注
        ctx.strokeStyle = '#4cc2ff';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(lx, ly + lsize / 2); ctx.lineTo(lx + lsize, ly + lsize / 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx + lsize / 2, ly + lsize); ctx.lineTo(lx + lsize / 2, ly); ctx.stroke();
        ctx.fillStyle = '#4cc2ff';
        ctx.font = '13px sans-serif';
        ctx.fillText('x →', lx + lsize - 30, ly + lsize / 2 + 18);
        ctx.fillText('↑ y', lx + lsize / 2 + 7, ly + 16);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#8a97ad';
        ctx.fillText('原点居中 (0,0)', lx + 8, ly + lsize / 2 + 32);
        ctx.fillText('范围 -1 .. 1', lx + 8, ly + lsize / 2 + 48);

        // 点
        const px = lx + lsize / 2 + p.pointX * lsize / 2;
        const py = ly + lsize / 2 - p.pointY * lsize / 2;
        ctx.save();
        ctx.shadowColor = '#ffd479';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffd479';
        ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.font = '13px monospace';
        ctx.fillStyle = '#ffd479';
        ctx.fillText(`(${this.fmt1(p.pointX)}, ${this.fmt1(p.pointY)})`, px + 10, py - 10);

        // —— ② 右：屏幕像素（Canvas 2D：原点左上、y 向下、按像素）——
        const canvasW = 300, canvasH = Math.round(300 * 500 / 900); // 保持 900:500 比例
        const rx = W - canvasW - 32, ry = 108;
        ctx.fillStyle = '#101826';
        ctx.strokeStyle = '#2a3350';
        ctx.beginPath(); ctx.roundRect(rx, ry, canvasW, canvasH, 10); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#9fb3d1';
        ctx.font = '13px sans-serif';
        ctx.fillText('② 屏幕像素（Canvas 2D）', rx, ry - 8);

        // 画布内衬（模拟真实画布）
        ctx.fillStyle = '#0e1320';
        ctx.beginPath(); ctx.roundRect(rx + 6, ry + 6, canvasW - 12, canvasH - 12, 6); ctx.fill(); ctx.stroke();
        // 左上角原点标记
        ctx.fillStyle = '#ee6c8e';
        ctx.beginPath(); ctx.arc(rx + 9, ry + 9, 4, 0, Math.PI * 2); ctx.fill();
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#ee6c8e';
        ctx.fillText('原点 (0,0)', rx + 16, ry + 20);
        ctx.fillStyle = '#8a97ad';
        ctx.fillText('y 向下 ↓', rx + canvasW - 64, ry + 20);

        // 点映射到像素
        const xpx = Math.round((p.pointX + 1) / 2 * 900);
        const ypx = Math.round((1 - p.pointY) / 2 * 500);
        const spx = rx + 6 + (p.pointX + 1) / 2 * (canvasW - 12);
        const spy = ry + 6 + (1 - p.pointY) / 2 * (canvasH - 12);
        ctx.fillStyle = '#ffd479';
        ctx.beginPath(); ctx.arc(spx, spy, 6, 0, Math.PI * 2); ctx.fill();
        ctx.font = '13px monospace';
        ctx.fillText(`(${xpx}, ${ypx}) px`, spx + 10, spy - 10);

        // 虚线连接：同一坐标的两种表示
        ctx.strokeStyle = 'rgba(255,212,121,0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 5]);
        ctx.beginPath(); ctx.moveTo(px + 8, py + 8); ctx.lineTo(spx - 8, spy - 8); ctx.stroke();
        ctx.setLineDash([]);

        // 底部公式
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`像素 x = (${this.fmt1(p.pointX)} + 1) / 2 × 900  =  ${xpx} px`, W / 2, 340);
        ctx.fillText(`像素 y = (1 − ${this.fmt1(p.pointY)}) / 2 × 500  =  ${ypx} px`, W / 2, 366);
        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#8a97ad';
        ctx.fillText('裁剪空间：原点居中 · y 向上 · 单位是"倍数(-1~1)"    屏幕像素：原点左上 · y 向下 · 单位是"像素"', W / 2, 400);
        ctx.textAlign = 'left';

        if (step >= 0.9) {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '12px sans-serif';
            ctx.fillText('← 拖动「点 X / 点 Y」滑块，看同一个点在这两套坐标系里的位置', 32, H - 14);
        }
    },

    fmt1(v) {
        return (Math.round(v * 100) / 100).toString();
    },
};

function fmt1(v) {
    return (Math.round(v * 100) / 100).toString();
}