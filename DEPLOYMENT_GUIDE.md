# 🚀 Free Deployment Guide - Futrix AI

This guide will help you deploy your entire Futrix AI stack (Frontend, Backend, Python AI, and Database) for **FREE**.

---

## 📋 Deployment Stack Overview

| Service | Platform | Free Tier | Difficulty |
|---------|----------|-----------|------------|
| **Frontend (React)** | Vercel | ✅ Unlimited | ⭐ Easy |
| **Backend (Node.js)** | Render | ✅ 750 hrs/month | ⭐⭐ Medium |
| **Python AI** | Render | ✅ 750 hrs/month | ⭐⭐ Medium |
| **Database (MongoDB)** | MongoDB Atlas | ✅ 512MB | ⭐ Easy |
| **Java Gateway** | Render | ✅ 750 hrs/month | ⭐⭐ Medium |

**Alternative Options:**
- Railway (all services) - $5 credit/month
- Fly.io (all services) - Free tier available
- PythonAnywhere (Python only) - Free tier

---

## 🗄️ Step 1: Deploy MongoDB Database (FREE)

### MongoDB Atlas Setup:

1. **Create Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up with Google or email

2. **Create Free Cluster:**
   - Click "Build a Database"
   - Choose **M0 Sandbox (FREE)**
   - Select region closest to you
   - Click "Create Cluster"

3. **Create Database User:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `futrix_admin`
   - Password: Generate strong password (save it!)
   - Role: "Read and write to any database"

4. **Configure Network Access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String:**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy connection string:
   ```
   mongodb+srv://futrix_admin:<password>@cluster0.xxxxx.mongodb.net/futrixai?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password

---

## 🐍 Step 2: Deploy Python AI Service (FREE)

### Option A: Render (Recommended)

1. **Prepare Python Service:**
   - Your `python-ai/` folder is ready!
   - Ensure `requirements.txt` has all dependencies

2. **Deploy to Render:**
   - Go to [Render](https://render.com) and sign up
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     ```
     Name: futrix-python-ai
     Region: Choose closest
     Branch: main
     Root Directory: python-ai
     Runtime: Python 3
     Build Command: pip install -r requirements.txt
     Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   - Choose **Free Plan**
   - Click "Create Web Service"

3. **Get Python AI URL:**
   ```
   https://futrix-python-ai.onrender.com
   ```

### Option B: PythonAnywhere

