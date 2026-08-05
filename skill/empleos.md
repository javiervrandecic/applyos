# /empleos — Barrido de portales y análisis de calce

Busca empleos en todos los portales configurados, analiza el calce real de cada aviso contra tu perfil, y prepara la postulación.

**Antes de ejecutar, lee `perfil.md`, `portales.md` y `cv/ESTANDAR-CV.md`.** Sin el perfil el barrido devuelve ruido.

---

## Paso 1 — Get on Board (fuente principal)

API pública, sin autenticación, con búsqueda de texto completo. **Es el único portal donde buscar por stack funciona bien**, así que acá van los términos de tecnología de `perfil.md`.

```
https://www.getonbrd.com/api/v0/search/jobs?query=<término>&per_page=30&page=<n>
```

Lo automatiza `scripts/getonbrd-sweep.js`.

## Paso 2 — LinkedIn

```
https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=<término>&location=<país>&f_TPR=r1296000&sortBy=DD&start=<n>
```

**Cuatro reglas obligatorias**, todas con evidencia en `LECCIONES.md`.

1. **Ventana de 15 días** (`f_TPR=r1296000`), no de 7. Los avisos de jefatura viven semanas.
2. **Paginar.** Devuelve 10 por llamada. Pedir `start=0`, `10`, `25` hasta que devuelva menos de 10.
3. **Buscar por título de cargo, no por stack.** Su buscador pesa el título y no matchea el cuerpo del aviso.
4. **`location=Remote` no significa remoto.** Devuelve el país de la oficina. Úsalo solo para detectar mercados a los que puedes postular por ciudadanía.

## Paso 3 — Portales locales

Los de `portales.md`. **Usa el buscador por término, no el listado por categoría**, que suele truncar en 30 sin avisar. Y pagina.

Si un portal bloquea el scraping, **no lo saltes en silencio.** Dile al usuario que lo revise a mano y pásale los links con el filtro de fecha ya puesto.

## Paso 4 — Deduplicar contra lo ya postulado

Lee el tracker antes de mostrar nada y excluye lo que ya está.

**El cruce es por EMPRESA, no por empresa más título exacto.** Las empresas republican el mismo cargo con nombres distintos. Si la empresa aparece en cualquier parte del tracker, aunque sea con otro título o de hace meses, verifica si es el mismo rol antes de tratarlo como nuevo.

---

## Paso 5 — Verificación en dos niveles

Abrir el detalle de 90 avisos no es práctico. Descartarlos por el título tampoco. Medición real. de 24 avisos descartados solo por título, **3 escondían un calce real**.

**Nivel 1, descartable sin abrir el detalle:**
- Ubicación explícitamente fuera de rango.
- Nivel junior, trainee o práctica declarado en el título.
- Disciplina de negocio pura sin ninguna palabra técnica.

**Nivel 2, obliga a leer el detalle antes de decidir CUALQUIER cosa:**
- Todo título con Engineer, Developer, Lead, Architect, Analyst, Especialista, Ingeniero o Gestor más una palabra técnica. **Da igual si suena genérico o si suena prometedor, los dos fallan por título solo.**

**Al leer el detalle, pide la lista COMPLETA de requisitos con años y nivel exacto de cada uno, no un resumen narrativo.** Un resumen condensa seis requisitos en una impresión general y hace fácil quedarse con la señal más llamativa. Trata cada línea como un chequeo binario, cuenta cuántas fallan, y recién ahí decide.

**Distingue núcleo de adorno.** Si la tecnología atractiva está en "deseable" o "será un plus" y el filtro duro es otra cosa, no estás compitiendo donde crees.

**Falso positivo conocido.** Hay publicaciones desde páginas de empresa que son personas anunciando su propia disponibilidad, no ofertas. Señal. la descripción está en primera persona o nombra a alguien con sus "current roles". Descartar sin registrar.

## Paso 6 — Si una empresa calza, revisa todas sus vacantes

Abre su página de empleos completa. Suelen tener cargos vecinos que calzan mejor y que no salieron por palabra clave.

## Paso 7 — Registrar TODO

**Cada aviso tocado deja una fila**, sea Nivel 1 o Nivel 2, sea calce o descarte evidente. Empresa, cargo, motivo aunque sea de una línea, fecha de publicación y rango salarial si está publicado.

Nunca descartes en silencio ni dejes solo un conteo hablado. Este registro es lo que protege el barrido siguiente.

---

## Paso 8 — Presentar

Ordena por zona de calce y recencia. Formato por aviso:

```
N. [TÍTULO] — [EMPRESA]
   [Ubicación] | [Renta o "sin publicar"] | [hace X días]
   CALCE: [Oro/Fuerte/Puente] — [una línea: por qué calza y cuál es el gap]
   [URL]
```

**Una renta baja no descarta si el calce es bueno.** Márcala como "bajo tu piso pero vale postular" en vez de omitirla. Se postula pidiendo la tarifa propia, no la del aviso.

Después pregunta cuál preparar.

## Paso 9 — Preparar la postulación

1. Lee `cv/ESTANDAR-CV.md` **antes** de generar nada.
2. Genera el CV adaptado desde el maestro. **El tailoring es de énfasis y orden, nunca de invención.**
3. Usa las frases exactas del aviso para nombrar lo que ya hiciste, siempre que sea verdad.
4. Verifica el PDF **leyéndolo completo** antes de entregarlo. Un archivo escrito sin error no es un archivo que funciona.
5. Prepara 3 a 5 puntos clave para la entrevista.

## Paso 10 — Registrar la postulación

Sin que el usuario lo pida. Empresa, cargo, CV usado, renta declarada, fecha y próximo paso.

**Nunca marques algo como enviado sin confirmación explícita del usuario.** Dejarlo redactado y listo no es haberlo enviado.

---

## Reporte de embudo

Cada dos días o cuando lo pidan. Etapas. analizados, postulados, contacto humano real, primera entrevista, segunda entrevista, oferta. Con la conversión de cada etapa **respecto de la anterior**, no respecto del total.

**No midas qué portal convierte mejor.** Mezcla descubrimiento con postulación y los denominadores no son comparables. Mide la **vía de entrada**, formulario ciego contra contacto humano directo. Ver lección 10.
