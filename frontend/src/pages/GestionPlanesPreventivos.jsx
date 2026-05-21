import React, { useState, useEffect } from 'react';
import { obtenerPlanesPreventivos, crearPlanPreventivo, dispararSimulacionPreventivo } from '../api/planes';
// Nota: Deberías importar también tu servicio de activos para el select, ej:
// import { obtenerActivos } from '../api/activos';

export default function GestionPlanesPreventivos() {
  // Estado para listar los datos reales del backend
  const [planes, setPlanes] = useState([]);
  const [activos, setActivos] = useState([]); 
  const [cargando, setCargando] = useState(false);
  const [simulando, setSimulando] = useState(false); // 🔥 Estado para controlar el proceso de simulación

  // Estados para el formulario de nuevo plan
  const [nombrePlan, setNombrePlan] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [frecuenciaDias, setFrecuenciaDias] = useState(30);
  const [activoSeleccionado, setActivoSeleccionado] = useState('');
  
  // Array dinámico para las tareas del checklist
  const [tareasChecklist, setTareasChecklist] = useState([{ nombre: '', especificacion: '' }]);

  // 🔍 Sincronización inicial con la API
  useEffect(() => {
    // Hardcodeo temporal de activos hasta que uses tu endpoint real de equipos
    setActivos([
      { id: 1, nombre: "COMPRESOR - A" },
      { id: 2, nombre: "HILADORA TRUETZSCHLER" }
    ]);

    cargarPlanesDesdeBackend();
  }, []);

  // 🔍 Función para consultar los planes actualizados mediante Axios
  const cargarPlanesDesdeBackend = async () => {
    try {
      setCargando(true);
      const data = await obtenerPlanesPreventivos();
      setPlanes(data); // Axios mapea el JSON directamente a res.data
    } catch (error) {
      console.error("Error al sincronizar planes preventivos:", error);
      alert("Error al sincronizar los planes preventivos con el servidor central.");
    } finally {
      setCargando(false);
    }
  };

  // 🔥 Función para gatillar el cron job de simulación manual
  const manejarSimulacionTiempo = async () => {
    try {
      setSimulando(true);
      const respuesta = await dispararSimulacionPreventivo();
      
      alert(`🤖 Simulación del Sistema: ${respuesta.message || 'Ciclo preventivo ejecutado con éxito.'}`);
      
      // Refrescamos al instante el listado para ver los nuevos vencimientos actualizados por el backend
      await cargarPlanesDesdeBackend();
    } catch (error) {
      console.error("Fallo al ejecutar la simulación cron:", error);
      alert("No se pudo procesar la simulación temporal en el servidor.");
    } finally {
      setSimulando(false);
    }
  };

  // Funciones para manejar el Checklist Dinámico
  const manejarCambioTarea = (index, campo, valor) => {
    const nuevasTareas = [...tareasChecklist];
    nuevasTareas[index][campo] = valor;
    setTareasChecklist(nuevasTareas);
  };

  const agregarRenglonTarea = () => {
    setTareasChecklist([...tareasChecklist, { nombre: '', especificacion: '' }]);
  };

  const eliminarRenglonTarea = (index) => {
    if (tareasChecklist.length > 1) {
      setTareasChecklist(tareasChecklist.filter((_, i) => i !== index));
    }
  };

  // 🔍 Envío estructurado del DTO al Backend mediante Axios
  const guardarPlanPreventivo = async (e) => {
    e.preventDefault();

    const nuevoPlanDTO = {
      nombrePlan,
      descripcion,
      frecuenciaDias: parseInt(frecuenciaDias),
      activoId: parseInt(activoSeleccionado),
      // Enviamos el lote filtrando posibles campos vacíos accidentales
      tareas: tareasChecklist.filter(t => t.nombre.trim() !== '') 
    };

    try {
      setCargando(true);
      console.log("[API POST] Despachando Plan Preventivo con Axios:", nuevoPlanDTO);
      
      // Ejecución de la API centralizada
      await crearPlanPreventivo(nuevoPlanDTO);
      
      alert("¡Plan Preventivo y Checklist relacional guardados con éxito!");
      
      // Resetear el formulario tras la persistencia exitosa
      setNombrePlan('');
      setDescripcion('');
      setFrecuenciaDias(30);
      setActivoSeleccionado('');
      setTareasChecklist([{ nombre: '', especificacion: '' }]);
      
      // 🔍 Refrescamos de inmediato la grilla operativa
      await cargarPlanesDesdeBackend();

    } catch (error) {
      console.error("Fallo al guardar el plan preventivo:", error);
      alert("No se pudo procesar el guardado del plan preventivo. Verifique la red.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 font-mono grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* COLUMNA 1 Y 2: LISTADO DE PLANES PREVENTIVOS ACTUALES */}
      <div className="lg:col-span-2 space-y-4">
        <div className="border-b border-slate-800 pb-2 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-sky-400 tracking-wide">📅 PLANES DE MANTENIMIENTO PREVENTIVO</h2>
            <p className="text-xs text-slate-400">Cronogramas sistemáticos y hojas de ruta activas por activo.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 🔥 BOTÓN DE ACCIÓN PARA LA SIMULACIÓN DE LA DEFENSA */}
            <button
              type="button"
              onClick={manejarSimulacionTiempo}
              disabled={simulando || cargando}
              className={`text-xs font-bold px-3 py-1.5 rounded border transition-all ${
                simulando 
                  ? 'bg-amber-950/40 text-amber-500 border-amber-800/50 animate-pulse cursor-not-allowed' 
                  : 'bg-amber-600/10 text-amber-400 border-amber-500/30 hover:bg-amber-600/20'
              }`}
            >
              {simulando ? '⏳ Ejecutando...' : '⏰ Forzar Simulación Cron Job'}
            </button>

            {cargando && (
              <span className="text-xs text-sky-400 animate-pulse bg-sky-950/50 px-2 py-1 rounded border border-sky-800">
                Sincronizando...
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {planes.length === 0 && !cargando ? (
            <p className="text-xs text-slate-500 italic p-4 bg-slate-900 rounded-lg border border-slate-800">
              No hay planes preventivos programados en el sistema. Use el panel lateral para dar de alta el primero.
            </p>
          ) : (
            planes.map(plan => (
              <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-md">
                <div className="flex justify-between items-start border-b border-slate-800/60 pb-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-200">{plan.nombrePlan}</h3>
                    <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                      🎰 Activo: {plan.activo?.nombre || plan.activoNombre || `ID: ${plan.activoId}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-sky-950 text-sky-400 px-2 py-0.5 rounded font-bold border border-sky-800">
                      Cada {plan.frecuenciaDias} días
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Próximo: {plan.fechaProximaFrecuencia ? new Date(plan.fechaProximaFrecuencia).toLocaleDateString() : 'Sin definir'}
                    </p>
                  </div>
                </div>

                {/* Visualización del Checklist asignado */}
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">📋 Checklist Configurado:</p>
                  {plan.tareas && plan.tareas.length > 0 ? (
                    plan.tareas.map((t, idx) => (
                      <div key={t.id || idx} className="bg-slate-950/60 px-3 py-1.5 rounded border border-slate-800/40 text-xs flex justify-between">
                        <span className="text-slate-300">{idx + 1}. {t.nombre}</span>
                        <span className="text-slate-500 italic text-[11px]">{t.especificacion || 'General'}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">Este plan no cuenta con subtareas individuales.</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* COLUMNA 3: FORMULARIO DINÁMICO DE CARGA (EL PLANIFICADOR) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-xl h-fit">
        <h3 className="text-md font-bold text-emerald-400 mb-4 pb-2 border-b border-slate-800">⚙️ PROGRAMAR NUEVO PLAN</h3>
        
        <form onSubmit={guardarPlanPreventivo} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nombre del Plan:</label>
            <input 
              type="text" required value={nombrePlan} onChange={e => setNombrePlan(e.target.value)}
              placeholder="Ej: Revisión Eléctrica Mensual"
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Descripción corta:</label>
            <textarea 
              value={descripcion} onChange={e => setDescripcion(e.target.value)}
              placeholder="Detalles sobre las paradas de máquina o herramientas..."
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 h-16 resize-none focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Frecuencia (Días):</label>
              <input 
                type="number" required min="1" value={frecuenciaDias} onChange={e => setFrecuenciaDias(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Asignar Equipo:</label>
              <select 
                required value={activoSeleccionado} onChange={e => setActivoSeleccionado(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Seleccionar...</option>
                {activos.map(act => <option key={act.id} value={act.id}>{act.nombre}</option>)}
              </select>
            </div>
          </div>

          {/* SECCIÓN DINÁMICA: CONSTRUCTOR DE CHECKLIST */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">🛠️ Pasos del Checklist:</label>
              <button 
                type="button" onClick={agregarRenglonTarea}
                className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded border border-emerald-700/50 transition-all"
              >
                ➕ Agregar Tarea
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {tareasChecklist.map((tarea, index) => (
                <div key={index} className="bg-slate-950 p-2 rounded border border-slate-800 relative space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-bold">Tarea #{index + 1}</span>
                    {tareasChecklist.length > 1 && (
                      <button 
                        type="button" onClick={() => eliminarRenglonTarea(index)}
                        className="text-red-400 hover:text-red-500 text-[10px] underline"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <input 
                    type="text" required placeholder="¿Qué hay que hacer? (Ej: Limpiar filtro)"
                    value={tarea.nombre} onChange={e => manejarCambioTarea(index, 'nombre', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <input 
                    type="text" placeholder="Especificación técnica (Opcional)"
                    value={tarea.especificacion} onChange={e => manejarCambioTarea(index, 'especificacion', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={cargando || simulando}
            className={`w-full text-slate-950 font-bold text-xs py-2 rounded transition-all shadow-lg ${
              cargando || simulando ? 'bg-emerald-800 cursor-not-allowed text-slate-400' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {cargando ? 'Guardando en Servidor...' : '💾 Guardar Plan y Checklist'}
          </button>
        </form>
      </div>

    </div>
  );
}