import { RefreshCw, Mail, Copy, Clock, Inbox, ExternalLink, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTempMail, Message } from '@/hooks/useTempMail';
import { useYopMail } from '@/hooks/useYopMail';
import { toast } from 'sonner';
import { useState } from 'react';
import { EmailDetailModal } from '@/components/EmailDetailModal';

const Index = () => {
  const [version, setVersion] = useState<'v1' | 'v2'>(() => {
    return (localStorage.getItem('tempmail-version') as 'v1' | 'v2') || 'v1';
  });

  const mailTmHook = useTempMail();
  const yopMailHook = useYopMail();

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
  } = version === 'v1' ? mailTmHook : yopMailHook;

  const yopmailUrl = version === 'v2' ? (yopMailHook as any).yopmailUrl : '';
  const openInbox = version === 'v2' ? (yopMailHook as any).openInbox : null;
  const alternateEmail = version === 'v2' ? (yopMailHook as any).alternateEmail : null;
  const selectedDomain = version === 'v2' ? (yopMailHook as any).selectedDomain : null;
  const availableDomains = version === 'v2' ? (yopMailHook as any).availableDomains : [];
  const changeDomain = version === 'v2' ? (yopMailHook as any).changeDomain : null;
  const isLiveV2 = version === 'v2' ? (yopMailHook as any).isLive : true;

  const [copied, setCopied] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageContent, setMessageContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);

  const switchVersion = (newVersion: 'v1' | 'v2') => {
    setVersion(newVersion);
    localStorage.setItem('tempmail-version', newVersion);
    toast.success(`Switched to ${newVersion === 'v1' ? 'Mail.tm' : 'YopMail'}`);
  };

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
          {/* <<p className="text-lg max-w-xl mx-auto" style={{ color: '#8a8279' }}>
           AdventurousInvestorHub's
          </p> */}
          <p className="text-lg max-w-xl mx-auto">
            <a href="https://www.adventurousinvestorhub.com" target="_blank" rel="noopener noreferrer">
              AdventurousInvestorHub's
            </a>
          </p>
          <h1 className="text-5xl md:text-6xl font-semibold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span style={{ color: '#e8e0d5' }}>TempMail</span>
            <span style={{ color: '#c9a962' }}> Insta</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#8a8279' }}>
            Instant disposable email addresses. Protect your privacy from spam and unwanted emails.
          </p>

          {/* Version Switcher */}
          <div className="flex items-center justify-center gap-3 mt-6 mb-4">
            <button
              onClick={() => switchVersion('v1')}
              className={`px-4 py-2 rounded-lg transition-all ${version === 'v1' ? 'font-medium' : 'opacity-60 hover:opacity-80'}`}
              style={{
                backgroundColor: version === 'v1' ? '#c9a962' : '#2d2a26',
                color: version === 'v1' ? '#1a1714' : '#e8e0d5',
                border: version === 'v1' ? 'none' : '1px solid rgba(45, 42, 38, 0.5)'
              }}
            >
              V1: Mail.tm
            </button>
            <button
              onClick={() => switchVersion('v2')}
              className={`px-4 py-2 rounded-lg transition-all ${version === 'v2' ? 'font-medium' : 'opacity-60 hover:opacity-80'}`}
              style={{
                backgroundColor: version === 'v2' ? '#c9a962' : '#2d2a26',
                color: version === 'v2' ? '#1a1714' : '#e8e0d5',
                border: version === 'v2' ? 'none' : '1px solid rgba(45, 42, 38, 0.5)'
              }}
            >
              V2: YopMail
            </button>
          </div>

          {version === 'v2' && (
            <p className="text-sm mt-2 px-4 py-2 rounded-lg" style={{ color: '#8a8279', backgroundColor: 'rgba(201, 169, 98, 0.1)' }}>
              ⚠️ YopMail emails are checked directly on their website. Click "Open Inbox" to view emails.
            </p>
          )}

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
            <h2 className="text-lg" style={{ color: '#e8e0d5', fontFamily: 'Playfair Display, serif' }}>
              {version === 'v1' ? 'Your Temporary Email' : 'Your Temporary Email - Copy from Alternate'}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Email Input - V2: Non-copyable, V1: Normal with copy button */}
            <div className="flex-1 flex items-center gap-3 rounded-lg px-4 py-3" style={{ backgroundColor: '#1a1714', border: '1px solid #2d2a26' }}>
              <span 
                className={`font-mono text-base flex-1 truncate ${version === 'v2' ? 'select-none' : ''}`}
                style={{ color: '#e8e0d5', userSelect: version === 'v2' ? 'none' : 'auto' }}
              >
                {email || 'Generating...'}
              </span>
              {version === 'v1' && (
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded transition-colors hover:opacity-80"
                  aria-label="Copy email"
                >
                  <Copy className="w-4 h-4" style={{ color: copied ? '#c9a962' : '#8a8279' }} />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {version === 'v2' && yopmailUrl && (
                <Button
                  variant="secondary"
                  onClick={openInbox}
                  className="hover:opacity-90 flex-shrink-0"
                  style={{ backgroundColor: '#10b981', color: '#fff', border: 'none' }}
                >
                  <ExternalLink className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Open Inbox</span>
                </Button>
              )}
              {version === 'v1' && (
                <Button
                  variant="secondary"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="hover:opacity-80 flex-shrink-0"
                  style={{ backgroundColor: '#2d2a26', color: '#e8e0d5', border: 'none' }}
                >
                  <RefreshCw className={`w-4 h-4 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              )}
              <Button
                onClick={handleNewEmail}
                disabled={isLoading}
                className="hover:opacity-90 flex-shrink-0"
                style={{ backgroundColor: '#c9a962', color: '#1a1714' }}
              >
                <span className="hidden sm:inline">New Email</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>

          {/* Alternate Domain Section - YopMail Only */}
          {version === 'v2' && alternateEmail && availableDomains.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(45, 42, 38, 0.5)' }}>
              <div className="mb-3">
                <p className="text-xs leading-relaxed" style={{ color: '#8a8279' }}>
                  Websites keep blocking disposable email addresses from time to time. So YopMail offers a list of alternate domains. So your temporary address will not be blacklisted by websites.
                  <br />
                  <span style={{ color: '#c9a962', fontWeight: '500' }}>One new domain name each day!</span>
                  {' '}Change domain to create other accounts, click on "New Email" if no domain change works.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(201, 169, 98, 0.15)', border: '1px solid rgba(201, 169, 98, 0.3)' }}>
                <span className="text-xs uppercase tracking-wider shrink-0" style={{ color: '#8a8279' }}>
                  Alternate domain:
                </span>
                <span className="font-mono text-sm shrink-0" style={{ color: '#e8e0d5' }}>
                  {email?.split('@')[0]}
                </span>
                <Select value={selectedDomain || ''} onValueChange={changeDomain}>
                  <SelectTrigger 
                    className="h-8 w-[180px] font-mono text-sm border-none focus:ring-1"
                    style={{ 
                      backgroundColor: 'rgba(201, 169, 98, 0.2)', 
                      color: '#e8e0d5',
                      borderRadius: '6px'
                    }}
                  >
                    <SelectValue placeholder="Select domain">
                      @{selectedDomain}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent 
                    className="max-h-[350px] overflow-y-auto"
                    style={{ backgroundColor: '#211e1a', border: '1px solid #2d2a26' }}
                  >
                    {/* New Domain Group */}
                    {selectedDomain && (
                      <SelectGroup>
                        <SelectLabel style={{ color: '#8a8279', fontSize: '10px', paddingLeft: '8px' }}>
                          -- New --
                        </SelectLabel>
                        <SelectItem 
                          key={selectedDomain} 
                          value={selectedDomain}
                          className="font-mono text-sm cursor-pointer focus:bg-[rgba(201,169,98,0.2)]"
                          style={{ color: '#e8e0d5' }}
                        >
                          @{selectedDomain}
                        </SelectItem>
                      </SelectGroup>
                    )}
                    
                    {/* Others Group */}
                    <SelectGroup>
                      <SelectLabel style={{ color: '#8a8279', fontSize: '10px', paddingLeft: '8px' }}>
                        -- Others --
                      </SelectLabel>
                      {availableDomains
                        .filter(domain => domain !== selectedDomain)
                        .map((domain) => (
                          <SelectItem 
                            key={domain} 
                            value={domain}
                            className="font-mono text-sm cursor-pointer focus:bg-[rgba(201,169,98,0.2)]"
                            style={{ color: '#e8e0d5' }}
                          >
                            @{domain}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <button
                  onClick={() => {
                    if (alternateEmail) {
                      navigator.clipboard.writeText(alternateEmail);
                      toast.success('Alternate email copied!');
                    }
                  }}
                  className="p-1.5 rounded transition-colors hover:opacity-80 shrink-0 ml-auto"
                  aria-label="Copy alternate email"
                >
                  <Copy className="w-4 h-4" style={{ color: '#c9a962' }} />
                </button>
              </div>
            </div>
          )}

          {/* Status Row */}
          <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid rgba(45, 42, 38, 0.5)' }}>
            <div className="flex items-center gap-6">
              {version === 'v1' && (
                <>
                  <span className="text-sm" style={{ color: '#8a8279' }}>
                    Auto-refresh in <span style={{ color: '#e8e0d5' }}>{autoRefreshSeconds}s</span>
                  </span>
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#8a8279' }}>
                    <Clock className="w-4 h-4" />
                    Expires in <span style={{ color: '#e8e0d5' }}>{formatExpiry(expirationSeconds)}</span>
                  </div>
                </>
              )}
              {version === 'v2' && (
                <div className="flex items-center gap-2 text-sm" style={{ color: '#8a8279' }}>
                  <span style={{ color: '#10b981' }}>✓ No expiration</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#10b981' }} />
              <span className="text-sm" style={{ color: '#10b981' }}>Active</span>
            </div>
          </div>
        </div>

        {/* Inbox Card */}
        {version === 'v1' && (
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
        )}

        {/* Footer */}
        <footer className="text-center mt-12 text-sm" style={{ color: '#8a8279' }}>
          <p>Your privacy is protected. Emails are automatically deleted after expiration.</p>
          <p> More applications, code, experiments in the </p>
           
          <a href="https://www.adventurousinvestorhub.com" target="_blank" rel="noopener noreferrer">
            <p className="italic text-lg mb-4" style={{ color: '#c9a962', fontFamily: 'Playfair Display, serif' }}>
            AdventurousInvestorHub.com
          </p>
          </a>
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
