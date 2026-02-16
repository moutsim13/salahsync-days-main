import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  const [error, setError] = useState(false);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 relative">
        {!error ? (
          <img 
            src="/logo.png" 
            alt="Waqt Logo" 
            className="w-full h-full object-cover"
            onError={() => setError(true)}
          />
        ) : (
          <div className="w-full h-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">W</span>
          </div>
        )}
      </div>
      {showText && (
        <span className="font-semibold text-lg">Waqt</span>
      )}
    </div>
  );
}
