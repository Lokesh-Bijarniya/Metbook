# ⚡ Quick Deploy - 5 Minutes

## 🎯 Simplest Method: Vercel + Railway

### Backend (Railway) - 2 minutes
1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. New Project → Deploy from GitHub → Select repo → Choose `backend` folder
3. Wait for deploy → Copy the URL (e.g., `https://your-app.up.railway.app`)

### Frontend (Vercel) - 3 minutes
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Add New Project → Import repo → Select `frontend` folder
3. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-url.up.railway.app` (from step above)
4. Deploy → Done! 🎉

---

## 📋 Environment Variables Needed

**Frontend (Vercel):**
- `VITE_API_URL` = Your Railway backend URL

**Backend (Railway):**
- `PORT` = Auto-set by Railway (no action needed)

---

## ✅ Test It

1. Visit your Vercel URL
2. Fill out the form
3. Submit → Should work! ✨

---

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

