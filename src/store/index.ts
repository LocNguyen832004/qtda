import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject, StudyTask, FocusSession, PointTransaction, ScheduleSlot, TaskStatus, AbandonLog, AbandonReason } from '../types';

const DEFAULT_SUBJECT: Subject = {
  id: 's_general',
  name: 'Khác',
  shortName: 'KHÁC',
  color: '#9CA3AF',
  targetHours: 5,
  studiedHours: 0,
};

// ─── Subject Store ────────────────────────────────────────────────────────────
interface SubjectState {
  subjects: Subject[];
  getSubjectById: (id: string) => Subject | undefined;
  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, updatedFields: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  reset: () => void;
}

export const useSubjectStore = create<SubjectState>()(
  persist(
    (set, get) => ({
      subjects: [DEFAULT_SUBJECT],
      getSubjectById: (id) => get().subjects.find((s) => s.id === id),
      addSubject: (subject) =>
        set((state) => ({ subjects: [...state.subjects, subject] })),
      updateSubject: (id, updatedFields) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === id ? { ...s, ...updatedFields } : s
          ),
        })),
      deleteSubject: (id) => {
        if (id === 's_general') return; // Do not allow deleting the default subject
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
        }));
        // Cascade delete tasks and schedule slots associated with this subject
        useTaskStore.getState().deleteTasksBySubject(id);
        useScheduleStore.getState().deleteSlotsBySubject(id);
      },
      reset: () => set({ subjects: [DEFAULT_SUBJECT] }),
    }),
    {
      name: 'studycommit-subjects',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─── Task Store ───────────────────────────────────────────────────────────────
interface TaskState {
  tasks: StudyTask[];
  toggleTaskDone: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  addTask: (task: StudyTask) => void;
  updateTask: (id: string, updatedFields: Partial<StudyTask>) => void;
  deleteTask: (id: string) => void;
  deleteTasksBySubject: (subjectId: string) => void;
  incrementTaskPomodoro: (id: string) => void;
  reset: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      toggleTaskDone: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: t.status === 'done' ? 'todo' : 'done',
                  completedAt: t.status !== 'done' ? new Date().toISOString() : undefined,
                  actualPomodoros: t.status !== 'done' ? Math.max(t.actualPomodoros, t.estimatedPomodoros) : t.actualPomodoros,
                }
              : t
          ),
        })),
      updateTaskStatus: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  completedAt: status === 'done' ? new Date().toISOString() : t.completedAt,
                }
              : t
          ),
        })),
      addTask: (task) =>
        set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (id, updatedFields) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updatedFields } : t
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      deleteTasksBySubject: (subjectId) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.subjectId !== subjectId),
        })),
      incrementTaskPomodoro: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === id) {
              const nextActual = t.actualPomodoros + 1;
              const reachedTarget = nextActual >= t.estimatedPomodoros;
              return {
                ...t,
                actualPomodoros: nextActual,
                status: reachedTarget ? 'done' : t.status,
                completedAt: reachedTarget ? new Date().toISOString() : t.completedAt,
              };
            }
            return t;
          }),
        })),
      reset: () => set({ tasks: [] }),
    }),
    {
      name: 'studycommit-tasks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─── Schedule Store ───────────────────────────────────────────────────────────
interface ScheduleState {
  slots: ScheduleSlot[];
  addSlot: (slot: ScheduleSlot) => void;
  updateSlot: (id: string, updatedFields: Partial<ScheduleSlot>) => void;
  deleteSlot: (id: string) => void;
  deleteSlotsBySubject: (subjectId: string) => void;
  reset: () => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      slots: [],
      addSlot: (slot) =>
        set((state) => ({ slots: [...state.slots, slot] })),
      updateSlot: (id, updatedFields) =>
        set((state) => ({
          slots: state.slots.map((s) =>
            s.id === id ? { ...s, ...updatedFields } : s
          ),
        })),
      deleteSlot: (id) =>
        set((state) => ({
          slots: state.slots.filter((s) => s.id !== id),
        })),
      deleteSlotsBySubject: (subjectId) =>
        set((state) => ({
          slots: state.slots.filter((s) => s.subjectId !== subjectId),
        })),
      reset: () => set({ slots: [] }),
    }),
    {
      name: 'studycommit-schedule',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─── Focus Store ──────────────────────────────────────────────────────────────
export interface ActivePomodoroSession {
  subjectId: string;
  taskId?: string;
  mode: 'pomodoro' | 'short_break' | 'long_break';
  timeLeft: number;    // giây
  totalSeconds: number;
  startedAt: string;  // ISO datetime
}

interface FocusState {
  sessions: FocusSession[];
  points: PointTransaction[];
  totalPoints: number;
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  activeSubjectId: string | null;
  activeTaskId: string | null;
  unlockedMusicIds: string[];
  // Abandon tracking
  abandonLogs: AbandonLog[];
  activeSession: ActivePomodoroSession | null;
  // Tutorial tracking
  completedTutorialTabs: string[];
  tutorialActiveTab: string | null;
  tutorialActiveStep: number | null;
  hasCompletedOnboarding: boolean;

  addSession: (session: FocusSession) => void;
  addPoints: (tx: PointTransaction) => void;
  updateTimerSettings: (pomodoro: number, shortBreak: number, longBreak: number) => void;
  setActiveSubjectId: (id: string | null) => void;
  setActiveTaskId: (id: string | null) => void;
  unlockMusic: (id: string, cost: number, name: string) => boolean;
  logAbandon: (log: Omit<AbandonLog, 'id'>) => void;
  setActiveSession: (session: ActivePomodoroSession | null) => void;
  clearOldAbandonLogs: () => void;
  
  // Tutorial Actions
  startTutorial: (tabName: string) => void;
  nextTutorialStep: () => void;
  prevTutorialStep: () => void;
  skipTutorial: () => void;
  completeTutorial: (tabName: string) => void;
  completeOnboarding: () => void;
  resetTutorials: () => void;
  
  reset: () => void;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      sessions: [],
      points: [],
      totalPoints: 130,
      pomodoroDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      activeSubjectId: null,
      activeTaskId: null,
      unlockedMusicIds: ['m_lofi'],
      abandonLogs: [],
      activeSession: null,
      completedTutorialTabs: [],
      tutorialActiveTab: null,
      tutorialActiveStep: null,
      hasCompletedOnboarding: false,
      addSession: (session) =>
        set((state) => ({ sessions: [session, ...state.sessions] })),
      addPoints: (tx) =>
        set((state) => ({
          points: [tx, ...state.points],
          totalPoints: Math.max(0, state.totalPoints + tx.points),
        })),
      updateTimerSettings: (pomodoro, shortBreak, longBreak) =>
        set(() => ({
          pomodoroDuration: pomodoro,
          shortBreakDuration: shortBreak,
          longBreakDuration: longBreak,
        })),
      setActiveSubjectId: (id) => set({ activeSubjectId: id }),
      setActiveTaskId: (id) => set({ activeTaskId: id }),
      logAbandon: (log) =>
        set((state) => ({
          abandonLogs: [
            { ...log, id: `ab_${Date.now()}` },
            ...state.abandonLogs,
          ].slice(0, 100), // giữ tối đa 100 entries
        })),
      setActiveSession: (session) => set({ activeSession: session }),
      clearOldAbandonLogs: () => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        set((state) => ({
          abandonLogs: state.abandonLogs.filter(
            (l) => new Date(l.timestamp) >= cutoff
          ),
        }));
      },
      unlockMusic: (id, cost, name) => {
        const state = get();
        if (state.totalPoints < cost) return false;
        if (state.unlockedMusicIds.includes(id)) return false;
 
        const tx: PointTransaction = {
          id: `p_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          points: -cost,
          reason: 'music_unlocked',
          description: `Đổi nhạc: ${name}`,
        };
 
        set((state) => ({
          unlockedMusicIds: [...state.unlockedMusicIds, id],
          points: [tx, ...state.points],
          totalPoints: state.totalPoints - cost,
        }));
        return true;
      },
      startTutorial: (tabName) => {
        const state = get();
        if (state.completedTutorialTabs.includes(tabName)) return;
        set({ tutorialActiveTab: tabName, tutorialActiveStep: 1 });
      },
      nextTutorialStep: () => {
        const { tutorialActiveTab, tutorialActiveStep } = get();
        if (tutorialActiveTab && tutorialActiveStep !== null) {
          const maxSteps: Record<string, number> = {
            Today: 2,
            Tasks: 2,
            Timetable: 2,
            Focus: 3,
            Profile: 2,
          };
          const max = maxSteps[tutorialActiveTab] || 1;
          if (tutorialActiveStep >= max) {
            get().completeTutorial(tutorialActiveTab);
          } else {
            set({ tutorialActiveStep: tutorialActiveStep + 1 });
          }
        }
      },
      prevTutorialStep: () => {
        set((state) => ({
          tutorialActiveStep: state.tutorialActiveStep !== null ? Math.max(1, state.tutorialActiveStep - 1) : null,
        }));
      },
      skipTutorial: () => {
        const tab = get().tutorialActiveTab;
        if (tab) {
          set((state) => ({
            completedTutorialTabs: state.completedTutorialTabs.includes(tab)
              ? state.completedTutorialTabs
              : [...state.completedTutorialTabs, tab],
            tutorialActiveTab: null,
            tutorialActiveStep: null,
          }));
        } else {
          set({ tutorialActiveTab: null, tutorialActiveStep: null });
        }
      },
      completeTutorial: (tabName) => {
        set((state) => ({
          completedTutorialTabs: state.completedTutorialTabs.includes(tabName)
            ? state.completedTutorialTabs
            : [...state.completedTutorialTabs, tabName],
          tutorialActiveTab: null,
          tutorialActiveStep: null,
        }));
      },
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetTutorials: () => set({ completedTutorialTabs: [], tutorialActiveTab: null, tutorialActiveStep: null, hasCompletedOnboarding: false }),
      reset: () => set({ sessions: [], points: [], totalPoints: 130, activeSubjectId: null, activeTaskId: null, unlockedMusicIds: ['m_lofi'], abandonLogs: [], activeSession: null, completedTutorialTabs: [], tutorialActiveTab: null, tutorialActiveStep: null, hasCompletedOnboarding: false }),
    }),
    {
      name: 'studycommit-focus',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
