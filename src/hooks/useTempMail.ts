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

    // Try to save to Supabase if configured
    try {
      const { error } = await supabase
        .from('temp_addresses')
        .insert([tempAddress]);
      
      if (error) {
        console.log('Supabase not configured, using local storage');
      }
    } catch (e) {
      console.log('Using local mode');
    }

    setCurrentAddress(tempAddress);
    setEmails([]);
    setExpiryMinutes(ADDRESS_EXPIRY_MINUTES);
    setIsLoading(false);
    
    localStorage.setItem('tempAddress', JSON.stringify(tempAddress));
  }, []);

  const fetchEmails = useCallback(async () => {
    if (!currentAddress) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('address', currentAddress.address)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setEmails(data);
      }
    } catch (e) {
      // Supabase not configured, simulate empty inbox
      console.log('Supabase not configured');
    }
    
    setIsLoading(false);
    setAutoRefreshCountdown(AUTO_REFRESH_SECONDS);
  }, [currentAddress]);

  const copyAddress = useCallback(() => {
    if (currentAddress) {
      navigator.clipboard.writeText(currentAddress.address);
    }
  }, [currentAddress]);

  // Initialize or restore address
  useEffect(() => {
    const stored = localStorage.getItem('tempAddress');
    if (stored) {
      const parsed = JSON.parse(stored) as TempAddress;
      const expiresAt = new Date(parsed.expires_at);
      if (expiresAt > new Date()) {
        setCurrentAddress(parsed);
        return;
      }
    }
    generateNewAddress();
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

    const interval = setInterval(() => {
      const expiresAt = new Date(currentAddress.expires_at);
      const now = new Date();
      const diffMs = expiresAt.getTime() - now.getTime();
      const diffMins = Math.max(0, Math.ceil(diffMs / 60000));
      setExpiryMinutes(diffMins);

      if (diffMins <= 0) {
        generateNewAddress();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentAddress, generateNewAddress]);

  return {
    currentAddress,
    emails,
    isLoading,
    autoRefreshCountdown,
    expiryMinutes,
    generateNewAddress,
    fetchEmails,
    copyAddress,
  };
};
