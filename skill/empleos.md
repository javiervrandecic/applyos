# /empleos. Barrido de portales y análisis de calce

Busca empleos en todos los portales configurados, analiza el calce real de cada aviso contra tu perfil leyendo la descripción completa, y prepara la postulación.

**Antes de ejecutar, lee `perfil.md`, `portales.md` (o `portales.json`), `tracker.md` y `cv/ESTANDAR-CV.md`.** Sin el perfil el barrido devuelve ruido y sin el tracker vuelve a mostrarte lo que ya viste.

**Ejecución sin pausas.** El barrido completo (pasos 1 a 6) corre de corrido, sin pedir permiso para cada portal ni para cada lectura. Es lectura pública de avisos, no hay ninguna acción irreversible. La única pausa de la skill es la pregunta del paso 9, "¿cuál preparo?".

**Duración esperable.** Un barrido completo serio toma entre 25 y 45 minutos reales. Si un barrido (o un subagente que lo corre) termina en dos minutos diciendo que está listo, eso es una falla, no un barrido corto.

---

## Paso 0. Mejoras pendientes de la skill

Al final de este archivo hay una sección "Registro de mejoras". **Léela al empezar**, porque puede haber reglas aceptadas que todavía no están incorporadas en los pasos. **Actualízala al terminar** si en la sesión surgió una mejora nueva o se aplicó una pendiente. Así el proceso aprende entre sesiones en vez de depender de la memoria de quien lo corre.

---

## Paso 1. Preparar el barrido delta

Comparar contra el barrido anterior es lo que permite revisar a fondo lo nuevo en vez de releer todo.

1. Antes de barrer, copia las salidas del barrido anterior a `barridos/prev-<AAAA-MM-DD>/`.
2. Corre los barridos y guarda cada salida con la fecha en el nombre, por ejemplo `barridos/gob-2026-03-12.json`.
3. Calcula lo nuevo con `node scripts/delta.js <actual.json> <anterior.json> --tracker tracker.md`.
4. **Revisa la hora de modificación de cada archivo antes de leerlo.** Si el conteo de nuevos es idéntico al del barrido anterior, o el script avisa que el archivo es viejo o que los dos son iguales, estás leyendo una salida vieja. Un "0 nuevos" con archivos viejos es una falla, no ausencia de avisos.
5. Corre los barridos en secuencia, no en paralelo con subprocesos que nadie supervisa. Un proceso que no arrancó deja el archivo anterior intacto y el delta da cero en silencio.

En portales donde la URL del aviso cambia entre corridas, el delta compara por título más empresa.

---

## Paso 2. Get on Board (fuente principal)

API pública, sin autenticación, con búsqueda de texto completo. **Es el portal donde buscar por stack funciona bien**, así que acá van los términos de tecnología de `perfil.md`.

```
https://www.getonbrd.com/api/v0/search/jobs?query=<término>&per_page=30&page=<n>
```

Lo automatiza `scripts/getonbrd-sweep.js`, que pagina, aplica la ventana de días, excluye el talent pool y reporta cuántos resultados trajo cada término y hasta qué página llegó.

Tres trampas de esta API.

- **`rejected_reasons` no vacío** (por ejemplo `talent_pool`) significa que no es una vacante abierta, es una lista de recolección de candidatos. Descártalo aunque el stack calce perfecto.
- **`countries` no es confiable.** Casi siempre trae solo `["Remote"]` aunque el aviso tenga restricción de país. La restricción real se confirma en la página pública del aviso.
- **`company` puede venir vacío.** Sin nombre de empresa el cruce contra el tracker no funciona. Resuélvelo con `GET /api/v0/companies/{id}` o desde el slug de la URL pública, como hace el script.

El detalle de un aviso se lee mejor desde la página pública `https://www.getonbrd.com/jobs/<slug>` que desde la API de detalle, que suele pedir autenticación.

## Paso 3. LinkedIn

```
https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=<término>&location=<país>&f_TPR=r1296000&sortBy=DD&start=<n>
```

**Reglas obligatorias**, todas con evidencia en `LECCIONES.md`.

