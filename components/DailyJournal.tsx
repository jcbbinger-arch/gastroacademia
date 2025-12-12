import React, { useState, useMemo, useEffect } from 'react';
import { Course, ClassLog, SessionType, AttendanceStatus, ScheduleSlot } from '../types';
import { Calendar, Save, Clock, BookOpen, AlertCircle, ChefHat, FileText, XCircle, Zap, MousePointerClick } from 'lucide-react';

interface DailyJournalProps {
  courses: Course[];
  schedule: ScheduleSlot[]; 
  logs: ClassLog[];
  setLogs: (logs: ClassLog[]) => void;
  date: string;
  setDate: (date: string) => void;
}

const DailyJournal: React.FC<DailyJournalProps> = ({ courses, schedule, logs, setLogs, date: selectedDate, setDate: setSelectedDate }) => {
  // selectedDate is now a prop alias
  
  // Form States
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [status, setStatus] = useState<AttendanceStatus>('Impartida');
  const [notes, setNotes] = useState<string>('');

  // --- Granular Hour Distribution State ---
  const [totalDuration, setTotalDuration] = useState<number>(1);
  const [paintMode, setPaintMode] = useState<SessionType>('Práctica'); // Default to Practice for easier clicking
  const [hourDistribution, setHourDistribution] = useState<SessionType[]>(['Teórica']); 

  const currentCourse = courses.find(c => c.id === selectedCourse);
  
  // Filter logs for selected date
  const logsForDate = logs.filter(log => log.date === selectedDate);

  // --- LOGIC: Get Schedule for Selected Date ---
  const dailySchedule = useMemo(() => {
    const dateObj = new Date(selectedDate);
    let dayOfWeek = dateObj.getDay(); // 0 (Sun) - 6 (Sat)
    if (dayOfWeek === 0) dayOfWeek = 7; 
    return schedule.filter(slot => slot.dayOfWeek === dayOfWeek);
  }, [selectedDate, schedule]);

  // Reset/Preset form when date changes or when schedule implies a default
  useEffect(() => {
    // Optional: Auto-select the first course of the day if nothing is selected?
    // Let's keep it manual for now to avoid confusion, but we could do it.
  }, [selectedDate]);

  // Update distribution array size when total duration changes manually
  useEffect(() => {
    setHourDistribution(prev => {
        // If the length matches, do nothing to preserve current selection
        if (prev.length === totalDuration) return prev;

        const newDist = [...prev];
        if (totalDuration > prev.length) {
            // Add new hours defaults to Teórica (safest default)
            for(let i = prev.length; i < totalDuration; i++) {
                newDist.push('Teórica'); 
            }
        } else {
            // Trim
            return newDist.slice(0, totalDuration);
        }
        return newDist;
    });
  }, [totalDuration]);

  // --- HANDLERS ---

  // Helper to set up a course selection
  const selectCourseAndCalcHours = (courseId: string, forceDuration?: number) => {
    setSelectedCourse(courseId);
    setSelectedUnit('');
    
    let duration = 1;

    if (forceDuration) {
        duration = forceDuration;
    } else {
        // Smart Calculate: Sum all hours for this course on this day
        const courseSlots = dailySchedule.filter(s => s.courseId === courseId);
        const totalScheduled = courseSlots.reduce((acc, slot) => acc + slot.defaultHours, 0);
        duration = totalScheduled > 0 ? totalScheduled : 1;
    }

    setTotalDuration(duration);
    // Reset distribution to all Teórica so user can paint Practice
    setHourDistribution(Array(duration).fill('Teórica'));
    // Set default paint mode to Practice as it's the most common action to take
    setPaintMode('Práctica');
  };

  const handleQuickSelect = (slot: ScheduleSlot) => {
    selectCourseAndCalcHours(slot.courseId); 
  };

  const handleManualCourseSelect = (courseId: string) => {
    selectCourseAndCalcHours(courseId);
  };

  const toggleHourType = (index: number) => {
    const newDist = [...hourDistribution];
    // Apply the current paintMode to the clicked hour
    newDist[index] = paintMode;
    setHourDistribution(newDist);
  };

  const handleSave = () => {
    if (!selectedCourse || !selectedUnit) return;

    // Calculate totals
    const theoreticalHours = hourDistribution.filter(t => t === 'Teórica').length;
    const practicalHours = hourDistribution.filter(t => t === 'Práctica').length;

    const newLogs: ClassLog[] = [];

    if (theoreticalHours > 0) {
        newLogs.push({
            id: Date.now().toString() + '-T',
            date: selectedDate,
            courseId: selectedCourse,
            unitId: selectedUnit,
            hours: theoreticalHours,
            type: 'Teórica',
            status,
            notes: practicalHours > 0 ? `(Parte Teórica) ${notes}` : notes
        });
    }

    if (practicalHours > 0) {
        newLogs.push({
            id: Date.now().toString() + '-P',
            date: selectedDate,
            courseId: selectedCourse,
            unitId: selectedUnit,
            hours: practicalHours,
            type: 'Práctica',
            status,
            notes: theoreticalHours > 0 ? `(Parte Práctica) ${notes}` : notes
        });
    }

    setLogs([...logs, ...newLogs]);
    
    // Reset form
    setNotes('');
    setTotalDuration(1);
    setSelectedUnit('');
    setHourDistribution(['Teórica']);
  };

  const handleDelete = (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  const getStatusColor = (s: AttendanceStatus) => {
    switch(s) {
      case 'Impartida': return 'bg-green-100 text-green-800 border-green-200';
      case 'Falta Profesor': return 'bg-red-100 text-red-800 border-red-200';
      case 'Falta Alumnos': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in h-full">
      {/* Left Panel: Date Picker & Daily Summary */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona Fecha</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chef-500 outline-none"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 min-h-[400px]">
          <div className="bg-chef-600 p-4 text-white">
            <h3 className="font-bold flex items-center gap-2">
              <Calendar size={18} />
              Registro del Día
            </h3>
            <p className="text-chef-100 text-sm">
              {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          
          <div className="p-4 space-y-3">
            {logsForDate.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <FileText size={48} className="mx-auto mb-2 opacity-20" />
                <p>No hay registros para este día</p>
              </div>
            ) : (
              logsForDate.map(log => {
                const logCourse = courses.find(c => c.id === log.courseId);
                const logUnit = logCourse?.units.find(u => u.id === log.unitId);
                return (
                  <div key={log.id} className={`p-3 rounded-lg border text-sm relative group ${getStatusColor(log.status)}`}>
                     <button 
                        onClick={() => handleDelete(log.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                        <XCircle size={16} />
                     </button>
                    <div className="font-bold mb-1">{logCourse?.name}</div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className={`px-2 py-0.5 rounded text-xs border border-black/5 font-medium flex items-center gap-1 ${log.type === 'Práctica' ? 'bg-orange-200/50 text-orange-800' : 'bg-blue-200/50 text-blue-800'}`}>
                         {log.type === 'Práctica' ? <ChefHat size={12}/> : <BookOpen size={12}/>}
                         {log.hours}h {log.type}
                       </span>
                       <span className="truncate flex-1 font-medium">{logUnit?.title.split(':')[0]}</span>
                    </div>
                    {log.status !== 'Impartida' && (
                        <div className="flex items-center gap-1 text-xs font-bold mb-1">
                            <AlertCircle size={12} /> {log.status} (Desviación)
                        </div>
                    )}
                    <p className="text-xs opacity-80 italic line-clamp-2">"{log.notes}"</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Entry Form */}
      <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <header className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Anotar Clase</h2>
          <p className="text-gray-500 text-sm">Registra la actividad distribuyendo las horas entre Teoría y Práctica.</p>
        </header>

        {/* --- SECTION: SMART SCHEDULE SELECTOR --- */}
        {dailySchedule.length > 0 && (
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
             <div className="flex items-center gap-2 mb-3 text-blue-800 font-semibold text-sm">
                <Zap size={16} className="text-yellow-500 fill-current" />
                <span>Clases programadas para hoy (Según tu Horario):</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
               {dailySchedule.map((slot, idx) => {
                 const courseName = courses.find(c => c.id === slot.courseId)?.name || 'Módulo desconocido';
                 const isActive = selectedCourse === slot.courseId;
                 return (
                   <button
                     key={idx}
                     onClick={() => handleQuickSelect(slot)}
                     className={`text-left p-3 rounded-md border transition-all relative ${
                       isActive 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                     }`}
                   >
                     <div className="text-xs opacity-80 mb-1">{slot.startTime} - {slot.endTime}</div>
                     <div className="font-bold text-sm leading-tight">{courseName}</div>
                     <div className="text-xs mt-1 font-medium">{slot.label} • {slot.defaultHours}h</div>
                   </button>
                 )
               })}
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Module Selection */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Módulo Formativo (Manual)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {courses.map(course => (
                <button
                  key={course.id}
                  onClick={() => handleManualCourseSelect(course.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedCourse === course.id 
                      ? 'border-chef-500 bg-chef-50 ring-1 ring-chef-500' 
                      : 'border-gray-200 hover:border-chef-300'
                  }`}
                >
                  <div className="font-bold text-sm text-gray-900">{course.name}</div>
                  <div className="text-xs text-gray-500">{course.weeklyHours}h / semana</div>
                </button>
              ))}
            </div>
          </div>

          {/* Unit Selection */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Unidad de Trabajo (Asignación)</label>
            <select 
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              disabled={!selectedCourse}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chef-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">-- {selectedCourse ? 'Selecciona Unidad' : 'Primero selecciona un módulo'} --</option>
              {currentCourse?.units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.title} ({unit.hoursRealized}/{unit.hoursPlanned}h)
                </option>
              ))}
            </select>
          </div>

          {/* Granular Distribution Controls */}
          <div className="col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
             <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-bold text-gray-700">Distribución de Horas ({totalDuration} h)</label>
                <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-500">Ajuste manual:</span>
                   <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={totalDuration}
                    onChange={(e) => setTotalDuration(Math.max(1, Math.min(10, Number(e.target.value))))}
                    className="w-16 p-1 text-center border border-gray-300 rounded text-sm font-bold"
                   />
                </div>
             </div>
             
             <div className="flex flex-col md:flex-row gap-4">
                {/* Paint Mode Selector */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                   <span className="text-[10px] uppercase font-bold text-gray-400">1. Pincel</span>
                   <button 
                     onClick={() => setPaintMode('Teórica')}
                     className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${paintMode === 'Teórica' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                   >
                     <BookOpen size={16} /> Teórica
                     {paintMode === 'Teórica' && <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"/>}
                   </button>
                   <button 
                     onClick={() => setPaintMode('Práctica')}
                     className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${paintMode === 'Práctica' ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                   >
                     <ChefHat size={16} /> Práctica
                     {paintMode === 'Práctica' && <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"/>}
                   </button>
                </div>

                {/* Interactive Grid */}
                <div className="flex-1">
                   <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2">2. Asigna (Click para pintar)</span>
                   <div className="flex flex-wrap gap-2">
                      {hourDistribution.map((type, idx) => (
                        <button
                          key={idx}
                          onClick={() => toggleHourType(idx)}
                          title={`Click para marcar como ${paintMode}`}
                          className={`
                             w-12 h-16 rounded-lg flex flex-col items-center justify-center border-2 transition-all relative
                             ${type === 'Teórica' 
                               ? 'bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-300' 
                               : 'bg-orange-50 border-orange-200 text-orange-700 hover:border-orange-300'}
                             ${type !== paintMode ? 'opacity-70 hover:opacity-100 hover:scale-105' : 'scale-100 ring-2 ring-offset-2 ring-chef-200'}
                          `}
                        >
                           <span className="text-xs font-bold mb-1">{idx + 1}ª</span>
                           {type === 'Teórica' ? <BookOpen size={18}/> : <ChefHat size={18}/>}
                           
                           {/* Hint overlay on hover if mode differs */}
                           <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                              <MousePointerClick size={16} className="text-gray-600"/>
                           </div>
                        </button>
                      ))}
                   </div>
                   <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Zap size={12}/> Selecciona un tipo a la izquierda y pinta las horas haciendo click.
                   </p>
                </div>
             </div>
          </div>

          {/* Status / Deviations */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado / Incidencias</label>
            <div className="flex flex-wrap gap-2">
               {(['Impartida', 'Falta Profesor', 'Falta Alumnos', 'Otras Incidencias'] as AttendanceStatus[]).map(s => (
                 <button
                   key={s}
                   onClick={() => setStatus(s)}
                   className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                     status === s
                       ? s === 'Impartida' 
                         ? 'bg-green-600 text-white border-green-600'
                         : 'bg-red-500 text-white border-red-500'
                       : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                   }`}
                 >
                   {s}
                 </button>
               ))}
            </div>
            {status !== 'Impartida' && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} />
                Esta sesión contará como "desviación de programación". Se registra la hora pero no avanza contenido.
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Qué hemos hecho (Observaciones)</label>
            <textarea 
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Explicación de cortes brunoise y juliana. Práctica con cebolla y zanahoria..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chef-500 outline-none resize-none"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={!selectedCourse || !selectedUnit}
            className="bg-chef-600 text-white px-8 py-3 rounded-lg hover:bg-chef-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Save size={20} />
            Guardar en Diario
          </button>
        </div>

      </div>
    </div>
  );
};

export default DailyJournal;