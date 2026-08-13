# MZG LAB Equipment Scheduler - Project Guide

## Project Overview

A laboratory equipment reservation system for the MZG Lab at Caltech. Built to replicate the workflow of traditional academic lab scheduling software with a modern, reliable tech stack.

**Live Site:** https://mzglab-schedule.vercel.app

## Key Design Principles

1. **No Authentication Required** - Anyone can view and create reservations by simply entering their name
2. **Individual Calendars** - Each piece of equipment has its own independent schedule (not a combined calendar)
3. **Simple, Utilitarian Design** - Academic lab aesthetic, not a consumer SaaS product
4. **Fast Booking** - Click/drag to reserve should take ~10 seconds total
5. **Conflict Prevention** - Database-level transaction safety prevents double bookings

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Deployment:** Vercel (frontend) + Supabase (database)

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API endpoints
│   │   ├── reservations/         # CRUD for reservations
│   │   └── auth/                 # NextAuth (currently disabled)
│   ├── calendar/[slug]/          # Individual equipment calendars
│   ├── admin/                    # Admin dashboard (not actively used)
│   ├── login/                    # Login page (not actively used)
│   ├── my-reservations/          # User's reservation list (not actively used)
│   └── page.tsx                  # Homepage - calendar directory
├── components/
│   └── calendar/                 # Calendar UI components
│       ├── CalendarView.tsx      # Main calendar container
│       ├── WeeklyCalendar.tsx    # Calendar grid with drag-to-create
│       ├── WeekNavigation.tsx    # Week selector
│       └── ReservationModal.tsx  # Create/edit/delete modal
├── lib/
│   ├── prisma.ts                 # Database client
│   ├── auth.ts                   # NextAuth config (not actively used)
│   └── utils.ts                  # Date/time utilities
└── types/
    └── next-auth.d.ts            # TypeScript definitions

