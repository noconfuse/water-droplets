#!/usr/bin/env node
// 课程审计：校验所有课程的代码片段占位符绑定 + 参数反馈完整性
// 用法：node tools/audit.js
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'lessons');

// 用括号匹配提取 window.LESSON 对象（跳过字符串与模板字符串，模板里有 GLSL 代码）
function extractLesson(file) {
    const ctx = fs.readFileSync(file, 'utf8');
    const i0 = ctx.indexOf('window.LESSON = {');
    if (i0 < 0) return null;
    let i = i0 + 'window.LESSON = '.length;
    let depth = 0, inStr = null, inTpl = false;
    for (; i < ctx.length; i++) {
        const ch = ctx[i];
        if (inStr) {
            if (ch === '\\') { i++; continue; }
            if (ch === inStr) inStr = null;
            continue;
        }
        if (inTpl) {
            if (ch === '\\') { i++; continue; }
            if (ch === '`') inTpl = false;
            continue;
        }
        if (ch === '"' || ch === "'") { inStr = ch; continue; }
        if (ch === '`') { inTpl = true; continue; }
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) return ctx.slice(i0 + 'window.LESSON = '.length, i + 1); }
    }
    return null;
}

let ok = true;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
for (const f of files) {
    const body = extractLesson(path.join(dir, f));
    if (!body) { console.log(f, '⚠ 无法提取 LESSON'); ok = false; continue; }
    const obj = eval('(' + body + ')');
    if (!obj.params || !Array.isArray(obj.params)) continue;

    const params = new Set(obj.params.map(p => p.key));
    const used = new Set();
    for (const line of (obj.code || [])) {
        (line.keys || []).forEach(k => used.add(k));
        if (line.show) {
            const src = line.show.toString();
            obj.params.forEach(p => { if (src.includes('p.' + p.key)) used.add(p.key); });
        }
        const phs = [...line.template.matchAll(/\$\{(\w+)\}/g)].map(x => x[1]);
        for (const ph of phs) {
            if (!(line.keys || []).includes(ph) || !params.has(ph)) {
                ok = false;
                console.log(f, '占位符未绑定 ${' + ph + '}:', line.template.slice(0, 50));
            }
        }
    }
    const missing = obj.params.filter(p => !used.has(p.key));
    if (missing.length) {
        ok = false;
        console.log(f, '未反馈参数:', missing.map(p => p.key).join(','));
    }
}
console.log(ok ? '✅ 全部课程参数反馈完整' : '❌ 仍有问题');
process.exit(ok ? 0 : 1);