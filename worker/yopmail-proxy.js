// Cloudflare Worker to proxy YopMail API and bypass CORS
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Only handle /api/yopmail/domain requests
    if (url.pathname === '/api/yopmail/domain' && url.searchParams.get('d') === 'list') {
      try {
        const response = await fetch('https://yopmail.com/domain?d=list', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        if (!response.ok) {
          return new Response('Failed to fetch from YopMail', { status: response.status });
        }

        const html = await response.text();

        // Return with CORS headers
        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
          }
        });
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }

    // For all other requests, return 404
    return new Response('Not Found', { status: 404 });
  }
};
