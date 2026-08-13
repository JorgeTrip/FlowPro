// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

/**
 * Recibe un String Base64 de imagen y los grados de rotación (90, 180, 270).
 * Devuelve un nuevo String Base64 con los píxeles de la imagen físicamente rotados usando HTML5 Canvas.
 */
export function rotarImagenBase64(base64Src: string, grados: number): Promise<string> {
  return new Promise((resolve, reject) => {
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
        canvas.width = esNoventaODosSetenta ? img.height : img.width;
        canvas.height = esNoventaODosSetenta ? img.width : img.height;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((gradosNormalizados * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        resolve(canvas.toDataURL('image/jpeg', 0.92));
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

/**
 * Recibe un archivo de imagen (File), redimensiona manteniendo relación de aspecto
 * y aplica compresión adaptativa en canvas para garantizar un tamaño de Base64 inferior a 1MB (~950KB).
 */
export function optimizarImagenBase64(file: File, maxSizeBytes: number = 950000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const srcBase64 = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(srcBase64);

        ctx.drawImage(img, 0, 0, width, height);

        let calidad = 0.88;
        let dataUrl = canvas.toDataURL('image/jpeg', calidad);

        while (dataUrl.length > maxSizeBytes && calidad > 0.25) {
          calidad -= 0.08;
          dataUrl = canvas.toDataURL('image/jpeg', calidad);
        }

        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = srcBase64;
    };
    reader.onerror = (err) => reject(err);
  });
}
