// ===== Canvas 特效训练营 · 参数实验室播放器 =====
// 课程通过 window.LESSON 声明，schema 见 COURSE.md「参数实验室课程格式」
const VERSION = 'v44';
const loadVersion = '?v=' + VERSION;

// 内嵌背景图（image-data.js），供像素课程使用，file:// 下不污染画布
window.BG_IMG = null;
if (window.BG_B64) {
    const bgImg = new Image();
    bgImg.src = 'data:image/webp;base64,' + window.BG_B64;
    bgImg.onload = () => { window.BG_IMG = bgImg; };
}

const MANIFEST = [
    { file: '01-hello-canvas.js', no: '01', title: '画布与坐标系' },
    { file: '02-path-and-shape.js', no: '02', title: '路径与形状' },
    { file: '03-styles-gradients.js', no: '03', title: '样式与渐变色' },
    { file: '04-shadow-and-glow.js', no: '04', title: '阴影与透明度' },
    { file: '05-trig-planets.js', no: '05', title: '三角函数与圆形运动' },
    { file: '06-heart-curve.js', no: '06', title: '参数方程曲线' },
    { file: '07-bezier-wave.js', no: '07', title: '贝塞尔曲线' },
    { file: '08-transform-fractal.js', no: '08', title: '变换矩阵' },
    { file: '09-animation-runtime.js', no: '09', title: '动画循环与时间' },
    { file: '10-easing-physics.js', no: '10', title: '缓动与物理' },
    { file: '11-mouse-collision.js', no: '11', title: '鼠标交互与碰撞' },
    { file: '12-composite-blending.js', no: '12', title: '合成与混合模式' },
    { file: '13-audio-spectrum.js', no: '13', title: 'Web Audio 频谱分析' },
    { file: '14-waveform-heart.js', no: '14', title: '波形与声控动画' },
    { file: '15-audio-particles.js', no: '15', title: '音频驱动视觉' },
    { file: '16-particle-system.js', no: '16', title: '粒子系统' },
    { file: '17-mouse-particles.js', no: '17', title: '鼠标交互粒子' },
    { file: '18-text-particles.js', no: '18', title: '文字粒子' },
    { file: '19-pixel-basics.js', no: '19', title: '像素操作' },
    { file: '20-convolution.js', no: '20', title: '卷积滤镜' },
    { file: '21-image-effects.js', no: '21', title: '视频 / 图片特效' },
    { file: '22-spring-cloth.js', no: '22', title: '弹簧与摆' },
    { file: '23-water-droplets.js', no: '23', title: '水滴效果' },
    { file: '24-final-canvas.js', no: '24', title: '综合大作业 · 声控水滴' },
    { file: '25-webgl-overview.js', no: '25', title: 'WebGL 全局观' },
    { file: '26-webgl-triangle.js', no: '26', title: 'WebGL 初体验' },
    { file: '27-glsl-basics.js', no: '27', title: 'GLSL 语言基础' },
    { file: '28-webgl-matrix.js', no: '28', title: '顶点缓冲与矩阵' },
    { file: '29-webgl-texture.js', no: '29', title: '纹理与 UV' },
    { file: '30-sdf.js', no: '30', title: 'UV 与 SDF 距离场' },
    { file: '31-noise-fbm.js', no: '31', title: '噪声与 FBM' },
    { file: '32-time-layers.js', no: '32', title: '时间动画与分层' },
    { file: '33-starfield.js', no: '33', title: '星云着色器解剖' },
    { file: '34-audio-shader.js', no: '34', title: '音频驱动 Shader' },
    { file: '35-final-nova.js', no: '35', title: '综合大作业 · 音画水滴星云' },
];

const $ = (id) => document.getElementById(id);
const lessonFile = new URLSearchParams(location.search).get('lesson') || MANIFEST[0].file;

const state = {
    lesson: null,
    params: {},
    t: 0,
    last: null,
    step: 1,
    stepMode: false,
};

const canvas = $('scene');
let ctx = null;      // 2D 上下文（按课程创建）
let glInfo = null;   // WebGL 上下文（按课程创建）

// ---------- 编译着色器 / 链接程序 ----------
function compileShader(gl, type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error('着色器编译失败:', gl.getShaderInfoLog(sh));
    }
    return sh;
}
function createProgram(gl, vs, fs) {
    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);
    gl.useProgram(program);
    return program;
}

