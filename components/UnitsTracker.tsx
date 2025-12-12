import React from 'react';
import { Course, Unit, UnitStatus } from '../types';
import { Clock, AlertCircle } from 'lucide-react';

interface UnitsTrackerProps {
  courses: Course[];
}

const StatusBadge: React.FC<{ status: UnitStatus }> = ({ status }) => {
  const colors = {
    [UnitStatus.COMPLETED]: 'bg-green-100 text-green-700',
    [UnitStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
    [UnitStatus.PENDING]: 'bg-gray-100 text-gray-600',
    [UnitStatus.DELAYED]: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
};

const UnitsTracker: React.FC<UnitsTrackerProps> = ({ courses }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Unidades Didácticas</h2>
          <p className="text-gray-500">Seguimiento detallado por módulo</p>
        </div>
      </header>

      {courses.map((course) => (
        <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-chef-50 p-4 border-b border-chef-100">
            <h3 className="font-bold text-lg text-chef-900">{course.name}</h3>
            <span className="text-xs text-chef-600 uppercase tracking-wide">{course.type}</span>
          </div>
          
          <div className="divide-y divide-gray-100">
            {course.units.map((unit) => (
              <div key={unit.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{unit.title}</span>
                      <StatusBadge status={unit.status} />
                    </div>
                    <p className="text-sm text-gray-600">{unit.description}</p>
                  </div>

                  <div className="flex items-center gap-6 min-w-[200px]">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progreso Horas</span>
                        <span className="font-medium">{unit.hoursRealized} / {unit.hoursPlanned} h</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            unit.hoursRealized >= unit.hoursPlanned ? 'bg-green-500' : 
                            unit.status === UnitStatus.DELAYED ? 'bg-red-400' : 'bg-chef-500'
                          }`}
                          style={{ width: `${Math.min(100, (unit.hoursRealized / unit.hoursPlanned) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {unit.status === UnitStatus.DELAYED && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                    <AlertCircle size={14} />
                    <span>Esta unidad lleva un retraso de {unit.hoursPlanned - unit.hoursRealized} horas respecto a lo planificado. Se sugiere ajuste.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UnitsTracker;
