// 34 · 音频驱动 Shader
// 知识点：CPU(Web Audio) → uniform 传值给 GPU · 音频电平驱动星云/星星 · 声控光源
// 场景：沿用 33 的星云着色器，加上 u_sound 电平：音量推高星云、星星变亮，并出现声控光点。
window.LESSON = {
    no: '34',
    phase: '阶段十',
    title: '音频驱动 Shader',
    subtitle: '音频 → uniform · 电平驱动星云 · 声控光点',
    width: 900,
    height: 500,
    liveStep: true,
    webgl: true,
    audio: true,

    params: [
        { key: 'sensitivity', label: '声控灵敏度', min: 0.5, max: 3, step: 0.1, value: 1.5 },
        { key: 'layers', label: '星星层数', min: 1, max: 6, step: 1, value: 5 },
        { key: 'nebula', label: '星云浓度', min: 0, max: 1.5, step: 0.05, value: 0.8 },
        { key: 'stars', label: '星星强度', min: 0, max: 1.5, step: 0.05, value: 0.9 },
    ],

    code: [
        { template: 'const f = clamp(sound.level / 255, 0, 1); // 音频电平', keys: [] },
        { template: 'gl.uniform1f(u_sound, f); // CPU → GPU 数据通路', keys: [] },
        { template: 'nebula *= 0.4 + ${sensitivity} * f; // 声音推高星云', keys: ['sensitivity'] },
        { template: 'if (i >= ${layers}) break; // 星星层数', keys: ['layers'] },
        { template: 'col += vec4((cpos + cpos1 + cpos2) * ${nebula} * (0.4 + u_sensitivity * f), 1.0); // 星云浓度', keys: ['nebula'] },
        { template: 'star_bright *= 0.5 + f; // 声音点亮星星', keys: [] },
        { template: 'col.rgb += starField.rgb * ${stars}; // 星星强度', keys: ['stars'] },
        { template: 'gl_FragColor = col;', keys: [] },
    ],

    steps: [
        { at: 0.12, label: '① 音频电平 → uniform' },
        { at: 0.38, label: '② 电平推高星云浓度' },
        { at: 0.62, label: '③ 电平点亮星星' },
        { at: 0.85, label: '④ 声控光点' },
    ],

    challenge: {
        desc: '敏感度拉到 3，播放音乐看星云呼吸。',
        check: (p) => p.sensitivity >= 2.8,
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
            uniform int u_layers;
            uniform float u_nebula;
            uniform float u_stars;
            uniform float u_sensitivity;

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
                vec2 uv = (v_uv - 0.5) * vec2(u_aspect, 1.0);
                vec4 col = vec4(0.0);
                float t = u_time * 0.1;
                uv.x += t;
                vec3 c = vec3(uv.x, uv.y, 1.0);

                float f = clamp(u_sound, 0.0, 1.0); // 音频电平 0..1

                // 星云：声音推高浓度
                vec3 cpos = 5.0 * pow(fbmslow(c * 5.5), 5.0) * vec3(0.4, 0.5, 1.0) - 0.15;
                vec3 cpos1 = 10.0 * pow(fbmslow(c * 0.5), 5.0) * vec3(0.6, 0.3, 0.6) - 0.15;
                vec3 cpos2 = vec3(0.6, 0.0, 0.0) * 10.0 * pow(fbmslow(c * 1.45), 5.0) - 0.15;
                col += vec4((cpos + cpos1 + cpos2) * u_nebula * (0.4 + u_sensitivity * f), 1.0);

                // 星星：声音点亮
                vec4 starField = vec4(0.0);
                for (int i = 0; i < 6; i++) {
                    if (i >= u_layers) break;
                    float depth = fract(float(i) / 6.0);
                    float scale = mix(20.0, 5.0, depth);
                    starField += StarLayer(uv * scale + float(i) * 422.1) * depth;
                }
                col = vec4(col.rgb + starField.rgb * u_stars * (0.5 + 0.8 * f), 1.0);

                // 声控光点：音频电平把小圆点推向屏幕中心位置（模仿星云中的"太阳"）
                vec2 p = (v_uv - 0.5);
                p.y -= 0.3 * f;  // 音量把光点往上推
                float sun = 0.02 / length(p);
                col += vec4(vec3(0.9, 0.8, 0.6) * sun * (0.5 + f), 1.0);

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
            gl.uniform1f(glInfo.U('u_time'), t);
            gl.uniform1f(glInfo.U('u_aspect'), 900 / 500);
            gl.uniform1f(glInfo.U('u_sound'), snd);
            gl.uniform1i(glInfo.U('u_layers'), p.layers);
            gl.uniform1f(glInfo.U('u_nebula'), p.nebula);
            gl.uniform1f(glInfo.U('u_stars'), p.stars);
            gl.uniform1f(glInfo.U('u_sensitivity'), p.sensitivity);
            gl.clearColor(0.02, 0.02, 0.05, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },
    },
};