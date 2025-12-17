import React, { useState } from 'react';
import { Course, ClassLog, SchoolInfo, TeacherInfo } from '../types';
import { FileText, Printer, Filter, BookOpen, ChefHat, UserCircle, School } from 'lucide-react';

interface ReportsCenterProps {
  courses: Course[];
  logs: ClassLog[];
  schoolInfo: SchoolInfo;
  teacherInfo: TeacherInfo;
}

const ReportsCenter: React.FC<ReportsCenterProps> = ({ courses, logs, schoolInfo, teacherInfo }) => {
  const [selectedReportType, setSelectedReportType] = useState<'global' | 'module' | 'date'>('global');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(courses[0]?.id || '');

  const currentModule = courses.find(c => c.id === selectedModuleId);

  // --- Logic for Reports ---
  
  const generateGlobalStats = () => {
    const totalUnits = courses.reduce((acc, c) => acc + c.units.length, 0);
    const completedUnits = courses.reduce((acc, c) => acc + c.units.filter(u => u.status === 'Completado').length, 0);
    const delayedUnits = courses.reduce((acc, c) => acc + c.units.filter(u => u.status === 'Retrasado').length, 0);
    const totalHoursPlanned = courses.reduce((acc, c) => acc + c.annualHours, 0);
    const totalHoursLogged = logs.reduce((acc, log) => acc + log.hours, 0);

    return { totalUnits, completedUnits, delayedUnits, totalHoursPlanned, totalHoursLogged };
  };

  const generateModuleStats = (course: Course) => {
    const completedUnits = course.units.filter(u => u.status === 'Completado').length;
    const hoursLogged = logs.filter(l => l.courseId === course.id).reduce((acc, l) => acc + l.hours, 0);
    const logsCount = logs.filter(l => l.courseId === course.id).length;
    
    return { completedUnits, hoursLogged, logsCount };
  };

  // --- Logic for Date Grouping ---
  const getLogsByDate = () => {
    // 1. Sort logs chronologically
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 2. Group by Year -> Month
    const grouped: Record<string, Record<string, ClassLog[]>> = {};

    sortedLogs.forEach(log => {
      const date = new Date(log.date);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('es-ES', { month: 'long' });
      const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);

      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][monthCapitalized]) grouped[year][monthCapitalized] = [];
      
      grouped[year][monthCapitalized].push(log);
    });

    return grouped;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col animate-fade-in gap-6">
      {/* CSS For Print Only - Fixes blank page issues */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #report-container, #report-container * {
            visibility: visible;
          }
          #report-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white;
            z-index: 9999;
            box-shadow: none;
            border: none;
          }
          /* Hide non-print elements explicitly */
          header, aside, .no-print {
            display: none !important;
          }
        }
      `}</style>

      <header className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={24} className="text-chef-600"/> Centro de Documentación
          </h2>
          <p className="text-gray-500">Genera informes oficiales de seguimiento académico.</p>
        </div>
        <button 
            onClick={handlePrint}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition shadow-md"
        >
            <Printer size={18} /> Imprimir Informe
        </button>
      </header>

      {/* Controls (Hidden when printing) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center no-print">
         <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Filter size={16} /> Tipo de Informe:
         </div>
         <div className="flex gap-2">
            <button 
                onClick={() => setSelectedReportType('global')}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${selectedReportType === 'global' ? 'bg-chef-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
                Resumen Global
            </button>
            <button 
                onClick={() => setSelectedReportType('module')}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${selectedReportType === 'module' ? 'bg-chef-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
                Por Módulo
            </button>
            <button 
                onClick={() => setSelectedReportType('date')}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${selectedReportType === 'date' ? 'bg-chef-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
                Por Fechas (Cronológico)
            </button>
         </div>

         {selectedReportType === 'module' && (
             <select 
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-chef-500"
             >
                 {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
         )}
      </div>

      {/* Report Preview (This is what gets printed) */}
      <div id="report-container" className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 min-h-[800px] max-w-5xl mx-auto">
         
         {/* Report Header: Redesigned as requested */}
         <div className="flex justify-between items-center border-b-2 border-gray-800 pb-6 mb-8">
            
            {/* LEFT: School Info */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
                    {schoolInfo.logoUrl ? (
                         <img src={schoolInfo.logoUrl} alt="Logo Centro" className="w-full h-full object-contain" />
                    ) : (
                         <School size={48} className="text-gray-300"/>
                    )}
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{schoolInfo.name}</h1>
                    <p className="text-sm font-semibold text-gray-600">{schoolInfo.department}</p>
                    <p className="text-xs text-gray-500 mt-1">Curso Académico: <span className="font-bold text-gray-800">{schoolInfo.academicYear}</span></p>
                </div>
            </div>

            {/* RIGHT: Teacher Info */}
            <div className="flex items-center gap-4 text-right">
                <div>
                    <p className="text-lg font-bold text-gray-800">{teacherInfo.name}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{teacherInfo.role}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Informe: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                    {teacherInfo.avatarUrl ? (
                        <img src={teacherInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <UserCircle size={32} className="text-gray-300"/>
                    )}
                </div>
            </div>
         </div>

         {/* Report Content */}
         {selectedReportType === 'global' && (
             <div className="space-y-8">
                 <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 uppercase tracking-wider bg-gray-50 py-2 border-y border-gray-200">
                    Resumen Ejecutivo de Programación
                 </h2>
                 
                 <div className="grid grid-cols-3 gap-6">
                    {(() => {
                        const stats = generateGlobalStats();
                        return (
                            <>
                                <div className="p-6 bg-white rounded-lg border-2 border-gray-100 text-center shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Módulos Activos</p>
                                    <p className="text-4xl font-black text-gray-800">{courses.length}</p>
                                </div>
                                <div className="p-6 bg-white rounded-lg border-2 border-gray-100 text-center shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Progreso Unidades</p>
                                    <p className="text-4xl font-black text-green-600">{stats.completedUnits} <span className="text-lg text-gray-400 font-normal">/ {stats.totalUnits}</span></p>
                                </div>
                                <div className="p-6 bg-white rounded-lg border-2 border-gray-100 text-center shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Horas Impartidas</p>
                                    <p className="text-4xl font-black text-blue-600">{stats.totalHoursLogged} h</p>
                                </div>
                            </>
                        );
                    })()}
                 </div>

                 <div className="mt-8">
                     <h3 className="font-bold text-gray-700 mb-4 border-l-4 border-chef-600 pl-3">Detalle por Módulo</h3>
                     <table className="w-full text-sm text-left border-collapse">
                         <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                             <tr>
                                 <th className="p-3 border-b border-gray-300">Módulo</th>
                                 <th className="p-3 border-b border-gray-300">Ciclo/Curso</th>
                                 <th className="p-3 border-b border-gray-300 text-center">Unidades</th>
                                 <th className="p-3 border-b border-gray-300 w-1/3">Progreso</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-200">
                             {courses.map(c => {
                                 const completed = c.units.filter(u => u.status === 'Completado').length;
                                 const total = c.units.length;
                                 const percent = Math.round((completed / total) * 100);
                                 return (
                                     <tr key={c.id} className="break-inside-avoid">
                                         <td className="p-3 font-bold text-gray-800">{c.name}</td>
                                         <td className="p-3 text-gray-500">{c.cycle} ({c.grade})</td>
                                         <td className="p-3 text-center font-mono">{completed}/{total} UD</td>
                                         <td className="p-3 align-middle">
                                            <div className="flex items-center gap-3">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-chef-600 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-600 w-10 text-right">{percent}%</span>
                                            </div>
                                         </td>
                                     </tr>
                                 )
                             })}
                         </tbody>
                     </table>
                 </div>
             </div>
         )}
         
         {selectedReportType === 'module' && (
           currentModule ? (
             <div className="space-y-8">
                 <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800">{currentModule.name}</h2>
                        <p className="text-gray-600 font-medium mt-1">{currentModule.cycle} • {currentModule.grade}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-bold">Estado General</p>
                        <span className="text-xl font-bold text-chef-700">
                            {generateModuleStats(currentModule).completedUnits} / {currentModule.units.length} UD Completadas
                        </span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-8">
                    <div className="col-span-1">
                        <h3 className="font-bold text-gray-700 mb-4 border-l-4 border-chef-600 pl-3">Desglose de Unidades: Teoría vs Práctica</h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="p-3 text-left w-1/3">Unidad Didáctica</th>
                                        <th className="p-3 text-center bg-blue-50 text-blue-800">H. Teóricas (Real/Plan)</th>
                                        <th className="p-3 text-center bg-orange-50 text-orange-800">H. Prácticas (Real/Plan)</th>
                                        <th className="p-3 text-center">Total (Real/Plan)</th>
                                        <th className="p-3 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentModule.units.map(u => {
                                        // Calculate Realized Hours from Logs for this specific unit
                                        const unitLogs = logs.filter(l => l.unitId === u.id);
                                        const realTheory = unitLogs.filter(l => l.type === 'Teórica').reduce((acc, l) => acc + l.hours, 0);
                                        const realPractice = unitLogs.filter(l => l.type === 'Práctica').reduce((acc, l) => acc + l.hours, 0);
                                        const realTotal = realTheory + realPractice;
                                        const planTotal = u.hoursPlannedTheory + u.hoursPlannedPractice;

                                        return (
                                            <tr key={u.id} className="break-inside-avoid hover:bg-gray-50">
                                                <td className="p-3">
                                                    <p className="font-bold text-gray-800">{u.title}</p>
                                                </td>
                                                {/* Theory Column */}
                                                <td className="p-3 text-center border-l border-r border-blue-100 bg-blue-50/30">
                                                    <div className="flex flex-col items-center">
                                                        <span className={`font-bold ${realTheory > u.hoursPlannedTheory ? 'text-red-500' : 'text-blue-700'}`}>
                                                            {realTheory}
                                                        </span>
                                                        <span className="text-xs text-gray-400 border-t border-gray-200 w-8 pt-0.5 mt-0.5">
                                                            {u.hoursPlannedTheory}
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* Practice Column */}
                                                <td className="p-3 text-center border-r border-orange-100 bg-orange-50/30">
                                                    <div className="flex flex-col items-center">
                                                        <span className={`font-bold ${realPractice > u.hoursPlannedPractice ? 'text-red-500' : 'text-orange-700'}`}>
                                                            {realPractice}
                                                        </span>
                                                        <span className="text-xs text-gray-400 border-t border-gray-200 w-8 pt-0.5 mt-0.5">
                                                            {u.hoursPlannedPractice}
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* Totals */}
                                                <td className="p-3 text-center font-mono font-bold text-gray-700">
                                                    {realTotal} / {planTotal}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                                        u.status === 'Completado' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        u.status === 'Retrasado' ? 'bg-red-50 text-red-700 border-red-200' : 
                                                        'bg-gray-50 text-gray-600 border-gray-200'
                                                    }`}>
                                                        {u.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-2 flex gap-4 text-xs text-gray-500 justify-end">
                            <div className="flex items-center gap-1"><BookOpen size={12} className="text-blue-600"/> Teoría</div>
                            <div className="flex items-center gap-1"><ChefHat size={12} className="text-orange-600"/> Práctica</div>
                        </div>
                    </div>
                 </div>
                 
                 {/* Signatures Area for Official Reports - SINGLE SIGNATURE ONLY */}
                 <div className="mt-16 pt-8 border-t border-gray-300 flex justify-center break-inside-avoid">
                     <div className="text-center w-64">
                         <div className="h-24 border-b border-gray-400 mb-2"></div>
                         <p className="text-xs font-bold uppercase text-gray-600">Fdo. El Profesor/a</p>
                     </div>
                 </div>
             </div>
           ) : (
             <p className="text-center text-gray-400 py-10">Selecciona un módulo arriba para ver su informe detallado.</p>
           )
         )}

         {/* REPORT TYPE: DATE (CHRONOLOGICAL) */}
         {selectedReportType === 'date' && (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 uppercase tracking-wider bg-gray-50 py-2 border-y border-gray-200">
                    Diario de Actividades Docentes
                </h2>
                
                {logs.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <p>No hay registros en el diario de clase todavía.</p>
                    </div>
                ) : (
                    (() => {
                        const groupedLogs = getLogsByDate();
                        return Object.entries(groupedLogs).map(([year, months]) => (
                            <div key={year} className="mb-8">
                                <h3 className="text-3xl font-black text-gray-200 mb-4 border-b-2 border-gray-100 text-right pr-4">{year}</h3>
                                {Object.entries(months).map(([month, monthLogs]) => (
                                    <div key={`${year}-${month}`} className="mb-8 break-inside-avoid">
                                        <div className="flex items-center gap-4 mb-4">
                                             <div className="h-px bg-gray-300 flex-1"></div>
                                             <h4 className="text-lg font-bold text-chef-800 uppercase tracking-widest">{month}</h4>
                                             <div className="h-px bg-gray-300 flex-1"></div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {monthLogs.map(log => {
                                                const course = courses.find(c => c.id === log.courseId);
                                                const day = new Date(log.date).getDate();
                                                const weekday = new Date(log.date).toLocaleDateString('es-ES', { weekday: 'long' });
                                                
                                                return (
                                                    <div key={log.id} className="bg-white p-0 rounded-none border-b border-gray-200 pb-4 mb-2 break-inside-avoid">
                                                        <div className="flex flex-row gap-6">
                                                            {/* Date Column */}
                                                            <div className="w-16 text-center pt-1">
                                                                <span className="text-3xl font-bold text-gray-800 leading-none block">{day}</span>
                                                                <span className="text-[10px] text-gray-500 uppercase font-bold block mt-1">{weekday.substring(0,3)}</span>
                                                            </div>

                                                            {/* Content */}
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-baseline mb-1">
                                                                    <h5 className="font-bold text-gray-900 text-lg">{course?.name}</h5>
                                                                    <span className={`text-xs font-bold px-2 py-1 rounded border ${log.type === 'Práctica' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                                                                        {log.type} • {log.hours}h
                                                                    </span>
                                                                </div>
                                                                
                                                                {/* Notes Section */}
                                                                <div className="text-sm text-gray-700 leading-relaxed pl-3 border-l-2 border-gray-300">
                                                                    {log.notes ? (
                                                                        <p>{log.notes}</p>
                                                                    ) : (
                                                                        <p className="text-gray-400 italic">Sin observaciones.</p>
                                                                    )}
                                                                </div>

                                                                {log.status !== 'Impartida' && (
                                                                    <div className="mt-2 text-xs text-red-600 font-bold bg-red-50 inline-block px-2 py-1 rounded">
                                                                        Incidencia: {log.status}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ));
                    })()
                )}
             </div>
         )}

         {/* Report Footer (Print only) */}
         <div className="mt-auto pt-8 border-t border-gray-200">
            <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-widest">
                <p>GastroAcademia - Sistema de Gestión</p>
                <p>Página generada el {new Date().toLocaleDateString()}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ReportsCenter;