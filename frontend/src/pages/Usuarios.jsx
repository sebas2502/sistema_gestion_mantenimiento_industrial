import React, { useState, useEffect } from 'react';
import ListaUsuarios from '../components/ListaUsuarios';
import UsuarioForm from '../components/UsuarioForm';

// Importamos todas las operaciones de tu archivo de endpoints personalizados de Axios
import { 
  obtenerUsuarios, 
  crearUsuario, 
  actualizarUsuario, 
  eliminarUsuario 
} from "../api/usuarios";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // RF23: Consultar usuarios de la base de datos al cargar la página
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Con Axios, obtenerUsuarios() ya nos devuelve la data limpia (el array de usuarios)
      const data = await obtenerUsuarios();
      
      setUsuarios(data);
    } catch (err) {
      // Captura el mensaje de error que envíe Axios o el backend
      setError(err.response?.data?.message || 'No se pudo sincronizar la lista de personal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // RF21 y RF22: Registrar nuevo usuario o modificar datos existentes
  const handleFormSubmit = async (formData) => {
    setError(null);
    try {
      if (editingUser) {
        // Modificar Usuario (RF22) -> Usando Axios estructurado
        await actualizarUsuario(editingUser.id, formData);
      } else {
        // Registrar Nuevo Usuario (RF21) -> Usando Axios estructurado
        await crearUsuario(formData);
      }
      
      // Reiniciar estados y refrescar lista si todo sale bien
      setEditingUser(null);
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la solicitud del usuario.');
    }
  };

  // RF25: Dar de baja un usuario (Baja lógica gestionada en backend)
  const handleDeleteUser = async (id) => {
    if (window.confirm('¿Confirmar la baja del operador/técnico seleccionado? Se aplicará una desactivación lógica en el sistema.')) {
      setError(null);
      try {
        // Eliminación por Axios pasando el ID
        await eliminarUsuario(id);
        fetchUsers(); // Refrescar la tabla
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo procesar la baja del usuario.');
      }
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingUser(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-100 font-sans">
      {/* Encabezado del Módulo con Estilo Terminal Industrial */}
      <div className="mb-8 border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-500 text-xs font-mono tracking-widest uppercase mb-1">
            <span>Módulo de Control General</span>
            <span>/</span>
            <span className="text-slate-400">Personal de Planta</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight uppercase">
            Administración de Usuarios y Roles
          </h1>
        </div>

        {/* Botón de acción principal */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="self-start md:self-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-sm uppercase tracking-wider shadow-md transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Dar de Alta Personal</span>
          </button>
        )}
      </div>

      {/* Alertas de Error del Sistema */}
      {error && (
        <div className="mb-6 max-w-4xl mx-auto bg-red-950/40 border border-red-800 text-red-400 p-4 rounded text-sm flex items-center space-x-3 font-mono">
          <div className="w-2 h-2 bg-red-500 animate-ping rounded-full"></div>
          <div><strong className="font-bold">[FALLA DE SISTEMA]:</strong> {error}</div>
        </div>
      )}

      {/* Grid Dinámico: Si el formulario está abierto, divide la pantalla */}
      <div className={`grid gap-8 ${showForm ? 'lg:grid-cols-3' : 'grid-cols-1'} max-w-7xl mx-auto`}>
        
        {/* Columna del Formulario */}
        {showForm && (
          <div className="lg:col-span-1">
            <UsuarioForm 
              onSubmit={handleFormSubmit} 
              initialData={editingUser} 
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Columna de la Tabla de Visualización (RF23, RF25) */}
        <div className={showForm ? 'lg:col-span-2' : 'w-full'}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-900 border border-slate-800 rounded-lg">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Sincronizando Base de Datos...</p>
            </div>
          ) : (
            <ListaUsuarios 
              usuarios={usuarios} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteUser}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default Usuarios;