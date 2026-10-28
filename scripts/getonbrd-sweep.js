#!/usr/bin/env node
/**
 * Barrido de la API pública de Get on Board.
 *
 * Recorre una lista de términos, pagina cada uno hasta agotarlo, deduplica por
 * id y ordena por fecha de publicación descendente.
 *
 * La API de Get on Board hace búsqueda de texto completo, así que acá conviene
 * buscar por stack (n8n, LangChain, RAG). En LinkedIn es al revés, ver LECCIONES.md.
 *
 * Uso:
 *   node scripts/getonbrd-sweep.js
 *   node scripts/getonbrd-sweep.js "AI engineer" "n8n"
 *   node scripts/getonbrd-sweep.js --json > barridos/gob-2026-03-12.json
 *   node scripts/getonbrd-sweep.js --config portales.json --dias 15
 *
 * Opciones:
 *   --json            salida JSON por stdout, el reporte va por stderr
 *   --config <ruta>   lee términos y ventana desde un portales.json (por defecto portales.json si existe)
 *   --dias <n>        solo avisos publicados en los últimos n días (0 = sin filtro)
 *   --incluir-pool    no excluye los avisos que la plataforma marca como talent pool
 *
 * Un término bloqueado (403, 429 o error de red) se reintenta con pausa. Si sigue
 * fallando se informa al final como BLOQUEADO, nunca como "0 avisos".
 */

const fs = require('fs');

const TERMINOS_POR_DEFECTO = [
  'inteligencia artificial',
  'automatizacion',
  'automatizador',
  'agentes IA',
  'n8n',
  'AI engineer',
  'AI automation',
  'AI agent',
  'automation engineer',
  'LLM engineer',
  'AI Specialist',
  'Forward Deployed Engineer',
  'transformacion digital',
  'AI Solutions Lead',
];

const API = 'https://www.getonbrd.com/api/v0/search/jobs';

function leerConfig(ruta) {
  if (!ruta || !fs.existsSync(ruta)) return {};
  const cfg = JSON.parse(fs.readFileSync(ruta, 'utf8'));
  const gob = cfg.getonbrd || {};
  const t = gob.terminos;
  const terminos = Array.isArray(t) ? t : t && typeof t === 'object' ? Object.values(t).flat() : null;
  return {
    terminos,
    porPagina: gob.porPagina,
    maxPaginas: gob.maxPaginas,
    dias: cfg.ventanaDias,
    intentos: cfg.reintentos?.intentos,
    pausa: cfg.reintentos?.pausaSegundos,
  };
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function pedirPagina(url, intentos, pausaSeg) {
  let ultimo = '';
  for (let i = 1; i <= intentos; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'applyos/1.1' } });
      if (res.ok) return { data: await res.json() };
      ultimo = `HTTP ${res.status}`;
      if (res.status !== 403 && res.status !== 429 && res.status < 500) return { error: ultimo };
    } catch (err) {
      ultimo = err.message;
    }
    if (i < intentos) await esperar(pausaSeg * 1000);
  }
  return { error: ultimo };
}

async function buscarTermino(termino, o) {
  const encontrados = [];
  let paginas = 0;
  for (let pagina = 1; pagina <= o.maxPaginas; pagina++) {
    const url = `${API}?query=${encodeURIComponent(termino)}&per_page=${o.porPagina}&page=${pagina}`;
    const { data, error } = await pedirPagina(url, o.intentos, o.pausa);
    if (error) return { encontrados, paginas, error: `página ${pagina}, ${error}` };
    paginas = pagina;
    const lote = data.data || [];
    encontrados.push(...lote);
    // Si vino menos que el tope, esta era la última página.
    if (lote.length < o.porPagina) return { encontrados, paginas };
  }
  // Llegó al máximo de páginas con la última llena. Puede haber más avisos.
  return { encontrados, paginas, tope: true };
}

/**
 * La respuesta del endpoint de búsqueda no siempre trae el nombre de la empresa
 * expandido, pero el slug de la URL pública sí lo contiene. Ej:
 *   /jobs/ai-automation-engineer-acme-remote  ->  acme
 * Se recorta el título por delante y los sufijos de ubicación por detrás.
 */
