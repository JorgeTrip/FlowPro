// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useEffect, useState, useRef, useMemo } from 'react';
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';

/**
 * Hook personalizado para manejar la lógica de estado, filtrado por canal
 * y sincronización de scroll de la vista de resultados de la explosión inversa MRP.
 */
export function useVistaResultados() {
  const store = useGestionFormulasStore();
  const [busqueda, setBusqueda] = useState('');

  const scrollSuperiorRef = useRef<HTMLDivElement>(null);
  const scrollInferiorRef = useRef<HTMLDivElement>(null);
  const [anchoScroll, setAnchoScroll] = useState(0);

  const resultadosFiltradosPropios = useMemo(() => {
    let items = store.resultadosMRP?.propios || [];
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      items = items.filter((r) => {
        const codigo = r.codigoMP.toLowerCase();
        const desc = r.descripcionMP.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return codigo.includes(term) || desc.includes(term);
      });
    }
    return items;
  }, [store.resultadosMRP?.propios, busqueda]);

  const resultadosFiltradosTercerizados = useMemo(() => {
    let items = store.resultadosMRP?.tercerizados || [];
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      items = items.filter((r) => {
        const codigo = r.codigoPT.toLowerCase();
        const desc = r.descripcionPT.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return codigo.includes(term) || desc.includes(term);
      });
    }
    return items;
  }, [store.resultadosMRP?.tercerizados, busqueda]);

  useEffect(() => {
    store.ejecutarCalculoMRP();
  }, []);

  const activeListLength = store.pestañaActiva === 'propios'
    ? resultadosFiltradosPropios.length
    : resultadosFiltradosTercerizados.length;

  useEffect(() => {
    if (activeListLength > 0 && scrollInferiorRef.current) {
      // Pequeño retardo para asegurar que el DOM se haya renderizado con la pestaña activa
      const timer = setTimeout(() => {
        if (scrollInferiorRef.current) {
          setAnchoScroll(scrollInferiorRef.current.scrollWidth);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeListLength, store.cargandoCalculo, store.pestañaActiva]);

  useEffect(() => {
    const sup = scrollSuperiorRef.current;
    const inf = scrollInferiorRef.current;
    if (!sup || !inf) return;
    let emisor: 'sup' | 'inf' | null = null;

    const alHacerScrollSuperior = () => {
      if (emisor === 'inf') { emisor = null; return; }
      emisor = 'sup'; inf.scrollLeft = sup.scrollLeft;
    };
    const alHacerScrollInferior = () => {
      if (emisor === 'sup') { emisor = null; return; }
      emisor = 'inf'; sup.scrollLeft = inf.scrollLeft;
    };

    sup.addEventListener('scroll', alHacerScrollSuperior);
    inf.addEventListener('scroll', alHacerScrollInferior);
    return () => {
      sup.removeEventListener('scroll', alHacerScrollSuperior);
      inf.removeEventListener('scroll', alHacerScrollInferior);
    };
  }, [activeListLength, anchoScroll, store.pestañaActiva]);

  return {
    busqueda,
    setBusqueda,
    scrollSuperiorRef,
    scrollInferiorRef,
    anchoScroll,
    resultadosFiltradosPropios,
    resultadosFiltradosTercerizados,
    cargandoCalculo: store.cargandoCalculo,
    resultadosMRP: store.resultadosMRP,
    pestañaActiva: store.pestañaActiva,
    setPestañaActiva: store.setPestañaActiva,
    setStep: store.setStep,
  };
}
