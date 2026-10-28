#!/usr/bin/env node
/**
 * Métricas de una entrevista a partir del JSON diarizado de AssemblyAI.
 * Node 18 o superior, sin dependencias.
 *
 * Uso:
 *   node metricas.js <diarizado.json> --candidato <letra> [--muletillas "o sea,eh,digamos"]
 *                    [--muletillas-archivo lista.json] [--json]
 *
 * Sin --candidato, solo lista los hablantes con su primera frase para que decidas
 * cuál eres tú. Los diarizadores invierten hablantes con frecuencia: verifica antes.
 *
 * Definiciones (todas desde los tiempos de la API, nunca a mano):
 *   % de habla       tiempo hablado por el candidato / tiempo hablado total (turnos, sin silencios)
 *   Apertura         duración del primer turno del candidato (--turno-apertura n para elegir otro)
 *   Turnos > 60 s    turnos del candidato de más de 60 segundos seguidos
 *   Muletillas/min   apariciones de las expresiones de la lista / minutos de habla del candidato
 *   Interrupciones   turno que empieza antes de que termine el del otro hablante (solape de 300 ms o más)
 *
 * Límite conocido: un diarizador sobre una sola pista rara vez entrega turnos solapados,
 * así que el conteo de interrupciones es un mínimo. Con dos pistas separadas sale exacto.
 */

const fs = require('fs');

const MULETILLAS_POR_DEFECTO = ['o sea', 'eh', 'em', 'digamos', 'básicamente', 'como tal', 'bueno', 'claro', 'de hecho', 'por así decirlo', 'en el fondo', 'entonces', 'cachai'];
const UNIR_SI_HUECO_MENOR_A_MS = 1500;
const SOLAPE_MINIMO_MS = 300;

function uso(msg) {
  if (msg) console.error(`Error: ${msg}\n`);
  console.error('Uso: node metricas.js <diarizado.json> --candidato <letra> [--muletillas "a,b"] [--muletillas-archivo lista.json] [--turno-apertura n] [--json]');
  process.exit(msg ? 1 : 0);
}

function leerArgs(argv) {
  const o = { json: false, turnoApertura: 1 };
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => {
      if (i + 1 >= argv.length) uso(`falta el valor de ${a}`);
      return argv[++i];
    };
    if (a === '--candidato') o.candidato = val().toUpperCase();
    else if (a === '--muletillas') o.muletillas = val().split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--muletillas-archivo') o.muletillasArchivo = val();
    else if (a === '--turno-apertura') o.turnoApertura = parseInt(val(), 10);
    else if (a === '--json') o.json = true;
    else if (a === '-h' || a === '--help') uso();
    else if (a.startsWith('--')) uso(`opción desconocida ${a}`);
    else pos.push(a);
  }
  if (pos.length !== 1) uso('indica el archivo JSON diarizado');
  o.archivo = pos[0];
  return o;
}

const sinTildes = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const seg = (ms) => ms / 1000;

// Une utterances consecutivas del mismo hablante con un hueco corto: es un solo turno.
function armarTurnos(utterances) {
  const turnos = [];
  for (const u of utterances) {
    const ult = turnos[turnos.length - 1];
    if (ult && ult.speaker === u.speaker && u.start - ult.end < UNIR_SI_HUECO_MENOR_A_MS) {
      ult.end = Math.max(ult.end, u.end);
      ult.text += ' ' + u.text;
    } else {
      turnos.push({ speaker: u.speaker, start: u.start, end: u.end, text: u.text });
    }
  }
  return turnos;
}

