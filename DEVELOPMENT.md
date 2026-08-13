# Development Guide

## Architecture Overview

This application follows a modern Next.js App Router architecture with server and client components.

### Key Design Decisions

1. **Server-Side Rendering**: Calendar directory and initial data loading use React Server Components
2. **Client Components**: Interactive calendar grid, modals, and forms use 'use client'
3. **API Routes**: RESTful endpoints in `/api` handle CRUD operations
4. **Database-First**: Prisma ORM with PostgreSQL for type-safe database access

## Project Structure

```
src/
├── app/                           # Next.js App Router pages
│   ├── api/                       # API routes
│   │   ├── auth/[...nextauth]/    # NextAuth handler
│   │   └── reservations/          # Reservation CRUD
│   ├── calendar/[slug]/           # Individual calendar pages
│   ├── login/                     # Authentication page
│   ├── my-reservations/           # User reservations
│   ├── admin/                     # Admin dashboard
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Homepage (calendar directory)
│   └── globals.css                # Global styles
├── components/
│   └── calendar/                  # Calendar UI components
│       ├── CalendarView.tsx       # Main calendar container (client)
│       ├── WeekNavigation.tsx     # Week selector
│       ├── WeeklyCalendar.tsx     # Calendar grid with drag-to-create
│       └── ReservationModal.tsx   # Create/edit/delete modal
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   ├── prisma.ts                  # Prisma client singleton
│   └── utils.ts                   # Utility functions (dates, colors, etc.)
└── types/
    └── next-auth.d.ts             # NextAuth type extensions
```

## Database Schema

### Core Models

**User**
- Authentication and role management
- Relations: reservations, training permissions, audit logs

**Resource**
- Represents lab equipment/instruments
- Configurable booking rules (min/max duration, increment, training required)

**Reservation**
- Time-based bookings with conflict detection
- Supports overnight and multi-day bookings

**TrainingPermission**
- Controls access to training-required resources
- Many-to-many relationship between users and resources

**AuditLog**
- Tracks all reservation changes for accountability

## Key Features Implementation

### 1. Conflict Detection

**Challenge**: Prevent double bookings when multiple users book simultaneously

**Solution**: PostgreSQL transaction with overlap check
```typescript
await prisma.$transaction(async (tx) => {
  const conflicts = await tx.reservation.findMany({
    where: {
      resourceId,
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });
  if (conflicts.length > 0) throw new Error('CONFLICT');
  // Create reservation...
});
```

### 2. Click-and-Drag Booking

**Implementation**: Mouse events on calendar cells
- `onMouseDown`: Start drag
- `onMouseEnter`: Update drag end
- `onMouseUp`: Create reservation with selected range

### 3. Overnight Reservations

**Display Logic**: Reservations spanning multiple days appear on each day
```typescript
const getReservationPosition = (reservation, day) => {
  // Calculate visible portion for this specific day
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const visibleStart = max(reservation.start, dayStart);
  const visibleEnd = min(reservation.end, dayEnd);
  // Return position and height
};
```

### 4. Training Permissions

**Enforcement**:
- Database level: Check on reservation creation
- UI level: Disable booking for untrained users
- Admin override: Admins bypass training requirements

### 5. Timezone Handling

**Strategy**: Store UTC, display Pacific
- Database: All timestamps in UTC
- Display: Convert to America/Los_Angeles using date-fns-tz
- Forms: Parse user input as Pacific time

## API Endpoints

### Reservations

**GET** `/api/reservations?resourceId=X&startDate=Y&endDate=Z`
- Fetch reservations for a resource and date range
- Used by calendar to load weekly data

**POST** `/api/reservations`
- Create new reservation
- Body: `{ resourceId, startTime, endTime, reservationType, description, notes }`
- Returns: Created reservation or 409 conflict error

**GET** `/api/reservations/[id]`
- Get single reservation details

**PATCH** `/api/reservations/[id]`
- Update reservation
- Checks ownership/admin
- Re-validates conflicts

**DELETE** `/api/reservations/[id]`
- Delete reservation
- Checks ownership/admin
- Creates audit log

## Development Workflow

### Making Schema Changes

1. Edit `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name description`
3. Update seed data if needed
4. Update TypeScript types (auto-generated)

### Adding a New Resource Type

1. Admin creates resource via database (or future admin UI)
2. Resource automatically appears in calendar directory
3. URL: `/calendar/{slug}` works immediately
4. Configure booking rules per resource

### Modifying Calendar Display

Key files:
- `WeeklyCalendar.tsx`: Grid layout and reservation rendering
- `globals.css`: Calendar-specific styles (`.calendar-grid`, `.reservation-block`)

### Authentication Changes

- NextAuth config: `src/lib/auth.ts`
- Add providers: Install provider package, add to `authOptions.providers`
- Modify user model: Update Prisma schema, migrate

## Testing

### Manual Testing Checklist

- [ ] Create reservation (click and drag)
- [ ] Edit own reservation
- [ ] Delete own reservation
- [ ] Conflict prevention (try overlapping bookings)
- [ ] Training restriction (untrained user can't book)
- [ ] Admin override (admin can edit any reservation)
- [ ] Overnight booking (check next-day display)
- [ ] Week navigation
- [ ] Login/logout
- [ ] My Reservations page

### Database Testing

```bash
# Reset database
npx prisma migrate reset

# Run seed
npx prisma db seed

# Open Prisma Studio to inspect data
npx prisma studio
```

## Common Issues

### Prisma Client Not Generated

```bash
npx prisma generate
```

### Type Errors After Schema Change

```bash
npx prisma generate
# Restart TypeScript server in VS Code
```

### Stale Session Data

NextAuth caches sessions. Clear cookies or use different browser for testing.

### Time Display Issues

Check timezone configuration in `src/lib/utils.ts`. Ensure `TIMEZONE` constant matches desired location.

## Performance Considerations

### Database Queries

- Indexed fields: `resourceId`, `startTime`, `endTime`, `userId`
- Week query fetches only overlapping reservations
- Connection pooling via Prisma

### Client-Side Rendering

- Calendar grid is client component for interactivity
- Server components fetch initial data
- Optimistic UI updates on successful booking

### Scalability

Current architecture supports:
- ~10-20 resources
- ~100 users
- ~1000 reservations/month

For larger scale:
- Add Redis caching
- Implement pagination for reservations
- Add database read replicas

## Deployment

### Environment Variables

Required in production:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<strong-random-secret>"
```

### Build

```bash
npm run build
npm start
```

### Migrations in Production

```bash
# Run migrations
npx prisma migrate deploy

# Check status
npx prisma migrate status
```

## Future Enhancements

See README.md for planned features.

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Create pull request
5. Document breaking changes

## Support

For technical questions, consult:
- Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs
- NextAuth docs: https://next-auth.js.org
