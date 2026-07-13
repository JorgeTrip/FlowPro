// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useEffect, useState, useRef, useMemo } from 'react';
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import { ResultadoMRP, ResultadoTercerizadosMRP } from '../lib/motorMRP';

export function useVistaResultados() {
  const store = useGestionFormulasStore();
  const [busqueda, setBusqueda] = useState('');
  const [filtrosActivos, setFiltrosActivos] = useState<string[]>(['con_datos']);
  const [criticidades, setCriticidades] = useState<string[]>(['alta', 'media', 'baja']);
  const [mesesRotacion, setMesesRotacion] = useState(3);

  // Configuración de Ordenamiento
  const [sortPropios, setSortPropios] = useState<{ key: keyof ResultadoMRP; direction: 'asc' | 'desc' } | null>(null);
  const [sortTercerizados, setSortTercerizados] = useState<{ key: keyof ResultadoTercerizadosMRP; direction: 'asc' | 'desc' } | null>(null);

  const scrollSuperiorRef = useRef<HTMLDivElement>(null);
  const scrollInferiorRef = useRef<HTMLDivElement>(null);
  const [anchoScroll, setAnchoScroll] = useState(0);

  const solicitarOrdenPropios = (key: keyof ResultadoMRP) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortPropios && sortPropios.key === key && sortPropios.direction === 'asc') {
      direction = 'desc';
    }
    setSortPropios({ key, direction });
  };

  const solicitarOrdenTercerizados = (key: keyof ResultadoTercerizadosMRP) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortTercerizados && sortTercerizados.key === key && sortTercerizados.direction === 'asc') {
      direction = 'desc';
    }
    setSortTercerizados({ key, direction });
  };

  const resultadosFiltradosPropios = useMemo(() => {
    let items = store.resultadosMRP?.propios || [];

    // Aplicar filtros
    if (filtrosActivos.includes('con_datos')) {
      items = items.filter((r) => r.cantidadSugerida > 0);
    }
    if (filtrosActivos.includes('eliminar_sin_accion')) {
      items = items.filter((r) => r.movimientoSugerido.tipo !== 'sin_accion');
    }
    
    // Aplicar filtro de criticidad
    items = items.filter((r) => criticidades.includes(r.criticidad));

    // Aplicar búsqueda
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      items = items.filter((r) => {
        const codigo = r.codigoMP.toLowerCase();
        const desc = r.descripcionMP.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return codigo.includes(term) || desc.includes(term);
      });
    }

    // Aplicar orden
    if (sortPropios) {
      items = [...items].sort((a, b) => {
        let valA = a[sortPropios.key];
        let valB = b[sortPropios.key];
        if (sortPropios.key === 'movimientoSugerido') {
          valA = a.movimientoSugerido.tipo;
          valB = b.movimientoSugerido.tipo;
        }
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortPropios.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortPropios.direction === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }

    return items;
  }, [store.resultadosMRP?.propios, busqueda, filtrosActivos, sortPropios, criticidades]);

  const resultadosFiltradosTercerizados = useMemo(() => {
    let items = store.resultadosMRP?.tercerizados || [];

    // Aplicar filtros
    if (filtrosActivos.includes('con_datos')) {
      items = items.filter((r) => r.rotacion > 0);
    }
    if (filtrosActivos.includes('eliminar_sin_accion')) {
      items = items.filter((r) => r.movimientoSugerido.tipo !== 'sin_accion');
    }
    
    // Aplicar filtro de criticidad
    items = items.filter((r) => criticidades.includes(r.criticidad));

    // Aplicar búsqueda
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      items = items.filter((r) => {
        const codigo = r.codigoPT.toLowerCase();
        const desc = r.descripcionPT.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return codigo.includes(term) || desc.includes(term);
      });
    }

    // Aplicar orden
    if (sortTercerizados) {
      items = [...items].sort((a, b) => {
        let valA = a[sortTercerizados.key];
        let valB = b[sortTercerizados.key];
        if (sortTercerizados.key === 'movimientoSugerido') {
          valA = a.movimientoSugerido.tipo;
          valB = b.movimientoSugerido.tipo;
        }
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortTercerizados.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortTercerizados.direction === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }

    return items;
  }, [store.resultadosMRP?.tercerizados, busqueda, filtrosActivos, sortTercerizados, criticidades]);

  useEffect(() => {
    store.ejecutarCalculoMRP();
  }, []);

  const activeListLength = store.pestañaActiva === 'propios'
    ? resultadosFiltradosPropios.length
    : resultadosFiltradosTercerizados.length;

  useEffect(() => {
    if (activeListLength > 0 && scrollInferiorRef.current) {
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
    filtrosActivos,
    setFiltrosActivos,
    criticidades,
    setCriticidades,
    mesesRotacion,
    setMesesRotacion,
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
    sortPropios,
    solicitarOrdenPropios,
    sortTercerizados,
    solicitarOrdenTercerizados,
  };
}
