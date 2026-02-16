import { motion } from 'framer-motion';
import { MoreHorizontal, Clock, Flag, Trash2, Edit3 } from 'lucide-react';
import { Task, Priority } from '@/lib/types';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
}

const priorityConfig: Record<Priority, { label: string; class: string }> = {
  high: { label: 'High', class: 'priority-high' },
  medium: { label: 'Medium', class: 'priority-medium' },
  low: { label: 'Low', class: 'priority-low' },
};

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { toggleTaskComplete, deleteTask } = useStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        'task-card group',
        task.completed && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => toggleTaskComplete(task.id)}
          className="mt-0.5"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium leading-tight',
            task.completed && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </p>
          
          {task.notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.notes}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 mt-2">
            {task.priority !== 'low' && (
              <span className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
                priorityConfig[task.priority].class
              )}>
                <Flag size={10} />
                {priorityConfig[task.priority].label}
              </span>
            )}
            
            {task.duration && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock size={10} />
                {task.duration}m
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-secondary transition-opacity">
              <MoreHorizontal size={14} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onEdit}>
              <Edit3 size={14} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => deleteTask(task.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 size={14} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
