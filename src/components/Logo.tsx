import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={cn("h-6 w-auto", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 
        TODO: Replace the path below with the actual SVG path of the new logo.
        The user provided a raster image, so we need the SVG vector data here.
        For now, this is a placeholder 'W' shape.
      */}
       <path d="M20 20 L35 80 L50 40 L65 80 L80 20 H70 L60 60 L50 25 L40 60 L30 20 Z" />
    </svg>
  );
}

