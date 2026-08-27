// 26 · GLSL 语言基础
// 知识点：attribute 顶点属性 · varying 顶点间插值 · uniform 全局变量 · mix/floor 函数
// 场景：三个顶点三种颜色，varying 插值成平滑渐变；「色带」滑块量化成色块。
window.LESSON = {
    no: '27',
    phase: '阶段八',
    title: 'GLSL 语言基础',
    subtitle: 'attribute · varying 插值 · uniform · mix',
    width: 900,
    height: 500,
    liveStep: true,
    webgl: true,

    params: [
        { key: 'c1', label: '顶点①颜色', type: 'color', value: '#4a7cf7' },
        { key: 'c2', label: '顶点②颜色', type: 'color', value: '#ee6c8e' },
        { key: 'c3', label: '顶点③颜色', type: 'color', value: '#2ebd85' },
        { key: 'band', label: '色带量化', min: 0, max: 1, step: 0.05, value: 0 },
    ],

    code: [
        { template: 'c1 = hex2rgb("${c1}"), c2 = hex2rgb("${c2}"), c3 = hex2rgb("${c3}"); // hex → RGB', keys: ['c1', 'c2', 'c3'] },
        { template: 'verts = new Float32Array([0, 0.8, c1.r, c1.g, c1.b, -0.85, -0.6, c2.r, c2.g, c2.b, 0.85, -0.6, c3.r, c3.g, c3.b]);', keys: [] },
        { template: 'gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);', keys: [] },
        { template: 'gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 5*4, 2*4); // 顶点颜色属性', keys: [] },
        { template: 'attribute vec3 a_color; varying vec3 v_color; // 顶点色 → 插值给片段', keys: [] },
        { template: 'c = mix(v_color, floor(v_color * 8.0) / 8.0, ${band});', keys: ['band'] },
        { template: 'gl_FragColor = vec4(c, 1.0);', keys: [] },
    ],

    steps: [
        { at: 0.12, label: '① attribute：顶点属性' },
        { at: 0.38, label: '② varying：顶点间插值 → 渐变' },
        { at: 0.62, label: '③ uniform：全局变量' },
        { at: 0.85, label: '④ mix/floor 量化色带' },
    ],

    challenge: {
        desc: '拉满色带量化。',
        check: (p) => p.band >= 0.95,
    },

    gl: {
        vs: `
            attribute vec2 a_position;
            attribute vec3 a_color;
            varying vec3 v_color;
            void main() {
                v_color = a_color;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `,
        fs: `
            precision mediump float;
            varying vec3 v_color;
            uniform float u_band;
            void main() {
                vec3 c = mix(v_color, floor(v_color * 8.0) / 8.0, u_band);
                gl_FragColor = vec4(c, 1.0);
            }
        `,

        frame(glInfo, p, t, step) {
            const { gl } = glInfo;
            const c1 = this.hex2rgb(p.c1), c2 = this.hex2rgb(p.c2), c3 = this.hex2rgb(p.c3);
            // 顶点 = 位置(2) + 颜色(3)，参数变化时重新上传
            if (!glInfo.buf) glInfo.buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, glInfo.buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                0, 0.8, c1.r, c1.g, c1.b,
                -0.85, -0.6, c2.r, c2.g, c2.b,
                0.85, -0.6, c3.r, c3.g, c3.b,
            ]), gl.DYNAMIC_DRAW);
            const stride = 5 * 4;
            const pl = glInfo.A('a_position');
            gl.enableVertexAttribArray(pl);
            gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, stride, 0);
            const cl = glInfo.A('a_color');
            gl.enableVertexAttribArray(cl);
            gl.vertexAttribPointer(cl, 3, gl.FLOAT, false, stride, 2 * 4);

            gl.uniform1f(glInfo.U('u_band'), step < 0.85 ? 0 : p.band);
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