1. **Ventana de 15 días** (`f_TPR=r1296000`), no de 7. Los avisos de jefatura viven semanas.
2. **Paginar.** Devuelve 10 por llamada. Pide `start=0`, `10`, `20` y sigue hasta que devuelva menos de 10.
3. **La paginación se reporta, no se asume.** Cada barrido deja escrito cuántos resultados trajo cada término y hasta qué `start` llegó. "Pagine todo" sin números no cuenta.
4. **Buscar por título de cargo, no por stack.** Su buscador pesa el título y no matchea el cuerpo del aviso.
5. **`location=Remote` no significa remoto.** Devuelve el país de la oficina. Úsalo solo para detectar mercados a los que puedes postular por ciudadanía.
6. **Límite de peticiones.** Después de unas 25 búsquedas seguidas empieza a devolver 0 o exactamente 10 resultados sin dar error. Pon una pausa entre búsquedas, separa los bloques grandes en corridas distintas, y reintenta aparte toda búsqueda que haya dado 0 o un número sospechoso.

El detalle de un aviso se lee con `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/<id>`, que trae descripción, criterios, antigüedad y número de solicitantes.

**Lo que LinkedIn sin sesión no muestra.** Un aviso dentro de la ventana puede estar cerrado a nuevas postulaciones, y eso solo se ve con sesión iniciada. Para calces fuertes con varios días publicados, pídele a la persona que abra el link logueada antes de invertir en un CV. Ojo, "+100 solicitudes" no significa cerrado, solo competido. Cerrado es el mensaje explícito de que ya no se aceptan solicitudes.

## Paso 4. Portales locales y fuentes de descubrimiento

Los de `portales.md`. **Usa el buscador por término, no el listado por categoría**, que suele truncar en 30 sin avisar. Y pagina hasta una profundidad mínima fija (por ejemplo 5 páginas para el término de más volumen y 3 para el resto), no "hasta donde alcance el tiempo".

**Empresas con ATS de API pública.** Si una empresa publica en Ashby o Workable, su API pública trae el país elegible y la URL oficial de postulación, que el agregador no muestra.

```
https://api.ashbyhq.com/posting-api/job-board/<empresa>
https://apply.workable.com/api/v1/widget/accounts/<empresa>
```

**Buscadores generales como capa de descubrimiento.** Sirven para encontrar empresas y cargos que los portales no traen, pero nunca para cerrar un veredicto. Si aparece algo, busca la misma vacante en su fuente original y recién ahí evalúa. Si no encuentras la fuente, regístralo como "pendiente de fuente verificable". Los agregadores que indexan avisos vencidos y los portales que renderizan solo con JavaScript se marcan en `portales.md` para no perder tiempo con ellos.

## Paso 5. Bloqueos, 403 y 429

Un portal que normalmente devuelve resultados y hoy devuelve 0 está bloqueado o limitado, no vacío. Antes de darlo por cubierto o por bloqueado.

1. Reintenta el mismo método una vez, con una pausa de algunos segundos.
2. Cambia de método. Script con cabecera de navegador, herramienta de lectura web del agente, o un endpoint alternativo del mismo portal.
3. Solo si los dos fallan, repórtalo como BLOQUEADO diciendo qué se intentó, y pásale a la persona los links con el filtro de fecha ya puesto para que lo revise a mano.

Nunca lo saltes en silencio y nunca registres un bloqueo como "no hay avisos".

## Paso 6. Deduplicar contra el tracker

Lee el tracker completo antes de mostrar nada. Activos, cerrados, descartados y pendientes.

- **El cruce es por la palabra distintiva de la empresa**, sin sufijos legales, país ni palabras genéricas. "GRUPO ACME CHILE SPA" se busca como "acme". Revisa también si ya existe un CV adaptado con el nombre de esa empresa, porque es señal de que ya hubo proceso. `scripts/delta.js` hace este cruce y marca la fila como EMPRESA CONOCIDA.
- **Empresa conocida no es lo mismo que cargo cubierto.** Compara el título nuevo contra los cargos ya registrados de esa empresa. Si es distinto y no hay evidencia de que sea el mismo rol republicado, es un hallazgo nuevo y se verifica igual que cualquier otro.
- **Las empresas republican el mismo cargo con otro nombre.** Señales. misma empresa, mismo equipo interno, requisitos y beneficios casi idénticos.
- **Antes de decir que algo "sigue pendiente", mira la fila real del tracker.** No repitas el estado que dijo un resumen anterior.

---

## Paso 7. Clasificar por contenido, en familias

**El título del aviso no decide nada.** Muchas empresas publican "AI Engineer" para cargos que por dentro son de implementación o automatización low-code, y al revés. Cada hallazgo se ubica según lo que pide la descripción en una de las familias definidas en `perfil.md`. Un ejemplo de familias para un perfil de automatización e integraciones.

