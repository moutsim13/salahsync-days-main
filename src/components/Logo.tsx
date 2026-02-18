import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/logo2.png"
      alt="Waqt Logo"
      className={cn("h-6 w-auto object-contain", className)}
    />
  );
}
