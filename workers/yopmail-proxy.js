// Cloudflare Worker to proxy YopMail API requests
// This bypasses CORS restrictions by forwarding requests server-side

export default {
  async fetch(request, env, ctx) {
    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Extract the path from the request URL
    const url = new URL(request.url);
    
    // Only proxy /api/yopmail requests
    if (!url.pathname.startsWith('/api/yopmail')) {
      return new Response('Not found', { status: 404 });
    }

    try {
      // Forward request to YopMail, keeping the query string
      const yopmailUrl = 'https://yopmail.com' + url.pathname.replace('/api/yopmail', '') + url.search;
      
      const response = await fetch(yopmailUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        return new Response(`YopMail returned ${response.status}`, { status: response.status });
      }

      // Get the response body
      const html = await response.text();

      // Return with CORS headers enabled
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });

    } catch (error) {
      return new Response(`Error fetching from YopMail: ${error.message}`, { 
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  },
};
