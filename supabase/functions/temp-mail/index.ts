import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MAIL_TM_API = "https://api.mail.tm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateAccountResponse {
  id: string;
  address: string;
  token: string;
}

interface Message {
  id: string;
  from: { address: string; name: string };
  subject: string;
  intro: string;
  seen: boolean;
  createdAt: string;
}

interface FullMessage extends Message {
  text?: string;
  html?: string[];
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
  console.log("Fetching available domains...");
  const response = await fetch(`${MAIL_TM_API}/domains`);
  
  if (!response.ok) {
    console.error("Failed to fetch domains:", response.status);
    throw new Error("Failed to fetch available domains");
  }
  
  const data = await response.json();
  const domains = data["hydra:member"]?.map((d: { domain: string }) => d.domain) || [];
  console.log("Available domains:", domains);
  return domains;
}

// Create a new Mail.tm account
async function createAccount(): Promise<CreateAccountResponse> {
  const domains = await getDomains();
  
  if (domains.length === 0) {
    throw new Error("No domains available");
  }
  
  const domain = domains[0];
  const username = generateRandomString(10);
  const address = `${username}@${domain}`;
  const password = generateRandomString(16);
  
  console.log("Creating account for:", address);
  
  // Create account
  const createResponse = await fetch(`${MAIL_TM_API}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  
  if (!createResponse.ok) {
    const error = await createResponse.text();
    console.error("Failed to create account:", error);
    throw new Error("Failed to create email account");
  }
  
  const account = await createResponse.json();
  console.log("Account created:", account.id);
  
  // Get auth token
  const tokenResponse = await fetch(`${MAIL_TM_API}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  
  if (!tokenResponse.ok) {
    console.error("Failed to get token");
    throw new Error("Failed to authenticate");
  }
  
  const tokenData = await tokenResponse.json();
  console.log("Token obtained successfully");
  
  return {
    id: account.id,
    address: account.address,
    token: tokenData.token,
  };
}

// Get messages for an account
async function getMessages(token: string): Promise<Message[]> {
  console.log("Fetching messages...");
  
  const response = await fetch(`${MAIL_TM_API}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    console.error("Failed to fetch messages:", response.status);
    throw new Error("Failed to fetch messages");
  }
  
  const data = await response.json();
  const messages = data["hydra:member"] || [];
  console.log("Found", messages.length, "messages");
  return messages;
}

// Get full message content
async function getMessage(token: string, messageId: string): Promise<FullMessage> {
  console.log("Fetching message:", messageId);
  
  const response = await fetch(`${MAIL_TM_API}/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    console.error("Failed to fetch message:", response.status);
    throw new Error("Failed to fetch message");
  }
  
  const message = await response.json();
  console.log("Message fetched successfully");
  return message;
}

// Mark message as read
async function markAsRead(token: string, messageId: string): Promise<void> {
  console.log("Marking message as read:", messageId);
  
  const response = await fetch(`${MAIL_TM_API}/messages/${messageId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/merge-patch+json",
    },
    body: JSON.stringify({ seen: true }),
  });
  
  if (!response.ok) {
    console.error("Failed to mark as read:", response.status);
    throw new Error("Failed to mark message as read");
  }
  
  console.log("Message marked as read");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, token, messageId } = await req.json();
    console.log("Action:", action);

    let result;

    switch (action) {
      case "create":
        result = await createAccount();
        break;

      case "getMessages":
        if (!token) throw new Error("Token required");
        result = await getMessages(token);
        break;

      case "getMessage":
        if (!token || !messageId) throw new Error("Token and messageId required");
        result = await getMessage(token, messageId);
        break;

      case "markAsRead":
        if (!token || !messageId) throw new Error("Token and messageId required");
        await markAsRead(token, messageId);
        result = { success: true };
        break;

      default:
        throw new Error("Invalid action");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
