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

  // Simulamos un ID de operador logueado (por ejemplo, el ID 1)
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8 border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-amber-500 text-xs font-mono tracking-widest uppercase mb-1">Módulo Operativo / Planta Hilandería</div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight uppercase">Control de Incidencias</h1>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-red-900 hover:bg-red-800 text-red-200 border border-red-600 font-bold rounded text-sm uppercase tracking-wider transition-colors">
            ⚠️ Reportar Falla en Máquina
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-950/40 border border-red-800 text-red-400 p-4 rounded text-sm font-mono">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {showForm && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded shadow-xl h-fit">
            <h3 className="text-lg font-bold text-red-400 mb-4 uppercase tracking-wider font-mono">[Orden de Falla Crítica]</h3>
            <form onSubmit={handleReportar} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Seleccionar Máquina Afectada</label>
                <select value={activoId} onChange={e => setActivoId(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:border-amber-500 focus:outline-none">
                  <option value="">-- Elegir Equipo --</option>
                  {activos.map(act => (
                    <option key={act.id} value={act.id}>{act.nombre} ({act.ubicacion})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Descripción del Problema Técnico</label>
                <textarea rows="4" value={descripcion} onChange={e => setDescripcion(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:border-amber-500 focus:outline-none" placeholder="Describa ruidos anómalos, atascos, vibraciones o roturas detectadas en el turno..."></textarea>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 bg-red-800 hover:bg-red-700 text-red-100 font-bold text-xs uppercase tracking-wider rounded">Emitir Alerta</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs uppercase rounded">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className={showForm ? 'lg:col-span-2' : 'w-full'}>
          {loading ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-400 uppercase tracking-widest">Leyendo Línea de Alertas de Planta...</div>
          ) : (
            <div className="space-y-4">
              {incidencias.length > 0 ? incidencias.map(inc => (
                <div key={inc.id} className="bg-slate-900 border border-slate-800 rounded p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md hover:border-slate-700 transition-colors">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">INCIDENCIA #{inc.id}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-amber-500 font-mono font-bold text-xs uppercase">{inc.activo?.nombre || 'Equipo no vinculado'}</span>
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed">{inc.descripcion}</p>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Reportó: <span className="text-slate-400">{inc.usuarioReporta?.nombre || 'Operario Planta'}</span> | {new Date(inc.fechaRegistro).toLocaleString()}
                    </div>
                  </div>

                  {/* Interfaz de Validación del Supervisor */}
                  <div className="flex flex-col items-end gap-2 w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Clasificación Supervisor:</div>
                    {inc.prioridad === 'Pendiente de Validar' ? (
                      <div className="flex flex-wrap gap-1">
                        {['Baja', 'Media', 'Alta', 'Crítica'].map(prio => (
                          <button key={prio} onClick={() => handleValidarPrioridad(inc.id, prio)} className="px-2 py-1 text-[10px] font-black uppercase rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500 transition-all">
                            {prio}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className={`px-2 py-1 text-xs font-black uppercase font-mono rounded border ${
                        inc.prioridad === 'Baja' ? 'bg-blue-950/40 border-blue-800 text-blue-400' :
                        inc.prioridad === 'Media' ? 'bg-yellow-950/40 border-yellow-800 text-yellow-400' :
                        inc.prioridad === 'Alta' ? 'bg-orange-950/40 border-orange-800 text-orange-400' :
                        'bg-red-950/40 border-red-800 text-red-500 animate-pulse'
                      }`}>
                        Prioridad: {inc.prioridad}
                      </span>
                    )}
                  </div>
                </div>
              )) : (
                <div className="py-12 bg-slate-900 border border-slate-800 text-center text-slate-500 font-mono text-xs uppercase rounded">Ninguna alerta técnica activa en este momento.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Incidencias;