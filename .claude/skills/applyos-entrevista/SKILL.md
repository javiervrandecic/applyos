---
name: applyos-entrevista
description: Prepara una entrevista de trabajo (playbook por cargo con opener, tres historias, preguntas y renta) y evalúa la entrevista después con transcripción diarizada en AssemblyAI, métricas duras (% de habla, apertura, turnos largos, muletillas) y tabla de lecciones. Úsala cuando la persona diga "tengo una entrevista", "prepárame para esta entrevista", "evalúa mi entrevista", "diariza este audio" o entregue una grabación o transcripción de una entrevista.
---

# applyOS. Entrevista, antes y después

Dos partes. La parte 1 prepara. La parte 2 evalúa con datos, no con la sensación.

## Antes de empezar

1. Lee `~/.applyos/config.json` para ubicar perfil, CV maestro, tracker, carpeta de entrevistas y grabaciones. Si no existe, pregunta.
2. Lee **completo** el archivo de lecciones de la persona (`entrevistas/LECCIONES-ENTREVISTAS.md`). Si no existe, créalo desde `references/lecciones.ejemplo.md`.

## Parte 1. Preparar (antes de la entrevista)

1. Lee el aviso completo y el perfil. Marca requisitos duros y deseables, que son el mapa de lo que van a preguntar.
2. Investiga la empresa, quién entrevista y un hueco real de su producto.
3. Arma un **playbook corto** por cargo, para leerlo bajo presión y no para estudiarlo. Solo frases literales y bullets.
   - Opener de 90 segundos máximo, con la estructura de `references/preparacion.md`.
   - Tres historias (algo que construiste, algo que salió mal, algo donde tradujiste entre áreas) en menos de 2 minutos cada una.
   - Respuestas a las preguntas probables, sacadas de los requisitos duros.
   - Tres preguntas tuyas, ninguna de logística.
   - La cifra de renta, decidida antes de entrar. Si no la tiene, pregúntala.
4. Cruza el playbook con las lecciones: ¿qué patrón activo hay que vigilar?
5. Recuerda grabar (ver `references/grabacion.md`) y pedir consentimiento antes.
6. Guarda el playbook en `entrevistas/playbooks/<empresa>-<fecha>.md`.

## Parte 2. Evaluar (después)

1. **Material.** Pide la grabación o la transcripción. Si es audio, sigue `references/diarizar.md` (instructivo completo): corre `scripts/diarizar.js <audio> --salida entrevistas/evaluaciones --nombre <empresa-fecha>`. Necesita Node 18+ y la variable `ASSEMBLYAI_API_KEY`. Si la variable no existe, explica cómo crearla y no la pidas por el chat: nunca escribas una clave en un archivo ni en un mensaje.
2. **Quién es quién.** Corre `scripts/metricas.js <json>` sin `--candidato`, muestra la primera frase de cada hablante y confirma cuál es la persona. Si una frase que solo diría el entrevistador está atribuida a ella, están invertidos.
3. **Métricas.** `scripts/metricas.js <json> --candidato <letra>`. Usa esos números tal cual. **"Sin dato" es válido. Nunca estimes.**
4. **Evidencia antes que patrón.** Busca primero la evidencia directa de esa conversación. Si contradice un patrón conocido, dilo y no fuerces el patrón.
5. **Dos ejes separados.** Resultado del proceso (cita textual de lo que dijo el entrevistador sobre próximos pasos) y calidad de las respuestas. No se mezclan.
6. **Tabla por etapa**: apertura, preguntas técnicas, experiencia y contexto, preguntas del candidato, renta, cierre. Cada nota con cita textual y hora al lado.
7. **Corrige máximo dos cosas**, cada una como comportamiento observable.
8. **Verifica toda cita** contra el archivo fuente, incluida la atribución.
9. **Guarda** la evaluación en `entrevistas/evaluaciones/<empresa>-<fecha>.md` y agrega una fila a la tabla de métricas del archivo de lecciones (siempre agregar, nunca reemplazar). Pasa un patrón a "confirmado" solo con evidencia de dos o más entrevistas independientes.
10. **Tracker.** Registra el resultado y el próximo paso en `tracker.md`.

Estructura de la evaluación y trampas al usar IA para evaluar en `references/evaluacion.md`.

## Qué pregunta

- Cuál hablante es la persona, si hay duda.
- Si no hay grabación, pide sus notas inmediatas, de la primera hora.
- Cuál era el objetivo de la entrevista (screening, técnica, con jefe) para comparar el % de habla contra la referencia correcta.

## Reglas

- Una nota sin cita ni número es una impresión. No la pongas.
- Un cierre cálido no valida una respuesta débil.
- Una evaluación que parece injusta se revisa con evidencia nueva, no subiendo la nota por presión.
- Las transcripciones y evaluaciones son personales: nunca se suben al repo (están en el `.gitignore`).

## Archivos

- `references/preparacion.md`, `evaluacion.md`, `grabacion.md`, `diarizar.md`, `lecciones.ejemplo.md`.
- `scripts/diarizar.js`, `scripts/metricas.js`, `scripts/ejemplo/entrevista-sintetica.diarizado.json` (para probar sin cuenta ni red).
