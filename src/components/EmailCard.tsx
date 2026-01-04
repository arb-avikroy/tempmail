import { Mail, Clock } from 'lucide-react';
import { Email } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface EmailCardProps {
  email: Email;
  onClick: () => void;
}

export const EmailCard = ({ email, onClick }: EmailCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(email.created_at), { addSuffix: true });

  return (
    <div
      onClick={onClick}
      className={`
        group p-4 rounded-lg border border-border bg-card/50 
        hover:bg-card hover:border-primary/30 cursor-pointer 
        transition-all duration-200 animate-fade-in
        ${!email.is_read ? 'border-l-2 border-l-primary' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-muted">
          <Mail className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-foreground truncate">
              {email.sender}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
            </div>
          </div>
          <p className="text-sm text-foreground/80 truncate mt-1">
            {email.subject}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {email.body.substring(0, 80)}...
          </p>
        </div>
      </div>
    </div>
  );
};
