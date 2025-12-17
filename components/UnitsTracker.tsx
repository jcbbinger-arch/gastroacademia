import React, { useState } from 'react';
import { Course, Unit, UnitStatus, ResultadoAprendizaje } from '../types';
import { Clock, AlertCircle, Layers, GraduationCap, ChevronRight, CheckCircle2, Link as LinkIcon } from 'lucide-react';

interface UnitsTrackerProps {
  courses: Course[];
}

const StatusBadge: React.FC<{ status: UnitStatus }> = ({ status }) => {
  const colors = {
    [UnitStatus.COMPLETED]: 'bg-green-100 text-green-700 border-green-200',
    [UnitStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700 border-blue-200',
    [UnitStatus.PENDING]: 'bg-gray-100 text-gray-600 border-gray-200',
    [UnitStatus.DELAYED]: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[status]}`}>
      {status}
    </span>
  );
};

const UnitsTracker: React.FC<UnitsTrackerProps> = ({ courses }) => {
  const [activeTab, setActiveTab] = useState<'units' | 'ras'>('units');

  // --- HELPER: Calculate RA Progress based on linked Units ---
  const getRaStats = (ra: ResultadoAprendizaje, units: Unit[]) => {
    // 1. Find all unique Unit IDs linked to this RA via Criteria Associations
    const linkedUnitIds = new Set<string>();
    ra.criterios.forEach(crit => {
        crit.asociaciones.forEach(assoc => {
            if (assoc.utId) linkedUnitIds.add(assoc.utId);
        });
    });

    // 2. Aggregate hours from those Units
    let totalPlanned = 0;
    let totalRealized = 0;
    const linkedUnitsDetails: { id: string; title: string; percent: number }[] = [];

    if (linkedUnitIds.size === 0) {
        return { totalPlanned: 0, totalRealized: 0, percent: 0, linkedUnitsDetails: [] };
    }

    linkedUnitIds.forEach(utId => {
        const unit = units.find(u => u.id === utId);
        if (unit) {
            const uPlanned = unit.hoursPlannedTheory + unit.hoursPlannedPractice;
            const uRealized = unit.hoursRealized;
            totalPlanned += uPlanned;
            totalRealized += uRealized;
            
            linkedUnitsDetails.push({
                id: unit.id,
                title: unit.title.split(':')[0], // e.g., "UD1"
                percent: uPlanned > 0 ? (uRealized / uPlanned) * 100 : 0
            });
        }
    });

    const percent = totalPlanned > 0 ? (totalRealized / totalPlanned) * 100 : 0;

    return { totalPlanned, totalRealized, percent, linkedUnitsDetails };
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header & Tabs */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Seguimiento Académico</h2>
          <p className="text-gray-500">Monitoriza el avance de Unidades y Resultados de Aprendizaje.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('units')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'units' ? 'bg-white text-chef-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <Layers size={16} /> Unidades (UT)
            </button>
            <button 
                onClick={() => setActiveTab('ras')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'ras' ? 'bg-white text-chef-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <GraduationCap size={16} /> Resultados (RA)
            </button>
        </div>
      </div>

      {/* --- TAB: UNITS VIEW --- */}
      {activeTab === 'units' && (
        <div className="space-y-8">
            {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-chef-50 p-4 border-b border-chef-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-chef-900">{course.name}</h3>
                        <span className="text-xs text-chef-600 uppercase tracking-wide">{course.cycle}</span>
                    </div>
                    <div className="text-right hidden md:block">
                        <span className="text-xs font-bold text-gray-400 uppercase block">Progreso Global</span>
                        <span className="text-xl font-black text-chef-700">
                             {Math.round((course.units.reduce((acc, u) => acc + u.hoursRealized, 0) / Math.max(1, course.annualHours)) * 100)}%
                        </span>
                    </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {course.units.map((unit) => {
                    const totalPlanned = unit.hoursPlannedTheory + unit.hoursPlannedPractice;
                    const percent = Math.min(100, totalPlanned > 0 ? (unit.hoursRealized / totalPlanned) * 100 : 0);
                    
                    return (
                    <div key={unit.id} className="p-4 hover:bg-gray-50 transition-colors group">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800 text-lg">{unit.title.split(':')[0]}</span>
                            <span className="text-gray-700 font-medium text-sm truncate">{unit.title.split(':')[1]}</span>
                            <StatusBadge status={unit.status} />
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1">{unit.description}</p>
                        </div>

                        <div className="flex items-center gap-6 min-w-[200px]">
                            <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1 font-semibold text-gray-600">
                                <span>Realizado</span>
                                <span>{unit.hoursRealized} / {totalPlanned} h</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                    unit.hoursRealized >= totalPlanned ? 'bg-green-500' : 
                                    unit.status === UnitStatus.DELAYED ? 'bg-red-400' : 'bg-chef-500'
                                }`}
                                style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                            </div>
                        </div>
                        </div>
                        
                        {unit.status === UnitStatus.DELAYED && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded animate-pulse">
                            <AlertCircle size={14} />
                            <span className="font-bold">Retraso detectado:</span> {Math.max(0, totalPlanned - unit.hoursRealized)} horas pendientes.
                        </div>
                        )}
                    </div>
                    )})}
                    {course.units.length === 0 && (
                        <div className="p-8 text-center text-gray-400 italic">No hay unidades configuradas.</div>
                    )}
                </div>
                </div>
            ))}
        </div>
      )}

      {/* --- TAB: LEARNING RESULTS (RA) VIEW --- */}
      {activeTab === 'ras' && (
          <div className="space-y-8">
              {courses.map(course => (
                  <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="bg-white p-4 border-b border-gray-200 flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <GraduationCap size={20} />
                           </div>
                           <div>
                                <h3 className="font-bold text-gray-800">{course.name}</h3>
                                <p className="text-xs text-gray-500">Seguimiento de {course.learningResults?.length || 0} Resultados de Aprendizaje</p>
                           </div>
                      </div>

                      <div className="divide-y divide-gray-100 bg-gray-50/50">
                          {(!course.learningResults || course.learningResults.length === 0) ? (
                              <div className="p-8 text-center text-gray-400">
                                  No se han definido RAs para este módulo. Ve a Configuración para añadirlos.
                              </div>
                          ) : (
                              course.learningResults.map(ra => {
                                  const stats = getRaStats(ra, course.units);
                                  const isComplete = stats.percent >= 100;

                                  return (
                                      <div key={ra.id} className="p-5 hover:bg-white transition-colors">
                                          <div className="flex flex-col md:flex-row gap-6">
                                              
                                              {/* RA Info */}
                                              <div className="flex-1">
                                                  <div className="flex items-center gap-2 mb-2">
                                                      <span className={`text-sm font-black px-2 py-0.5 rounded ${isComplete ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                          {ra.codigo}
                                                      </span>
                                                      <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                                          Peso: {ra.ponderacion}%
                                                      </span>
                                                  </div>
                                                  <p className="font-bold text-gray-800 mb-1">{ra.descripcion}</p>
                                                  
                                                  {/* Linked Criteria Count */}
                                                  <div className="mt-3 flex flex-wrap gap-2">
                                                      {ra.criterios.map(crit => (
                                                          <span key={crit.id} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200" title={crit.descripcion}>
                                                              CE {crit.codigo}
                                                          </span>
                                                      ))}
                                                  </div>
                                              </div>

                                              {/* Progress Stats */}
                                              <div className="w-full md:w-1/3 flex flex-col justify-center">
                                                  <div className="flex justify-between items-end mb-1">
                                                      <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                                          <Clock size={12}/> Progreso Imputado
                                                      </span>
                                                      <div className="text-right">
                                                          <span className={`text-2xl font-black ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
                                                              {Math.round(stats.percent)}%
                                                          </span>
                                                      </div>
                                                  </div>
                                                  
                                                  {/* Progress Bar */}
                                                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                                                      <div 
                                                          className={`h-full rounded-full transition-all duration-1000 ${isComplete ? 'bg-green-500' : 'bg-blue-600'}`}
                                                          style={{ width: `${Math.min(100, stats.percent)}%` }}
                                                      ></div>
                                                  </div>

                                                  {/* Explanation / Breakdown */}
                                                  <div className="bg-white border border-gray-100 rounded p-2 text-[10px] text-gray-500 space-y-1 shadow-sm">
                                                      <div className="flex items-center gap-1 font-bold text-gray-700 mb-1">
                                                          <LinkIcon size={10} />
                                                          Unidades Vinculadas:
                                                      </div>
                                                      {stats.linkedUnitsDetails.length > 0 ? (
                                                          <div className="flex flex-wrap gap-1">
                                                              {stats.linkedUnitsDetails.map(u => (
                                                                  <div 
                                                                    key={u.id} 
                                                                    className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 flex items-center gap-1"
                                                                    title={`Progreso de ${u.title}: ${Math.round(u.percent)}%`}
                                                                  >
                                                                      <span>{u.title}</span>
                                                                      <div className={`w-1.5 h-1.5 rounded-full ${u.percent >= 100 ? 'bg-green-500' : u.percent > 0 ? 'bg-blue-400' : 'bg-gray-300'}`}></div>
                                                                  </div>
                                                              ))}
                                                          </div>
                                                      ) : (
                                                          <span className="italic text-red-400">Sin vinculación a UDs</span>
                                                      )}
                                                      <div className="mt-1 pt-1 border-t border-gray-100 flex justify-between">
                                                           <span>H. Totales: {stats.totalPlanned}h</span>
                                                           <span className="font-bold text-gray-800">Impartidas: {stats.totalRealized}h</span>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  );
                              })
                          )}
                      </div>
                  </div>
              ))}
          </div>
      )}

    </div>
  );
};

export default UnitsTracker;