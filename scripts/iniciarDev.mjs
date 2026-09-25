// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { spawn, exec } from 'node:child_process';

const esWindows = process.platform === 'win32';
const esMac = process.platform === 'darwin';

/**
 * Abre el navegador predeterminado del sistema operativo con la URL asignada.
 */
function abrirNavegador(url) {
  const comando = esWindows
    ? `start "" "${url}"`
    : esMac
    ? `open "${url}"`
    : `xdg-open "${url}"`;

  exec(comando, (err) => {
    if (err) {
      console.warn(`[FlowPro Dev] No se pudo abrir automáticamente el navegador: ${err.message}`);
    }
  });
}

// Inicia el proceso de desarrollo de Next.js sin array de argumentos para evitar DEP0190
const procesoDev = spawn('npx next dev', {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
  env: process.env,
});

let navegadorAbierto = false;

function procesarSalida(data) {
  const texto = data.toString();
  process.stdout.write(texto);

  if (!navegadorAbierto) {
    // Detecta la URL local asignada por Next.js (ej: http://localhost:3000 o con puerto reasignado)
    const match = texto.match(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i);
    if (match) {
      navegadorAbierto = true;
      const urlAsignada = match[0];
      console.log(`\n🚀 [FlowPro Dev] Abriendo navegador en: ${urlAsignada}\n`);
      abrirNavegador(urlAsignada);
    }
  }
}

procesoDev.stdout.on('data', procesarSalida);
procesoDev.stderr.on('data', (data) => process.stderr.write(data));

procesoDev.on('close', (codigo) => {
  process.exit(codigo ?? 0);
});

// Manejo de señales para terminación limpia del proceso
process.on('SIGINT', () => {
  procesoDev.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  procesoDev.kill('SIGTERM');
  process.exit(0);
});
