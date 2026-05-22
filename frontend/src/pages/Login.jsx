import React, { useState } from 'react';
import { iniciarSesion } from '../api/auth';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !clave) return;

    setLoading(true);
    setError(null);

    try {
      const datosSesion = await iniciarSesion(email, clave);
      // Notificamos al App.jsx que el usuario ingresó correctamente
      onLoginSuccess(datosSesion.usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-2xl">
        
        {/* Encabezado de la Terminal */}
        <div className="flex items-center space-x-2 pb-4 mb-6 border-b border-slate-800">
          <div className="w-3 h-3 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
          <div>
            <h2 className="font-black text-sm tracking-wider uppercase text-slate-100">EA - INTEL-MAIN</h2>
            <p className="text-[9px] text-slate-500 tracking-tight">SISTEMA DE ACCESO INDUSTRIAL</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-950/40 border border-red-800 text-red-400 p-3 rounded text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
            <span>[AUTH_ERR]: {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase text-slate-400 mb-1 tracking-wider">Email de Usuario</label>
            <input 
              type="text" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-xs focus:border-amber-500 focus:outline-none transition-colors"
              placeholder="Ej. emailusuario@email.com"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-slate-400 mb-1 tracking-wider">Clave de Seguridad</label>
            <input 
              type="password" 
              value={clave}
              onChange={e => setClave(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-200 text-xs focus:border-amber-500 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 font-black text-xs uppercase tracking-widest rounded transition-all shadow-md flex justify-center items-center"
          >
            {loading ? 'AUTENTICANDO NODO...' : 'INGRESAR AL SISTEMA'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/60 text-center text-[9px] text-slate-600">
          PLANTA COMPLEJO INDUSTRIAL EMILIO ALAL &copy; 2026
        </div>
      </div>
    </div>
  );
};

export default Login;