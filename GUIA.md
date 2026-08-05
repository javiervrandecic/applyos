# Guía de instalación y uso

De cero a tu primer barrido. Si sigues los pasos en orden no deberías tener problemas.

Hay **dos caminos**. Empieza por el rápido para confirmar que todo funciona, y después arma el completo.

| | Camino rápido | Camino completo |
|---|---|---|
| Qué necesitas | Node.js | Node.js + Claude Code |
| Qué obtienes | El barrido de Get on Board | Barrido de todos los portales, análisis de calce, CVs adaptados y el reporte de embudo |
| Cuánto demora | 2 minutos | 20 minutos |
| Costo | gratis | Claude Code es de pago |

**Recomendación honesta.** El camino completo es donde está el valor. El barrido solo te trae avisos, y avisos los trae cualquier portal. Lo que ahorra tiempo de verdad es que algo lea la descripción completa de cada uno, la compare con tu perfil y te diga dónde está el calce y dónde el hueco. Eso lo hace Claude Code.

---

# Camino rápido, 2 minutos

## 1. Instala Node.js

Necesitas **Node 22 o superior**. Descárgalo de [nodejs.org](https://nodejs.org). Para verificar:

```bash
node --version
```

Tiene que decir `v22.x.x` o mayor. Si dice v20 o menos, el barrido va a funcionar pero el generador de PDF no.

## 2. Descarga el repo

```bash
git clone https://github.com/ubermancl/applyos.git
cd applyos
npm install
```

Si no tienes git, baja el ZIP desde el botón verde **Code** de GitHub y descomprímelo.

`npm install` instala una sola dependencia, y solo la necesita el generador de PDF.

## 3. Corre tu primer barrido

```bash
node scripts/getonbrd-sweep.js "AI engineer"
```

**Deberías ver** algo así:

```
buscando "AI engineer"...

38 avisos únicos, 1 términos

2026-08-05  Senior AI & Agentic Engineer
            artefact · Machine Learning & AI · remoto · USD 5000-5000
            https://www.getonbrd.com/jobs/senior-ai-agentic-engineer-artefact-us-remote
```

Si ves eso, funciona. Prueba con tus propios términos:

```bash
node scripts/getonbrd-sweep.js "n8n" "automatizacion" "AI automation"
```

Y para guardarlo:

```bash
node scripts/getonbrd-sweep.js --json > resultados.json
```

En Windows sin Node puedes usar la versión en PowerShell:

```powershell
.\scripts\getonbrd-sweep.ps1
```

---

# Camino completo, 20 minutos

## 4. Instala Claude Code

Sigue las instrucciones de [claude.com/claude-code](https://claude.com/claude-code). Es una herramienta de terminal, no una web.

Cuando esté, verifica:

```bash
claude --version
```

## 5. Crea tu carpeta de búsqueda

**Importante. no trabajes dentro del repo.** El repo es la plantilla, tu búsqueda es otra cosa y tiene tus datos.

```bash
mkdir mi-busqueda
cd mi-busqueda
mkdir -p .claude/commands
```

Copia la skill y las plantillas desde el repo:

```bash
cp ../applyos/skill/empleos.md          .claude/commands/
cp ../applyos/perfil.example.md         perfil.md
cp ../applyos/portales.example.md       portales.md
cp ../applyos/tracker.example.md        tracker.md
cp ../applyos/cv/cv-maestro.example.html cv-maestro.html
cp ../applyos/cv/ESTANDAR-CV.md         .
```

## 6. Llena `perfil.md`

**Este es el paso que decide si el sistema sirve o no.** Si lo llenas a medias, el barrido te va a devolver ruido y vas a pensar que no funciona.

Mira [`perfil.ejemplo-lleno.md`](perfil.ejemplo-lleno.md) para ver cómo se ve uno completo antes de escribir el tuyo.

Las cuatro secciones que más pesan:

**Qué quieres hacer realmente.** No el título del cargo, la función. "Conectar negocio con tecnología" es distinto de "programar", aunque los dos avisos digan "AI Engineer".

**No negociables.** Qué ambiente te desgasta, qué no vas a hacer. Sin esto vas a llegar a la tercera entrevista de algo que nunca ibas a aceptar.

**Zonas de calce.** Los títulos donde eres candidato natural, los que requieren explicar un puente, y los que son SKIP en bloque. Sé específico. "Data Scientist que pida PhD" es útil, "cargos técnicos" no.

**El límite superior.** Hasta qué nivel de seniority tiene sentido postular. Definir el techo evita quemar tiempo en cargos que piden 10 años cuando tienes 4.

## 7. Llena `portales.md`

Viene configurado para Chile y LATAM. Si buscas en otro país:

- **Get on Board** ya cubre todo LATAM, no toques nada
- **LinkedIn** cambia el valor de `location` por tu país en inglés
- **Computrabajo** cambia el subdominio. `mx`, `co`, `pe`, `ar`, `es`... están los 14 listados en el archivo
- **Portal local** agrega el de tu país. Hay una tabla con los más comunes

## 8. Llena tu CV maestro

`cv-maestro.html` es la fuente desde la que se genera cada versión adaptada. Léelo junto con `ESTANDAR-CV.md`, que explica por qué el formato es así (los filtros ATS leen mal las tablas y las columnas).

Regla que no conviene romper. **el nivel que declaras es el nivel real.** Hay cargos donde intermedio alcanza perfecto.

## 9. Corre tu primer análisis

Abre Claude Code en la carpeta:

```bash
cd mi-busqueda
claude
```

Y escribe:

```
/empleos
```

La primera vez va a demorar varios minutos. Barre los portales, deduplica, verifica los prometedores en detalle y te presenta los que calzan ordenados por zona.

**Qué esperar.** De un barrido de 80 a 100 avisos, normalmente sobreviven entre 2 y 5. Si te devuelve 30 candidatos, tu `perfil.md` está demasiado permisivo. Si te devuelve cero varias veces seguidas, está demasiado estricto o tus zonas de calce no coinciden con cómo el mercado nombra los cargos.

## 10. Prepara una postulación

Cuando te muestre los resultados, respondes con el número. Va a leer el aviso completo, hacer el análisis de calce a fondo con los huecos reales, y si le dices que sí, genera el CV adaptado.

## 11. Cuando te llamen a entrevista

Acá empieza la mitad que ninguna herramienta cubre y donde de verdad se decide si consigues el trabajo.

**Antes.** Lee [`entrevistas/PREPARACION.md`](entrevistas/PREPARACION.md) completo. Sí, cada vez.

**Durante.** Deja la grabación corriendo. Como casi nunca eres el administrador de la reunión, la grabación de la plataforma no está disponible para ti. [`entrevistas/GRABACION.md`](entrevistas/GRABACION.md) explica cómo grabar tu micrófono y el audio del escritorio en pistas separadas, que además te ahorra tener que diarizar después.

**Después.** Aplica [`entrevistas/EVALUACION.md`](entrevistas/EVALUACION.md) el mismo día, con el transcript en mano. Los hallazgos que se repitan entre entrevistas van a `entrevistas/LECCIONES-ENTREVISTAS.md`, que se lee antes de la siguiente.

Ese ciclo es lo que convierte una serie de entrevistas perdidas en una curva de aprendizaje.

## 12. El reporte de embudo

Cada tantos días:

```
genera el reporte de embudo
```

Toma `tracker.md` y arma el dashboard. Para exportarlo a PDF:

```bash
node scripts/dashboard-pdf.js dashboard/embudo.html embudo.pdf
```

---

# Consejos para que no te vaya mal

**Corre el barrido cada 2 o 3 días, no todos los días.** Los avisos nuevos por día son pocos y vas a gastar tiempo releyendo lo mismo.

**No confíes en el título de un aviso, ni para bien ni para mal.** Está medido en [`LECCIONES.md`](LECCIONES.md). de 24 avisos descartados solo por su título, 3 escondían un calce real.

**Registra todo, incluso los descartes.** Con el motivo, aunque sea de una línea. Es lo que evita que el barrido siguiente te muestre lo mismo y que vuelvas a evaluar algo que ya descartaste.

**Postula pidiendo tu tarifa, no la del aviso.** Un sueldo bajo publicado no descarta el cargo si el calce es bueno.

**Cuando un hallazgo venga de un post de un reclutador, escríbele directo.** Convierte mucho mejor que el formulario.

---

# Problemas comunes

**`fetch is not defined`**
Node muy viejo. Necesitas 22 o superior. `node --version` para confirmar.

**`Cannot find module 'ws'`**
Falta `npm install` dentro de la carpeta del repo.

**`No se encontró Chrome`** al generar el PDF
Define la ruta a mano:
```bash
CHROME_PATH="/ruta/a/chrome" node scripts/dashboard-pdf.js dashboard/embudo.html
```

**El PDF sale con la URL y la fecha impresas en cada página**
Estás usando el flag `--print-to-pdf` de Chrome en vez del script. Ese flag no respeta la opción de quitar el encabezado. Usa `scripts/dashboard-pdf.js`, que lo hace por el protocolo de depuración.

**Un portal devuelve vacío o da error 403**
Bloqueo intermitente de scraping, le pasa sobre todo a Computrabajo. Reintenta una vez y si sigue, revísalo a mano en el navegador. No lo saltes en silencio.

**El barrido devuelve avisos que no tienen nada que ver**
Tus términos de búsqueda son muy amplios, o tus zonas de calce en `perfil.md` están mal definidas. Empieza por afinar la lista de SKIP en bloque.

**LinkedIn devuelve muy pocos resultados para una tecnología**
Es esperado y no es tu culpa. Su buscador pesa el título del cargo y no matchea bien las palabras del cuerpo del aviso. Busca tecnologías en Get on Board y títulos de cargo en LinkedIn. Lección 3.

**`/empleos` no aparece en Claude Code**
La skill tiene que estar en `.claude/commands/empleos.md` **dentro de la carpeta desde donde abriste Claude Code**, no en el repo.
