// 25 · WebGL 初体验
// 知识点：渲染管线 · 顶点/片段着色器 · 顶点缓冲 · drawArrays
// 场景：用 WebGL 画一个三角形，颜色/大小由滑块控制。
window.LESSON = {
    no: '26',
    phase: '阶段八',
    title: 'WebGL 初体验',
    subtitle: '渲染管线 · 着色器 · 顶点缓冲 · drawArrays',
    width: 900,
    height: 500,
    liveStep: true,
    webgl: true,

    params: [
        { key: 'color', label: '三角形颜色', type: 'color', value: '#4cc2ff' },
        { key: 'size', label: '大小', min: 0.2, max: 1, step: 0.02, value: 0.7 },
    ],

    code: [
        { template: 'const { r, g, b } = hex2rgb("${color}"); // 颜色 → RGB 分量', keys: ['color'] },
        { template: 'gl.uniform4f(u_color, r, g, b, 1.0); // uniform：整个三角形同一种颜色', keys: [] },
        { template: 'gl_FragColor = u_color; // 片段着色器直接用 uniform 上色', keys: [] },
        { template: 'verts = [0, ${size}, -0.6*${size}, -0.5*${size}, 0.6*${size}, -0.5*${size}];', keys: ['size'] },
        { template: 'gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);', keys: [] },
        { template: 'gl.drawArrays(gl.TRIANGLES, 0, 3);', keys: [] },
    ],

    steps: [
        { at: 0.12, label: '① 获取 webgl 上下文' },
        { at: 0.35, label: '② 编译顶点 / 片段着色器' },
        { at: 0.6, label: '③ 顶点数据上传缓冲区' },
        { at: 0.85, label: '④ drawArrays 绘制三角形' },
    ],

    challenge: {
        desc: '把三角形调到最大。',
        check: (p) => p.size >= 0.95,
    },

    gl: {
        vs: `
            attribute vec2 a_position;
            uniform vec2 u_scale;
            void main() {
                gl_Position = vec4(a_position * u_scale, 0.0, 1.0);
            }
        `,
        fs: `
            precision mediump float;
            uniform vec4 u_color;
            void main() {
                gl_FragColor = u_color;
            }
        `,

        frame(glInfo, p, t, step) {
            const { gl } = glInfo;
            // 顶点缓冲（懒创建）
            if (!glInfo.buf) {
                glInfo.buf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, glInfo.buf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0.9, -0.7, -0.6, 0.7, -0.6]), gl.STATIC_DRAW);
                const loc = glInfo.A('a_position');
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
            }
            const c = this.hex2rgb(p.color);
            gl.uniform2f(glInfo.U('u_scale'), p.size, p.size);
            gl.uniform4f(glInfo.U('u_color'), c.r, c.g, c.b, step < 0.6 ? 0 : 1);

            gl.clearColor(0.055, 0.075, 0.125, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        },

        hex2rgb(hex) {
            const v = parseInt(hex.slice(1), 16);
            return { r: ((v >> 16) & 255) / 255, g: ((v >> 8) & 255) / 255, b: (v & 255) / 255 };
        },
    },
};