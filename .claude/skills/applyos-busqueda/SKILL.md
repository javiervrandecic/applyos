---
name: applyos-busqueda
description: Barre portales de empleo (Get on Board, LinkedIn, portales locales y ATS públicos), lee la descripción completa de cada aviso, lo clasifica por calce contra tu perfil, descarta lo que ya está en tu tracker y registra todo. Úsala cuando la persona pida buscar empleo, hacer un barrido, "qué hay nuevo", revisar un aviso puntual o ver si un cargo calza con su perfil.
---

# applyOS. Búsqueda y análisis de calce

Encuentra avisos y decide si valen la pena leyendo el contenido, nunca el título. No postula ni envía nada.

## Antes de empezar

1. Lee `~/.applyos/config.json` si existe. Define dónde viven el perfil, el tracker y los portales. Si no existe, usa la carpeta actual y pregunta una sola vez dónde están (hay un modelo en `config.ejemplo.json` del repo).
2. Lee `perfil.md`, `portales.md` (y `portales.json` para los scripts) y `tracker.md` completos. Sin perfil el barrido es ruido. Sin tracker vuelve a mostrar lo ya visto.
3. Si falta alguno, ofrece crearlo desde `assets/` (`perfil.ejemplo.md`, `portales.ejemplo.md`, `portales.ejemplo.json`, `tracker.ejemplo.md`). Pide los datos en una sola tanda de preguntas.
4. Abre la sección "Registro de mejoras" de `references/metodologia-completa.md` y aplica lo pendiente.

## Pasos

El barrido corre de corrido, sin pedir permiso por portal. Es lectura pública. Un barrido serio dura 25 a 45 minutos, si termina en dos es una falla.

1. **Delta.** Copia las salidas anteriores a `barridos/prev-<fecha>/`.
2. **Get on Board.** `node scripts/getonbrd-sweep.js --config portales.json --dias 15 --json > barridos/gob-<fecha>.json`. Busca por stack. Descarta talent pool.
3. **LinkedIn y portales locales.** Busca por título de cargo, con ventana de 15 días y paginación reportada. Detalles y límites en `references/portales-y-bloqueos.md` y `scripts/linkedin-sweep.md`.
4. **Bloqueos.** Un cero en un portal que siempre trae algo es bloqueo, no vacío. Reintenta, cambia de método y solo entonces repórtalo como BLOQUEADO.
5. **Dedup.** `node scripts/delta.js barridos/gob-<fecha>.json barridos/prev-<fecha>/gob.json --tracker tracker.md`. Empresa conocida no es cargo cubierto, compara el título.
6. **Clasificar por contenido** en las familias de `perfil.md`. Nivel 1 se descarta sin abrir. Nivel 2 obliga a leer el detalle con la lista completa de requisitos. Reglas en `references/calce.md`.
7. **Si una empresa calza**, revisa todas sus vacantes.
8. **Registrar todo.** Cada aviso tocado deja una fila en el tracker y cada barrido deja una fila en "Registro de barridos" en el momento.
9. **Presentar** con el formato de `references/calce.md`: mercado prioritario primero, bloque Puente aparte, y los pendientes de decisión de barridos anteriores.
10. **Preguntar** "¿cuál preparo?". Es la única pausa. Si elige uno, sigue con la skill `applyos-postulacion`.

## Qué escribe y qué pregunta

- Escribe: `tracker.md` (filas y registro de barridos), `barridos/*.json`.
- Pregunta: solo cuál preparar, y las preguntas de arranque si falta el perfil.
- Nunca marca nada como postulado. Eso lo confirma la persona.

## Reglas que no se negocian

- El título no decide nada. Lo decide la descripción completa.
- Un resumen de un subagente no es verificación: relee el detalle antes de recomendar.
- Lo que no pudiste leer se informa como "no verificado".
- Los chequeos de techo y de "o afines" están en `references/calce.md`.

## Archivos de apoyo

- `references/calce.md`: familias, niveles, categoría puente, formato de presentación.
- `references/portales-y-bloqueos.md`: Get on Board, LinkedIn, ATS, 403 y 429.
- `references/metodologia-completa.md`: el comando completo original, con todos los detalles.
- `references/lecciones-busqueda.md`: las 16 lecciones y su evidencia.
- `scripts/`: `getonbrd-sweep.js` (y `.ps1`), `delta.js`. Node 22 o superior.
