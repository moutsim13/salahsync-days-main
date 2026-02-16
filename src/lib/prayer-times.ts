import { Stage, PrayerTime } from './types';

// Prayer time calculation constants
const CALCULATION_METHODS: Record<string, { fajrAngle: number; ishaAngle: number }> = {
  MWL: { fajrAngle: 18, ishaAngle: 17 },
  ISNA: { fajrAngle: 15, ishaAngle: 15 },
  Egypt: { fajrAngle: 19.5, ishaAngle: 17.5 },
  Makkah: { fajrAngle: 18.5, ishaAngle: 90 }, // 90 mins after maghrib
  Karachi: { fajrAngle: 18, ishaAngle: 18 },
  Tehran: { fajrAngle: 17.7, ishaAngle: 14 },
};

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function calculateSunDeclination(dayOfYear: number): number {
  return -23.45 * Math.cos(toRadians((360 / 365) * (dayOfYear + 10)));
}

function calculateEquationOfTime(dayOfYear: number): number {
  const b = toRadians((360 / 365) * (dayOfYear - 81));
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

function calculatePrayerAngle(
  latitude: number,
  declination: number,
  angle: number
): number {
  const latRad = toRadians(latitude);
  const decRad = toRadians(declination);
  const angleRad = toRadians(angle);
  
  return toDegrees(
    Math.acos(
      (-Math.sin(angleRad) - Math.sin(latRad) * Math.sin(decRad)) /
        (Math.cos(latRad) * Math.cos(decRad))
    )
  );
}

function calculateAsrAngle(latitude: number, declination: number): number {
  const latRad = toRadians(latitude);
  const decRad = toRadians(declination);
  const a = Math.atan(1 / (1 + Math.tan(Math.abs(latRad - decRad))));
  
  return toDegrees(
    Math.acos(
      (Math.sin(a) - Math.sin(latRad) * Math.sin(decRad)) /
        (Math.cos(latRad) * Math.cos(decRad))
    )
  );
}

function hoursToTime(hours: number, baseDate: Date): Date {
  const result = new Date(baseDate);
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  result.setHours(h, m, 0, 0);
  return result;
}

export function calculatePrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  method: string = 'MWL'
): PrayerTime[] {
  const methodConfig = CALCULATION_METHODS[method] || CALCULATION_METHODS.MWL;
  
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  
  const declination = calculateSunDeclination(dayOfYear);
  const equationOfTime = calculateEquationOfTime(dayOfYear);
  
  // Solar noon
  const timezone = -date.getTimezoneOffset() / 60;
  const solarNoon = 12 + timezone - longitude / 15 - equationOfTime / 60;
  
  // Dhuhr is at solar noon
  const dhuhrTime = solarNoon;
  
  // Fajr
  const fajrAngle = calculatePrayerAngle(latitude, declination, methodConfig.fajrAngle);
  const fajrTime = dhuhrTime - fajrAngle / 15;
  
  // Sunrise (for reference)
  const sunriseAngle = calculatePrayerAngle(latitude, declination, 0.833);
  const sunriseTime = dhuhrTime - sunriseAngle / 15;
  
  // Asr
  const asrAngle = calculateAsrAngle(latitude, declination);
  const asrTime = dhuhrTime + asrAngle / 15;
  
  // Maghrib (sunset)
  const maghribTime = dhuhrTime + sunriseAngle / 15;
  
  // Isha
  let ishaTime: number;
  if (methodConfig.ishaAngle === 90) {
    ishaTime = maghribTime + 1.5; // 90 minutes after maghrib
  } else {
    const ishaAngle = calculatePrayerAngle(latitude, declination, methodConfig.ishaAngle);
    ishaTime = dhuhrTime + ishaAngle / 15;
  }
  
  return [
    { name: 'fajr', time: hoursToTime(fajrTime, date), label: 'Fajr' },
    { name: 'dhuhr', time: hoursToTime(dhuhrTime, date), label: 'Dhuhr' },
    { name: 'asr', time: hoursToTime(asrTime, date), label: 'Asr' },
    { name: 'maghrib', time: hoursToTime(maghribTime, date), label: 'Maghrib' },
    { name: 'isha', time: hoursToTime(ishaTime, date), label: 'Isha' },
  ];
}

export function getCurrentStage(prayerTimes: PrayerTime[]): Stage {
  const now = new Date();
  
  // Find the current stage based on prayer times
  for (let i = prayerTimes.length - 1; i >= 0; i--) {
    if (now >= prayerTimes[i].time) {
      return prayerTimes[i].name;
    }
  }
  
  // Before Fajr, still in Isha from previous day
  return 'isha';
}

export function getNextPrayer(prayerTimes: PrayerTime[]): PrayerTime | null {
  const now = new Date();
  
  for (const prayer of prayerTimes) {
    if (prayer.time > now) {
      return prayer;
    }
  }
  
  return null;
}

export function formatCountdown(targetTime: Date): string {
  const now = new Date();
  const diff = targetTime.getTime() - now.getTime();
  
  if (diff <= 0) return '00:00';
  
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getStageColor(stage: Stage): string {
  const colors: Record<Stage, string> = {
    fajr: 'hsl(220, 60%, 50%)',
    dhuhr: 'hsl(45, 90%, 50%)',
    asr: 'hsl(30, 80%, 55%)',
    maghrib: 'hsl(15, 70%, 50%)',
    isha: 'hsl(260, 50%, 45%)',
  };
  return colors[stage];
}

export function getStageGradient(stage: Stage): string {
  const gradients: Record<Stage, string> = {
    fajr: 'from-blue-400/20 to-indigo-500/20',
    dhuhr: 'from-yellow-400/20 to-amber-500/20',
    asr: 'from-orange-400/20 to-amber-500/20',
    maghrib: 'from-rose-400/20 to-orange-500/20',
    isha: 'from-purple-400/20 to-indigo-500/20',
  };
  return gradients[stage];
}

// Hijri date calculation (simplified)
export function toHijri(date: Date): { day: number; month: string; year: number } {
  const HIJRI_MONTHS = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
  ];
  
  // Julian day calculation
  const jd = Math.floor((date.getTime() - new Date(1970, 0, 1).getTime()) / 86400000) + 2440588;
  
  // Convert to Hijri
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
            Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
             Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  
  return {
    day,
    month: HIJRI_MONTHS[month - 1] || 'Unknown',
    year,
  };
}
