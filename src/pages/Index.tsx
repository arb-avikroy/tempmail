import { RefreshCw, Plus, Mail, Copy, Clock, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTempMail } from '@/hooks/useTempMail';
import { toast } from 'sonner';
import { useState } from 'react';

const Index = () => {
  const {
    currentAddress,
    emails,
    isLoading,
    autoRefreshCountdown,
    expiryMinutes,
    generateNewAddress,
    fetchEmails,
    copyAddress,
  } = useTempMail();

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyAddress();
    setCopied(true);
    toast.success('Email address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewEmail = () => {
    generateNewAddress();
    toast.success('New temporary email generated');
  };

  const handleRefresh = () => {
    fetchEmails();
    toast.info('Checking for new emails...');
  };

  const formatExpiry = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <p className="text-gold-light italic font-display text-lg mb-4">
            your privacy matters...
          </p>
          <h1 className="text-5xl md:text-6xl font-display font-semibold mb-6">
            <span className="text-foreground">Temp</span>
            <span className="text-gold">Mail</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Instant disposable email addresses. Protect your privacy from spam and unwanted emails.
          </p>
          
          {/* Feature badges */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="text-sm text-muted-foreground uppercase tracking-widest">Instant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="text-sm text-muted-foreground uppercase tracking-widest">Anonymous</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="text-sm text-muted-foreground uppercase tracking-widest">Secure</span>
            </div>
          </div>
        </header>

        {/* Email Card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-gold/10 border border-gold/20">
              <Mail className="w-5 h-5 text-gold" />
            </div>
            <h2 className="font-display text-lg text-foreground">Your Temporary Email</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Email Input */}
            <div className="flex-1 flex items-center gap-3 bg-input border border-border rounded-lg px-4 py-3">
              <span className="text-foreground font-mono text-base flex-1 truncate">
                {currentAddress?.address || 'Generating...'}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-muted rounded transition-colors"
                aria-label="Copy email"
              >
                <Copy className={`w-4 h-4 ${copied ? 'text-gold' : 'text-muted-foreground'}`} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleNewEmail}
                disabled={isLoading}
                className="bg-gold text-primary-foreground hover:bg-gold/90"
              >
                New Email
              </Button>
            </div>
          </div>

          {/* Status Row */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <div className="flex items-center gap-6">
              <span className="text-sm text-muted-foreground">
                Auto-refresh in <span className="text-foreground">{autoRefreshCountdown}s</span>
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Expires in <span className="text-foreground">{formatExpiry(expiryMinutes)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-emerald-500">Active</span>
            </div>
          </div>
        </div>

        {/* Inbox Card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-gold/10 border border-gold/20">
              <Inbox className="w-5 h-5 text-gold" />
            </div>
            <h2 className="font-display text-lg text-foreground">Inbox</h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin-slow mb-4" />
              <p className="text-muted-foreground">Checking for new messages...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Emails sent to your address will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{email.sender}</p>
                      <p className="text-sm text-foreground/80 truncate mt-1">{email.subject}</p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {email.body.substring(0, 80)}...
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(email.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>Your privacy is protected. Emails are automatically deleted after expiration.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
