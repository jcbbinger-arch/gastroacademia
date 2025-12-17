
import React, { useState } from 'react';
import { Course, ClassLog, SchoolInfo, TeacherInfo, Exam } from '../types';
import { FileText, Printer, Filter, BookOpen, ChefHat, UserCircle, School, GraduationCap, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface ReportsCenterProps {
  courses: Course[];
  logs: ClassLog[];
  exams: Exam[];
  schoolInfo: SchoolInfo;
  teacherInfo: TeacherInfo;
}

const ReportsCenter: React.FC<ReportsCenterProps> = ({ courses, logs, exams, schoolInfo, teacherInfo }) => {
  const [selectedReportType, setSelectedReportType] = useState<'global' | 'module' | 'date'>('global');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(courses[0]?.id || '');

  const currentModule = courses.find(c => c.id === selectedModuleId);

  // --- Logic for Reports ---
  
  const generateGlobalStats = () => {
    const totalUnits = courses.reduce((acc, c) => acc + c.units.length, 0);
    const completedUnits = courses.reduce((acc, c) => acc + c.units.filter(u => u.status === 'Completado').length, 0);
    const delayedUnits = courses.reduce((acc, c) => acc + c.units.filter(u => u.status === 'Retrasado').length, 0);
    const totalHoursPlanned = courses.reduce((acc, c) => acc + c.annualHours, 0);
    
    const logsHours = logs.reduce((acc, log) => acc + log.hours, 0);
    const examsHours = exams.reduce((acc, ex) => acc + (ex.duration || 1), 0);
    const totalHoursLogged = logsHours + examsHours;

    return { totalUnits, completedUnits, delayedUnits, totalHoursPlanned, totalHoursLogged };
  };

  const generateModuleStats = (course: Course) => {
    const completedUnits = course.units.filter(u => u.status === 'Completado').length;
    const modLogsHours = logs.filter(l => l.courseId === course.id).reduce((acc, l) => acc + l.hours, 0);
    const modExamsHours = exams.filter(e => e.courseId === course.id).reduce((acc, e) => acc + (e.duration || 1), 0);
    const hoursLogged = modLogsHours + modExamsHours;
    const logsCount = logs.filter(l => l.courseId === course.id).length;
    
    return { completedUnits, hoursLogged, logsCount };
  };

  const getLogsByDate = () => {
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-container, #report-container * { visibility: visible; }
          #report-container {
            position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px;
            background: white; z-index: 9999; box-shadow: none; border: none;
          }
          header, aside, .no-print { display: none !important; }
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

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center no-print">
         <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Filter size={16} /> Tipo de Informe:
         </div>
         <div className="flex gap-2">
            <button onClick={() => setSelectedReportType('global')} className={`px-3 py-1.5 rounded-lg text-sm transition ${selectedReportType === 'global' ? 'bg-chef-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Resumen Global</button>
            <button onClick={() => setSelectedReportType('module')} className={`px-3 py-1.5 rounded-lg text-sm transition ${selectedReportType === 'module' ? 'bg-chef-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Por Módulo</button>
            <button onClick={() => setSelectedReportType('date')} className={`px-3 py-1.5 rounded-lg text-sm transition ${selectedReportType === 'date' ? 'bg-chef-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Cronológico</button>
         </div>
         {selectedReportType === 'module' && (
             <select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-chef-500">
                 {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
         )}
      </div>

      <div id="report-container" className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 min-h-[800px] max-w-5xl mx-auto">
         <div className="flex justify-between items-center border-b-2 border-gray-800 pb-6 mb-8">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
                    {schoolInfo.logoUrl ? <img src={schoolInfo.logoUrl} alt="Logo Centro" className="w-full h-full object-contain" /> : <School size={48} className="text-gray-300"/>}
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{schoolInfo.name}</h1>
                    <p className="text-sm font-semibold text-gray-600">{schoolInfo.department}</p>
                    <p className="text-xs text-gray-500 mt-1">Curso Académico: <span className="font-bold text-gray-800">{schoolInfo.academicYear}</span></p>
                </div>
            </div>
            <div className="flex items-center gap-4 text-right">
                <div>
                    <p className="text-lg font-bold text-gray-800">{teacherInfo.name}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{teacherInfo.role}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Informe: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                    {teacherInfo.avatarUrl ? <img src={teacherInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <UserCircle size={32} className="text-gray-300"/>}
                </div>
            </div>
         </div>

         {selectedReportType === 'global' && (
             <div className="space-y-8">
                 <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 uppercase tracking-wider bg-gray-50 py-2 border-y border-gray-200">Resumen Ejecutivo de Programación</h2>
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
                                                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-chef-600 h-2 rounded-full" style={{ width: `${percent}%` }}></div></div>
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
                        <span className="text-xl font-bold text-chef-700">{generateModuleStats(currentModule).completedUnits} / {currentModule.units.length} UD Completadas</span>
                        <p className="text-xs text-gray-400 mt-1">{generateModuleStats(currentModule).hoursLogged} horas registradas</p>
                    </div>
                 </div>

                 <div className="mb-8">
                    <h3 className="font-bold text-gray-700 mb-4 border-l-4 border-purple-600 pl-3">Registro de Pruebas y Exámenes</h3>
                    {exams.filter(e => e.courseId === currentModule.id).length === 0 ? <p className="text-gray-400 italic text-sm">No hay exámenes registrados.</p> : (
                        <table className="w-full text-sm border-collapse border border-gray-200">
                            <thead className="bg-purple-50 text-purple-900 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-2 border border-gray-200 text-left">Fecha</th>
                                    <th className="p-2 border border-gray-200 text-center">Tipo</th>
                                    <th className="p-2 border border-gray-200 text-center">Duración</th>
                                    <th className="p-2 border border-gray-200 text-left">Temario / Descripción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.filter(e => e.courseId === currentModule.id).map(ex => (
                                    <tr key={ex.id} className="hover:bg-purple-50/20">
                                        <td className="p-2 border border-gray-200 font-mono">{new Date(ex.date).toLocaleDateString()}</td>
                                        <td className="p-2 border border-gray-200 text-center font-bold">{ex.type}</td>
                                        <td className="p-2 border border-gray-200 text-center font-bold text-purple-700">{ex.duration || 1} h</td>
                                        <td className="p-2 border border-gray-200 text-gray-700">{ex.topics}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                 </div>

                 <div>
                    <h3 className="font-bold text-gray-700 mb-4 border-l-4 border-chef-600 pl-3">Desglose de Unidades: Realizado vs Planificado</h3>
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold">
                                <tr>
                                    <th className="p-4 text-left border-b border-gray-200">Unidad Didáctica</th>
                                    <th className="p-4 text-center border-b border-gray-200 w-48">H. Teóricas</th>
                                    <th className="p-4 text-center border-b border-gray-200 w-48">H. Prácticas</th>
                                    <th className="p-4 text-center border-b border-gray-200 w-32">Total Unidad</th>
                                    <th className="p-4 text-center border-b border-gray-200 w-32">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentModule.units.map(u => {
                                    const unitLogs = logs.filter(l => l.unitId === u.id);
                                    const realT = unitLogs.filter(l => l.type === 'Teórica').reduce((acc, l) => acc + l.hours, 0);
                                    const realP = unitLogs.filter(l => l.type === 'Práctica').reduce((acc, l) => acc + l.hours, 0);
                                    const realTotal = realT + realP;
                                    const planTotal = u.hoursPlannedTheory + u.hoursPlannedPractice;
                                    
                                    const percT = Math.min(100, (realT / Math.max(1, u.hoursPlannedTheory)) * 100);
                                    const percP = Math.min(100, (realP / Math.max(1, u.hoursPlannedPractice)) * 100);
                                    const percTotal = Math.round((realTotal / Math.max(1, planTotal)) * 100);

                                    return (
                                        <tr key={u.id} className="break-inside-avoid hover:bg-gray-50/50">
                                            <td className="p-4">
                                                <p className="font-bold text-gray-800 text-xs">{u.title}</p>
                                                <p className="text-[10px] text-gray-400 italic line-clamp-1">{u.description}</p>
                                            </td>
                                            
                                            {/* Teoría Visualización */}
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex justify-between items-baseline text-[11px] font-bold">
                                                        <span className={realT > u.hoursPlannedTheory ? 'text-red-600' : 'text-blue-700'}>{realT}h</span>
                                                        <span className="text-gray-300 font-medium">/ {u.hoursPlannedTheory}h</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-blue-50 rounded-full overflow-hidden border border-blue-100/50">
                                                        <div className={`h-full transition-all ${realT > u.hoursPlannedTheory ? 'bg-red-400' : 'bg-blue-500'}`} style={{ width: `${percT}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Práctica Visualización */}
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex justify-between items-baseline text-[11px] font-bold">
                                                        <span className={realP > u.hoursPlannedPractice ? 'text-red-600' : 'text-orange-700'}>{realP}h</span>
                                                        <span className="text-gray-300 font-medium">/ {u.hoursPlannedPractice}h</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-orange-50 rounded-full overflow-hidden border border-orange-100/50">
                                                        <div className={`h-full transition-all ${realP > u.hoursPlannedPractice ? 'bg-red-400' : 'bg-orange-500'}`} style={{ width: `${percP}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="text-sm font-black text-gray-800">{percTotal}%</span>
                                                    <span className="text-[10px] text-gray-400 font-bold">{realTotal}/{planTotal}h</span>
                                                </div>
                                            </td>

                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${
                                                    u.status === 'Completado' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    u.status === 'Retrasado' ? 'bg-red-50 text-red-700 border-red-200' : 
                                                    'bg-gray-50 text-gray-500 border-gray-200'
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
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between no-print">
                         <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                             <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Teoría</div>
                             <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-orange-500 rounded-full"></div> Práctica</div>
                             <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-400 rounded-full"></div> Desviación (+ horas)</div>
                         </div>
                         <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                             <CheckCircle2 size={14} className="text-green-600" /> Datos sincronizados con el Diario de Clase
                         </div>
                    </div>
                 </div>
                 
                 <div className="mt-20 pt-8 border-t border-gray-300 flex justify-center break-inside-avoid">
                     <div className="text-center w-64">
                         <div className="h-24 border-b border-gray-400 mb-2"></div>
                         <p className="text-xs font-bold uppercase text-gray-600">Fdo. El Profesor/a Responsable</p>
                     </div>
                 </div>
             </div>
           ) : <p className="text-center text-gray-400 py-10">Selecciona un módulo para visualizar.</p>
         )}

         {selectedReportType === 'date' && (
             <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 uppercase tracking-wider bg-gray-50 py-2 border-y border-gray-200">Diario de Actividades Docentes</h2>
                {logs.length === 0 ? <p className="text-center py-10 text-gray-400">Sin registros.</p> : (
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
                                                    <div key={log.id} className="bg-white border-b border-gray-200 pb-4 mb-2 break-inside-avoid">
                                                        <div className="flex gap-6">
                                                            <div className="w-16 text-center pt-1">
                                                                <span className="text-3xl font-black text-gray-800 leading-none block">{day}</span>
                                                                <span className="text-[10px] text-gray-500 uppercase font-bold block mt-1">{weekday.substring(0,3)}</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-baseline mb-1">
                                                                    <h5 className="font-bold text-gray-900 text-lg">{course?.name}</h5>
                                                                    <span className={`text-[10px] font-black px-2 py-1 rounded border ${log.type === 'Práctica' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>{log.type} • {log.hours}h</span>
                                                                </div>
                                                                <div className="text-sm text-gray-700 leading-relaxed pl-3 border-l-2 border-gray-300">
                                                                    {log.notes || <span className="text-gray-400 italic">Sin observaciones.</span>}
                                                                </div>
                                                                {log.status !== 'Impartida' && <div className="mt-2 text-[10px] text-red-600 font-bold bg-red-50 inline-block px-2 py-1 rounded">INCIDENCIA: {log.status}</div>}
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

         <div className="mt-auto pt-8 border-t border-gray-200">
            <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-widest">
                <p>GastroAcademia Intelligence - Gestión Curricular</p>
                <p>Generado el {new Date().toLocaleDateString()}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ReportsCenter;
