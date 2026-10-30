---
name: applyos-embudo
description: Genera el reporte del embudo de tu búsqueda de empleo etapa por etapa desde el tracker (analizados, postulados, contacto humano, entrevistas, oferta), con conversión respecto de la etapa anterior, pipeline vivo, dashboard HTML, PDF e informe de cierre. Úsala cuando la persona pida "reporte de embudo", "cómo va mi búsqueda", "dashboard", "informe de cierre" o comparar su conversión contra un periodo anterior.
---

# applyOS. Embudo y reportes

Convierte el tracker en números y decisiones. No inventa datos: lo que no está en el tracker se informa como "sin dato".

## Antes de empezar

1. Lee `~/.applyos/config.json` para ubicar el tracker y el dashboard. Si no existe, pregunta dónde está el tracker.
2. Lee `tracker.md` completo. **Recuenta las etapas desde las tablas, no desde el resumen**. Si difieren, se arregla el conteo, no el dashboard.
3. Lee las últimas filas de "Registro de sesiones" en `tracker.md` para saber dónde quedó la persona. Al terminar, agrega una fila con fecha y hora, qué se hizo y qué queda pendiente.

## Pasos

1. **Contar por etapa.** Analizados, postulados, contacto humano real, entrevista 1, entrevista 2, oferta. Cada conversión es respecto de la etapa anterior, no del total.
2. **Pipeline vivo.** Cada proceso abierto con su etapa, los días sin movimiento y la próxima acción. Marca los que llevan más de 7 días sin respuesta.
3. **Vía de entrada.** Compara formulario ciego contra contacto humano directo. Es lo que se mide para conversión.
4. **Portales.** Mide descubrimiento (calces por aviso revisado, desde el registro de barridos), no conversión. Los denominadores chicos engañan y la conversión no se le atribuye al portal.
5. **Dashboard.** Copia `assets/embudo.ejemplo.html` a `dashboard/embudo.html`, reemplaza los datos de ejemplo por los reales y revisa que cada cifra coincida con el paso 1.
6. **PDF** (opcional, requiere Chrome, Chromium o Edge): `node scripts/dashboard-pdf.js dashboard/embudo.html embudo.pdf`. Léelo completo antes de entregarlo.
7. **Comparación.** Contra tu periodo anterior (el reporte anterior guardado) y contra tus lecciones. Mira `references/comparacion.md` sobre qué se puede y qué no se puede comparar.
8. **Informe de cierre**, cuando la búsqueda termina: resultado, camino de entrada, qué funcionó por vía, tiempos entre etapas, y qué harías distinto. Formato en `references/comparacion.md`.

## Qué escribe y qué pregunta

- Escribe: `dashboard/embudo.html`, el PDF y, si lo pide, el informe de cierre.
- No modifica el tracker salvo para corregir conteos, y avisa cuáles.
- Pregunta solo si falta el tracker o si hay un estado ambiguo (por ejemplo, algo "enviado" sin confirmación).

## Reglas

- Una solicitud enviada o un correo mandado no es "contacto humano". Contacto es respuesta real de una persona.
- Con menos de unas diez postulaciones, las conversiones son anecdotas. Dilo en el reporte.
- Informa la distribución cruda (3 de 12) junto al porcentaje.

## Archivos

- `scripts/dashboard-pdf.js`: HTML a PDF por Chrome headless. Node 22 o superior.
- `assets/embudo.ejemplo.html`: dashboard con datos inventados.
- `references/comparacion.md`: comparación e informe de cierre.
