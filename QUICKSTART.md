# Quick Start

Get the MZG LAB Scheduler running in 5 minutes.

## Prerequisites Check

```bash
# Check Node.js (need 18+)
node --version

# Check PostgreSQL
psql --version
```

Don't have PostgreSQL? See [SETUP.md](SETUP.md) for installation instructions.

## Setup Steps

### 1. Install Dependencies (✓ Already done!)

```bash
npm install
```

### 2. Configure Database

**Option A: Use default local PostgreSQL**
```bash
# Create database
createdb mzglab

# Skip to step 3
```

**Option B: Custom database**

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

### 3. Initialize Database

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed sample data
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Login

Use these demo credentials:

**Regular User:**
- Email: `kathy@mzglab.caltech.edu`
- Password: `password123`

**Admin:**
- Email: `admin@mzglab.caltech.edu`  
- Password: `password123`

## Try It Out

1. **View calendars**: Click "3i Spinning Disk" on homepage
2. **Create reservation**: Click or drag on the calendar grid
3. **Edit reservation**: Click existing reservation block
4. **View your bookings**: Click "My Reservations"
5. **Admin panel**: Login as admin, click "Admin Dashboard"

## What You Get

- 5 laboratory instruments with independent calendars
- 5 sample users with different access levels
- Training permissions system
- Sample reservations including overnight bookings
- Real-time conflict detection

## Next Steps

- Read [README.md](README.md) for full documentation
- See [DEVELOPMENT.md](DEVELOPMENT.md) for architecture details
- Customize resources, users, and settings for your lab

## Troubleshooting

### Can't connect to database

```bash
# Check PostgreSQL is running
pg_isready

# macOS Homebrew
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

### Database already exists error

```bash
# Reset everything
npx prisma migrate reset
npx prisma db seed
```

### Port 3000 already in use

```bash
# Use different port
npm run dev -- -p 3001
```

## Project Structure

```
├── src/
│   ├── app/              # Pages and API routes
│   ├── components/       # React components
│   └── lib/              # Utilities and config
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Sample data
├── .env                  # Environment config
└── README.md             # Full documentation
```

## Getting Help

- Check [SETUP.md](SETUP.md) for detailed setup instructions
- See [DEVELOPMENT.md](DEVELOPMENT.md) for development guide
- Review API routes in `src/app/api/`
- Inspect database with: `npx prisma studio`