prisma/
├── schema.prisma                 # Database schema
├── seed.ts                       # Sample data
└── migrations/                   # Database migrations
```

## Database Schema

### Core Models

**User**
- Represents anyone who makes a reservation
- Created on-the-fly when someone enters their name
- No passwords required (passwordHash field is empty)

**Resource**
- Laboratory equipment/instruments
- Each has independent booking rules (min/max duration, increment)
- `slug` field used in URLs (`/calendar/3i-spinning-disk`)

**Reservation**
- Time-based bookings
- Conflict prevention via database transactions
- Supports overnight/multi-day bookings

**TrainingPermission**
- Legacy table from original authentication design
- Currently not enforced (everyone can book everything)

**AuditLog**
- Tracks reservation changes
- Useful for accountability

## Key Features

### 1. Calendar Display
- **30-minute time blocks** - Visual grid with 50px height per block
- **24-hour view** - Midnight to midnight
- **Week view** - Monday-Sunday with date navigation
- **Current time indicator** - Red line shows current time on today's column
- **Overnight bookings** - Reservations spanning multiple days render correctly

### 2. Creating Reservations
- **Click** - Opens modal for that time slot
- **Click and drag** - Selects time range, opens modal
- **Form fields:**
  - Date (pre-filled)
  - Start time (pre-filled)
  - End time (pre-filled)
  - **Your Name** (required - user enters their name)
  - Reservation type (Standard, Long-term, Maintenance, etc.)
  - Description (optional)
  - Notes (optional)

### 3. Editing/Deleting Reservations
- Click on any reservation block
- Anyone can edit/delete any reservation (no ownership restrictions)
- Conflict checking runs again on edit

### 4. Conflict Detection
- **Server-side transaction** - Uses PostgreSQL transactions to prevent race conditions
- Checks for time overlap: `start1 < end2 AND end1 > start2`
- Returns 409 error if conflict detected

## Important Implementation Details

### Timezone Handling
- All times stored in UTC in database
- Displayed in `America/Los_Angeles` (Pacific Time)
- Uses `date-fns-tz` for conversions
- DST handled automatically

### Serverless Function Compatibility
- **Connection pooling required** for Supabase
- DATABASE_URL must include: `?pgbouncer=true&connection_limit=1&pool_timeout=0`
- Transaction pooler port: `6543`
- Direct connection port: `5432` (doesn't work from Vercel)

### User Creation
- Users are created automatically when someone makes their first reservation
- Email format: `{name}@temp.local` (e.g., `kathy@temp.local`)
- No password required (passwordHash is empty string)
- Each unique name gets a user record

## Common Issues & Solutions

### Issue: "Prepared statement already exists" error
**Solution:** Add `pool_timeout=0` to DATABASE_URL in Vercel environment variables

### Issue: Calendar pages return 500 error
**Solution:** Check Vercel function logs. Usually database connection issue - verify DATABASE_URL

### Issue: Reservations not showing up
**Solution:** 
- Check date range query in `/api/reservations`
- Verify timezone conversion in `utils.ts`
- Confirm reservation exists in Supabase dashboard

### Issue: Drag-to-create not working
**Solution:** 
- Check `canCreateReservation` prop is `true`
- Verify mouse events in `WeeklyCalendar.tsx`
- Ensure `DISPLAY_INTERVAL` matches booking increment

## Deployment

### Vercel
- Auto-deploys on git push to main
- Environment variables:
  - `DATABASE_URL` - Supabase connection string
  - `NEXTAUTH_URL` - Deployment URL (e.g., https://mzglab-schedule.vercel.app)
  - `NEXTAUTH_SECRET` - Random secret (not actively used but required)

### Supabase
- Free tier: 500MB storage, good for small lab
- Database can be managed via SQL Editor
- Connection pooling required for Vercel functions

## Configuration

### Equipment Resources
Managed directly in Supabase database:
```sql
INSERT INTO "Resource" (id, name, slug, description, instructions, ...) VALUES (...);
```

### Booking Rules
Per-resource settings in database:
- `minimumBookingMinutes` (default: 30)
- `maximumBookingMinutes` (default: 1440 = 24 hours)
- `bookingIncrementMinutes` (default: 15)
- `maximumAdvanceDays` (default: 30)

### Display Settings
In code:
- `DISPLAY_INTERVAL` in `WeeklyCalendar.tsx` (currently 30 minutes)
- Cell height in `globals.css` (currently 50px per 30-min block)

## Future Enhancements

Potential features (not yet implemented):
- Email notifications
- Recurring reservations
- Equipment availability status on homepage
- Export calendar to iCal format
- Search/filter reservations
- Mobile app
- Admin user management UI
- Training permission enforcement

## Testing

### Manual Testing Checklist
- [ ] Create reservation via click
- [ ] Create reservation via drag
- [ ] Edit reservation
- [ ] Delete reservation
- [ ] Overnight booking renders correctly
- [ ] Conflict prevention works
- [ ] Week navigation
- [ ] Current time indicator shows
- [ ] Multiple users can book different times

### Database Testing
Access Supabase SQL Editor to:
- Inspect reservations: `SELECT * FROM "Reservation" ORDER BY "startTime" DESC;`
- Check users: `SELECT * FROM "User";`
- View conflicts: Check `"AuditLog"` table

## Coding Conventions

### File Naming
- Components: PascalCase (`WeeklyCalendar.tsx`)
- API routes: lowercase with dashes (`reservations/[id]/route.ts`)
- Utilities: camelCase (`utils.ts`)

### Component Structure
- Server Components: Default for pages
- Client Components: Use `'use client'` directive for interactivity
- Props interfaces: Define inline or in component file

### Styling
- Tailwind utility classes for most styling
- Custom CSS in `globals.css` for calendar-specific styles
- Minimal use of inline styles (only for dynamic positioning)

### API Routes
- Use Zod for request validation
- Return NextResponse with appropriate status codes
- Include error messages in JSON response
- Log errors to console for debugging

## Working with This Project

### Adding New Equipment
1. Add to Supabase via SQL:
   ```sql
   INSERT INTO "Resource" (...) VALUES (...);
   ```
2. Resource appears automatically on homepage
3. Calendar route works immediately: `/calendar/{slug}`

### Modifying Time Blocks
1. Change `DISPLAY_INTERVAL` in `WeeklyCalendar.tsx`
2. Update cell height in `globals.css` (`min-height: Xpx`)
3. Adjust `pixelsPerMinute` calculation in calendar positioning

### Changing Colors
- Reservation type colors: `utils.ts` → `getReservationTypeColor()`
- Resource colors: Stored in database `Resource.color` field
- Update CSS variables in `globals.css` for theme changes

## Important Notes

1. **No authentication is active** - The authentication system is built but disabled. Anyone can create/edit/delete reservations.

2. **Database transactions are critical** - Never remove transaction wrapping from conflict checking. Simultaneous users can cause race conditions.

3. **Timezone awareness** - Always use `date-fns-tz` functions for display. Never show raw UTC times.

4. **Serverless limitations** - Database connections must use pooling. Direct connections fail from Vercel.

5. **User management** - There's no UI for managing users. All user operations happen automatically or via database.

## Support & Maintenance

### Logs
- **Vercel logs:** Check function logs for API errors
- **Supabase logs:** Monitor database queries and connections
- **Browser console:** Check for client-side errors

### Monitoring
- Vercel Analytics: Track page views and errors
- Supabase Dashboard: Monitor database size and connection pool

### Backups
- Supabase provides automatic backups on paid plans
- Free tier: Manually export data via SQL Editor if needed

## Contact

For questions about this project:
- Check deployment guides: `DEPLOYMENT.md`, `DEPLOY_NOW.md`
- Review development guide: `DEVELOPMENT.md`
- Quick start: `QUICKSTART.md`

---

**Last Updated:** August 2026  
**Current Version:** v1.0 (Public, no authentication)
