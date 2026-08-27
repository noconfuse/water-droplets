// 28 · 纹理与 UV
// 知识点：纹理坐标 UV · createTexture · texImage2D 上传图片 · sampler2D/texture2D 采样
// 场景：正方形贴纹理并旋转；「UV 缩放」让纹理重复平铺。
window.LESSON = {
    no: '29',
    phase: '阶段八',
    title: '纹理与 UV',
    subtitle: 'UV 坐标 · 纹理上传 · texture2D 采样',
    width: 900,
    height: 500,
    liveStep: true,
    webgl: true,

    params: [
        { key: 'speed', label: '旋转速度', min: 0, max: 3, step: 0.1, value: 1 },
        { key: 'scale', label: '缩放', min: 0.3, max: 1.5, step: 0.05, value: 1 },
        { key: 'texScale', label: 'UV 缩放', min: 0.5, max: 4, step: 0.1, value: 1 },
    ],

    code: [
        { template: 'g.fillStyle = (x + y) % 2 ? "#ffd479" : "#2a6a9f"; // 棋盘格颜色', keys: [] },
        { template: 'g.fillRect(x * 16, y * 16, 16, 16); // 离屏 canvas 画纹理', keys: [] },
        { template: 'gl.createTexture();', keys: [] },
        { template: 'gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); // 上传纹理', keys: [] },
        { template: 'varying vec2 v_uv; // 纹理坐标', keys: [] },
        { template: 'const ang = t * ${speed};', keys: ['speed'] },
        { template: 'const c = Math.cos(ang) * ${scale}, s = Math.sin(ang) * ${scale};', keys: ['scale'] },
        { template: 'gl.uniformMatrix3fv(u_matrix, false, new Float32Array([c, s, 0, -s, c, 0, 0, 0, 1]));', keys: [] },
        { template: 'gl_FragColor = texture2D(u_tex, fract(v_uv * ${texScale})); // 采样取色', keys: ['texScale'] },
        { template: 'gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);', keys: [] },
    ],

    steps: [
        { at: 0.12, label: '① UV 纹理坐标' },
        { at: 0.38, label: '② createTexture + texImage2D' },
        { at: 0.62, label: '③ texture2D 采样' },
        { at: 0.85, label: '④ 旋转 + UV 平铺' },
    ],

    challenge: {
        desc: 'UV 拉满，纹理铺满。',
        check: (p) => p.texScale >= 3,
    },

    gl: {
        vs: `
            attribute vec2 a_position;
            attribute vec2 a_uv;
            varying vec2 v_uv;
            uniform mat3 u_matrix;
            void main() {
                v_uv = a_uv;
                vec3 p = u_matrix * vec3(a_position, 1.0);
                gl_Position = vec4(p.xy, 0.0, 1.0);
            }
        `,
        fs: `
            precision mediump float;
            varying vec2 v_uv;
            uniform sampler2D u_tex;
            uniform float u_texScale;
            void main() {
                gl_FragColor = texture2D(u_tex, fract(v_uv * u_texScale));
            }
        `,

        frame(glInfo, p, t, step) {
            const { gl } = glInfo;
            if (!glInfo.buf) {
                // 正方形 + UV
                glInfo.buf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, glInfo.buf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                    -0.6, -0.6, 0, 0,
                    0.6, -0.6, 1, 0,
                    -0.6, 0.6, 0, 1,
                    0.6, 0.6, 1, 1,
                ]), gl.STATIC_DRAW);
                const stride = 4 * 4;
                const pl = glInfo.A('a_position');
                gl.enableVertexAttribArray(pl);
                gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, stride, 0);
                const ul = glInfo.A('a_uv');
                gl.enableVertexAttribArray(ul);
                gl.vertexAttribPointer(ul, 2, gl.FLOAT, false, stride, 2 * 4);
            }
            if (!glInfo.tex) {
                // 用离屏 canvas 生成纹理（彩色棋盘格，无 CORS 问题）
                const c = document.createElement('canvas');
                c.width = 128; c.height = 128;
                const g = c.getContext('2d');
                for (let y = 0; y < 8; y++) {
                    for (let x = 0; x < 8; x++) {
                        g.fillStyle = (x + y) % 2 ? '#ffd479' : '#2a6a9f';
                        g.fillRect(x * 16, y * 16, 16, 16);
                    }
                }
                glInfo.tex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, glInfo.tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            }

            const ang = t * p.speed;
            const c = Math.cos(ang) * p.scale, s = Math.sin(ang) * p.scale;
            gl.uniformMatrix3fv(glInfo.U('u_matrix'), false, new Float32Array([
                c, s, 0, -s, c, 0, 0, 0, 1,
            ]));
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, glInfo.tex);
            gl.uniform1i(glInfo.U('u_tex'), 0);
            gl.uniform1f(glInfo.U('u_texScale'), step < 0.85 ? 1 : p.texScale);

            gl.clearColor(0.055, 0.075, 0.125, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        },
    },
};