// ---------- 加载课程 ----------
function loadLesson() {
    const s = document.createElement('script');
    s.src = 'lessons/' + lessonFile + loadVersion;
    s.onload = init;
    document.head.appendChild(s);
}

// ---------- 初始化 ----------
function init() {
    const L = window.LESSON;
    if (!L) return console.error('LESSON 未定义:', lessonFile);
    state.lesson = L;

    canvas.width = L.width;
    canvas.height = L.height;

    // 按课程类型创建上下文：WebGL 或 2D
    if (L.webgl) {
        const gl = canvas.getContext('webgl', { antialias: true, preserveDrawingBuffer: true });
        if (!gl) { console.error('当前浏览器不支持 WebGL'); return; }
        const program = createProgram(gl, L.gl.vs, L.gl.fs);
        glInfo = {
            gl,
            program,
            U: (n) => gl.getUniformLocation(program, n),
            A: (n) => gl.getAttribLocation(program, n),
        };
        if (L.gl.setup) L.gl.setup(glInfo);
    } else {
        ctx = canvas.getContext('2d');
    }

    $('no').textContent = L.no;
    $('title').textContent = L.title;
    $('subtitle').textContent = L.subtitle;
    $('ver').textContent = VERSION;

    if (L.audio) {
        $('btnAudio').style.display = 'inline-block';
        $('btnAudio').addEventListener('click', toggleAudio);
    }

    buildControls();
    buildNav();
    buildStepUI();
    buildChallenge();
    renderCode();

    document.title = `${L.no} · ${L.title} — Canvas 参数实验室`;

    requestAnimationFrame(frame);
}

// ---------- 参数控件 ----------
// 计算"条件参数"：show 依赖的 key（view 切换时需重建控件）
function condKeysOf(L) {
    const s = new Set();
    (L.params || []).forEach((d) => {
        if (d.show) {
            const src = d.show.toString();
            (L.params).forEach((pd) => { if (src.includes('p.' + pd.key)) s.add(pd.key); });
        }
    });
    return s;
}

function buildControls() {
    const L = state.lesson;
    const box = $('controls');
    box.innerHTML = '';
    if (!state.params) state.params = {};

    L.params.forEach((def) => {
        if (def.show && !def.show(state.params)) return; // 条件参数：不满足则隐藏
        state.params[def.key] = state.params[def.key] ?? def.value; // 保留已有值

        const row = document.createElement('div');
        row.className = 'ctrl';

        const label = document.createElement('label');
        const val = document.createElement('span');
        val.className = 'val';

        if (def.type === 'color') {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = state.params[def.key];
            val.textContent = state.params[def.key];
            label.textContent = def.label;
            input.addEventListener('input', (e) => {
                state.params[def.key] = e.target.value;
                val.textContent = e.target.value;
                onParamChange(def.key);
            });
            row.append(label, input);
        } else if (def.type === 'select') {
            const sel = document.createElement('select');
            def.options.forEach((o) => {
                const op = document.createElement('option');
                op.value = o;
                op.textContent = o;
                sel.appendChild(op);
            });
            sel.value = state.params[def.key];
            val.textContent = state.params[def.key];
            label.textContent = def.label;
            sel.addEventListener('change', (e) => {
                state.params[def.key] = e.target.value;
                val.textContent = e.target.value;
                onParamChange(def.key);
            });
            label.append(val);
            row.append(label, sel);
        } else if (def.type === 'bool') {
            const wrap = document.createElement('span');
            wrap.className = 'toggle';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = !!state.params[def.key];
            input.addEventListener('change', (e) => {
                state.params[def.key] = e.target.checked;
                val.textContent = e.target.checked;
                onParamChange(def.key);
            });
            wrap.append(input);
            label.append(document.createTextNode(def.label), wrap);
            val.textContent = state.params[def.key];
            row.append(label);
        } else {
            const input = document.createElement('input');
            input.type = 'range';
            input.min = def.min;
            input.max = def.max;
            input.step = def.step ?? 1;
            input.value = state.params[def.key];
            val.textContent = fmt(state.params[def.key]);
            label.textContent = def.label;
            input.addEventListener('input', (e) => {
                const v = parseFloat(e.target.value);
                state.params[def.key] = v;
                val.textContent = fmt(v);
                onParamChange(def.key);
            });
            label.append(val);
            row.append(label, input);
        }

        box.appendChild(row);
    });
}

