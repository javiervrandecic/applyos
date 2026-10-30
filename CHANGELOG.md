# Cambios

Historia de versiones de applyOS. Las fechas son de publicación.

## 1.2.3 · 2026-10-30

### Documentación y skills
- Sección nueva en el README, "Dónde queda todo". La carpeta de búsqueda es la base del sistema, qué guarda cada archivo y que se puede abrir en Obsidian.
- El tracker de ejemplo suma "Registro de sesiones", una bitácora de cada vez que se trabaja con el sistema.
- Las cuatro skills leen ese registro al empezar, para saber dónde quedó la persona, y agregan una fila al terminar.

## 1.2.2 · 2026-10-30

### Documentación y skills
- El README explica el CV adaptado a cada cargo, que sale de un maestro en español y otro en inglés en el idioma del aviso, y cómo el maestro se va actualizando con lo nuevo de cada postulación.
- El README explica el playbook que se arma cuando avisas que conseguiste una entrevista.
- `config.ejemplo.json` suma `cv_maestro_en`.
- `applyos-postulacion` elige el maestro según el idioma del aviso y propone sumar al maestro el material nuevo, con aprobación.
- `applyos-entrevista` se activa con "me llamaron para una entrevista" o "conseguí entrevista", mueve el tracker y arma el playbook sin que se lo pidan.
- `ESTANDAR-CV.md` suma la sección "El maestro crece con cada postulación".
- El README explica las respuestas de formularios desde tu perfil y la renta con anclas por mercado que suben con cada proceso.
- El tracker de ejemplo suma "El piso sube, no baja" y la separación del mercado por idioma.
- `PREPARACION.md` suma preguntas para sacarle al reclutador el presupuesto y la lectura del mercado.
- `applyos-entrevista` incluye esas preguntas en el playbook y propone subir el piso cuando un proceso lo justifica.

### Instalación
- La guía parte por Claude Code con un paso a paso para quien nunca lo ha usado. Qué plan sirve (el gratis no), cuál opción elegir según tu experiencia (app de escritorio, extensión en VS Code o Cursor, o terminal), los comandos de instalación para Windows, Mac y Linux, cómo verificarla y cómo entrar con tu cuenta. Después trae un texto para pedirle a Claude que instale Node.js, git, las dependencias y las skills, avisando antes de cada paso.
- README y `REQUISITOS.md` ponen Claude Code primero y aclaran que el resto lo puede instalar Claude.

## 1.2.1 · 2026-10-28

### Uso responsable
- Sección nueva en el README, "Uso responsable, y una zona gris dicha con franqueza". Qué hace y qué no hace applyOS (no postula, no inicia sesión, no es un bot), el riesgo de leer portales con scripts y las reglas de ritmo.
- `scripts/linkedin-sweep.md` suma las reglas de uso responsable. Sin sesión, una solicitud a la vez con pausa, tope de páginas y de búsquedas, parar al primer bloqueo y sin trucos.
- La skill de búsqueda aclara que "cambiar de método" ante un bloqueo es probar otra fuente pública, nunca proxys, rotación de IP ni saltarse captchas.

## 1.2.0 · 2026-10-28

La metodología pasa a skills de Claude Code y se suma un instructivo para medir tus entrevistas.

### Skills
- **Cuatro skills** en `.claude/skills/`. `applyos-busqueda` (barrido y calce), `applyos-postulacion` (CV adaptado, formularios, mensajes, seguimiento), `applyos-entrevista` (playbook y evaluación) y `applyos-embudo` (reportes, dashboard, cierre). Cada una con un `SKILL.md` corto, `references/` y `scripts/`.
- `instalar.ps1` e `instalar.sh` copian las skills a tu usuario o a un proyecto sin sobrescribir nada sin avisar, con `-Forzar` y respaldo si lo pides.
- Las rutas de tus datos se configuran en `~/.applyos/config.json`, fuera del repo. Modelo en `config.ejemplo.json`.
- `herramientas/sincronizar-skills.js` mantiene al día las copias de scripts y documentos dentro de las skills.
- El comando `skill/empleos.md` se mantiene por compatibilidad.

