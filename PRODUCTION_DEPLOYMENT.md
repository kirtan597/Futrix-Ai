# 🚀 Production Deployment Guide

## Environment Variables Required

### Node API (Render)
Set these in Render dashboard → `futrix-node-api` → Environment

```
PYTHON_URL=https://futrix-python-ai.onrender.com
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/futrixai?retryWrites=true&w=majority
JWT_SECRET=<32+ char random hex>
JWT_REFRESH_SECRET=<32+ char random hex>
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
NODE_ENV=production
FRONTEND_URL=https://futrixai.netlify.app
PORT=5000
```

### Python AI (Render)
Set in Render dashboard → `futrix-python-ai` → Environment

```
ALLOWED_ORIGINS=https://futrixai.netlify.app,https://futrix-node-api.onrender.com
```

### Frontend (Netlify)
Build command: `cd client && npm run build`
Publish directory: `client/dist`

## Deployment Steps

1. **Set Render Environment Variables**
   - Node API service
   - Python AI service
   - Auto-redeploy after save

2. **Verify Health Endpoint**
   ```bash
   curl https://futrix-node-api.onrender.com/health
   ```

3. **Run Production Tests**
   ```bash
   npm run test:prod
   ```

4. **Check Live Site**
   - https://futrixai.netlify.app
   - Test login, upload, analysis

## Monitoring

### Health Check
- Endpoint: `GET /api/health`
- Returns: Service status, DB connection, Python AI status

### Error Logs
- Render: Dashboard → Service → Logs
- Structured JSON logging in production

### Rate Limiting
- Upload: 5 requests per hour per IP
- Auth: 10 requests per 15 minutes per IP

## Troubleshooting

### 500 Errors
1. Check health endpoint for actual status
2. Verify all environment variables set
3. Check Render service logs
4. Ensure Python service is deployed

### MongoDB Connection Failed
- Verify MONGO_URI in environment variables
- Add Render IP to MongoDB Atlas Network Access
- Check credentials in connection string

### Python Service Unreachable
- Verify PYTHON_URL is set correctly
- Check Python service is deployed on Render
- Wait for cold start (30-60 seconds)

