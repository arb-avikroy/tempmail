# Deploying to Vercel

## Quick Setup

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- Project name? `tempmail` (or press Enter)
- In which directory is your code? `./` (press Enter)
- Want to override settings? **N**

4. **Production Deploy**:
```bash
vercel --prod
```

5. **Custom Domain Setup**:
```bash
vercel domains add temp-mail.adventurousinvestorhub.com
```

Then add the DNS records shown by Vercel to your domain provider.

## Alternative: Deploy via GitHub

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect settings
5. Click "Deploy"
6. Add custom domain in project settings

## How it works

- Development (`npm run dev`): Uses Vite proxy to `/api/yopmail`
- Production (Vercel): Uses serverless function at `/api/yopmail.js`
- The serverless function proxies requests to YopMail API, avoiding CORS
