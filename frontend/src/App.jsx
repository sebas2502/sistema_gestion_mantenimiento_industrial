import React, { useState, useEffect } from 'react';
import Usuarios from './pages/Usuarios';
import Activos from './pages/Activos';
import Incidencias from './pages/Incidencias';
import Mantenimiento from './pages/Mantenimiento';
import Dashboard from './pages/Dashboard';
import GestionPlanesPreventivos from './pages/GestionPlanesPreventivos';
import Login from './pages/Login'; // Importación de la nueva vista de acceso
import { cerrarSesion } from './api/auth';

const App = () => {
  // Estado para el usuario autenticado (guarda: { id, nombre, rol })
  const [usuario, setUsuario] = useState(null);
  // Control de carga inicial mientras lee el almacenamiento local
  const [checkingAuth, setCheckingAuth] = useState(true);
  // Estado para controlar la pestaña activa del sistema
  const [activeTab, setActiveTab] = useState('incidents'); // Seteamos incidencias por defecto para planta
  // Estado para controlar el menú lateral en dispositivos móviles
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🛡️ Efecto para validar si ya existe una sesión remanente en la máquina
  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');
    
    if (token && usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCheckingAuth(false);
  }, []);

  const handleLoginSuccess = (usuarioLogueado) => {
    setUsuario(usuarioLogueado);
    // Redirección inteligente de pantalla según privilegios de rol al ingresar
    if (usuarioLogueado.rol === 'OPERARIO') {
      setActiveTab('incidents');
    } else if (usuarioLogueado.rol === 'TECNICO_MANTENIMIENTO'){
      setActiveTab('maintenance')
    }else{
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    cerrarSesion();
    setUsuario(null);
  };

  // 🔐 Menú mapeado con restricciones estrictas de rol
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard / KPIs', icon: '📊', rolesPermitidos: ['SUPERVISOR', 'ADMINISTRADOR'] },
    { id: 'users', label: 'Control de Personal', icon: '👥', rolesPermitidos: ['ADMINISTRADOR'] },
    { id: 'assets', label: 'Inventario de Activos', icon: '⚙️', rolesPermitidos: ['SUPERVISOR', 'ADMINISTRADOR'] },
    { id: 'incidents', label: 'Incidencias y OTs', icon: '⚠️', rolesPermitidos: ['OPERARIO', 'SUPERVISOR', 'ADMINISTRADOR'] },
    { id: 'maintenance', label: 'Mantenimiento', icon: ' M ', rolesPermitidos: ['SUPERVISOR', 'ADMINISTRADOR','TECNICO_MANTENIMIENTO'] },
    { id: 'plains', label: 'Planes Preventivos', icon: ' PP ', rolesPermitidos: ['SUPERVISOR', 'ADMINISTRADOR'] }
  ];

  // Pantalla de carga preventiva (Evita parpadeos de interfaz)
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 font-mono text-xs flex items-center justify-center text-slate-400 uppercase tracking-widest animate-pulse">
        Sincronizando Estado del Nodo...
      </div>
    );
  }

  // 🛑 GUARDA DE ACCESO PRINCIPAL: Si no hay sesión, fuerza el Login
  if (!usuario) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Filtrado de la barra lateral en base al rol del usuario logueado
  const menuFiltrado = menuItems.filter(item => item.rolesPermitidos.includes(usuario.rol));

  // Renderizado condicional de las vistas
  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <Usuarios />;
      
      case 'assets':
        return <Activos />;
      
      case 'dashboard':
        return <Dashboard />;

      case 'maintenance':
        return <Mantenimiento />;
      
      case 'incidents':
        // Le pasamos el objeto usuario por prop por si lo usás internamente
        return <Incidencias usuarioActual={usuario} />;

      case 'plains':
        return <GestionPlanesPreventivos />;

      default:
        return <Incidencias usuarioActual={usuario} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-900">
      
      {/* BARRA SUPERIOR PARA DISPOSITIVOS MÓVILES */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-50">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-amber-500"></div>
          <span className="font-mono text-xs font-bold tracking-widest uppercase text-slate-200">CMMS - Emilio Alal</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-400 hover:text-slate-100 font-mono text-sm border border-slate-700 px-2 py-1 rounded bg-slate-950"
        >
          {isMobileMenuOpen ? 'CERRAR' : 'MENÚ'}
        </button>
      </div>

      {/* SIDEBAR CENTRAL (RESPONSIVE) */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition-transform duration-200 ease-in-out
        w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between z-40 pt-16 md:pt-0
      `}>
        <div>
          {/* Logo / Header del Sistema en Escritorio */}
          <div className="hidden md:flex items-center space-x-2 p-6 border-b border-slate-800">
            <div className="w-3 h-3 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
            <div>
              <h2 className="font-black text-sm tracking-wider uppercase text-slate-100">EA - INTEL-MAIN</h2>
              <p className="text-[10px] font-mono text-slate-500 tracking-tight">SISTEMA DE GESTIÓN INDUSTRIAL</p>
            </div>
          </div>

          {/* Monitor del Rol Activo */}
          <div className="p-4 mx-4 my-3 bg-slate-950/60 border border-slate-800/80 rounded flex items-center justify-between font-mono text-[10px]">
            <span className="text-slate-500 uppercase">Rango Asignado:</span>
            <span className="text-amber-400 font-bold tracking-wider">[{usuario.rol}]</span>
          </div>

          {/* Menú de Opciones Filtrado dinámicamente */}
          <nav className="px-4 space-y-1">
            {menuFiltrado.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false); // Cierra el menú en celular al hacer clic
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded text-sm font-medium transition-all uppercase tracking-wider
                    ${isActive 
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent hover:border-slate-800'
                    }
                  `}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="font-mono text-xs">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer del Panel con Datos del Operador y Botón de Desconexión */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 font-mono text-[11px] flex flex-col gap-2">
          <div className="text-slate-500">
            <div>OPERADOR: <span className="text-slate-300 font-bold">{usuario.nombre.toUpperCase()}</span></div>
            <div className="text-slate-600 mt-0.5">PLANTA: HILANDERÍA</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-1 py-1.5 bg-slate-950 hover:bg-red-950/40 border border-slate-850 hover:border-red-900/60 text-slate-500 hover:text-red-400 transition-all rounded text-[10px] font-bold uppercase tracking-wider"
          >
            ❌ Desconectar Nodo
          </button>
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL DE CONTENIDO (Alineado al inicio vertical de forma estricta) */}
      <main className="flex-1 overflow-y-auto bg-slate-950 min-h-[calc(100vh-60px)] md:min-h-screen flex flex-col items-start justify-start">
        {renderContent()}
      </main>

    </div>
  );
};

export default App;