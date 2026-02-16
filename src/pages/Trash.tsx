import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export function TrashPage() {
  const { tasks, restoreTask, permanentlyDeleteTask } = useStore();

  const deletedTasks = useMemo(() => {
    return tasks
      .filter(t => t.deleted)
      .sort((a, b) => {
        const dateA = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
        const dateB = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [tasks]);

  const handleEmptyTrash = () => {
    deletedTasks.forEach(task => permanentlyDeleteTask(task.id));
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trash2 size={24} className="text-muted-foreground" />
              <h1 className="text-2xl font-semibold">Trash</h1>
            </div>
            <p className="text-muted-foreground">
              {deletedTasks.length} deleted tasks
            </p>
          </div>
          {deletedTasks.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleEmptyTrash}>
              Empty Trash
            </Button>
          )}
        </div>

        {/* Warning */}
        {deletedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg mb-6"
          >
            <AlertTriangle size={18} />
            <p className="text-sm">
              Items in trash are stored locally and can be restored anytime.
            </p>
          </motion.div>
        )}

        {/* Task List */}
        <div className="space-y-2">
          {deletedTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">Trash is empty</h3>
              <p className="text-sm text-muted-foreground">
                Deleted tasks will appear here
              </p>
            </div>
          ) : (
            deletedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border/50 group"
              >
                <Trash2 size={18} className="text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground truncate">
                    {task.title}
                  </p>
                  {task.deletedAt && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Deleted {format(new Date(task.deletedAt), 'MMM d, h:mm a')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => restoreTask(task.id)}
                    className="h-8 w-8"
                  >
                    <RotateCcw size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => permanentlyDeleteTask(task.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
