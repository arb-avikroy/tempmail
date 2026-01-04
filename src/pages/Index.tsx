import { RefreshCw, Plus, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTempMail } from '@/hooks/useTempMail';
import { AddressDisplay } from '@/components/AddressDisplay';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyInbox } from '@/components/EmptyInbox';
import { EmailCard } from '@/components/EmailCard';
import { toast } from 'sonner';

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

  const handleCopy = () => {
    copyAddress();
    toast.success('Email address copied to clipboard');
  };

  const handleNewEmail = () => {
    generateNewAddress();
    toast.success('New temporary email generated');
  };

  const handleRefresh = () => {
    fetchEmails();
    toast.info('Checking for new emails...');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background glow effect */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{ background: 'var(--gradient-glow)' }}
      />
      
      <div className="relative z-10 container max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 glow-effect">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3">
            Temp<span className="text-gradient">Mail</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Instant disposable email addresses
          </p>
        </header>

        {/* Main Card */}
        <Card className="card-gradient border-border/50 shadow-card overflow-hidden">
          <div className="p-6 border-b border-border/50">
            {/* Address Display */}
            {currentAddress && (
              <AddressDisplay 
                address={currentAddress.address} 
                onCopy={handleCopy}
              />
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                variant="secondary"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="default"
                onClick={handleNewEmail}
                disabled={isLoading}
                className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Email
              </Button>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-3 mt-4">
              <StatusBadge
                icon="refresh"
                label="Auto-refresh"
                value={`${autoRefreshCountdown}s`}
              />
              <StatusBadge
                icon="timer"
                label="Expires in"
                value={`${expiryMinutes} mins`}
              />
            </div>
          </div>

          {/* Inbox */}
          <div className="p-6">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Inbox
            </h2>
            
            {emails.length === 0 ? (
              <EmptyInbox />
            ) : (
              <div className="space-y-3">
                {emails.map((email) => (
                  <EmailCard
                    key={email.id}
                    email={email}
                    onClick={() => toast.info(`Opening: ${email.subject}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <footer className="text-center mt-8 text-sm text-muted-foreground">
          <p>Your privacy is protected. Emails are automatically deleted after expiration.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
