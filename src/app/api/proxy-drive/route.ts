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

    // 2. Si falla (404/403/401/400), intentar como archivo Excel binario subido directamente a Drive
    if (!respuesta.ok) {
      console.log(`[Proxy Drive] Falló exportación xlsx (${respuesta.status}) para ID ${id}, intentando uc?export=download`);
      url = `https://drive.google.com/uc?export=download&id=${id}`;
      respuesta = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
    }

    if (!respuesta.ok) {
      console.error(`[Proxy Drive] Error al acceder al archivo ${id}: ${respuesta.status} ${respuesta.statusText}`);
      return NextResponse.json(
        {
          error: `No se pudo acceder al archivo en Google Drive (${respuesta.status}). Verifica los permisos: en Google Drive debe estar configurado como 'Cualquier persona que tenga el vínculo' (Lector).`,
        },
        { status: respuesta.status }
      );
    }

    const contentType = respuesta.headers.get('content-type') || '';
    const buffer = await respuesta.arrayBuffer();

    // Validar que el archivo sea un Excel válido (magic bytes ZIP para .xlsx o Compound File para .xls)
    const header = new Uint8Array(buffer.slice(0, 4));
    const isZip = header[0] === 0x50 && header[1] === 0x4B; // PK (XLSX ZIP)
    const isOldXls = header[0] === 0xD0 && header[1] === 0xCF; // OLE2 (XLS binario)
    
    if (!isZip && !isOldXls) {
      const text = new TextDecoder().decode(buffer.slice(0, 500));
      console.error(`[Proxy Drive] El contenido descargado para ${id} no es Excel. Primeros 500 bytes:\n`, text);

      const requiereLogin = text.includes('accounts.google.com') || text.includes('ServiceLogin') || text.includes('Sign in');
      const mensaje = requiereLogin
        ? `La planilla de Google Drive (ID: ${id}) requiere inicio de sesión. Por favor, abre la planilla en Google Drive, pulsa 'Compartir' y cambia el 'Acceso general' a 'Cualquier persona que tenga el vínculo' con rol de Lector.`
        : `El archivo descargado no es una planilla Excel válida (tipo: ${contentType}). Verifica que el enlace corresponda a una Google Sheet o archivo .xlsx válido.`;

      return NextResponse.json(
        { error: mensaje, id, contentType },
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
