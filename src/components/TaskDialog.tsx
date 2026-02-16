import { useState, useEffect } from 'react';
import { format, addMinutes } from 'date-fns';
import { Stage, Priority, Task, Recurrence } from '@/lib/types';
import { useStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: Stage;
  task: Task | null;
  prefillStartAt?: string;
  prefillEndAt?: string;
  prefillAllDay?: boolean;
}

const STAGES: { id: Stage; label: string }[] = [
  { id: 'fajr', label: 'Fajr' },
  { id: 'dhuhr', label: 'Dhuhr' },
  { id: 'asr', label: 'Asr' },
  { id: 'maghrib', label: 'Maghrib' },
  { id: 'isha', label: 'Isha' },
];

const DURATIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

export function TaskDialog({
  open,
  onOpenChange,
  stage,
  task,
  prefillStartAt,
  prefillEndAt,
  prefillAllDay,
}: TaskDialogProps) {
  const { addTask, updateTask, updateTaskSchedule } = useStore();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [selectedStage, setSelectedStage] = useState<Stage>(stage);

  // Schedule fields
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);

  // Populate form when editing or opening
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes || '');
      setPriority(task.priority);
      setDuration(task.duration);
      setSelectedStage(task.stage);

      if (task.startAt) {
        const start = new Date(task.startAt);
        setScheduleDate(start);
        setStartTime(format(start, 'HH:mm'));
        if (task.endAt) {
          setEndTime(format(new Date(task.endAt), 'HH:mm'));
        } else {
          setEndTime('');
        }
        setAllDay(task.allDay || false);
      } else if (task.dueDate) {
        setScheduleDate(new Date(task.dueDate + 'T00:00:00'));
        setStartTime('');
        setEndTime('');
        setAllDay(true);
      } else {
        setScheduleDate(undefined);
        setStartTime('');
        setEndTime('');
        setAllDay(false);
      }
    } else {
      setTitle('');
      setNotes('');
      setPriority('medium');
      setDuration(undefined);
      setSelectedStage(stage);

      // Handle prefill from calendar
      if (prefillStartAt) {
        const start = new Date(prefillStartAt);
        setScheduleDate(start);
        setAllDay(prefillAllDay || false);
        if (!prefillAllDay) {
          setStartTime(format(start, 'HH:mm'));
          if (prefillEndAt) {
            setEndTime(format(new Date(prefillEndAt), 'HH:mm'));
          } else {
            setEndTime(format(addMinutes(start, 30), 'HH:mm'));
          }
        } else {
          setStartTime('');
          setEndTime('');
        }
      } else {
        setScheduleDate(undefined);
        setStartTime('');
        setEndTime('');
        setAllDay(false);
      }
    }
  }, [task, stage, open, prefillStartAt, prefillEndAt, prefillAllDay]);

  const buildScheduleDates = () => {
    if (!scheduleDate) return { startAt: undefined, endAt: undefined, allDay: false, dueDate: undefined };

    if (allDay) {
      const dateStr = format(scheduleDate, 'yyyy-MM-dd');
      return {
        startAt: new Date(dateStr + 'T00:00:00').toISOString(),
        endAt: new Date(dateStr + 'T23:59:59').toISOString(),
        allDay: true,
        dueDate: dateStr,
      };
    }

    const dateStr = format(scheduleDate, 'yyyy-MM-dd');
    let startAt: string | undefined;
    let endAt: string | undefined;

    if (startTime) {
      startAt = new Date(`${dateStr}T${startTime}:00`).toISOString();
      if (endTime) {
        endAt = new Date(`${dateStr}T${endTime}:00`).toISOString();
        // Validate endAt > startAt
        if (new Date(endAt) <= new Date(startAt)) {
          endAt = addMinutes(new Date(startAt), 30).toISOString();
        }
      } else {
        endAt = addMinutes(new Date(startAt), duration || 30).toISOString();
      }
    }

    return { startAt, endAt, allDay: false, dueDate: undefined };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const schedule = buildScheduleDates();

    if (task) {
      updateTask(task.id, {
        title: title.trim(),
        notes: notes.trim() || undefined,
        priority,
        duration,
        stage: selectedStage,
        startAt: schedule.startAt,
        endAt: schedule.endAt,
        allDay: schedule.allDay,
        dueDate: schedule.dueDate,
        date: scheduleDate ? format(scheduleDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      });
    } else {
      addTask({
        title: title.trim(),
        notes: notes.trim() || undefined,
        priority,
        duration,
        stage: selectedStage,
        completed: false,
        startAt: schedule.startAt,
        endAt: schedule.endAt,
        allDay: schedule.allDay,
        dueDate: schedule.dueDate,
        date: scheduleDate ? format(scheduleDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      });
    }

    onOpenChange(false);
  };

  const clearSchedule = () => {
    setScheduleDate(undefined);
    setStartTime('');
    setEndTime('');
    setAllDay(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          {/* Stage & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select value={selectedStage} onValueChange={(v) => setSelectedStage(v as Stage)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration (optional)</Label>
            <Select
              value={duration?.toString() || ''}
              onValueChange={(v) => setDuration(v ? parseInt(v) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estimate time" />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value.toString()}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Schedule Section */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Schedule (optional)</Label>
              {scheduleDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground"
                  onClick={clearSchedule}
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Date picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !scheduleDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduleDate ? format(scheduleDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduleDate}
                  onSelect={setScheduleDate}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>

            {scheduleDate && (
              <>
                {/* All-day toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm">All day</Label>
                  <Switch checked={allDay} onCheckedChange={setAllDay} />
                </div>

                {/* Time inputs */}
                {!allDay && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Start time</Label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">End time</Label>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {task ? 'Save Changes' : 'Add Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
