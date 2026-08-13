# Deploy Your App Online - Quick Steps

Your code is ready to deploy! Follow these steps:

## ✅ Step 1: Create Database (5 minutes)

1. Go to **https://railway.app**
2. Click "Login" → Sign in with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Wait for database to provision (~1 minute)
5. Click on the PostgreSQL service
6. Click "Variables" tab
7. **Copy the `DATABASE_URL`** - you'll need this for Vercel!
   - It looks like: `postgresql://postgres:password@host.railway.app:5432/railway`

## ✅ Step 2: Push to GitHub (5 minutes)

Your code is already committed locally! Now:

1. Go to **https://github.com/new**
2. Repository name: `mzglab-scheduler`
3. Make it **Private** (recommended) or Public
4. **Don't** check "Initialize with README"
5. Click "Create repository"

6. Copy the commands GitHub shows and run them:

```bash
cd /Users/katherinetam/MZGLABScheduler/MZGLabScheduler
git remote add origin https://github.com/YOUR_USERNAME/mzglab-scheduler.git
git push -u origin main
```

(Replace YOUR_USERNAME with your GitHub username)

## ✅ Step 3: Deploy to Vercel (5 minutes)

1. Go to **https://vercel.com**
2. Click "Continue with GitHub"
3. Click "Add New..." → "Project"
4. Find and import `mzglab-scheduler`
5. Click on your repository

### Configure Environment Variables:

Before deploying, add these **3 environment variables**:

1. `DATABASE_URL`
   - Paste the Railway database URL from Step 1

2. `NEXTAUTH_URL`
   - Use: `https://your-project.vercel.app` (Vercel will show you this)
   - You can update it later to match your actual URL

3. `NEXTAUTH_SECRET`
   - Use this generated value: `WyxK4QfuEoRhUlcq09xSnvYODRY0QDdAI7H0wpln/0c=`

Click **"Deploy"**

Wait 2-3 minutes for build to complete ☕

## ✅ Step 4: Initialize Database (2 minutes)

After Vercel deployment succeeds:

### Option A: Using Vercel CLI (Recommended)

```bash
npm i -g vercel
vercel login
vercel link

# Replace with your Railway DATABASE_URL
export DATABASE_URL="postgresql://postgres:..."
npx prisma migrate deploy
npx prisma db seed
```

### Option B: Using Railway CLI

1. In Railway dashboard, click your PostgreSQL service
2. Click "Data" tab
3. Click "Query" 
4. Copy the contents of `prisma/migrations/20260813212233_init/migration.sql`
5. Paste and run
6. Then run seed data (you may need to manually insert users)

## ✅ Step 5: Share Your Link! 🎉

Your app is now live at:
- **https://your-project.vercel.app**

Share this link with your lab members!

---

## Default Login Credentials

After seeding:
- Email: `kathy@mzglab.caltech.edu`
- Email: `admin@mzglab.caltech.edu`
- Password: `password123`

**IMPORTANT:** Change these passwords in production!

---

## Update Your Site Later

Whenever you make changes:

```bash
git add .
git commit -m "Your change description"
git push
```

Vercel will automatically redeploy in ~2 minutes.

---

## Troubleshooting

**"Build failed":**
- Check all 3 environment variables are set in Vercel
- Check Vercel build logs for errors

**"Can't connect to database":**
- Verify DATABASE_URL is correct (no extra spaces)
- Check Railway dashboard - database should be "Active"

**"Authentication not working":**
- Verify NEXTAUTH_URL matches your Vercel URL exactly
- Make sure you ran `prisma db seed` to create users

**Need help?**
- Check full guide: DEPLOYMENT.md
- Vercel docs: https://vercel.com/docs
- Railway docs: https://docs.railway.app

---

## Adding More Users in Production

You'll need to add real lab members. Options:

1. **Create admin UI** (recommended for future)
2. **Use Railway SQL console** to insert users
3. **Modify seed script** and re-run with production DATABASE_URL

Contact me if you need help setting up user management!

---

## Cost: FREE! 🎉

- ✅ Vercel: Free hobby tier (perfect for small labs)
- ✅ Railway: $5/month free credit (enough for 24/7 database)
- ✅ GitHub: Free for public/private repos

**Total: $0/month for up to 500 hours database usage**

---

## Custom Domain (Optional)

Want to use `scheduler.mzglab.caltech.edu`?

1. In Vercel → Settings → Domains
2. Add custom domain
3. Update Caltech DNS records as shown
4. Update NEXTAUTH_URL to your custom domain

---

Ready to deploy? Start with **Step 1**! 🚀
