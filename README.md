# applyOS

Sistema de búsqueda de empleo asistido por IA. Barre varios portales, analiza el calce real de cada aviso contra tu perfil leyendo la descripción completa en vez del título, y te entrega un reporte en formato embudo para saber en qué etapa se te cae cada proceso.

Corre sobre [Claude Code](https://claude.com/claude-code) como skill, más un par de scripts en Node y PowerShell.

> **applyOS es la plantilla pública.** Mi instancia personal la llamo Embudo y es privada, porque adentro está mi perfil real y todos mis procesos. Lo que se comparte acá es el sistema, no mis datos.

> **Por qué existe.** Buscar trabajo a mano no escala. Revisar 600 avisos, decidir cuáles valen la pena y adaptar el CV a cada uno es un trabajo de tiempo completo sin sueldo. Y peor, lo haces a ciegas. no sabes si el problema es tu perfil, el mercado o el canal.

### 👉 [Empieza acá: guía paso a paso](GUIA.md)  ·  [Requisitos](REQUISITOS.md)

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

**Barre los portales.** Get on Board vía API, LinkedIn, Computrabajo y ChileTrabajos. Configurable.

**Ignora el título del aviso.** Los títulos son un desastre. En un barrido real aparecieron más de 10 nombres distintos para funciones casi idénticas (AI Specialist, Forward Deployed Engineer, GTM Engineer, Automation Engineer, AI Solutions Lead), con sueldos de USD 1.500 a 5.000 al mes sin ningún patrón. Filtrar por título te hace perder la mitad de lo que te sirve. applyOS lee la descripción completa.

**Verifica en dos niveles.** Descartar todo por título es rápido y caro. En una prueba, de 24 avisos descartados solo por el título, 3 escondían un calce real. Por eso hay una regla explícita de qué se puede descartar sin abrir y qué obliga a leer el detalle.

**Deduplica contra lo ya postulado.** Cruza por empresa, no por empresa más título exacto, porque las empresas republican el mismo cargo con nombres distintos para aparecer en más búsquedas.

**Registra todo.** Cada aviso tocado deja una fila con su motivo, aunque sea un descarte evidente. Eso es lo que protege el barrido siguiente.

**Reporta en embudo.** Analizados, postulados, contacto humano, primera entrevista, segunda entrevista. Con la conversión de cada etapa respecto de la anterior.

---

## Requisitos

| Requisito | Para qué |
|---|---|
| **Node.js 22+** | los scripts de barrido y de PDF |
| **[Claude Code](https://claude.com/claude-code)** | análisis de calce, CVs adaptados y reporte de embudo. **Es de pago** |
| Google Chrome | solo si quieres exportar el dashboard a PDF |
| PowerShell 5.1+ | opcional, versión alternativa del barrido en Windows |

No necesitas llaves de API. Todas las fuentes son endpoints públicos.

### Qué funciona sin Claude Code

| | Solo con Node | Necesita Claude Code |
|---|---|---|
| Barrido de Get on Board | ✅ | |
| Barrido de LinkedIn y portales locales | | ✅ |
| Análisis de calce contra tu perfil | | ✅ |
| Verificación en dos niveles | | ✅ |
| CV adaptado a cada aviso | | ✅ |
| Reporte de embudo | | ✅ |
| Exportar el dashboard a PDF | ✅ | |

El barrido solo te trae avisos, y eso lo hace cualquier portal. **El valor está en lo que viene después**, y eso corre sobre Claude Code.

## Instalación

```bash
git clone https://github.com/<tu-usuario>/applyos.git
cd applyos

cp perfil.example.md    perfil.md
cp portales.example.md  portales.md
cp cv/cv-maestro.example.html cv/cv-maestro.html
```

Después edita los tres, y copia `skill/empleos.md` a `.claude/commands/` de tu proyecto de Claude Code. Se invoca con `/empleos`.

**Los tres archivos que copiaste están en el `.gitignore` a propósito.** Ahí van tus datos, tu expectativa de renta y tu CV. Eso no se publica nunca.

## Los tres archivos que tienes que llenar

**`perfil.md`** es el que más pesa. Define quién eres, **qué quieres hacer realmente** (que no es lo mismo que el título del cargo), tus no negociables, tus zonas de calce y hasta dónde llega tu techo de seniority. Sin esto el barrido devuelve ruido.

**`portales.md`** define dónde buscar. Viene con Chile y LATAM configurados, pero Computrabajo funciona en 14 países cambiando el subdominio y LinkedIn es global. Si buscas en España, México o Argentina, acá lo ajustas.

**`cv/cv-maestro.html`** es la fuente de verdad para generar cada CV adaptado. También sirve al revés, para el **análisis inverso**. en vez de preguntar si calzas con un aviso, preguntar a qué cargos calificas realmente con lo que tienes. Las reglas están en [`cv/ESTANDAR-CV.md`](cv/ESTANDAR-CV.md).

---

## Uso

```
/empleos                    # barrido completo
/empleos [término]          # agrega un término puntual al barrido
```

Los scripts también corren solos, sin Claude Code:

```bash
node scripts/getonbrd-sweep.js              # barrido, salida legible
node scripts/getonbrd-sweep.js --json       # barrido, salida JSON
node scripts/dashboard-pdf.js dashboard/embudo.html embudo.pdf
```

---

## Estructura

```
applyos/
├─ GUIA.md                   guia paso a paso, empieza aca
├─ REQUISITOS.md             software, hardware y costos reales
├─ perfil.ejemplo-lleno.md   un perfil ficticio completo, para ver el nivel de detalle
├─ LECCIONES.md              los hallazgos medidos del barrido
├─ skill/empleos.md          la skill de Claude Code
├─ perfil.example.md         quien eres, que quieres, no negociables, zonas de calce
├─ portales.example.md       portales por pais
├─ tracker.example.md        pipeline, descartes y anclas de renta. Es la fuente del dedup
├─ cv/
│  ├─ cv-maestro.example.html   plantilla de CV compatible con filtros ATS
│  └─ ESTANDAR-CV.md            tailoring, formato, paginacion y analisis inverso
├─ entrevistas/
│  ├─ PREPARACION.md            que hacer antes de cada entrevista
│  ├─ GRABACION.md             grabar sin ser admin de la reunion, y transcribir
│  ├─ EVALUACION.md             como evaluarte despues, con metricas duras
│  └─ LECCIONES-ENTREVISTAS.example.md   tus patrones acumulados
├─ dashboard/embudo.example.html
└─ scripts/
   ├─ getonbrd-sweep.js  ·  getonbrd-sweep.ps1
   ├─ dashboard-pdf.js
   └─ linkedin-sweep.md
```

---

## El ciclo no termina cuando envías el CV

Buscar trabajo tiene dos mitades y casi todas las herramientas cubren solo la primera.

**La primera mitad se automatiza.** Barrer, filtrar, deduplicar, adaptar el CV. Es volumen y criterio repetible.

**La segunda no.** Prepararte para una entrevista, evaluarte honestamente después, y convertir eso en un cambio de comportamiento concreto. Esa mitad es donde se decide si consigues el trabajo, y es la que la mayoría hace de memoria y a ojo.

Por eso el repo trae [`entrevistas/PREPARACION.md`](entrevistas/PREPARACION.md), [`entrevistas/GRABACION.md`](entrevistas/GRABACION.md) y [`entrevistas/EVALUACION.md`](entrevistas/EVALUACION.md). El segundo tiene el método completo. separar el resultado del proceso de la calidad de tus respuestas, sacar métricas duras del transcript, y las trampas de pedirle a una IA que te evalúe.

---

## Lee esto antes de escribir tu propia versión

[`LECCIONES.md`](LECCIONES.md) tiene los hallazgos medidos que hacen que un barrido funcione o no sirva para nada. Entre ellos, por qué buscar por stack en LinkedIn no encuentra nada, por qué `location=Remote` no significa remoto, y cuánto cuesta una ventana de 7 días.

Si vas a construir algo parecido, esa página te ahorra semanas.

---

## Estado

Proyecto personal, en uso real. No es un producto ni pretende serlo. Los portales configurados son los de Chile y LATAM, pero la arquitectura sirve para cualquier mercado cambiando las fuentes.

Si lo adaptas a tu país o le agregas un portal, los PR son bienvenidos.

## Contacto

Si adaptas esto a tu mercado, le agregas un portal o encuentras algo que se pueda mejorar, los issues y los PR son bienvenidos.

Y si prefieres que te acompañen a montarlo, o quieres armar algo parecido para tu propio proceso o el de tu equipo, escríbeme. Hago asesorías puntuales sobre esto.

- LinkedIn. [Javier Vrandecic](https://www.linkedin.com/in/javiervrandecic/)
- GitHub. [@ubermancl](https://github.com/ubermancl)

---

## Licencia

MIT
