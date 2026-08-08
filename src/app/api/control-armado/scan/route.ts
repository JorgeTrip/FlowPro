// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imagenBase64 } = body;

    if (!imagenBase64) {
      return NextResponse.json({ error: 'Falta la imagen en base64.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'tu_api_key_de_gemini') {
      return NextResponse.json(
        { error: 'No se ha configurado la clave GEMINI_API_KEY en .env.local' },
        { status: 400 }
      );
    }

    const base64Clean = imagenBase64.replace(/^data:image\/\w+;base64,/, '');
    const anioActual = new Date().getFullYear();

    const promptSystem = `Sos un sistema OCR experto de alta precisión especializado en leer planillas impresas y manuscritas de "CONTROL DE ARMADO DE PEDIDOS".
Atención: Una misma planilla puede contener filas registradas en DISTINTAS FECHAS (por ejemplo 30-7, 31-7-26, etc.).

Analizá la imagen provista y extraé TODAS las filas escritas en la planilla.
Debes responder ÚNICAMENTE con un objeto JSON válido con esta estructura estricta:
{
  "empleadoHeader": "Nombre del empleado escrito en el encabezado superior (ej: GABRIEL)",
  "filas": [
    {
      "fecha": "Fecha de la fila en formato YYYY-MM-DD (ej: 30-7 se convierte en ${anioActual}-07-30, 31-7-26 en 2026-07-31). Si una fila no tiene fecha explícita escrita, HEREDA la fecha de la fila anterior",
      "horaInicio": "HH:MM (formato 24h, ej: 14:36, 08:25)",
      "horaFin": "HH:MM (formato 24h, ej: 15:01, 08:28)",
      "cantArticulos": 5 (número entero extraído de la columna CANT. ARTIC. o BULTOS),
      "notaIrregularidad": "Texto manuscrito adicional si existe en la fila/margen (ej: TERMINO SEBA). Si la fila no tiene notas manuscritas, DEBE SER NULL",
      "esIrregular": true/false (true ÚNICAMENTE si existe una nota manuscrita o aclaración de relevo de turno)
    }
  ]
}

Instrucciones de alta precisión:
1. Lee TODAS las filas de la tabla sin omitir ninguna (habitualmente entre 10 y 20 filas).
2. Para cada fila, lee la fecha de la columna FECHA. Si está en blanco, HEREDA la fecha de la fila de arriba. Convertí la fecha a formato YYYY-MM-DD.
3. Formateá las horas como HH:MM en 24 horas (ej: 8:05 -> 08:05, 14:36 -> 14:36, 15:52 -> 15:52).
4. En cantArticulos, poné el número entero de la columna CANT. ARTIC. o BULTOS. Si no hay número, poné 0.
5. Solo poné notaIrregularidad si leés texto manuscrito claro en esa fila específica (ej: TERMINO SEBA). Si no hay nota, poné null y esIrregular = false.`;

    const modelos = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-2.0-flash-lite', 'gemini-2.5-flash'];
    let ultimoError = '';
    let statusError = 500;

    for (const modelo of modelos) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: promptSystem },
                    { inline_data: { mime_type: 'image/jpeg', data: base64Clean } },
                  ],
                },
              ],
              generationConfig: {
                response_mime_type: 'application/json',
                temperature: 0.1,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const parsedJSON = JSON.parse(candidateText);
            const hoyStr = new Date().toISOString().split('T')[0];

            if (Array.isArray(parsedJSON.filas)) {
              parsedJSON.filas = parsedJSON.filas.map((f: any, idx: number) => {
                const notaClean = f.notaIrregularidad && String(f.notaIrregularidad).trim() !== 'null' ? String(f.notaIrregularidad).trim() : null;
                const tieneNota = Boolean(notaClean && notaClean.length > 0 && !notaClean.toLowerCase().includes('marca de irregularidad'));

                return {
                  id: `fila-ocr-${idx}-${Date.now()}`,
                  fecha: f.fecha || hoyStr,
                  horaInicio: f.horaInicio || '08:00',
                  horaFin: f.horaFin || f.horaInicio || '08:00',
                  cantArticulos: Number(f.cantArticulos) || 0,
                  notaIrregularidad: tieneNota ? notaClean : null,
                  esIrregular: tieneNota,
                };
              });
            }
            return NextResponse.json(parsedJSON);
          }
        } else {
          statusError = response.status;
          const errText = await response.text();
          ultimoError = `[${modelo}] (${response.status}): ${errText}`;
          console.warn(`[API Gemini Scan] Falló modelo ${modelo} (${response.status}):`, errText);

          if (response.status === 429) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      } catch (err: any) {
        ultimoError = err.message || String(err);
        console.warn(`[API Gemini Scan] Excepción con modelo ${modelo}:`, err);
      }
    }

    let mensajeUsuario = ultimoError;
    if (statusError === 429) {
      mensajeUsuario = 'Se alcanzó el límite de cuota por minuto de Gemini API (Error 429). Por favor aguardá unos segundos y reintentá el escaneo.';
    }

    return NextResponse.json(
      { error: `Error al comunicarse con Gemini API: ${mensajeUsuario}` },
      { status: statusError }
    );
  } catch (error: any) {
    console.error('[API Gemini Scan] Excepción en servidor:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