### Diarización de entrevistas
- `docs/DIARIZAR-ENTREVISTAS.md`. Qué es, cómo grabar (con la nota de consentimiento), paso a paso con AssemblyAI, costos y privacidad con fuente y fecha, y alternativas, marcando lo no verificado.
- `diarizar.js`. Sube el audio, pide la transcripción con speaker labels en español, espera con reintentos y guarda un JSON y una transcripción en markdown. Node 18 o superior, sin dependencias. La clave se lee solo de `ASSEMBLYAI_API_KEY`.
- `metricas.js`. Porcentaje de habla, apertura, turnos de más de 60 segundos, muletillas por minuto e interrupciones, desde el JSON.
- Probado con un diálogo sintético de dos voces. Detectó dos hablantes y las métricas coinciden con el cálculo a mano.

### Documentación
- Sección "Cómo usarlo como skills de Claude Code" en el README, con la tabla de qué hace la IA y qué haces tú.
- `docs/INSTALACION-SKILLS.md`.

## 1.1.0 · 2026-10-28

Tres meses de uso real desde la primera versión. La metodología cambió más que los scripts.

### Metodología (skill `/empleos`)
- **Clasificación por familias de función.** Cada aviso se ubica según lo que pide la descripción, no según su título. Si no cae en ninguna familia de tu perfil, se descarta aunque pague bien.
- **Barrido delta.** Cada barrido se compara contra el anterior para revisar a fondo solo lo nuevo, con chequeos contra salidas viejas.
- **Cruce contra el tracker por palabra distintiva de la empresa**, sin sufijos legales ni país, y la regla inversa. Empresa conocida no es cargo cubierto.
- **Categoría puente opcional** para cargos de menor nivel que aceptarías por un tiempo, con su propia renta y en un bloque aparte.
- **Pendientes de decisión.** Los calces sin decidir de barridos anteriores se listan en cada informe para que no desaparezcan.
- **Bloqueos 403 y 429.** Reintento con pausa, cambio de método y reporte explícito como BLOQUEADO. Un cero ya no se registra como "no hay avisos".
- **Registro obligatorio de cada barrido**, incluso de un chequeo rápido, con conteos y profundidad de paginación por término.
- **Verificación en dos niveles ampliada.** Cuándo el código en un aviso baja el calce, "o afines" no es inclusivo por defecto, chequeo de techo explícito, y no confiar en el resumen de un subagente sin releer el detalle.
- **LinkedIn.** Límite de unas 25 búsquedas seguidas, paginación reportada con números, avisos cerrados que solo se ven con sesión iniciada.
- **Postulación.** Detección del canal por correo, paso de palabras clave ATS sin mentir, nunca marcar como enviado sin confirmación.
- **Portales.** Descubrimiento medido por portal y conversión medida por vía de entrada. APIs públicas de Ashby y Workable para el detalle real.
- **Registro de mejoras** dentro de la skill, que se lee al empezar y se actualiza al terminar.

### Scripts
- `scripts/getonbrd-sweep.js` lee términos y ventana desde `portales.json`, filtra por días, excluye talent pool, reintenta ante 403 y 429, y reporta resultados y páginas por término.
- `scripts/delta.js` nuevo. Barrido delta y cruce contra el tracker.
- `herramientas/escanear.js` nuevo. Escáner de secretos y datos personales, sin dependencias, con lista negra y archivos de claves externos que nunca se imprimen.
- `herramientas/pre-commit` nuevo. Hook que corre el escáner antes de cada commit.

### Documentación
- Lecciones 11 a 16 en `LECCIONES.md`.
- Las plantillas pasan de `.example` a `.ejemplo` (perfil, portales, tracker, CV, dashboard y lecciones de entrevistas). Si ya tenías copias, no cambia nada, porque tus archivos personales no llevan sufijo.
- Nuevo `portales.ejemplo.json` para los scripts.
- Perfil de ejemplo con familias, categoría puente y movilidad. Tracker de ejemplo con columna de decisión y registro de barridos más completo.
- Guía con barrido delta y una sección para publicar tu propia versión sin filtrar datos.
- Se quitan del repo los datos de contacto personales. Para dudas y mejoras, issues y PR.

## 1.0.0 · 2026-08-05

Primera versión pública.

- Skill `/empleos` con barrido de Get on Board, LinkedIn y portales locales, verificación en dos niveles y deduplicación por empresa.
- Barrido de Get on Board en Node y PowerShell, generador de PDF del dashboard de embudo.
- Plantillas de perfil, portales, tracker y CV maestro, más un perfil de ejemplo lleno.
- Guía paso a paso, requisitos y lecciones 1 a 10.
- Ciclo de entrevistas. Preparación, grabación y evaluación.
