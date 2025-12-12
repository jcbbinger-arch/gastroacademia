import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Course, UnitStatus, Evaluation } from '../types';
import { Calendar, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';

interface DashboardProps {
  courses: Course[];
  evaluations: Evaluation[];
}

const Dashboard: React.FC<DashboardProps> = ({ courses, evaluations }) => {
  // Calculate completion stats
  const allUnits = courses.flatMap(c => c.units);
  const completed = allUnits.filter(u => u.status === UnitStatus.COMPLETED).length;
  const inProgress = allUnits.filter(u => u.status === UnitStatus.IN_PROGRESS).length;
  const delayed = allUnits.filter(u => u.status === UnitStatus.DELAYED).length;
  const pending = allUnits.filter(u => u.status === UnitStatus.PENDING).length;

  const dataPie = [
    { name: 'Completado', value: completed, color: '#22c55e' },
    { name: 'En Progreso', value: inProgress, color: '#3b82f6' },
    { name: 'Retrasado', value: delayed, color: '#ef4444' },
    { name: 'Pendiente', value: pending, color: '#94a3b8' },
  ];

  // Hours comparison
  const dataBar = courses.map(c => ({
    name: c.name.split(' ')[0], // Short name
    Planificadas: c.units.reduce((acc, u) => acc + u.hoursPlanned, 0),
    Realizadas: c.units.reduce((acc, u) => acc + u.hoursRealized, 0),
  }));

  const nextEvaluation = evaluations
    .filter(e => !e.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Panel de Control 2025-2026</h2>
        <p className="text-gray-500">Resumen del progreso académico culinario</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Unidades Totales</p>
            <p className="text-2xl font-bold">{allUnits.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Completadas</p>
            <p className="text-2xl font-bold">{completed}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Con Retraso</p>
            <p className="text-2xl font-bold">{delayed}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-chef-200 rounded-full text-chef-700">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Próxima Eval.</p>
            <p className="text-sm font-bold truncate max-w-[120px]" title={nextEvaluation?.title}>
              {nextEvaluation ? new Date(nextEvaluation.date).toLocaleDateString() : 'Fin de curso'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Estado de Unidades</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Horas: Planificadas vs Realizadas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataBar}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Planificadas" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Realizadas" fill="#a18072" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
