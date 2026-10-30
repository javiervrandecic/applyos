---
name: applyos-postulacion
description: Prepara una postulación a un cargo elegido: tabla de requisitos contra tu CV maestro, CV adaptado al cargo en PDF y en el idioma del aviso (desde el maestro en español o en inglés) sin inventar nada, actualización del maestro con lo nuevo, respuestas reutilizables para formularios, mensaje o correo listo para copiar y registro de la postulación en el tracker. Úsala cuando la persona diga "prepara la postulación", "adapta mi CV a este aviso", "responde este formulario" o "redacta el correo para este cargo".
---

# applyOS. Postulación

Parte de un aviso que ya pasó por `applyos-busqueda`. Deja todo listo y registrado, pero nunca envía nada.

## Antes de empezar

1. Lee `~/.applyos/config.json` (rutas de los CV maestros en español e inglés, perfil y tracker). Si no existe, pregunta dónde están.
2. Lee `perfil.md`, el CV maestro y `references/estandar-cv.md` completo, antes de generar nada.
3. Si no hay CV maestro, ofrece partir de `assets/cv-maestro.ejemplo.html` y pide los datos reales a la persona. No inventes experiencia.
4. Lee las últimas filas de "Registro de sesiones" en `tracker.md` para saber dónde quedó la persona. Al terminar, agrega una fila con fecha y hora, qué se hizo y qué queda pendiente.

## Pasos

1. **Lee el aviso completo** y extrae literal la sección de cómo postular.
2. **Canal por correo.** Si el aviso menciona un correo, márcalo arriba y en negrita y redacta el correo completo (para, asunto, cuerpo, adjunto). El formulario no reemplaza al correo.
3. **Tabla de requisitos.** Cada requisito del aviso, si lo cumples (sí, parcial, no) y la evidencia en el CV maestro.
4. **Palabras clave sin mentir.** Separa las que SÍ tienes pero no escribiste así (se pueden usar) de las que NO tienes (prohibido agregarlas, se declaran como gap).
5. **CV adaptado.** En el idioma del aviso, desde el maestro de ese idioma (`cv_maestro` o `cv_maestro_en`). Si falta el maestro en inglés, ofrece crearlo desde el de español en vez de traducir un adaptado. Siempre desde el maestro, nunca desde otro adaptado. El tailoring es de énfasis y orden. Las cifras verificadas quedan tal cual. Genera el PDF con el flujo de `references/estandar-cv.md`.
6. **Verifica el PDF leyéndolo completo.** Que se escriba sin error no prueba que funcione.
7. **Formularios.** Usa y amplía `references/respuestas-formularios.md`. Las respuestas salen de `perfil.md` y del CV maestro. La renta sale de la tabla de anclas del tracker, según la familia del cargo y si es local o internacional en inglés. Responde con tu material real, nunca con relleno. Mira el formulario antes de abrir el link si la plataforma lo permite.
8. **Mensaje o correo.** Plantillas en `references/mensajes.md`. Tú/ustedes, corto, con una afirmación verificable.
9. **Puntos clave para la entrevista.** 3 a 5. Si la persona avanza, sigue con `applyos-entrevista`.
10. **Actualizar el maestro.** Si en la postulación apareció material nuevo y verificable (una cifra, un proyecto, una herramienta usada de verdad), lista los cambios y, con la aprobación de la persona, agrégalos a los dos maestros. Nunca solo al CV adaptado.
11. **Registrar** sin que lo pidan: empresa, cargo, familia, calce, CV usado, renta declarada, vía de entrada, fecha y próximo paso.

## Seguimiento

Cada postulación tiene un estado en el tracker: `CV listo, sin enviar` → `enviado` → `contacto humano` → `entrevista 1` → `entrevista 2` → `oferta` o `cerrado`. Al retomar, revisa las filas enviadas hace más de 7 días sin respuesta y propone un mensaje de seguimiento de `references/mensajes.md`. La vía de entrada (formulario ciego o contacto directo) se registra siempre, porque es lo que mide el embudo.

## Reglas

- **Nunca marques algo como enviado** sin confirmación explícita de la persona. Redactado no es enviado.
- Nunca inventes tecnologías, niveles ni cifras. Un nivel inflado se cae en la primera entrevista técnica.
- Credenciales: si registras por API, la clave se lee de una variable de entorno y nunca se escribe en el tracker ni en el chat.

## Archivos

- Lee: `perfil.md`, CV maestro, `tracker.md`, `references/*`.
- Escribe: CV adaptado en `cv/`, los CV maestros (solo con aprobación), la fila de la postulación en `tracker.md`.
- `assets/cv-maestro.ejemplo.html`: plantilla de CV maestro con datos inventados.
