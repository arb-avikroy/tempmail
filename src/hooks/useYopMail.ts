import { useState, useEffect, useCallback } from 'react';
import { getTodaysDomain, getYopMailDomains } from '@/lib/yopmailDomains';

const AUTO_REFRESH_SECONDS = 30;

export interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
}

interface YopMailResponse {
  inbox: Array<{
    id: string;
    from: string;
    subject: string;
    timestamp: number;
  }>;
}

// Generate random string for email address
function generateRandomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a new YopMail email address (always use yopmail.com for main address)
function generateYopMailAddress(): string {
  const username = generateRandomString(10);
  return `${username}@yopmail.com`;
}

// Get the YopMail inbox URL for viewing in iframe or new tab
function getYopMailInboxUrl(email: string): string {
  const username = email.split('@')[0];
  return `https://yopmail.com/en/?login=${encodeURIComponent(username)}`;
}

export const useYopMail = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [alternateEmail, setAlternateEmail] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefreshSeconds, setAutoRefreshSeconds] = useState(AUTO_REFRESH_SECONDS);
  const [yopmailUrl, setYopmailUrl] = useState<string>('');

  const generateNewEmail = useCallback(async () => {
    const newEmail = generateYopMailAddress();
    setEmail(newEmail);
    
    // Fetch today's featured domain for alternate email
    const { domain: todayDomain, isLive: liveStatus } = await getTodaysDomain();
    const username = newEmail.split('@')[0];
    const altEmail = `${username}@${todayDomain}`;
    setAlternateEmail(altEmail);
    setSelectedDomain(todayDomain);
    setIsLive(liveStatus);
    
    setMessages([]);
    setYopmailUrl(getYopMailInboxUrl(newEmail));
    
    localStorage.setItem('yopmailAddress', newEmail);
  }, []);

  const changeDomain = useCallback((domain: string) => {
    if (email) {
      const username = email.split('@')[0];
      const altEmail = `${username}@${domain}`;
      setAlternateEmail(altEmail);
      setSelectedDomain(domain);
    }
  }, [email]);

  // Since YopMail doesn't have a public API, we'll use a placeholder for messages
  // Users will need to check emails directly on YopMail website
  const refreshInbox = useCallback(async () => {
    if (!email) return;
    
    setIsLoading(true);
    try {
      // YopMail doesn't have a public API, so we'll just reset the countdown
      // In a real implementation with a proxy/scraper, you'd fetch emails here
      setAutoRefreshSeconds(AUTO_REFRESH_SECONDS);
      
      // Placeholder message to guide users
      if (messages.length === 0) {
        setMessages([
          {
            id: 'info-1',
            from: 'YopMail Service',
            subject: 'Click "Open Inbox" to check your emails',
            preview: 'YopMail emails are checked directly on their website. Click the "Open Inbox" button above to view your emails in a new tab.',
            date: new Date().toISOString(),
            isRead: false,
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to refresh inbox:', error);
    } finally {
      setIsLoading(false);
    }
  }, [email, messages.length]);

  const copyAddress = useCallback(() => {
    if (email) {
      navigator.clipboard.writeText(email);
    }
  }, [email]);

  const markAsRead = useCallback(async (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, isRead: true } : m
    ));
  }, []);

  const getMessageContent = useCallback(async (messageId: string): Promise<{ text?: string; html?: string }> => {
    // Since we don't have API access, return a message directing users to YopMail
    return {
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>View Your Email on YopMail</h2>
          <p>YopMail doesn't provide a public API, so please check your emails directly on their website.</p>
          <p><a href="${yopmailUrl}" target="_blank" rel="noopener noreferrer" style="color: #c9a962;">Click here to open your YopMail inbox</a></p>
        </div>
      `,
      text: `View your email at: ${yopmailUrl}`
    };
  }, [yopmailUrl]);

  const openInbox = useCallback(() => {
    if (yopmailUrl) {
      window.open(yopmailUrl, '_blank', 'noopener,noreferrer');
    }
  }, [yopmailUrl]);

  // Fetch available domains on mount
  useEffect(() => {
    const fetchDomains = async () => {
      const { domains, isLive: liveStatus } = await getYopMailDomains();
      setAvailableDomains(domains);
      setIsLive(liveStatus);
    };
    fetchDomains();
  }, []);

  // Initialize or restore email
  useEffect(() => {
    const initializeEmail = async () => {
      const stored = localStorage.getItem('yopmailAddress');
      
      if (stored) {
        setEmail(stored);
        setYopmailUrl(getYopMailInboxUrl(stored));
        
        // Generate alternate email for stored address
        const username = stored.split('@')[0];
        const { domain: todayDomain, isLive: liveStatus } = await getTodaysDomain();
        const altEmail = `${username}@${todayDomain}`;
        setAlternateEmail(altEmail);
        setSelectedDomain(todayDomain);
        setIsLive(liveStatus);
      } else {
        generateNewEmail();
      }
    };
    
    initializeEmail();
  }, [generateNewEmail]);

  // Auto-refresh countdown
  useEffect(() => {
    if (!email) return;

    const interval = setInterval(() => {
      setAutoRefreshSeconds(prev => {
        if (prev <= 1) {
          refreshInbox();
          return AUTO_REFRESH_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email, refreshInbox]);

  // Initial fetch when email is set
  useEffect(() => {
    if (email) {
      refreshInbox();
    }
  }, [email, refreshInbox]);

  return {
    email,
    alternateEmail,
    selectedDomain,
    availableDomains,
    isLive,
    messages,
    isLoading,
    autoRefreshSeconds,
    expirationSeconds: 0, // YopMail emails don't expire
    generateNewEmail,
    refreshInbox,
    copyAddress,
    markAsRead,
    getMessageContent,
    isConnected: true,
    yopmailUrl,
    openInbox,
    changeDomain,
  };
};
