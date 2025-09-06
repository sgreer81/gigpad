# 🚀 Deployment Guide - Guitar Performer App

## Quick Deploy to Netlify (Recommended)

### Option 1: Drag & Drop (Fastest)
1. **Build the app:**
   ```bash
   pnpm build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com/drop](https://netlify.com/drop)
   - Drag the `dist` folder to the drop zone
   - Get instant live URL!

### Option 2: Git Integration (Best for updates)
1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repo
   - Build settings are auto-detected from `netlify.toml`

## Alternative Hosting Options

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### GitHub Pages
1. Enable GitHub Pages in repo settings
2. Use GitHub Actions for auto-deployment
3. Set source to GitHub Actions

## 📱 PWA Features After Deployment

Once deployed, your app will have:
- ✅ **Install prompt** on mobile devices
- ✅ **Offline functionality** 
- ✅ **App-like experience** on iPad
- ✅ **Home screen icon**
- ✅ **Fast loading** with CDN

## 🎸 Post-Deployment Checklist

- [ ] Test PWA installation on iPad
- [ ] Verify offline functionality
- [ ] Check all setlists load correctly
- [ ] Test chord transposition
- [ ] Confirm audio system works (when you add MP3s)
- [ ] Test on different devices/browsers

## 🔧 Custom Domain (Optional)

### On Netlify:
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Netlify provides free SSL automatically

### DNS Settings:
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

## 📊 Performance Tips

Your app is already optimized with:
- Service Worker caching
- Gzipped assets (66KB JS, 3KB CSS)
- Optimized images and fonts
- Efficient bundle splitting

## 🎵 Adding Audio Files

After deployment, to add backing tracks:
1. Upload MP3 files to `/public/data/loops/audio/`
2. Update `/public/data/loops/loops.json`
3. Redeploy (automatic with Git integration)

## 🐛 Troubleshooting

**PWA not installing?**
- Ensure HTTPS (automatic on Netlify)
- Check manifest.json is accessible
- Verify service worker registration

**Blank screen after deployment?**
- Check browser console for errors
- Verify all assets loaded correctly
- Test with `?clear-sw` parameter

---

**Your app is production-ready! 🎸**

The Guitar Performer app is now optimized for:
- Live performance use
- iPad installation
- Offline functionality  
- Professional reliability
