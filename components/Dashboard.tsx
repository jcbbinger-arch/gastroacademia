import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Course, UnitStatus, Evaluation } from '../types';
import { Calendar, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';

interface DashboardProps {
  courses: Course[];
  evaluations: Evaluation[];
}

const Dashboard: React.FC<DashboardProps> = ({ courses, evaluations }) => {
  const allUnits = courses.flatMap(c => c.units);
  const completed = allUnits.filter(u => u.status === UnitStatus.COMPLETED).length;
  const inProgress = allUnits.filter(u => u.status === UnitStatus.IN_PROGRESS).length;
  const delayed = allUnits.filter(u => u.status === UnitStatus.DELAYED).length;
  const pending = allUnits.filter(u => u.status === UnitStatus.PENDING).length;

  const dataPie = [
    { name: 'Completado', value: completed, color: '#22c55e' }, // fresh-600
    { name: 'En Progreso', value: inProgress, color: '#3b82f6' },
    { name: 'Retrasado', value: delayed, color: '#ef4444' },
    { name: 'Pendiente', value: pending, color: '#94a3b8' },
  ];

  const dataBar = courses.map(c => ({
    name: c.name.split(' ')[0], 
    Planificadas: c.units.reduce((acc, u) => acc + u.hoursPlanned, 0),
    Realizadas: c.units.reduce((acc, u) => acc + u.hoursRealized, 0),
  }));

  const nextEvaluation = evaluations
    .filter(e => !e.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Panel de Control 2025-2026</h2>
        <p className="text-gray-600 font-medium text-lg mt-1">Resumen ejecutivo del progreso académico</p>
      </header>

      {/* KPI Cards - Thicker & Stronger */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-md border-2 border-gray-100 flex items-center gap-5 hover:border-blue-200 transition-colors group">
          <div className="p-4 bg-blue-100 rounded-xl text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <BookOpen size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Unidades</p>
            <p className="text-3xl font-black text-gray-900">{allUnits.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border-2 border-gray-100 flex items-center gap-5 hover:border-green-200 transition-colors group">
          <div className="p-4 bg-green-100 rounded-xl text-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <CheckCircle size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Completadas</p>
            <p className="text-3xl font-black text-gray-900">{completed}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border-2 border-gray-100 flex items-center gap-5 hover:border-red-200 transition-colors group">
          <div className="p-4 bg-red-100 rounded-xl text-red-700 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <AlertTriangle size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Retrasadas</p>
            <p className="text-3xl font-black text-red-600">{delayed}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border-2 border-gray-100 flex items-center gap-5 hover:border-chef-200 transition-colors group">
          <div className="p-4 bg-chef-100 rounded-xl text-chef-700 group-hover:bg-chef-600 group-hover:text-white transition-colors">
            <Calendar size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Próxima Eval.</p>
            <p className="text-lg font-black text-gray-900 leading-tight" title={nextEvaluation?.title}>
              {nextEvaluation ? new Date(nextEvaluation.date).toLocaleDateString() : 'Fin Curso'}
            </p>
            <p className="text-xs font-bold text-gray-400 mt-0.5 truncate max-w-[100px]">{nextEvaluation?.type}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
            Estado de Unidades
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {dataPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '2px solid #f3f4f6', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontWeight: 600, color: '#4b5563' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
             <span className="w-2 h-8 bg-chef-500 rounded-full"></span>
             Horas: Plan vs Realidad
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataBar} barGap={4}>
                <XAxis dataKey="name" tick={{fill: '#6b7280', fontWeight: 700, fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#6b7280', fontWeight: 600}} axisLine={false} tickLine={false} />
                <Tooltip 
                   cursor={{fill: '#f9fafb'}}
                   contentStyle={{ borderRadius: '12px', border: '2px solid #f3f4f6', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontWeight: 600, color: '#4b5563' }} />
                <Bar dataKey="Planificadas" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Realizadas" fill="#8a6a5c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;