- **A. Soluciones, preventa e implementación.**
- **B. Adopción, habilitación y transformación**, incluidos los Project Manager de proyectos digitales o de innovación.
- **C. Automatización, RevOps, GTM y CRM.**
- **D. Complementaria**, por ejemplo docencia. Nunca como foco.

Si un aviso no cae en ninguna de tus familias, es SKIP aunque pague bien. Por eso las búsquedas amplias por título se mantienen, porque lo que filtra es el contenido.

## Paso 8. Verificación en dos niveles

Abrir el detalle de 90 avisos no es práctico. Descartarlos por el título tampoco. Medición real. de 24 avisos descartados solo por título, **3 escondían un calce real**.

**Nivel 1. Descartable sin abrir el detalle.**
- Ubicación explícitamente fuera de rango, incluida la que exige mudarse si tu perfil dice que no te mudas.
- Práctica profesional (no es empleo).
- Disciplina de negocio pura sin ninguna palabra técnica ni de tus familias.

**Nivel 2. Obliga a leer el detalle antes de decidir cualquier cosa.**
- Todo título con Engineer, Developer, Lead, Architect, Operations, Analyst, Especialista, Ingeniero o Gestor más una palabra técnica. **Da igual si suena genérico o si suena prometedor, los dos fallan por título solo.**

**Al leer el detalle, pide la lista COMPLETA de requisitos con años y nivel exacto de cada uno, no un resumen narrativo.** Trata cada línea como un chequeo binario, cuenta cuántas fallan, y recién ahí decide.

**Núcleo contra adorno.** Si la tecnología atractiva está en "deseable" y el filtro duro es otra cosa, no estás compitiendo donde crees.

**Cuándo el código baja el calce.** Que un aviso mencione un lenguaje de programación por sí solo no cambia nada, muchos lo ponen por costumbre. Lo que decide es el tipo de cargo.
- En cargos de liderazgo, transformación o adopción, el código en los requisitos no baja el calce, salvo que el equipo a guiar sean desarrolladores y pidan experiencia de ingeniería.
- En cargos con título de ingeniero o developer, **dos o más señales de ingeniería real bajan el calce a Puente con probabilidad baja**, aunque pague bien. Señales. código en producción con tipado, tests o empaquetado, ser dueño del CI/CD o del release, otro lenguaje de software obligatorio, prueba técnica de código, liderar o ser par de un equipo de desarrollo.

**"O afines" no es automáticamente inclusivo.** Si el aviso exige un título profesional y no nombra explícitamente el tuyo, trata "o afines" como ambigüedad real. Máximo Puente hasta que la persona decida si vale el riesgo del filtro.

**Chequeo de techo.** Antes de presentar un cargo de nivel alto como calce, crúzalo explícitamente contra el "Límite superior" de `perfil.md`. Señales que activan el chequeo. Gerente, Director o VP en el título, empresa multinacional, ocho o más años pedidos.

**Categoría puente.** Si `perfil.md` lo habilita, los cargos junior o de analista cuyo contenido cae en tus familias **se muestran aparte**, en un bloque "Puente", con la renta específica que definiste para ese bloque y sus riesgos (título, sueldo, competencia, sobrecalificación). La persona decide. Un aviso junior que pide como núcleo exactamente tu stack diferenciador va en el mismo bloque, destacado.

**Falso positivo conocido.** Hay publicaciones desde páginas de empresa que son personas anunciando su propia disponibilidad. Señal. la descripción está en primera persona o nombra a alguien con sus "current roles". Descartar sin registrar como oferta.

**No confíes en el resumen de un subagente.** Si el barrido corrió en segundo plano, su reporte es su lectura, no una verificación. Antes de recomendar armar un CV para un hallazgo, vuelve a leer el detalle tú mismo con la lista completa de requisitos. Si la lectura falla, dilo como "no verificado".

## Paso 9. Si una empresa calza, revisa todas sus vacantes

Abre su página de empleos completa. Suelen tener cargos vecinos que calzan mejor y que no salieron por palabra clave.

## Paso 10. Registrar TODO

**Cada aviso tocado deja una fila** en el tracker, sea Nivel 1 o Nivel 2, sea calce o descarte evidente. Empresa, cargo, motivo aunque sea de una línea, fecha de publicación, rango salarial si está publicado y decisión.

