// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { NextResponse } from 'next/server';
import { execFileSync } from 'child_process';
import { parsearSalidaGitLog, calcularVersionSemantica } from '@/app/lib/calcularVersionSemantica';
import type { RespuestaChangelog } from '@/app/components/configuracion/typesConfiguracion';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawLog = execFileSync(
      'git',
      ['log', '-n', '200', '--pretty=format:%H|%h|%an|%ad|%s|%b@@@COMMIT@@@'],
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );

    const commits = parsearSalidaGitLog(rawLog, '@@@COMMIT@@@');
    const version = calcularVersionSemantica([...commits].reverse(), '1.0.0');

    const respuesta: RespuestaChangelog = {
      version,
      totalCommits: commits.length,
      commits,
    };

    return NextResponse.json(respuesta);
  } catch (error: any) {
    console.warn('[changelog] No se pudo ejecutar git log:', error?.message);
    const fallback: RespuestaChangelog = {
      version: '1.0.0',
      totalCommits: 0,
      commits: [],
    };
    return NextResponse.json(fallback);
  }
}
