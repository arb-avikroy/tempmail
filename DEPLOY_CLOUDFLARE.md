# Deploying with Cloudflare Workers

## Quick Setup

### 1. Install Wrangler (Cloudflare CLI)

```bash
npm install -g wrangler
```

Or use without installation:
```bash
npx wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

This will open a browser to authenticate.

### 3. Update wrangler.toml

Edit `wrangler.toml` and update the route with your actual Cloudflare zone:

```toml
routes = [
  { pattern = "temp-mail.adventurousinvestorhub.com/api/yopmail/*", zone_name = "adventurousinvestorhub.com" }
]
```

### 4. Deploy the Worker

```bash
wrangler deploy
```

### 5. Configure Cloudflare Pages (for static site)

1. Go to Cloudflare Dashboard → Pages
2. Create a new project
3. Connect your GitHub repository: `arb-avikroy/tempmail`
4. Build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click "Save and Deploy"

### 6. Add Custom Domain

1. In Cloudflare Pages → Your Project → Custom domains
2. Add `temp-mail.adventurousinvestorhub.com`
3. Cloudflare will auto-configure DNS

## How it Works

- **Static Site**: Hosted on Cloudflare Pages (like GitHub Pages but faster)
- **API Proxy**: Cloudflare Worker intercepts `/api/yopmail/*` requests
- **CORS Bypass**: Worker fetches from YopMail and adds CORS headers
- **Caching**: Worker caches responses for 1 hour to reduce API calls

## Alternative: Worker Only (No Pages)

If you want to keep GitHub Pages for the static site and only use Worker for API:

```bash
# Deploy just the worker
wrangler deploy

# Then add a route in Cloudflare Dashboard:
# Workers & Pages → yopmail-proxy → Settings → Triggers → Routes
# Add route: temp-mail.adventurousinvestorhub.com/api/yopmail/*
```

## Testing

Development server (with Vite proxy):
```bash
npm run dev
```

Test worker locally:
```bash
wrangler dev
```

Production URL will be:
- Static site: `https://temp-mail.adventurousinvestorhub.com`
- API proxy: `https://temp-mail.adventurousinvestorhub.com/api/yopmail/domain?d=list`
