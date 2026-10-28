#!/usr/bin/env node
/**
 * Diariza una entrevista con AssemblyAI. Node 18 o superior, sin dependencias.
 *
 * Uso:
 *   node diarizar.js <audio> [--salida <carpeta>] [--nombre <base>] [--idioma es]
 *                    [--hablantes <n>] [--modelo universal-2] [--espera-max <minutos>] [--disfluencias]
 *
 * La clave se lee SOLO de la variable de entorno ASSEMBLYAI_API_KEY. Nunca se
 * imprime ni se guarda en ningún archivo.
 *
 * Genera en la carpeta de salida (por defecto, la del audio):
 *   <nombre>.diarizado.json   respuesta completa de la API (utterances y words)
 *   <nombre>.transcripcion.md transcripción con hablante y hora
 *
 * Después: node metricas.js <nombre>.diarizado.json --candidato <A|B|...>
 */

const fs = require('fs');
const path = require('path');

const API = 'https://api.assemblyai.com/v2';

function uso(msg) {
  if (msg) console.error(`Error: ${msg}\n`);
  console.error('Uso: node diarizar.js <audio> [--salida carpeta] [--nombre base] [--idioma es] [--hablantes n] [--modelo universal-2] [--espera-max minutos] [--disfluencias]');
  process.exit(msg ? 1 : 0);
}

function leerArgs(argv) {
  const o = { idioma: 'es', modelo: 'universal-2', esperaMax: 60 };
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => {
      if (i + 1 >= argv.length) uso(`falta el valor de ${a}`);
      return argv[++i];
    };
    if (a === '--salida') o.salida = val();
    else if (a === '--nombre') o.nombre = val();
    else if (a === '--idioma') o.idioma = val();
    else if (a === '--hablantes') o.hablantes = parseInt(val(), 10);
    else if (a === '--modelo') o.modelo = val();
    else if (a === '--espera-max') o.esperaMax = parseFloat(val());
    else if (a === '--disfluencias') o.disfluencias = true;
    else if (a === '-h' || a === '--help') uso();
    else if (a.startsWith('--')) uso(`opción desconocida ${a}`);
    else pos.push(a);
  }
  if (pos.length !== 1) uso('indica un único archivo de audio');
  o.audio = pos[0];
  return o;
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

// Pide con reintentos ante errores de red, 429 y 5xx. Los 4xx se informan de inmediato.
async function pedir(url, opciones, etiqueta, intentos = 4) {
  let ultimo;
  for (let n = 1; n <= intentos; n++) {
    try {
      const res = await fetch(url, opciones);
      if (res.ok) return res;
      const cuerpo = await res.text().catch(() => '');
      const detalle = cuerpo.slice(0, 300).replace(/\s+/g, ' ');
      if (res.status === 401 || res.status === 403) {
        throw new Error(`${etiqueta}: la API rechazó la clave (${res.status}). Revisa ASSEMBLYAI_API_KEY. ${detalle}`);
      }
      if (res.status === 402 || /credit|balance|billing/i.test(detalle)) {
        throw new Error(`${etiqueta}: la cuenta no tiene créditos o saldo (${res.status}). ${detalle}`);
      }
      if (res.status === 429 || res.status >= 500) {
        ultimo = new Error(`${etiqueta}: HTTP ${res.status}. ${detalle}`);
      } else {
        throw new Error(`${etiqueta}: HTTP ${res.status}. ${detalle}`);
      }
    } catch (e) {
      if (/rechazó la clave|no tiene créditos|HTTP 4\d\d/.test(e.message)) throw e;
      ultimo = e.message.startsWith(etiqueta) ? e : new Error(`${etiqueta}: error de red (${e.cause?.code || e.message})`);
    }
    if (n < intentos) {
      const espera = 2000 * 2 ** (n - 1);
      console.error(`  ${etiqueta} falló (${ultimo.message}). Reintento ${n}/${intentos - 1} en ${espera / 1000}s`);
      await dormir(espera);
    }
  }
  throw ultimo;
}

