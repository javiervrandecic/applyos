# Diarizar una entrevista y medirte con datos

Instructivo completo para pasar de "creo que me fue bien" a números reales. Lo usa la skill `applyos-entrevista`, pero funciona solo con los dos scripts.

Precios, límites y políticas de abajo se verificaron en las páginas oficiales el **2026-10-28**. Cambian seguido: antes de contar con una cifra, revisa la fuente. Lo que no pude confirmar dice **no verificado**.

---

## a) Qué es diarizar y por qué sirve

Diarizar es separar una grabación por quién habla. El resultado es una lista de turnos con hablante, hora de inicio y fin, y texto.

Con eso mides lo que la memoria no entrega.

- **Porcentaje de tiempo de habla.** Cuánto hablaste tú frente al entrevistador.
- **Quién interrumpe a quién.**
- **Turnos largos.** Cuántas veces hablaste más de un minuto seguido.
- **Apertura.** Cuánto duró tu respuesta a "cuéntame de ti".
- **Muletillas por minuto.**

El patrón más repetido en candidatos técnicos es hablar de más, y es difícil verlo desde adentro porque hablar se siente como demostrar.

## b) Cómo grabar

**Antes de grabar, avisa y pide consentimiento.** Las reglas sobre grabar una conversación cambian según el país y a veces según la región. En algunos lugares basta con que uno de los participantes lo sepa y en otros se necesita el de todos. Averigua la regla de tu jurisdicción, no la asumas. "¿Te molesta si grabo para tomar notas después?" casi nunca recibe un no. Usa la grabación solo para tu revisión y no la compartas. Esto no es asesoría legal.

**En PC, lo mejor.** Dos pistas separadas, tu micrófono y el audio del sistema, con OBS (gratis). Cada voz queda en su pista y no hace falta diarizar, porque la separación es perfecta. Paso a paso en `entrevistas/GRABACION.md`. Graba en mkv, que no se corrompe si algo se cae.

**En PC, simple.** La grabadora integrada de la aplicación de videollamada, si eres anfitrión y el aviso de grabación se muestra a todos. O la grabadora de voz del sistema apuntando al audio. Queda una pista mezclada y ahí sí diarizas.

**En celular.** Una grabadora de voz con el teléfono cerca del parlante si la llamada es por el computador, o la grabadora de llamadas nativa donde sea legal y esté disponible. Pon el teléfono sobre una superficie firme, a 30 cm de la fuente.

**Presencial.** Grabadora o teléfono en la mesa, entre ambos, sin tapar el micrófono. Prueba 10 segundos antes y escúchalos. Un espacio con eco empeora la separación.

En todos los casos, renombra el archivo al terminar con empresa y fecha.

## c) Paso a paso con AssemblyAI

