---
description: Workflow for deploying the project to Vercel
---

# Vercel Deployment Workflow

## Prerequisites

- Vercel CLI installed: `npm i -g vercel`
- Vercel account linked: `vercel login`
- Project linked: `vercel link`

## 1. Pre-Deployment Checks

// turbo
```bash
npm run lint
```

// turbo
```bash
npm run build
```

- Verify no build errors
- Check `dist/` output is correct

## 2. Preview Deployment

Deploy a preview to test before production:

```bash
vercel
```

- Opens a preview URL (e.g., `unlimited-games-xxx.vercel.app`)
- Test all games work
- Share preview URL for review

## 3. Production Deployment

```bash
vercel --prod
```

## 4. Post-Deployment

- Verify live URL loads correctly
- Test game navigation from hub
- Check browser console for errors
- Verify asset caching headers

## Auto-Deploy (Recommended)

Connect your GitHub repo to Vercel for automatic deployments:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy

After setup:
- **Push to `main`** → auto-deploys to production
- **Push to feature branches** → creates preview deployments

## Environment Variables

Set in Vercel dashboard (`Settings > Environment Variables`) if needed:

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API endpoint (if any) |
| `NODE_VERSION` | Node.js version (default: 18.x) |

## Rollback

If a deployment has issues:

```bash
vercel rollback
```

Or use the Vercel dashboard to promote a previous deployment.

## Notes

- The `doodle` multiplayer game requires a WebSocket server — it will **not work** on Vercel's static hosting. Consider Vercel Serverless Functions or a separate server for it.
- All other games are fully static and will work perfectly.
