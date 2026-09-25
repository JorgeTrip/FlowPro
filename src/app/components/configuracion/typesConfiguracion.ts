// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

export type TipoCommit = 'feat' | 'fix' | 'breaking' | 'chore' | 'refactor' | 'otros';

export interface CommitHistorial {
  hash: string;
  shortHash: string;
  autor: string;
  fecha: string;
  titulo: string;
  cuerpo?: string;
  tipo: TipoCommit;
}

export interface RespuestaChangelog {
  version: string;
  totalCommits: number;
  commits: CommitHistorial[];
}
