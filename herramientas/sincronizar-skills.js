#!/usr/bin/env node
/**
 * Mantiene al día las copias que viven dentro de las skills.
 *
 * Las skills empaquetan sus propios scripts y referencias para poder instalarse
 * copiando una carpeta. Los archivos originales siguen en la raíz del repo
 * (scripts/, cv/, entrevistas/, docs/). Este script copia de la raíz a las skills.
 *
 * Uso:
 *   node herramientas/sincronizar-skills.js            copia
 *   node herramientas/sincronizar-skills.js --verificar  no copia, sale con 1 si hay diferencias
 *
 * Los scripts nuevos (diarizar.js, metricas.js) viven directo en la skill y no se sincronizan.
 */

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const S = '.claude/skills';

const PARES = [
  ['scripts/getonbrd-sweep.js', `${S}/applyos-busqueda/scripts/getonbrd-sweep.js`],
  ['scripts/getonbrd-sweep.ps1', `${S}/applyos-busqueda/scripts/getonbrd-sweep.ps1`],
  ['scripts/delta.js', `${S}/applyos-busqueda/scripts/delta.js`],
  ['scripts/linkedin-sweep.md', `${S}/applyos-busqueda/scripts/linkedin-sweep.md`],
  ['skill/empleos.md', `${S}/applyos-busqueda/references/metodologia-completa.md`],
  ['LECCIONES.md', `${S}/applyos-busqueda/references/lecciones-busqueda.md`],
  ['perfil.ejemplo.md', `${S}/applyos-busqueda/assets/perfil.ejemplo.md`],
  ['portales.ejemplo.md', `${S}/applyos-busqueda/assets/portales.ejemplo.md`],
  ['portales.ejemplo.json', `${S}/applyos-busqueda/assets/portales.ejemplo.json`],
  ['tracker.ejemplo.md', `${S}/applyos-busqueda/assets/tracker.ejemplo.md`],
  ['cv/ESTANDAR-CV.md', `${S}/applyos-postulacion/references/estandar-cv.md`],
  ['cv/cv-maestro.ejemplo.html', `${S}/applyos-postulacion/assets/cv-maestro.ejemplo.html`],
  ['entrevistas/PREPARACION.md', `${S}/applyos-entrevista/references/preparacion.md`],
  ['entrevistas/EVALUACION.md', `${S}/applyos-entrevista/references/evaluacion.md`],
  ['entrevistas/GRABACION.md', `${S}/applyos-entrevista/references/grabacion.md`],
  ['entrevistas/LECCIONES-ENTREVISTAS.ejemplo.md', `${S}/applyos-entrevista/references/lecciones.ejemplo.md`],
  ['docs/DIARIZAR-ENTREVISTAS.md', `${S}/applyos-entrevista/references/diarizar.md`],
  ['scripts/dashboard-pdf.js', `${S}/applyos-embudo/scripts/dashboard-pdf.js`],
  ['dashboard/embudo.ejemplo.html', `${S}/applyos-embudo/assets/embudo.ejemplo.html`],
];

const verificar = process.argv.includes('--verificar');
let difieren = 0;

for (const [origen, destino] of PARES) {
  const o = path.join(RAIZ, origen);
  const d = path.join(RAIZ, destino);
  if (!fs.existsSync(o)) {
    console.error(`FALTA el original ${origen}`);
    difieren++;
    continue;
  }
  const igual = fs.existsSync(d) && fs.readFileSync(o).equals(fs.readFileSync(d));
  if (igual) continue;
  difieren++;
  if (verificar) {
    console.log(`DIFIERE ${destino}`);
  } else {
    fs.mkdirSync(path.dirname(d), { recursive: true });
    fs.copyFileSync(o, d);
    console.log(`copiado ${destino}`);
  }
}

if (verificar) {
  console.log(difieren ? `${difieren} archivo(s) desactualizado(s). Corre node herramientas/sincronizar-skills.js` : 'Las skills están al día.');
  process.exit(difieren ? 1 : 0);
}
console.log(difieren ? `${difieren} archivo(s) actualizado(s).` : 'Nada que copiar, las skills ya estaban al día.');
