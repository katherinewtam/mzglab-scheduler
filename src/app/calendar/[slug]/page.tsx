import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CalendarView from '@/components/calendar/CalendarView';

export default async function CalendarPage({ params }: { params: { slug: string } }) {
  const resource = await prisma.resource.findUnique({
    where: { slug: params.slug },
  });

  if (!resource) {
    notFound();
  }

  return (
    <CalendarView
      resource={resource}
      session={null}
      isTrainedOrNotRequired={true}
    />
  );
}
