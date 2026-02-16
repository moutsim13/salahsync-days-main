import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Settings, Moon, Sun, Flame, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import {
  calculatePrayerTimes,
  getNextPrayer,
  formatCountdown,
  toHijri,
} from '@/lib/prayer-times';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

export function TopBar() {
  const navigate = useNavigate();
  const { tasks, settings, updateSettings } = useStore();
  const [countdown, setCountdown] = useState('');
  const [nextPrayerName, setNextPrayerName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  const hijriDate = toHijri(today);

  // Get prayer times
  const latitude = settings.location?.latitude || 21.4225;
  const longitude = settings.location?.longitude || 39.8262;
  const prayerTimes = calculatePrayerTimes(today, latitude, longitude, settings.calculationMethod);

  // Calculate progress
  const todayTasks = tasks.filter(t => !t.deleted);
  const completedTasks = todayTasks.filter(t => t.completed);
  const progress = todayTasks.length > 0
    ? Math.round((completedTasks.length / todayTasks.length) * 100)
    : 0;

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      const nextPrayer = getNextPrayer(prayerTimes);
      if (nextPrayer) {
        setNextPrayerName(nextPrayer.label);
        setCountdown(formatCountdown(nextPrayer.time));
      } else {
        setNextPrayerName('Fajr');
        // Tomorrow's Fajr
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowTimes = calculatePrayerTimes(tomorrow, latitude, longitude, settings.calculationMethod);
        setCountdown(formatCountdown(tomorrowTimes[0].time));
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes, latitude, longitude, settings.calculationMethod]);

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <header className="h-14 bg-card border-b border-border px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Logo & Date */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Logo showText={false} />
          <span className="font-semibold text-lg hidden sm:block">Waqt</span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#2A9D8F]/90 text-white opacity-90">
            Beta
          </span>
        </div>

        <div className="hidden md:flex flex-col">
          <span className="text-sm font-medium">{format(today, 'EEEE, MMMM d')}</span>
          <span className="text-xs text-muted-foreground">
            {hijriDate.day} {hijriDate.month} {hijriDate.year} AH
          </span>
        </div>
      </div>

      {/* Center: Next Prayer & Progress */}
      <div className="flex items-center gap-6">
        {/* Next Prayer Countdown */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10"
        >
          <Timer size={16} className="text-primary" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-primary">{nextPrayerName}</span>
            <span className="text-sm font-mono text-primary/80">{countdown}</span>
          </div>
        </motion.div>

        {/* Daily Progress */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary">
            <Flame size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">
              {completedTasks.length}/{todayTasks.length}
            </span>
          </div>
          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary rounded-full"
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Right: Search & Settings */}
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 pl-9 h-9 bg-secondary border-0 focus-visible:ring-1"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9"
        >
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
          className="h-9 w-9"
        >
          <Settings size={18} />
        </Button>
      </div>
    </header>
  );
}
