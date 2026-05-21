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
        console.log(err)
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8 border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-amber-500 text-xs font-mono tracking-widest uppercase mb-1">Módulo Operativo / Activos</div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight uppercase">Inventario de Maquinaria</h1>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-sm uppercase tracking-wider transition-colors">
            + Registrar Nuevo Activo
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-950/40 border border-red-800 text-red-400 p-4 rounded text-sm font-mono flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          <span>[ERROR DE SINK]: {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {showForm && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded shadow-xl h-fit">
            <h3 className="text-lg font-bold text-slate-200 mb-4 uppercase tracking-wider font-mono">
              {editId ? '[Modificar Activo]' : '[Nuevo Activo Industrial]'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Nombre / Modelo</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:border-amber-500 focus:outline-none" placeholder="Ej: Carda Rieter C70" />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Tipo de Máquina</label>
                <input type="text" value={tipo} onChange={e => setTipo(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:border-amber-500 focus:outline-none" placeholder="Ej: Hilado / Cardado" />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Ubicación / Sector Planta</label>
                <input type="text" value={ubicacion} onChange={e => setUbicacion(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:border-amber-500 focus:outline-none" placeholder="Ej: Hilandería Sector A" />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Estado Operativo</label>
                <select value={estado} onChange={e => setEstado(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-sm focus:border-amber-500 focus:outline-none">
                  <option value="Activo">Activo</option>
                  <option value="En Mantenimiento">En Mantenimiento</option>
                  <option value="Fuera de Servicio">Fuera de Servicio</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-bold text-xs uppercase tracking-wider rounded">Guardar</button>
                <button type="button" onClick={limpiarFormulario} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs uppercase rounded">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className={showForm ? 'lg:col-span-2' : 'w-full'}>
          {loading ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-400 uppercase tracking-widest">Consultando Activos Planta...</div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-xs uppercase">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Activo / Tipo</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                  {activos.length > 0 ? activos.map(act => (
                    <tr key={act.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">#{act.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">{act.nombre}</div>
                        <div className="text-xs text-slate-500">{act.tipo}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{act.ubicacion}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          act.estado === 'Activo' ? 'bg-emerald-950 border border-emerald-700 text-emerald-400' :
                          act.estado === 'En Mantenimiento' ? 'bg-amber-950 border border-amber-700 text-amber-400' :
                          'bg-red-950 border border-red-700 text-red-400'
                        }`}>
                          {act.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button onClick={() => handleEdit(act)} className="px-2 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded">Modificar</button>
                        <button onClick={() => handleDelete(act.id)} className="px-2 py-1 text-xs font-mono bg-red-950 hover:bg-red-900 border border-red-700 text-red-400 rounded">Baja</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500 font-mono text-xs uppercase">No hay activos registrados en planta.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activos;