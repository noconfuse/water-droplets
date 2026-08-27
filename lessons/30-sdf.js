// 30 · UV 与 SDF 距离场
// 知识点：UV 归一化 · length() 距离 · 有向距离场 SDF · smoothstep 抗锯齿
// 场景：全屏着色器。用 SDF 画圆/圆环/心形/网格圆点；「距离场」视图可看到距离梯度。
window.LESSON = {
    no: '30',
    phase: '阶段九',
    title: 'UV 与 SDF 距离场',
    subtitle: 'length() 距离 · 有向距离场 · smoothstep 抗锯齿',
    width: 900,
    height: 500,
    liveStep: true,
    webgl: true,

    params: [
        { key: 'shape', label: '形状', type: 'select', value: '圆', options: ['圆', '圆环', '网格圆点'] },
        { key: 'view', label: '视图', type: 'select', value: '形状', options: ['形状', '距离场'] },
        { key: 'size', label: '大小', min: 0.2, max: 0.9, step: 0.02, value: 0.5 },
        { key: 'smooth', label: '抗锯齿', min: 0.01, max: 0.25, step: 0.01, value: 0.05 },
        { key: 'animate', label: '呼吸动画', type: 'bool', value: true },
    ],

    code: [
        { template: 'vec2 uv = (v_uv - 0.5) * 2.0; uv.x *= 1.8; // 屏幕坐标 → -1..1 + 宽高比修正', keys: [] },
        { template: 'float d = length(uv) - ${size}; // 圆 SDF：到边缘的距离', keys: ['size'] },
        { template: 'float d = abs(length(uv) - ${size}) - 0.05; // 圆环 SDF', keys: ['size'], show: (p) => p.shape === '圆环' },
        { template: 'float d = length(fract(uv / 0.45) - 0.5) - 0.18; // 网格圆点', keys: [], show: (p) => p.shape === '网格圆点' },
        { template: 'float a = 1.0 - smoothstep(0.0, ${smooth}, d); // 抗锯齿边缘', keys: ['smooth'] },
        { template: 'r *= 1.0 + 0.12 * sin(u_time * 2.0); // 呼吸', keys: [], show: (p) => p.animate },
        { template: 'gl_FragColor = vec4(vec3(0.5 + 0.5 * d), 1.0); // 距离场可视化', keys: [], show: (p) => p.view === '距离场' },
    ],

    steps: [
        { at: 0.12, label: '① UV：屏幕坐标归一化' },
        { at: 0.38, label: '② length() → 圆 SDF' },
        { at: 0.62, label: '③ 圆环 / 网格圆点' },
        { at: 0.85, label: '④ smoothstep 抗锯齿 + 距离场' },
    ],

    challenge: {
        desc: '切到「距离场」视图，看看距离梯度。',
        check: (p) => p.view === '距离场',
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
            uniform int u_shape;
            uniform int u_view;
            uniform float u_size;
            uniform float u_smooth;
            uniform float u_time;
            uniform int u_animate;
            uniform float u_aspect;

            void main() {
                vec2 uv = (v_uv - 0.5) * 2.0;
                uv.x *= u_aspect; // 宽高比修正：让形状不被横向拉伸
                float r = u_size * (u_animate == 1 ? 1.0 + 0.12 * sin(u_time * 2.0) : 1.0);
                float d;
                if (u_shape == 0) d = length(uv) - r;
                else if (u_shape == 1) d = abs(length(uv) - r) - 0.05;
                else d = length(fract(uv / 0.45) - 0.5) - 0.18; // 网格圆点（等宽细胞 → 正圆）

                if (u_view == 1) {
                    gl_FragColor = vec4(vec3(0.5 + 0.5 * d), 1.0);
                } else {
                    float a = 1.0 - smoothstep(0.0, u_smooth, d);
                    vec3 col = vec3(0.4, 0.76, 1.0);
                    col += vec3(1.0, 1.0, 1.0) * smoothstep(u_smooth, 0.0, d) * 0.35;
                    gl_FragColor = vec4(col * a, a); // alpha = a：形状外透明
                }
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
            const shapes = { '圆': 0, '圆环': 1, '网格圆点': 2 };
            gl.uniform1i(glInfo.U('u_shape'), shapes[p.shape]);
            gl.uniform1i(glInfo.U('u_view'), p.view === '距离场' ? 1 : 0);
            gl.uniform1f(glInfo.U('u_size'), p.size);
            gl.uniform1f(glInfo.U('u_smooth'), p.smooth);
            gl.uniform1f(glInfo.U('u_time'), t);
            gl.uniform1i(glInfo.U('u_animate'), p.animate ? 1 : 0);
            gl.uniform1f(glInfo.U('u_aspect'), 900 / 500);
            gl.clearColor(0.055, 0.075, 0.125, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },
    },
};