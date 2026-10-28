# Portales (plantilla)

Copia a `portales.md` y ajusta a tu país. La skill lee este archivo para saber dónde barrer.

applyOS nació con portales de Chile, pero la arquitectura no depende de eso. Cambias las fuentes y funciona igual.

---

## 1. Get on Board, todo LATAM

Es la mejor fuente del sistema, porque tiene **API pública sin autenticación** y hace búsqueda de texto completo, así que los términos de stack sí encuentran.

```
https://www.getonbrd.com/api/v0/search/jobs?query=<término>&per_page=30&page=<n>
```

Cubre Chile, Argentina, Perú, Colombia, México, Uruguay, Ecuador y remoto LATAM. No hay que configurar país, los avisos traen `remote`, `remote_zone` y `countries`.

Lo corre `scripts/getonbrd-sweep.js`, que toma los términos de `portales.json`.

**Trampas de la API.** `rejected_reasons` no vacío es un talent pool, no una vacante. `countries` suele decir solo "Remote" aunque haya restricción de país. Y el nombre de la empresa a veces viene vacío. Ver lección 14.

---

## 2. LinkedIn, global

Funciona en cualquier país cambiando `location`. Endpoint público, sin login.

```
https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=<término>&location=<país>&f_TPR=r1296000&sortBy=DD&start=<n>
```

**Tres cosas que hay que saber antes de usarlo**, todas explicadas en [`LECCIONES.md`](LECCIONES.md).

- `f_TPR=r1296000` son 15 días. No uses 7.
- Devuelve 10 por llamada. Hay que paginar con `start`.
- Busca por título, no por el cuerpo del aviso. Acá van variantes de cargo, no tecnologías.

Valores de `location` que funcionan: nombre del país en inglés (`Chile`, `Mexico`, `Spain`, `Argentina`), región (`European Union`, `Latin America`) o ciudad.

---

## 3. Computrabajo, LATAM con subdominio por país

El buscador `?q=` no filtra bien. Hay que usar el slug de la palabra clave.

```
https://<país>.computrabajo.com/empleos-de-<palabra-clave>
```

Subdominios. `cl` Chile · `mx` México · `co` Colombia · `pe` Perú · `ar` Argentina · `ec` Ecuador · `cr` Costa Rica · `pa` Panamá · `do` República Dominicana · `gt` Guatemala · `ve` Venezuela · `bo` Bolivia · `py` Paraguay · `uy` Uruguay

Ejemplos de slug. `inteligencia-artificial`, `automatizacion`, `transformacion-digital`, `ia`, `chatbot`, `rpa`, `innovacion`.

**Advertencia.** Computrabajo bloquea el scraping de forma intermitente y a veces por varios días seguidos. Cuando pase, no lo saltes en silencio. avísale al usuario para que lo revise a mano en el navegador, con el filtro de fecha en 15 días.

---

## 4. Portal local de tu país

Casi todos los mercados tienen uno que no está en ningún agregador. Agrega el tuyo acá.

| País | Portal local |
|---|---|
| Chile | ChileTrabajos, Trabajando.com |
| México | OCC Mundial |
| Argentina | Bumeran, ZonaJobs |
| Colombia | El Empleo, Magneto |
| Perú | Bumeran, Aptitus |
| España | InfoJobs, Tecnoempleo |
| Uruguay | BuscoJobs, Gallito |

**Al agregar uno, revisa siempre si el listado por categoría está truncado.** Los portales locales suelen cortar en 30 resultados sin avisar. Prefiere el buscador por término antes que la categoría, y pagina.

---

## 5. Empresas con ATS de API pública

Cuando una empresa publica en Ashby o Workable, su API pública trae el aviso real con país elegible y URL oficial de postulación, cosas que los agregadores no muestran.

```
https://api.ashbyhq.com/posting-api/job-board/<empresa>
https://apply.workable.com/api/v1/widget/accounts/<empresa>
```

---

## 6. Buscadores generales y agregadores

Sirven para **descubrir** empresas y cargos que los portales no traen, nunca para cerrar un veredicto. Si algo aparece, busca la misma vacante en su fuente original.

Anota acá los que te den problemas para no perder tiempo con ellos.

| Tipo | Problema típico | Qué hacer |
|---|---|---|
| Agregadores que reindexan avisos | muchos links vencidos (404 o 410) | verificar que el aviso siga vivo en la fuente |
| Portales que renderizan solo con JavaScript | la lectura web devuelve la página vacía | revisarlo a mano en el navegador |
| Portales con detalle que redirige | el listado se lee, el detalle no | usarlo para descubrir y leer el detalle en otra fuente |

---

## 7. Bloqueos y límites

Casi todos los portales bloquean o limitan de vez en cuando. Un cero en un portal que normalmente trae resultados es un bloqueo, no un mercado vacío.

- Reintenta una vez con pausa. `portales.json` define cuántos intentos y cuántos segundos.
- Si sigue, cambia de método. Un script con cabecera de navegador suele funcionar donde la lectura web del agente da 403, y al revés.
- En LinkedIn, pon una pausa entre búsquedas y separa los bloques grandes. Después de unas 25 búsquedas seguidas devuelve 0 o 10 sin dar error.
- Si nada funciona, anótalo como BLOQUEADO en el registro de barridos, con lo que intentaste.

---

## 8. Fuentes que no son portales

Los mejores hallazgos muchas veces no vienen del buscador de empleos.

**Posts orgánicos de reclutadores.** Gente publicando "estoy buscando un...". Cuando el hallazgo viene de ahí, la vía de postulación preferida **no es el formulario**, es escribirle directo a quien publicó. Es la vía que mejor convierte.

**Páginas de empleo de las empresas.** Cuando una empresa aparece con calce, abre su página completa. Suelen tener cargos vecinos que calzan mejor y que no salieron en la búsqueda por palabra clave.

**Agencias de staff augmentation.** Si trabajas remoto para otro país, una sola relación con una agencia rinde más que veinte postulaciones ciegas.

---

## Ciudadanía, derecho a trabajo y mudanza

Si tienes pasaporte o residencia de otro país, ponlo en `perfil.md`. Abre mercados enteros que de otra forma el barrido descarta por ubicación. Y si no te mudarías, dilo también. Un cargo "remoto" que exige residir en otro país es un descarte por ubicación, aunque el título diga remoto.

Y ojo con esto. **el filtro "Remote" de LinkedIn devuelve el país de la oficina, no la modalidad.** Para remoto de verdad hay que leer el detalle o usar portales que lo modelen como campo. Ver lección 4.