async function subir(audio, clave) {
  const tam = fs.statSync(audio).size;
  console.error(`Subiendo ${path.basename(audio)} (${(tam / 1048576).toFixed(1)} MB)...`);
  // Cada intento reabre el archivo, porque un stream consumido no se puede reenviar.
  const intentos = 3;
  let ultimo;
  for (let n = 1; n <= intentos; n++) {
    try {
      const res = await pedir(
        `${API}/upload`,
        {
          method: 'POST',
          headers: { authorization: clave, 'content-type': 'application/octet-stream' },
          body: fs.createReadStream(audio),
          duplex: 'half',
        },
        'Subida',
        1
      );
      const json = await res.json();
      if (!json.upload_url) throw new Error('Subida: la respuesta no trae upload_url');
      return json.upload_url;
    } catch (e) {
      ultimo = e;
      if (/rechazó la clave|no tiene créditos|HTTP 4\d\d/.test(e.message) || n === intentos) break;
      console.error(`  ${e.message}. Reintento ${n}/${intentos - 1}`);
      await dormir(3000 * n);
    }
  }
  throw ultimo;
}

function hora(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const p = (x) => String(x).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(ss)}` : `${p(m)}:${p(ss)}`;
}

function aMarkdown(res, nombre) {
  const dur = res.audio_duration ? `${Math.round(res.audio_duration)} s` : 'sin dato';
  const lineas = [`# Transcripción ${nombre}`, '', `Duración del audio: ${dur}. Idioma: ${res.language_code || 'sin dato'}.`, '',
    '> Las letras de hablante (A, B...) las asigna el diarizador. Verifica a quién corresponde cada una antes de analizar.', ''];
  if (Array.isArray(res.utterances) && res.utterances.length) {
    for (const u of res.utterances) lineas.push(`**[${hora(u.start)}] Hablante ${u.speaker}.** ${u.text}`, '');
  } else {
    lineas.push('(La API no devolvió utterances. Texto plano sin hablantes.)', '', res.text || '(sin texto)');
  }
  return lineas.join('\n');
}

async function main() {
  const o = leerArgs(process.argv.slice(2));
  const clave = process.env.ASSEMBLYAI_API_KEY;
  if (!clave) uso('define la variable de entorno ASSEMBLYAI_API_KEY (ver docs/DIARIZAR-ENTREVISTAS.md)');
  if (!fs.existsSync(o.audio) || !fs.statSync(o.audio).isFile()) uso(`no existe el archivo ${o.audio}`);

  const base = o.nombre || path.basename(o.audio, path.extname(o.audio));
  const carpeta = path.resolve(o.salida || path.dirname(path.resolve(o.audio)));
  fs.mkdirSync(carpeta, { recursive: true });

  const urlAudio = await subir(o.audio, clave);

  const cuerpo = { audio_url: urlAudio, speaker_labels: true, language_code: o.idioma, speech_models: [o.modelo] };
  if (o.disfluencias) cuerpo.disfluencies = true; // conserva eh, mm. Puede no estar disponible en todos los idiomas
  if (Number.isInteger(o.hablantes) && o.hablantes > 0) cuerpo.speakers_expected = o.hablantes;
  console.error('Pidiendo la transcripción con speaker_labels...');
  const r = await pedir(
    `${API}/transcript`,
    { method: 'POST', headers: { authorization: clave, 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) },
    'Pedido de transcripción'
  );
  const { id } = await r.json();
  if (!id) throw new Error('La API no devolvió el id de la transcripción');

  const limite = Date.now() + o.esperaMax * 60000;
  let res;
  for (;;) {
    const p = await pedir(`${API}/transcript/${id}`, { headers: { authorization: clave } }, 'Consulta de estado');
    res = await p.json();
    if (res.status === 'completed') break;
    if (res.status === 'error') throw new Error(`La transcripción falló en AssemblyAI: ${res.error || 'sin detalle'}. Id ${id}`);
    if (Date.now() > limite) throw new Error(`Pasaron ${o.esperaMax} minutos sin terminar. Id ${id}, puedes consultarlo después`);
    console.error(`  estado ${res.status}, vuelvo a mirar en 5 s`);
    await dormir(5000);
  }

  const jsonOut = path.join(carpeta, `${base}.diarizado.json`);
  const mdOut = path.join(carpeta, `${base}.transcripcion.md`);
  fs.writeFileSync(jsonOut, JSON.stringify(res, null, 2), 'utf8');
  fs.writeFileSync(mdOut, aMarkdown(res, base), 'utf8');

  const hablantes = new Set((res.utterances || []).map((u) => u.speaker));
  console.log(`Listo. Hablantes detectados: ${hablantes.size} (${[...hablantes].join(', ') || 'ninguno'}).`);
  console.log(`JSON:  ${jsonOut}`);
  console.log(`Texto: ${mdOut}`);
  console.log(`Id de la transcripción: ${id}`);
}

main().catch((e) => {
  console.error(`\nError: ${e.message}`);
  process.exit(1);
});
