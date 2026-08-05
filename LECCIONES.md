# Lecciones

Hallazgos medidos construyendo y usando applyOS. Cada uno salió de un error real con costo real, no de leer documentación.

El más caro de todos se descubrió auditando el sistema contra una búsqueda manual. 24 avisos recolectados a mano se cruzaron contra lo que el barrido automático había encontrado el mismo día.

| Portal | Encontrados a mano | Los tenía el barrido | Cobertura |
|---|---|---|---|
| Get on Board | 9 | 6 | 67% |
| **LinkedIn** | **13** | **1** | **8%** |
| ChileTrabajos | 2 | 0 | 0% |

El barrido de LinkedIn estaba estructuralmente roto y no había forma de notarlo desde adentro, porque devolvía resultados y todos parecían razonables. Estas son las causas.

---

## 1. La ventana de 7 días es la trampa más cara

LinkedIn filtra por fecha con `f_TPR`. `r604800` son 7 días, que parece lo obvio si quieres avisos frescos.

Es un error. Los avisos de jefatura y de empresas grandes viven **semanas**, y el proceso sigue abierto todo ese tiempo. Con la ventana en 7 días se perdieron 5 candidatos solo por antigüedad, incluido el mejor pagado de todo el barrido, publicado hacía un mes.

**Usa `f_TPR=r1296000`, que son 15 días.** El ruido extra es mínimo comparado con lo que recuperas.

---

## 2. Todos los listados están paginados y no te avisan

El endpoint público de LinkedIn:

```
https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=...&location=...
```

devuelve **10 resultados** y ni un mensaje que diga que hay más. Si no pides `&start=10`, `&start=25`, crees que viste todo el mercado cuando viste la punta.

Lo mismo con la API de Get on Board (`per_page`, por defecto bajo) y con los listados por categoría de los portales locales, que truncan alrededor de 30.

**Pagina siempre, hasta que una llamada devuelva menos que el tope.** Y ordena por fecha descendente, nunca por relevancia, porque el orden por relevancia es una caja negra que cambia sin avisar.

---

## 3. LinkedIn no busca dentro del cuerpo del aviso

Este es el hallazgo menos obvio y el más útil.

Buscar `n8n` con `location=Chile` devolvió **2 resultados**. En el mismo barrido, tres avisos distintos nombraban n8n explícitamente en su descripción y ninguno apareció.

No fue la paginación, porque el tope es 10 y devolvió 2. **El buscador de LinkedIn pesa el título del cargo y no matchea de forma confiable las palabras enterradas en la descripción.**

Consecuencia práctica:

- **En LinkedIn, busca por variantes de título de cargo.** "especialista IA", "ingeniero IA", "gestor IA", "arquitecto de inteligencia artificial", "Director of AI". Cada una de esas encontró un aviso que las otras no.
- **En Get on Board, busca por stack.** Su API hace búsqueda de texto completo, así que `n8n`, `LangChain`, `MCP` y `RAG` sí funcionan ahí.

Usar la misma lista de términos en los dos portales desperdicia la mitad del barrido.

---

## 4. `location=Remote` no significa remoto

Cuatro búsquedas con `location=Remote` devolvieron 40 resultados. Todos presenciales, en Estados Unidos, Reino Unido, Australia, Singapur, Vietnam e Israel. Cero remoto de verdad.

**El filtro devuelve el país de la oficina que publica, no la modalidad de trabajo.** Para remoto real hay que leer el detalle de cada aviso o usar portales que sí lo modelen como campo (Get on Board tiene `remote` y una política de "remoto sólo localmente" con los países permitidos).

Ese barrido no es inútil, pero su valor es otro. Sirve para detectar mercados a los que sí puedes postular por ciudadanía o por convenio, no para encontrar remoto.

---

## 5. Un cargo con fit nunca viene solo

Las empresas republican el mismo puesto con títulos distintos para aparecer en más búsquedas por palabra clave. Y además publican cargos vecinos que calzan mejor que el que encontraste.

Caso real. El barrido encontró un "Jefe de Transformación Digital y Procesos" de una empresa, lo evaluó, y nunca revisó qué más publicaba esa empresa. En su página de empleos estaba un "Subgerente de IA y Productos Digitales" que calzaba mucho mejor.

**Cuando una empresa aparece con calce, abre su página de empleos completa antes de darla por barrida.**

---

## 6. Descartar por título cuesta más de lo que parece

Abrir el detalle de 90 avisos no es práctico. Descartarlos todos por el título tampoco.

La medición. de 24 avisos descartados solo por su título, al verificarlos uno por uno **3 escondían un calce real** detrás de un nombre genérico. Un 12,5% de pérdida silenciosa.

La regla que funciona son dos niveles.

**Nivel 1, descartable sin abrir:** ubicación explícitamente fuera de rango, nivel junior o práctica declarado en el título, y disciplina de negocio pura sin ninguna palabra técnica.

**Nivel 2, obliga a abrir el detalle:** cualquier título con Engineer, Developer, Lead, Architect, Analyst, Especialista o Ingeniero más una palabra técnica. **Los dos casos fallan por título solo**, tanto el que suena genérico como el que suena prometedor.

---

## 7. Pide la lista de requisitos, no un resumen

Cuando le pides a un modelo que resuma un aviso ("¿tiene componente de IA, sí o no?"), condensa seis requisitos con años y niveles específicos en una impresión general. Y esa impresión hace fácil quedarse con la señal más llamativa y subestimar el peso acumulado del resto.

**Pide siempre la lista completa de requisitos con los años y el nivel exacto de cada uno.** Después trata cada línea como un chequeo binario, cuenta cuántas fallan, y recién ahí decide.

Si 4 de 6 requisitos duros son stack que no manejas, es un descarte aunque una línea mencione IA.

---

## 8. Distingue lo que es núcleo de lo que es adorno

Muchos avisos ponen la tecnología atractiva en la sección de deseables y el filtro duro en otra parte.

Caso real. Un aviso de IA listaba agentes, MCP, RAG y n8n de forma muy específica, pero todo eso estaba bajo "será un plus". Lo obligatorio eran 8 años liderando productos digitales.

Eso cambia por completo la lectura del aviso. **Si tu diferenciador está en la sección opcional y el filtro duro es algo que no tienes, no estás compitiendo donde crees.**

---

## 9. No todo lo que parece una oferta lo es

Existen publicaciones hechas desde páginas de empresa que en realidad son **personas anunciando su propia disponibilidad**.

Cómo detectarlas. La descripción está en primera persona, o nombra a una persona con su experiencia y sus "current roles" actuales. Se filtran antes de registrarlas.

---

## 10. Mide la vía de postulación, no el canal

Es tentador medir qué portal convierte mejor. No sirve, por dos razones.

**Mezcla descubrimiento con postulación.** Ves el aviso en LinkedIn y terminas postulando en el portal propio de la empresa, en un ATS de terceros o por mensaje directo al reclutador. Atribuirle la conversión "al portal" junta dos cosas distintas.

**Y los denominadores no son comparables.** Un portal con 15 postulaciones y otro con 60 producen porcentajes con estabilidad estadística muy distinta, y ponerlos lado a lado engaña.

Lo que sí vale medir es la **vía de entrada**, o sea formulario ciego contra contacto humano directo a quien publicó. Esa distinción sí cambia lo que haces mañana.
