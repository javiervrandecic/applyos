# Tracker (plantilla)

Copia a `tracker.md`. Está en el `.gitignore`, porque acá queda tu búsqueda completa.

**Este archivo es el que hace que el sistema funcione a largo plazo.** Es la fuente de la deduplicación, del reporte de embudo y de las lecciones. Sin él, cada barrido te vuelve a mostrar lo mismo y no aprendes nada de lo que ya pasó.

Regla de oro. **Todo cargo tocado deja una fila, incluidos los descartes evidentes.** Un descarte sin registrar se vuelve a evaluar el mes siguiente.

Las cinco filas de ejemplo son inventadas. Ninguna empresa ni persona existe. Bórralas cuando empieces.

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

| Empresa | Cargo | Familia y calce | Estado y detalle | Vía de entrada | Próximo paso |
|---|---|---|---|---|---|
| Empresa Alfa SpA | Analista de Automatización | C, Fuerte | **POSTULADA 12-03-2026**. Integraciones y CRM en el núcleo. Renta declarada USD 3.500. | Formulario del portal | Seguimiento el 19-03 si no responden |
| Beta Seguros | Líder de Adopción Digital | B, Oro | **ENTREVISTA 1 realizada 14-03-2026** con Nombre Apellido (selección). Cierre positivo, pasa a jefatura. Rango confirmado por ellos. | Contacto humano directo | Esperar respuesta, semana del 17-03 |

**Qué anotar sí o sí en cada fila:**
- Fecha exacta de cada movimiento, absoluta y no relativa. "12-03-2026", nunca "la semana pasada"
- **La renta que declaraste**, con el número exacto. Es lo que te permite después cruzar si tu ancla está espantando procesos o no
- Nombre de quien te contactó, para poder escribirle directo
- **La vía de entrada.** formulario, portal propio de la empresa, correo o contacto humano. Es lo que después se mide, no el portal

---

## Procesos cerrados

| Empresa | Cargo | Resultado |
|---|---|---|
| Gamma Retail | Consultor de Implementación | **Rechazado 10-03-2026**, correo genérico sin motivo. Se pidió feedback específico, sin respuesta. |

Distingue rechazo de ghosteo. Son fenómenos distintos y en volumen te dicen cosas distintas sobre en qué etapa se rompe tu proceso.

---

## Descartados en barrido

| Empresa | Cargo | Motivo | Publicado | Renta publicada | Decisión | Fecha |
|---|---|---|---|---|---|---|
| Delta Consultores | QA Automation | Nivel 1. SKIP en bloque. "Automatización" del título es de pruebas, no de procesos. | 08-03-2026 | sin publicar | descartado | 12-03-2026 |
| Épsilon Labs | Ingeniero de Soluciones | Nivel 2, leído el detalle. 6 requisitos duros, fallan 2 (SQL avanzado y FastAPI). Calce Puente, familia A. | 20-02-2026 | USD 2.800-3.200 | **pendiente de decisión** | 12-03-2026 |

**El motivo tiene que ser real, no supuesto.** "No calza" no sirve. "El núcleo son 5 años de Kubernetes y la IA aparece una vez como deseable" sirve, porque dentro de tres meses vas a entender por qué lo descartaste.

**La columna Decisión importa.** Un calce que quedó "pendiente de decisión" no puede desaparecer del informe siguiente solo porque el barrido delta ya no lo muestra como nuevo. Cada informe lista aparte los pendientes con su fecha, y tú decides postular, descartar o dejarlo vencer.

---

## Anclas de renta por título

El mercado paga distinto por el mismo trabajo según cómo lo nombre. Ir con un solo número a todos los procesos te hace perder plata en unos y quedar fuera en otros.

| Familia de cargo | Tu ancla | Piso real |
|---|---|---|
| <Ingeniero / Especialista, remoto internacional> | <monto> | <monto> |
| <Ingeniero / Especialista, local> | <monto> | <monto> |
| <Jefatura o Lead> | <monto, más alto que el anterior> | <monto> |
| <Puente, junior o analista> | <monto, más bajo y explícito> | <monto> |

Actualízala cuando un proceso te confirme un rango real. Ese dato vale más que cualquier estudio de mercado, porque viene de tu propio mercado y de tu propio perfil.

---

## Registro de barridos

Obligatorio, incluso para un chequeo rápido de un solo portal. Si no queda acá en el momento, después no hay forma de reconstruir cuándo se miró qué.

| Fecha y hora | Portales y método | Resultado |
|---|---|---|
| 12-03-2026 10:40 | Get on Board (85 únicos, 14 términos, todos hasta la última página), LinkedIn (6 búsquedas, hasta start=40), portal local | 3 candidatos nuevos, 24 descartados con motivo, 1 pendiente de decisión. Computrabajo dio 403 dos veces, revisado a mano. |

Sirve para tres cosas. Ver si un portal dejó de rendir, detectar cuando un barrido devolvió sospechosamente poco (casi siempre significa que algo se rompió y no que el mercado se secó), y calcular qué portal **descubre** más calces, que no es lo mismo que cuál convierte.
