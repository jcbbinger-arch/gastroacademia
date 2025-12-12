import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookOpen, 
  Leaf, 
  MessageSquare, 
  Menu, 
  X,
  GraduationCap,
  NotebookPen,
  Settings,
  School,
  UserCircle,
  Clock,
  FileText, // Icon for Reports
  Database // Icon for Backup
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import UnitsTracker from './components/UnitsTracker';
import AIAssistant from './components/AIAssistant';
import DailyJournal from './components/DailyJournal';
import CourseConfigurator from './components/CourseConfigurator';
import ScheduleConfigurator from './components/ScheduleConfigurator';
import SettingsPanel from './components/SettingsPanel'; // New
import ReportsCenter from './components/ReportsCenter'; // New
import BackupManager from './components/BackupManager'; // New

import { COURSES_DATA, EVALUATIONS_DATA, CALENDAR_EVENTS, TEACHER_SCHEDULE, INITIAL_LOGS } from './constants';
import { Course, ScheduleSlot, ClassLog, SchoolInfo, TeacherInfo, BackupData, CalendarEvent } from './types';

type View = 'dashboard' | 'calendar' | 'units' | 'journal' | 'ai' | 'config' | 'schedule' | 'settings' | 'reports' | 'backup';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Lifted state for shared data
  const [courses, setCourses] = useState<Course[]>(COURSES_DATA);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(TEACHER_SCHEDULE);
  const [logs, setLogs] = useState<ClassLog[]>(INITIAL_LOGS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS); // Moved to state for backup compatibility
  
  // Navigation State
  const [journalDate, setJournalDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Identity State (Editable)
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    name: "IES La Flota",
    logoUrl: "", // Start empty or default
    academicYear: "2025-2026"
  });
  
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>({
    name: "Juan Codina",
    role: "Profesor Técnico FP",
    avatarUrl: "" 
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNavigateToJournal = (date: string) => {
    setJournalDate(date);
    setCurrentView('journal');
  };

  // Import Handler
  const handleImportData = (data: BackupData) => {
    if (data.courses) setCourses(data.courses);
    if (data.schedule) setSchedule(data.schedule);
    if (data.logs) setLogs(data.logs);
    if (data.schoolInfo) setSchoolInfo(data.schoolInfo);
    if (data.teacherInfo) setTeacherInfo(data.teacherInfo);
    if (data.calendarEvents) setCalendarEvents(data.calendarEvents);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard courses={courses} evaluations={EVALUATIONS_DATA} />;
      case 'calendar':
        return <CalendarView 
                  events={calendarEvents} 
                  logs={logs} 
                  schedule={schedule} 
                  courses={courses}
                  onNavigateToJournal={handleNavigateToJournal}
                />;
      case 'journal':
        return <DailyJournal 
                  courses={courses} 
                  schedule={schedule} 
                  logs={logs} 
                  setLogs={setLogs}
                  date={journalDate}
                  setDate={setJournalDate}
                />;
      case 'units':
        return <UnitsTracker courses={courses} />;
      case 'config':
        return <CourseConfigurator courses={courses} onUpdateCourses={setCourses} />;
      case 'schedule':
        return <ScheduleConfigurator courses={courses} schedule={schedule} onUpdateSchedule={setSchedule} />;
      case 'reports':
        return <ReportsCenter courses={courses} logs={logs} schoolInfo={schoolInfo} teacherInfo={teacherInfo} />;
      case 'backup':
        return <BackupManager 
                  courses={courses} 
                  schedule={schedule} 
                  logs={logs} 
                  events={calendarEvents} 
                  schoolInfo={schoolInfo} 
                  teacherInfo={teacherInfo}
                  onImportData={handleImportData}
               />;
      case 'settings':
        return <SettingsPanel 
                  schoolInfo={schoolInfo} 
                  setSchoolInfo={setSchoolInfo} 
                  teacherInfo={teacherInfo} 
                  setTeacherInfo={setTeacherInfo} 
               />;
      case 'ai':
        return <AIAssistant />;
      default:
        return <Dashboard courses={courses} evaluations={EVALUATIONS_DATA} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsSidebarOpen(false);
      }}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
        currentView === view 
          ? 'bg-chef-100 text-chef-900 font-medium' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* School Info Header (Dynamic) */}
        <div className="p-6 border-b border-gray-100">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white overflow-hidden shadow-sm flex-shrink-0">
                 {schoolInfo.logoUrl ? (
                     <img src={schoolInfo.logoUrl} alt="Logo School" className="w-full h-full object-cover"/>
                 ) : (
                     <School size={20} />
                 )}
              </div>
              <div className="flex-1 min-w-0">
                 <h1 className="font-bold text-gray-900 text-sm truncate" title={schoolInfo.name}>{schoolInfo.name}</h1>
                 <p className="text-xs text-gray-500">{schoolInfo.academicYear}</p>
              </div>
           </div>

           {/* Teacher Profile - Compact (Dynamic) */}
           <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition" onClick={() => setCurrentView('settings')}>
              <div className="w-8 h-8 rounded-full bg-chef-200 flex items-center justify-center text-chef-700 overflow-hidden flex-shrink-0">
                 {teacherInfo.avatarUrl ? (
                     <img src={teacherInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover"/>
                 ) : (
                     <UserCircle size={24} />
                 )}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-xs font-bold text-gray-800 truncate" title={teacherInfo.name}>{teacherInfo.name}</p>
                 <p className="text-[10px] text-gray-500 truncate">{teacherInfo.role}</p>
              </div>
           </div>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Inicio" />
          <NavItem view="journal" icon={NotebookPen} label="Diario de Clase" />
          <NavItem view="calendar" icon={CalendarDays} label="Calendario Escolar" />
          <NavItem view="units" icon={BookOpen} label="Programación" />
          <NavItem view="reports" icon={FileText} label="Informes" />
          
          <div className="pt-4 mt-4 border-t border-gray-100">
             <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
               Gestión Docente
             </div>
             <NavItem view="schedule" icon={Clock} label="Mi Horario" />
             <NavItem view="config" icon={Settings} label="Datos Módulos" />
             <NavItem view="backup" icon={Database} label="Copias de Seguridad" />
             <NavItem view="settings" icon={UserCircle} label="Identidad y Centro" />
          </div>
          
          <div className="pt-4 mt-4 border-t border-gray-100">
             <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
               Herramientas IA
             </div>
             <NavItem view="ai" icon={MessageSquare} label="Asistente Virtual" />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-chef-600 rounded-lg flex items-center justify-center text-white">
              <GraduationCap size={20} />
            </div>
            <span className="font-bold text-gray-900">GastroAcademia</span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;