import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Habit, TaskList, Tag, Settings, Stage, Priority, Recurrence } from './types';
import { getLocalDateKey } from './utils';

interface WaqtStore {
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'order' | 'deleted' | 'tags'> & { tags?: string[] }) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  restoreTask: (id: string) => void;
  permanentlyDeleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  moveTask: (id: string, stage: Stage, newOrder: number) => void;
  reorderTasks: (stage: Stage, taskIds: string[]) => void;
  updateTaskSchedule: (id: string, startAt?: string, endAt?: string, allDay?: boolean) => void;
  
  // Habits
  habits: Habit[];
  addHabit: (title: string, icon?: string) => void;
  toggleHabitComplete: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;
  
  // Lists
  lists: TaskList[];
  addList: (name: string, color: string) => void;
  deleteList: (id: string) => void;
  
  // Tags
  tags: Tag[];
  addTag: (name: string, color: string) => void;
  deleteTag: (id: string) => void;
  
  // Settings
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  
  // UI State
  focusMode: boolean;
  toggleFocusMode: () => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useStore = create<WaqtStore>()(
  persist(
    (set, get) => ({
      // Tasks
      tasks: [],
      
      addTask: (taskData) => {
        const stageTasks = get().tasks.filter(t => t.stage === taskData.stage && !t.deleted);
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          order: stageTasks.length,
          deleted: false,
          tags: taskData.tags || [],
          date: taskData.date || getLocalDateKey(),
        };
        set(state => ({ tasks: [...state.tasks, newTask] }));
      },
      
      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(t => 
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },
      
      deleteTask: (id) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id ? { ...t, deleted: true, deletedAt: new Date().toISOString() } : t
          ),
        }));
      },
      
      restoreTask: (id) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id ? { ...t, deleted: false, deletedAt: undefined } : t
          ),
        }));
      },
      
      permanentlyDeleteTask: (id) => {
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== id),
        }));
      },
      
      toggleTaskComplete: (id) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id 
              ? { 
                  ...t, 
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString() : undefined
                } 
              : t
          ),
        }));
      },
      
      moveTask: (id, stage, newOrder) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id ? { ...t, stage, order: newOrder } : t
          ),
        }));
      },
      
      reorderTasks: (stage, taskIds) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.stage === stage && !t.deleted) {
              const newOrder = taskIds.indexOf(t.id);
              return newOrder >= 0 ? { ...t, order: newOrder } : t;
            }
            return t;
          }),
        }));
      },

      updateTaskSchedule: (id, startAt, endAt, allDay) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id
              ? {
                  ...t,
                  startAt,
                  endAt,
                  allDay,
                  dueDate: allDay && startAt ? startAt.split('T')[0] : t.dueDate,
                }
              : t
          ),
        }));
      },

      // Habits
      habits: [],
      
      addHabit: (title, icon) => {
        const newHabit: Habit = {
          id: generateId(),
          title,
          icon,
          streak: 0,
          completions: {},
          createdAt: new Date().toISOString(),
        };
        set(state => ({ habits: [...state.habits, newHabit] }));
      },
      
      toggleHabitComplete: (id, date) => {
        set(state => ({
          habits: state.habits.map(h => {
            if (h.id !== id) return h;
            
            // Toggle completion
            const newCompletions = { ...h.completions };
            if (newCompletions[date]) {
              delete newCompletions[date];
            } else {
              newCompletions[date] = true;
            }
            
            // Calculate streak
            // Count consecutive days up to today (or yesterday if today is not done yet)
            let streak = 0;
            const today = new Date();
            // We check up to 365 days back
            let currentCheckDate = new Date(today);
            
            // If today is completed, streak includes today.
            // If today is NOT completed, check if yesterday was completed to decide if streak flows.
            // Actually, typical streak logic:
            // "Current streak is the number of consecutive days ending yesterday OR today."
            // If I did it today -> Streak + 1
            // If I didn't do it today but did yesterday -> Streak is whatever it was yesterday.
            // If I missed yesterday -> Streak is 0 (unless I do it today, then 1).
            
            // Let's count backwards from today.
            const todayStr = currentCheckDate.toISOString().split('T')[0];
            
            // Check if today is done
            if (newCompletions[todayStr]) {
              streak++;
              // continue checking backwards from yesterday
            } else {
               // If today is not done, we check yesterday. 
               // If yesterday is NOT done, streak is 0.
               // If yesterday IS done, we start counting from yesterday.
            }

            // Simplified approach: iterate backwards from today
            // If today is checked, count it. If not, don't count it BUT don't break yet if it's just today missing (unless we strictly want "current streak" to include today only if done? 
            // Usually apps show "Current Streak: 5" if you did yesterday. If you do today it becomes 6.
            
            // Let's try this loop:
            let counting = true;
            let tempStreak = 0;
            
            // Check today first
            const todayKey = today.toISOString().split('T')[0];
            if (newCompletions[todayKey]) {
              tempStreak++;
            }
            
            // Check previous days
            for (let i = 1; i < 365; i++) {
              const prevDate = new Date(today);
              prevDate.setDate(prevDate.getDate() - i);
              const dateKey = prevDate.toISOString().split('T')[0];
              
              if (newCompletions[dateKey]) {
                tempStreak++;
              } else {
                // If we missed a day...
                // But wait, if we haven't done TODAY yet, we shouldn't break streak from yesterday.
                // If we missed TODAY (and it's already tomorrow?) - no we are calculating relative to real-time today.
                
                // Case 1: Done today (X), Done yesterday (X) -> Streak 2
                // Case 2: Not done today (_), Done yesterday (X) -> Streak 1
                // Case 3: Not done today (_), Not done yesterday (_) -> Streak 0
                
                // So if i=0 (today) was missing, we don't break immediately? 
                // We should break if we find a gap.
                
                // Let's refine:
                // If today is present: valid.
                // If today is missing: valid ONLY if it's the very first check (i.e. we are just carrying over from yesterday).
                // BUT if we are at i=1 (yesterday) and it's missing, then streak breaks (unless today was present? no, if yesterday missing, accumulation stops).
                
                if (i === 1 && !newCompletions[todayKey]) {
                   // Today is missing, but yesterday is present (checked in this if block logic? no, this else block means missing).
                   // Actually, if we are in this ELSE block, it means `dateKey` is missing.
                   // If `dateKey` is yesterday (i=1) and it is missing, then streak is definitely broken (regardless of today). 
                   break;
                } else if (i > 1 && !newCompletions[dateKey]) {
                   break;
                }
                 
                 // Wait, simpler logic:
                 // 1. Calculate streak ending yesterday.
                 // 2. If today is done, add 1.
                 // 3. If today is not done, show yesterday's streak.
                 // EXCEPTION: If yesterday was NOT done, then streak is 0 (unless today is done, then 1).
              }
            }
            
            // Let's use the simpler robust logic:
            // Find the most recent continuous block of completed days ending on Today OR Yesterday.
            
            let s = 0;
            const t = new Date();
            const tStr = t.toISOString().split('T')[0];
            
            if (newCompletions[tStr]) {
                s++;
                // Count backwards from yesterday
                for (let i = 1; i <= 365; i++) {
                    const d = new Date(t);
                    d.setDate(d.getDate() - i);
                    const dStr = d.toISOString().split('T')[0];
                    if (newCompletions[dStr]) s++;
                    else break;
                }
            } else {
                // Today not done. Check yesterday.
                for (let i = 1; i <= 365; i++) {
                    const d = new Date(t);
                    d.setDate(d.getDate() - i);
                    const dStr = d.toISOString().split('T')[0];
                    if (newCompletions[dStr]) s++;
                    else break;
                }
            }
            
            streak = s;
            
            return { ...h, completions: newCompletions, streak };
          }),
        }));
      },
      
      deleteHabit: (id) => {
        set(state => ({
          habits: state.habits.filter(h => h.id !== id),
        }));
      },
      
      // Lists
      lists: [
        { id: 'inbox', name: 'Inbox', color: '#6B7280' },
      ],
      
      addList: (name, color) => {
        const newList: TaskList = {
          id: generateId(),
          name,
          color,
        };
        set(state => ({ lists: [...state.lists, newList] }));
      },
      
      deleteList: (id) => {
        if (id === 'inbox') return;
        set(state => ({
          lists: state.lists.filter(l => l.id !== id),
        }));
      },
      
      // Tags
      tags: [],
      
      addTag: (name, color) => {
        const newTag: Tag = {
          id: generateId(),
          name,
          color,
        };
        set(state => ({ tags: [...state.tags, newTag] }));
      },
      
      deleteTag: (id) => {
        set(state => ({
          tags: state.tags.filter(t => t.id !== id),
        }));
      },
      
      // Settings
      settings: {
        location: null,
        calculationMethod: 'MWL',
        theme: 'light',
        focusMode: false,
        showHijriDate: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      
      updateSettings: (updates) => {
        set(state => ({
          settings: { ...state.settings, ...updates },
        }));
      },
      
      // UI State
      focusMode: false,
      toggleFocusMode: () => set(state => ({ focusMode: !state.focusMode })),
      selectedTaskId: null,
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
    }),
    {
      name: 'waqt-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migrate habits from completedDates array to completions map
          if (persistedState.habits) {
            persistedState.habits = persistedState.habits.map((h: any) => ({
              ...h,
              completions: Array.isArray(h.completedDates) 
                ? h.completedDates.reduce((acc: any, date: string) => ({ ...acc, [date]: true }), {})
                : {},
              completedDates: undefined, // Remove old field
            }));
          }
        }
        return persistedState;
      },
    }
  )
);
