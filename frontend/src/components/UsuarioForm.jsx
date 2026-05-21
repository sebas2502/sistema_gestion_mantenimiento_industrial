import React, { useState, useEffect } from 'react';

const UsuarioForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    clave: '',
    rol: 'operario'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        email: initialData.email || '',
        clave: '', // Por seguridad no se rellena la contraseña al editar
        rol: initialData.rol || 'operario'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-xl max-w-md mx-auto">
      <div className="flex items-center space-x-2 border-b border-slate-700 pb-3 mb-4">
        {/* Detalle estético industrial: un cuadrado amarillo de estado */}
        <div className="w-3 h-3 bg-amber-500 animate-pulse"></div>
        <h2 className="text-xl font-bold text-slate-100 tracking-wide uppercase">
          {initialData ? 'Modificar Usuario' : 'Registrar Nuevo Usuario'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Nombre Completo
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
            placeholder="Ej: Sebastián Contreras"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={!!initialData} // Bloqueado si se está editando
            className={`w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors ${!!initialData ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="usuario@emilioalal.com.ar"
          />
        </div>

        {!initialData && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="clave"
              value={formData.clave}
              onChange={handleChange}
              required={!initialData}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Rol / Puesto de Trabajo
          </label>
          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
          >
            <option value="operario">Operario</option>
            <option value="tecnico_mantenimiento">Técnico de Mantenimiento</option>
            <option value="supervisor">Supervisor</option>
            <option value="ingeniero">Ingeniero / Jefe de Planta</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded text-sm font-medium transition-colors uppercase tracking-wider"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded text-sm font-bold transition-colors uppercase tracking-wider shadow-md"
          >
            {initialData ? 'Guardar Cambios' : 'Confirmar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UsuarioForm;