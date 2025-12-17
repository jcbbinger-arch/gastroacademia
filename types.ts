
export enum UnitStatus {
  PENDING = 'Pendiente',
  IN_PROGRESS = 'En Progreso',
  COMPLETED = 'Completado',
  DELAYED = 'Retrasado'
}

// --- Estructura Jerárquica de Evaluación (LOMLOE/FP) ---

export interface AsociacionCriterio {
  id: string;
  utId: string; // El "Pegamento": Vincula con la Unidad de Trabajo (Unit)
  instruments: string[]; // Ej: ['Examen', 'Práctica', 'Rúbrica']
}

export interface CriterioEvaluacion {
  id: string;
  codigo: string; // Ej: "1.a"
  descripcion: string;
  ponderacion: number; // Peso del Criterio dentro del RA (0-100%)
  raId: string; // Referencia al padre
  asociaciones: AsociacionCriterio[]; // Lista de vínculos con UTs
}

export interface ResultadoAprendizaje {
  id: string;
  codigo: string; // Ej: "RA1"
  descripcion: string; // Ej: "Organiza procesos de producción..."
  ponderacion: number; // Peso del RA en el total del módulo (0-100%)
  criterios: CriterioEvaluacion[];
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
  units: Unit[]; // Estas son las "Unidades de Trabajo" (UT)
  learningResults: ResultadoAprendizaje[]; // Nueva estructura de evaluación
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
