import { useState, useMemo, useEffect } from 'react';
import { getLocalDateKey } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Focus, LayoutGrid } from 'lucide-react';
import { Stage, Task } from '@/lib/types';
import { useStore } from '@/lib/store';
import { calculatePrayerTimes, formatTime, getCurrentStage } from '@/lib/prayer-times';
import { Column } from './Column';
import { TaskDialog } from './TaskDialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STAGES: { id: Stage; label: string }[] = [
  { id: 'fajr', label: 'Fajr' },
  { id: 'dhuhr', label: 'Dhuhr' },
  { id: 'asr', label: 'Asr' },
  { id: 'maghrib', label: 'Maghrib' },
  { id: 'isha', label: 'Isha' },
];

export function Board() {
  const { tasks, settings, focusMode, toggleFocusMode } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage>('fajr');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Get prayer times
  const today = new Date();
  const latitude = settings.location?.latitude || 21.4225;
  const longitude = settings.location?.longitude || 39.8262;
  const prayerTimes = calculatePrayerTimes(today, latitude, longitude, settings.calculationMethod);
  const currentStage = getCurrentStage(prayerTimes);

  // Auto-update date key for midnight refresh
  const [todayKey, setTodayKey] = useState(getLocalDateKey());

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newKey = getLocalDateKey();
      if (newKey !== todayKey) {
        setTodayKey(newKey);
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [todayKey]);

  // Get tasks by stage - Filter for TODAY only
  const tasksByStage = useMemo(() => {
    // strict date filtering
    const activeTasks = tasks.filter(t => !t.deleted && (t.date === todayKey));
    
    return STAGES.reduce((acc, stage) => {
      acc[stage.id] = activeTasks
        .filter(t => t.stage === stage.id)
        .sort((a, b) => a.order - b.order);
      return acc;
    }, {} as Record<Stage, Task[]>);
  }, [tasks, todayKey]);

  // Get prayer time for each stage
  const getPrayerTime = (stage: Stage) => {
    const prayer = prayerTimes.find(p => p.name === stage);
    return prayer ? formatTime(prayer.time) : '';
  };

  const handleAddTask = (stage: Stage) => {
    setSelectedStage(stage);
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedStage(task.stage);
    setDialogOpen(true);
  };

  const displayedStages = focusMode 
    ? STAGES.filter(s => s.id === currentStage)
    : STAGES;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Board Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Prayer Board</h1>
          <p className="text-sm text-muted-foreground">
            Organize your day around the 5 daily stages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={focusMode ? 'default' : 'outline'}
            size="sm"
            onClick={toggleFocusMode}
            className="gap-2"
          >
            {focusMode ? <LayoutGrid size={16} /> : <Focus size={16} />}
            {focusMode ? 'Show All' : 'Focus Mode'}
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className={cn(
          'flex gap-4 h-full',
          focusMode ? 'justify-center' : ''
        )}>
          <AnimatePresence mode="popLayout">
            {displayedStages.map((stage) => (
              <motion.div
                key={stage.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex-shrink-0',
                  focusMode ? 'w-[400px]' : 'w-[280px]'
                )}
              >
                <Column
                  stage={stage.id}
                  label={stage.label}
                  time={getPrayerTime(stage.id)}
                  tasks={tasksByStage[stage.id]}
                  isCurrentStage={stage.id === currentStage}
                  onAddTask={() => handleAddTask(stage.id)}
                  onEditTask={handleEditTask}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        stage={selectedStage}
        task={editingTask}
      />
    </div>
  );
}
