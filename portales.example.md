# Portales (plantilla)

Copia a `portales.md` y ajusta a tu país. La skill lee este archivo para saber dónde barrer.

applyOS nació con portales de Chile, pero la arquitectura no depende de eso. Cambias las fuentes y funciona igual.

---

## 1. Get on Board — todo LATAM

Es la mejor fuente del sistema, porque tiene **API pública sin autenticación** y hace búsqueda de texto completo, así que los términos de stack sí encuentran.

```
https://www.getonbrd.com/api/v0/search/jobs?query=<término>&per_page=30&page=<n>
```

Cubre Chile, Argentina, Perú, Colombia, México, Uruguay, Ecuador y remoto LATAM. No hay que configurar país, los avisos traen `remote`, `remote_zone` y `countries`.

Lo corre `scripts/getonbrd-sweep.js` sin configuración.

---

## 2. LinkedIn — global

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

## 3. Computrabajo — LATAM, con subdominio por país

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

## 5. Fuentes que no son portales

Los mejores hallazgos muchas veces no vienen del buscador de empleos.

**Posts orgánicos de reclutadores.** Gente publicando "estoy buscando un...". Cuando el hallazgo viene de ahí, la vía de postulación preferida **no es el formulario**, es escribirle directo a quien publicó. Es la vía que mejor convierte.

**Páginas de empleo de las empresas.** Cuando una empresa aparece con calce, abre su página completa. Suelen tener cargos vecinos que calzan mejor y que no salieron en la búsqueda por palabra clave.

**Agencias de staff augmentation.** Si trabajas remoto para otro país, una sola relación con una agencia rinde más que veinte postulaciones ciegas.

---

## Ciudadanía y derecho a trabajo

Si tienes pasaporte o residencia de otro país, ponlo en `perfil.md`. Abre mercados enteros que de otra forma el barrido descarta por ubicación.

Y ojo con esto. **el filtro "Remote" de LinkedIn devuelve el país de la oficina, no la modalidad.** Para remoto de verdad hay que leer el detalle o usar portales que lo modelen como campo. Ver lección 4.
