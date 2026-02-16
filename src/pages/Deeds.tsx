import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Flame, MoreVertical, Trash2 } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function DeedsPage() {
  const { habits, addHabit, toggleHabitComplete, deleteHabit } = useStore();
  const [newHabit, setNewHabit] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  // Calculate week days (Sat-Fri)
  const weekDays = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 6 }); // Saturday start
    return Array.from({ length: 7  }).map((_, i) => addDays(start, i));
  }, []);

  const handleAddHabit = () => {
    const trimmed = newHabit.trim();
    if (trimmed) {
      if (habits.some(h => h.title.toLowerCase() === trimmed.toLowerCase())) {
        return; // Prevent duplicates
      }
      addHabit(trimmed);
      setNewHabit('');
      setShowInput(false);
    }
  };

  const confirmDelete = () => {
    if (habitToDelete) {
      deleteHabit(habitToDelete);
      setHabitToDelete(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddHabit();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setNewHabit('');
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2 tracking-tight">Daily Deeds</h1>
          <p className="text-muted-foreground text-sm">
            Consistency is more beloved to Allah than intensity.
          </p>
        </div>

        {/* Weekly Grid Container */}
        <div className="bg-card rounded-2xl shadow-sm border border-border/40 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px] p-6">
              
              {/* Grid Header */}
              <div className="grid grid-cols-[200px_repeat(7,1fr)_80px] gap-4 mb-4 items-center">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-2">
                  HABIT
                </div>
                {weekDays.map((date) => {
                  const isCurrentDay = isToday(date);
                  return (
                    <div 
                      key={date.toString()} 
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-full w-10 h-10 transition-colors",
                        isCurrentDay ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                        {format(date, 'EEE')}
                      </span>
                      <span className={cn("text-sm font-semibold", isCurrentDay && "mt-0.5")}>
                        {format(date, 'd')}
                      </span>
                    </div>
                  );
                })}
                <div className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider">
                  Streak
                </div>
              </div>

              {/* Habits List */}
              <div className="space-y-1">
                <AnimatePresence initial={false}>
                  {habits.map((habit) => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="group grid grid-cols-[200px_repeat(7,1fr)_80px] gap-4 items-center py-3 px-2 rounded-xl hover:bg-muted/30 transition-colors"
                    >
                      {/* Habit Name */}
                      <div className="font-medium truncate pr-4 text-sm">
                        {habit.title}
                      </div>

                      {/* Checkboxes */}
                      {weekDays.map((date) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const isCompleted = habit.completions[dateStr];

                        return (
                          <div key={dateStr} className="flex justify-center">
                            <button
                              onClick={() => toggleHabitComplete(habit.id, dateStr)}
                              className={cn(
                                "relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ease-out",
                                isCompleted 
                                  ? "bg-primary text-primary-foreground shadow-sm scale-100" 
                                  : "bg-muted/50 text-transparent hover:bg-muted hover:scale-105 active:scale-95"
                              )}
                            >
                              <Check size={16} strokeWidth={3} className={cn("transition-all duration-200", isCompleted ? "scale-100 opacity-100" : "scale-50 opacity-0")} />
                            </button>
                          </div>
                        );
                      })}

                      {/* Streak */}
                      <div className="flex items-center justify-center gap-1">
                        <Flame 
                          size={16} 
                          className={cn(
                            "transition-colors", 
                            habit.streak > 0 ? "text-orange-500 fill-orange-500/20" : "text-muted-foreground/30"
                          )} 
                        />
                        <span className={cn(
                          "text-sm font-medium",
                          habit.streak > 0 ? "text-foreground" : "text-muted-foreground/50"
                        )}>
                          {habit.streak}
                        </span>
                      </div>
                      
                      {/* Actions Menu (Absolute positioned or appearing on hover) */}
                      <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => setHabitToDelete(habit.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Habit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {habits.length === 0 && !showInput && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Start building your daily consistency.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer / Add Habit */}
            <div className="border-t border-border/40 p-4 bg-muted/10">
              {showInput ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex max-w-md mx-auto gap-2"
                >
                  <Input
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="New habit name..."
                    autoFocus
                    className="bg-background"
                  />
                  <Button onClick={handleAddHabit} disabled={!newHabit.trim()}>
                    Add
                  </Button>
                  <Button variant="ghost" onClick={() => setShowInput(false)}>
                    Cancel
                  </Button>
                </motion.div>
              ) : (
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowInput(true)}
                    className="text-muted-foreground hover:text-primary gap-2"
                  >
                    <Plus size={16} />
                    Add Habit
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={!!habitToDelete} onOpenChange={(open) => !open && setHabitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this habit? This action cannot be undone and your streak will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
