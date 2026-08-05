#!/usr/bin/env node
/**
 * Convierte el dashboard HTML a PDF usando Chrome headless por CDP.
 *
 * Por qué CDP y no el flag --print-to-pdf:
 * el flag de línea de comandos no suprime el header ni el footer del navegador,
 * así que el PDF sale con la URL y la fecha impresas en cada página. La única
 * forma confiable de sacarlos es hablarle a Page.printToPDF por el protocolo,
 * con displayHeaderFooter en false.
 *
 * Uso:
 *   node scripts/dashboard-pdf.js dashboard/embudo.html salida.pdf
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CANDIDATOS_CHROME = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

function buscarChrome() {
  for (const ruta of CANDIDATOS_CHROME) {
    if (fs.existsSync(ruta)) return ruta;
  }
  throw new Error(
    'No se encontró Chrome. Define la variable de entorno CHROME_PATH con la ruta al ejecutable.'
  );
}

function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const [entrada, salida = 'dashboard.pdf'] = process.argv.slice(2);
  if (!entrada) {
    console.error('uso: node scripts/dashboard-pdf.js <archivo.html> [salida.pdf]');
    process.exit(1);
  }

  const chrome = buscarChrome();
  const puerto = 9222 + Math.floor(Math.random() * 500);
  const perfilTmp = path.join(require('os').tmpdir(), `embudo-chrome-${puerto}`);

  const proc = spawn(chrome, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${puerto}`,
    `--user-data-dir=${perfilTmp}`,
    'about:blank',
  ]);

  try {
    // Esperar a que el puerto de depuración responda.
    let objetivo = null;
    for (let intento = 0; intento < 40 && !objetivo; intento++) {
      await esperar(250);
      try {
        const res = await fetch(`http://127.0.0.1:${puerto}/json/list`);
        const pestanas = await res.json();
        objetivo = pestanas.find((t) => t.type === 'page');
      } catch {
        /* todavía no levanta */
      }
    }
    if (!objetivo) throw new Error('Chrome no expuso el puerto de depuración a tiempo.');

    const url = 'file:///' + path.resolve(entrada).replace(/\\/g, '/');
    const pdf = await porCDP(objetivo.webSocketDebuggerUrl, url);

    fs.writeFileSync(salida, Buffer.from(pdf, 'base64'));
    console.log(`PDF escrito en ${salida} (${fs.statSync(salida).size} bytes)`);
  } finally {
    proc.kill();
  }
}

function porCDP(wsUrl, url) {
  return new Promise((resolve, reject) => {
    let WebSocket;
    try {
      WebSocket = require('ws');
    } catch {
      // Node 22+ trae WebSocket global.
      WebSocket = globalThis.WebSocket;
    }
    if (!WebSocket) return reject(new Error('Falta soporte de WebSocket. Usa Node 22+ o instala "ws".'));

    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pendientes = new Map();

    const enviar = (method, params = {}) =>
      new Promise((res, rej) => {
        const msgId = ++id;
        pendientes.set(msgId, { res, rej });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });

    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pendientes.has(msg.id)) {
        const { res, rej } = pendientes.get(msg.id);
        pendientes.delete(msg.id);
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
      }
    };

    ws.onerror = (err) => reject(err);

    ws.onopen = async () => {
      try {
        await enviar('Page.enable');
        await enviar('Page.navigate', { url });
        // Margen para que carguen fuentes y estilos.
        await esperar(2500);

        const { data } = await enviar('Page.printToPDF', {
          printBackground: true,
          displayHeaderFooter: false, // esto es lo que el flag de CLI no respeta
          preferCSSPageSize: true,
          marginTop: 0.4,
          marginBottom: 0.4,
          marginLeft: 0.4,
          marginRight: 0.4,
        });

        ws.close();
        resolve(data);
      } catch (err) {
        ws.close();
        reject(err);
      }
    };
  });
}

main().catch((err) => {
  console.error(`error: ${err.message}`);
  process.exit(1);
});