function resetParams() {
    const L = state.lesson;
    L.params.forEach((def) => { state.params[def.key] = def.value; });
    buildControls();
    renderCode();
    checkChallenge();
}
$('reset').addEventListener('click', resetParams);

// 参数变化：重建代码区（支持 show 条件行增删）+ 高亮改动值
function onParamChange(key) {
    // 条件参数（如 view）变化时，重建控件面板，让参数按视图分组显示
    const cond = condKeysOf(state.lesson);
    if (cond.has(key)) buildControls();
    renderCode();
    flashCode(key);
    checkChallenge();
}

// ---------- 代码同步 ----------
function renderCode() {
    const L = state.lesson;
    const el = $('code');
    el.innerHTML = '';
    L.code.forEach((line) => {
        if (line.show && !line.show(state.params)) return; // 条件代码行
        const code = document.createElement('span');
        code.className = 'line';
        let html = line.template
            .replace(/^(.*?)(=)/, '<span class="k">$1</span>$2'); // 给变量名染色（保留单个 =）
        line.keys.forEach((k) => {
            html = html.replace(
                new RegExp('\\$\\{' + k + '\\}', 'g'),
                `<span class="cv" data-key="${k}">${fmt(state.params[k])}</span>`
            );
        });
        code.innerHTML = html;
        el.appendChild(code);
    });
}

function flashCode(key) {
    $('code').querySelectorAll(`.cv[data-key="${key}"]`).forEach((el) => {
        el.textContent = fmt(state.params[key]); // 同步最新数值
        el.classList.remove('flash');
        void el.offsetWidth;
        el.classList.add('flash');
    });
}

// ---------- 复制当前代码 ----------
$('btnCopy').addEventListener('click', () => {
    const text = Array.from($('code').querySelectorAll('.line'))
        .map((el) => el.textContent)
        .join('\n');
    copyText(text);
});

function copyText(text) {
    const done = () => {
        const b = $('btnCopy');
        b.textContent = '已复制 ✓';
        setTimeout(() => (b.textContent = '复制'), 1200);
    };
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done);
    } else {
        // file:// 等非安全上下文时的回退方案
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done();
    }
}

// ---------- 鼠标状态（供课程 draw 使用） ----------
const mouse = { x: 0, y: 0, inside: false, down: false };
canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * canvas.width / r.width;
    mouse.y = (e.clientY - r.top) * canvas.height / r.height;
    mouse.inside = true;
});
canvas.addEventListener('mouseleave', () => { mouse.inside = false; });
canvas.addEventListener('mousedown', () => { mouse.down = true; });
window.addEventListener('mouseup', () => { mouse.down = false; });

// ---------- 音频支持（课程 audio: true 时启用） ----------
const sound = { dataArray: null, wave: null, level: 0, playing: false, audio: null, ctx: null };
let soundAnalyser = null;
let soundCtx = null;

function toggleAudio() {
    // 停止：暂停音频，回到未播放状态
    if (sound.playing) {
        if (sound.audio) sound.audio.pause();
        sound.playing = false;
        $('btnAudio').textContent = '▶ 播放音乐';
        return;
    }
    // 已初始化过：直接续播
    if (sound.ctx) {
        sound.audio.play().then(() => {
            sound.playing = true;
        });
        return;
    }
    // 首次启动
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    sound.ctx = ac;
    soundCtx = ac;
    if (ac.state === 'suspended') ac.resume();

    const audio = document.createElement('audio');
    sound.audio = audio;
    // 音乐内嵌在 music-data.js（data URI）里：file:// 下不触发 CORS 污染，既能出声也能分析。
    // 若 MUSIC_B64 缺失说明页面是旧缓存，直接报错提示刷新，不再静默降级成"能听但波形不动"。
    if (!window.MUSIC_B64) {
        console.error('MUSIC_B64 缺失：页面缓存了旧版脚本，请刷新');
        $('btnAudio').textContent = '✕ 旧缓存，请刷新';
        return;
    }
    audio.src = 'data:audio/mp4;base64,' + window.MUSIC_B64;
    document.body.appendChild(audio);

    const source = ac.createMediaElementSource(audio);
    const analyser = ac.createAnalyser();
    analyser.fftSize = 2048;
    soundAnalyser = analyser;
    sound.dataArray = new Uint8Array(analyser.frequencyBinCount);
    sound.wave = new Uint8Array(analyser.frequencyBinCount);
    // 音频同时走两条路：直连出声（保证能听到）+ 经过 analyser 分析
    source.connect(analyser);
    source.connect(ac.destination);
    analyser.connect(ac.destination);

    audio.addEventListener('error', () => {
        console.error('音频加载失败:', audio.error && audio.error.message);
    });

    audio.play()
        .then(() => {
            sound.playing = true;
        })
        .catch((e) => {
            console.error('播放失败:', e.name, e.message);
            $('btnAudio').textContent = '✕ 播放失败，请刷新重试';
        });
}

