import { useState, useEffect, useCallback } from 'react';

const ADDRESS_EXPIRY_MINUTES = 60;
const AUTO_REFRESH_SECONDS = 30;
const MAIL_TM_API = "https://api.mail.tm";

export interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
}

interface AccountData {
  id: string;
  address: string;
  token: string;
  createdAt: string;
}

interface FullMessageContent {
  text?: string;
  html?: string;
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

// Get available domains from Mail.tm
async function getDomains(): Promise<string[]> {
  const response = await fetch(`${MAIL_TM_API}/domains`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch available domains");
  }
  
  const data = await response.json();
  const domains = data["hydra:member"]?.map((d: { domain: string }) => d.domain) || [];
  return domains;
}

// Create a new Mail.tm account
async function createAccount(): Promise<AccountData> {
  const domains = await getDomains();
  
  if (domains.length === 0) {
    throw new Error("No domains available");
  }
  
  const domain = domains[0];
  const username = generateRandomString(10);
  const address = `${username}@${domain}`;
  const password = generateRandomString(16);
  
  // Create account
  const createResponse = await fetch(`${MAIL_TM_API}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  
  if (!createResponse.ok) {
    throw new Error("Failed to create email account");
  }
  
  const account = await createResponse.json();
  
  // Get auth token
  const tokenResponse = await fetch(`${MAIL_TM_API}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  
  if (!tokenResponse.ok) {
    throw new Error("Failed to authenticate");
  }
  
  const tokenData = await tokenResponse.json();
  
  return {
    id: account.id,
    address: account.address,
    token: tokenData.token,
    createdAt: new Date().toISOString(),
  };
}

// Get messages for an account
async function getMessages(token: string): Promise<Message[]> {
  const response = await fetch(`${MAIL_TM_API}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  
  const data = await response.json();
  const messages = data["hydra:member"] || [];
  
  return messages.map((msg: {
    id: string;
    from: { address: string; name: string };
    subject: string;
    intro: string;
    seen: boolean;
    createdAt: string;
  }) => ({
    id: msg.id,
    from: msg.from?.name || msg.from?.address || 'Unknown',
    subject: msg.subject || '(No subject)',
    preview: msg.intro || '',
    date: msg.createdAt,
    isRead: msg.seen,
  }));
}

// Get full message content
async function getMessage(token: string, messageId: string): Promise<FullMessageContent> {
  const response = await fetch(`${MAIL_TM_API}/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch message");
  }
  
  const message = await response.json();
  
  return {
    text: message.text,
    html: message.html?.join('') || message.text,
  };
}

// Mark message as read
async function markMessageAsRead(token: string, messageId: string): Promise<void> {
  const response = await fetch(`${MAIL_TM_API}/messages/${messageId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/merge-patch+json",
    },
    body: JSON.stringify({ seen: true }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to mark message as read");
  }
}

export const useTempMail = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefreshSeconds, setAutoRefreshSeconds] = useState(AUTO_REFRESH_SECONDS);
  const [expirationSeconds, setExpirationSeconds] = useState(ADDRESS_EXPIRY_MINUTES * 60);
  const [accountData, setAccountData] = useState<AccountData | null>(null);

  const generateNewEmail = useCallback(async () => {
    setIsLoading(true);
    try {
      const account = await createAccount();
      
      setAccountData(account);
      setEmail(account.address);
      setMessages([]);
      setExpirationSeconds(ADDRESS_EXPIRY_MINUTES * 60);
      
      localStorage.setItem('tempMailAccount', JSON.stringify(account));
    } catch (error) {
      console.error('Failed to generate email:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshInbox = useCallback(async () => {
    if (!accountData?.token) return;
    
    setIsLoading(true);
    try {
      const formattedMessages = await getMessages(accountData.token);
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to refresh inbox:', error);
    } finally {
      setIsLoading(false);
      setAutoRefreshSeconds(AUTO_REFRESH_SECONDS);
    }
  }, [accountData?.token]);

  const getMessageContent = useCallback(async (messageId: string): Promise<FullMessageContent> => {
    if (!accountData?.token) throw new Error('Not authenticated');
    
    return await getMessage(accountData.token, messageId);
  }, [accountData?.token]);

  const markAsRead = useCallback(async (messageId: string) => {
    if (!accountData?.token) return;
    
    try {
      await markMessageAsRead(accountData.token, messageId);
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, isRead: true } : m
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [accountData?.token]);

  const copyAddress = useCallback(() => {
    if (email) {
      navigator.clipboard.writeText(email);
    }
  }, [email]);

  // Initialize or restore account
  useEffect(() => {
    const initAccount = async () => {
      const stored = localStorage.getItem('tempMailAccount');
      
      if (stored) {
        try {
          const parsed: AccountData = JSON.parse(stored);
          const createdAt = new Date(parsed.createdAt);
          const expiresAt = new Date(createdAt.getTime() + ADDRESS_EXPIRY_MINUTES * 60 * 1000);
          
          if (expiresAt > new Date()) {
            setAccountData(parsed);
            setEmail(parsed.address);
            return;
          }
        } catch (e) {
          console.error('Error parsing stored account:', e);
        }
      }
      
      // Generate new if none found or expired
      await generateNewEmail();
    };

    initAccount();
  }, [generateNewEmail]);

  // Auto-refresh countdown
  useEffect(() => {
    if (!accountData) return;

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
  }, [accountData, refreshInbox]);

  // Expiration countdown
  useEffect(() => {
    if (!accountData) return;

    const updateExpiry = () => {
      const createdAt = new Date(accountData.createdAt);
      const expiresAt = new Date(createdAt.getTime() + ADDRESS_EXPIRY_MINUTES * 60 * 1000);
      const now = new Date();
      const diffMs = expiresAt.getTime() - now.getTime();
      const diffSecs = Math.max(0, Math.ceil(diffMs / 1000));
      setExpirationSeconds(diffSecs);

      if (diffSecs <= 0) {
        localStorage.removeItem('tempMailAccount');
        generateNewEmail();
      }
    };

    updateExpiry();
    const interval = setInterval(updateExpiry, 1000);

    return () => clearInterval(interval);
  }, [accountData, generateNewEmail]);

  // Initial fetch when account is set
  useEffect(() => {
    if (accountData?.token) {
      refreshInbox();
    }
  }, [accountData?.token, refreshInbox]);

  return {
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
    isConnected: true, // Always connected since we're using direct API calls
  };
};