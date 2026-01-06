// @deno-types="npm:@types/cors@^2.8.17"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

console.log("Mail proxy function started")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.searchParams.get('path')
    
    if (!path) {
      throw new Error('Missing path parameter')
    }

    console.log(`Proxying request to: https://api.mail.tm/${path}`)

    // Build headers
    const proxyHeaders = new Headers({
      'Content-Type': 'application/json',
    })

    // Forward auth header if present (but not Supabase auth)
    const authHeader = req.headers.get('authorization')
    if (authHeader && !authHeader.startsWith('Bearer ey')) {
      proxyHeaders.set('Authorization', authHeader)
    }

    // Get body for non-GET requests
    const body = req.method !== 'GET' ? await req.text() : undefined

    // Make the proxied request
    const response = await fetch(`https://api.mail.tm/${path}`, {
      method: req.method,
      headers: proxyHeaders,
      body: body || undefined,
    })

    const data = await response.text()
    
    console.log(`Response status: ${response.status}`)

    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('Error:', error.message)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})