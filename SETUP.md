# Quick Setup Guide

## Step-by-Step Setup

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**macOS (using Postgres.app):**
Download and install from https://postgresapp.com/

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download installer from https://www.postgresql.org/download/windows/

### 2. Create Database

```bash
# macOS/Linux
createdb mzglab

# Or using psql
psql postgres
CREATE DATABASE mzglab;
\q
```

### 3. Update Environment Variables

Edit `.env` file with your database credentials:
```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/mzglab?schema=public"
```

Common defaults:
- macOS: username is your system username, no password
- Linux: username is `postgres`, password set during installation
- Windows: username is `postgres`, password set during installation

### 4. Run Setup Commands

```bash
# Install dependencies
npm install

# Initialize database
npx prisma migrate dev --name init

# Seed sample data
npx prisma db seed

# Start development server
npm run dev
```

### 5. Access Application

Open http://localhost:3000

Login with:
- Email: `kathy@mzglab.caltech.edu`
- Password: `password123`

## Troubleshooting

### Can't connect to database

Check PostgreSQL is running:
```bash
# macOS/Linux
pg_isready

# Or check service status
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux
```

### Port 5432 already in use

Either:
1. Stop other PostgreSQL instances
2. Change port in DATABASE_URL (e.g., `localhost:5433`)

### Migration errors

Reset database:
```bash
npx prisma migrate reset
npx prisma db seed
```

### Module not found errors

```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Explore the calendar interface at http://localhost:3000
2. Click on "3i Spinning Disk" to view the reservation calendar
3. Try creating a reservation by clicking or dragging on the calendar
4. Login as admin (`admin@mzglab.caltech.edu`) to access admin features

## Production Deployment

See README.md for production deployment instructions.
