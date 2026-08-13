import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateReservationSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  reservationType: z.enum(['STANDARD', 'LONG_TERM', 'MAINTENANCE', 'TRAINING', 'CALIBRATION', 'OTHER']).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resource: true,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: { resource: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Check if user owns the reservation or is an admin
    if (reservation.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const data = updateReservationSchema.parse(body);

    const startTime = data.startTime ? new Date(data.startTime) : reservation.startTime;
    const endTime = data.endTime ? new Date(data.endTime) : reservation.endTime;

    if (startTime >= endTime) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    // Check for conflicts (excluding current reservation)
    const result = await prisma.$transaction(async (tx) => {
      const conflicts = await tx.reservation.findMany({
        where: {
          resourceId: reservation.resourceId,
          id: { not: params.id },
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
          ],
        },
      });

      if (conflicts.length > 0) {
        throw new Error('CONFLICT');
      }

      const beforeState = JSON.stringify(reservation);

      const updated = await tx.reservation.update({
        where: { id: params.id },
        data: {
          ...(data.startTime && { startTime }),
          ...(data.endTime && { endTime }),
          ...(data.reservationType && { reservationType: data.reservationType }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
        include: {
          user: true,
          resource: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          reservationId: params.id,
          action: 'RESERVATION_UPDATED',
          details: `Updated reservation for ${reservation.resource.name}`,
          before: beforeState,
          after: JSON.stringify(updated),
        },
      });

      return updated;
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'CONFLICT') {
      return NextResponse.json(
        { error: 'This instrument is already reserved during part of the selected time. Please choose another time.' },
        { status: 409 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }

    console.error('Error updating reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: { resource: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Check if user owns the reservation or is an admin
    if (reservation.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          reservationId: params.id,
          action: 'RESERVATION_DELETED',
          details: `Deleted reservation for ${reservation.resource.name}`,
          before: JSON.stringify(reservation),
        },
      });

      await tx.reservation.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
