# Vercel Deployment Guide

This guide will walk you through deploying your Next.js portfolio to Vercel.

## Prerequisites

✅ Project is built successfully (`npm run build` passes)
✅ Code is committed to Git
✅ GitHub repository is set up: `git@github.com-personal:Sheiphan/my-portfolio.git`

## Step-by-Step Deployment Instructions

### 1. Sign Up for Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" in the top right corner
3. Choose "Continue with GitHub" for seamless integration
4. Authorize Vercel to access your GitHub account

### 2. Import Your GitHub Repository

1. Once logged in, click "Add New..." → "Project"
2. You'll see a list of your GitHub repositories
3. Find `Sheiphan/my-portfolio` in the list
4. Click "Import" next to the repository

### 3. Configure Project Settings

Vercel will automatically detect your Next.js project. You should see:

**Framework Preset:** Next.js (auto-detected) ✓

**Build Settings:**
- Build Command: `npm run build` (auto-configured)
- Output Directory: `.next` (auto-configured)
- Install Command: `npm install` (auto-configured)

**Root Directory:** `./` (leave as default)

**Node.js Version:** 18.x or higher (auto-configured)

### 4. Environment Variables

For this basic portfolio, **no environment variables are required**. 

If you add features in the future that need environment variables (like analytics, CMS, or API keys), you can add them in the Vercel dashboard under:
- Project Settings → Environment Variables

### 5. Deploy

1. Review the configuration (everything should be auto-detected correctly)
2. Click the **"Deploy"** button
3. Vercel will:
   - Clone your repository
   - Install dependencies
   - Run the build process
   - Deploy your site to their global CDN

The deployment typically takes 1-2 minutes.

### 6. Verify Deployment

Once deployment completes, you'll see:

1. **Deployment URL**: A unique Vercel URL like `https://my-portfolio-xxxxx.vercel.app`
2. **Deployment Status**: Should show "Ready" with a green checkmark
3. **Build Logs**: Available to review if needed

Click "Visit" to open your live site!

### 7. Test Your Live Site

Visit your Vercel URL and test:

- ✅ Home page loads correctly
- ✅ Navigation works (Home, Projects, Updates)
- ✅ Projects page displays all projects
- ✅ Individual project pages load (click on a project card)
- ✅ Updates page displays all blog posts
- ✅ Individual update pages load (click on an update)
- ✅ Images load correctly
- ✅ Dark theme is applied
- ✅ Responsive design works on mobile (use browser dev tools)
- ✅ All links work correctly

### 8. Automatic Deployments

Vercel is now configured for automatic deployments:

- **Production Deployments**: Every push to `main` branch automatically deploys to production
- **Preview Deployments**: Pull requests get their own preview URLs for testing
- **Instant Rollbacks**: You can rollback to any previous deployment with one click

## Post-Deployment Tasks

### Optional: Configure Custom Domain

If you have a custom domain:

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain name (e.g., `yourname.com`)
4. Follow Vercel's instructions to configure DNS records
5. Vercel will automatically provision SSL certificate

### Monitor Your Site

- **Analytics**: Enable Vercel Analytics in Project Settings
- **Performance**: Check Lighthouse scores at [web.dev/measure](https://web.dev/measure)
- **Uptime**: Vercel provides 99.99% uptime SLA

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure `npm run build` works locally
- Verify all dependencies are in `package.json`

### 404 Errors

- Ensure all content files are committed to Git
- Check that file paths are correct (case-sensitive)
- Verify dynamic routes are generating correctly

### Images Not Loading

- Ensure images are in the `public/` directory
- Check image paths start with `/` (e.g., `/images/project.png`)
- Verify images are committed to Git

## Your Deployment URLs

Once deployed, save these URLs:

- **Production URL**: `https://my-portfolio-xxxxx.vercel.app` (will be provided after deployment)
- **GitHub Repository**: `https://github.com/Sheiphan/my-portfolio`
- **Vercel Dashboard**: `https://vercel.com/dashboard`

## Next Steps

After successful deployment:

1. ✅ Share your portfolio URL
2. ✅ Add the URL to your GitHub repository description
3. ✅ Update your resume/LinkedIn with the live link
4. ✅ Consider adding a custom domain
5. ✅ Monitor analytics and performance

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Vercel Support**: Available in dashboard

---

**Ready to deploy?** Follow the steps above and your portfolio will be live in minutes! 🚀
