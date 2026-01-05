import { RefreshCw, Mail, Copy, Clock, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTempMail, Message } from '@/hooks/useTempMail';
import { toast } from 'sonner';
import { useState } from 'react';
import { EmailDetailModal } from '@/components/EmailDetailModal';

const Index = () => {
  const {
    email,
    messages,
    isLoading,
    autoRefreshSeconds,
    expirationSeconds,
    generateNewEmail,
    refreshInbox,
    copyAddress,
    markAsRead,
    getMessageContent,
  } = useTempMail();

  const [copied, setCopied] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageContent, setMessageContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);

  const handleCopy = () => {
    copyAddress();
    setCopied(true);
    toast.success('Email address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewEmail = () => {
    generateNewEmail();
    toast.success('New temporary email generated');
  };

  const handleRefresh = () => {
    refreshInbox();
    toast.info('Checking for new emails...');
  };

  const handleEmailClick = async (message: Message) => {
    setSelectedMessage(message);
    setLoadingContent(true);
    
    if (!message.isRead) {
      markAsRead(message.id);
    }

    try {
      const content = await getMessageContent(message.id);
      setMessageContent(content.html || content.text || '');
    } catch (error) {
      console.error('Failed to load message content:', error);
      setMessageContent('Failed to load message content');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedMessage(null);
    setMessageContent('');
  };

  const formatExpiry = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1714' }}>
      <div className="container max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-12">
          <p className="italic text-lg mb-4" style={{ color: '#c9a962', fontFamily: 'Playfair Display, serif' }}>
            your privacy matters...
          </p>
          <h1 className="text-5xl md:text-6xl font-semibold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span style={{ color: '#e8e0d5' }}>Temp</span>
            <span style={{ color: '#c9a962' }}>Mail</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#8a8279' }}>
            Instant disposable email addresses. Protect your privacy from spam and unwanted emails.
          </p>
          
          {/* Feature badges */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#c9a962' }} />
              <span className="text-sm uppercase tracking-widest" style={{ color: '#8a8279' }}>Instant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#c9a962' }} />
              <span className="text-sm uppercase tracking-widest" style={{ color: '#8a8279' }}>Anonymous</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#c9a962' }} />
              <span className="text-sm uppercase tracking-widest" style={{ color: '#8a8279' }}>Secure</span>
            </div>
          </div>
        </header>

        {/* Email Card */}
        <div className="rounded-xl p-6 mb-4" style={{ backgroundColor: '#211e1a', border: '1px solid #2d2a26' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(201, 169, 98, 0.1)', border: '1px solid rgba(201, 169, 98, 0.2)' }}>
              <Mail className="w-5 h-5" style={{ color: '#c9a962' }} />
            </div>
            <h2 className="text-lg" style={{ color: '#e8e0d5', fontFamily: 'Playfair Display, serif' }}>Your Temporary Email</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Email Input */}
            <div className="flex-1 flex items-center gap-3 rounded-lg px-4 py-3" style={{ backgroundColor: '#1a1714', border: '1px solid #2d2a26' }}>
              <span className="font-mono text-base flex-1 truncate" style={{ color: '#e8e0d5' }}>
                {email || 'Generating...'}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded transition-colors hover:opacity-80"
                aria-label="Copy email"
              >
                <Copy className="w-4 h-4" style={{ color: copied ? '#c9a962' : '#8a8279' }} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleRefresh}
                disabled={isLoading}
                className="hover:opacity-80"
                style={{ backgroundColor: '#2d2a26', color: '#e8e0d5', border: 'none' }}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleNewEmail}
                disabled={isLoading}
                className="hover:opacity-90"
                style={{ backgroundColor: '#c9a962', color: '#1a1714' }}
              >
                New Email
              </Button>
            </div>
          </div>

          {/* Status Row */}
          <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid rgba(45, 42, 38, 0.5)' }}>
            <div className="flex items-center gap-6">
              <span className="text-sm" style={{ color: '#8a8279' }}>
                Auto-refresh in <span style={{ color: '#e8e0d5' }}>{autoRefreshSeconds}s</span>
              </span>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#8a8279' }}>
                <Clock className="w-4 h-4" />
                Expires in <span style={{ color: '#e8e0d5' }}>{formatExpiry(expirationSeconds)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#10b981' }} />
              <span className="text-sm" style={{ color: '#10b981' }}>Active</span>
            </div>
          </div>
        </div>

        {/* Inbox Card */}
        <div className="rounded-xl p-6" style={{ backgroundColor: '#211e1a', border: '1px solid #2d2a26' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(201, 169, 98, 0.1)', border: '1px solid rgba(201, 169, 98, 0.2)' }}>
                <Inbox className="w-5 h-5" style={{ color: '#c9a962' }} />
              </div>
              <h2 className="text-lg" style={{ color: '#e8e0d5', fontFamily: 'Playfair Display, serif' }}>Inbox</h2>
            </div>
            {messages.length > 0 && (
              <span className="text-sm px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(201, 169, 98, 0.2)', color: '#c9a962' }}>
                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
              </span>
            )}
          </div>

          {isLoading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full animate-spin mb-4" style={{ border: '2px solid rgba(201, 169, 98, 0.2)', borderTopColor: '#c9a962' }} />
              <p style={{ color: '#8a8279' }}>Checking for new messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full mb-4" style={{ backgroundColor: 'rgba(45, 42, 38, 0.5)' }}>
                <Mail className="w-8 h-8" style={{ color: '#8a8279' }} />
              </div>
              <p style={{ color: '#8a8279' }}>No messages yet</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(138, 130, 121, 0.7)' }}>
                Emails sent to your address will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleEmailClick(message)}
                  className="p-4 rounded-lg cursor-pointer transition-all hover:scale-[1.01]"
                  style={{ 
                    backgroundColor: 'rgba(45, 42, 38, 0.3)', 
                    border: `1px solid ${!message.isRead ? 'rgba(201, 169, 98, 0.3)' : 'rgba(45, 42, 38, 0.5)'}`,
                    borderLeft: !message.isRead ? '3px solid #c9a962' : undefined
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate" style={{ color: '#e8e0d5' }}>{message.from}</p>
                        {!message.isRead && (
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#c9a962' }} />
                        )}
                      </div>
                      <p className="text-sm truncate mt-1" style={{ color: 'rgba(232, 224, 213, 0.8)' }}>{message.subject}</p>
                      <p className="text-xs truncate mt-1" style={{ color: '#8a8279' }}>
                        {message.preview.substring(0, 100)}...
                      </p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: '#8a8279' }}>
                      {formatTime(message.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-sm" style={{ color: '#8a8279' }}>
          <p>Your privacy is protected. Emails are automatically deleted after expiration.</p>
        </footer>
      </div>

      {/* Email Detail Modal */}
      <EmailDetailModal
        message={selectedMessage}
        content={messageContent}
        isLoading={loadingContent}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Index;
