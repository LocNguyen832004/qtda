import {
  Subject,
  StudyTask,
  ScheduleSlot,
  FocusSession,
  PointTransaction,
} from '../types';

// ─── Subjects ─────────────────────────────────────────────────────────────────
export const MOCK_SUBJECTS: Subject[] = [
  {
    id: 's1',
    name: 'Giải Tích 1',
    shortName: 'GT1',
    color: '#6C63FF',
    targetHours: 8,
    studiedHours: 22,
  },
  {
    id: 's2',
    name: 'Vật Lý Đại Cương',
    shortName: 'VLY',
    color: '#43BCCD',
    targetHours: 6,
    studiedHours: 15,
  },
  {
    id: 's3',
    name: 'Lập Trình Hướng Đối Tượng',
    shortName: 'OOP',
    color: '#56C271',
    targetHours: 10,
    studiedHours: 31,
  },
  {
    id: 's4',
    name: 'Cơ Sở Dữ Liệu',
    shortName: 'CSDL',
    color: '#F9A826',
    targetHours: 7,
    studiedHours: 18,
  },
  {
    id: 's5',
    name: 'Tiếng Anh Chuyên Ngành',
    shortName: 'TACN',
    color: '#FF6584',
    targetHours: 4,
    studiedHours: 9,
  },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const MOCK_TASKS: StudyTask[] = [
  // Giải Tích
  {
    id: 't1',
    subjectId: 's1',
    title: 'Ôn tập chương 1: Giới hạn & liên tục',
    dueDate: '2026-05-29',
    priority: 'high',
    status: 'in_progress',
    estimatedPomodoros: 4,
    actualPomodoros: 1,
  },
  {
    id: 't2',
    subjectId: 's1',
    title: 'Làm bài tập đạo hàm trang 45-50',
    dueDate: '2026-05-30',
    priority: 'medium',
    status: 'todo',
    estimatedPomodoros: 2,
    actualPomodoros: 0,
  },
  {
    id: 't3',
    subjectId: 's1',
    title: 'Chuẩn bị bài kiểm tra giữa kỳ',
    dueDate: '2026-06-03',
    priority: 'high',
    status: 'todo',
    estimatedPomodoros: 5,
    actualPomodoros: 0,
  },
  // Vật Lý
  {
    id: 't4',
    subjectId: 's2',
    title: 'Làm lab báo cáo thí nghiệm quang học',
    dueDate: '2026-05-28',
    priority: 'high',
    status: 'done',
    estimatedPomodoros: 3,
    actualPomodoros: 3,
    completedAt: '2026-05-27T10:30:00Z',
  },
  {
    id: 't5',
    subjectId: 's2',
    title: 'Ôn tập cơ học Newton',
    dueDate: '2026-05-31',
    priority: 'medium',
    status: 'todo',
    estimatedPomodoros: 3,
    actualPomodoros: 0,
  },
  // OOP
  {
    id: 't6',
    subjectId: 's3',
    title: 'Hoàn thiện project Java - module User',
    dueDate: '2026-05-29',
    priority: 'high',
    status: 'in_progress',
    estimatedPomodoros: 6,
    actualPomodoros: 2,
  },
  {
    id: 't7',
    subjectId: 's3',
    title: 'Đọc tài liệu Design Patterns',
    dueDate: '2026-06-02',
    priority: 'low',
    status: 'todo',
    estimatedPomodoros: 2,
    actualPomodoros: 0,
  },
  {
    id: 't8',
    subjectId: 's3',
    title: 'Viết unit test cho module Payment',
    dueDate: '2026-06-01',
    priority: 'medium',
    status: 'todo',
    estimatedPomodoros: 3,
    actualPomodoros: 0,
  },
  // CSDL
  {
    id: 't9',
    subjectId: 's4',
    title: 'Thiết kế ERD cho hệ thống quản lý SV',
    dueDate: '2026-05-30',
    priority: 'high',
    status: 'in_progress',
    estimatedPomodoros: 4,
    actualPomodoros: 1,
  },
  {
    id: 't10',
    subjectId: 's4',
    title: 'Ôn tập SQL nâng cao - JOIN & Subquery',
    dueDate: '2026-06-01',
    priority: 'medium',
    status: 'todo',
    estimatedPomodoros: 2,
    actualPomodoros: 0,
  },
  // Tiếng Anh
  {
    id: 't11',
    subjectId: 's5',
    title: 'Học từ vựng IT - Unit 5',
    dueDate: '2026-05-28',
    priority: 'low',
    status: 'done',
    estimatedPomodoros: 1,
    actualPomodoros: 1,
    completedAt: '2026-05-28T08:00:00Z',
  },
  {
    id: 't12',
    subjectId: 's5',
    title: 'Luyện nghe IELTS - Academic Listening',
    dueDate: '2026-06-04',
    priority: 'medium',
    status: 'todo',
    estimatedPomodoros: 2,
    actualPomodoros: 0,
  },
];

// ─── Schedule Slots (1 tuần) ──────────────────────────────────────────────────
export const MOCK_SCHEDULE: ScheduleSlot[] = [
  // Monday (1)
  { id: 'sc1', subjectId: 's1', dayOfWeek: 1, startTime: '07:30', endTime: '09:10', room: 'A1-301', type: 'lecture' },
  { id: 'sc2', subjectId: 's3', dayOfWeek: 1, startTime: '13:00', endTime: '14:40', room: 'B2-201', type: 'lecture' },
  // Tuesday (2)
  { id: 'sc3', subjectId: 's2', dayOfWeek: 2, startTime: '07:30', endTime: '09:10', room: 'C3-101', type: 'lecture' },
  { id: 'sc4', subjectId: 's4', dayOfWeek: 2, startTime: '09:20', endTime: '11:00', room: 'B1-404', type: 'lecture' },
  // Wednesday (3)
  { id: 'sc5', subjectId: 's3', dayOfWeek: 3, startTime: '07:30', endTime: '11:00', room: 'Lab IT-01', type: 'lab' },
  { id: 'sc6', subjectId: 's5', dayOfWeek: 3, startTime: '13:00', endTime: '14:40', room: 'A2-205', type: 'lecture' },
  // Thursday (4)
  { id: 'sc7', subjectId: 's1', dayOfWeek: 4, startTime: '07:30', endTime: '09:10', room: 'A1-301', type: 'tutorial' },
  { id: 'sc8', subjectId: 's4', dayOfWeek: 4, startTime: '13:00', endTime: '14:40', room: 'Lab DB-02', type: 'lab' },
  // Friday (5)
  { id: 'sc9', subjectId: 's2', dayOfWeek: 5, startTime: '07:30', endTime: '11:00', room: 'Lab VL-01', type: 'lab' },
  { id: 'sc10', subjectId: 's5', dayOfWeek: 5, startTime: '13:00', endTime: '14:40', room: 'A2-205', type: 'lecture' },
  // Saturday (6) - self study
  { id: 'sc11', subjectId: 's1', dayOfWeek: 6, startTime: '08:00', endTime: '10:00', room: 'Thư viện', type: 'self_study' },
  { id: 'sc12', subjectId: 's3', dayOfWeek: 6, startTime: '10:00', endTime: '12:00', room: 'Thư viện', type: 'self_study' },
];

// ─── Focus Sessions ───────────────────────────────────────────────────────────
const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return fmt(d);
};