// ---------- 逐步拆解 ----------
function buildStepUI() {
    const tb = $('toolbar');
    $('btnStep').addEventListener('click', () => {
        state.stepMode = !state.stepMode;
        tb.classList.toggle('stepmode', state.stepMode);
        $('btnStep').classList.toggle('active', state.stepMode);
        state.last = null;
        if (state.stepMode) {
            if (!state.lesson.liveStep) state.t = 0; // liveStep 课程保持动画
            setStep(1);
        }
    });
    $('btnPlay').addEventListener('click', () => {
        const L = state.lesson;
        const dur = 4.5;
        const t0 = performance.now();
        const anim = (now) => {
            const k = Math.min(1, (now - t0) / (dur * 1000));
            setStep(k);
            if (k < 1) requestAnimationFrame(anim);
        };
        anim(performance.now());
    });
    $('stepRange').addEventListener('input', (e) => {
        setStep(parseInt(e.target.value) / 100);
    });
}

function setStep(k) {
    state.step = k;
    $('stepRange').value = Math.round(k * 100);
    const L = state.lesson;
    let label = '';
    (L.steps || []).forEach((s) => {
        if (k >= s.at) label = s.label;
    });
    $('stepLabel').textContent = label;
    updateStepMask();
}

// 允许课程在拆解模式时高亮当前步骤
function updateStepMask() {
    const L = state.lesson;
    if (L.onStep) L.onStep(state.step);
}

// ---------- 挑战 ----------
function buildChallenge() {
    const L = state.lesson;
    const box = $('challenge');
    box.innerHTML = '';
    if (!L.challenge) return;
    const card = document.createElement('div');
    card.className = 'challenge-card';
    card.id = 'challengeCard';
    card.innerHTML = `<h4>挑战 <span class="status" id="chStatus">未达成</span></h4><p>${L.challenge.desc}</p>`;
    box.appendChild(card);
    checkChallenge();
}

function checkChallenge() {
    const L = state.lesson;
    const card = $('challengeCard');
    if (!L.challenge || !card) return;
    const ok = L.challenge.check(state.params);
    card.classList.toggle('done', ok);
    const st = $('chStatus');
    st.textContent = ok ? '达成 ✓' : '未达成';
    st.style.color = ok ? '#37d67a' : '#7a86a8';
}

// ---------- 完整代码（独立可运行 HTML） ----------
// 序列化 LESSON（函数保留源码），配合 standaloneTpl 生成可直接保存运行的 HTML
function fnToExpr(src) {
    src = src.trim();
    // 箭头函数 / 已带 function 关键字 → 本身就是合法表达式
    if (/^function\b/.test(src) || src.startsWith('(') || src.startsWith('async')) return src;
    // 对象方法简写：draw(...) { ... } → function (...) { ... }
    return src.replace(/^[A-Za-z_$][\w$]*\s*/, 'function ');
}

function serializeLesson(L) {
    const walk = (v) => {
        if (v === null) return 'null';
        if (typeof v === 'function') return fnToExpr(v.toString());
        if (typeof v === 'string') return JSON.stringify(v);
        if (typeof v === 'number' || typeof v === 'boolean') return String(v);
        if (Array.isArray(v)) return '[' + v.map(walk).join(', ') + ']';
        if (typeof v === 'object') {
            return '{' + Object.entries(v)
                .map(([k, x]) => JSON.stringify(k) + ': ' + walk(x)).join(', ') + '}';
        }
        return 'undefined';
    };
    return walk(L);
}

