# MZG LAB Equipment Scheduling System

A laboratory equipment reservation web application for managing shared instrument bookings.

## Features

- **Multi-Resource Calendars**: Each instrument has its own independent scheduling calendar
- **Weekly View**: 24-hour schedule grid with 15-minute intervals
- **Click & Drag Booking**: Quick reservation creation by clicking or dragging time slots
- **Conflict Detection**: Database-level concurrency control prevents double bookings
- **Training Permissions**: Restrict instrument access to trained users
- **User Authentication**: Secure login system with role-based permissions
- **Overnight Reservations**: Support for multi-day bookings
- **Admin Dashboard**: Manage resources, users, and view reservation history
- **Responsive Design**: Desktop-optimized with tablet/mobile support

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Getting Started

### 1. Clone and Install

```bash
cd MZGLabScheduler
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb mzglab
```

### 3. Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mzglab?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-here"
```

Generate a secure secret for NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4. Initialize Database

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev --name init
```

### 5. Seed Database

Populate the database with sample data:

```bash
npx prisma db seed
```

This creates:
- 5 sample users (Kathy, Yuqi, Damla, Breanna, Administrator)
- 5 laboratory resources (3i Spinning Disk, Leica SP8, Zeiss 980, etc.)
- Training permissions
- Sample reservations including overnight bookings

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

After seeding, you can login with:

**Regular User:**
- Email: `kathy@mzglab.caltech.edu`
- Password: `password123`

**Administrator:**
- Email: `admin@mzglab.caltech.edu`
- Password: `password123`

## Usage

### Viewing Calendars

1. Navigate to the homepage to see all available instruments
2. Click on an instrument name to view its schedule
3. Use week navigation to browse different weeks
4. Click "Today" to return to the current week

### Creating Reservations

**Method 1: Click**
1. Click an empty time slot
2. Fill out the reservation form
3. Click "Create Reservation"

**Method 2: Drag**
1. Click and drag vertically across a time range
2. Release to open the reservation form
3. Adjust details and save

### Editing/Deleting Reservations

1. Click on an existing reservation block
2. If you own it (or are an admin), click "Edit" or "Delete"
3. Confirm changes

### Admin Features

Administrators can:
- View all resources and users
- Edit/delete any reservation
- Access the admin dashboard at `/admin`
- Grant training permissions (requires additional admin UI)

## Database Schema

### Key Models

- **User**: Lab members with authentication and roles
- **Resource**: Laboratory equipment/instruments
- **Reservation**: Time-based bookings
- **TrainingPermission**: Controls instrument access
- **AuditLog**: Tracks reservation changes

### Conflict Prevention

The application uses PostgreSQL transactions to prevent race conditions when creating reservations. Two users cannot book the same time slot simultaneously.

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Sample data
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── calendar/      # Calendar pages
│   │   ├── login/         # Authentication
│   │   ├── admin/         # Admin dashboard
│   │   └── page.tsx       # Homepage
│   ├── components/
│   │   └── calendar/      # Calendar UI components
│   ├── lib/
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── prisma.ts      # Prisma client
│   │   └── utils.ts       # Utility functions
│   └── types/             # TypeScript types
└── package.json
```

## Timezone Handling

The application is configured for `America/Los_Angeles` timezone. All times are displayed in Pacific Time with automatic daylight saving time adjustment.

## Production Deployment

### Environment Variables

Set these in your production environment:

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"
```

### Build

```bash
npm run build
npm start
```

### Deployment Platforms

This application can be deployed to:
- Vercel (recommended for Next.js)
- Railway
- Render
- AWS/GCP/Azure with PostgreSQL

## Testing

The application includes:
- Database-level conflict prevention
- User authentication and authorization
- Training permission enforcement
- Timezone-aware date handling
- Overnight reservation support

## Future Enhancements

- Email notifications for reservations
- Recurring reservations
- Equipment maintenance scheduling
- Usage analytics and reporting
- Calendar export (iCal format)
- Mobile app
- SMS reminders

## License

Private use for MZG LAB Caltech

## Support

For issues or questions, contact the lab administrator.
