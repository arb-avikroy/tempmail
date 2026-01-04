import { RefreshCw, Plus, Mail, Copy, Clock, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

const DOMAINS = ['airsworld.net', 'tempmail.io', 'quickmail.dev'];
const ADDRESS_EXPIRY_MINUTES = 60;
const AUTO_REFRESH_SECONDS = 30;

const generateRandomString = (length: number): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const Index = () => {
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState(AUTO_REFRESH_SECONDS);
  const [expiryMinutes, setExpiryMinutes] = useState(ADDRESS_EXPIRY_MINUTES);
  const [copied, setCopied] = useState(false);

  const generateNewAddress = useCallback(() => {
    setIsLoading(true);
    const randomPart = generateRandomString(10);
    const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
    const newAddress = `${randomPart}@${domain}`;
    setCurrentAddress(newAddress);
    setExpiryMinutes(ADDRESS_EXPIRY_MINUTES);
    setIsLoading(false);
    localStorage.setItem('tempAddress', newAddress);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    toast.success('Email address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewEmail = () => {
    generateNewAddress();
    toast.success('New temporary email generated');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
    toast.info('Checking for new emails...');
  };

  const formatExpiry = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Initialize address
  useEffect(() => {
    const stored = localStorage.getItem('tempAddress');
    if (stored) {
      setCurrentAddress(stored);
    } else {
      generateNewAddress();
    }
  }, [generateNewAddress]);

  // Auto-refresh countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoRefreshCountdown((prev) => {
        if (prev <= 1) {
          return AUTO_REFRESH_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
                {currentAddress || 'Generating...'}
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
                Auto-refresh in <span style={{ color: '#e8e0d5' }}>{autoRefreshCountdown}s</span>
              </span>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#8a8279' }}>
                <Clock className="w-4 h-4" />
                Expires in <span style={{ color: '#e8e0d5' }}>{formatExpiry(expiryMinutes)}</span>
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
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(201, 169, 98, 0.1)', border: '1px solid rgba(201, 169, 98, 0.2)' }}>
              <Inbox className="w-5 h-5" style={{ color: '#c9a962' }} />
            </div>
            <h2 className="text-lg" style={{ color: '#e8e0d5', fontFamily: 'Playfair Display, serif' }}>Inbox</h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full animate-spin mb-4" style={{ border: '2px solid rgba(201, 169, 98, 0.2)', borderTopColor: '#c9a962' }} />
              <p style={{ color: '#8a8279' }}>Checking for new messages...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full mb-4" style={{ backgroundColor: 'rgba(45, 42, 38, 0.5)' }}>
                <Mail className="w-8 h-8" style={{ color: '#8a8279' }} />
              </div>
              <p style={{ color: '#8a8279' }}>No messages yet</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(138, 130, 121, 0.7)' }}>
                Emails sent to your address will appear here
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-sm" style={{ color: '#8a8279' }}>
          <p>Your privacy is protected. Emails are automatically deleted after expiration.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
