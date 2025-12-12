import React, { useState } from 'react';
import { Course, Unit, UnitStatus } from '../types';
import { Plus, Trash2, Save, Settings, BookOpen, Clock, AlertCircle, PieChart, Check } from 'lucide-react';

interface CourseConfiguratorProps {
  courses: Course[];
  onUpdateCourses: (courses: Course[]) => void;
}

const CourseConfigurator: React.FC<CourseConfiguratorProps> = ({ courses, onUpdateCourses }) => {
  const [activeCourseId, setActiveCourseId] = useState<string>(courses[0]?.id || '');
  const [editingCourse, setEditingCourse] = useState<Course | null>(courses.find(c => c.id === courses[0]?.id) || null);

  // When clicking a course in the list
  const handleSelectCourse = (id: string) => {
    setActiveCourseId(id);
    const found = courses.find(c => c.id === id);
    if (found) {
      setEditingCourse({ ...found }); // Clone to avoid direct mutation
    }
  };

  const handleAddNewCourse = () => {
    const newCourse: Course = {
      id: `new-${Date.now()}`,
      name: 'Nuevo Módulo',
      cycle: 'GM/GS...',
      grade: '1º',
      weeklyHours: 0,
      annualHours: 0,
      units: []
    };
    onUpdateCourses([...courses, newCourse]);
    setActiveCourseId(newCourse.id);
    setEditingCourse(newCourse);
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm('¿Estás seguro de borrar este módulo y todos sus datos?')) {
      const updated = courses.filter(c => c.id !== id);
      onUpdateCourses(updated);
      if (updated.length > 0) {
        handleSelectCourse(updated[0].id);
      } else {
        setEditingCourse(null);
      }
    }
  };

  const handleSaveCourse = () => {
    if (!editingCourse) return;
    const updatedCourses = courses.map(c => c.id === editingCourse.id ? editingCourse : c);
    onUpdateCourses(updatedCourses);
    alert('Módulo guardado correctamente');
  };

  // --- Units Management ---

  const handleAddUnit = () => {
    if (!editingCourse) return;
    const newUnit: Unit = {
      id: `u-${Date.now()}`,
      title: `UD${editingCourse.units.length + 1}: Título`,
      description: 'Descripción breve...',
      hoursPlanned: 10,
      hoursRealized: 0,
      status: UnitStatus.PENDING,
      trimestres: [1]
    };
    setEditingCourse({
      ...editingCourse,
      units: [...editingCourse.units, newUnit]
    });
  };

  const handleUpdateUnit = (unitId: string, field: keyof Unit, value: any) => {
    if (!editingCourse) return;
    const updatedUnits = editingCourse.units.map(u => 
      u.id === unitId ? { ...u, [field]: value } : u
    );
    setEditingCourse({ ...editingCourse, units: updatedUnits });
  };

  const toggleTrimestre = (unitId: string, trim: number) => {
    if (!editingCourse) return;
    const unit = editingCourse.units.find(u => u.id === unitId);
    if (!unit) return;

    let newTrims = [...unit.trimestres];
    if (newTrims.includes(trim)) {
        // Prevent removing the last trimester (must have at least one)
        if (newTrims.length > 1) {
            newTrims = newTrims.filter(t => t !== trim);
        }
    } else {
        newTrims.push(trim);
    }
    // Sort logic
    newTrims.sort();
    
    handleUpdateUnit(unitId, 'trimestres', newTrims);
  };

  const handleDeleteUnit = (unitId: string) => {
    if (!editingCourse) return;
    setEditingCourse({
      ...editingCourse,
      units: editingCourse.units.filter(u => u.id !== unitId)
    });
  };

  // Calculations
  const totalPlannedHours = editingCourse?.units.reduce((acc, u) => acc + u.hoursPlanned, 0) || 0;
  const annualHours = editingCourse?.annualHours || 0;
  const hoursDiff = annualHours - totalPlannedHours;
  const progressPercent = annualHours > 0 ? (totalPlannedHours / annualHours) * 100 : 0;
  
  let statusColor = 'bg-blue-500';
  let statusText = 'En progreso';
  
  if (totalPlannedHours > annualHours) {
    statusColor = 'bg-red-500';
    statusText = `Exceso: +${Math.abs(hoursDiff)}h`;
  } else if (totalPlannedHours === annualHours && annualHours > 0) {
    statusColor = 'bg-green-500';
    statusText = 'Cuadre Perfecto';
  } else {
    statusText = `Pendiente: ${hoursDiff}h`;
  }

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 animate-fade-in pb-10">
      
      {/* Sidebar List of Modules */}
      <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-4 bg-chef-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Módulos</h3>
          <button onClick={handleAddNewCourse} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {courses.map(course => (
            <div 
              key={course.id}
              onClick={() => handleSelectCourse(course.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all border ${
                activeCourseId === course.id 
                  ? 'bg-chef-600 text-white border-chef-600 shadow-md' 
                  : 'bg-white hover:bg-gray-50 border-gray-100'
              }`}
            >
              <div className="font-bold text-sm truncate">{course.name}</div>
              <div className={`text-xs ${activeCourseId === course.id ? 'text-chef-100' : 'text-gray-500'}`}>
                {course.cycle} • {course.grade}
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm">
              No hay módulos configurados. Añade uno.
            </div>
          )}
        </div>
      </div>

      {/* Main Edit Panel */}
      <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {editingCourse ? (
          <>
            <div className="p-6 border-b border-gray-100 bg-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                   <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                     <Settings size={20} className="text-gray-400" />
                     Configuración del Módulo
                   </h2>
                   <p className="text-sm text-gray-500">Define los datos oficiales (BOE) y distribuye la carga horaria.</p>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => handleDeleteCourse(editingCourse.id)}
                     className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                     title="Borrar Módulo"
                   >
                     <Trash2 size={20} />
                   </button>
                   <button 
                     onClick={handleSaveCourse}
                     className="bg-chef-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-chef-700 transition shadow-sm"
                   >
                     <Save size={18} /> Guardar Cambios
                   </button>
                </div>
              </div>

              {/* General Data Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                 <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Módulo</label>
                    <input 
                      type="text" 
                      value={editingCourse.name}
                      onChange={(e) => setEditingCourse({...editingCourse, name: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-chef-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ciclo Formativo</label>
                    <input 
                      type="text" 
                      value={editingCourse.cycle}
                      onChange={(e) => setEditingCourse({...editingCourse, cycle: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-chef-500 outline-none"
                      placeholder="Ej: GM Cocina"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Curso</label>
                    <select
                      value={editingCourse.grade}
                      onChange={(e) => setEditingCourse({...editingCourse, grade: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-chef-500 outline-none bg-white"
                    >
                       <option value="1º Curso">1º Curso</option>
                       <option value="2º Curso">2º Curso</option>
                       <option value="FP Básica">FP Básica</option>
                       <option value="Curso Espec.">Curso Espec.</option>
                    </select>
                 </div>
                 
                 {/* Hours Section - Specific State Validation */}
                 <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-gray-200 mt-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Horas Semanales (Horario)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={editingCourse.weeklyHours}
                          onChange={(e) => setEditingCourse({...editingCourse, weeklyHours: Number(e.target.value)})}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-chef-500 outline-none pl-8"
                        />
                        <Clock size={14} className="absolute top-3 left-2.5 text-gray-400" />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Usado para la rejilla semanal.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase mb-1 flex items-center gap-1">
                        Horas Totales (Estado/BOE) <AlertCircle size={12} className="text-chef-600"/>
                      </label>
                      <input 
                        type="number" 
                        value={editingCourse.annualHours}
                        onChange={(e) => setEditingCourse({...editingCourse, annualHours: Number(e.target.value)})}
                        className="w-full p-2 border-2 border-chef-200 rounded focus:ring-2 focus:ring-chef-500 outline-none font-bold text-gray-800"
                        placeholder="Ej: 350"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Cifra oficial que debe cuadrar.</p>
                    </div>

                    <div className="flex flex-col justify-center">
                       <div className="flex justify-between text-xs mb-1 font-medium">
                         <span>Asignadas: {totalPlannedHours}h</span>
                         <span className={hoursDiff < 0 ? 'text-red-500' : 'text-gray-600'}>
                            {statusText}
                         </span>
                       </div>
                       <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                             className={`h-full transition-all duration-500 ${statusColor}`}
                             style={{ width: `${Math.min(100, progressPercent)}%` }}
                          ></div>
                       </div>
                       {hoursDiff < 0 && (
                         <p className="text-[10px] text-red-500 mt-1 font-bold">⚠️ Has superado las horas oficiales.</p>
                       )}
                    </div>
                 </div>
              </div>
            </div>

            {/* Units Management */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2">
                   <BookOpen size={18} /> Programación de Unidades Didácticas
                 </h3>
                 <button 
                   onClick={handleAddUnit}
                   className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium transition flex items-center gap-1"
                 >
                   <Plus size={16} /> Nueva Unidad
                 </button>
              </div>

              <div className="space-y-3">
                 {editingCourse.units.map((unit, index) => (
                   <div key={unit.id} className="flex flex-col md:flex-row gap-3 p-4 border border-gray-200 rounded-lg hover:border-chef-300 transition-colors bg-gray-50/50">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                         {/* Title */}
                         <div className="md:col-span-4">
                           <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Título UD</label>
                           <input 
                             type="text" 
                             value={unit.title}
                             onChange={(e) => handleUpdateUnit(unit.id, 'title', e.target.value)}
                             className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-chef-500"
                           />
                         </div>
                         {/* Description */}
                         <div className="md:col-span-5">
                           <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Contenido / Descripción</label>
                           <input 
                             type="text" 
                             value={unit.description}
                             onChange={(e) => handleUpdateUnit(unit.id, 'description', e.target.value)}
                             className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-chef-500"
                           />
                         </div>
                         {/* Hours */}
                         <div className="md:col-span-2">
                            <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Horas</label>
                            <input 
                             type="number" 
                             value={unit.hoursPlanned}
                             onChange={(e) => handleUpdateUnit(unit.id, 'hoursPlanned', Number(e.target.value))}
                             className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-chef-500 text-center font-bold"
                           />
                         </div>
                         {/* Trimestre Multi-select */}
                         <div className="md:col-span-1">
                            <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Trim.</label>
                            <div className="flex flex-col gap-1">
                                {[1, 2, 3].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => toggleTrimestre(unit.id, t)}
                                        className={`flex items-center justify-center w-full p-1 rounded text-[10px] border transition-all ${
                                            unit.trimestres.includes(t)
                                            ? 'bg-chef-600 text-white border-chef-600'
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
                                        }`}
                                    >
                                        {t}º {unit.trimestres.includes(t) && <Check size={8} className="ml-1"/>}
                                    </button>
                                ))}
                            </div>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteUnit(unit.id)}
                        className="text-gray-400 hover:text-red-500 self-center p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                 ))}
                 {editingCourse.units.length === 0 && (
                   <div className="text-center py-8 text-gray-400 italic bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                     No hay unidades definidas. Comienza añadiendo la primera.
                   </div>
                 )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Settings size={48} className="mb-4 opacity-20" />
            <p>Selecciona un módulo para editar su configuración</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseConfigurator;
