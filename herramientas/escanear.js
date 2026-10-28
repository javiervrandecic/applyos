#!/usr/bin/env node
// Escáner de secretos y datos personales para applyOS.
// Sin dependencias. Node 18 o superior.
//
// Uso
//   node herramientas/escanear.js                 escanea el árbol de trabajo (archivos versionados y nuevos no ignorados)
//   node herramientas/escanear.js --staged        escanea lo que está en el área de preparación (lo usa el hook pre-commit)
//   node herramientas/escanear.js --historial     escanea todos los commits (contenido agregado, mensajes y autores)
//   node herramientas/escanear.js ruta1 ruta2     escanea archivos o carpetas puntuales, aunque estén fuera de git
//
// Opciones
//   --lista-negra <archivo>     palabras prohibidas, una por línea (# comenta). También ESCANER_LISTA_NEGRA
//   --secretos <a;b;c>          archivos .env o de notas con tus claves reales. También ESCANER_ARCHIVOS_SECRETOS
//   --permitir <archivo>        excepciones, una expresión regular por línea. También ESCANER_PERMITIR
//
// Los archivos de secretos se leen solo en memoria para detectar si algún valor aparece en lo escaneado
// (coincidencia exacta o un fragmento de 8 o más caracteres). Nunca se imprime un valor, solo el nombre
// de la variable, el archivo y la línea donde está definida.
//
// Sale con código 1 si hay hallazgos, 0 si está limpio, 2 si hubo un error de uso.

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// ─── Argumentos ───
const args = process.argv.slice(2);
const opt = { modo: 'arbol', rutas: [], listaNegra: process.env.ESCANER_LISTA_NEGRA || '', secretos: process.env.ESCANER_ARCHIVOS_SECRETOS || '', permitir: process.env.ESCANER_PERMITIR || '' };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--staged') opt.modo = 'staged';
  else if (a === '--historial') opt.modo = 'historial';
  else if (a === '--lista-negra') opt.listaNegra = args[++i] || '';
  else if (a === '--secretos') opt.secretos = args[++i] || '';
  else if (a === '--permitir') opt.permitir = args[++i] || '';
  else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 20).join('\n')); process.exit(0); }
  else if (a.startsWith('--')) { console.error(`opción desconocida: ${a}`); process.exit(2); }
  else { opt.modo = 'rutas'; opt.rutas.push(a); }
}

