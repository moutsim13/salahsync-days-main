import { useMemo, useState, useCallback } from 'react';
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
  SlotInfo,
  Event as RBCEvent,
} from 'react-big-calendar';
import withDragAndDrop, {
  EventInteractionArgs,
} from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { Task, Stage } from '@/lib/types';
import { TaskDialog } from './TaskDialog';
import { cn } from '@/lib/utils';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(BigCalendar);

type CalendarFilter = 'all' | 'active' | 'completed';
type CalendarViewType = 'month' | 'week' | 'day';

interface CalendarEvent extends RBCEvent {
  id: string;
  task: Task;
}

const STAGE_COLORS: Record<Stage, string> = {
  fajr: 'hsl(215, 70%, 55%)',
  dhuhr: 'hsl(45, 85%, 52%)',
  asr: 'hsl(28, 75%, 55%)',
  maghrib: 'hsl(12, 72%, 52%)',
  isha: 'hsl(255, 55%, 50%)',
};

export function CalendarView() {
  const { tasks, updateTaskSchedule } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>('month');
  const [filter, setFilter] = useState<CalendarFilter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [prefillStart, setPrefillStart] = useState<string | undefined>();
  const [prefillEnd, setPrefillEnd] = useState<string | undefined>();
  const [prefillAllDay, setPrefillAllDay] = useState(false);

  const events = useMemo<CalendarEvent[]>(() => {
    return tasks
      .filter((t) => {
        if (t.deleted) return false;
        if (filter === 'active' && t.completed) return false;
        if (filter === 'completed' && !t.completed) return false;
        // Only show tasks that have dates
        return t.startAt || t.dueDate;
      })
      .map((t) => {
        let start: Date;
        let end: Date;
        const isAllDay = t.allDay || (!t.startAt && !!t.dueDate);

        if (t.startAt) {
          start = new Date(t.startAt);
          end = t.endAt ? new Date(t.endAt) : addMinutes(start, t.duration || 30);
        } else if (t.dueDate) {
          start = new Date(t.dueDate + 'T00:00:00');
          end = new Date(t.dueDate + 'T23:59:59');
        } else {
          start = new Date();
          end = new Date();
        }

        return {
          id: t.id,
          title: t.title,
          start,
          end,
          allDay: isAllDay,
          task: t,
        };
      });
  }, [tasks, filter]);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setEditingTask(null);
    const startDate = slotInfo.start;
    const endDate = slotInfo.end;

    // Check if this is an all-day slot (dates are at midnight)
    const isAllDay =
      startDate.getHours() === 0 &&
      startDate.getMinutes() === 0 &&
      endDate.getHours() === 0 &&
      endDate.getMinutes() === 0;

    setPrefillStart(startDate.toISOString());
    setPrefillEnd(
      isAllDay ? addMinutes(startDate, 30).toISOString() : endDate.toISOString()
    );
    setPrefillAllDay(isAllDay);
    setDialogOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setEditingTask(event.task);
    setPrefillStart(event.task.startAt);
    setPrefillEnd(event.task.endAt);
    setPrefillAllDay(event.task.allDay || false);
    setDialogOpen(true);
  }, []);

  const handleEventDrop = useCallback(
    (args: EventInteractionArgs<CalendarEvent>) => {
      const { event, start, end } = args;
      updateTaskSchedule(
        (event as CalendarEvent).id,
        (start as Date).toISOString(),
        (end as Date).toISOString(),
        (event as CalendarEvent).task.allDay
      );
    },
    [updateTaskSchedule]
  );

  const handleEventResize = useCallback(
    (args: EventInteractionArgs<CalendarEvent>) => {
      const { event, start, end } = args;
      updateTaskSchedule(
        (event as CalendarEvent).id,
        (start as Date).toISOString(),
        (end as Date).toISOString(),
        false
      );
    },
    [updateTaskSchedule]
  );

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleViewChange = useCallback((newView: CalendarViewType) => {
    setView(newView);
  }, []);

  const goToToday = () => setCurrentDate(new Date());
  const goPrev = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    else if (view === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };
  const goNext = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    else if (view === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const stageColor = STAGE_COLORS[event.task.stage];
    const isCompleted = event.task.completed;
    return {
      style: {
        backgroundColor: stageColor,
        opacity: isCompleted ? 0.5 : 0.9,
        border: 'none',
        borderRadius: '4px',
        color: '#fff',
        fontSize: '12px',
        textDecoration: isCompleted ? 'line-through' : 'none',
      },
    };
  };

  const viewLabels: Record<CalendarViewType, string> = {
    month: 'Month',
    week: 'Week',
    day: 'Day',
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Calendar Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <CalendarIcon size={20} className="text-primary" />
          <h1 className="text-xl font-semibold">Calendar</h1>
          <span className="text-sm text-muted-foreground ml-2">
            {format(currentDate, 'MMMM yyyy')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter pills */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
            {(['all', 'active', 'completed'] as CalendarFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                  filter === f
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Navigation */}
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goPrev}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goNext}>
              <ChevronRight size={16} />
            </Button>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* View switch */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
            {(['month', 'week', 'day'] as CalendarViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => handleViewChange(v)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                  view === v
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {viewLabels[v]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="flex-1 overflow-auto p-4 waqt-calendar">
        <DnDCalendar
          localizer={localizer}
          events={events}
          date={currentDate}
          view={view as any}
          onNavigate={handleNavigate}
          onView={handleViewChange as any}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent as any}
          onEventDrop={handleEventDrop as any}
          onEventResize={handleEventResize as any}
          eventPropGetter={eventStyleGetter as any}
          selectable
          resizable
          popup
          toolbar={false}
          step={15}
          timeslots={4}
          style={{ height: '100%', minHeight: 600 }}
        />
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        stage={editingTask?.stage || 'fajr'}
        task={editingTask}
        prefillStartAt={prefillStart}
        prefillEndAt={prefillEnd}
        prefillAllDay={prefillAllDay}
      />
    </div>
  );
}
