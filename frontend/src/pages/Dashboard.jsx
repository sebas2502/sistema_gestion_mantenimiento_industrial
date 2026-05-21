import React, { useState, useEffect } from 'react';
import { obtenerAnaliticaDashboard } from '../api/dashboard';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarDashboard = async () => {
    setLoading(true);
    try {
      const analitica = await obtenerAnaliticaDashboard();
      setData(analitica);
    } catch (err) {
      setError('Error al sincronizar las métricas de confiabilidad industrial.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
    // Auto-refresco cada 30 segundos para simular monitoreo en tiempo real
    const intervalo = setInterval(cargarDashboard, 30000);
    return () => clearInterval(intervalo);
  }, []);

  if (loading && !data) {
    return (
      <div className="p-8 text-center font-mono text-xs text-slate-400 uppercase tracking-widest animate-pulse">
        [PROCESANDO HISTORIAL DE INCIDENCIAS / CÁLCULO MTBF EN TIEMPO REAL]...
      </div>
    );
  }

  const kpis = data?.kpis || { totalActivos: 0, otsPendientes: 0, otsEnProceso: 0, incidenciasAbiertas: 0, disponibilidadGlobal: 100 };
  const alertas = data?.alertasPredictivas || [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
      {/* Encabezado con indicador de sincronización */}
      <div className="mb-8 border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-amber-500 text-xs font-mono tracking-widest uppercase mb-1">Módulo Analítico Avanzado</div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight uppercase">Panel de Confiabilidad y KPIs</h1>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded font-mono text-[11px] text-slate-400">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          <span>SINK MOTOR PREDICTIVO OK</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-950/40 border border-red-800 text-red-400 p-4 rounded text-sm font-mono">[SISTEMA CRÍTICO]: {error}</div>
      )}

      {/* FILA DE INDICADORES / CARD METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* KPI DISPONIBILIDAD */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded relative overflow-hidden shadow-md">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Disponibilidad Planta</div>
          <div className={`text-3xl font-black mt-1 ${kpis.disponibilidadGlobal > 85 ? 'text-emerald-400' : 'text-amber-500'}`}>
            {kpis.disponibilidadGlobal}%
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-2 uppercase">[Objetivo Planta: &gt;90%]</div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-600"></div>
        </div>

        {/* INCIDENCIAS ACTIVAS */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded relative overflow-hidden shadow-md">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Alertas Activas (Operarios)</div>
          <div className="text-3xl font-black text-red-400 mt-1">{kpis.incidenciasAbiertas}</div>
          <div className="text-[9px] text-slate-500 font-mono mt-2 uppercase">Fallas pendientes de validar</div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-red-600"></div>
        </div>

        {/* OTs PENDIENTES */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded relative overflow-hidden shadow-md">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">OTs en Cola (Pendientes)</div>
          <div className="text-3xl font-black text-slate-200 mt-1">{kpis.otsPendientes}</div>
          <div className="text-[9px] text-slate-500 font-mono mt-2 uppercase">Trabajos por asignar</div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-slate-700"></div>
        </div>

        {/* OTs EN PROCESO */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded relative overflow-hidden shadow-md">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">OTs en Curso (Taller)</div>
          <div className="text-3xl font-black text-amber-500 mt-1">{kpis.otsEnProceso}</div>
          <div className="text-[9px] text-slate-500 font-mono mt-2 uppercase">Mecánicos interviniendo</div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500 animate-pulse"></div>
        </div>

        {/* TOTAL ACTIVOS */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded relative overflow-hidden shadow-md">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Activos en Inventario</div>
          <div className="text-3xl font-black text-blue-400 mt-1">{kpis.totalActivos}</div>
          <div className="text-[9px] text-slate-500 font-mono mt-2 uppercase">Máquinas bajo trazabilidad</div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-600"></div>
        </div>
      </div>

      {/* BLOQUE PREDICTIVO DE PATRONES DE DETERIORO */}
      <div className="bg-slate-900 border border-slate-800 rounded shadow-xl overflow-hidden">
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
            🧠 Módulo de Diagnóstico Automático (Análisis Histórico de Incidencias)
          </h3>
          <span className="text-[10px] font-mono text-slate-500 tracking-wider">KPI ADICIONAL: MTBF / FRECUENCIA</span>
        </div>

        <div className="p-6">
          {alertas.length > 0 ? (
            <div className="space-y-4">
              <div className="text-xs text-red-400 font-mono mb-2 uppercase tracking-wide">
                ⚠️ [ALERTA CRÍTICA]: Se han detectado patrones acelerados de falla en los siguientes activos:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alertas.map((alerta) => (
                  <div key={alerta.activoId} className="bg-slate-950 border border-red-900/60 rounded p-5 relative shadow-inner">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-slate-100 font-black uppercase text-sm">{alerta.activoNombre}</h4>
                        <p className="text-slate-500 text-xs font-mono">{alerta.ubicacion}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-red-950 border border-red-700 text-red-400 text-[9px] font-mono rounded font-black uppercase tracking-tight">
                        MTBF CRÍTICO
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed border-l-2 border-red-600 pl-3 my-4 italic">
                      "{alerta.diagnostico}"
                    </p>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-3 mt-3 text-xs font-mono">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">MTBF Histórico</div>
                        <div className="text-red-400 font-bold">{alerta.mtbf} días entre fallas</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Frecuencia (Últ. Mes)</div>
                        <div className="text-amber-500 font-bold">{alerta.frecuenciaMes} Incidentes</div>
                      </div>
                    </div>
                    
                    <div className="bg-emerald-950/20 border border-emerald-900 text-emerald-400 text-[10px] font-mono rounded p-2 mt-4 text-center">
                      🤖 [SISTEMA AUTÓNOMO]: Se emitió una OT Predictiva Automática para este equipo.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 font-mono text-xs uppercase">
              No se detectan comportamientos de fatiga acelerada o anomalías en los intervalos de fallas. Todos los activos operan dentro de los parámetros de confiabilidad esperados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;