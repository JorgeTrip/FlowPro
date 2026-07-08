// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import { Producto, Formula } from '../lib/types';
import {
  mapearProductos,
  mapearFormulas,
  mapearStock,
  mapearConsumo,
} from '../lib/lectorExcel';

/**
 * Compara si dos recetas de fórmulas son exactamente idénticas en sus componentes,
 * cantidades y unidades de medida.
 */
function sonRecetasIdenticas(a: Formula, b: Formula): boolean {
  if (a.contenido !== b.contenido) return false;
  if (a.componentes.length !== b.componentes.length) return false;

  const compA = [...a.componentes].sort((x, y) => x.codigoComponente.localeCompare(y.codigoComponente));
  const compB = [...b.componentes].sort((x, y) => x.codigoComponente.localeCompare(y.codigoComponente));

  for (let i = 0; i < compA.length; i++) {
    if (compA[i].codigoComponente !== compB[i].codigoComponente) return false;
    if (compA[i].cantidad !== compB[i].cantidad) return false;
    if (compA[i].unidadMedida !== compB[i].unidadMedida) return false;
  }
  return true;
}

/**
 * Custom hook que procesa el motor de importación aplicando una comparación
 * inteligente de control de versiones antes de impactar los datos en IndexedDB.
 */
export function useProcesarImportacion() {
  const store = useGestionFormulasStore();

  const procesarConfirmacion = async () => {
    store.setIsLoading(true);
    store.setError(null);

    try {
      const estadoActual = useGestionFormulasStore.getState();
      const {
        datosCrudosProductos,
        datosCrudosFormulas,
        datosCrudosStock,
        datosCrudosConsumo,
        configuracionMapeo,
        formulas: formulasActuales,
      } = estadoActual;

      // 1. Validaciones mínimas
      if (!configuracionMapeo.formulas || datosCrudosFormulas.length === 0) {
        throw new Error('Es obligatorio cargar y mapear las columnas para Fórmulas (BOM).');
      }
      if (!configuracionMapeo.stock || datosCrudosStock.length === 0) {
        throw new Error('Es obligatorio cargar y mapear las columnas para Saldo de Stock.');
      }

      // 2. Mapear datos planos del Excel a los tipos del negocio
      const formulasExcel = mapearFormulas(datosCrudosFormulas, configuracionMapeo.formulas);
      const stockProcesado = mapearStock(datosCrudosStock, configuracionMapeo.stock);
      
      const consumosProcesados =
        datosCrudosConsumo.length > 0 && configuracionMapeo.consumo
          ? mapearConsumo(datosCrudosConsumo, configuracionMapeo.consumo)
          : [];

      // 3. Cruzar y clasificar recetas del Excel contra IndexedDB (Fórmulas Activas)
      const recetasActivasGuardadas = formulasActuales.filter((f) => f.estado === 'activa');
      const formulasActivasMap = new Map<string, Formula>();
      recetasActivasGuardadas.forEach((f) => formulasActivasMap.set(f.codigoProducto, f));

      const clasificadas = {
        nueva: [] as Formula[],
        modificada: [] as Formula[],
        sin_cambios: [] as Formula[],
      };

      const fechaActual = new Date().toISOString();

      formulasExcel.forEach((recetaExcel) => {
        const recetaExistente = formulasActivasMap.get(recetaExcel.codigoProducto);

        if (!recetaExistente) {
          // Caso A: Nueva receta
          clasificadas.nueva.push({
            ...recetaExcel,
            version: 1,
            estado: 'activa',
            fechaCreacion: fechaActual,
          });
        } else if (!sonRecetasIdenticas(recetaExcel, recetaExistente)) {
          // Caso B: Receta modificada (incrementa versión, hereda metadatos de auditoría)
          clasificadas.modificada.push({
            ...recetaExcel,
            version: recetaExistente.version + 1,
            estado: 'activa',
            fechaCreacion: fechaActual,
          });
        } else {
          // Caso C: Receta idéntica (sin cambios)
          clasificadas.sin_cambios.push(recetaExistente);
        }
      });

      // 4. Guardar datos de stock y consumo de manera inmediata en el store
      store.setStocks(stockProcesado);
      store.setConsumos(consumosProcesados);

      // 5. Generar o deducir catálogo de productos
      const productosCat =
        datosCrudosProductos.length > 0 && configuracionMapeo.productos
          ? mapearProductos(datosCrudosProductos, configuracionMapeo.productos)
          : [];

      if (productosCat.length > 0) {
        store.setProductos(productosCat);
      } else {
        // Deducir catálogo maestro combinando fórmulas excel y existencias
        const codigos = new Set<string>();
        const prodLista: Producto[] = [];

        const registrarProducto = (cod: string, desc: string, um: string, cont?: string) => {
          if (!codigos.has(cod)) {
            codigos.add(cod);
            prodLista.push({ codigo: cod, descripcion: desc, unidadMedida: um, puntoPedido: 0, contenido: cont });
          }
        };

        formulasExcel.forEach((f) => {
          registrarProducto(f.codigoProducto, f.descripcion, f.unidadMedida, f.contenido);
          f.componentes.forEach((c) => registrarProducto(c.codigoComponente, c.descripcion, c.unidadMedida));
        });

        stockProcesado.forEach((s) => registrarProducto(s.codigoProducto, `Artículo ${s.codigoProducto}`, 'u'));
        store.setProductos(prodLista);
      }

      // 6. Impactar clasificación en el store
      store.setFormulasClasificadas(clasificadas);

      // Si no se detectaron recetas nuevas ni modificadas, avanzar automáticamente sin modal
      if (clasificadas.nueva.length === 0 && clasificadas.modificada.length === 0) {
        store.setStep(3);
      }
    } catch (err: any) {
      console.error('Error procesando importación avanzada:', err);
      store.setError(err.message || 'Error desconocido en comparación inteligente.');
    } finally {
      store.setIsLoading(false);
    }
  };

  return {
    procesarConfirmacion,
  };
}
