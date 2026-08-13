'use client';

import { useState, useRef } from 'react';
import { Resource, Reservation } from '@prisma/client';
import { format, isSameDay, isToday, startOfDay } from 'date-fns';
import { getWeekDays, formatInTimezone, getReservationTypeColor } from '@/lib/utils';

interface WeeklyCalendarProps {
  currentWeek: Date;
  reservations: any[];
  onSlotClick: (date: Date, startTime: Date, endTime: Date) => void;
  onReservationClick: (reservation: any) => void;
  resource: Resource;
  canCreateReservation: boolean;
}

export default function WeeklyCalendar({
  currentWeek,
  reservations,
  onSlotClick,
  onReservationClick,
  resource,
  canCreateReservation,
}: WeeklyCalendarProps) {
  const [dragStart, setDragStart] = useState<{ date: Date; hour: number; minute: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ date: Date; hour: number; minute: number } | null>(null);

  const weekDays = getWeekDays(currentWeek);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const DISPLAY_INTERVAL = 30; // Display 30-minute blocks

  const handleMouseDown = (date: Date, hour: number, minute: number) => {
    if (!canCreateReservation) return;
    setDragStart({ date, hour, minute });
    setDragEnd({ date, hour, minute });
  };

  const handleMouseEnter = (date: Date, hour: number, minute: number) => {
    if (dragStart && isSameDay(dragStart.date, date)) {
      setDragEnd({ date, hour, minute });
    }
  };

  const handleMouseUp = () => {
    if (dragStart && dragEnd && canCreateReservation) {
      const start = new Date(dragStart.date);
      start.setHours(dragStart.hour, dragStart.minute, 0, 0);

      const end = new Date(dragEnd.date);
      end.setHours(dragEnd.hour, dragEnd.minute + DISPLAY_INTERVAL, 0, 0);

      if (start < end) {
        onSlotClick(dragStart.date, start, end);
      } else {
        onSlotClick(dragEnd.date, end, start);
      }
    }
    setDragStart(null);
    setDragEnd(null);
  };

  const isDragging = (date: Date, hour: number, minute: number) => {
    if (!dragStart || !dragEnd || !isSameDay(dragStart.date, date)) return false;

    const currentMinutes = hour * 60 + minute;
    const startMinutes = dragStart.hour * 60 + dragStart.minute;
    const endMinutes = dragEnd.hour * 60 + dragEnd.minute;

    const min = Math.min(startMinutes, endMinutes);
    const max = Math.max(startMinutes, endMinutes);

    return currentMinutes >= min && currentMinutes <= max;
  };

  const getReservationPosition = (reservation: any, day: Date) => {
    const dayStart = startOfDay(day);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const resStart = new Date(reservation.startTime);
    const resEnd = new Date(reservation.endTime);

    // Calculate visible portion for this day
    const visibleStart = resStart < dayStart ? dayStart : resStart;
    const visibleEnd = resEnd > dayEnd ? dayEnd : resEnd;

    if (visibleEnd <= dayStart || visibleStart >= dayEnd) return null;

    const startMinutes = visibleStart.getHours() * 60 + visibleStart.getMinutes();
    const endMinutes = visibleEnd.getHours() * 60 + visibleEnd.getMinutes();
    const duration = endMinutes - startMinutes;

    const pixelsPerMinute = 50 / 30; // 50px per 30-minute block
    const top = startMinutes * pixelsPerMinute;
    const height = Math.max(duration * pixelsPerMinute, 20);

    return { top, height };
  };

  const getCurrentTimePosition = () => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const pixelsPerMinute = 50 / 30; // 50px per 30-minute block
    return minutes * pixelsPerMinute;
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className="overflow-x-auto">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{formatInTimezone(currentWeek, 'MMMM yyyy')}</h2>
      </div>

      <div className="calendar-grid" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        {/* Header row */}
        <div className="calendar-header"></div>
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`calendar-header ${isToday(day) ? 'bg-blue-50' : ''}`}
          >
            <div className="font-semibold">{format(day, 'EEE')}</div>
            <div className="text-lg">{format(day, 'd')}</div>
          </div>
        ))}

        {/* Time rows */}
        {hours.map((hour) => {
          const intervals = Math.floor(60 / DISPLAY_INTERVAL); // 2 intervals per hour (30 minutes each)
          return Array.from({ length: intervals }, (_, intervalIndex) => {
            const minute = intervalIndex * DISPLAY_INTERVAL;
            const showTimeLabel = minute === 0;

            return (
              <div key={`${hour}-${minute}`} className="contents">
                {showTimeLabel && (
                  <div className="time-label">
                    {hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`}
                  </div>
                )}
                {!showTimeLabel && <div className="time-label"></div>}

                {weekDays.map((day, dayIndex) => {
                  const cellDate = new Date(day);
                  cellDate.setHours(hour, minute, 0, 0);

                  return (
                    <div
                      key={dayIndex}
                      className={`calendar-cell ${isToday(day) ? 'bg-blue-50/30' : ''} ${
                        isDragging(day, hour, minute) ? 'bg-blue-100' : ''
                      }`}
                      onMouseDown={() => handleMouseDown(day, hour, minute)}
                      onMouseEnter={() => handleMouseEnter(day, hour, minute)}
                      style={{ cursor: canCreateReservation ? 'pointer' : 'default' }}
                    >
                      {/* Render reservations only once per day at the first cell */}
                      {hour === 0 && minute === 0 && reservations
                        .filter((res) => {
                          const resStart = new Date(res.startTime);
                          const resEnd = new Date(res.endTime);
                          return isSameDay(resStart, day) || (resStart < day && resEnd > day);
                        })
                        .map((reservation) => {
                          const position = getReservationPosition(reservation, day);
                          if (!position) return null;

                          const backgroundColor = getReservationTypeColor(reservation.reservationType);

                          return (
                            <div
                              key={reservation.id}
                              className="reservation-block"
                              style={{
                                top: `${position.top}px`,
                                height: `${position.height}px`,
                                backgroundColor,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onReservationClick(reservation);
                              }}
                            >
                              <div className="font-semibold text-xs truncate">
                                {reservation.user.name}
                              </div>
                              <div className="text-xs text-gray-600 truncate">
                                {format(new Date(reservation.startTime), 'h:mm a')} – {format(new Date(reservation.endTime), 'h:mm a')}
                              </div>
                              {reservation.description && (
                                <div className="text-xs truncate">{reservation.description}</div>
                              )}
                            </div>
                          );
                        })}

                      {/* Current time indicator */}
                      {isToday(day) && hour === 0 && minute === 0 && (
                        <div
                          className="current-time-indicator"
                          style={{ top: `${currentTimePosition}px` }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}
