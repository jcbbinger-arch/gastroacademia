import React, { useState } from 'react';
import { SchoolInfo, TeacherInfo } from '../types';
import { Save, User, School, Image as ImageIcon, Upload } from 'lucide-react';

interface SettingsPanelProps {
  schoolInfo: SchoolInfo;
  setSchoolInfo: (info: SchoolInfo) => void;
  teacherInfo: TeacherInfo;
  setTeacherInfo: (info: TeacherInfo) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ schoolInfo, setSchoolInfo, teacherInfo, setTeacherInfo }) => {
  // Local state for form handling before saving
  const [localSchool, setLocalSchool] = useState<SchoolInfo>({ ...schoolInfo });
  const [localTeacher, setLocalTeacher] = useState<TeacherInfo>({ ...teacherInfo });

  const handleSave = () => {
    setSchoolInfo(localSchool);
    setTeacherInfo(localTeacher);
    alert('Configuración guardada correctamente. Los cambios se reflejarán en toda la aplicación.');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'school' | 'teacher') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'school') {
          setLocalSchool({ ...localSchool, logoUrl: result });
        } else {
          setLocalTeacher({ ...localTeacher, avatarUrl: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
      <header className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Configuración Global</h2>
        <p className="text-gray-500">Personaliza la identidad del centro y del docente.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Configuración del Centro */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6 text-chef-700">
            <School size={24} />
            <h3 className="text-xl font-bold">Datos del Centro</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Centro Educativo</label>
              <input
                type="text"
                value={localSchool.name}
                onChange={(e) => setLocalSchool({ ...localSchool, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-chef-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Departamento / Familia Profesional</label>
              <input
                type="text"
                value={localSchool.department}
                onChange={(e) => setLocalSchool({ ...localSchool, department: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-chef-500 outline-none"
                placeholder="Ej: Dpto. Hostelería y Turismo / Dpto. Idiomas"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Año Académico</label>
              <input
                type="text"
                value={localSchool.academicYear}
                onChange={(e) => setLocalSchool({ ...localSchool, academicYear: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-chef-500 outline-none"
                placeholder="Ej: 2025-2026"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Logo del Centro</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative">
                    {localSchool.logoUrl ? (
                        <img src={localSchool.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="text-gray-400" />
                    )}
                </div>
                <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm">
                   <Upload size={16} /> Subir Imagen
                   <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'school')} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Configuración del Docente */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6 text-chef-700">
            <User size={24} />
            <h3 className="text-xl font-bold">Datos del Profesor</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                value={localTeacher.name}
                onChange={(e) => setLocalTeacher({ ...localTeacher, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-chef-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Cargo / Puesto</label>
              <input
                type="text"
                value={localTeacher.role}
                onChange={(e) => setLocalTeacher({ ...localTeacher, role: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-chef-500 outline-none"
                placeholder="Ej: Profesor Técnico FP"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Foto / Avatar</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                     {localTeacher.avatarUrl ? (
                        <img src={localTeacher.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="text-gray-400" />
                    )}
                </div>
                <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm">
                   <Upload size={16} /> Subir Imagen
                   <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'teacher')} />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={handleSave}
          className="bg-chef-600 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-chef-700 transition flex items-center gap-2"
        >
          <Save size={20} /> Guardar Configuración
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;