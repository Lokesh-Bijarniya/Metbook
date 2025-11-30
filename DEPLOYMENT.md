# 🚀 Easy Deployment Guide

This guide will help you deploy your Employee Onboarding Form application in the easiest way possible.

## 📋 Prerequisites

- A GitHub account (free)
- Node.js installed locally (for testing)

## 🎯 Quick Deployment Options

### Option 1: Easiest (Recommended) - Vercel + Railway

**Frontend (Vercel)**: Free, automatic deployments, zero config
**Backend (Railway)**: Free tier available, easy setup

---

## 📦 Step-by-Step Deployment

### Part 1: Deploy Backend (Railway)

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select this repository
   - Choose the `backend` folder as the root directory

3. **Configure Backend**
   - Railway will automatically detect Node.js
   - The `Procfile` and `railway.json` are already configured
   - Click "Deploy"

4. **Get Backend URL**
   - Once deployed, Railway will provide a URL like: `https://your-app.up.railway.app`
   - Copy this URL - you'll need it for the frontend

5. **Set Environment Variables (Optional)**
   - In Railway dashboard, go to "Variables"
   - Add `PORT` if needed (Railway sets this automatically)

---

### Part 2: Deploy Frontend (Vercel)

1. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

3. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Set Environment Variable**
   - In "Environment Variables" section
   - Add: `VITE_API_URL` = `https://your-backend-url.up.railway.app`
   - Replace with your actual Railway backend URL

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)

6. **Get Your Live URL**
   - Vercel will provide a URL like: `https://your-app.vercel.app`
   - Your app is now live! 🎉

---

## 🔄 Alternative Deployment Options

### Option 2: Render (Both Frontend & Backend)

**Backend on Render:**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your repo
5. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node src/server.js`
   - Environment: Node
6. Add environment variable: `PORT` (Render sets this automatically)
7. Deploy and copy the URL

**Frontend on Render:**
1. Click "New" → "Static Site"
2. Connect your repo
3. Settings:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. Add environment variable: `VITE_API_URL` = your backend URL
5. Deploy

### Option 3: Netlify (Frontend) + Railway (Backend)

**Frontend on Netlify:**
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your repo
5. Settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variable: `VITE_API_URL` = your backend URL
7. Deploy

---

## 🧪 Testing Your Deployment

1. **Test Backend:**
   - Visit: `https://your-backend-url/api/form-schema`
   - Should return JSON with form schema

2. **Test Frontend:**
   - Visit your frontend URL
   - Try submitting the form
   - Check if submissions are saved

---

## 🔧 Troubleshooting

### Frontend can't connect to backend
- Check that `VITE_API_URL` is set correctly in Vercel/Netlify
- Ensure backend URL doesn't have trailing slash
- Check CORS settings (already configured in backend)

### Backend not starting
- Check Railway/Render logs
- Ensure `database.json` file exists (it will be created automatically)
- Verify Node.js version compatibility

### Build fails
- Check build logs in deployment platform
- Ensure all dependencies are in `package.json`
- Try deleting `node_modules` and `package-lock.json`, then reinstall

---

## 📝 Environment Variables Summary

### Frontend (.env or platform settings)
```
VITE_API_URL=https://your-backend-url.up.railway.app
```

### Backend (.env or platform settings)
```
PORT=3000  # Usually auto-set by platform
```

---

## 🎉 You're Done!

Your application should now be live and accessible from anywhere!

**Quick Links:**
- Frontend: Your Vercel/Netlify URL
- Backend API: Your Railway/Render URL

---

## 💡 Pro Tips

1. **Custom Domain**: Both Vercel and Railway support custom domains
2. **Auto-Deploy**: Every push to main branch auto-deploys
3. **Preview Deployments**: Vercel creates preview URLs for pull requests
4. **Monitoring**: Check deployment logs if something goes wrong

---

## 🆘 Need Help?

- Check deployment platform documentation
- Review build logs in your platform dashboard
- Ensure all environment variables are set correctly

