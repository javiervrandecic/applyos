# applyOS

Sistema de búsqueda de empleo asistido por IA. Barre varios portales, analiza el calce real de cada aviso contra tu perfil leyendo la descripción completa en vez del título, y te entrega un reporte en formato embudo para saber en qué etapa se te cae cada proceso.

Corre sobre [Claude Code](https://claude.com/claude-code) como skill, más un par de scripts en Node y PowerShell.

> **applyOS es una plantilla.** Tu perfil, tu tracker, tus CVs y tus barridos viven fuera del repo, en tu propia carpeta de búsqueda, y los archivos donde irían están en el `.gitignore`. Lo que se comparte acá es el sistema, nunca los datos de nadie.

> **Por qué existe.** Buscar trabajo a mano no escala. Revisar 600 avisos, decidir cuáles valen la pena y adaptar el CV a cada uno es un trabajo de tiempo completo sin sueldo. Y peor, lo haces a ciegas. No sabes si el problema es tu perfil, el mercado o el canal.

### 👉 [Empieza acá. Guía paso a paso](GUIA.md)  ·  [Requisitos](REQUISITOS.md)  ·  [Cambios](CHANGELOG.md)

---

## El barrido

Un término, 59 avisos únicos, deduplicados y ordenados por fecha. Sin llaves de API.

![Salida del barrido de Get on Board](docs/barrido.png)

## El reporte de embudo

Cada etapa con su conversión respecto de la anterior, más el pipeline vivo con los días sin movimiento y la próxima acción de cada proceso. Se exporta a PDF.

![Dashboard del embudo](docs/dashboard.png)

*(Datos de ejemplo.)*

---

## Qué hace

**Barre los portales.** Get on Board vía API, LinkedIn, Computrabajo y portales locales. Configurable.

**Muestra solo lo nuevo.** Cada barrido se compara contra el anterior (barrido delta), así la revisión a fondo se gasta en lo que no habías visto. Y avisa cuando estás comparando contra una salida vieja, que es la forma más común de que un barrido "no encuentre nada".

**Ignora el título del aviso.** Los títulos son un desastre. En un barrido real aparecieron más de 10 nombres distintos para funciones casi idénticas (AI Specialist, Forward Deployed Engineer, GTM Engineer, Automation Engineer, AI Solutions Lead), con sueldos de USD 1.500 a 5.000 al mes sin ningún patrón. applyOS lee la descripción completa y clasifica cada aviso en una **familia de función** que tú defines.

**Verifica en dos niveles.** Descartar todo por título es rápido y caro. En una prueba, de 24 avisos descartados solo por el título, 3 escondían un calce real. Por eso hay una regla explícita de qué se puede descartar sin abrir y qué obliga a leer el detalle.

**Deduplica contra lo ya postulado.** Cruza por la palabra distintiva de la empresa, no por empresa más título exacto, porque las empresas republican el mismo cargo con nombres distintos. Y no confunde "empresa conocida" con "cargo cubierto".

**No confunde un bloqueo con un mercado vacío.** Un 403 o un 429 se reintenta con pausa y con otro método, y si sigue fallando se reporta como BLOQUEADO, nunca como cero avisos.

**Registra todo.** Cada aviso tocado deja una fila con su motivo, y cada barrido deja una fila con portales, conteos y bloqueos. Los calces sin decisión vuelven a aparecer en cada informe hasta que decidas.

**Reporta en embudo.** Analizados, postulados, contacto humano, primera entrevista, segunda entrevista. Con la conversión de cada etapa respecto de la anterior.

**Trae un escáner de secretos y datos personales.** Si vas a publicar tu propia versión, `herramientas/escanear.js` frena el commit si encuentra claves, correos, teléfonos, rutas de tu computador o nombres que tú definas.

---

## Requisitos

| Requisito | Para qué |
|---|---|
| **Node.js 22+** | los scripts de barrido, delta, escáner y PDF |
| **[Claude Code](https://claude.com/claude-code)** | análisis de calce, CVs adaptados y reporte de embudo. **Es de pago** |
| Google Chrome | solo si quieres exportar el dashboard a PDF |
| PowerShell 5.1+ | opcional, versión alternativa del barrido en Windows |

No necesitas llaves de API. Todas las fuentes son endpoints públicos.

### Qué funciona sin Claude Code

| | Solo con Node | Necesita Claude Code |
|---|---|---|
| Barrido de Get on Board | ✅ | |
| Barrido delta y cruce contra el tracker | ✅ | |
| Escáner de secretos y datos personales | ✅ | |
| Barrido de LinkedIn y portales locales | | ✅ |
| Clasificación por familias y análisis de calce | | ✅ |
| Verificación en dos niveles | | ✅ |
| CV adaptado a cada aviso | | ✅ |
| Reporte de embudo | | ✅ |
| Exportar el dashboard a PDF | ✅ | |

El barrido solo te trae avisos, y eso lo hace cualquier portal. **El valor está en lo que viene después**, y eso corre sobre Claude Code.

## Instalación

```bash
git clone https://github.com/<usuario>/applyos.git
cd applyos
npm install
```

Después sigue la [guía](GUIA.md). En corto, creas tu carpeta de búsqueda **fuera del repo**, copias ahí la skill y las plantillas, y las llenas.

```bash
cp perfil.ejemplo.md      ../mi-busqueda/perfil.md
cp portales.ejemplo.md    ../mi-busqueda/portales.md
cp portales.ejemplo.json  ../mi-busqueda/portales.json
cp tracker.ejemplo.md     ../mi-busqueda/tracker.md
cp cv/cv-maestro.ejemplo.html ../mi-busqueda/cv-maestro.html
```

**Si de todos modos trabajas dentro del repo, esos archivos están en el `.gitignore` a propósito.** Ahí van tus datos, tu expectativa de renta y tu CV. Eso no se publica nunca.

## Los archivos que tienes que llenar

**`perfil.md`** es el que más pesa. Define quién eres, **qué quieres hacer realmente** (que no es lo mismo que el título del cargo), tus no negociables, tus familias de cargo, la categoría puente si la quieres, tu movilidad y hasta dónde llega tu techo de seniority. Sin esto el barrido devuelve ruido. Mira [`perfil.ejemplo-lleno.md`](perfil.ejemplo-lleno.md), un perfil ficticio completo.

**`portales.md` y `portales.json`** definen dónde y con qué términos buscar. El `.md` es la guía para la skill, el `.json` lo leen los scripts. Vienen con LATAM configurado, pero Computrabajo funciona en 14 países cambiando el subdominio y LinkedIn es global.

**`tracker.md`** es la memoria del sistema. Procesos, descartes con motivo, decisiones pendientes, anclas de renta y registro de barridos. Es la fuente del dedup y del embudo.

**`cv-maestro.html`** es la fuente de verdad para generar cada CV adaptado. También sirve al revés, para el **análisis inverso**. En vez de preguntar si calzas con un aviso, preguntar a qué cargos calificas realmente con lo que tienes. Las reglas están en [`cv/ESTANDAR-CV.md`](cv/ESTANDAR-CV.md).

---

## Uso

```
/empleos                    # barrido completo
/empleos [término]          # agrega un término puntual al barrido
```

Los scripts también corren solos, sin Claude Code.

```bash
node scripts/getonbrd-sweep.js                                   # barrido con los términos de portales.json o los de ejemplo
node scripts/getonbrd-sweep.js --dias 15 --json > barridos/gob-2026-03-12.json
node scripts/delta.js barridos/gob-2026-03-12.json barridos/prev-2026-03-10/gob.json --tracker tracker.md
node scripts/dashboard-pdf.js dashboard/embudo.html embudo.pdf
node herramientas/escanear.js                                    # revisa el repo antes de publicar
```

---

## Estructura

```
applyos/
├─ GUIA.md                   guía paso a paso, empieza acá
├─ REQUISITOS.md             software, hardware y costos reales
├─ LECCIONES.md              los hallazgos medidos del barrido
├─ CHANGELOG.md              historia de versiones
├─ skill/empleos.md          la skill de Claude Code
├─ perfil.ejemplo.md         quién eres, qué quieres, familias, no negociables
├─ perfil.ejemplo-lleno.md   un perfil ficticio completo, para ver el nivel de detalle
├─ portales.ejemplo.md       portales por país y sus trampas
├─ portales.ejemplo.json     términos y parámetros que leen los scripts
├─ tracker.ejemplo.md        pipeline, descartes, decisiones, anclas y registro de barridos
├─ cv/
│  ├─ cv-maestro.ejemplo.html   plantilla de CV compatible con filtros ATS
│  └─ ESTANDAR-CV.md            tailoring, palabras clave sin mentir, formato y análisis inverso
├─ entrevistas/
│  ├─ PREPARACION.md            qué hacer antes de cada entrevista
│  ├─ GRABACION.md              grabar sin ser admin de la reunión, y transcribir
│  ├─ EVALUACION.md             cómo evaluarte después, con métricas duras
│  └─ LECCIONES-ENTREVISTAS.ejemplo.md   tus patrones acumulados
├─ dashboard/embudo.ejemplo.html
├─ herramientas/
│  ├─ escanear.js               escáner de secretos y datos personales
│  └─ pre-commit                hook que corre el escáner antes de cada commit
└─ scripts/
   ├─ getonbrd-sweep.js  ·  getonbrd-sweep.ps1
   ├─ delta.js                  barrido delta y cruce contra el tracker
   ├─ dashboard-pdf.js
   └─ linkedin-sweep.md
```

---

## El ciclo no termina cuando envías el CV

Buscar trabajo tiene dos mitades y casi todas las herramientas cubren solo la primera.

**La primera mitad se automatiza.** Barrer, filtrar, deduplicar, adaptar el CV. Es volumen y criterio repetible.

**La segunda no.** Prepararte para una entrevista, evaluarte honestamente después, y convertir eso en un cambio de comportamiento concreto. Esa mitad es donde se decide si consigues el trabajo, y es la que la mayoría hace de memoria y a ojo.

Por eso el repo trae [`entrevistas/PREPARACION.md`](entrevistas/PREPARACION.md), [`entrevistas/GRABACION.md`](entrevistas/GRABACION.md) y [`entrevistas/EVALUACION.md`](entrevistas/EVALUACION.md). El tercero tiene el método completo. Separar el resultado del proceso de la calidad de tus respuestas, sacar métricas duras del transcript, y las trampas de pedirle a una IA que te evalúe.

---

## Lee esto antes de escribir tu propia versión

[`LECCIONES.md`](LECCIONES.md) tiene los hallazgos medidos que hacen que un barrido funcione o no sirva para nada. Entre ellos, por qué buscar por stack en LinkedIn no encuentra nada, por qué `location=Remote` no significa remoto, cuánto cuesta una ventana de 7 días, y por qué un cero en un portal casi nunca es un cero.

Si vas a construir algo parecido, esa página te ahorra semanas.

---

## Si publicas tu propia versión

Antes de subir un fork con tus cambios, corre el escáner e instala el hook para que lo haga solo.

```bash
cp herramientas/pre-commit .git/hooks/pre-commit
```

Tu lista de nombres prohibidos y la ruta a tus archivos de claves se configuran con variables de entorno o con archivos fuera del repo. Nunca dentro. El detalle está en la [guía](GUIA.md#publicar-tu-propia-versión-sin-filtrar-datos).

---

## Estado

Proyecto en uso real. No es un producto ni pretende serlo. Los portales configurados son de LATAM, pero la arquitectura sirve para cualquier mercado cambiando las fuentes.

Si lo adaptas a tu país, le agregas un portal o encuentras algo que se pueda mejorar, los issues y los PR son bienvenidos.

---

## Licencia

MIT