function buildStandalone() {
    const L = state.lesson;
    let assets = '';
    // 按需内嵌资源：音频课带音乐，使用背景图的课带图
    if (L.audio && window.MUSIC_B64) {
        assets += '<script>window.MUSIC_B64 = ' + JSON.stringify(window.MUSIC_B64) + ';<\\/script>\n';
    }
    const drawSrc = L.draw ? L.draw.toString() : '';
    if (drawSrc.includes('BG_IMG') && window.BG_B64) {
        assets += '<script>window.BG_B64 = ' + JSON.stringify(window.BG_B64) + ';<\\/script>\n';
    }
    let tpl = document.getElementById('standaloneTpl').textContent;
    tpl = tpl.replace('/*__LESSON__*/', serializeLesson(L));
    tpl = tpl.replace('/*__ASSETS__*/', assets);
    return tpl.replace(/<\\\/script>/g, '</script>');
}

let fullEditor = null;

function openFullCode() {
    const code = buildStandalone();
    if (!fullEditor && window.CodeMirror) {
        fullEditor = CodeMirror($('fullCodeWrap'), {
            value: code,
            mode: 'htmlmixed',
            theme: 'lab',
            lineNumbers: true,
            readOnly: true,
            lineWrapping: false,
            indentUnit: 4,
            tabSize: 4,
        });
    } else if (fullEditor) {
        fullEditor.setValue(code);
    }
    if (fullEditor) setTimeout(() => fullEditor.refresh(), 50);
    $('modalMask').classList.add('open');
}
$('btnFull').addEventListener('click', openFullCode);
$('closeModal').addEventListener('click', () => $('modalMask').classList.remove('open'));
$('modalMask').addEventListener('click', (e) => { if (e.target === $('modalMask')) $('modalMask').classList.remove('open'); });
$('copyFull').addEventListener('click', () => {
    const text = fullEditor ? fullEditor.getValue() : $('fullCodeWrap').textContent;
    copyText(text);
    const b = $('copyFull');
    b.textContent = '已复制 ✓';
    setTimeout(() => (b.textContent = '复制完整代码'), 1200);
});

// ---------- 课程切换 ----------
function buildNav() {
    const idx = MANIFEST.findIndex((m) => m.file === lessonFile);
    const picker = $('picker');
    MANIFEST.forEach((m, i) => {
        const opt = document.createElement('option');
        opt.value = m.file;
        opt.textContent = `${m.no} · ${m.title}`;
        opt.selected = i === idx;
        picker.appendChild(opt);
    });
    picker.addEventListener('change', (e) => location.href = 'player.html?lesson=' + e.target.value);
    $('prev').addEventListener('click', () => {
        const i = (idx - 1 + MANIFEST.length) % MANIFEST.length;
        location.href = 'player.html?lesson=' + MANIFEST[i].file;
    });
    $('next').addEventListener('click', () => {
        const i = (idx + 1) % MANIFEST.length;
        location.href = 'player.html?lesson=' + MANIFEST[i].file;
    });
}

// ---------- 渲染循环 ----------
function frame(now) {
    const L = state.lesson;
    const p = state.params;

    // liveStep 课程在拆解模式下继续走时间，否则冻结 t
    const live = state.stepMode && L.liveStep;
    if (!state.stepMode || live) {
        if (state.last == null) state.last = now;
        state.t += (now - state.last) / 1000;
    }
    state.last = now;

    // 实时刷新音频频谱
    if (sound.playing && soundAnalyser && sound.dataArray) {
        soundAnalyser.getByteFrequencyData(sound.dataArray);
        if (sound.wave) soundAnalyser.getByteTimeDomainData(sound.wave);
        let lvl = 0;
        for (let i = 0; i < sound.dataArray.length; i += 16) lvl = Math.max(lvl, sound.dataArray[i]);
        sound.level = sound.level * 0.65 + lvl * 0.35;
        // 把实时电平打到播放按钮上（节流，~4次/秒）
        if (now - (sound.btnT || 0) > 250) {
            sound.btnT = now;
            $('btnAudio').textContent = '♪ ' + Math.round(sound.level);
        }
    }

    // 渲染：WebGL 或 2D
    if (L.webgl && glInfo) {
        const { gl } = glInfo;
        gl.viewport(0, 0, L.width, L.height);
        L.gl.frame(glInfo, p, state.t, state.step, mouse, sound);
    } else if (ctx) {
        // persist 课程自己控制背景（用于拖尾等需要保留上一帧的效果），否则先清屏
        if (!L.persist) ctx.clearRect(0, 0, L.width, L.height);
        L.draw(ctx, p, state.t, state.step, mouse, sound);
    }

    requestAnimationFrame(frame);
}

// ---------- 工具 ----------
function fmt(v) {
    if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(2);
    return String(v);
}

loadLesson();