import React, { useState } from 'react';
import Usuarios from './pages/Usuarios';
import Activos from './pages/Activos';
import Incidencias from './pages/Incidencias';
import Mantenimiento from './pages/Mantenimiento';
import Dashboard from './pages/Dashboard';
import GestionPlanesPreventivos from './pages/GestionPlanesPreventivos';

const App = () => {
  // Estado para controlar la pestaña activa del sistema
  const [activeTab, setActiveTab] = useState('users');
  // Estado para controlar el menú lateral en dispositivos móviles
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Menú de navegación basado en tus Requerimientos Funcionales
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard / KPIs', icon: '📊' },
    { id: 'users', label: 'Control de Personal', icon: '👥' },
    { id: 'assets', label: 'Inventario de Activos', icon: '⚙️' },
    { id: 'incidents', label: 'Incidencias y OTs', icon: '⚠️' },
    { id: 'maintenance', label: 'Mantenimiento', icon: ' M '},
    { id: 'plains', label: 'Planes Preventivos', icon: ' PP '}
  ];

  // Renderizado condicional de las vistas
  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <Usuarios />;
      
      case 'assets':
        return <Activos />;
      
      case 'dashboard':
        return <Dashboard />

      case 'maintenance':
        return <Mantenimiento />;
      case 'incidents':
        return <Incidencias />;

      case 'plains':
        return <GestionPlanesPreventivos />

      default:
        return <Dashboard />;
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

          {/* Estado del Servidor Simulada */}
          <div className="p-4 mx-4 my-3 bg-slate-950/60 border border-slate-800/80 rounded flex items-center justify-between font-mono text-[10px]">
            <span className="text-slate-500 uppercase">Nodo Central:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span> ONLINE
            </span>
          </div>

          {/* Menú de Opciones */}
          <nav className="px-4 space-y-1">
            {menuItems.map((item) => {
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

        {/* Footer del Panel con Datos del Operador */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 font-mono text-[11px] text-slate-500">
          <div>SESIÓN: ADMINISTRADOR</div>
          <div className="text-slate-600">PLANTA: HILANDERÍA</div>
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL DE CONTENIDO */}
      <main className="flex-1 overflow-y-auto bg-slate-950 min-h-[calc(100vh-60px)] md:min-h-screen">
        {renderContent()}
      </main>

    </div>
  );
};

export default App;