import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { Flame, CheckCircle2, Target, TrendingUp, Calendar } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function StatsPage() {
  const { tasks, habits } = useStore();

  const stats = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekDays = eachDayOfInterval({ start: weekStart, end: today });

    // Calculate completed tasks per day this week
    const weeklyData = weekDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(t => 
        t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === dateStr
      );
      return {
        day: format(day, 'EEE'),
        completed: dayTasks.length,
      };
    });

    // Total tasks completed
    const totalCompleted = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.filter(t => !t.deleted).length;

    // Current streak (simplified: count consecutive days with completed tasks)
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = format(subDays(today, i), 'yyyy-MM-dd');
      const hasCompletedTasks = tasks.some(t => 
        t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === checkDate
      );
      if (hasCompletedTasks) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Best stage (most completed tasks)
    const stageStats = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(stage => ({
      stage,
      completed: tasks.filter(t => t.stage === stage && t.completed).length,
    }));
    const bestStage = stageStats.reduce((a, b) => a.completed > b.completed ? a : b);

    // Max for chart scaling
    const maxDaily = Math.max(...weeklyData.map(d => d.completed), 1);

    return {
      weeklyData,
      totalCompleted,
      totalTasks,
      streak,
      bestStage: bestStage.stage,
      habitsActive: habits.length,
      maxDaily,
    };
  }, [tasks, habits]);

  const statCards = [
    {
      icon: CheckCircle2,
      label: 'Tasks Completed',
      value: stats.totalCompleted,
      subtext: `of ${stats.totalTasks} total`,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: stats.streak,
      subtext: 'days',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      icon: Target,
      label: 'Best Stage',
      value: stats.bestStage.charAt(0).toUpperCase() + stats.bestStage.slice(1),
      subtext: 'most productive',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Active Habits',
      value: stats.habitsActive,
      subtext: 'tracking',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Statistics</h1>
          <p className="text-muted-foreground">
            Track your productivity and progress over time
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl p-4 border border-border/50"
            >
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', stat.bg)}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.subtext}</div>
              <div className="text-sm font-medium mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-6 border border-border/50"
        >
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={20} className="text-muted-foreground" />
            <h2 className="font-semibold">This Week</h2>
          </div>

          <div className="flex items-end justify-between gap-2 h-40">
            {stats.weeklyData.map((day, index) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.completed / stats.maxDaily) * 100}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                  className={cn(
                    'w-full rounded-t-lg min-h-[4px]',
                    day.completed > 0 ? 'bg-primary' : 'bg-secondary'
                  )}
                  style={{ maxHeight: '100%' }}
                />
                <span className="text-xs text-muted-foreground">{day.day}</span>
                <span className="text-xs font-medium">{day.completed}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