1. Go to [PythonAnywhere](https://www.pythonanywhere.com)
2. Create free account
3. Upload python-ai files
4. Configure WSGI for FastAPI
5. Get URL: `https://yourusername.pythonanywhere.com`

---

## 🌐 Step 3: Deploy Node.js Backend (FREE)

### Render Deployment:

1. **Prepare Environment Variables:**
   Create a file `render-env.txt` with:
   ```
   MONGO_URI=mongodb+srv://futrix_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/futrixai
   JWT_SECRET=your_64_char_secret_here
   JWT_REFRESH_SECRET=your_64_char_refresh_secret_here
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NODE_ENV=production
   PORT=5000
   AI_SERVICE_URL=https://futrix-python-ai.onrender.com/analyze
   FRONTEND_URL=https://your-app.vercel.app
   ```

2. **Deploy to Render:**
   - Go to [Render](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     ```
     Name: futrix-node-api
     Region: Choose closest
     Branch: main
     Root Directory: node-api
     Runtime: Node
     Build Command: npm install
     Start Command: npm start
     ```
   - Choose **Free Plan**
   - Add all environment variables from above
   - Click "Create Web Service"

3. **Get Node API URL:**
   ```
   https://futrix-node-api.onrender.com
   ```

---

## ⚛️ Step 4: Deploy React Frontend (FREE)

### Vercel Deployment (Easiest):

1. **Update Environment Variables:**
   In your local `client/.env`:
   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_API_URL=https://futrix-node-api.onrender.com
   ```

2. **Deploy to Vercel:**
   - Go to [Vercel](https://vercel.com) and sign up with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     ```
     Framework Preset: Vite
     Root Directory: client
     Build Command: npm run build
     Output Directory: dist
     Install Command: npm install
     ```
   - Add environment variables:
     - `VITE_GOOGLE_CLIENT_ID`: Your Google Client ID
     - `VITE_API_URL`: Your Node API URL from Step 3
   - Click "Deploy"

3. **Get Frontend URL:**
   ```
   https://your-app.vercel.app
   ```

### Alternative: Netlify

1. Go to [Netlify](https://netlify.com)
2. Connect GitHub repository
3. Build settings:
   ```
   Base directory: client
   Build command: npm run build
   Publish directory: client/dist
   ```
4. Add environment variables
5. Deploy

---

## ☕ Step 5: Deploy Java Gateway (Optional)

### Render Deployment:

1. **Prepare Dockerfile** (already exists):
   ```dockerfile
   FROM maven:3.8-openjdk-17 AS build
   WORKDIR /app
   COPY pom.xml .
   COPY src ./src
   RUN mvn clean package

   FROM tomcat:9-jdk17
   COPY --from=build /app/target/ROOT.war /usr/local/tomcat/webapps/
   EXPOSE 8080
   CMD ["catalina.sh", "run"]
   ```

2. **Deploy to Render:**
   - New Web Service
   - Root Directory: `java-gateway`
   - Runtime: Docker
   - Free Plan
   - Port: 8080

---

## 🔧 Step 6: Update Google OAuth Settings

1. **Go to Google Cloud Console:**
   - [Google Cloud Console](https://console.cloud.google.com/)

2. **Update Authorized Origins:**
   - Go to "APIs & Services" → "Credentials"
   - Edit your OAuth 2.0 Client
   - Add Authorized JavaScript origins:
     ```
     https://your-app.vercel.app
     https://futrix-node-api.onrender.com
     ```
   - Add Authorized redirect URIs:
     ```
     https://your-app.vercel.app
     https://your-app.vercel.app/auth/callback
     ```
   - Save changes

---

## 📝 Step 7: Final Configuration

### Update Backend Environment on Render:

1. Go to your Node API service on Render
2. Update environment variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Save and redeploy

### Update Frontend on Vercel:

1. Go to your Vercel project settings
2. Update environment variable:
   ```
   VITE_API_URL=https://futrix-node-api.onrender.com
   ```
3. Redeploy

---

## ✅ Step 8: Test Your Deployment

### Health Checks:

1. **Python AI:**
   ```
   https://futrix-python-ai.onrender.com/
   ```
   Should return: `{"status": "Futrix AI Engine v2.0 running 🐍"}`

2. **Node API:**
   ```
   https://futrix-node-api.onrender.com/health
   ```
   Should return health status

3. **Frontend:**
   ```
   https://your-app.vercel.app
   ```
   Should load login page

4. **Test Login:**
   - Try Google OAuth login
   - Try email login
   - Upload a resume
   - Check analysis results

---

## 🎯 Free Tier Limitations & Solutions

### Render Free Tier:
- **750 hours/month per service**
- **Spins down after 15 minutes of inactivity**
- **First request may be slow (cold start)**

**Solutions:**
- Use [UptimeRobot](https://uptimerobot.com) (free) to ping services every 5 minutes
- Combine services into one container if needed
- Upgrade to paid plan ($7/month) for 24/7 uptime

### MongoDB Atlas Free Tier:
- **512MB storage**
- **Shared cluster**
- **Good for ~10,000 users**

**Solutions:**
- Clean old analysis data periodically
- Upgrade to paid tier ($9/month) when needed

### Vercel Free Tier:
- **Unlimited bandwidth**
- **100GB bandwidth/month**
- **Perfect for frontend**

No issues expected!

---

## 🚀 Alternative: All-in-One Solutions

### Railway (Recommended for Simplicity):

1. **Deploy Everything on Railway:**
   - Go to [Railway](https://railway.app)
   - Connect GitHub
   - Deploy all services with one click
   - Get $5 free credit/month
   - ~$5-10/month after free credit

2. **Configure:**
   - Railway auto-detects Dockerfile/package.json
   - Set environment variables for each service
   - Connect services using internal URLs

### Fly.io:

1. Install Fly CLI
2. Deploy each service:
   ```bash
   cd python-ai && fly launch
   cd node-api && fly launch
   cd client && fly launch
   ```
3. Free tier: 3 small VMs

---

## 📊 Recommended Stack (Best Free Option)

```
Frontend:    Vercel       (Free Forever)
Node API:    Render       (Free 750hrs)
Python AI:   Render       (Free 750hrs)
Database:    Atlas        (Free 512MB)
Java:        Skip for now (Use Node for auth)

Total Cost:  $0/month 🎉
```

---

## 🔥 Pro Tips

1. **Use UptimeRobot** to keep Render services awake
2. **Enable Vercel Analytics** for free monitoring
3. **Use MongoDB Compass** to manage your database
4. **Set up GitHub Actions** for auto-deployment
5. **Monitor with LogRocket** (free tier) for errors

---

## 🆘 Troubleshooting

### Common Issues:

**1. CORS Errors:**
- Update `FRONTEND_URL` in backend `.env`
- Add frontend URL to CORS whitelist
- Update Google OAuth authorized origins

**2. MongoDB Connection Failed:**
- Whitelist IP: 0.0.0.0/0 in Atlas
- Check connection string format
- Verify username/password

**3. API Not Responding:**
- Check Render logs
- Verify environment variables
- Check cold start time (15-30 seconds)

**4. Google OAuth Failed:**
- Update authorized origins in Google Console
- Verify Client ID matches frontend/backend
- Check redirect URIs

---

## 📞 Support

- **MongoDB Issues:** [MongoDB Support](https://www.mongodb.com/support)
- **Render Issues:** [Render Docs](https://render.com/docs)
- **Vercel Issues:** [Vercel Support](https://vercel.com/support)

---

## 🎉 Congratulations!

Your Futrix AI is now deployed and accessible worldwide for **FREE**! 🚀

**Your Live URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://futrix-node-api.onrender.com`
- Python AI: `https://futrix-python-ai.onrender.com`

Share your amazing AI-powered career platform with the world! 🌍
