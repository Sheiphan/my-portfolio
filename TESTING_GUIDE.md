# Performance Testing Guide

## Testing the Production Build Locally

### 1. Build the Production Version
```bash
npm run build
```

Expected output:
- ✅ All pages should show as Static (○) or SSG (●)
- ✅ No build errors or warnings
- ✅ CSS bundle should be ~11-12 kB
- ✅ First Load JS should be < 200 kB for all routes

### 2. Start the Production Server
```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Manual Testing Checklist

#### Navigation Testing
- [ ] Visit home page (`/`)
- [ ] Navigate to Projects page (`/projects`)
- [ ] Click on each project card to view details
- [ ] Navigate to Updates page (`/updates`)
- [ ] Click on each update to view full post
- [ ] Test all navigation links in header
- [ ] Test footer links
- [ ] Test "Back to..." links on detail pages

#### Performance Testing
- [ ] Pages load quickly (< 1 second)
- [ ] No layout shifts during page load
- [ ] Images load progressively
- [ ] Animations are smooth
- [ ] No console errors in browser DevTools

#### Responsive Testing
Test at these breakpoints:
- [ ] Mobile: 375px width
- [ ] Tablet: 768px width
- [ ] Desktop: 1440px width

#### Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if on macOS)

## Running Lighthouse Audit

### Option 1: Chrome DevTools (Recommended)

1. Open the site in Chrome
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to "Lighthouse" tab
4. Select:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
5. Choose "Desktop" or "Mobile"
6. Click "Analyze page load"

**Target Scores:**
- Performance: > 90
- Accessibility: 100
- Best Practices: 100
- SEO: 100

### Option 2: Lighthouse CLI

Install Lighthouse globally:
```bash
npm install -g lighthouse
```

Run audit (with production server running):
```bash
lighthouse http://localhost:3000 --view
```

For mobile audit:
```bash
lighthouse http://localhost:3000 --preset=mobile --view
```

### Option 3: PageSpeed Insights (After Deployment)

1. Deploy to Vercel
2. Visit https://pagespeed.web.dev/
3. Enter your deployed URL
4. Review results for both mobile and desktop

## Performance Metrics to Monitor

### Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s - 4.0s | > 4.0s |
| FID (First Input Delay) | < 100ms | 100ms - 300ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |

### Additional Metrics

- **FCP (First Contentful Paint):** < 1.8s
- **TTI (Time to Interactive):** < 3.8s
- **TBT (Total Blocking Time):** < 200ms
- **Speed Index:** < 3.4s

## Troubleshooting

### If Performance Score is Low

1. **Check bundle sizes:**
   ```bash
   npm run build
   ```
   Look for warnings about large bundles

2. **Analyze what's in the bundle:**
   - Check for unnecessary dependencies
   - Look for duplicate code
   - Verify tree-shaking is working

3. **Check images:**
   - Ensure all images use Next.js Image component
   - Verify images are properly sized
   - Check image formats (should be AVIF/WebP)

4. **Check animations:**
   - Ensure no layout shifts
   - Verify animations are GPU-accelerated
   - Check for animation jank

### If Accessibility Score is Low

1. Check for missing alt text on images
2. Verify color contrast ratios
3. Test keyboard navigation
4. Check ARIA labels
5. Verify semantic HTML structure

### If SEO Score is Low

1. Check meta tags in all pages
2. Verify sitemap.xml is generated
3. Check for proper heading hierarchy
4. Verify canonical URLs
5. Check robots.txt (if applicable)

## Deployment Testing

After deploying to Vercel:

1. **Test the deployed URL:**
   - Verify all pages load correctly
   - Check that images load from CDN
   - Test all navigation

2. **Run Lighthouse on deployed site:**
   - Should see improved scores due to CDN
   - Verify compression is working
   - Check caching headers

3. **Test from different locations:**
   - Use tools like WebPageTest
   - Test from different geographic regions
   - Verify CDN is working globally

## Continuous Monitoring

### After Deployment

1. **Set up Vercel Analytics** (optional):
   - Enable in Vercel dashboard
   - Monitor Core Web Vitals
   - Track real user metrics

2. **Regular audits:**
   - Run Lighthouse monthly
   - Check for performance regressions
   - Monitor bundle size changes

3. **User feedback:**
   - Monitor for performance complaints
   - Check analytics for bounce rates
   - Track page load times

## Expected Results

Based on current optimizations, you should see:

✅ **Performance: 95-100**
- Fast page loads
- Minimal JavaScript
- Optimized images
- Efficient caching

✅ **Accessibility: 100**
- Semantic HTML
- Proper ARIA labels
- Good color contrast
- Keyboard navigation

✅ **Best Practices: 100**
- HTTPS (via Vercel)
- No console errors
- Modern image formats
- Secure headers

✅ **SEO: 100**
- Proper meta tags
- Semantic structure
- Sitemap
- Mobile-friendly

## Notes

- Lighthouse scores can vary slightly between runs
- Mobile scores are typically lower than desktop
- Real-world performance may differ from lab tests
- CDN and caching improve production performance
