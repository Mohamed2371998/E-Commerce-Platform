# 🚀 Deployment Guide

## Deploy to Render (Recommended - Free)

### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub

### 2. Create Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ecommerce-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Environment Variables
Add these in Render Dashboard:
```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
FRONTEND_URL=https://your-frontend.com
```

### 4. Deploy
Click "Create Web Service" - Render will auto-deploy on every push!

---

## Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-ecommerce-api

# Add MongoDB
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set STRIPE_SECRET_KEY=sk_live_your_key

# Deploy
git push heroku main
```

---

## Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Add MongoDB plugin
4. Set environment variables
5. Deploy!

---

## MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Database Access → Create User
4. Network Access → Allow from anywhere (0.0.0.0/0)
5. Get connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
```

---

## Stripe Production Setup

1. Activate your Stripe account
2. Get Live API keys from Dashboard
3. Add webhook endpoint:
   - URL: `https://your-api.com/api/orders/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret to environment variables

---

## Docker Deployment (Optional)

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Build & Run
```bash
docker build -t ecommerce-api .
docker run -p 5000:5000 --env-file .env ecommerce-api
```

---

## SSL/HTTPS

Most platforms (Render, Heroku, Railway) provide free SSL automatically.

For custom server:
```bash
# Using Let's Encrypt with Certbot
sudo certbot --nginx -d yourdomain.com
```

---

## Monitoring

### Add to your app:
```javascript
// Health check for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Recommended Tools:
- **UptimeRobot** - Free uptime monitoring
- **Sentry** - Error tracking
- **New Relic** - Performance monitoring

---

## Backup Strategy

### MongoDB Atlas:
- Automatic daily backups (free tier)
- Point-in-time recovery (paid)

### Manual Backup:
```bash
mongodump --uri="your_connection_string" --out=./backup
```

---

## Production Checklist

- [ ] Use production MongoDB (Atlas)
- [ ] Set strong JWT_SECRET
- [ ] Use Stripe Live keys
- [ ] Configure CORS for production frontend
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure automatic backups
- [ ] Test payment flow
- [ ] Review error handling
- [ ] Add logging service

---

## Troubleshooting

### Common Issues:

**CORS Error:**
```
Add FRONTEND_URL to environment variables
```

**MongoDB Connection Failed:**
```
Check IP whitelist in Atlas
Verify connection string
```

**Stripe Webhook Not Working:**
```
Verify webhook URL is correct
Check webhook secret
```

**Memory Issues:**
```
Add --max-old-space-size=4096 to start script
```

---

## Support

For issues or questions:
- GitHub Issues: [your-repo]/issues
- Email: support@yourdomain.com
