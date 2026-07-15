// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useEffect, useState, useRef, useMemo } from 'react';
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import { ResultadoMRP, ResultadoTercerizadosMRP } from '../lib/types';
import { usePrefijosStore } from '@/app/stores/prefijosStore';

export function useVistaResultados() {
  const store = useGestionFormulasStore();
  const [busqueda, setBusqueda] = useState('');
  const [filtrosActivos, setFiltrosActivos] = useState<string[]>([]);
  const [criticidades, setCriticidades] = useState<string[]>(['alta', 'media', 'baja']);
  const [movimientosFiltrados, setMovimientosFiltrados] = useState<string[]>([]);
  const [plantasFiltradas, setPlantasFiltradas] = useState<string[]>([]);
  const [lineasFiltradas, setLineasFiltradas] = useState<string[]>([]);

  const reglas = usePrefijosStore((state) => state.reglas);
  const lineasDisponibles = useMemo(() => {
    const arr = reglas || [];
    const setLineas = new Set(arr.map((r) => r.linea).filter(Boolean));
    return Array.from(setLineas).sort();
  }, [reglas]);

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

    // Aplicar filtro de movimientos/acciones
    if (movimientosFiltrados.length > 0) {
      items = items.filter((r) => {
        const hasTransfMP = movimientosFiltrados.includes('transf_mp') && (r.movimientoSugerido.transferencia ?? 0) > 0;
        const hasCompra = movimientosFiltrados.includes('compra') && (r.movimientoSugerido.compra ?? 0) > 0;
        const hasTransfPT = movimientosFiltrados.includes('transf_pt') && r.productosUsados.some((p) => (p.transferirPT ?? 0) > 0);
        return hasTransfMP || hasCompra || hasTransfPT;
      });
    }

    // Aplicar filtro de Planta de fabricación
    if (plantasFiltradas.length > 0) {
      items = items.filter((r) =>
        r.productosUsados.some((p) => p.sitioFabricacion && plantasFiltradas.includes(p.sitioFabricacion))
      );
    }

    // Aplicar filtro de Línea de PT
    if (lineasFiltradas.length > 0) {
      items = items.filter((r) =>
        r.productosUsados.some((p) => p.linea && lineasFiltradas.includes(p.linea))
      );
    }

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
  }, [store.resultadosMRP?.propios, busqueda, filtrosActivos, sortPropios, criticidades, movimientosFiltrados, plantasFiltradas, lineasFiltradas]);

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

    // Aplicar filtro de movimientos/acciones
    if (movimientosFiltrados.length > 0) {
      items = items.filter((r) => {
        const hasCompra = movimientosFiltrados.includes('compra') && (r.movimientoSugerido.compra ?? 0) > 0;
        const hasTransfPT = movimientosFiltrados.includes('transf_pt') && (r.movimientoSugerido.transferencia ?? 0) > 0;
        return hasCompra || hasTransfPT;
      });
    }

    // Aplicar filtro de Línea de PT (para tercerizados)
    if (lineasFiltradas.length > 0) {
      items = items.filter((r) => r.linea && lineasFiltradas.includes(r.linea));
    }

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
  }, [store.resultadosMRP?.tercerizados, busqueda, filtrosActivos, sortTercerizados, criticidades, movimientosFiltrados, lineasFiltradas]);

  useEffect(() => {
    store.ejecutarCalculoMRP(store.mesesProyeccionTransferencia, store.mesesProyeccionCompra);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.mesesProyeccionTransferencia, store.mesesProyeccionCompra]);

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
  }, [activeListLength, store.cargandoCalculo, store.pestañaActiva, criticidades, filtrosActivos, movimientosFiltrados, plantasFiltradas, lineasFiltradas, store.mesesProyeccionTransferencia, store.mesesProyeccionCompra]);

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
    movimientosFiltrados,
    setMovimientosFiltrados,
    plantasFiltradas,
    setPlantasFiltradas,
    lineasFiltradas,
    setLineasFiltradas,
    lineasDisponibles,
    mesesProyeccionTransferencia: store.mesesProyeccionTransferencia,
    mesesProyeccionCompra: store.mesesProyeccionCompra,
    setMesesProyeccionTransferencia: store.setMesesProyeccionTransferencia,
    setMesesProyeccionCompra: store.setMesesProyeccionCompra,
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