// ─── Reglas fijas ───
// Cada regla tiene un nombre y una expresión. Los valores nunca se imprimen completos.
const REGLAS = [
  ['clave de Anthropic', /sk-ant-[A-Za-z0-9_-]{20,}/],
  ['clave de OpenAI', /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{32,}/],
  ['token de bot de mensajería',/\b\d{8,10}:[A-Za-z0-9_-]{35}\b/],
  ['token de GitHub', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})/],
  ['clave de Google', /\b(?:AIza[0-9A-Za-z_-]{35}|ya29\.[0-9A-Za-z_-]{20,}|GOCSPX-[0-9A-Za-z_-]{20,})/],
  ['clave de AWS', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b|aws_secret_access_key\s*[:=]\s*\S{20,}/i],
  ['clave de Stripe', /\b(?:sk|rk|pk)_(?:live|test)_[0-9A-Za-z]{16,}|\bwhsec_[0-9A-Za-z]{16,}/],
  ['token de Slack', /\bxox[abprs]-[0-9A-Za-z-]{10,}/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ['clave privada', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['URL con usuario y clave', /\b[a-z][a-z0-9+.-]*:\/\/[^\s\/:@'"<>]+:[^\s\/@'"<>]+@[^\s]/i],
  ['cabecera de autorización con valor', /\b(?:xc-token|xc-auth|x-api-key|authorization)["']?\s*[:=]\s*["']?(?:Bearer\s+|Basic\s+)?[A-Za-z0-9._~+\/=-]{16,}/i],
  ['contraseña asignada', /\b(?:password|passwd|pwd|contrase(?:ñ|n)a|clave|secret|api[_-]?key|token)["']?\s*[:=]\s*["']?(?![<\[{$(]|process\.env|env\.|tu_|tu-|xxx|\*\*\*|placeholder|ejemplo|example)[^\s"'`,;]{6,}/i],
  ['app password de Gmail', /(?:["'`=:]\s*|^\s*)[a-z]{4} [a-z]{4} [a-z]{4} [a-z]{4}(?=\s*["'`]|\s*$)/],
  ['correo electrónico', /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/],
  ['teléfono', /(?:\+\d{1,3}[\s.-]?)\(?\d{1,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b|\b9[\s.-]?\d{4}[\s.-]?\d{4}\b/],
  ['ruta de usuario', /\b[A-Za-z]:[\\\/]+Users[\\\/]+[^\\\/\s]+|\/(?:c\/)?Users\/[A-Za-z0-9._-]+|\/home\/[A-Za-z0-9._-]+|One[D]rive/i],
];

// Coincidencias que se ignoran siempre. Ejemplos sintéticos y dominios reservados.
const PERMITIDOS_BASE = [
  /@(?:ejemplo|example)\.(?:com|cl|org|net)\b/i,
  /noreply@anthropic\.com/i,
  /\bsha(?:1|256|384|512)-[A-Za-z0-9+\/=]+/,
  /\/Users\/<[^>]+>/i,
  /^\+0{2}[\s0.-]*$/,
];

// ─── Configuración externa ───
function leerLineas(archivo) {
  return fs.readFileSync(archivo, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
}
function escaparRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

let listaNegra = [];
if (opt.listaNegra) {
  if (!fs.existsSync(opt.listaNegra)) { console.error('no existe el archivo de lista negra indicado'); process.exit(2); }
  listaNegra = leerLineas(opt.listaNegra).map((p, i) => ({ id: `entrada ${i + 1} de la lista negra`, re: new RegExp(`(?<![\\p{L}\\p{N}])${escaparRegex(p)}(?![\\p{L}\\p{N}])`, 'iu') }));
}
const permitidos = [...PERMITIDOS_BASE];
if (opt.permitir && fs.existsSync(opt.permitir)) for (const l of leerLineas(opt.permitir)) permitidos.push(new RegExp(l, 'i'));

// Valores reales de secretos. Viven solo en memoria.
const fragmentos = new Map(); // fragmento de 8 -> origen
const exactos = [];          // { valor, origen }
// Un fragmento sirve para comparar si parece parte de una clave y no una palabra común.
function fragmentoUtil(f) {
  if (/[\s\/]/.test(f) || /^https?:|^www\./i.test(f)) return false;
  const dig = /\d/.test(f), let_ = /[A-Za-z]/.test(f), may = (f.match(/[A-Z]/g) || []).length, min = (f.match(/[a-z]/g) || []).length;
  return (dig && let_) || (may >= 2 && min >= 3 && /[a-z][A-Z]|[A-Z]{2}/.test(f));
}
// Un valor de un archivo de notas se toma como secreto si su etiqueta lo dice o si tiene forma de clave.
const ETIQUETA_SECRETA = /token|key|clave|pass|secret|\bpat\b|api|auth|bearer|contrase|usuario|user|correo|email|webhook|cookie|session/i;
function formaDeClave(v) {
  return v.length >= 16 && !/[\s\/]/.test(v) && /\d/.test(v) && /[A-Za-z]/.test(v) && entropia(v) >= 3.5;
}
// Palabras de protocolo que aparecen junto a las claves pero no son secretas.
const PALABRAS_DE_PROTOCOLO = new Set(['authorization', 'bearer', 'content-type', 'application/json', 'x-api-key', 'xc-token', 'xc-auth', 'password', 'username', 'localhost']);
function registrarSecreto(valor, origen) {
  valor = valor.trim().replace(/^["'`]|["'`]$/g, '');
  if (PALABRAS_DE_PROTOCOLO.has(valor.toLowerCase())) return;
  if (valor.length < 8 || /^(true|false|null|undefined)$/i.test(valor) || /^https?:\/\/[^\/]*\/?$/i.test(valor) && valor.length < 12) return;
  exactos.push({ valor: valor.toLowerCase(), origen });
  for (let i = 0; i + 8 <= valor.length; i++) {
    const f = valor.slice(i, i + 8);
    if (fragmentoUtil(f) && !fragmentos.has(f)) fragmentos.set(f, origen);
  }
}
if (opt.secretos) {
  for (const archivo of opt.secretos.split(';').map(s => s.trim()).filter(Boolean)) {
    if (!fs.existsSync(archivo)) { console.error(`aviso: no existe uno de los archivos de secretos (${path.basename(archivo)})`); continue; }
    const nombre = path.basename(archivo);
    let seccion = 'sin sección';
    fs.readFileSync(archivo, 'utf8').split(/\r?\n/).forEach((linea, n) => {
      const t = linea.trim();
      if (!t || t.startsWith('#') && /^#\s/.test(t) && !/=/.test(t)) { if (/^#+\s/.test(t)) seccion = t.replace(/^#+\s*/, '').slice(0, 40); return; }
      const env = t.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (env) { registrarSecreto(env[2], { variable: env[1], archivo: nombre, linea: n + 1 }); return; }
      // Formato de notas. Valores entre comillas invertidas o después de ":" o "=".
      const candidatos = [];
      for (const m of t.matchAll(/`([^`]{8,})`/g)) candidatos.push(m[1]);
      const tras = t.replace(/\*\*/g, '').match(/[:=]\s*(.+)$/);
      if (tras) candidatos.push(...tras[1].split(/\s+/));
      const etiqueta = (t.replace(/\*\*/g, '').match(/^[-*\s]*([^:=`]{2,40})[:=]/) || [])[1];
      const etiquetaSecreta = ETIQUETA_SECRETA.test(etiqueta || '');
      for (const c of candidatos) {
        const v = c.replace(/[`*,;()]+/g, '').replace(/[.:]+$/, '');
        if (v.length < 8 || /^https?:\/\//i.test(v)) continue;
        if ((etiquetaSecreta && candidatos.length <= 3) || formaDeClave(v)) registrarSecreto(v, { variable: (etiqueta || seccion).trim(), archivo: nombre, linea: n + 1 });
      }
    });
  }
}

// ─── Entropía ───
function entropia(s) {
  const f = {}; for (const c of s) f[c] = (f[c] || 0) + 1;
  let h = 0; for (const k in f) { const p = f[k] / s.length; h -= p * Math.log2(p); }
  return h;
}
function altaEntropia(linea) {
  const out = [];
  for (const m of linea.matchAll(/[A-Za-z0-9+\/=_-]{24,}/g)) {
    const t = m[0];
    if (!/\d/.test(t) || !/[A-Za-z]/.test(t)) continue;
    if (/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(t)) continue; // slugs de URL
    if (/^[a-f0-9]{40}$/.test(t)) continue;             // hashes de commit
    if (entropia(t) >= 4.2) out.push(t);
  }
  return out;
}

// ─── Análisis de una línea ───
function enmascarar(s) { return s.length <= 6 ? '***' : `${s.slice(0, 2)}***${s.slice(-1)} (${s.length} caracteres)`; }
function permitido(texto) { return permitidos.some(re => re.test(texto)); }

function analizarLinea(linea) {
  const hallazgos = [];
  if (/escaner:permitir/.test(linea)) return hallazgos;
  for (const [nombre, re] of REGLAS) {
    const rg = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    for (const m of linea.matchAll(rg)) {
      if (permitido(m[0])) continue;
      hallazgos.push(`${nombre}, ${enmascarar(m[0].trim())}`);
    }
  }
  for (const { id, re } of listaNegra) if (re.test(linea)) hallazgos.push(`nombre de la lista negra (${id})`);
  for (const t of altaEntropia(linea)) if (!permitido(t)) hallazgos.push(`cadena de alta entropía, ${enmascarar(t)}`);
  if (exactos.length) {
    const baja = linea.toLowerCase();
    const vistos = new Set();
    for (const { valor, origen } of exactos) if (baja.includes(valor)) { const k = `${origen.archivo}:${origen.linea}`; if (!vistos.has(k)) { vistos.add(k); hallazgos.push(`coincide con la variable ${origen.variable} en el archivo ${origen.archivo} línea ${origen.linea}`); } }
    for (let i = 0; i + 8 <= linea.length; i++) {
      const o = fragmentos.get(linea.slice(i, i + 8));
      if (o) { const k = `${o.archivo}:${o.linea}`; if (!vistos.has(k)) { vistos.add(k); hallazgos.push(`coincide en parte con la variable ${o.variable} en el archivo ${o.archivo} línea ${o.linea}`); } }
    }
  }
  return hallazgos;
}

// ─── Fuentes ───
function git(argv) { return execFileSync('git', argv, { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, windowsHide: true }); }
const BINARIO = /\.(png|jpe?g|gif|webp|ico|pdf|zip|gz|woff2?|ttf|otf|mp3|mp4|wav)$/i;
const IGNORAR = /(^|\/)(node_modules|\.git)\//;
const resultados = [];
function analizarTexto(origen, texto) {
  if (texto.includes('\u0000')) return;
  texto.split(/\r?\n/).forEach((l, i) => { for (const h of analizarLinea(l)) resultados.push(`${origen}:${i + 1}  ${h}`); });
}
function recorrer(ruta, out) {
  const st = fs.statSync(ruta);
  if (st.isDirectory()) { for (const n of fs.readdirSync(ruta)) { const p = path.join(ruta, n); if (!IGNORAR.test(p.replace(/\\/g, '/') + '/')) recorrer(p, out); } }
  else out.push(ruta);
}

const yo = path.resolve(__filename);
try {
  if (opt.modo === 'rutas') {
    const archivos = []; for (const r of opt.rutas) recorrer(r, archivos);
    for (const a of archivos) if (!BINARIO.test(a)) analizarTexto(a, fs.readFileSync(a, 'utf8'));
  } else if (opt.modo === 'arbol') {
    const raiz = git(['rev-parse', '--show-toplevel']).trim();
    const lista = git(['-C', raiz, 'ls-files', '-co', '--exclude-standard']).split('\n').filter(Boolean);
    for (const r of lista) { const a = path.join(raiz, r); if (!BINARIO.test(r) && fs.existsSync(a)) analizarTexto(r, fs.readFileSync(a, 'utf8')); }
  } else if (opt.modo === 'staged') {
    const lista = git(['diff', '--cached', '--name-only', '--diff-filter=ACMR']).split('\n').filter(Boolean);
    for (const r of lista) if (!BINARIO.test(r)) analizarTexto(`${r} (preparado)`, git(['show', `:${r}`]));
    // El mensaje del commit todavía no existe en esta etapa. Revisa el autor configurado.
  } else if (opt.modo === 'historial') {
    const commits = git(['rev-list', '--all']).split('\n').filter(Boolean);
    for (const c of commits) {
      const corto = c.slice(0, 7);
      analizarTexto(`commit ${corto} (mensaje)`, git(['log', '-1', '--format=%B', c]));
      analizarTexto(`commit ${corto} (autor y committer)`, git(['log', '-1', '--format=%an <%ae>%n%cn <%ce>', c]));
      const archivos = git(['diff-tree', '--root', '--no-commit-id', '--name-only', '-r', '--diff-filter=ACMR', c]).split('\n').filter(Boolean);
      for (const r of archivos) { if (BINARIO.test(r)) continue; analizarTexto(`commit ${corto} ${r}`, git(['show', `${c}:${r}`])); }
    }
  }
} catch (e) {
  console.error(`error al escanear: ${e.message.split('\n')[0]}`);
  process.exit(2);
}

// Deduplica hallazgos idénticos del historial (un mismo archivo repetido en varios commits).
const unicos = [...new Set(resultados)];
if (unicos.length) {
  console.log(`ESCÁNER. ${unicos.length} hallazgo(s)\n`);
  for (const r of unicos) console.log(`  ${r}`);
  console.log('\nRevisa cada uno. Si es un ejemplo sintético legítimo, agrega "escaner:permitir" en esa línea o una excepción en el archivo de --permitir.');
  process.exit(1);
}
console.log(`ESCÁNER. sin hallazgos (${opt.modo}${listaNegra.length ? `, lista negra de ${listaNegra.length} entradas` : ', sin lista negra'}${exactos.length ? `, ${exactos.length} valores de secretos cargados` : ', sin archivos de secretos'})`);
process.exit(0);
