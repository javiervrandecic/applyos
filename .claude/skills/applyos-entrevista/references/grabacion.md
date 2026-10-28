# Cómo grabar y transcribir una entrevista

Sin grabación no hay evaluación real. Vas a recordar la historia que te armaste sobre la entrevista, no la entrevista.

El problema práctico es que **casi nunca eres el administrador de la reunión**, así que la grabación integrada de Zoom, Teams o Meet no está disponible para ti. La solución es grabar por tu lado el audio del escritorio más el de tu micrófono.

---

## Antes que nada, la parte legal

Las reglas de grabar una conversación de la que eres parte **cambian según el país y a veces según la región**. Hay lugares donde basta con que uno de los participantes lo sepa, y otros donde se necesita el consentimiento de todos.

Tres cosas que aplican en cualquier caso:

- **Averigua la regla de tu jurisdicción.** No asumas.
- **La grabación es para tu revisión personal.** Nunca la compartas, la publiques ni la subas a ningún lado más allá del servicio que uses para transcribirla.
- **Si tienes dudas, avisa.** "¿Te molesta si grabo para tomar notas después?" casi nunca recibe un no, y te deja tranquilo.

Este documento asume que estás grabando algo que tienes derecho a grabar.

---

## El truco que te ahorra la diarización entera

Aquí está lo importante y casi nadie lo hace.

**Graba tu micrófono y el audio del escritorio en pistas separadas.** Tu voz queda sola en una pista, la del entrevistador sola en la otra.

Con eso ya no necesitas ningún diarizador. La separación de hablantes es perfecta por construcción, es gratis, y no se equivoca. Los diarizadores automáticos confunden hablantes con frecuencia, sobre todo en los primeros minutos, y esa confusión arruina el análisis (te atribuye frases que dijo el entrevistador).

Y de yapa te da gratis la métrica más útil de todas. **el porcentaje de tiempo que habló cada uno**, que sale de comparar la duración con voz de cada pista.

---

## Opción A. OBS con dos pistas de audio

Gratis, funciona en Windows, Mac y Linux.

**Configuración, una sola vez:**

1. **Fuentes.** Agrega `Captura de entrada de audio` (tu micrófono) y `Captura de salida de audio` (el escritorio, o sea lo que escuchas). **No agregues ninguna fuente de video.**

2. **Ajustes → Salida → Modo de salida. Avanzado**

3. En la pestaña **Grabación**, en `Pistas de audio` marca la **1 y la 2**

4. **Mezclador de audio → menú de los tres puntos → Propiedades de audio avanzadas.** Ahí asigna el micrófono solo a la pista 1 y el audio del escritorio solo a la pista 2

5. Formato de grabación **mkv**, que no se corrompe si algo se cae a la mitad

**Sobre el consumo de recursos.** Sin fuentes de video, OBS gasta muy poco. El problema aparece cuando además grabas pantalla, y ahí sí puede pesar. Si tu equipo es modesto, **no grabes video.** El navegador con la cámara encendida ya le está exigiendo bastante, y quedarte pegado en medio de una entrevista cuesta mucho más que la grabación.

Si tu equipo es de gama alta el video no molesta, pero igual no lo necesitas. Para evaluarte sirve el audio.

## Opción B. Más liviana que OBS

Si OBS te parece pesado o engorroso:

**Audacity** (gratis). En Windows puede capturar el audio del escritorio eligiendo el host **WASAPI** y seleccionando tu dispositivo de salida con la etiqueta `(loopback)`. Es muy liviano. La contra es que grabar micrófono y escritorio a la vez en pistas separadas requiere más configuración que en OBS.

**Grabadora de voz de Windows** o cualquier grabadora del teléfono apuntando a los parlantes. Suena rudimentario y **funciona**. Queda una sola pista mezclada, así que ahí sí vas a necesitar diarizar. Si es tu única opción, úsala. Una grabación mediocre le gana por lejos a ninguna grabación.

---

## Transcribir

**Si grabaste en dos pistas**, transcribe cada una por separado y después las unes por marca de tiempo. Ya sabes quién es quién.

**Si grabaste una sola pista mezclada**, necesitas diarización.

### AssemblyAI

Tiene capa gratuita con crédito inicial, que alcanza para bastantes horas de entrevista. Activa la opción de **speaker labels** (diarización).

```bash
# 1. Sube el audio
curl -X POST https://api.assemblyai.com/v2/upload \
  -H "authorization: TU_API_KEY" \
  --data-binary @entrevista.mkv

# 2. Pide la transcripción con diarización y en español
curl -X POST https://api.assemblyai.com/v2/transcript \
  -H "authorization: TU_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "audio_url": "LA_URL_QUE_DEVOLVIO_EL_PASO_1",
    "speaker_labels": true,
    "language_code": "es"
  }'

# 3. Consulta el resultado con el id que te devolvio
curl https://api.assemblyai.com/v2/transcript/EL_ID \
  -H "authorization: TU_API_KEY"
```

### Alternativas

**Whisper local** (gratis, corre en tu máquina, nada sale de tu equipo). Transcribe muy bien pero **no diariza por sí solo**. Se combina con `pyannote.audio` para separar hablantes. Es el camino más privado y el que más configuración pide.

**El transcript de la plataforma**, si la reunión te lo deja descargar. Muchas veces viene ya diarizado y no te cuesta nada. Revísalo antes de montar cualquier otra cosa.

---

## Verifica la diarización antes de usarla

**Los diarizadores invierten los hablantes con frecuencia**, sobre todo al comienzo de la grabación.

Cómo detectarlo en diez segundos. Busca una frase que **solo puede haber dicho el entrevistador**, del tipo "cuéntame de ti", "nosotros como empresa" o el cierre de la plataforma. Si aparece atribuida a ti, están invertidas. Corrígelo antes de analizar nada.

Es un error barato de arreglar y carísimo de no ver, porque toda tu autoevaluación queda basada en frases que no dijiste.

---

## Qué haces con el transcript

Lo guardas en `entrevistas/evaluaciones/` (esa carpeta está en el `.gitignore`) y aplicas [`EVALUACION.md`](EVALUACION.md).

Con el transcript en mano puedes medir de verdad. porcentaje de tiempo hablando, duración exacta del opener, cuántos turnos pasaron de 60 segundos, muletillas por minuto. Esos números no salen de la memoria y son los que te muestran el patrón.

---

## Checklist de 2 minutos antes de la reunión

- [ ] OBS abierto y grabando **antes** de entrar a la llamada
- [ ] Verifica que el medidor del micrófono se mueva cuando hablas
- [ ] Verifica que el medidor del escritorio se mueva con cualquier sonido del sistema
- [ ] Espacio en disco suficiente
- [ ] **Sin fuentes de video** si tu equipo no sobra de potencia
- [ ] Al terminar, detén la grabación y **renombra el archivo de inmediato** con empresa y fecha. Vas a acumular varios y todos se llaman igual
