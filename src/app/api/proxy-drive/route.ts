// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { NextResponse } from 'next/server';

/**
 * API Route de Proxy para descargar archivos de Google Drive evadiendo CORS en el cliente.
 * Soporta Google Sheets (mediante exportación format=xlsx) y archivos subidos de Excel.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Falta especificar el ID del archivo de Google Drive.' }, { status: 400 });
  }

  try {
    // 1. Intentar descargar asumiendo que es una Google Sheet (solicitando formato xlsx)
    let url = `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`;
    let respuesta = await fetch(url);

    // 2. Si falla (404/403/400), intentar como archivo Excel binario subido directamente a Drive
    if (!respuesta.ok) {
      url = `https://drive.google.com/uc?export=download&id=${id}`;
      respuesta = await fetch(url);
    }

    if (!respuesta.ok) {
      return NextResponse.json(
        { error: 'No se pudo acceder al archivo. Verifica que el enlace sea público (Cualquiera con el enlace puede ver).' },
        { status: respuesta.status }
      );
    }

    const buffer = await respuesta.arrayBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="planilla_drive.xlsx"',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Error interno de red al comunicarse con Google Drive: ${err.message || err}` },
      { status: 500 }
    );
  }
}
