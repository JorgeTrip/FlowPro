// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { NextResponse } from 'next/server';
import { procesarFechasPlanilla } from '@/app/control-armado-pedidos/utils/fechaUtils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imagenBase64, modoAltaPrecision } = body;

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

    const advertenciaReintento = modoAltaPrecision
      ? `\n⚠️ ATENCIÓN DE MÁXIMA PRECISIÓN REFORZADA: El usuario ha solicitado un RE-ESCANEO de esta planilla porque la lectura previa contenía errores o imprecisiones. Analizá de nuevo cada celda con extrema cautela y doble verificación de horas, fechas y nombres.\n`
      : '';

    const promptSystem = `${advertenciaReintento}Sos un sistema OCR experto de alta precisión especializado en leer planillas impresas y manuscritas de "CONTROL DE ARMADO DE PEDIDOS".
ESTRUCTURA GEOMÉTRICA DE LA PLANILLA EN PAPEL:
- El encabezado superior contiene el título "CONTROL DE ARMADO DE PEDIDOS" y el campo "EMPLEADO: [NOMBRE]".
- La grilla impresa debajo de los títulos de las columnas consta de EXACTAMENTE 17 FILAS FÍSICAS DE DATOS de arriba hacia abajo.

Analizá la imagen provista recorriendo metódicamente de arriba a abajo cada uno de los 17 renglones físicos de la planilla.
Debes responder ÚNICAMENTE con un objeto JSON válido con esta estructura estricta:
{
  "empleadoHeader": "Nombre del empleado escrito en el encabezado superior (ej: GABRIEL). Si está en blanco o ilegible, PONER NULL",
  "filas": [
    {
      "fecha": "Fecha de la fila en formato YYYY-MM-DD (ej: 30-7 se convierte en ${anioActual}-07-30, 31-7-26 en 2026-07-31). Si la casilla de la fecha en esa fila está en blanco o vacía, DEBES PONER NULL",
      "horaInicio": "HH:MM (formato 24h, ej: 14:36, 08:25). Si está en blanco o vacía, PONER NULL",
      "horaFin": "HH:MM (formato 24h, ej: 15:01, 08:28). Si está en blanco o vacía, PONER NULL",
      "cantArticulos": 5 (número entero extraído de la columna CANT. ARTIC. o BULTOS),
      "notaIrregularidad": "Texto manuscrito adicional si existe en la fila/margen (ej: TERMINO SEBA, FALTANTE). Si la fila no tiene notas manuscritas, DEBE SER NULL",
      "esIrregular": true/false (true ÚNICAMENTE si existe una nota manuscrita o aclaración de relevo de turno)
    }
  ]
}

Instrucciones de alta precisión:
1. Inspeccioná metódicamente cada uno de los 17 renglones de la tabla sin omitir ninguna fila escrita.
2. REGLA ESTRICTA DE LA COLUMNA FECHA: Colocá la fecha YYYY-MM-DD ÚNICAMENTE en la fila exacta del renglón donde leas físicamente la fecha escrita en el papel (ej: la fila donde esté escrito '3-7' o '2-7-26'). Si la casilla de fecha en ese renglón está físicamente en blanco en la foto, DEBES PONER NULL en esa fila. JAMÁS copies ni arrastres la fecha a los renglones superiores si están en blanco en el papel.
3. Formateá las horas como HH:MM en 24 horas (ej: 8:05 -> 08:05, 14:36 -> 14:36, 15:52 -> 15:52). Si las casillas de Hora Inicio y Hora Fin están vacías, DEBES PONER NULL (no inventes un horario ficticio).
4. En cantArticulos, poné el número entero de la columna CANT. ARTIC. o BULTOS. Si no hay número, poné 0.
5. Solo poné notaIrregularidad si leés texto manuscrito claro en esa fila específica (ej: FALTANTE, TERMINO SEBA). Si no hay nota, poné null y esIrregular = false.`;

    const modelos = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
    ];
    let ultimoError = '';
    let statusError = 500;
    let hubicoQuotaError = false;

    for (const modelo of modelos) {
      let reintentos = 0;
      const maxReintentos = 2;

      while (reintentos <= maxReintentos) {
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
                  temperature: modoAltaPrecision ? 0.05 : 0.1,
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
                // 1. Mapeo inicial conservando fechas y horas nulas si no se escribieron explícitamente
                const filasRaw = parsedJSON.filas.map((f: any, idx: number) => {
                  const notaClean = f.notaIrregularidad && String(f.notaIrregularidad).trim() !== 'null' ? String(f.notaIrregularidad).trim() : null;
                  const tieneNota = Boolean(notaClean && notaClean.length > 0 && !notaClean.toLowerCase().includes('marca de irregularidad'));
                  const fechaClean = f.fecha && String(f.fecha).trim() !== 'null' ? String(f.fecha).trim() : null;
                  const horaInicioClean = f.horaInicio && String(f.horaInicio).trim() !== 'null' ? String(f.horaInicio).trim() : '';
                  const horaFinClean = f.horaFin && String(f.horaFin).trim() !== 'null' ? String(f.horaFin).trim() : '';

                  return {
                    id: `fila-ocr-${idx}-${Date.now()}`,
                    fecha: fechaClean,
                    horaInicio: horaInicioClean,
                    horaFin: horaFinClean,
                    cantArticulos: Number(f.cantArticulos) || 0,
                    notaIrregularidad: tieneNota ? notaClean : null,
                    esIrregular: tieneNota,
                  };
                });

                // 2. Resolver propagación de fechas (filas vacías iniciales -> fecha escrita anterior)
                parsedJSON.filas = procesarFechasPlanilla(filasRaw, hoyStr);
              }
              return NextResponse.json(parsedJSON);
            }
          } else {
            const errText = await response.text();
            console.warn(`[API Gemini Scan] Falló modelo ${modelo} (intento ${reintentos + 1}/${maxReintentos + 1}): HTTP ${response.status}`);

            if (response.status === 429) {
              hubicoQuotaError = true;
              statusError = 429;
              try {
                const errJson = JSON.parse(errText);
                const msg = errJson.error?.message || '';
                const matchRetry = msg.match(/Please retry in ([\d\.]+)s/);
                if (matchRetry) {
                  const segs = Math.ceil(parseFloat(matchRetry[1]));
                  ultimoError = `Google API: Se alcanzó la cuota del nivel gratuito. Aguardá ${segs} segundos para volver a escanear.`;
                } else {
                  ultimoError = 'Google API: Se alcanzó la cuota del nivel gratuito. Aguardá 30-60 segundos para volver a escanear.';
                }
              } catch {
                ultimoError = 'Google API: Se alcanzó la cuota del nivel gratuito. Aguardá 30-60 segundos para volver a escanear.';
              }

              if (reintentos < maxReintentos) {
                console.log(`[API Gemini Scan] Pausando 3.5 segundos antes de reintentar con ${modelo}...`);
                await new Promise((resolve) => setTimeout(resolve, 3500));
                reintentos++;
                continue;
              }
            } else if (response.status !== 404 || !ultimoError) {
              statusError = response.status;
              ultimoError = `[${modelo}] (${response.status}): ${errText}`;
            }
            break;
          }
        } catch (err: any) {
          ultimoError = err.message || String(err);
          console.warn(`[API Gemini Scan] Excepción con modelo ${modelo}:`, err);
          break;
        }
      }
    }

    return NextResponse.json(
      { error: ultimoError },
      { status: statusError }
    );
  } catch (error: any) {
    console.error('[API Gemini Scan] Excepción en servidor:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
