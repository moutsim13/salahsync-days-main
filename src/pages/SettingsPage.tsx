import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calculator, Palette, Globe, Info } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CALCULATION_METHODS = [
  { id: 'MWL', name: 'Muslim World League' },
  { id: 'ISNA', name: 'ISNA (North America)' },
  { id: 'Egypt', name: 'Egyptian General Authority' },
  { id: 'Makkah', name: 'Umm al-Qura (Makkah)' },
  { id: 'Karachi', name: 'University of Karachi' },
  { id: 'Tehran', name: 'Institute of Geophysics, Tehran' },
];

export function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const [isLocating, setIsLocating] = useState(false);

  const detectLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try to get city name from reverse geocoding
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            updateSettings({
              location: {
                latitude,
                longitude,
                city: data.city || data.locality || 'Unknown Location',
              },
            });
          } catch {
            updateSettings({
              location: {
                latitude,
                longitude,
                city: 'Unknown Location',
              },
            });
          }
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLocating(false);
        }
      );
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Waqt experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Location */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-6 border border-border/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Location</h2>
                <p className="text-sm text-muted-foreground">For accurate prayer times</p>
              </div>
            </div>

            <div className="space-y-4">
              {settings.location ? (
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="font-medium">{settings.location.city}</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.location.latitude.toFixed(4)}, {settings.location.longitude.toFixed(4)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No location set. Using default (Makkah).
                </p>
              )}

              <Button onClick={detectLocation} disabled={isLocating} variant="outline">
                {isLocating ? 'Detecting...' : 'Detect My Location'}
              </Button>
            </div>
          </motion.section>

          {/* Calculation Method */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-6 border border-border/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calculator size={20} className="text-blue-500" />
              </div>
              <div>
                <h2 className="font-semibold">Calculation Method</h2>
                <p className="text-sm text-muted-foreground">Prayer time calculation standard</p>
              </div>
            </div>

            <Select
              value={settings.calculationMethod}
              onValueChange={(value) => updateSettings({ calculationMethod: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CALCULATION_METHODS.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.section>

          {/* Appearance */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-6 border border-border/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Palette size={20} className="text-purple-500" />
              </div>
              <div>
                <h2 className="font-semibold">Appearance</h2>
                <p className="text-sm text-muted-foreground">Customize the look</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value: 'light' | 'dark' | 'system') => handleThemeChange(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Hijri Date</Label>
                  <p className="text-xs text-muted-foreground">Display Islamic calendar date</p>
                </div>
                <Switch
                  checked={settings.showHijriDate}
                  onCheckedChange={(checked) => updateSettings({ showHijriDate: checked })}
                />
              </div>
            </div>
          </motion.section>

          {/* Timezone */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-xl p-6 border border-border/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Globe size={20} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="font-semibold">Timezone</h2>
                <p className="text-sm text-muted-foreground">Used for calendar times</p>
              </div>
            </div>

            <div className="p-4 bg-secondary rounded-lg">
              <p className="font-medium text-sm">{settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Detected from your browser. Calendar events are displayed in this timezone.
              </p>
            </div>
          </motion.section>

          {/* About */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl p-6 border border-border/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Info size={20} className="text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">About Waqt</h2>
                <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Waqt is a productivity app that organizes your day around the 5 daily prayer stages.
              All data is stored locally on your device for complete privacy.
            </p>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
