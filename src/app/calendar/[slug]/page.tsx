import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CalendarView from '@/components/calendar/CalendarView';

export default async function CalendarPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);

  const resource = await prisma.resource.findUnique({
    where: { slug: params.slug },
  });

  if (!resource) {
    notFound();
  }

  let isTrainedOrNotRequired = true;
  if (resource.requiresTraining && session?.user) {
    const trainingPermission = await prisma.trainingPermission.findUnique({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId: resource.id,
        },
      },
    });
    isTrainedOrNotRequired = trainingPermission?.trained || session.user.role === 'ADMIN' || false;
  }

  return (
    <CalendarView
      resource={resource}
      session={session}
      isTrainedOrNotRequired={isTrainedOrNotRequired}
    />
  );
}
