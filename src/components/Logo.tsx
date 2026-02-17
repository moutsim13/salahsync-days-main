import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 1500 1500"
      fill="currentColor"
      className={cn("h-6 w-auto", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* New Waqt Logo - Monochrome version */}
      <path d="M750,100 L900,400 L1050,100 L1200,400 L1350,100 L1400,100 L1400,200 L1300,500 L1150,200 L1000,500 L850,200 L700,500 L550,200 L400,500 L250,200 L100,200 L100,100 L250,100 L400,400 L550,100 L700,400 Z" />
    </svg>
  );
}