function empresaDesdeUrl(url, titulo) {
  if (!url) return null;
  const slug = url.split('/jobs/')[1];
  if (!slug) return null;

  const tituloSlug = (titulo || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  let resto = slug.startsWith(tituloSlug) ? slug.slice(tituloSlug.length) : slug;
  resto = resto.replace(/^-/, '');

  // Cola típica: ubicación y un hash corto opcional.
  const cola = /-(remote|santiago|las-condes|chile|peru|mexico|colombia|argentina|uruguay|quito|bogota|lima|south-america|us-remote|araucania|montevideo)(-.*)?$/;
  resto = resto.replace(cola, '');
  resto = resto.replace(/-[0-9a-f]{4}$/, '');

  return resto ? resto.replace(/-/g, ' ') : null;
}

function normalizar(job) {
  const a = job.attributes || {};
  const url = job.links?.public_url;
  const empresa = a.company?.data?.attributes?.name || empresaDesdeUrl(url, a.title);
  const seniority = a.seniority?.data?.attributes?.name || null;
  const rechazo = Array.isArray(a.rejected_reasons) ? a.rejected_reasons : a.rejected_reasons ? [a.rejected_reasons] : [];

  return {
    id: job.id,
    titulo: a.title,
    empresa,
    categoria: a.category_name,
    seniority,
    remoto: a.remote,
    zonaRemota: a.remote_zone || null,
    // Ojo. "countries" suele traer solo ["Remote"] aunque el aviso tenga restricción de país real.
    // La restricción verdadera se confirma leyendo la página pública del aviso.
    paises: a.countries || null,
    salarioMin: a.min_salary,
    salarioMax: a.max_salary,
    publicado: a.published_at ? new Date(a.published_at * 1000).toISOString().slice(0, 10) : null,
    postulaciones: a.applications_count ?? null,
    talentPool: rechazo.length > 0,
    url,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const valor = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : undefined; };
  const comoJson = args.includes('--json');
  const incluirPool = args.includes('--incluir-pool');
  const rutaConfig = valor('--config') || (fs.existsSync('portales.json') ? 'portales.json' : null);
  const cfg = leerConfig(rutaConfig);
  const conValor = new Set(['--config', '--dias']);
  const terminosCli = args.filter((a, i) => !a.startsWith('--') && !conValor.has(args[i - 1]));

  const o = {
    porPagina: cfg.porPagina || 30,
    maxPaginas: cfg.maxPaginas || 5,
    intentos: cfg.intentos || 2,
    pausa: cfg.pausa ?? 8,
  };
  const diasArg = valor('--dias');
  const dias = diasArg !== undefined ? Number(diasArg) : cfg.dias || 0;
  const terminos = terminosCli.length ? terminosCli : cfg.terminos?.length ? cfg.terminos : TERMINOS_POR_DEFECTO;

  const vistos = new Map();
  const reporte = [];

  for (const termino of terminos) {
    if (!comoJson) process.stderr.write(`buscando "${termino}"...\n`);
    const r = await buscarTermino(termino, o);
    reporte.push({ termino, total: r.encontrados.length, paginas: r.paginas, error: r.error, tope: r.tope });
    for (const job of r.encontrados) {
      if (!vistos.has(job.id)) vistos.set(job.id, normalizar(job));
    }
  }

  const corte = dias > 0 ? new Date(Date.now() - dias * 86400000).toISOString().slice(0, 10) : null;
  let todos = [...vistos.values()];
  const fueraDeVentana = corte ? todos.filter((a) => a.publicado && a.publicado < corte).length : 0;
  if (corte) todos = todos.filter((a) => !a.publicado || a.publicado >= corte);
  const pool = todos.filter((a) => a.talentPool).length;
  if (!incluirPool) todos = todos.filter((a) => !a.talentPool);

  const avisos = todos.sort((a, b) => (b.publicado || '').localeCompare(a.publicado || ''));

  // Reporte por término. Cuántos trajo y hasta qué página llegó. Va por stderr para no ensuciar el JSON.
  const bloqueados = reporte.filter((r) => r.error);
  const resumen = [
    '',
    'REPORTE POR TÉRMINO (resultados, páginas leídas)',
    ...reporte.map((r) => `  ${r.error ? 'BLOQUEADO' : 'ok       '}  ${String(r.total).padStart(4)}  p${r.paginas}  ${r.termino}${r.error ? `  (${r.error})` : ''}${r.tope ? '  (TOPE de páginas, puede haber más. Sube maxPaginas o usa términos más específicos)' : ''}`),
    corte ? `ventana de ${dias} días, ${fueraDeVentana} avisos fuera de ventana excluidos` : 'sin filtro de ventana',
    `${pool} avisos marcados como talent pool ${incluirPool ? 'incluidos' : 'excluidos'}`,
    bloqueados.length
      ? `ATENCIÓN. ${bloqueados.length} término(s) bloqueado(s). No significa "no hay avisos". Reintenta más tarde o revisa a mano.`
      : 'sin bloqueos',
    '',
  ].join('\n');

  if (comoJson) {
    process.stderr.write(resumen);
    console.log(JSON.stringify(avisos, null, 2));
    return;
  }

  console.log(`\n${avisos.length} avisos únicos, ${terminos.length} términos\n`);
  for (const a of avisos) {
    const salario = a.salarioMin ? `USD ${a.salarioMin}-${a.salarioMax}` : 'sin publicar';
    const donde = a.remoto ? 'remoto' : 'presencial';
    console.log(`${a.publicado}  ${a.titulo}`);
    console.log(`            ${a.empresa || 'sin empresa'} · ${a.categoria} · ${donde} · ${salario}`);
    console.log(`            ${a.url}\n`);
  }
  console.log(resumen);
}

main().catch((err) => {
  process.stderr.write(`error: ${err.stack}\n`);
  process.exit(1);
});
