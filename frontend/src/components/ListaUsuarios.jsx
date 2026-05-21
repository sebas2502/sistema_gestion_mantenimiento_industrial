import React from 'react';

const ListaUsuarios = ({ usuarios, onEdit, onDelete }) => {
  
  // Función auxiliar para badge de roles con colores de entorno industrial
  const getRoleBadge = (rol) => {
    const styles = {
      administrador: 'bg-red-950 border border-red-700 text-red-400',
      ingeniero: 'bg-blue-950 border border-blue-700 text-blue-400',
      supervisor: 'bg-purple-950 border border-purple-700 text-purple-400',
      tecnico_mantenimiento: 'bg-amber-950 border border-amber-700 text-amber-400',
      operario: 'bg-emerald-950 border border-emerald-700 text-emerald-400',
    };
    
    const labels = {
      administrador: 'ADMIN',
      ingeniero: 'INGENIERO / JEFE',
      supervisor: 'SUPERVISOR',
      tecnico_mantenimiento: 'TÉCNICO MANT.',
      operario: 'OPERARIO'
    };

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-mono tracking-wider uppercase ${styles[rol] || 'bg-slate-800 text-slate-300'}`}>
        {labels[rol] || rol}
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden w-full">
      <div className="p-4 bg-slate-950 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-md font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center space-x-2">
          <span className="w-2 h-2 bg-emerald-500"></span>
          <span>Usuarios Activos en Sistema</span>
        </h3>
        <span className="text-xs bg-slate-800 px-2 py-1 text-slate-400 font-mono rounded">
          Total: { usuarios?.length || 0}
        </span>
      </div>

      {/* VISTA PARA PANTALLAS GRANDES (TABLA) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Rol Asignado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300 text-sm">
           {Array.isArray(usuarios) && usuarios.length > 0 ? (
    usuarios.map((usuario) => (
      <tr key={usuario.id} className="hover:bg-slate-850/50 transition-colors">
        <td className="py-3 px-4 font-mono text-slate-500">#{usuario.id}</td>
        <td className="py-3 px-4 font-medium text-slate-200">{usuario.nombre}</td>
        <td className="py-3 px-4 text-slate-400">{usuario.email}</td>
        <td className="py-3 px-4">{getRoleBadge(usuario.rol)}</td>
        <td className="py-3 px-4 text-right space-x-2">
          <button
            onClick={() => onEdit(usuario)}
            className="px-2 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(usuario.id)}
            className="px-2 py-1 text-xs font-semibold bg-red-950 hover:bg-red-900 border border-red-700 rounded text-red-400 transition-colors"
          >
            Baja
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5" className="py-8 text-center text-slate-500 font-mono text-xs">
        NO SE ENCONTRARON REGISTROS DE PERSONAL O LA DATA NO ES VÁLIDA.
      </td>
    </tr>
  )}
          </tbody>
        </table>
      </div>

      {/* VISTA RESPONSIVE PARA MÓVILES (CARDS) */}
      <div className="block md:hidden divide-y divide-slate-800">
       {Array.isArray(usuarios) && usuarios.length > 0 ? (
  usuarios.map((usuario) => (
    <div key={usuario.id} className="p-4 space-y-3 bg-slate-900 hover:bg-slate-850/30">
      <div className="flex justify-between items-start">
        <div>
          {/* CORREGIDO: de user.id a usuario.id, y de blok a block */}
          <span className="text-xs font-mono text-slate-500 block mb-0.5">ID #{usuario.id}</span>
          <h4 className="text-slate-200 font-bold">{usuario.nombre}</h4>
          <p className="text-xs text-slate-400">{usuario.email}</p>
        </div>
        <div>{getRoleBadge(usuario.rol)}</div>
      </div>
      <div className="flex justify-end space-x-2 pt-1">
        <button
          onClick={() => onEdit(usuario)}
          className="flex-1 py-1.5 text-center text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(usuario.id)}
          className="flex-1 py-1.5 text-center text-xs font-bold bg-red-950 hover:bg-red-900 border border-red-700 rounded text-red-400 transition-colors"
        >
          Dar Baja
        </button>
      </div>
    </div>
  ))
) : (
  <div className="py-8 text-center text-slate-500 font-mono text-xs">
    NO SE ENCONTRARON REGISTROS DE PERSONAL.
  </div>
)}
      </div>
    </div>
  );
};

export default ListaUsuarios;