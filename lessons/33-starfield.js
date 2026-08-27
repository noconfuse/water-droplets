// 33 · 星云着色器解剖
// 知识点：解剖 master 分支的 starField.effect —— fbmslow(FBM星云) · Star(十字星芒) · StarLayer(哈希网格星星) · 分层视差
// 场景：改写自 Cocos 项目的星云着色器。「模式」可单独看星云或星星层，逐层理解。
window.LESSON = {
    no: '33',
    phase: '阶段十',
    title: '星云着色器解剖',
    subtitle: 'FBM 星云 · 十字星芒 · 哈希网格星星 · 分层视差',
    width: 900,
    height: 500,
    liveStep: true,
    webgl: true,

    params: [
        { key: 'mode', label: '解剖模式', type: 'select', value: '全部', options: ['全部', '星云', '星星'] },
        { key: 'layers', label: '星星层数', min: 1, max: 6, step: 1, value: 5 },
        { key: 'nebula', label: '星云浓度', min: 0, max: 1.5, step: 0.05, value: 1 },
        { key: 'stars', label: '星星强度', min: 0, max: 1.5, step: 0.05, value: 1 },
        { key: 'drift', label: '漂移速度', min: 0, max: 2, step: 0.1, value: 1 },
    ],

    code: [
        { template: 'float f = 0.5*noise(p); p = m*p*1.2; f += 0.25*noise(p); p = m*p*1.3; f += 0.1666*noise(p); p = m*p*1.4; f += 0.0834*noise(p); // FBM 星云', keys: [], show: (p) => p.mode !== '星星' },
        { template: 'float d = length(uv); float m = 0.02/d; uv *= Rot(3.1415*n); m += max(0.0, 1.0 - abs(uv.x*uv.y*1000.0)) * flare; // Star 十字星芒', keys: [], show: (p) => p.mode !== '星云' },
        { template: 'n = Hash21(id + offs); vec2 starPos = gv - offs - vec2(n, fract(n*678.2313)) + 0.5; // StarLayer 星星定位', keys: [], show: (p) => p.mode !== '星云' },
        { template: 'float scale = mix(20.0, 5.0, depth); // 近层星大且多', keys: [], show: (p) => p.mode !== '星云' },
        { template: 'if (i >= ${layers}) break; // 分层数', keys: ['layers'], show: (p) => p.mode !== '星云' },
        { template: 'starField += StarLayer(uv * scale + float(i)*422.1) * depth; // 分层叠加', keys: [], show: (p) => p.mode !== '星云' },
        { template: 'vec3 cpos = 5.0*pow(fbmslow(c*5.5), 5.0)*vec3(0.4,0.5,1.0) - 0.15; // 星云颜色', keys: [], show: (p) => p.mode !== '星星' },
        { template: 'col += vec4((cpos + cpos1 + cpos2) * ${nebula}, 1.0); // 星云浓度', keys: ['nebula'], show: (p) => p.mode !== '星星' },
        { template: 'col = vec4(col.rgb + starField.rgb * ${stars}, 1.0); // 星星强度', keys: ['stars'], show: (p) => p.mode !== '星云' },
        { template: 'float t = u_time * 0.1 * ${drift}; uv.x += 1.0 * t; // 时间漂移', keys: ['drift'] },
    ],

    steps: [
        { at: 0.12, label: '① FBM 星云（fbmslow）' },
        { at: 0.38, label: '② Star() 十字星芒' },
        { at: 0.62, label: '③ StarLayer 哈希网格星星' },
        { at: 0.85, label: '④ 分层视差 + 时间漂移' },
    ],

    challenge: {
        desc: '切到「星星」模式，单独看星星层。',
        check: (p) => p.mode === '星星',
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
            uniform int u_mode;      // 0 全部 1 星云 2 星星
            uniform int u_layers;
            uniform float u_nebula;
            uniform float u_stars;
            uniform float u_drift;

            float Hash21(vec2 p) {
                p = fract(p * vec2(123.45, 986.21));
                p += dot(p, p + 243.0);
                return fract(p.x * p.y);
            }
            float hash(float n) {
                return fract(cos(n) * 41415.92653);
            }
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
            mat2 Rot(float a) {
                float s = sin(a), c = cos(a);
                return mat2(c, -s, s, c);
            }
            float Star(vec2 uv, float n, float flare) {
                float d = length(uv);
                float mm = 0.02 / d;
                uv *= Rot(3.1415 * n);
                mm += max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0)) * flare;
                uv *= Rot(3.1415 / 4.0);
                mm += max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0)) * 0.1 * flare;
                mm *= smoothstep(1.0, 0.2, d);
                return mm;
            }
            vec4 StarLayer(vec2 uv) {
                vec4 col = vec4(0.0);
                vec2 gv = fract(uv) - 0.5;
                vec2 id = floor(uv);
                for (int y = -1; y <= 1; y++) {
                    for (int x = -1; x <= 1; x++) {
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
                }
                return col;
            }

            void main() {
                vec2 uv = (v_uv - 0.5) * vec2(u_aspect, 1.0);
                vec4 col = vec4(0.0);
                float t = u_time * 0.1 * u_drift;
                uv.x += 1.0 * t;
                vec3 c = vec3(uv.x, uv.y, 1.0);

                // ① FBM 星云
                if (u_mode != 2) {
                    vec3 cpos = 5.0 * pow(fbmslow(c * 5.5), 5.0) * vec3(0.4, 0.5, 1.0) - 0.15;
                    vec3 cpos1 = 10.0 * pow(fbmslow(c * 0.5), 5.0) * vec3(0.6, 0.3, 0.6) - 0.15;
                    vec3 cpos2 = vec3(0.6, 0.0, 0.0) * 10.0 * pow(fbmslow(c * 1.45), 5.0) - 0.15;
                    col += vec4((cpos + cpos1 + cpos2) * u_nebula, 1.0);
                }

                // ②③④ 分层星星
                if (u_mode != 1) {
                    vec4 starField = vec4(0.0);
                    for (int i = 0; i < 6; i++) {
                        if (i >= u_layers) break;
                        float depth = fract(float(i) / 6.0);
                        float scale = mix(20.0, 5.0, depth);
                        float fade = depth * smoothstep(1.0, 0.9, depth);
                        starField += StarLayer(uv * scale + float(i) * 422.1) * depth;
                    }
                    col = vec4(col.rgb + starField.rgb * u_stars, 1.0);
                }

                gl_FragColor = col;
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
            const modes = { '全部': 0, '星云': 1, '星星': 2 };
            gl.uniform1f(glInfo.U('u_time'), t);
            gl.uniform1f(glInfo.U('u_aspect'), 900 / 500);
            gl.uniform1i(glInfo.U('u_mode'), modes[p.mode]);
            gl.uniform1i(glInfo.U('u_layers'), p.layers);
            gl.uniform1f(glInfo.U('u_nebula'), p.nebula);
            gl.uniform1f(glInfo.U('u_stars'), p.stars);
            gl.uniform1f(glInfo.U('u_drift'), p.drift);
            gl.clearColor(0.02, 0.02, 0.05, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },
    },
};