import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject, StudyTask, FocusSession, PointTransaction, ScheduleSlot, TaskStatus, AbandonLog, AbandonReason } from '../types';
import { supabase } from '../lib/supabase';

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
      addSubject: async (subject) => {
        set((state) => ({ subjects: [...state.subjects, subject] }));
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('subjects').insert({
              id: subject.id,
              user_id: user.id,
              name: subject.name,
              short_name: subject.shortName,
              color: subject.color,
              target_hours: subject.targetHours,
            });
          }
        } catch (e) {
          console.error('Error adding subject to Supabase:', e);
        }
      },
      updateSubject: async (id, updatedFields) => {
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === id ? { ...s, ...updatedFields } : s
          ),
        }));
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('subjects').update({
              name: updatedFields.name,
              short_name: updatedFields.shortName,
              color: updatedFields.color,
              target_hours: updatedFields.targetHours,
            }).eq('id', id);
          }
        } catch (e) {
          console.error('Error updating subject in Supabase:', e);
        }
      },
      deleteSubject: async (id) => {
        if (id === 's_general') return;
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
        }));
        useTaskStore.getState().deleteTasksBySubject(id);
        useScheduleStore.getState().deleteSlotsBySubject(id);
        
        // Chuyển các session và log bỏ dở liên quan sang môn học mặc định "s_general" để bảo toàn lịch sử học tập
        const focusStore = useFocusStore.getState();
        const updatedSessions = (focusStore.sessions || []).map((sess) =>
          sess.subjectId === id ? { ...sess, subjectId: 's_general' } : sess
        );
        const updatedAbandonLogs = (focusStore.abandonLogs || []).map((log) =>
          log.subjectId === id ? { ...log, subjectId: 's_general' } : log
        );
        useFocusStore.setState({
          sessions: updatedSessions,
          abandonLogs: updatedAbandonLogs,
        });

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('subjects').delete().eq('id', id);
          }
        } catch (e) {
          console.error('Error deleting subject from Supabase:', e);
        }
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
      toggleTaskDone: async (id) => {
        let newStatus = 'todo';
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === id) {
              newStatus = t.status === 'done' ? 'todo' : 'done';
              return {
                ...t,
                status: newStatus as TaskStatus,
                completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
                actualPomodoros: newStatus === 'done' ? Math.max(t.actualPomodoros, t.estimatedPomodoros) : t.actualPomodoros,
              };
            }
            return t;
          }),
        }));
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('tasks').update({ 
              status: newStatus,
              completed_at: newStatus === 'done' ? new Date().toISOString() : null
            }).eq('id', id);
          }
        } catch (e) {
          console.error('Error toggling task in Supabase:', e);
        }
      },
      updateTaskStatus: async (id, status) => {
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
        }));
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('tasks').update({ 
              status: status,
              completed_at: status === 'done' ? new Date().toISOString() : null
            }).eq('id', id);
          }
        } catch (e) {
          console.error('Error updating task status in Supabase:', e);
        }
      },
      addTask: async (task) => {
        set((state) => ({ tasks: [task, ...state.tasks] }));
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('tasks').insert({
              id: task.id,
              user_id: user.id,
              subject_id: task.subjectId,
              title: task.title,
              status: task.status,
              due_date: task.dueDate || null,
            });
          }
        } catch(e) {
          console.error('Error adding task to Supabase:', e);
        }
      },
      updateTask: async (id, updatedFields) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updatedFields } : t
          ),
        }));
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Chỉ sync các trường có trong schema Supabase
            const updateData: Record<string, any> = {};
            if (updatedFields.title !== undefined) updateData.title = updatedFields.title;
            if (updatedFields.subjectId !== undefined) updateData.subject_id = updatedFields.subjectId;
            if (updatedFields.dueDate !== undefined) updateData.due_date = updatedFields.dueDate;
            if (updatedFields.status !== undefined) updateData.status = updatedFields.status;
            if (updatedFields.completedAt !== undefined) updateData.completed_at = updatedFields.completedAt ?? null;
            if (Object.keys(updateData).length > 0) {
              await supabase.from('tasks').update(updateData).eq('id', id);
            }
          }
        } catch (e) {
          console.error('Error updating task in Supabase:', e);
        }
      },
      deleteTask: async (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('tasks').delete().eq('id', id);
          }
        } catch (e) {
          console.error('Error deleting task from Supabase:', e);
        }
      },
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
  loadSlotsFromCloud: (userId: string) => Promise<void>;
  reset: () => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      slots: [],
      addSlot: async (slot) => {
        set((state) => ({ slots: [...state.slots, slot] }));
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('schedule_slots').insert({
              id: slot.id,
              user_id: user.id,
              subject_id: slot.subjectId,
              day_of_week: slot.dayOfWeek,
              start_time: slot.startTime,
              end_time: slot.endTime,
              room: slot.room ?? null,
              type: slot.type,
            });
          }
        } catch (e) {
          console.error('Error adding slot to Supabase:', e);
        }
      },
      updateSlot: async (id, updatedFields) => {
        set((state) => ({
          slots: state.slots.map((s) =>
            s.id === id ? { ...s, ...updatedFields } : s
          ),
        }));
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const updateData: Record<string, any> = {};
            if (updatedFields.subjectId !== undefined) updateData.subject_id = updatedFields.subjectId;
            if (updatedFields.dayOfWeek !== undefined) updateData.day_of_week = updatedFields.dayOfWeek;
            if (updatedFields.startTime !== undefined) updateData.start_time = updatedFields.startTime;
            if (updatedFields.endTime !== undefined) updateData.end_time = updatedFields.endTime;
            if ('room' in updatedFields) updateData.room = updatedFields.room ?? null;
            if (updatedFields.type !== undefined) updateData.type = updatedFields.type;
            if (Object.keys(updateData).length > 0) {
              await supabase.from('schedule_slots').update(updateData).eq('id', id);
            }
          }
        } catch (e) {
          console.error('Error updating slot in Supabase:', e);
        }
      },
      deleteSlot: async (id) => {
        set((state) => ({
          slots: state.slots.filter((s) => s.id !== id),
        }));
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('schedule_slots').delete().eq('id', id);
          }
        } catch (e) {
          console.error('Error deleting slot from Supabase:', e);
        }
      },
      deleteSlotsBySubject: async (subjectId) => {
        set((state) => ({
          slots: state.slots.filter((s) => s.subjectId !== subjectId),
        }));
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('schedule_slots').delete().eq('user_id', user.id).eq('subject_id', subjectId);
          }
        } catch (e) {
          console.error('Error deleting slots by subject from Supabase:', e);
        }
      },
      loadSlotsFromCloud: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('schedule_slots')
            .select('*')
            .eq('user_id', userId);
          if (error || !data) return;
          const slots: ScheduleSlot[] = data.map((row) => ({
            id: row.id,
            subjectId: row.subject_id,
            dayOfWeek: row.day_of_week as ScheduleSlot['dayOfWeek'],
            startTime: row.start_time,
            endTime: row.end_time,
            room: row.room ?? undefined,
            type: row.type as ScheduleSlot['type'],
          }));
          set({ slots });
        } catch (e) {
          console.error('Error loading slots from Supabase:', e);
        }
      },
      reset: () => set({ slots: [] }),
    }),
    {
      name: 'studycommit-schedule',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─── Focus Store ──────────────────────────────────────────────────────────────
interface OnboardingProgress {
  hasCompletedOnboarding: boolean;
  hasSeenNewUserGuidePrompt: boolean;
  completedTutorialTabs: string[];
}

const GUEST_ONBOARDING_USER_ID = '__guest__';

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
  onboardingByUser: Record<string, OnboardingProgress>;
  activeOnboardingUserId: string | null;
  completedTutorialTabs: string[];
  tutorialActiveTab: string | null;
  tutorialActiveStep: number | null;
  hasCompletedOnboarding: boolean;
  hasSeenNewUserGuidePrompt: boolean;

  addSession: (session: FocusSession) => void;
  addPoints: (tx: PointTransaction) => void;
  updateTimerSettings: (pomodoro: number, shortBreak: number, longBreak: number) => void;
  setActiveSubjectId: (id: string | null) => void;
  setActiveTaskId: (id: string | null) => void;
  unlockMusic: (id: string, cost: number, name: string) => boolean;
  logAbandon: (log: Omit<AbandonLog, 'id'>) => void;
  setActiveSession: (session: ActivePomodoroSession | null) => void;
  clearOldAbandonLogs: () => void;
  loadUserProfileFromCloud: (userId: string) => Promise<void>;
  
  // Tutorial Actions
  syncOnboardingForUser: (userId: string | null) => void;
  startTutorial: (tabName: string) => void;
  nextTutorialStep: () => void;
  prevTutorialStep: () => void;
  skipTutorial: () => void;
  completeTutorial: (tabName: string) => void;
  completeOnboarding: () => void;
  markNewUserGuideSeen: () => void;
  skipNewUserGuide: () => void;
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
      onboardingByUser: {},
      activeOnboardingUserId: GUEST_ONBOARDING_USER_ID,
      completedTutorialTabs: [],
      tutorialActiveTab: null,
      tutorialActiveStep: null,
      hasCompletedOnboarding: false,
      hasSeenNewUserGuidePrompt: false,
      addSession: async (session) => {
        set((state) => ({ sessions: [session, ...state.sessions] }));
        
        // Sync lên Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
             const startedAt = new Date(Date.now() - session.durationMinutes * 60000).toISOString();
             await supabase.from('focus_sessions').insert({
                id: session.id,
                user_id: user.id,
                subject_id: session.subjectId,
                task_id: session.taskId || null,
                started_at: startedAt,
                ended_at: new Date().toISOString(),
                duration_minutes: session.durationMinutes,
                completed: true,
             });
          }
        } catch(e) {
          console.error('Error adding focus session to Supabase:', e);
        }
      },
      addPoints: (tx) => {
        const newTotal = Math.max(0, useFocusStore.getState().totalPoints + tx.points);
        set((state) => ({
          points: [tx, ...state.points],
          totalPoints: Math.max(0, state.totalPoints + tx.points),
        }));
        // Fire-and-forget: đồng bộ điểm lên cloud
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase.from('user_profiles')
              .upsert({ id: user.id, total_points: newTotal, updated_at: new Date().toISOString() }, { onConflict: 'id' })
              .then(({ error }) => { if (error) console.error('Lỗi sync điểm:', error); });
          }
        }).catch(console.error);
      },
      updateTimerSettings: (pomodoro, shortBreak, longBreak) =>
        set(() => ({
          pomodoroDuration: pomodoro,
          shortBreakDuration: shortBreak,
          longBreakDuration: longBreak,
        })),
      setActiveSubjectId: (id) => set({ activeSubjectId: id }),
      setActiveTaskId: (id) => set({ activeTaskId: id }),
      logAbandon: async (log) => {
        const newLog = { ...log, id: `ab_${Date.now()}` };
        set((state) => ({
          abandonLogs: [newLog, ...state.abandonLogs].slice(0, 100),
        }));

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
             const startedAt = new Date(Date.now() - log.elapsedSeconds * 1000).toISOString();
             await supabase.from('focus_sessions').insert({
                id: newLog.id,
                user_id: user.id,
                subject_id: log.subjectId,
                task_id: log.taskId || null,
                started_at: startedAt,
                ended_at: new Date().toISOString(),
                duration_minutes: Math.round(log.totalSeconds / 60),
                completed: false,
                abandon_reason: log.reason
             });
          }
        } catch(e) {
          console.error('Error logging abandon to Supabase:', e);
        }
      },
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

        const newUnlockedIds = [...state.unlockedMusicIds, id];
        const newTotal = state.totalPoints - cost;

        set(() => ({
          unlockedMusicIds: newUnlockedIds,
          points: [tx, ...state.points],
          totalPoints: newTotal,
        }));

        // Fire-and-forget: đồng bộ nhạc mở khóa và điểm lên cloud
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase.from('user_profiles')
              .upsert({ id: user.id, total_points: newTotal, unlocked_music_ids: newUnlockedIds, updated_at: new Date().toISOString() }, { onConflict: 'id' })
              .then(({ error }) => { if (error) console.error('Lỗi sync nhạc:', error); });
          }
        }).catch(console.error);

        return true;
      },
      loadUserProfileFromCloud: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('total_points, unlocked_music_ids')
            .eq('id', userId)
            .single();
          if (error || !data) return;
          set({
            totalPoints: data.total_points,
            unlockedMusicIds: data.unlocked_music_ids ?? ['m_lofi'],
          });
        } catch (e) {
          console.error('Error loading user profile from Supabase:', e);
        }
      },
      syncOnboardingForUser: (userId) => {
        const state = get();
        const currentUserId = state.activeOnboardingUserId ?? GUEST_ONBOARDING_USER_ID;
        const nextUserId = userId ?? GUEST_ONBOARDING_USER_ID;
        if (currentUserId === nextUserId) return;

        const onboardingByUser = {
          ...state.onboardingByUser,
          [currentUserId]: {
            hasCompletedOnboarding: state.hasCompletedOnboarding,
            hasSeenNewUserGuidePrompt: state.hasSeenNewUserGuidePrompt,
            completedTutorialTabs: state.completedTutorialTabs,
          },
        };
        const nextProgress = onboardingByUser[nextUserId] ?? {
          hasCompletedOnboarding: state.hasCompletedOnboarding,
          hasSeenNewUserGuidePrompt: false,
          completedTutorialTabs: [],
        };

        set({
          onboardingByUser,
          activeOnboardingUserId: nextUserId,
          hasCompletedOnboarding: nextProgress.hasCompletedOnboarding,
          hasSeenNewUserGuidePrompt: nextProgress.hasSeenNewUserGuidePrompt,
          completedTutorialTabs: nextProgress.completedTutorialTabs,
          tutorialActiveTab: null,
          tutorialActiveStep: null,
        });
      },
      startTutorial: (tabName) => {
        const state = get();
        if (state.completedTutorialTabs.includes(tabName)) return;
        // Tab không có tutorial → đánh dấu hoàn thành ngay lập tức
        const noTutorialTabs = ['Stats'];
        if (noTutorialTabs.includes(tabName)) {
          set((s) => ({
            completedTutorialTabs: [...s.completedTutorialTabs, tabName],
          }));
          return;
        }
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
      markNewUserGuideSeen: () => set({ hasSeenNewUserGuidePrompt: true }),
      skipNewUserGuide: () => set({
        hasSeenNewUserGuidePrompt: true,
        completedTutorialTabs: ['Today', 'Timetable', 'Tasks', 'Focus', 'Stats', 'Profile'],
        tutorialActiveTab: null,
        tutorialActiveStep: null,
      }),
      resetTutorials: () => set((state) => ({
        completedTutorialTabs: [],
        tutorialActiveTab: null,
        tutorialActiveStep: null,
        hasCompletedOnboarding: false,
        hasSeenNewUserGuidePrompt: false,
        onboardingByUser: {
          ...state.onboardingByUser,
          [state.activeOnboardingUserId ?? GUEST_ONBOARDING_USER_ID]: {
            hasCompletedOnboarding: false,
            hasSeenNewUserGuidePrompt: false,
            completedTutorialTabs: [],
          },
        },
      })),
      reset: () => set({ sessions: [], points: [], totalPoints: 130, activeSubjectId: null, activeTaskId: null, unlockedMusicIds: ['m_lofi'], abandonLogs: [], activeSession: null, onboardingByUser: {}, activeOnboardingUserId: GUEST_ONBOARDING_USER_ID, completedTutorialTabs: [], tutorialActiveTab: null, tutorialActiveStep: null, hasCompletedOnboarding: false, hasSeenNewUserGuidePrompt: false }),
    }),
    {
      name: 'studycommit-focus',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
