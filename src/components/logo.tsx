import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-foreground", className)}>
      <div className="p-2 bg-primary/20 rounded-lg">
        <Scale className="h-5 w-5 text-primary" />
      </div>
      <span className="font-headline text-xl font-bold">EscalaWeb</span>
    </div>
  );
}
