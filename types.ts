
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
  hoursPlanned: number;
  hoursRealized: number;
  status: UnitStatus;
  trimestres: number[]; // Changed to array to allow units spanning multiple trimesters
}

export interface Course {
  id: string;
  name: string;
  cycle: string; // Nuevo: ej. "GM Cocina y Gastronomía"
  grade: string; // Nuevo: ej. "2º Curso"
  weeklyHours: number;
  annualHours: number; // Nuevo: Horas totales marcadas por el estado
  color?: string; // Nuevo: Color identificativo del módulo
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
  color: string; // Hex code or Tailwind class identifier
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  legendItemId: string; // Link to LegendItem
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
  dayOfWeek: number; // 1 = Lunes, 2 = Martes, ... 5 = Viernes
  startTime: string; // "08:15"
  endTime: string;   // "09:10"
  courseId: string;
  defaultHours: number;
  label: string; // Para mostrar en la UI, ej: "1ª Hora" o "Bloque Mañana"
}

// --- Tipos de Configuración e Identidad ---
export interface SchoolInfo {
  name: string;
  logoUrl: string; // URL o Base64
  academicYear: string; // "2025-2026"
}

export interface TeacherInfo {
  name: string;
  role: string;
  avatarUrl: string; // URL o Base64
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
