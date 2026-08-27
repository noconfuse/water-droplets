// 31 · 噪声与 FBM
// 知识点：hash 伪随机 · value noise 平滑插值 · fBm 分形布朗运动 · 域扭曲 domain warping
// 场景：全屏着色器生成云朵/地形纹理；调 octaves 看细节叠加，开 warp 看扭曲。
window.LESSON = {
    no: '31',
    phase: '阶段九',
    title: '噪声与 FBM',
    subtitle: 'hash · value noise · fBm · 域扭曲',
    width: 900,
    height: 500,
    liveStep: true,
    webgl: true,

    params: [
        { key: 'mode', label: '配色', type: 'select', value: '云朵', options: ['云朵', '地形', '单色'] },
        { key: 'octaves', label: 'FBM 层数', min: 1, max: 8, step: 1, value: 5 },
        { key: 'scale', label: '噪声密度', min: 1, max: 10, step: 0.5, value: 3 },
        { key: 'warp', label: '域扭曲', min: 0, max: 1, step: 0.05, value: 0.4 },
        { key: 'animate', label: '流动动画', type: 'bool', value: true },
    ],

    code: [
        { template: 'float hash(vec2 p) { return fract(sin(dot(p, vec2(12.98, 78.23))) * 43758.5); }', keys: [] },
        { template: 'vec2 q = p * ${scale}; // 噪声密度', keys: ['scale'] },
        { template: 'u = f * f * (3.0 - 2.0 * f); // 平滑插值', keys: [] },
        { template: 'v += a * noise(p); p *= 2.0; a *= 0.5; // fBm 叠加，共 ${octaves} 层', keys: ['octaves'] },
        { template: 'q += vec2(fbm(p), fbm(p + 3.0)) * ${warp} * 3.0; // 域扭曲', keys: ['warp'] },
        { template: 'col = vec3(0.02, 0.06, 0.2) + v * vec3(0.5, 0.7, 1.0); // 云朵', keys: [], show: (p) => p.mode === '云朵' },
        { template: 'col = mix(vec3(0.05,0.2,0.6), mix(vec3(0.1,0.4,0.2), vec3(0.75,0.6,0.3), smoothstep(0.3,0.7,v)), smoothstep(0.15,0.35,v)); // 地形', keys: [], show: (p) => p.mode === '地形' },
        { template: 'col = vec3(v); // 单色', keys: [], show: (p) => p.mode === '单色' },
        { template: 'float v = fbm(q + u_time * 0.1); // 时间流动', keys: [], show: (p) => p.animate },
    ],

    steps: [
        { at: 0.12, label: '① hash 伪随机' },
        { at: 0.38, label: '② value noise 平滑插值' },
        { at: 0.62, label: '③ fBm：多层噪声叠加' },
        { at: 0.85, label: '④ 域扭曲 + 时间流动' },
    ],

    challenge: {
        desc: '把 FBM 层数拉到 8，看细节越来越丰富。',
        check: (p) => p.octaves >= 8,
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
            uniform int u_octaves;
            uniform float u_scale;
            uniform float u_warp;
            uniform int u_mode;
            uniform int u_animate;

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                           mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
            }
            float fbm(vec2 p) {
                float v = 0.0, a = 0.5;
                for (int i = 0; i < 8; i++) {
                    v += a * noise(p);
                    p *= 2.0;
                    a *= 0.5;
                    if (i >= u_octaves - 1) break;
                }
                return v;
            }

            void main() {
                vec2 p = (v_uv - 0.5) * 2.0;
                vec2 q = p * u_scale;
                if (u_warp > 0.001) {
                    q += vec2(fbm(p * 1.5), fbm(p * 1.5 + 3.0)) * u_warp * 3.0;
                }
                float v = fbm(q + (u_animate == 1 ? u_time * 0.1 : 0.0));
                vec3 col;
                if (u_mode == 0) {          // 云朵
                    col = vec3(0.02, 0.06, 0.2) + v * vec3(0.5, 0.7, 1.0);
                } else if (u_mode == 1) {   // 地形
                    vec3 land = mix(vec3(0.1, 0.4, 0.2), vec3(0.75, 0.6, 0.3), smoothstep(0.3, 0.7, v));
                    col = mix(vec3(0.05, 0.2, 0.6), land, smoothstep(0.15, 0.35, v));
                } else {                    // 单色
                    col = vec3(v);
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
            const modes = { '云朵': 0, '地形': 1, '单色': 2 };
            gl.uniform1f(glInfo.U('u_time'), t);
            gl.uniform1i(glInfo.U('u_octaves'), p.octaves);
            gl.uniform1f(glInfo.U('u_scale'), p.scale);
            gl.uniform1f(glInfo.U('u_warp'), p.warp);
            gl.uniform1i(glInfo.U('u_mode'), modes[p.mode]);
            gl.uniform1i(glInfo.U('u_animate'), p.animate ? 1 : 0);
            gl.clearColor(0.055, 0.075, 0.125, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },
    },
};