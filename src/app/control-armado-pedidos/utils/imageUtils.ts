// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados

/**
 * Rota una imagen en Base64 los grados indicados y la devuelve comprimida en WebP.
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
        if (!ctx) return resolve(base64Src);

        const esNoventaODosSetenta = gradosNormalizados === 90 || gradosNormalizados === 270;
        canvas.width = esNoventaODosSetenta ? img.height : img.width;
        canvas.height = esNoventaODosSetenta ? img.width : img.height;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((gradosNormalizados * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        resolve(canvas.toDataURL('image/webp', 0.82));
      } catch (err) {
        console.error('Error al rotar imagen en canvas:', err);
        resolve(base64Src);
      }
    };

    img.onerror = (err) => {
      console.error('Error al cargar imagen para rotación:', err);
      reject(err);
    };

    img.src = base64Src;
  });
}

/**
 * Optimiza un archivo (File) o un string Base64 existente convirtiéndolo a WebP de alta eficiencia (~40-120KB).
 */
export function optimizarImagenBase64(
  origen: File | string,
  maxDimension: number = 1400,
  calidadInicial: number = 0.80
): Promise<string> {
  return new Promise((resolve, reject) => {
    const procesarImagen = (srcBase64: string) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

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

        let dataUrl = canvas.toDataURL('image/webp', calidadInicial);
        // Si el navegador no soporta webp o devuelve jpeg por fallback
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', calidadInicial);
        }

        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = srcBase64;
    };

    if (typeof origen === 'string') {
      procesarImagen(origen);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => procesarImagen(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(origen);
    }
  });
}