export const MOCK_FOCUS_SESSIONS: FocusSession[] = [
  { id: 'f1', subjectId: 's3', taskId: 't6', date: daysAgo(0), durationMinutes: 25, sessionType: 'pomodoro', completed: true, note: 'Làm module User' },
  { id: 'f2', subjectId: 's3', taskId: 't6', date: daysAgo(0), durationMinutes: 25, sessionType: 'pomodoro', completed: true },
  { id: 'f3', subjectId: 's1', taskId: 't1', date: daysAgo(1), durationMinutes: 25, sessionType: 'pomodoro', completed: true },
  { id: 'f4', subjectId: 's1', taskId: 't1', date: daysAgo(1), durationMinutes: 25, sessionType: 'pomodoro', completed: true, note: 'Ôn giới hạn' },
  { id: 'f5', subjectId: 's4', taskId: 't9', date: daysAgo(1), durationMinutes: 25, sessionType: 'pomodoro', completed: true },
  { id: 'f6', subjectId: 's2', date: daysAgo(2), durationMinutes: 25, sessionType: 'pomodoro', completed: true },
  { id: 'f7', subjectId: 's2', date: daysAgo(2), durationMinutes: 25, sessionType: 'pomodoro', completed: false },
  { id: 'f8', subjectId: 's5', taskId: 't11', date: daysAgo(3), durationMinutes: 25, sessionType: 'pomodoro', completed: true },
  { id: 'f9', subjectId: 's3', date: daysAgo(4), durationMinutes: 25, sessionType: 'pomodoro', completed: true },
  { id: 'f10', subjectId: 's1', date: daysAgo(5), durationMinutes: 25, sessionType: 'pomodoro', completed: true },
  { id: 'f11', subjectId: 's4', date: daysAgo(6), durationMinutes: 25, sessionType: 'pomodoro', completed: true },
];

// ─── Point Transactions ───────────────────────────────────────────────────────
export const MOCK_POINT_TRANSACTIONS: PointTransaction[] = [
  { id: 'p1', date: daysAgo(0), points: 10, reason: 'pomodoro_done', description: 'Hoàn thành 1 Pomodoro' },
  { id: 'p2', date: daysAgo(0), points: 10, reason: 'pomodoro_done', description: 'Hoàn thành 1 Pomodoro' },
  { id: 'p3', date: daysAgo(0), points: 30, reason: 'task_completed', description: 'Hoàn thành task: Học từ vựng IT' },
  { id: 'p4', date: daysAgo(1), points: 30, reason: 'task_completed', description: 'Hoàn thành task: Lab báo cáo quang học' },
  { id: 'p5', date: daysAgo(1), points: 10, reason: 'pomodoro_done', description: 'Hoàn thành 1 Pomodoro' },
  { id: 'p6', date: daysAgo(1), points: 10, reason: 'pomodoro_done', description: 'Hoàn thành 1 Pomodoro' },
  { id: 'p7', date: daysAgo(2), points: 50, reason: 'streak_bonus', description: 'Streak 3 ngày liên tiếp! 🔥' },
  { id: 'p8', date: daysAgo(3), points: 10, reason: 'pomodoro_done', description: 'Hoàn thành 1 Pomodoro' },
];
