// ─── Subject ─────────────────────────────────────────────────────────────────
export type SubjectColor =
  | '#6C63FF'
  | '#FF6584'
  | '#43BCCD'
  | '#F9A826'
  | '#56C271'
  | '#E8724A';

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  color: SubjectColor | string;
  targetHours?: number;  // weekly target study hours
  studiedHours: number; // total studied so far
}

// ─── Study Task ───────────────────────────────────────────────────────────────
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface StudyTask {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO date string YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  estimatedPomodoros: number;
  actualPomodoros: number;
  completedAt?: string;
}

// ─── Schedule Slot ────────────────────────────────────────────────────────────
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface ScheduleSlot {
  id: string;
  subjectId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  room?: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'self_study' | 'group_study';
}

// ─── Focus Session ────────────────────────────────────────────────────────────
export type SessionType = 'pomodoro' | 'short_break' | 'long_break';

export interface FocusSession {
  id: string;
  subjectId: string;
  taskId?: string;      // linked task
  date: string;        // ISO date string YYYY-MM-DD
  durationMinutes: number;
  sessionType: SessionType;
  completed: boolean;
  note?: string;
}

// ─── Point Transaction ────────────────────────────────────────────────────────
export type PointReason =
  | 'task_completed'
  | 'pomodoro_done'
  | 'streak_bonus'
  | 'goal_reached'
  | 'music_unlocked'
  | 'abandon_penalty';

// ─── Abandon Log ─────────────────────────────────────────────────────────────
export type AbandonReason = 'tab_switch' | 'back_button' | 'app_background';

export interface AbandonLog {
  id: string;
  timestamp: string;       // ISO datetime
  date: string;            // YYYY-MM-DD
  subjectId: string;
  taskId?: string;
  mode: 'pomodoro' | 'short_break' | 'long_break';
  timeLeftSeconds: number; // còn bao nhiêu giây khi thoát
  elapsedSeconds: number;  // đã học được bao nhiêu giây
  totalSeconds: number;    // tổng thời gian phiên
  reason: AbandonReason;
}

export interface PointTransaction {
  id: string;
  date: string; // ISO date string
  points: number;
  reason: PointReason;
  description: string;
}

// ─── App State Helpers ────────────────────────────────────────────────────────
export interface WeeklyStats {
  totalMinutes: number;
  completedTasks: number;
  pomodoroCount: number;
  streakDays: number;
  bySubject: { subjectId: string; minutes: number }[];
}
