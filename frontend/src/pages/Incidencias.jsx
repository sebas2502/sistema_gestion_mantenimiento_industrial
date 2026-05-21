import React, { useState, useEffect } from 'react';
import { obtenerIncidencias, registrarIncidencia, validarIncidencia } from '../api/incidencias';
import { obtenerActivos } from '../api/activos';

const Incidencias = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Formulario del Operario
  const [activoId, setActivoId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Simulamos un ID de operador logueado (por ejemplo, el ID 3)
  const USUARIO_LOGUEADO_ID = 3;

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [listadoInc, listadoAct] = await Promise.all([obtenerIncidencias(), obtenerActivos()]);
      setIncidencias(listadoInc);
      setActivos(listadoAct);
    } catch (err) {
      setError('Error al sincronizar el módulo de incidencias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleReportar = async (e) => {
    e.preventDefault();
    if (!activoId || !descripcion) return;
    try {
      await registrarIncidencia({ activoId: Number(activoId), descripcion, usuarioId: USUARIO_LOGUEADO_ID });
      setDescripcion('');
      setActivoId('');
      setShowForm(false);
      cargarDatos();
    } catch (err) {
      setError('No se pudo registrar el reporte de falla.');
    }
  };

  const handleValidarPrioridad = async (id, prioridadNueva) => {
    try {
      await validarIncidencia(id, prioridadNueva);
      cargarDatos();
    } catch (err) {
      setError('Error al validar la gravedad de la incidencia.');
    }
  };

  return (
    <div className="p-4 md:p-6 w-full font-mono bg-slate-950 min-h-screen text-slate-100 flex flex-col items-start justify-start">
      
      {/* CABECERA COMPLETA RESPONSIVA */}
      <div className="mb-6 border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
        <div>
          <div className="text-amber-500 text-xs tracking-widest uppercase mb-1">Módulo Operativo / Planta Hilandería</div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-wider uppercase">Control de Incidencias</h1>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-red-950 hover:bg-red-900 border border-red-700/60 text-red-400 font-bold rounded text-xs uppercase tracking-wider transition-all whitespace-nowrap shadow-md">
            ⚠️ Reportar Falla en Máquina
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-950/40 border border-red-800 text-red-400 p-4 rounded text-sm flex items-center gap-2 w-full">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          <span>[SINK ERROR]: {error}</span>
        </div>
      )}

      {/* 🥞 CONTENEDOR VERTICAL PRINCIPAL */}
      <div className="w-full flex flex-col items-center gap-8">
        
        {/* 📋 SECCIÓN 1: FORMULARIO AL 75% DE ANCHO Y CENTRADO */}
        {showForm && (
          <div className="w-full lg:w-[75%] max-w-4xl bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl animate-fadeIn">
            <h3 className="text-sm font-bold text-red-400 mb-4 uppercase tracking-wider border-b border-slate-800 pb-2">
              ⚠️ [Formulario de Reporte Técnico - Falla Crítica]
            </h3>
            <form onSubmit={handleReportar} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="block text-[11px] uppercase text-slate-400 mb-1">Máquina Afectada</label>
                  <select value={activoId} onChange={e => setActivoId(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs focus:border-amber-500 focus:outline-none">
                    <option value="">-- Elegir Equipo --</option>
                    {activos.map(act => (
                      <option key={act.id} value={act.id}>{act.nombre} ({act.ubicacion})</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] uppercase text-slate-400 mb-1">Descripción del Problema Técnico</label>
                  <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs focus:border-amber-500 focus:outline-none" placeholder="Describa ruidos anómalos, atascos, vibraciones..." />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/60">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs uppercase rounded transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-red-800 hover:bg-red-700 text-red-100 font-bold text-xs uppercase tracking-wider rounded transition-colors">Emitir Alerta</button>
              </div>
            </form>
          </div>
        )}

        {/* 🗂️ SECCIÓN 2: TARJETAS DE INCIDENCIAS (OCUPAN LA FILA INFERIOR) */}
        <div className="w-full">
          {loading ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded text-xs text-slate-400 uppercase tracking-widest animate-pulse">
              Leyendo Línea de Alertas de Planta...
            </div>
          ) : (
            /* La grilla inferior ahora se distribuye en 1, 2 o 3 columnas de manera limpia sin importar si el form está abierto o no */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full items-start grid-rows-[max-content]">
              {incidencias.length > 0 ? (
                incidencias.map(inc => (
                  <div key={inc.id} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex flex-col justify-start h-fit gap-3 shadow-lg hover:border-slate-700 transition-all">
                    
                    {/* Bloque Informativo */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-1.5">
                        <span className="text-slate-500 font-bold">INCIDENCIA #{inc.id}</span>
                        <span className="text-amber-500 font-bold uppercase tracking-wider truncate max-w-[200px]" title={inc.activo?.nombre}>
                          {inc.activo?.nombre || 'Equipo Desconocido'}
                        </span>
                      </div>
                      
                      <p className="text-slate-200 text-xs leading-relaxed font-sans bg-slate-950/30 p-2 rounded border border-slate-850/40 min-h-[48px]">
                        {inc.descripcion}
                      </p>
                      
                      <div className="text-[10px] text-slate-500 leading-normal">
                        <div>Reportó: <span className="text-slate-400">{inc.usuarioReporta?.nombre || 'Operario'}</span></div>
                        <div className="text-slate-600 mt-0.5">{new Date(inc.fechaRegistro).toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Módulo de Validation Compacto */}
                    <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-md h-fit">
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-2 font-bold text-center">
                        Clasificación Supervisor:
                      </div>
                      
                      {inc.prioridad === 'Pendiente de Validar' ? (
                        <div className="grid grid-cols-2 gap-1">
                          {['Baja', 'Media', 'Alta', 'Crítica'].map(prio => (
                            <button key={prio} onClick={() => handleValidarPrioridad(inc.id, prio)} className="py-1 text-[9px] font-bold uppercase rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500 transition-all text-center">
                              {prio}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full h-fit">
                          <span className={`w-full max-w-[160px] py-1 text-[10px] font-black uppercase rounded text-center tracking-widest border block ${
                            inc.prioridad === 'Baja' ? 'bg-blue-950/40 border-blue-800/60 text-blue-400' :
                            inc.prioridad === 'Media' ? 'bg-yellow-950/40 border-yellow-800/60 text-yellow-400' :
                            inc.prioridad === 'Alta' ? 'bg-orange-950/40 border-orange-800/60 text-orange-400' :
                            'bg-red-950/50 border-red-800 text-red-400 animate-pulse'
                          }`}>
                            {inc.prioridad}
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs uppercase rounded">
                  Ninguna alerta técnica activa en este momento.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Incidencias;