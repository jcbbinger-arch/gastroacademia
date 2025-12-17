
export enum UnitStatus {
  PENDING = 'Pendiente',
  IN_PROGRESS = 'En Progreso',
  COMPLETED = 'Completado',
  DELAYED = 'Retrasado'
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  // Split hours structure
  hoursPlannedTheory: number;
  hoursPlannedPractice: number;
  // hoursRealized is legacy/cache, but real calculation comes from Logs
  hoursRealized: number; 
  status: UnitStatus;
  trimestres: number[]; 
}

export interface Course {
  id: string;
  name: string;
  cycle: string; 
  grade: string; 
  weeklyHours: number;
  annualHours: number; 
  color?: string; 
  units: Unit[];
}

export interface Evaluation {
  id: string;
  title: string;
  date: string;
  type: 'Parcial' | 'Final' | 'Extraordinaria';
  completed: boolean;
}

// --- Tipos para el Calendario Dinámico ---

export interface LegendItem {
  id: string;
  label: string;
  color: string; 
}

export interface CalendarEvent {
  id: string;
  date: string; 
  legendItemId: string; 
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// --- Tipos para el Diario de Clase ---

export type SessionType = 'Teórica' | 'Práctica';
export type AttendanceStatus = 'Impartida' | 'Falta Profesor' | 'Falta Alumnos' | 'Otras Incidencias';

export interface ClassLog {
  id: string;
  date: string;
  courseId: string;
  unitId: string;
  hours: number;
  type: SessionType;
  status: AttendanceStatus;
  notes: string;
}

// --- Nuevo Tipo: Horario Semanal ---
export interface ScheduleSlot {
  dayOfWeek: number; 
  startTime: string; 
  endTime: string;   
  courseId: string;
  defaultHours: number;
  label: string; 
}

// --- Tipos de Configuración e Identidad ---
export interface SchoolInfo {
  name: string;
  logoUrl: string; 
  academicYear: string; 
  department: string; 
}

export interface TeacherInfo {
  name: string;
  role: string;
  avatarUrl: string; 
}

export interface BackupData {
  timestamp: string;
  schoolInfo?: SchoolInfo;
  teacherInfo?: TeacherInfo;
  courses?: Course[];
  schedule?: ScheduleSlot[];
  logs?: ClassLog[];
  calendarEvents?: CalendarEvent[];
}
