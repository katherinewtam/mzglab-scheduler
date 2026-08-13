import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createReservationSchema = z.object({
  resourceId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  reservationType: z.enum(['STANDARD', 'LONG_TERM', 'MAINTENANCE', 'TRAINING', 'CALIBRATION', 'OTHER']).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = createReservationSchema.parse(body);

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (startTime >= endTime) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    // Check if resource requires training
    const resource = await prisma.resource.findUnique({
      where: { id: data.resourceId },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    if (resource.requiresTraining && session.user.role !== 'ADMIN') {
      const trainingPermission = await prisma.trainingPermission.findUnique({
        where: {
          userId_resourceId: {
            userId: session.user.id,
            resourceId: data.resourceId,
          },
        },
      });

      if (!trainingPermission?.trained) {
        return NextResponse.json(
          { error: 'You must be trained on this instrument before making reservations. Contact the instrument administrator for training.' },
          { status: 403 }
        );
      }
    }

    // Check for conflicts using a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Lock the reservation table for this resource and time range
      const conflicts = await tx.reservation.findMany({
        where: {
          resourceId: data.resourceId,
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
          ],
        },
      });

      if (conflicts.length > 0) {
        throw new Error('CONFLICT');
      }

      // Create the reservation
      const reservation = await tx.reservation.create({
        data: {
          userId: session.user.id,
          resourceId: data.resourceId,
          startTime,
          endTime,
          reservationType: data.reservationType || 'STANDARD',
          description: data.description,
          notes: data.notes,
        },
        include: {
          user: true,
          resource: true,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          reservationId: reservation.id,
          action: 'RESERVATION_CREATED',
          details: `Created reservation for ${resource.name}`,
        },
      });

      return reservation;
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

    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get('resourceId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!resourceId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        resourceId,
        AND: [
          { startTime: { lt: new Date(endDate) } },
          { endTime: { gt: new Date(startDate) } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
