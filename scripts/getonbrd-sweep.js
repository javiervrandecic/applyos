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
 *   node scripts/getonbrd-sweep.js --json > resultados.json
 */

const TERMINOS = [
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
const PER_PAGE = 30;
const MAX_PAGINAS = 5; // corta el bucle si un término trae demasiado

async function buscarTermino(termino) {
  const encontrados = [];

  for (let pagina = 1; pagina <= MAX_PAGINAS; pagina++) {
    const url = `${API}?query=${encodeURIComponent(termino)}&per_page=${PER_PAGE}&page=${pagina}`;

    let data;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'embudo/1.0' } });
      if (!res.ok) break;
      data = await res.json();
    } catch (err) {
      process.stderr.write(`  fallo "${termino}" pagina ${pagina}: ${err.message}\n`);
      break;
    }

    const lote = data.data || [];
    encontrados.push(...lote);

    // Si vino menos que el tope, esta era la ultima pagina.
    if (lote.length < PER_PAGE) break;
  }

  return encontrados;
}

/**
 * La respuesta del endpoint de búsqueda no siempre trae el nombre de la empresa
 * expandido, pero el slug de la URL pública sí lo contiene. Ej:
 *   /jobs/ai-automation-engineer-manukora-remote  ->  manukora
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
  const cola = /-(remote|santiago|providencia|las-condes|chile|peru|mexico|colombia|argentina|uruguay|quito|bogota|lima|south-america|us-remote|araucania|montevideo)(-.*)?$/;
  resto = resto.replace(cola, '');
  resto = resto.replace(/-[0-9a-f]{4}$/, '');

  return resto ? resto.replace(/-/g, ' ') : null;
}

function normalizar(job) {
  const a = job.attributes || {};
  const url = job.links?.public_url;
  const empresa = a.company?.data?.attributes?.name || empresaDesdeUrl(url, a.title);
  const seniority = a.seniority?.data?.attributes?.name || null;

  return {
    id: job.id,
    titulo: a.title,
    empresa,
    categoria: a.category_name,
    seniority,
    remoto: a.remote,
    zonaRemota: a.remote_zone || null,
    paises: a.countries || null,
    salarioMin: a.min_salary,
    salarioMax: a.max_salary,
    publicado: a.published_at ? new Date(a.published_at * 1000).toISOString().slice(0, 10) : null,
    postulaciones: a.applications_count ?? null,
    url: job.links?.public_url,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const comoJson = args.includes('--json');
  const terminosCli = args.filter((a) => !a.startsWith('--'));
  const terminos = terminosCli.length ? terminosCli : TERMINOS;

  const vistos = new Map();

  for (const termino of terminos) {
    if (!comoJson) process.stderr.write(`buscando "${termino}"...\n`);
    const lote = await buscarTermino(termino);
    for (const job of lote) {
      if (!vistos.has(job.id)) vistos.set(job.id, normalizar(job));
    }
  }

  const avisos = [...vistos.values()].sort((a, b) =>
    (b.publicado || '').localeCompare(a.publicado || '')
  );

  if (comoJson) {
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
}

main().catch((err) => {
  process.stderr.write(`error: ${err.stack}\n`);
  process.exit(1);
});
