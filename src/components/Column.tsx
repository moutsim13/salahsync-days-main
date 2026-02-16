import { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Plus, Clock } from 'lucide-react';
import { Stage, Task } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface ColumnProps {
  stage: Stage;
  label: string;
  time: string;
  tasks: Task[];
  isCurrentStage: boolean;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

export function Column({
  stage,
  label,
  time,
  tasks,
  isCurrentStage,
  onAddTask,
  onEditTask,
}: ColumnProps) {
  const { reorderTasks, moveTask } = useStore();
  const [isDragOver, setIsDragOver] = useState(false);

  const completedCount = tasks.filter(t => t.completed).length;

  const handleReorder = (newOrder: Task[]) => {
    reorderTasks(stage, newOrder.map(t => t.id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      moveTask(taskId, stage, tasks.length);
    }
  };

  return (
    <div
      className={cn(
        `stage-column stage-${stage} h-full flex flex-col`,
        isCurrentStage && 'ring-2 ring-primary/30',
        isDragOver && 'ring-2 ring-primary/50 bg-primary/5'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full stage-dot-${stage}`} />
          <h3 className={`font-semibold stage-text-${stage}`}>{label}</h3>
          {isCurrentStage && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded"
            >
              NOW
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>{time}</span>
        </div>
      </div>

      {/* Task Counter */}
      <div className="text-xs text-muted-foreground mb-3">
        {completedCount}/{tasks.length} completed
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 min-h-[200px]">
        <Reorder.Group
          axis="y"
          values={tasks}
          onReorder={handleReorder}
          className="space-y-2"
        >
          <AnimatePresence>
            {tasks.map((task) => (
              <Reorder.Item
                key={task.id}
                value={task}
                className="cursor-grab active:cursor-grabbing"
              >
                <TaskCard
                  task={task}
                  onEdit={() => onEditTask(task)}
                />
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">No tasks yet</p>
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddTask}
        className="w-full mt-3 justify-start gap-2 text-muted-foreground hover:text-foreground"
      >
        <Plus size={16} />
        Add task
      </Button>
    </div>
  );
}