**Cada barrido deja una fila en "Registro de barridos"** en el momento en que se ejecuta, con hora real, portales, método, términos por portal con su conteo y profundidad de paginación, bloqueos y resultado. Esto aplica también a un chequeo rápido de un solo portal. Registrar después de que alguien pregunta no cuenta.

Nunca descartes en silencio ni dejes solo un conteo hablado.

---

## Paso 11. Presentar

Orden. primero el mercado y el idioma prioritarios de tu perfil, después el resto. Dentro de cada bloque por calce y recencia. El bloque Puente va aparte, al final.

```
N. [TÍTULO] · [EMPRESA]
   [Ubicación] | [Renta o "sin publicar"] | [hace X días] | [familia A/B/C]
   CALCE. [Oro/Fuerte/Puente]. [una línea con por qué calza y cuál es el gap]
   [URL]
```

**Una renta baja no descarta si el calce es bueno.** Márcala como "bajo tu piso pero vale postular" en vez de omitirla. Se postula pidiendo la tarifa propia, no la del aviso, salvo en el bloque Puente, que usa su propia renta.

**Pendientes de decisión.** Después de lo nuevo, lista aparte todo calce Oro o Fuerte de barridos anteriores que siga sin decisión en el tracker, con la fecha en que se vio por primera vez. El delta solo muestra lo nuevo, así que sin esta lista un calce sin decidir desaparece del informe siguiente.

Después pregunta **¿cuál preparo?**

## Paso 12. Preparar la postulación

1. Lee el aviso completo y extrae literal la sección de cómo postular.
2. **Si el aviso menciona un correo**, como canal único o además del formulario, márcalo arriba y en negrita. Redacta el correo completo listo para copiar (para, asunto, cuerpo y archivo a adjuntar). El formulario no reemplaza al correo. Un formulario cerrado tampoco cierra la vía del correo.
3. Lee `cv/ESTANDAR-CV.md` **antes** de generar nada.
4. **Palabras clave sin mentir.** Entrega primero una tabla con cada requisito del aviso, si lo cumples (sí, parcial, no) y la evidencia en tu CV maestro. Después separa las palabras clave faltantes en dos grupos. Las que SÍ tienes pero no están escritas así (se pueden usar) y las que NO tienes (prohibido agregarlas, se declaran como gap).
5. Genera el CV adaptado desde el maestro. **El tailoring es de énfasis y orden, nunca de invención.** Las cifras verificadas se mantienen tal cual.
6. Verifica el PDF **leyéndolo completo** antes de entregarlo. Un archivo escrito sin error no es un archivo que funciona.
7. Prepara 3 a 5 puntos clave para la entrevista.

## Paso 13. Registrar la postulación

Sin que la persona lo pida. Empresa, cargo, familia, calce, CV usado, renta declarada, vía de entrada, fecha y próximo paso.

**Nunca marques algo como enviado sin confirmación explícita de la persona.** Dejarlo redactado y listo no es haberlo enviado. Mientras no confirme, el estado es "CV listo, sin enviar".

**Credenciales.** Si registras en una base de datos o en una planilla por API, la clave se lee de una variable de entorno en el momento. Nunca se escribe en el tracker, en un resumen ni en el chat.

---

## Reporte de embudo

Cada dos días o cuando lo pidan. Etapas. analizados, postulados, contacto humano real, primera entrevista, segunda entrevista, oferta. Con la conversión de cada etapa **respecto de la anterior**, no respecto del total.

**Portales. mide descubrimiento, no conversión.** Del registro de barridos puedes sacar qué portal trae más calces por aviso revisado, y eso sí sirve para decidir dónde invertir el tiempo de barrido. La conversión a entrevista no se le atribuye al portal, porque mezcla descubrimiento con postulación y los denominadores chicos engañan. Lo que se mide para conversión es la **vía de entrada**, formulario ciego contra contacto humano directo. Ver lección 10.

---

## Registro de mejoras

Mejoras al proceso aceptadas en conversación que todavía no están incorporadas arriba, o recién incorporadas. Una línea por mejora, con fecha, estado y el caso real que la originó.

### Pendientes de aplicar
- (AAAA-MM-DD) <mejora> · <caso que la originó> · <qué falta decidir>

### Aplicadas recientemente
- (AAAA-MM-DD) <mejora> · <en qué paso quedó>
