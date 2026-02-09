# Cloudflare Workers Deployment Guide

## Setup

1. **Install Wrangler CLI (Cloudflare's deployment tool):**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Deploy the worker:**
   ```bash
   wrangler deploy
   ```

## Configure Custom Domain Route

After deploying, go to your Cloudflare dashboard:

1. Navigate to **Workers & Pages** > **yopmail-proxy**
2. Go to **Settings** > **Triggers** > **Routes**
3. Add route: `temp-mail.adventurousinvestorhub.com/api/yopmail/*`
4. Select your zone: `adventurousinvestorhub.com`

Or use the Cloudflare dashboard to add the route automatically.

## Test the Worker

After deployment, test with:
```bash
curl https://temp-mail.adventurousinvestorhub.com/api/yopmail/domain?d=list
```

You should see HTML with the domain list from YopMail.

## How It Works

- **Development**: Vite proxy handles `/api/yopmail/*` → `https://yopmail.com/*`
- **Production**: Cloudflare Worker handles `/api/yopmail/*` → `https://yopmail.com/*`
- Both bypass CORS restrictions
- Worker caches responses for 1 hour

## Free Tier Limits

Cloudflare Workers free tier includes:
- 100,000 requests per day
- More than enough for a temporary email service

## Troubleshooting

If domains show "Server Down" after deployment:
1. Check worker logs: `wrangler tail`
2. Verify route is configured correctly
3. Test worker directly: `https://yopmail-proxy.<your-subdomain>.workers.dev/api/yopmail/domain?d=list`
4. Clear browser cache and localStorage
