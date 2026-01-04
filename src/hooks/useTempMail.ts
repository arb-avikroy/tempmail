import { useState, useEffect, useCallback } from 'react';
import { supabase, Email, TempAddress } from '@/lib/supabase';

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

export const useTempMail = () => {
  const [currentAddress, setCurrentAddress] = useState<TempAddress | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState(AUTO_REFRESH_SECONDS);
  const [expiryMinutes, setExpiryMinutes] = useState(ADDRESS_EXPIRY_MINUTES);

  const generateNewAddress = useCallback(async () => {
    setIsLoading(true);
    const randomPart = generateRandomString(10);
    const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
    const newAddress = `${randomPart}@${domain}`;
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ADDRESS_EXPIRY_MINUTES * 60 * 1000);
    
    const tempAddress: TempAddress = {
      id: crypto.randomUUID(),
      address: newAddress,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    };

    // Save to Supabase if connected
    if (supabase) {
      const { error } = await supabase
        .from('temp_addresses')
        .insert([tempAddress]);
      
      if (error) {
        console.error('Error creating address:', error);
      }
    }

    setCurrentAddress(tempAddress);
    setEmails([]);
    setExpiryMinutes(ADDRESS_EXPIRY_MINUTES);
    setIsLoading(false);
    
    localStorage.setItem('tempAddressId', tempAddress.id);
    localStorage.setItem('tempAddress', JSON.stringify(tempAddress));
  }, []);

  const fetchEmails = useCallback(async () => {
    if (!currentAddress) return;
    
    setIsLoading(true);
    
    if (supabase) {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('address', currentAddress.address)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setEmails(data);
      } else if (error) {
        console.error('Error fetching emails:', error);
      }
    }
    
    setIsLoading(false);
    setAutoRefreshCountdown(AUTO_REFRESH_SECONDS);
  }, [currentAddress]);

  const markAsRead = useCallback(async (emailId: string) => {
    if (supabase) {
      const { error } = await supabase
        .from('emails')
        .update({ is_read: true })
        .eq('id', emailId);
      
      if (!error) {
        setEmails(prev => prev.map(e => 
          e.id === emailId ? { ...e, is_read: true } : e
        ));
      }
    } else {
      setEmails(prev => prev.map(e => 
        e.id === emailId ? { ...e, is_read: true } : e
      ));
    }
  }, []);

  const copyAddress = useCallback(() => {
    if (currentAddress) {
      navigator.clipboard.writeText(currentAddress.address);
    }
  }, [currentAddress]);

  // Initialize or restore address
  useEffect(() => {
    const initAddress = async () => {
      const storedId = localStorage.getItem('tempAddressId');
      const storedAddress = localStorage.getItem('tempAddress');
      
      if (storedId && supabase) {
        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('temp_addresses')
          .select('*')
          .eq('id', storedId)
          .maybeSingle();
        
        if (!error && data) {
          const expiresAt = new Date(data.expires_at);
          if (expiresAt > new Date()) {
            setCurrentAddress(data);
            return;
          }
        }
      } else if (storedAddress) {
        // Fallback to local storage
        try {
          const parsed = JSON.parse(storedAddress) as TempAddress;
          const expiresAt = new Date(parsed.expires_at);
          if (expiresAt > new Date()) {
            setCurrentAddress(parsed);
            return;
          }
        } catch (e) {
          console.error('Error parsing stored address:', e);
        }
      }
      
      // Generate new address if none found or expired
      generateNewAddress();
    };

    initAddress();
  }, [generateNewAddress]);

  // Auto-refresh countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchEmails();
          return AUTO_REFRESH_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchEmails]);

  // Expiry countdown
  useEffect(() => {
    if (!currentAddress) return;

    const updateExpiry = () => {
      const expiresAt = new Date(currentAddress.expires_at);
      const now = new Date();
      const diffMs = expiresAt.getTime() - now.getTime();
      const diffMins = Math.max(0, Math.ceil(diffMs / 60000));
      setExpiryMinutes(diffMins);

      if (diffMins <= 0) {
        generateNewAddress();
      }
    };

    updateExpiry();
    const interval = setInterval(updateExpiry, 60000);

    return () => clearInterval(interval);
  }, [currentAddress, generateNewAddress]);

  // Real-time subscription for new emails
  useEffect(() => {
    if (!currentAddress || !supabase) return;

    const channel = supabase
      .channel('emails-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emails',
          filter: `address=eq.${currentAddress.address}`,
        },
        (payload) => {
          setEmails((prev) => [payload.new as Email, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentAddress]);

  return {
    currentAddress,
    emails,
    isLoading,
    autoRefreshCountdown,
    expiryMinutes,
    generateNewAddress,
    fetchEmails,
    copyAddress,
    markAsRead,
    isConnected: !!supabase,
  };
};
