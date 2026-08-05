# Tracker (plantilla)

Copia a `tracker.md`. Está en el `.gitignore`, porque acá queda tu búsqueda completa.

**Este archivo es el que hace que el sistema funcione a largo plazo.** Es la fuente de la deduplicación, del reporte de embudo y de las lecciones. Sin él, cada barrido te vuelve a mostrar lo mismo y no aprendes nada de lo que ya pasó.

Regla de oro. **Todo cargo tocado deja una fila, incluidos los descartes evidentes.** Un descarte sin registrar se vuelve a evaluar el mes siguiente.

---

## Resumen del embudo

| Etapa | Total |
|---|---|
| 1. Cargos analizados | 0 |
| 2. Postulados | 0 |
| 3. Contacto humano real | 0 |
| 4. Entrevista 1 | 0 |
| 5. Entrevista 2 | 0 |
| 6. Carta de oferta | 0 |

> Recuenta esto contra las tablas de abajo antes de generar el dashboard, no de memoria. Si las dos fuentes difieren, se arregla el conteo, no el dashboard.

---

## Procesos activos

| Empresa | Cargo | Estado y detalle | Próximo paso |
|---|---|---|---|
| Ejemplo SpA | AI Automation Engineer | **POSTULADA 12-03-2026** vía Get on Board. Calce fuerte, n8n y agentes en el núcleo. Renta declarada USD 4.500. Reclutador. Nombre Apellido. | Seguimiento el 19-03 si no responden |
| Otra Empresa | Jefe de Transformación Digital | **ENTREVISTA 1 realizada 14-03-2026** con Nombre (RR.HH.). Cierre positivo, pasa a jefatura. Rango confirmado por ellos. | Esperar respuesta, semana del 17-03 |

**Qué anotar sí o sí en cada fila:**
- Fecha exacta de cada movimiento, absoluta y no relativa. "12-03-2026", nunca "la semana pasada"
- **La renta que declaraste**, con el número exacto. Es lo que te permite después cruzar si tu ancla está espantando procesos o no
- Nombre de quien te contactó, para poder escribirle directo
- Por dónde entraste. formulario, portal propio de la empresa o contacto humano

---

## Procesos cerrados

| Empresa | Cargo | Resultado |
|---|---|---|
| Empresa Cerrada | AI Specialist | **Rechazado 10-03-2026**, email genérico sin motivo. Se pidió feedback específico, sin respuesta. |
| Otra Cerrada | Automation Engineer | **Ghosteo.** Hubo entrevista el 02-03 y después silencio total, sin rechazo formal. |

Distingue rechazo de ghosteo. Son fenómenos distintos y en volumen te dicen cosas distintas sobre en qué etapa se rompe tu proceso.

---

## Descartados en barrido

| Empresa | Cargo | Motivo | Fecha |
|---|---|---|---|
| Empresa X | QA Automation | SKIP en bloque. "Automatizador" del título es automatización de pruebas, no de negocio. Selenium y Appium 3+ años. | 12-03-2026 |
| Empresa Y | Data Scientist | SKIP en bloque, disciplina distinta. Presencial, pub. 08-03. | 12-03-2026 |
| Empresa Z | Ingeniero de Soluciones | Nivel 2 verificado con detalle. La IA es 1 de 3 funciones, el núcleo es ingeniería de datos. SQL avanzado y FastAPI son huecos duros. Pub. 20-02, 100+ postulaciones. | 12-03-2026 |

**El motivo tiene que ser real, no supuesto.** "No calza" no sirve. "El núcleo son 5 años de Kubernetes y la IA aparece una vez como deseable" sirve, porque dentro de tres meses vas a entender por qué lo descartaste.

Anota también **la fecha de publicación del aviso y el rango salarial si estaba publicado**. Vienen gratis en los datos del barrido y después sirven para calibrar el mercado.

---

## Anclas de renta por título

El mercado paga distinto por el mismo trabajo según cómo lo nombre. Ir con un solo número a todos los procesos te hace perder plata en unos y quedar fuera en otros.

| Familia de cargo | Tu ancla | Piso real |
|---|---|---|
| <Ingeniero / Especialista, remoto internacional> | <monto> | <monto> |
| <Ingeniero / Especialista, local> | <monto> | <monto> |
| <Jefatura o Lead> | <monto, más alto que el anterior> | <monto> |
| <Docencia, consultoría, por hora> | <monto/hora> | <monto/hora> |

Actualízala cuando un proceso te confirme un rango real. Ese dato vale más que cualquier estudio de mercado, porque viene de tu propio mercado y de tu propio perfil.

---

## Registro de barridos

| Fecha | Portales | Resultado |
|---|---|---|
| 12-03-2026 | Get on Board (85 únicos, 14 términos), LinkedIn (6 búsquedas), portal local | 3 candidatos nuevos, 24 descartados con motivo. Computrabajo bloqueado. |

Sirve para dos cosas. Ver si un portal dejó de rendir, y detectar cuando un barrido devolvió sospechosamente poco, que casi siempre significa que algo se rompió y no que el mercado se secó.
