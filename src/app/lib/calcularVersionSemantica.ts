// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import type { TipoCommit, CommitHistorial } from '../components/configuracion/typesConfiguracion.ts';

export function deducirTipoCommit(titulo: string): TipoCommit {
  const norm = (titulo || '').trim().toLowerCase();
  if (norm.startsWith('feat:') || norm.startsWith('🚀') || norm.includes('feat(')) return 'feat';
  if (norm.startsWith('fix:') || norm.startsWith('🔧') || norm.includes('fix(')) return 'fix';
  if (norm.startsWith('breaking:') || norm.startsWith('💥')) return 'breaking';
  if (norm.startsWith('chore:') || norm.includes('chore(')) return 'chore';
  if (norm.startsWith('refactor:') || norm.includes('refactor(')) return 'refactor';
  return 'otros';
}

export function calcularVersionSemantica(
  commitsEnOrdenCronologico: { titulo: string }[],
  versionInicial = '1.0.0'
): string {
  const partes = versionInicial.split('.').map((n) => parseInt(n, 10) || 0);
  let major = partes[0] ?? 1;
  let minor = partes[1] ?? 0;
  let patch = partes[2] ?? 0;

  for (const c of commitsEnOrdenCronologico) {
    const tipo = deducirTipoCommit(c.titulo);
    if (tipo === 'breaking') {
      major += 1;
      minor = 0;
      patch = 0;
    } else if (tipo === 'feat') {
      minor += 1;
      patch = 0;
    } else {
      patch += 1;
    }
  }

  return `${major}.${minor}.${patch}`;
}

export function parsearSalidaGitLog(salidaCruda: string, delimitador = '@@@COMMIT@@@'): CommitHistorial[] {
  if (!salidaCruda || !salidaCruda.trim()) return [];

  const bloques = salidaCruda.split(delimitador);
  const commits: CommitHistorial[] = [];

  for (const bloque of bloques) {
    const limpio = bloque.trim();
    if (!limpio) continue;

    const [hash, shortHash, autor, fecha, titulo, ...cuerpoResto] = limpio.split('|');
    if (!hash || !titulo) continue;

    const cuerpo = cuerpoResto.join('|').trim();
    const tipo = deducirTipoCommit(titulo);

    commits.push({
      hash: hash.trim(),
      shortHash: (shortHash || hash.slice(0, 7)).trim(),
      autor: (autor || 'Jorge O. Tripodi').trim(),
      fecha: (fecha || '').trim(),
      titulo: titulo.trim(),
      cuerpo: cuerpo || undefined,
      tipo,
    });
  }

  return commits;
}
