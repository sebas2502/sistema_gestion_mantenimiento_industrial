import React, { useState, useEffect } from 'react';
import { obtenerOrdenes, crearOrdenTrabajo, actualizarEstadoOT } from '../api/ordenes';
import { obtenerActivos } from '../api/activos';
import { obtenerUsuarios } from '../api/usuarios'; 
import { obtenerIncidencias } from '../api/incidencias'; 

const Mantenimiento = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [activos, setActivos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  
  // Guardamos TODAS las incidencias abiertas que vienen del backend
  const [todasLasIncidencias, setTodasLasIncidencias] = useState([]); 
  // Guardamos solo las incidencias que se van a mostrar en el select (filtradas por activo)
  const [incidenciasFiltradas, setIncidenciasFiltradas] = useState([]); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados del Formulario de Alta
  const [showForm, setShowForm] = useState(false);
  const [tarea, setTarea] = useState('');
  const [detalles, setDetalles] = useState('');
  const [activoId, setActivoId] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [incidenciaId, setIncidenciaId] = useState(''); 
  const [fechaProgramada, setFechaProgramada] = useState('');

  const cargarDatosMantenimiento = async () => {
    setLoading(true);
    try {
      const [listadoOT, listadoAct, listadoUser, listadoInc] = await Promise.all([
        obtenerOrdenes(),
        obtenerActivos(),
        obtenerUsuarios(),
        obtenerIncidencias().catch(() => [])
      ]);
      
      setOrdenes(listadoOT);
      setActivos(listadoAct);
      
      // Almacenamos el universo de incidencias abiertas en el estado base
      if (Array.isArray(listadoInc)) {
        setTodasLasIncidencias(listadoInc.filter(inc => inc.estado === 'Abierta'));
      }

      const soloTecnicos = listadoUser.filter(user => user.role === 'tecnico_mantenimiento' || user.rol === 'tecnico_mantenimiento');
      setTecnicos(soloTecnicos);
    } catch (err) {
      setError('Error al sincronizar los registros del taller de mantenimiento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosMantenimiento();
  }, []);

  // =================================================================
  // 🔥 EFECTO DE FILTRADO DINÁMICO POR ACTIVO SELECCIONADO
  // =================================================================
  useEffect(() => {
    if (!activoId) {
      // Si no hay activo seleccionado, vaciamos el select de incidencias y el ID seleccionado
      setIncidenciasFiltradas([]);
      setIncidenciaId('');
      return;
    }

    // Filtramos las incidencias comparando el id del activo asignado
    // Nota: Verificá si en tu modelo la propiedad es inc.activoId o inc.activo?.id
    const filtradas = todasLasIncidencias.filter(inc => {
      const targetId = inc.activoId || inc.activo?.id;
      return Number(targetId) === Number(activoId);
    });

    setIncidenciasFiltradas(filtradas);
    setIncidenciaId(''); // Reseteamos la selección previa para evitar inconsistencias
  }, [activoId, todasLasIncidencias]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tarea || !activoId || !tecnicoId) return;

    try {
      await crearOrdenTrabajo({
        tarea,
        detalles,
        activoId: Number(activoId),
        tecnicoId: Number(tecnicoId),
        incidenciaId: incidenciaId ? Number(incidenciaId) : undefined, 
        fechaProgramada: fechaProgramada || undefined
      });
      limpiarFormulario();
      cargarDatosMantenimiento();
    } catch (err) {
      setError('No se pudo generar la orden de trabajo en el servidor.');
    }
  };

  const handleChangeEstado = async (id, nuevoEstado, tecnicoAsignadoId = null) => {
    try {
      await actualizarEstadoOT(id, nuevoEstado);
      cargarDatosMantenimiento();
    } catch (err) {
      setError('Error al actualizar el estado de la intervención mecánica.');
    }
  };

  const limpiarFormulario = () => {
    setTarea('');
    setDetalles('');
    setActivoId('');
    setTecnicoId('');
    setIncidenciaId(''); 
    setFechaProgramada('');
    setShowForm(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
      {/* Encabezado */}
      <div className="mb-8 border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-amber-500 text-xs font-mono tracking-widest uppercase mb-1">Módulo Gestión CMMS / Taller</div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight uppercase">Órdenes de Trabajo (OT)</h1>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-sm uppercase tracking-wider transition-colors">
            🔧 Emitir Nueva OT
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-950/40 border border-red-800 text-red-400 p-4 rounded text-sm font-mono">[FALLA]: {error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de Alta Lateral */}
        {showForm && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded shadow-xl h-fit">
            <h3 className="text-lg font-bold text-slate-200 mb-4 uppercase tracking-wider font-mono">[Planificar Intervención]</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Tarea a Ejecutar</label>
                <input type="text" value={tarea} onChange={e => setTarea(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:border-amber-500 focus:outline-none" placeholder="Ej: Cambio de rodamientos de motor" />
              </div>
              
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Asignar Activo Textil</label>
                <select value={activoId} onChange={e => setActivoId(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:border-amber-500 focus:outline-none">
                  <option value="">-- Seleccionar Equipo --</option>
                  {activos.map(act => (
                    <option key={act.id} value={act.id}>{act.nombre} ({act.ubicacion})</option>
                  ))}
                </select>
              </div>

              {/* SELECTOR VINCULADO DINÁMICAMENTE POR EL USEEFFECT */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Responder a Incidencia {activoId ? '' : '(Seleccione un activo primero)'}
                </label>
                <select 
                  value={incidenciaId} 
                  onChange={e => setIncidenciaId(e.target.value)} 
                  disabled={!activoId}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:border-amber-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Mantenimiento Preventivo / Programado --</option>
                  {incidenciasFiltradas.map(inc => (
                    <option key={inc.id} value={inc.id}>#{inc.id} - {inc.descripcion.substring(0, 35)}...</option>
                  ))}
                </select>
                {activoId && incidenciasFiltradas.length === 0 && (
                  <p className="text-[10px] text-slate-500 font-mono mt-1">✓ El activo no registra fallas abiertas en planta.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Mecánico / Técnico Responsable</label>
                <select value={tecnicoId} onChange={e => setTecnicoId(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:border-amber-500 focus:outline-none">
                  <option value="">-- Seleccionar Operario Técnico --</option>
                  {tecnicos.map(tec => (
                    <option key={tec.id} value={tec.id}>{tec.nombre || tec.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Fecha Programada (Opcional)</label>
                <input type="datetime-local" value={fechaProgramada} onChange={e => setFechaProgramada(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:border-amber-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Especificaciones Técnicas</label>
                <textarea rows="3" value={detalles} onChange={e => setDetalles(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:border-amber-500 focus:outline-none" placeholder="Herramientas necesarias, repuestos específicos, etc..."></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded">Abrir OT</button>
                <button type="button" onClick={limpiarFormulario} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs uppercase rounded">Cerrar</button>
              </div>
            </form>
          </div>
        )}

        {/* Listado Principal de OTs */}
        <div className={showForm ? 'lg:col-span-2' : 'w-full'}>
          {loading ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-400 uppercase tracking-widest">Consultando Tablero de Trabajo...</div>
          ) : (
            <div className="space-y-4">
              {ordenes.length > 0 ? ordenes.map(ot => (
                <div key={ot.id} className="bg-slate-900 border border-slate-800 rounded p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg hover:border-slate-700 transition-colors">
                  
                  <div className="space-y-2 max-w-xl w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-950 border border-slate-700 rounded text-slate-400 font-mono font-bold text-xs">{ot.codigo}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-amber-500 font-medium text-xs font-mono uppercase">{ot.activo?.nombre}</span>
                      {ot.incidencia && (
                        <span className="px-1.5 py-0.5 bg-red-950 border border-red-800 text-red-400 rounded text-[10px] font-mono uppercase">[Viene de Incidencia #{ot.incidencia.id}]</span>
                      )}
                    </div>
                    
                    <h4 className="text-slate-200 font-bold text-base tracking-tight">{ot.tarea}</h4>
                    {ot.detalles && <p className="text-slate-400 text-xs italic">{ot.detalles}</p>}
                    
                    <div className="text-[11px] text-slate-500 font-mono flex flex-col sm:flex-row sm:gap-x-4 gap-y-1 pt-1">
                      <span>
                        Encargado:{' '}
                        {ot.tecnicoAsignado ? (
                          <span className="text-slate-300 font-bold">{ot.tecnicoAsignado.nombre || ot.tecnicoAsignado.name}</span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-amber-950/60 border border-amber-900 text-amber-500 rounded text-[10px] font-bold uppercase">
                            ⚠️ Esperando Asignación del Supervisor
                          </span>
                        )}
                      </span>
                      <span>Programado: <span className="text-slate-400">{ot.fechaProgramada ? new Date(ot.fechaProgramada).toLocaleString() : 'Inmediato'}</span></span>
                    </div>

                    {!ot.tecnicoAsignado && ot.estado === 'Pendiente' && (
                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <label className="text-[10px] font-mono uppercase text-slate-400">Designar Operario Técnico:</label>
                        <select 
                          id={`select-tec-${ot.id}`}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:border-amber-500 focus:outline-none"
                        >
                          <option value="">-- Seleccionar Mecánico --</option>
                          {tecnicos.map(tec => (
                            <option key={tec.id} value={tec.id}>{tec.nombre || tec.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase font-mono rounded ${
                      ot.estado === 'Pendiente' ? 'bg-slate-950 border border-slate-700 text-slate-400' :
                      ot.estado === 'En Proceso' ? 'bg-amber-950 border border-amber-700 text-amber-400 animate-pulse' :
                      ot.estado === 'Completada' ? 'bg-emerald-950 border border-emerald-700 text-emerald-400' :
                      'bg-red-950 border border-red-700 text-red-400'
                    }`}>
                      {ot.estado}
                    </span>

                    <div className="flex gap-1 mt-1">
                      {ot.estado === 'Pendiente' && (
                        <button 
                          onClick={() => {
                            if (!ot.tecnicoAsignado) {
                              const selectElement = document.getElementById(`select-tec-${ot.id}`);
                              const idSeleccionado = selectElement?.value;
                              if (!idSeleccionado) {
                                alert('Por favor, designe un operario técnico para ejecutar la orden predictiva.');
                                return;
                              }
                              handleChangeEstado(ot.id, 'En Proceso', Number(idSeleccionado));
                            } else {
                              handleChangeEstado(ot.id, 'En Proceso');
                            }
                          }} 
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-bold uppercase rounded transition-colors"
                        >
                          ▶ Iniciar Trabajo
                        </button>
                      )}
                      {ot.estado === 'En Proceso' && (
                        <button onClick={() => handleChangeEstado(ot.id, 'Completada')} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-slate-950 text-[10px] font-bold uppercase rounded transition-colors">
                          ✔ Finalizar y Liberar
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              )) : (
                <div className="py-12 bg-slate-900 border border-slate-800 text-center text-slate-500 font-mono text-xs uppercase rounded">No hay órdenes de trabajo abiertas en el taller.</div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Mantenimiento;