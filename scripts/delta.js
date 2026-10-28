#!/usr/bin/env node
/**
 * Barrido delta. Muestra solo lo nuevo respecto del barrido anterior y lo cruza
 * contra tu tracker por la palabra distintiva de la empresa.
 *
 * Uso:
 *   node scripts/delta.js <actual.json> [anterior.json] [--tracker tracker.md] [--json]
 *
 * Los JSON son la salida de getonbrd-sweep.js --json (o cualquier lista de objetos
 * con titulo, empresa y url). Sin archivo anterior, todo cuenta como nuevo.
 *
 * Qué marca:
 *   NUEVO              no estaba en el barrido anterior y la empresa no aparece en el tracker
 *   EMPRESA CONOCIDA   la empresa ya está en el tracker. No se descarta sola, compara el título
 *                      contra los cargos ya registrados de esa empresa antes de decidir
 *
 * Avisa además si el archivo actual parece viejo (más de 12 horas) o si los dos
 * archivos son idénticos, que casi siempre significa que el barrido no corrió.
 */

const fs = require('fs');

const SUFIJOS = /\b(spa|s\.?a\.?|ltda|limitada|sas|s\.?l\.?|inc|llc|ltd|corp|gmbh|eirl|sociedad|anonima|grupo|group|chile|latam|argentina|mexico|peru|colombia|holding|consulting|consultores|servicios|tecnologia|technologies|technology|tech|solutions|soluciones|digital|the|de|del|y|and)\b/g;

function sinTildes(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// "GRUPO ACME CHILE SPA" -> ["acme"]. Las palabras de 3 letras o menos solo cuentan si son la única.
function palabrasDistintivas(empresa) {
  const limpias = sinTildes(empresa).replace(/[^a-z0-9 ]+/g, ' ').replace(SUFIJOS, ' ').split(/\s+/).filter(Boolean);
  const largas = limpias.filter((p) => p.length > 3);
  return largas.length ? largas : limpias;
}

function clave(a) {
  if (a.id) return `id:${a.id}`;
  return `tc:${sinTildes(a.titulo).replace(/\W+/g, ' ').trim()}|${sinTildes(a.empresa).replace(/\W+/g, ' ').trim()}`;
}

function leerJson(ruta) {
  const datos = JSON.parse(fs.readFileSync(ruta, 'utf8'));
  return Array.isArray(datos) ? datos : datos.avisos || datos.data || [];
}

// Lee la primera y segunda columna de cada tabla markdown, o de un CSV con columnas empresa y cargo.
function leerTracker(ruta) {
  const filas = [];
  const texto = fs.readFileSync(ruta, 'utf8');
  if (ruta.endsWith('.csv')) {
    const [cab, ...resto] = texto.split(/\r?\n/).filter(Boolean);
    const cols = cab.split(',').map((c) => sinTildes(c.trim()));
    const ie = cols.indexOf('empresa'), ic = cols.indexOf('cargo');
    for (const l of resto) { const c = l.split(','); filas.push({ empresa: c[ie], cargo: c[ic] }); }
    return filas;
  }
  for (const l of texto.split(/\r?\n/)) {
    if (!l.startsWith('|') || /^\|\s*-/.test(l)) continue;
    const c = l.split('|').slice(1, -1).map((x) => x.replace(/\*\*/g, '').trim());
    // Salta encabezados, filas del resumen del embudo ("1. Cargos analizados"), fechas y marcadores de plantilla.
    if (!c[0] || /^\d/.test(c[0]) || /^(empresa|etapa|familia|fecha|portal)/i.test(c[0]) || c[0].startsWith('<')) continue;
    filas.push({ empresa: c[0], cargo: c[1] || '' });
  }
  return filas;
}

function main() {
  const args = process.argv.slice(2);
  const i = args.indexOf('--tracker');
  const rutaTracker = i >= 0 ? args[i + 1] : null;
  const comoJson = args.includes('--json');
  const posicionales = args.filter((a, k) => !a.startsWith('--') && args[k - 1] !== '--tracker');
  const [rutaActual, rutaAnterior] = posicionales;
  if (!rutaActual) {
    console.error('uso: node scripts/delta.js <actual.json> [anterior.json] [--tracker tracker.md] [--json]');
    process.exit(2);
  }

  const avisos = [];
  const st = fs.statSync(rutaActual);
  const horas = (Date.now() - st.mtimeMs) / 3600000;
  if (horas > 12) avisos.push(`el archivo actual tiene ${Math.round(horas)} horas. ¿Corriste el barrido de hoy?`);

  const actual = leerJson(rutaActual);
  const anterior = rutaAnterior ? leerJson(rutaAnterior) : [];
  if (rutaAnterior && fs.readFileSync(rutaActual, 'utf8') === fs.readFileSync(rutaAnterior, 'utf8')) {
    avisos.push('los dos archivos son idénticos. Lo más probable es que estés comparando una salida vieja.');
  }

  const previas = new Set(anterior.map(clave));
  const tracker = rutaTracker ? leerTracker(rutaTracker) : [];
  const indice = tracker.map((f) => ({ ...f, palabras: palabrasDistintivas(f.empresa) }));

  const nuevos = actual.filter((a) => !previas.has(clave(a))).map((a) => {
    const mias = palabrasDistintivas(a.empresa);
    const previosEmpresa = indice.filter((f) => f.palabras.some((p) => mias.includes(p)));
    return { ...a, estadoDelta: previosEmpresa.length ? 'EMPRESA CONOCIDA' : 'NUEVO', enTracker: previosEmpresa.map((f) => `${f.empresa} / ${f.cargo}`) };
  });

  if (comoJson) {
    console.log(JSON.stringify({ total: actual.length, anterior: anterior.length, nuevos, avisos }, null, 2));
    return;
  }

  console.log(`\n${actual.length} avisos en el barrido actual, ${anterior.length} en el anterior, ${nuevos.length} nuevos\n`);
  for (const a of nuevos) {
    console.log(`${a.estadoDelta.padEnd(16)} ${a.publicado || '          '}  ${a.titulo} · ${a.empresa || 'sin empresa'}`);
    for (const t of a.enTracker) console.log(`                 ya en tracker. ${t}. Compara el título antes de descartar`);
    if (a.url) console.log(`                 ${a.url}`);
  }
  for (const m of avisos) console.log(`\nATENCIÓN. ${m}`);
  console.log('');
}

main();
