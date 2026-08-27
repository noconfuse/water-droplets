// 35 · 综合大作业 · 终极 —— 音画黑洞
// 知识点：整合全部技能 —— 音频星云(34) · 分层星星(33) · SDF(30) · 连续内流吸入(时间动画 32)
// 场景：光标即黑洞 —— 环内静谧深空流动微光，环外星云/星星被持续吸入；音频驱动整体亮度与环。
window.LESSON = {
    no: '35',
    phase: '阶段十',
    title: '综合大作业 · 音画黑洞',
    subtitle: '星云吸入 · 吸积环 · 音频驱动',
    width: 900,
    height: 500,
    liveStep: true,
    webgl: true,
    audio: true,

    params: [
        { key: 'sensitivity', label: '声控灵敏度', min: 0.5, max: 3, step: 0.1, value: 1.5 },
        { key: 'lens', label: '引力吸入', min: 0, max: 1.5, step: 0.05, value: 0.9 },
        { key: 'layers', label: '星星层数', min: 1, max: 6, step: 1, value: 5 },
        { key: 'nebula', label: '星云浓度', min: 0, max: 1.5, step: 0.05, value: 0.9 },
        { key: 'speed', label: '吸入速度', min: 0, max: 2, step: 0.1, value: 0.8 },
    ],

code: [
        { template: 'stream = ${lens} * 0.5 * ${speed} * t; // 连续单向内流（音频不改变方向）', keys: ['lens', 'speed'] },
        { template: 'rSample = R + (r - R) * 0.4 + stream; uv = u_mouse + dir * rSample; // 环外采样半径', keys: [] },
        { template: 'acc = ${lens} * 0.5 / (abs(r - 0.4) + 0.12); // 环上吸积光晕，自然衔接', keys: ['lens'] },
        { template: 'col = mix(col, vec4(0.008, 0.012, 0.025, 1.0), smoothstep(R, R - 0.08, r)); // 环内静谧黑', keys: [] },
        { template: 'inLight = fbmslow(vec3(noise(l*1.6, t), noise(l*1.6+8.3, t))); // 环内随机流动的光', keys: [] },
        { template: 'horizon = exp(-abs(r - 0.4) * 8.0); // 视界边缘柔和微光', keys: [] },
        { template: 'nebula *= 0.4 + ${sensitivity} * f; // 音频推高星云', keys: ['sensitivity'] },
        { template: 'if (i >= ${layers}) break; // 星星分层', keys: ['layers'] },
        { template: 'col += vec4((cpos + cpos1 + cpos2) * ${nebula} * (0.4 + u_sensitivity * f), 1.0); // 星云浓度', keys: ['nebula'] },
        { template: 'starField += StarLayer(uv * scale + float(i)*422.1) * depth; // 分层星星（被吸入，环内被吞没）', keys: [] },
    ],

    steps: [
        { at: 0.12, label: '① 音频电平驱动' },
        { at: 0.32, label: '② 鼠标 → u_mouse uniform' },
        { at: 0.55, label: '③ 径向吸入引力环' },
        { at: 0.75, label: '④ 引力环 SDF + 环上堆积' },
        { at: 0.9, label: '⑤ 星云 + 星星综合' },
    ],

    challenge: {
        desc: '开音乐，引力吸入拉到 1.2 以上，看星云被吸进圆环。',
        check: (p) => p.lens >= 1.2 && p.sensitivity >= 2,
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
            uniform float u_aspect;
            uniform float u_sound;
            uniform vec2 u_mouse;
            uniform float u_lens;
            uniform int u_layers;
            uniform float u_nebula;
            uniform float u_sensitivity;
            uniform float u_speed;

            float Hash21(vec2 p) {
                p = fract(p * vec2(123.45, 986.21));
                p += dot(p, p + 243.0);
                return fract(p.x * p.y);
            }
            float hash(float n) { return fract(cos(n) * 41415.92653); }
            float noise(vec3 x) {
                vec3 p = floor(x);
                vec3 f = smoothstep(0.0, 1.0, fract(x));
                float n = p.x + p.y * 57.0 + 113.0 * p.z;
                return mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                               mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
                           mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                               mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
            }
            mat3 m = mat3(0.00, 1.60, 1.20, -1.60, 0.72, -0.96, -1.20, -0.96, 1.28);
            float fbmslow(vec3 p) {
                float f = 0.5000 * noise(p); p = m * p * 1.2;
                f += 0.2500 * noise(p); p = m * p * 1.3;
                f += 0.1666 * noise(p); p = m * p * 1.4;
                f += 0.0834 * noise(p); p = m * p * 1.84;
                return f;
            }
            mat2 Rot(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }
            float Star(vec2 uv, float n, float flare) {
                float d = length(uv);
                float mm = 0.02 / d;
                uv *= Rot(3.1415 * n);
                mm += max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0)) * flare;
                uv *= Rot(3.1415 / 4.0);
                mm += max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0)) * 0.1 * flare;
                return mm * smoothstep(1.0, 0.2, d);
            }
            vec4 StarLayer(vec2 uv) {
                vec4 col = vec4(0.0);
                vec2 gv = fract(uv) - 0.5;
                vec2 id = floor(uv);
                for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
                    vec2 offs = vec2(float(x), float(y));
                    float n = Hash21(id + offs);
                    float size = fract(n * 44467.12);
                    vec2 starPos = gv - offs - vec2(n, fract(n * 678.2313)) + 0.5;
                    vec2 offset = cos(u_time * n) * 0.1 * vec2(cos(n * 6.2831), sin(n * 6.2831));
                    float star = Star(starPos + offset, n, smoothstep(0.95, 1.0, size));
                    vec4 color = vec4(sin(vec3(0.2, 0.3, 0.9) * fract(n * 1222.2) * 6.2831) * 0.5 + 0.5, 1.0);
                    color *= vec4(0.8, 0.1, 0.8, 1.0);
                    star *= sin(3.0 * u_time + n * 1232.23) * 0.5 + 1.5;
                    col += star * size * color;
                }
                return col;
            }

            void main() {
                // 屏幕空间坐标（-1..1 中心原点，x 乘宽高比；不随漂移）
                vec2 uvScreen = (v_uv - 0.5) * 2.0;
                uvScreen.x *= u_aspect;
                float t = u_time;
                float f = clamp(u_sound, 0.0, 1.0); // 音频电平

                vec2 l = uvScreen - u_mouse;
                float r = length(l);
                vec2 dir = l / max(r, 0.0001);
                float R = 0.4; // 引力环半径（视界）

                // 环外采样：连续单向内流 —— 采样半径随时间向外滑动，显示上的图案就永久流向环
                // 注意：流的速度只由 lens 和 speed 决定，音频不改变吸入方向/速度
                float stream = u_lens * 0.5 * u_speed * t;
                float rSample = R + (r - R) * 0.4 + stream;
                vec2 uv = u_mouse + dir * rSample;
                vec3 c = vec3(uv.x, uv.y, 1.0);

                vec4 col = vec4(0.0);

                // 星云（音频驱动）
                vec3 cpos = 5.0 * pow(fbmslow(c * 5.5), 5.0) * vec3(0.4, 0.5, 1.0) - 0.15;
                vec3 cpos1 = 10.0 * pow(fbmslow(c * 0.5), 5.0) * vec3(0.6, 0.3, 0.6) - 0.15;
                vec3 cpos2 = vec3(0.6, 0.0, 0.0) * 10.0 * pow(fbmslow(c * 1.45), 5.0) - 0.15;
                col += vec4((cpos + cpos1 + cpos2) * u_nebula * (0.4 + u_sensitivity * f), 1.0);

                // 环上吸积光晕：越靠近环越浓，与环内自然衔接
                float acc = u_lens * 0.5 / (abs(r - R) + 0.12);
                col += vec4(vec3(0.5, 0.45, 0.95) * acc * (0.4 + 0.6 * f), 1.0);

                // 环内：静谧深邃的黑（向内平滑变黑，不割裂）
                float voidK = smoothstep(R, R - 0.08, r);
                vec4 voidCol = vec4(0.008, 0.012, 0.025, 1.0);
                col = mix(col, voidCol, voidK);

                // 分层星星（流式采样，同样被吸入；环内会被黑覆盖吞没）
                for (int i = 0; i < 6; i++) {
                    if (i >= u_layers) break;
                    float depth = fract(float(i) / 6.0);
                    float scale = mix(20.0, 5.0, depth);
                    col += StarLayer(uv * scale + float(i) * 422.1) * depth * (0.4 + 0.6 * f);
                }
                col = mix(col, voidCol, voidK);

                // 环内：随机流动的微光（噪声游走，宁静但不死寂；中心亮、向边界自然淡出）
                if (r < R) {
                    float innerT = t * 0.4;
                    vec2 walk = vec2(noise(vec3(l * 1.6, innerT)),
                                     noise(vec3(l * 1.6 + 8.3, innerT)));
                    float inLight = fbmslow(vec3(walk * 1.2, innerT));
                    col += vec4(vec3(0.30, 0.38, 0.95) * inLight * (0.3 + 0.7 * f)
                                * smoothstep(R, R - 0.14, r), 1.0);
                }

                // 视界边缘柔和微光（自然过渡的细环，无生硬边界）
                float horizon = exp(-abs(r - R) * 8.0);
                col += vec4(vec3(0.6, 0.5, 1.0) * horizon * (0.15 + 0.25 * f), 1.0);

                gl_FragColor = col;
            }
        `,

        frame(glInfo, p, t, step, mouse, sound) {
            const { gl } = glInfo;
            if (!glInfo.buf) {
                glInfo.buf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, glInfo.buf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
                const loc = glInfo.A('a_position');
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
            }
            const snd = sound && sound.playing ? sound.level / 255 : 0;
            // 鼠标 → 着色器 UV 空间（uv.y 从底部起，鼠标 y 从顶部起，需翻转）
            const mx = mouse && mouse.inside ? ((mouse.x / 900) - 0.5) * 2 * (900 / 500) : 0;
            const my = mouse && mouse.inside ? (0.5 - mouse.y / 500) * 2 : 0;
            gl.uniform1f(glInfo.U('u_time'), t);
            gl.uniform1f(glInfo.U('u_aspect'), 900 / 500);
            gl.uniform1f(glInfo.U('u_sound'), snd);
            gl.uniform2f(glInfo.U('u_mouse'), mx, my);
            gl.uniform1f(glInfo.U('u_lens'), p.lens);
            gl.uniform1i(glInfo.U('u_layers'), p.layers);
            gl.uniform1f(glInfo.U('u_nebula'), p.nebula);
            gl.uniform1f(glInfo.U('u_sensitivity'), p.sensitivity);
            gl.uniform1f(glInfo.U('u_speed'), p.speed);
            gl.clearColor(0.02, 0.02, 0.05, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },
    },
};