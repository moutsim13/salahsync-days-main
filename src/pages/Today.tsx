import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { useStore } from '@/lib/store';
import { calculatePrayerTimes, getCurrentStage, formatTime } from '@/lib/prayer-times';
import { Checkbox } from '@/components/ui/checkbox';
import { cn, getLocalDateKey } from '@/lib/utils';
import { Stage } from '@/lib/types';

const STAGE_LABELS: Record<Stage, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export function TodayPage() {
  const { tasks, settings, toggleTaskComplete } = useStore();

  const today = new Date();
  const todayStr = getLocalDateKey(today);
  const latitude = settings.location?.latitude || 21.4225;
  const longitude = settings.location?.longitude || 39.8262;
  const prayerTimes = calculatePrayerTimes(today, latitude, longitude, settings.calculationMethod);
  const currentStage = getCurrentStage(prayerTimes);

  // Group tasks by stage — include tasks scheduled today or with dueDate today
  const tasksByStage = useMemo(() => {
    const activeTasks = tasks.filter(t => {
      if (t.deleted) return false;
      // Show only tasks for today
      return t.date === todayStr;
    });
    const stages: Stage[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    return stages.map(stage => {
      const stageTasks = activeTasks
        .filter(t => t.stage === stage)
        .sort((a, b) => {
          // Sort by scheduled time first, then by order
          if (a.startAt && b.startAt) {
            return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
          }
          if (a.startAt) return -1;
          if (b.startAt) return 1;
          return a.order - b.order;
        });

      const prayer = prayerTimes.find(p => p.name === stage);

      return {
        stage,
        label: STAGE_LABELS[stage],
        time: prayer ? formatTime(prayer.time) : '',
        tasks: stageTasks,
        isCurrentStage: stage === currentStage,
        completedCount: stageTasks.filter(t => t.completed).length,
      };
    });
  }, [tasks, prayerTimes, currentStage, todayStr]);

  const totalTasks = tasksByStage.reduce((sum, s) => sum + s.tasks.length, 0);
  const completedTasks = tasksByStage.reduce((sum, s) => sum + s.completedCount, 0);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6 pb-24 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={24} className="text-primary" />
            <h1 className="text-2xl font-semibold">Today</h1>
          </div>
          <p className="text-muted-foreground">
            {format(today, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 border border-border/50 mb-8"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Daily Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedTasks}/{totalTasks} tasks
            </span>
          </div>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
              className="h-full bg-primary rounded-full"
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Stage Sections */}
        <div className="space-y-6">
          {tasksByStage.map((stageData, stageIndex) => (
            <motion.div
              key={stageData.stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stageIndex * 0.08 }}
            >
              {/* Stage Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full stage-dot-${stageData.stage}`} />
                <h2 className={cn(
                  'font-semibold',
                  `stage-text-${stageData.stage}`
                )}>
                  {stageData.label}
                </h2>
                <span className="text-xs text-muted-foreground">{stageData.time}</span>
                {stageData.isCurrentStage && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded">
                    NOW
                  </span>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {stageData.completedCount}/{stageData.tasks.length}
                </span>
              </div>

              {/* Tasks */}
              {stageData.tasks.length > 0 ? (
                <div className="space-y-2 pl-5">
                  {stageData.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-start gap-3 p-3 bg-card rounded-lg border border-border/50',
                        task.completed && 'opacity-60'
                      )}
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskComplete(task.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium',
                          task.completed && 'line-through text-muted-foreground'
                        )}>
                          {task.title}
                        </p>
                        {/* Show scheduled time if present */}
                        {task.startAt && !task.allDay && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock size={10} className="text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground">
                              {format(new Date(task.startAt), 'h:mm a')}
                              {task.endAt && ` – ${format(new Date(task.endAt), 'h:mm a')}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground pl-5">No tasks</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
