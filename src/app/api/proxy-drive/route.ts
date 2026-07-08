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
    let respuesta = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    // 2. Si falla (404/403/400), intentar como archivo Excel binario subido directamente a Drive
    if (!respuesta.ok) {
      console.log(`[Proxy Drive] Falló exportación xlsx (${respuesta.status}), intentando uc?export=download`);
      url = `https://drive.google.com/uc?export=download&id=${id}`;
      respuesta = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
    }

    if (!respuesta.ok) {
      console.log(`[Proxy Drive] Error al acceder: ${respuesta.status} ${respuesta.statusText}`);
      return NextResponse.json(
        { error: `No se pudo acceder al archivo (${respuesta.status}). Verifica que el enlace sea público (Cualquiera con el enlace puede ver).` },
        { status: respuesta.status }
      );
    }

    const contentType = respuesta.headers.get('content-type');
    console.log(`[Proxy Drive] Content-Type recibido: ${contentType}`);

    const buffer = await respuesta.arrayBuffer();
    console.log(`[Proxy Drive] Tamaño del buffer: ${buffer.byteLength} bytes`);

    // Validar que el archivo sea un Excel válido (magic bytes)
    const header = new Uint8Array(buffer.slice(0, 4));
    const isZip = header[0] === 0x50 && header[1] === 0x4B; // PK (ZIP header)
    
    if (!isZip) {
      console.error('[Proxy Drive] El archivo no parece ser un ZIP/Excel válido');
      // Si es HTML, devolver el contenido para diagnóstico
      const text = new TextDecoder().decode(buffer.slice(0, 500));
      console.log('[Proxy Drive] Primeros 500 bytes:', text);
      
      return NextResponse.json(
        { 
          error: 'El archivo descargado no es un Excel válido. Puede que el enlace requiera autenticación o no sea público.',
          contentType,
          preview: text.substring(0, 200),
        },
        { status: 400 }
      );
    }

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="planilla_drive.xlsx"',
      },
    });
  } catch (err: any) {
    console.error('[Proxy Drive] Error:', err);
    return NextResponse.json(
      { error: `Error interno de red al comunicarse con Google Drive: ${err.message || err}` },
      { status: 500 }
    );
  }
}
