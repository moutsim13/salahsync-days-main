import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Trash2, RotateCcw } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function CompletedPage() {
  const { tasks, toggleTaskComplete } = useStore();

  const completedTasks = useMemo(() => {
    return tasks
      .filter(t => t.completed && !t.deleted)
      .sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [tasks]);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 size={24} className="text-primary" />
            <h1 className="text-2xl font-semibold">Completed</h1>
          </div>
          <p className="text-muted-foreground">
            {completedTasks.length} completed tasks
          </p>
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {completedTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} className="text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No completed tasks</h3>
              <p className="text-sm text-muted-foreground">
                Completed tasks will appear here
              </p>
            </div>
          ) : (
            completedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border/50 group"
              >
                <CheckCircle2 size={20} className="text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-through text-muted-foreground truncate">
                    {task.title}
                  </p>
                  {task.completedAt && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Completed {format(new Date(task.completedAt), 'MMM d, h:mm a')}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleTaskComplete(task.id)}
                  className="opacity-0 group-hover:opacity-100 h-8 w-8"
                >
                  <RotateCcw size={14} />
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
