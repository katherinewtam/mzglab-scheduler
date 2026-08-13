import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const resources = await prisma.resource.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">MZG LAB Caltech</h1>

        <div>
          <h2 className="text-xl font-semibold mb-4">Calendars</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
