// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

/**
 * Recibe un String Base64 de imagen y los grados de rotación (90, 180, 270).
 * Devuelve un nuevo String Base64 con los píxeles de la imagen físicamente rotados usando HTML5 Canvas.
 */
export function rotarImagenBase64(base64Src: string, grados: number): Promise<string> {
  return new Promise((resolve, reject) => {
    // Si la rotación neta es múltiplo de 360, no hace falta procesar el canvas
    const gradosNormalizados = ((grados % 360) + 360) % 360;
    if (gradosNormalizados === 0 || !base64Src) {
      resolve(base64Src);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(base64Src);
          return;
        }

        const esNoventaODosSetenta = gradosNormalizados === 90 || gradosNormalizados === 270;

        // Invertir dimensiones si la rotación es de 90° o 270°
        canvas.width = esNoventaODosSetenta ? img.height : img.width;
        canvas.height = esNoventaODosSetenta ? img.width : img.height;

        // Mover el origen al centro del canvas para aplicar la rotación
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((gradosNormalizados * Math.PI) / 180);

        // Dibujar la imagen centrada respecto a su nuevo origen
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        // Exportar la imagen rotada en alta calidad
        const resultadoBase64 = canvas.toDataURL('image/jpeg', 0.92);
        resolve(resultadoBase64);
      } catch (err) {
        console.error('Error durante el procesamiento del canvas al rotar imagen:', err);
        resolve(base64Src);
      }
    };

    img.onerror = (err) => {
      console.error('Error al cargar la imagen para la rotación en canvas:', err);
      reject(err);
    };

    img.src = base64Src;
  });
}
