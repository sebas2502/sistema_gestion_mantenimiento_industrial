import React, { useState, useEffect } from 'react';
import { obtenerActivos, crearActivo, actualizarActivo, eliminarActivo } from '../api/activos';

const Activos = () => {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para el formulario (Alta/Edición)
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [estado, setEstado] = useState('Activo');

  const cargarActivos = async () => {
    setLoading(true);
    try {
      const data = await obtenerActivos();
      setActivos(data);
    } catch (err) {
      console.log(err);
      setError('Error al sincronizar el inventario de activos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarActivos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const datos = { nombre, tipo, ubicacion, estado };
    try {
      if (editId) {
        await actualizarActivo(editId, datos);
      } else {
        await crearActivo(datos);
      }
      limpiarFormulario();
      cargarActivos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar el activo.');
    }
  };

  const handleEdit = (activo) => {
    setEditId(activo.id);
    setNombre(activo.nombre);
    setTipo(activo.tipo);
    setUbicacion(activo.ubicacion);
    setEstado(activo.estado);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Dar de baja este activo del sistema? Se aplicará una desactivación lógica.')) {
      try {
        await eliminarActivo(id);
        cargarActivos();
      } catch (err) {
        setError('No se pudo procesar la baja del equipo.');
      }
    }
  };

  const limpiarFormulario = () => {
    setEditId(null);
    setNombre('');
    setTipo('');
    setUbicacion('');
    setEstado('Activo');
    setShowForm(false);
  };

  return (
    /* 🔥 CORRECCIÓN 1: Cambiamos max-w-7xl por w-full para ocupar todo el monitor. Forzamos font-mono. */
    <div className="p-4 md:p-6 w-full font-mono bg-slate-950 min-h-screen text-slate-100">
      
      {/* CABECERA DE LA PANTALLA */}
      <div className="mb-6 border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-amber-500 text-xs tracking-widest uppercase mb-1">Módulo Operativo / Activos</div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-wider uppercase">Inventario de Maquinaria</h1>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs uppercase tracking-wider transition-all whitespace-nowrap shadow-md">
            + Registrar Nuevo Activo
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-950/40 border border-red-800 text-red-400 p-4 rounded text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          <span>[ERROR DE SINK]: {error}</span>
        </div>
      )}

      {/* GRID DE DISTRIBUCIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* PANEL DEL FORMULARIO */}
        {showForm && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg shadow-xl sticky top-6">
            <h3 className="text-sm font-bold text-amber-500 mb-4 uppercase tracking-wider border-b border-slate-800 pb-2">
              {editId ? '⚙️ Modificar Activo' : '⚙️ Nuevo Activo Industrial'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase text-slate-400 mb-1">Nombre / Modelo</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs focus:border-amber-500 focus:outline-none" placeholder="Ej: Carda Rieter C70" />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-slate-400 mb-1">Tipo de Máquina</label>
                <input type="text" value={tipo} onChange={e => setTipo(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs focus:border-amber-500 focus:outline-none" placeholder="Ej: Hilado / Cardado" />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-slate-400 mb-1">Ubicación / Sector Planta</label>
                <input type="text" value={ubicacion} onChange={e => setUbicacion(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs focus:border-amber-500 focus:outline-none" placeholder="Ej: Hilandería Sector A" />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-slate-400 mb-1">Estado Operativo</label>
                <select value={estado} onChange={e => setEstado(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs focus:border-amber-500 focus:outline-none">
                  <option value="Activo">Activo</option>
                  <option value="En Mantenimiento">En Mantenimiento</option>
                  <option value="Fuera de Servicio">Fuera de Servicio</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded transition-colors">Guardar</button>
                <button type="button" onClick={limpiarFormulario} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs uppercase rounded transition-colors">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* CONTENEDOR DE LA TABLA PRINCIPAL */}
        {/* 🔥 CORRECCIÓN 2: Si no hay formulario, forzamos que use el 100% real (w-full) sin restricciones latentes */}
        <div className={showForm ? 'lg:col-span-2 w-full' : 'w-full lg:col-span-3'}>
          {loading ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded text-xs text-slate-400 uppercase tracking-widest animate-pulse">
              Consultando Activos Planta...
            </div>
          ) : (
            /* 🔥 CORRECCIÓN 3: bg-slate-900/40 y overflow-x-auto obligatorio para evitar roturas del layout */
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden shadow-xl w-full">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4 w-16 text-center">ID</th>
                      <th className="py-3 px-4">Activo / Tipo</th>
                      <th className="py-3 px-4">Sector / Ubicación</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right pr-6">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {activos.length > 0 ? activos.map(act => (
                      <tr key={act.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-500">#{act.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-200 uppercase tracking-wide">{act.nombre}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{act.tipo}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{act.ubicacion}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            act.estado === 'Activo' ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-400' :
                            act.estado === 'En Mantenimiento' ? 'bg-amber-950/60 border border-amber-800/60 text-amber-400' :
                            'bg-red-950/60 border border-red-800/60 text-red-400'
                          }`}>
                            {act.estado}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2 pr-6 whitespace-nowrap">
                          <button onClick={() => handleEdit(act)} className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded transition-colors">Modificar</button>
                          <button onClick={() => handleDelete(act.id)} className="px-2.5 py-1 text-[11px] bg-red-950/40 hover:bg-red-900/40 border border-red-900/60 text-red-400 rounded transition-colors">Baja</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-slate-500 italic uppercase tracking-wider">No hay activos registrados en planta.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activos;