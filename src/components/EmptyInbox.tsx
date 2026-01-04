import { Inbox } from 'lucide-react';

export const EmptyInbox = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="p-6 rounded-2xl bg-muted/50 mb-6">
        <Inbox className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        No messages yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Emails sent to your temporary address will appear here automatically
      </p>
    </div>
  );
};
