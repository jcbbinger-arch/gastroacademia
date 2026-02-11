
import { Course, UnitStatus, Evaluation, CalendarEvent, ClassLog, LegendItem, ScheduleSlot } from './types';

// --- BASE DE DATOS LIMPIA (INICIO DESDE CERO) ---

// Configuración de Cursos: Inicialmente vacía. 
// El usuario deberá crearlos desde la sección "Datos Módulos".
export const COURSES_DATA: Course[] = [];

// Horario del Profesor: Inicialmente vacío.
export const TEACHER_SCHEDULE: ScheduleSlot[] = [];

// Registros de clase: Vacío.
export const INITIAL_LOGS: ClassLog[] = [];

// Evaluaciones: Vacío.
export const EVALUATIONS_DATA: Evaluation[] = [];

// Leyenda del Calendario: Configuramos solo los tipos básicos y colores estándar.
export const INITIAL_LEGEND_ITEMS: LegendItem[] = [
  { id: 'leg-1', label: 'Festivo / No Lectivo', color: '#DC2626' }, // Rojo
  { id: 'leg-2', label: 'Evaluación / Notas', color: '#FBBF24' },   // Ámbar
  { id: 'leg-3', label: 'Actividad Extraescolar', color: '#16A34A' }, // Verde
  { id: 'leg-4', label: 'Reunión / Claustro', color: '#2563EB' },     // Azul
  { id: 'leg-5', label: 'FCT (Prácticas)', color: '#94A3B8' },        // Gris
  { id: 'leg-6', label: 'Examen Final', color: '#9333EA' },           // Púrpura
];

// Eventos del Calendario: Vacío.
export const CALENDAR_EVENTS: CalendarEvent[] = [];
