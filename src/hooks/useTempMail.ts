import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const ADDRESS_EXPIRY_MINUTES = 60;
const AUTO_REFRESH_SECONDS = 30;

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

export const useTempMail = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefreshSeconds, setAutoRefreshSeconds] = useState(AUTO_REFRESH_SECONDS);
  const [expirationSeconds, setExpirationSeconds] = useState(ADDRESS_EXPIRY_MINUTES * 60);
  const [accountData, setAccountData] = useState<AccountData | null>(null);

  const invokeFunction = async (action: string, params: Record<string, unknown> = {}) => {
    if (!supabase) {
      console.error('Supabase not connected');
      throw new Error('Backend not connected');
    }

    const { data, error } = await supabase.functions.invoke('temp-mail', {
      body: { action, ...params },
    });

    if (error) {
      console.error('Function error:', error);
      throw new Error(error.message);
    }

    if (data?.error) {
      console.error('API error:', data.error);
      throw new Error(data.error);
    }

    return data;
  };

  const generateNewEmail = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await invokeFunction('create');
      
      const account: AccountData = {
        id: data.id,
        address: data.address,
        token: data.token,
        createdAt: new Date().toISOString(),
      };

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
      const data = await invokeFunction('getMessages', { token: accountData.token });
      
      const formattedMessages: Message[] = data.map((msg: {
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
    
    const data = await invokeFunction('getMessage', { 
      token: accountData.token, 
      messageId 
    });
    
    return {
      text: data.text,
      html: data.html?.join('') || data.text,
    };
  }, [accountData?.token]);

  const markAsRead = useCallback(async (messageId: string) => {
    if (!accountData?.token) return;
    
    try {
      await invokeFunction('markAsRead', { token: accountData.token, messageId });
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
    isConnected: !!supabase,
  };
};