1. **Cuenta.** Crea una en [assemblyai.com](https://www.assemblyai.com). La capa gratuita da **US$50 de crédito inicial sin tarjeta** (fuente: https://www.assemblyai.com/pricing, 2026-10-28).
2. **API key.** Cópiala desde el panel. Es como una contraseña.
3. **Guárdala en una variable de entorno, nunca en un archivo del repo.**

   Windows (PowerShell), para la sesión actual:
   ```powershell
   $env:ASSEMBLYAI_API_KEY = "pega-tu-clave-aquí"
   ```
   Persistente en Windows: `setx ASSEMBLYAI_API_KEY "pega-tu-clave-aquí"` y abre una terminal nueva.

   macOS y Linux:
   ```bash
   export ASSEMBLYAI_API_KEY="pega-tu-clave-aquí"
   ```
   Si usas un archivo `.env`, que esté en el `.gitignore` y fuera de lo que subes. El escáner de `herramientas/` frena los commits que lleven claves.
4. **Corre el script** (Node 18 o superior, sin dependencias):
   ```bash
   node .claude/skills/applyos-entrevista/scripts/diarizar.js entrevista.mp3 --salida entrevistas/evaluaciones --nombre acme-2026-03-12 --hablantes 2
   ```
   El script sube el audio (`POST /v2/upload`), pide la transcripción con `speaker_labels: true` e idioma `es` (`POST /v2/transcript`), consulta el estado cada 5 segundos y guarda dos archivos: `<nombre>.diarizado.json` (con `utterances` y `words`) y `<nombre>.transcripcion.md` (hablante y hora). Reintenta ante errores de red, 429 y 5xx. Si la clave es inválida o no hay crédito, lo dice con un mensaje claro y termina.
   - `--hablantes 2` es `speakers_expected`. Úsalo solo si estás seguro, porque un valor incorrecto puede empeorar la precisión.
   - `--idioma en` para entrevistas en inglés.
   - `--modelo` elige el modelo de voz. Por defecto `universal-2`, que la documentación lista con español. El modelo de gama alta del momento aparece en el sitio de precios.
   - `--disfluencias` pide conservar "eh" y "mm". La API lo aceptó en la prueba, pero no cambió el resultado en español, así que no dependas de eso.
   - `--espera-max 60` son los minutos máximos de espera.
5. **Mide.** Primero mira qué letra eres:
   ```bash
   node .claude/skills/applyos-entrevista/scripts/metricas.js entrevistas/evaluaciones/acme-2026-03-12.diarizado.json
   ```
   Imprime la primera frase de cada hablante. Después:
   ```bash
   node .claude/skills/applyos-entrevista/scripts/metricas.js entrevistas/evaluaciones/acme-2026-03-12.diarizado.json --candidato B
   ```
   Entrega una tabla con % de habla, apertura, turnos de más de 60 s, turno más largo, muletillas por minuto, interrupciones, palabras por minuto y confianza media. Las muletillas son configurables con `--muletillas "o sea,digamos"` o `--muletillas-archivo lista.json`.

**Límites y costos** (fuente: https://www.assemblyai.com/pricing, 2026-10-28).

| Dato | Valor |
|---|---|
| Voz a texto, modelo `universal-2` | US$0,15 por hora de audio |
| Voz a texto, modelo `universal-3-5-pro` | US$0,21 por hora |
| Diarización estándar | +US$0,02 por hora |
| Créditos iniciales | US$50 sin tarjeta |
| Una entrevista de 1 hora, `universal-2` con diarización | unos US$0,17 |

Tamaño máximo de archivo y duración máxima: **no verificado**. No encontré el dato en las páginas oficiales que pude leer. Si tu archivo es muy grande, extrae solo el audio (por ejemplo `ffmpeg -i entrevista.mkv -vn -ac 1 -ar 16000 entrevista.mp3`), que además pesa mucho menos.

Español con diarización: la documentación confirma español (`es`) para transcribir (https://www.assemblyai.com/docs/pre-recorded-audio/supported-languages). Que `speaker_labels` esté soportado en español no lo dice explícito, pero **la prueba de este repo con audio sintético en español devolvió dos hablantes correctos** (ver sección de pruebas). Si un idioma no lo soporta, la API responde `The following models are not available in this language: speaker_labels`.

**Privacidad** (fuente: https://www.assemblyai.com/security, 2026-10-28). Para audio pregrabado, los archivos subidos se borran a las 24 a 48 horas y las transcripciones a los 30 días por defecto. Se puede desactivar el entrenamiento con tus datos en planes de pago, desde Data Controls, y el cambio aplica a solicitudes nuevas. Si usas la capa gratuita, **no verificado** si tus datos se usan para entrenar: revisa sus términos. Las transcripciones se pueden borrar a pedido por API (`DELETE /v2/transcript/{id}`). Como el audio de una entrevista incluye la voz de otra persona, tenlo presente antes de subirlo.

## d) Los scripts

- `diarizar.js`: audio a JSON diarizado y transcripción en markdown. La clave se lee solo de `ASSEMBLYAI_API_KEY`, nunca se imprime ni se guarda.
- `metricas.js`: del JSON, calcula las métricas. Definiciones.
  - **% de habla**: tiempo hablado por ti sobre el tiempo hablado total de los turnos, sin contar silencios.
  - **Apertura**: duración del primer turno tuyo. Si tu primera intervención no fue la respuesta a "cuéntame de ti", usa `--turno-apertura n`.
  - **Turnos de más de 60 s**: turnos tuyos mayores a 60 segundos. Dos fragmentos seguidos tuyos con menos de 1,5 s de hueco cuentan como un turno.
  - **Muletillas por minuto**: apariciones de la lista sobre los minutos que hablaste. Ojo: los transcriptores suelen omitir los "eh" y "mm", así que el número es un mínimo.
  - **Interrupciones**: un turno que empieza antes de que termine el del otro, con solape de 300 ms o más. Sobre una sola pista, los diarizadores rara vez entregan solapes, así que es un mínimo. Con dos pistas separadas sale exacto.
- `scripts/ejemplo/entrevista-sintetica.diarizado.json`: un resultado de ejemplo con audio sintético, para probar `metricas.js` sin cuenta ni red.

Verifica la diarización antes de usarla. Si una frase que solo puede decir el entrevistador ("cuéntame de ti") aparece atribuida a ti, las letras están invertidas.

## e) Pasarlo a la skill y evaluar

En Claude Code, con las skills instaladas, di por ejemplo: "evalúa mi entrevista con este JSON", y la skill `applyos-entrevista` hace lo siguiente.

1. Lee tu archivo de lecciones completo.
2. Corre `metricas.js`, o usa los números que le pases. **Nunca estima una cifra.** "Sin dato" es una respuesta válida.
3. Verifica las citas y a quién se le atribuyen contra el archivo fuente.
4. Llena la tabla por etapa, con evidencia textual y hora al lado de cada nota.
5. **Separa siempre dos ejes**: el resultado del proceso (qué dijo el entrevistador, qué avanzó) y la calidad de tus respuestas. Un cierre cálido no valida una respuesta débil, y una respuesta débil no borra un avance real.
6. Propone como máximo dos correcciones, cada una como un comportamiento observable.
7. Agrega una fila a la tabla de lecciones.

Si le pides una evaluación a un modelo, verifica toda cita contra el archivo antes de aceptarla. Hay casos de modelos que atribuyen al candidato frases del entrevistador.

## f) Alternativas

Todas con fecha de verificación 2026-10-28, salvo lo marcado.

| Opción | Ventajas | Límites | Fuente |
|---|---|---|---|
| **Deepgram** (nube) | Diarización incluida sin costo extra. Nova-3 prerrecorded desde US$0,26 por hora (pago por uso). US$200 de crédito inicial sin tarjeta | Soporte de diarización en español: **no verificado** | https://deepgram.com/pricing |
| **WhisperX** (local) | Todo corre en tu equipo, nada sale. Alineación por defecto para español | Requiere token de lectura de Hugging Face y aceptar las condiciones del modelo de pyannote. Con GPU hay que instalar CUDA. VRAM para la diarización y rendimiento en CPU con diarización: **no verificado** (el README solo documenta CPU sin `--diarize`) | https://github.com/m-bain/whisperX |
| **pyannote.audio** (local) | Diarización abierta, combinable con cualquier transcriptor | Mismo token de Hugging Face. Más configuración | https://github.com/pyannote/pyannote-audio (no leído en esta verificación) |
| **Otter.ai** | Plan gratis de 300 minutos al mes, máximo 30 minutos por conversación. Español incluido | Pro: 1.200 minutos al mes y 90 por reunión. Es un bot de reuniones, no analiza un archivo propio de forma simple | https://otter.ai/pricing |
| **Fireflies.ai** | Español soportado, marcado como beta | Precios y límites del plan gratis: **no verificado** (la página no los mostró) | https://fireflies.ai/pricing |
| **Fathom** | Plan gratis con grabaciones y transcripciones sin límite declarado | Idiomas: **no verificado**. Cuotas del plan gratis: **no verificado** | https://fathom.ai/pricing |
| **Teams o Meet** | Transcripción incluida en la reunión, si el anfitrión la activa | Normalmente no eres anfitrión. Disponibilidad por plan, idiomas y calidad de la diarización: **no verificado** | no consultado |

Una regla para elegir. Si puedes grabar dos pistas, hazlo y no necesitas diarizar. Si tienes una sola pista, AssemblyAI o Deepgram resuelven en minutos y por centavos. Si no quieres que el audio salga de tu equipo, WhisperX con pyannote, sabiendo que pide configuración.

Los bots de reuniones (Otter, Fireflies, Fathom) se unen a la llamada y los demás participantes los ven: avisa y pide consentimiento igual que con una grabación.

## Pruebas de este repo

La prueba se hizo el 2026-10-28 con un diálogo **sintético** de 60 segundos generado con dos voces de edge-tts (`es-CL-CatalinaNeural` como entrevistadora y `es-CL-LorenzoNeural` como candidato), sin ninguna grabación real.

| Dato | Resultado |
|---|---|
| Hablantes detectados | 2 (A y B), correctos |
| Turnos | 5 (3 de la entrevistadora, 2 del candidato) |
| % de habla del candidato | 76,6 % (41,8 s de 54,6 s) |
| Apertura | 33,3 s |
| Muletillas | 6 en total, 8,61 por minuto |
| Con clave inválida | Error claro, termina con código 1 |

Verificado a mano: el 76,6 % sale de 41,8 sobre 54,6 s, y las 6 muletillas son las del guion que el transcriptor conservó ("o sea" dos veces, "digamos", "básicamente", "bueno", "claro"). Los "eh" del guion no aparecieron en la transcripción, que es la limitación ya descrita.
