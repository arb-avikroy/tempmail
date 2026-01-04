import { RefreshCw, Timer } from 'lucide-react';

interface StatusBadgeProps {
  icon: 'refresh' | 'timer';
  label: string;
  value: string;
  isAnimating?: boolean;
}

export const StatusBadge = ({ icon, label, value, isAnimating }: StatusBadgeProps) => {
  const Icon = icon === 'refresh' ? RefreshCw : Timer;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/50">
      <Icon 
        className={`w-4 h-4 text-muted-foreground ${isAnimating ? 'animate-spin' : ''}`} 
      />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
};
