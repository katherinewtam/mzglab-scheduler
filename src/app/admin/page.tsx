import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const resources = await prisma.resource.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { reservations: true },
      },
    },
  });

  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { reservations: true },
      },
    },
  });

  const recentReservations = await prisma.reservation.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      resource: true,
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Calendars
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Resources</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Training Required</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Active</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Total Reservations</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      <Link href={`/calendar/${resource.slug}`} className="text-blue-600 hover:text-blue-800">
                        {resource.name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{resource.description}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {resource.requiresTraining ? 'Yes' : 'No'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {resource.active ? 'Yes' : 'No'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{resource._count.reservations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Total Reservations</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.role}</td>
                    <td className="border border-gray-300 px-4 py-2">{user._count.reservations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Reservations</h2>
            <div className="space-y-3">
              {recentReservations.map((reservation) => (
                <div key={reservation.id} className="border border-gray-300 rounded p-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{reservation.resource.name}</div>
                      <div className="text-sm text-gray-600">
                        {reservation.user.name} • {new Date(reservation.startTime).toLocaleDateString()} {new Date(reservation.startTime).toLocaleTimeString()}
                      </div>
                      {reservation.description && (
                        <div className="text-sm mt-1">{reservation.description}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
