// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { useEffect, useState, useRef, useMemo } from 'react';
import { useGestionFormulasStore } from '@/app/stores/gestionFormulasStore';
import { ResultadoMRP, ResultadoTercerizadosMRP } from '../lib/types';
import { usePrefijosStore } from '@/app/stores/prefijosStore';

function ordenarItems<T>(items: T[], config: { key: keyof T; direction: 'asc' | 'desc' } | null): T[] {
  if (!config) return items;
  return [...items].sort((a, b) => {
    let valA = config.key === 'movimientoSugerido' ? (a as any).movimientoSugerido.tipo : a[config.key];
    let valB = config.key === 'movimientoSugerido' ? (b as any).movimientoSugerido.tipo : b[config.key];
    if (valA === undefined) return 1;
    if (valB === undefined) return -1;
    if (typeof valA === 'string' && typeof valB === 'string') {
      return config.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return config.direction === 'asc' ? valA - valB : valB - valA;
    }
    return 0;
  });
}

export function useVistaResultados() {
  const store = useGestionFormulasStore();
  const [busqueda, setBusqueda] = useState('');
  const [filtrosActivos, setFiltrosActivos] = useState<string[]>([]);
  const [criticidades, setCriticidades] = useState<string[]>(['alta', 'media', 'baja']);
  const [movimientosFiltrados, setMovimientosFiltrados] = useState<string[]>([]);
  const [plantasFiltradas, setPlantasFiltradas] = useState<string[]>([]);
  const [lineasFiltradas, setLineasFiltradas] = useState<string[]>([]);

  const [sortPropios, setSortPropios] = useState<{ key: keyof ResultadoMRP; direction: 'asc' | 'desc' } | null>(null);
  const [sortTercerizados, setSortTercerizados] = useState<{ key: keyof ResultadoTercerizadosMRP; direction: 'asc' | 'desc' } | null>(null);

  const scrollSuperiorRef = useRef<HTMLDivElement>(null);
  const scrollInferiorRef = useRef<HTMLDivElement>(null);
  const [anchoScroll, setAnchoScroll] = useState(0);

  const solicitarOrdenPropios = (key: keyof ResultadoMRP) => {
    setSortPropios({ key, direction: sortPropios && sortPropios.key === key && sortPropios.direction === 'asc' ? 'desc' : 'asc' });
  };

  const solicitarOrdenTercerizados = (key: keyof ResultadoTercerizadosMRP) => {
    setSortTercerizados({ key, direction: sortTercerizados && sortTercerizados.key === key && sortTercerizados.direction === 'asc' ? 'desc' : 'asc' });
  };

  const resultadosFiltradosPropios = useMemo(() => {
    let items = store.resultadosMRP?.propios || [];

    if (filtrosActivos.includes('con_datos')) items = items.filter((r) => r.cantidadSugerida > 0);
    if (filtrosActivos.includes('eliminar_sin_accion')) items = items.filter((r) => r.movimientoSugerido.tipo !== 'sin_accion');
    items = items.filter((r) => criticidades.includes(r.criticidad));

    if (movimientosFiltrados.length > 0) {
      items = items.filter((r) => {
        const hasTransfMP = movimientosFiltrados.includes('transf_mp') && (r.movimientoSugerido.transferencia ?? 0) > 0;
        const hasCompra = movimientosFiltrados.includes('compra') && (r.movimientoSugerido.compra ?? 0) > 0;
        const hasTransfPT = movimientosFiltrados.includes('transf_pt') && r.productosUsados.some((p) => (p.transferirPT ?? 0) > 0);
        const hasTransfMPCabaEr = movimientosFiltrados.includes('transf_mp_caba_er') && (r.movimientoSugerido.transferenciaCabaEr ?? 0) > 0;
        return hasTransfMP || hasCompra || hasTransfPT || hasTransfMPCabaEr;
      });
    }

    if (plantasFiltradas.length > 0) {
      items = items.filter((r) => r.productosUsados.some((p) => p.sitioFabricacion && plantasFiltradas.includes(p.sitioFabricacion)));
    }
    if (lineasFiltradas.length > 0) {
      items = items.filter((r) => r.productosUsados.some((p) => p.linea && lineasFiltradas.includes(p.linea)));
    }

    if (busqueda.trim()) {
      const term = busqueda.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      items = items.filter((r) => r.codigoMP.toLowerCase().includes(term) || r.descripcionMP.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(term));
    }

    return ordenarItems(items, sortPropios);
  }, [store.resultadosMRP?.propios, busqueda, filtrosActivos, sortPropios, criticidades, movimientosFiltrados, plantasFiltradas, lineasFiltradas]);

  const resultadosFiltradosTercerizados = useMemo(() => {
    let items = store.resultadosMRP?.tercerizados || [];

    if (filtrosActivos.includes('con_datos')) items = items.filter((r) => r.rotacion > 0);
    if (filtrosActivos.includes('eliminar_sin_accion')) items = items.filter((r) => r.movimientoSugerido.tipo !== 'sin_accion');
    items = items.filter((r) => criticidades.includes(r.criticidad));

    if (movimientosFiltrados.length > 0) {
      items = items.filter((r) => {
        const hasCompra = movimientosFiltrados.includes('compra') && (r.movimientoSugerido.compra ?? 0) > 0;
        const hasTransfPT = movimientosFiltrados.includes('transf_pt') && (r.movimientoSugerido.transferencia ?? 0) > 0;
        return hasCompra || hasTransfPT;
      });
    }

    if (lineasFiltradas.length > 0) {
      items = items.filter((r) => r.linea && lineasFiltradas.includes(r.linea));
    }

    if (busqueda.trim()) {
      const term = busqueda.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      items = items.filter((r) => r.codigoPT.toLowerCase().includes(term) || r.descripcionPT.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(term));
    }

    return ordenarItems(items, sortTercerizados);
  }, [store.resultadosMRP?.tercerizados, busqueda, filtrosActivos, sortTercerizados, criticidades, movimientosFiltrados, lineasFiltradas]);

  useEffect(() => {
    store.ejecutarCalculoMRP(store.mesesProyeccionTransferencia, store.mesesProyeccionCompra);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.mesesProyeccionTransferencia, store.mesesProyeccionCompra]);

  const activeListLength = store.pestañaActiva === 'propios' ? resultadosFiltradosPropios.length : resultadosFiltradosTercerizados.length;

  useEffect(() => {
    if (activeListLength > 0 && scrollInferiorRef.current) {
      const timer = setTimeout(() => {
        if (scrollInferiorRef.current) setAnchoScroll(scrollInferiorRef.current.scrollWidth);
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

  const reglas = usePrefijosStore((state) => state.reglas);
  const lineasDisponibles = useMemo(() => Array.from(new Set((reglas || []).map((r) => r.linea).filter(Boolean))).sort(), [reglas]);

  return {
    busqueda, setBusqueda, filtrosActivos, setFiltrosActivos, criticidades, setCriticidades, movimientosFiltrados, setMovimientosFiltrados,
    plantasFiltradas, setPlantasFiltradas, lineasFiltradas, setLineasFiltradas, lineasDisponibles,
    mesesProyeccionTransferencia: store.mesesProyeccionTransferencia, mesesProyeccionCompra: store.mesesProyeccionCompra,
    setMesesProyeccionTransferencia: store.setMesesProyeccionTransferencia, setMesesProyeccionCompra: store.setMesesProyeccionCompra,
    scrollSuperiorRef, scrollInferiorRef, anchoScroll, resultadosFiltradosPropios, resultadosFiltradosTercerizados,
    cargandoCalculo: store.cargandoCalculo, resultadosMRP: store.resultadosMRP, pestañaActiva: store.pestañaActiva,
    setPestañaActiva: store.setPestañaActiva, setStep: store.setStep, sortPropios, solicitarOrdenPropios, sortTercerizados, solicitarOrdenTercerizados,
  };
}
