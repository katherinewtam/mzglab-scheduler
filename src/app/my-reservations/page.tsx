import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatDate, formatTime } from '@/lib/utils';

export default async function MyReservationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const now = new Date();

  const upcomingReservations = await prisma.reservation.findMany({
    where: {
      userId: session.user.id,
      startTime: {
        gte: now,
      },
    },
    include: {
      resource: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  const pastReservations = await prisma.reservation.findMany({
    where: {
      userId: session.user.id,
      endTime: {
        lt: now,
      },
    },
    include: {
      resource: true,
    },
    orderBy: {
      startTime: 'desc',
    },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Calendars
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">My Reservations</h1>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
            {upcomingReservations.length === 0 ? (
              <p className="text-gray-600">No upcoming reservations</p>
            ) : (
              <div className="space-y-4">
                {upcomingReservations.map((reservation) => (
                  <div key={reservation.id} className="border border-gray-300 rounded p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link
                          href={`/calendar/${reservation.resource.slug}`}
                          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {reservation.resource.name}
                        </Link>
                        <div className="mt-1 text-gray-700">
                          <div>{formatDate(reservation.startTime)}</div>
                          <div>
                            {formatTime(reservation.startTime)} – {formatTime(reservation.endTime)}
                          </div>
                          {reservation.description && (
                            <div className="mt-2 text-sm">{reservation.description}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Past</h2>
            {pastReservations.length === 0 ? (
              <p className="text-gray-600">No past reservations</p>
            ) : (
              <div className="space-y-4">
                {pastReservations.map((reservation) => (
                  <div key={reservation.id} className="border border-gray-300 rounded p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link
                          href={`/calendar/${reservation.resource.slug}`}
                          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {reservation.resource.name}
                        </Link>
                        <div className="mt-1 text-gray-700">
                          <div>{formatDate(reservation.startTime)}</div>
                          <div>
                            {formatTime(reservation.startTime)} – {formatTime(reservation.endTime)}
                          </div>
                          {reservation.description && (
                            <div className="mt-2 text-sm">{reservation.description}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
