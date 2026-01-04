import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  address: string;
  sender: string;
  subject: string;
  body: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Received email webhook request");
  console.log("Method:", req.method);
  console.log("Content-Type:", req.headers.get("content-type"));

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let emailData: EmailPayload;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Handle JSON payload (custom webhook or SendGrid Inbound Parse with JSON)
      const json = await req.json();
      console.log("JSON payload received:", JSON.stringify(json, null, 2));

      // Support multiple formats
      if (json.sender && json.recipient) {
        // SendGrid format
        emailData = {
          address: json.recipient || json.to,
          sender: json.sender || json.from,
          subject: json.subject || "(No Subject)",
          body: json.text || json.html || json.body || "",
        };
      } else if (json.from && json.to) {
        // Mailgun format or generic format
        emailData = {
          address: json.to || json.recipient,
          sender: json.from || json.sender,
          subject: json.subject || "(No Subject)",
          body: json.body_plain || json["body-plain"] || json.text || json.body || "",
        };
      } else {
        // Direct format (for testing)
        emailData = {
          address: json.address || json.to || json.recipient,
          sender: json.sender || json.from,
          subject: json.subject || "(No Subject)",
          body: json.body || json.text || "",
        };
      }
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      // Handle form data (Mailgun default format)
      const formData = await req.formData();
      console.log("Form data received");
      
      // Log all form fields for debugging
      for (const [key, value] of formData.entries()) {
        console.log(`Form field: ${key} = ${typeof value === 'string' ? value.substring(0, 100) : '[File]'}`);
      }

      emailData = {
        address: formData.get("recipient")?.toString() || formData.get("To")?.toString() || "",
        sender: formData.get("sender")?.toString() || formData.get("from")?.toString() || formData.get("From")?.toString() || "",
        subject: formData.get("subject")?.toString() || formData.get("Subject")?.toString() || "(No Subject)",
        body: formData.get("body-plain")?.toString() || formData.get("stripped-text")?.toString() || formData.get("body-html")?.toString() || "",
      };
    } else {
      console.error("Unsupported content type:", contentType);
      return new Response(
        JSON.stringify({ error: "Unsupported content type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Parsed email data:", JSON.stringify(emailData, null, 2));

    // Validate required fields
    if (!emailData.address) {
      console.error("Missing recipient address");
      return new Response(
        JSON.stringify({ error: "Missing recipient address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!emailData.sender) {
      console.error("Missing sender");
      return new Response(
        JSON.stringify({ error: "Missing sender" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract just the email address from formats like "Name <email@domain.com>"
    const extractEmail = (emailStr: string): string => {
      const match = emailStr.match(/<([^>]+)>/);
      return match ? match[1] : emailStr.trim();
    };

    const recipientEmail = extractEmail(emailData.address);
    const senderEmail = extractEmail(emailData.sender);

    console.log("Recipient email:", recipientEmail);
    console.log("Sender email:", senderEmail);

    // Check if the recipient address exists in temp_addresses
    const { data: addressData, error: addressError } = await supabase
      .from("temp_addresses")
      .select("id, expires_at")
      .eq("address", recipientEmail)
      .maybeSingle();

    if (addressError) {
      console.error("Error checking address:", addressError);
      return new Response(
        JSON.stringify({ error: "Database error checking address" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!addressData) {
      console.log("Address not found:", recipientEmail);
      // Still return 200 to acknowledge receipt (prevents retries)
      return new Response(
        JSON.stringify({ status: "rejected", reason: "Address not found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if address has expired
    const expiresAt = new Date(addressData.expires_at);
    if (expiresAt < new Date()) {
      console.log("Address expired:", recipientEmail);
      return new Response(
        JSON.stringify({ status: "rejected", reason: "Address expired" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert the email into the database
    const { data: insertData, error: insertError } = await supabase
      .from("emails")
      .insert({
        address: recipientEmail,
        sender: emailData.sender,
        subject: emailData.subject,
        body: emailData.body,
        is_read: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting email:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to store email", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email stored successfully:", insertData.id);

    return new Response(
      JSON.stringify({ 
        status: "success", 
        message: "Email received and stored",
        email_id: insertData.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