function contarMuletillas(texto, lista) {
  const t = sinTildes(texto);
  const conteos = {};
  for (const m of lista) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapar(sinTildes(m)).replace(/\s+/g, '\\s+')}(?![\\p{L}\\p{N}])`, 'gu');
    const n = (t.match(re) || []).length;
    if (n > 0) conteos[m] = n;
  }
  return conteos;
}

function calcular(data, o) {
  const utt = data.utterances;
  if (!Array.isArray(utt) || !utt.length) throw new Error('El JSON no trae utterances. Se pidió la transcripción con speaker_labels?');
  const hablantes = [...new Set(utt.map((u) => u.speaker))];
  if (!hablantes.includes(o.candidato)) throw new Error(`El hablante ${o.candidato} no existe. Hay: ${hablantes.join(', ')}`);

  const turnos = armarTurnos(utt);
  const habla = {};
  for (const t of turnos) habla[t.speaker] = (habla[t.speaker] || 0) + (t.end - t.start);
  const total = Object.values(habla).reduce((a, b) => a + b, 0);
  const msCand = habla[o.candidato] || 0;

  const turnosCand = turnos.filter((t) => t.speaker === o.candidato);
  const largos = turnosCand.filter((t) => t.end - t.start > 60000);
  const apertura = turnosCand[o.turnoApertura - 1];
  const masLargo = turnosCand.reduce((m, t) => (!m || t.end - t.start > m.end - m.start ? t : m), null);

  let interrumpeCand = 0;
  let interrumpenCand = 0;
  for (let i = 1; i < turnos.length; i++) {
    const prev = turnos[i - 1];
    const cur = turnos[i];
    if (prev.speaker !== cur.speaker && prev.end - cur.start >= SOLAPE_MINIMO_MS) {
      if (cur.speaker === o.candidato) interrumpeCand++;
      else interrumpenCand++;
    }
  }

  const lista = o.muletillas || MULETILLAS_POR_DEFECTO;
  const textoCand = turnosCand.map((t) => t.text).join(' ');
  const conteos = contarMuletillas(textoCand, lista);
  const totalMul = Object.values(conteos).reduce((a, b) => a + b, 0);
  const minCand = msCand / 60000;

  const palabras = Array.isArray(data.words) ? data.words.filter((w) => w.speaker === o.candidato) : [];
  const nPalabras = textoCand.split(/\s+/).filter(Boolean).length;

  return {
    duracion_audio_s: data.audio_duration ?? null,
    hablantes: hablantes.length,
    habla_por_hablante_s: Object.fromEntries(Object.entries(habla).map(([k, v]) => [k, +seg(v).toFixed(1)])),
    pct_habla_candidato: +((msCand / total) * 100).toFixed(1),
    apertura_s: apertura ? +seg(apertura.end - apertura.start).toFixed(1) : null,
    apertura_inicio_s: apertura ? +seg(apertura.start).toFixed(1) : null,
    turnos_candidato: turnosCand.length,
    turnos_mas_60s: largos.length,
    turno_mas_largo_s: masLargo ? +seg(masLargo.end - masLargo.start).toFixed(1) : null,
    turno_mas_largo_inicio_s: masLargo ? +seg(masLargo.start).toFixed(1) : null,
    muletillas_total: totalMul,
    muletillas_por_min: minCand > 0 ? +(totalMul / minCand).toFixed(2) : null,
    muletillas_detalle: conteos,
    interrupciones_del_candidato: interrumpeCand,
    interrupciones_al_candidato: interrumpenCand,
    palabras_por_min: minCand > 0 ? Math.round(nPalabras / minCand) : null,
    confianza_media_candidato: palabras.length ? +(palabras.reduce((s, w) => s + w.confidence, 0) / palabras.length).toFixed(3) : null,
  };
}

function fmt(v, unidad = '') {
  return v === null || v === undefined ? 'sin dato' : `${v}${unidad}`;
}

function imprimir(m, o) {
  const filas = [
    ['Duración del audio', fmt(m.duracion_audio_s && Math.round(m.duracion_audio_s), ' s')],
    ['Hablantes detectados', fmt(m.hablantes)],
    [`% de habla del candidato (${o.candidato})`, fmt(m.pct_habla_candidato, ' %')],
    ['Apertura (primer turno)', m.apertura_s === null ? 'sin dato' : `${m.apertura_s} s (desde ${m.apertura_inicio_s} s)`],
    ['Turnos del candidato', fmt(m.turnos_candidato)],
    ['Turnos de más de 60 s', fmt(m.turnos_mas_60s)],
    ['Turno más largo', m.turno_mas_largo_s === null ? 'sin dato' : `${m.turno_mas_largo_s} s (desde ${m.turno_mas_largo_inicio_s} s)`],
    ['Muletillas por minuto', `${fmt(m.muletillas_por_min)} (${m.muletillas_total} en total)`],
    ['Interrupciones del candidato', fmt(m.interrupciones_del_candidato)],
    ['Interrupciones al candidato', fmt(m.interrupciones_al_candidato)],
    ['Palabras por minuto', fmt(m.palabras_por_min)],
    ['Confianza media de transcripción', fmt(m.confianza_media_candidato)],
  ];
  const ancho = Math.max(...filas.map((f) => f[0].length));
  console.log(`| ${'Métrica'.padEnd(ancho)} | Valor |`);
  console.log(`|${'-'.repeat(ancho + 2)}|-------|`);
  for (const [k, v] of filas) console.log(`| ${k.padEnd(ancho)} | ${v} |`);
  const det = Object.entries(m.muletillas_detalle).sort((a, b) => b[1] - a[1]).map(([k, v]) => `"${k}" x${v}`).join(', ');
  console.log(`\nMuletillas encontradas: ${det || 'ninguna de la lista'}.`);
  console.log('Las interrupciones son un mínimo si el audio era de una sola pista. La apertura es el primer turno del candidato, confirma que sea la respuesta a "cuéntame de ti".');
}

function main() {
  const o = leerArgs(process.argv.slice(2));
  if (!fs.existsSync(o.archivo)) uso(`no existe ${o.archivo}`);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(o.archivo, 'utf8'));
  } catch (e) {
    uso(`el archivo no es un JSON válido (${e.message})`);
  }
  if (o.muletillasArchivo) {
    try {
      o.muletillas = JSON.parse(fs.readFileSync(o.muletillasArchivo, 'utf8'));
    } catch (e) {
      uso(`no pude leer la lista de muletillas (${e.message})`);
    }
  }
  if (!o.candidato) {
    const vistos = new Map();
    for (const u of data.utterances || []) if (!vistos.has(u.speaker)) vistos.set(u.speaker, u);
    console.log('Indica cuál hablante eres con --candidato. Primera frase de cada uno:\n');
    for (const [s, u] of vistos) console.log(`  ${s}: ${u.text.slice(0, 120)}`);
    process.exit(0);
  }
  try {
    const m = calcular(data, o);
    if (o.json) console.log(JSON.stringify(m, null, 2));
    else imprimir(m, o);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

main();
