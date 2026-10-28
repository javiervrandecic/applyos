# Requisitos

Qué necesitas realmente para que todo corra sin problemas.

---

## Lo mínimo para el barrido

Esto es lo único obligatorio y es muy poco.

| | |
|---|---|
| **Node.js 22 o superior** | [nodejs.org](https://nodejs.org). Verifica con `node --version` |
| **git** | opcional, puedes bajar el ZIP desde GitHub |
| **Conexión a internet** | las fuentes son endpoints públicos, sin llaves de API |

Con eso corre `scripts/getonbrd-sweep.js` y ya tienes avisos.

**Por qué Node 22 y no menos.** El generador de PDF usa `WebSocket` nativo, que es estable recién desde la 22. El barrido sí funciona en la 20, el PDF no.

---

## Para el sistema completo

| | |
|---|---|
| **[Claude Code](https://claude.com/claude-code)** | **De pago.** Es lo que analiza el calce, verifica los avisos en detalle y genera los CV adaptados |
| **Google Chrome** | solo si quieres exportar el dashboard a PDF. Si tienes Chromium o Edge también sirve, define la ruta en `CHROME_PATH` |

---

## Para grabar entrevistas (opcional pero recomendado)

| | |
|---|---|
| **OBS Studio** | gratis, [obsproject.com](https://obsproject.com). Windows, Mac y Linux |
| **Servicio de transcripción** | solo si grabas en una sola pista. Con dos pistas separadas no lo necesitas. Ver [`entrevistas/GRABACION.md`](entrevistas/GRABACION.md) |

---

## Hardware

Acá está la pregunta que importa, y la respuesta corta es que **el sistema en sí no pide casi nada**. El único momento delicado es grabar durante una entrevista.

### Los scripts y el análisis

| Recurso | Qué consume |
|---|---|
| CPU | despreciable, son llamadas a APIs y procesamiento de texto |
| RAM | menos de 200 MB |
| Disco | el repo pesa unos 300 KB. Los resultados en JSON, unos pocos MB |

Cualquier computador de los últimos diez años corre esto sin despeinarse. Un Celeron con 4 GB funciona.

### Generar el PDF

Levanta Chrome en modo headless por unos segundos. Necesitas ~500 MB de RAM libre en ese momento. Es puntual y no compite con nada más.

### Grabar una entrevista, acá sí hay que tener criterio

**Solo audio, que es lo que se recomienda.** OBS sin ninguna fuente de video consume entre 2% y 5% de CPU. Corre bien en equipos modestos.

**Audio más video de pantalla.** Ahí sí pesa, y depende del equipo.

| Tu equipo | Qué hacer |
|---|---|
| Básico (i3, Celeron, Ryzen 3, 8 GB o menos, sin GPU dedicada) | **Solo audio.** Nada de video. Y considera una grabadora más liviana que OBS, como Audacity |
| Medio (i5 o Ryzen 5, 8 a 16 GB) | Audio sin problema. Video solo si de verdad lo necesitas |
| Alto (i7 o i9, Ryzen 7 o 9, 16 GB o más, GPU dedicada) | Lo que quieras. Con codificación por GPU (NVENC en Nvidia, QuickSync en Intel) el video casi no cuesta |

> **La advertencia que importa.** Durante una entrevista tu computador ya está trabajando duro. El navegador con la cámara encendida, el video de la otra persona y el compartir pantalla consumen bastante por sí solos. Si además le pones grabación de video encima en un equipo justo, el riesgo real es que la llamada se te trabe.
>
> **Quedarte pegado en medio de una entrevista cuesta infinitamente más que no tener la grabación en video.** Y para evaluarte solo necesitas el audio.

### Espacio en disco

Una hora de audio en OBS ocupa entre 50 y 100 MB. Si grabas video, entre 500 MB y 2 GB por hora según la calidad.

---

## Sistema operativo

Todo funciona en **Windows, macOS y Linux**.

Lo único específico de Windows es `scripts/getonbrd-sweep.ps1`, que es la versión en PowerShell del barrido por si prefieres no usar Node. La versión en Node hace lo mismo y corre en los tres.

---

## Cuentas y costos

| | Costo |
|---|---|
| Get on Board, LinkedIn y portales locales | **gratis**, sin registro ni llaves de API |
| Node.js, OBS, Audacity, Chrome | **gratis** |
| **Claude Code** | **de pago**, según tu plan |
| Servicio de transcripción | gratis con la capa inicial de la mayoría, y opcional |

**El único costo obligatorio para el sistema completo es Claude Code.** Todo lo demás es gratis o evitable.

---

## Verificación rápida

Corre esto y compara:

```bash
node --version     # debe decir v22 o mayor
git --version      # opcional
claude --version   # solo si vas por el camino completo
npm install        # dentro de la carpeta del repo
node scripts/getonbrd-sweep.js "AI engineer"
node herramientas/escanear.js herramientas   # debe decir "sin hallazgos"
```

Si el barrido te devuelve avisos, el barrido está funcionando y el resto es configuración, no instalación.

Si algo falla, la sección de problemas comunes de [`GUIA.md`](GUIA.md) cubre los errores más frecuentes.
