# Deployment Guide

## Quick Deploy to Vercel + Railway

### Step 1: Create PostgreSQL Database on Railway

1. Go to https://railway.app
2. Sign up with GitHub (it's free)
3. Click "New Project"
4. Select "Provision PostgreSQL"
5. Once created, click on the PostgreSQL service
6. Go to "Variables" tab
7. Copy the `DATABASE_URL` value (it looks like: postgresql://postgres:...)

### Step 2: Prepare for Deployment

1. Create a GitHub account if you don't have one
2. Install Git if not installed: `brew install git`
3. Initialize git repository:

```bash
cd /Users/katherinetam/MZGLABScheduler/MZGLabScheduler
git init
git add .
git commit -m "Initial commit - MZG Lab Scheduler"
```

4. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name it: `mzglab-scheduler`
   - Don't initialize with README (we already have code)
   - Click "Create repository"

5. Push code to GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/mzglab-scheduler.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up with your GitHub account
3. Click "Add New" → "Project"
4. Import your `mzglab-scheduler` repository
5. Configure environment variables:
   - Click "Environment Variables"
   - Add these three variables:

```
DATABASE_URL = postgresql://postgres:...  (from Railway)
NEXTAUTH_URL = https://your-project.vercel.app  (Vercel will show this)
NEXTAUTH_SECRET = (generate with: openssl rand -base64 32)
```

6. Click "Deploy"
7. Wait 2-3 minutes for build to complete

### Step 4: Initialize Production Database

After deployment succeeds:

1. Go to your Vercel project dashboard
2. Click on your project
3. Go to "Settings" → "Functions"
4. Or use Vercel CLI to run migrations:

```bash
npm i -g vercel
vercel login
vercel env pull .env.production
DATABASE_URL="your-production-url" npx prisma migrate deploy
DATABASE_URL="your-production-url" npx prisma db seed
```

### Step 5: Access Your Site

Your app will be live at: `https://your-project.vercel.app`

Share this link with your lab members!

---

## Alternative Database Options

### Option A: Supabase (Free tier)

1. Go to https://supabase.com
2. Create new project
3. Copy connection string from Settings → Database
4. Use as DATABASE_URL

### Option B: Neon (Free tier)

1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Use as DATABASE_URL

### Option C: AWS RDS / Google Cloud SQL (Paid)

For production use with larger teams.

---

## Custom Domain (Optional)

1. In Vercel, go to Settings → Domains
2. Add your custom domain (e.g., scheduler.mzglab.caltech.edu)
3. Update DNS records as instructed
4. Update NEXTAUTH_URL to your custom domain

---

## Environment Variables Reference

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your deployment URL
- `NEXTAUTH_SECRET` - Random secret (generate with openssl)

---

## Updating the Deployment

Whenever you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically redeploy (takes ~2 minutes).

---

## Adding Users in Production

### Option 1: Admin UI (Future Feature)

Build an admin page to add users.

### Option 2: Direct Database

1. Access your Railway/Supabase database console
2. Run SQL to add users:

```sql
-- Generate password hash first using bcryptjs
INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'New User Name',
  'newuser@mzglab.caltech.edu',
  '$2a$10$...',  -- bcrypt hash of password
  'USER',
  NOW(),
  NOW()
);
```

### Option 3: Seed Script

Modify `prisma/seed.ts` to add more users, then run:

```bash
DATABASE_URL="production-url" npx prisma db seed
```

---

## Monitoring

- Vercel Dashboard: View deployment logs and analytics
- Railway Dashboard: Monitor database usage
- Check errors: Vercel → Project → Logs

---

## Security Notes

1. Never commit `.env` file to Git (already in .gitignore)
2. Use strong NEXTAUTH_SECRET in production
3. Consider adding rate limiting for public deployments
4. Review user permissions regularly

---

## Cost Estimates

**Free Tier:**
- Vercel: Free for personal/small teams
- Railway: 500 hours/month free (enough for 24/7)
- Supabase: 500MB database free

**Paid Options (if needed):**
- Vercel Pro: $20/month (for teams)
- Railway: $5/month for more resources
- Custom domain: $10-15/year

---

## Troubleshooting

**Build fails:**
- Check Vercel build logs
- Ensure all environment variables are set

**Database connection errors:**
- Verify DATABASE_URL is correct
- Check database is running (Railway/Supabase dashboard)
- Ensure IP restrictions allow Vercel (usually no restrictions needed)

**Authentication not working:**
- Verify NEXTAUTH_URL matches your deployment URL
- Check NEXTAUTH_SECRET is set
- Clear browser cookies and try again

**Can't access site:**
- Check Vercel deployment status
- Verify DNS if using custom domain
- Check browser console for errors
