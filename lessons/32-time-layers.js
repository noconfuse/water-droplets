// 32 · 时间动画与分层
// 知识点：uniform 时间驱动 · mat2 旋转 · 多层循环视差 · 星星闪烁
// 场景：多层星空（mini 版 starField 着色器）——为 33 课解剖星云着色器打基础。
window.LESSON = {
    no: '32',
    phase: '阶段九',
    title: '时间动画与分层',
    subtitle: 'uniform 时间 · 多层视差 · 星星闪烁',
    width: 900,
    height: 500,
    liveStep: true,
    webgl: true,

    params: [
        { key: 'layers', label: '分层数', min: 1, max: 6, step: 1, value: 5 },
        { key: 'speed', label: '滚动速度', min: 0, max: 2, step: 0.1, value: 0.5 },
        { key: 'twinkle', label: '闪烁', type: 'bool', value: true },
        { key: 'spin', label: '旋转', type: 'bool', value: true },
    ],

    code: [
        { template: 'uv.x += u_time * ${speed}; // 时间驱动滚动', keys: ['speed'] },
        { template: 'uv *= rot(u_time * 0.1); // mat2 旋转', keys: [], show: (p) => p.spin },
        { template: 'for (int i = 0; i < ${layers}; i++) { // 分层循环', keys: ['layers'] },
        { template: 'scale = mix(20.0, 5.0, depth); // 近大远小（视差）', keys: [] },
        { template: 'float s = star(gv - pos, n, flare); // 星星', keys: [] },
        { template: 's *= sin(u_time * 3.0 + n * 100.0) * 0.5 + 1.5; // 闪烁', keys: [], show: (p) => p.twinkle },
        { template: 'col += s * size * color * (1.0 - depth * 0.7); // 分层叠加', keys: [] },
    ],

    steps: [
        { at: 0.12, label: '① uniform 时间驱动' },
        { at: 0.38, label: '② mat2 旋转 UV' },
        { at: 0.62, label: '③ 多层循环 + 视差缩放' },
        { at: 0.85, label: '④ 星星闪烁 + 叠加' },
    ],

    challenge: {
        desc: '分层数拉满，打开闪烁和旋转。',
        check: (p) => p.layers >= 6 && p.twinkle === true && p.spin === true,
    },

    gl: {
        vs: `
            attribute vec2 a_position;
            varying vec2 v_uv;
            void main() {
                v_uv = a_position * 0.5 + 0.5;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `,
        fs: `
            precision highp float;
            varying vec2 v_uv;
            uniform float u_time;
            uniform int u_layers;
            uniform float u_speed;
            uniform int u_twinkle;
            uniform int u_spin;

            mat2 rot(float a) {
                float c = cos(a), s = sin(a);
                return mat2(c, -s, s, c);
            }
            float hash(float n) {
                return fract(sin(n) * 43758.5453);
            }
            float star(vec2 uv, float n, float flare) {
                float d = length(uv);
                float m = 0.05 / max(d, 0.0001);
                m += max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0)) * flare * 0.5;
                return m * smoothstep(1.0, 0.2, d);
            }

            void main() {
                vec2 uv = (v_uv - 0.5);
                uv.x += u_time * u_speed * 0.3;
                if (u_spin == 1) uv = rot(u_time * 0.08) * uv;

                vec3 col = vec3(0.0);
                for (int i = 0; i < 6; i++) {
                    if (i >= u_layers) break;
                    float depth = float(i) / 6.0;
                    float scale = mix(22.0, 5.0, depth);
                    vec2 coord = uv * scale + float(i) * 47.0;
                    vec2 gv = fract(coord) - 0.5;
                    vec2 id = floor(coord);
                    float n = hash(id.x + id.y * 57.0);
                    float size = 0.4 + 0.6 * fract(n * 7.0);
                    vec2 pos = vec2(n - 0.5, fract(n * 13.7) - 0.5);
                    float s = star(gv - pos, n, smoothstep(0.9, 1.0, size));
                    if (u_twinkle == 1) s *= sin(u_time * 3.0 + n * 100.0) * 0.5 + 1.5;
                    vec3 c = vec3(0.5, 0.75, 1.0) * (0.4 + 0.6 * fract(n * 3.7));
                    col += s * size * c * (1.0 - depth * 0.75);
                }
                gl_FragColor = vec4(col, 1.0);
            }
        `,

        frame(glInfo, p, t, step) {
            const { gl } = glInfo;
            if (!glInfo.buf) {
                glInfo.buf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, glInfo.buf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
                const loc = glInfo.A('a_position');
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
            }
            gl.uniform1f(glInfo.U('u_time'), t);
            gl.uniform1i(glInfo.U('u_layers'), p.layers);
            gl.uniform1f(glInfo.U('u_speed'), p.speed);
            gl.uniform1i(glInfo.U('u_twinkle'), p.twinkle ? 1 : 0);
            gl.uniform1i(glInfo.U('u_spin'), p.spin ? 1 : 0);
            gl.clearColor(0.055, 0.075, 0.125, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },
    },
};