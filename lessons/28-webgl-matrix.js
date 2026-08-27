// 27 · 顶点缓冲与矩阵
// 知识点：顶点缓冲 · TRIANGLE_STRIP 三角带 · 旋转矩阵 uniform · 顶点着色器变换
// 场景：正方形由 4 个顶点（三角带）组成，旋转/缩放矩阵作用于顶点。
window.LESSON = {
    no: '28',
    phase: '阶段八',
    title: '顶点缓冲与矩阵',
    subtitle: '顶点缓冲 · 旋转矩阵 · TRIANGLE_STRIP',
    width: 900,
    height: 500,
    liveStep: true,
    webgl: true,

    params: [
        { key: 'speed', label: '旋转速度', min: 0, max: 3, step: 0.1, value: 1 },
        { key: 'scale', label: '缩放', min: 0.3, max: 1.5, step: 0.05, value: 1 },
        { key: 'angle', label: '初始角度°', min: 0, max: 360, step: 5, value: 0 },
        { key: 'color', label: '颜色', type: 'color', value: '#ee6c8e' },
    ],

    code: [
        { template: 'verts = [-0.6,-0.6, 0.6,-0.6, -0.6,0.6, 0.6,0.6]; // 三角带', keys: [] },
        { template: 'gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);', keys: [] },
        { template: 'const ang = ${angle} * Math.PI / 180 + t * ${speed};', keys: ['angle', 'speed'] },
        { template: 'const c = Math.cos(ang) * ${scale}, s = Math.sin(ang) * ${scale};', keys: ['scale'] },
        { template: 'gl.uniformMatrix3fv(u_matrix, false, new Float32Array([c, s, 0, -s, c, 0, 0, 0, 1]));', keys: [] },
        { template: 'const { r, g, b } = hex2rgb("${color}");', keys: ['color'] },
        { template: 'gl.uniform4f(u_color, r, g, b, 1.0); // 颜色 = uniform 全局量', keys: [] },
        { template: 'gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);', keys: [] },
    ],

    steps: [
        { at: 0.12, label: '① 正方形 = 三角带 4 顶点' },
        { at: 0.38, label: '② 顶点缓冲 upload' },
        { at: 0.62, label: '③ 旋转/缩放矩阵 uniform' },
        { at: 0.85, label: '④ 动画旋转' },
    ],

    challenge: {
        desc: '旋转速度拉到 2 以上。',
        check: (p) => p.speed >= 2,
    },

    gl: {
        vs: `
            attribute vec2 a_position;
            uniform mat3 u_matrix;
            void main() {
                vec3 p = u_matrix * vec3(a_position, 1.0);
                gl_Position = vec4(p.xy, 0.0, 1.0);
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
            if (!glInfo.buf) {
                glInfo.buf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, glInfo.buf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.6, -0.6, 0.6, -0.6, -0.6, 0.6, 0.6, 0.6]), gl.STATIC_DRAW);
                const loc = glInfo.A('a_position');
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
            }
            const ang = p.angle * Math.PI / 180 + (step >= 1 ? t * p.speed : 0);
            const c = Math.cos(ang) * p.scale, s = Math.sin(ang) * p.scale;
            // 列主序 mat3：旋转 + 缩放
            gl.uniformMatrix3fv(glInfo.U('u_matrix'), false, new Float32Array([
                c, s, 0,
                -s, c, 0,
                0, 0, 1,
            ]));
            const col = this.hex2rgb(p.color);
            gl.uniform4f(glInfo.U('u_color'), col.r, col.g, col.b, 1);

            gl.clearColor(0.055, 0.075, 0.125, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },

        hex2rgb(hex) {
            const v = parseInt(hex.slice(1), 16);
            return { r: ((v >> 16) & 255) / 255, g: ((v >> 8) & 255) / 255, b: (v & 255) / 255 };
        },
    },
};