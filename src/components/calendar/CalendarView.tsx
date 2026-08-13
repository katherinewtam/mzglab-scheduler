'use client';

import { useState, useEffect } from 'react';
import { Resource } from '@prisma/client';
import { Session } from 'next-auth';
import Link from 'next/link';
import WeekNavigation from './WeekNavigation';
import WeeklyCalendar from './WeeklyCalendar';
import ReservationModal from './ReservationModal';
import { getWeekRange } from '@/lib/utils';

interface CalendarViewProps {
  resource: Resource;
  session: Session | null;
  isTrainedOrNotRequired: boolean;
}

export default function CalendarView({
  resource,
  session,
  isTrainedOrNotRequired,
}: CalendarViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    startTime: Date;
    endTime: Date;
  } | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);

  useEffect(() => {
    fetchReservations();
  }, [currentWeek, resource.id]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const { start, end } = getWeekRange(currentWeek);
      const response = await fetch(
        `/api/reservations?resourceId=${resource.id}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (date: Date, startTime: Date, endTime: Date) => {
    setSelectedSlot({ date, startTime, endTime });
    setSelectedReservation(null);
    setModalOpen(true);
  };

  const handleReservationClick = (reservation: any) => {
    setSelectedReservation(reservation);
    setSelectedSlot(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSlot(null);
    setSelectedReservation(null);
  };

  const handleReservationCreated = () => {
    fetchReservations();
    handleModalClose();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Calendars
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">{resource.name} Reservation</h1>

        {resource.instructions && (
          <div className="mb-4 text-gray-700">
            <strong>{resource.instructions}</strong>
          </div>
        )}

        <WeekNavigation
          currentWeek={currentWeek}
          onWeekChange={setCurrentWeek}
        />

        <div className="mt-6">
          {loading ? (
            <div className="text-center py-8">Loading calendar...</div>
          ) : (
            <WeeklyCalendar
              currentWeek={currentWeek}
              reservations={reservations}
              onSlotClick={handleSlotClick}
              onReservationClick={handleReservationClick}
              resource={resource}
              canCreateReservation={true}
            />
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600 text-center">
          Timezone: America/Los_Angeles
        </div>

        {modalOpen && (
          <ReservationModal
            resource={resource}
            session={session}
            selectedSlot={selectedSlot}
            selectedReservation={selectedReservation}
            onClose={handleModalClose}
            onSuccess={handleReservationCreated}
          />
        )}
      </div>
    </div>
  );
}
