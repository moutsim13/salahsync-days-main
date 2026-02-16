export type Priority = 'low' | 'medium' | 'high';
export type Stage = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  duration?: number; // minutes
  stage: Stage;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  order: number;
  listId?: string;
  tags: string[];
  deleted: boolean;
  deletedAt?: string;
  // Calendar scheduling fields
  startAt?: string;   // ISO datetime
  endAt?: string;      // ISO datetime
  allDay?: boolean;
  dueDate?: string;    // date-only string YYYY-MM-DD
  recurrence?: Recurrence;
  date: string; // YYYY-MM-DD
}

export interface Habit {
  id: string;
  title: string;
  icon?: string;
  streak: number;
  completions: Record<string, boolean>;
  createdAt: string;
}

export interface TaskList {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface PrayerTime {
  name: Stage;
  time: Date;
  label: string;
}

export interface Settings {
  location: {
    latitude: number;
    longitude: number;
    city: string;
  } | null;
  calculationMethod: string;
  theme: 'light' | 'dark' | 'system';
  focusMode: boolean;
  showHijriDate: boolean;
  timezone: string;
}

export interface DayStats {
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  habitsCompleted: number;
  habitsTotal: number;
}
