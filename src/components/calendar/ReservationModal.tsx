'use client';

import { useState, useEffect } from 'react';
import { Resource } from '@prisma/client';
import { Session } from 'next-auth';
import { format } from 'date-fns';
import { formatDate, formatTime, getReservationTypeLabel } from '@/lib/utils';

interface ReservationModalProps {
  resource: Resource;
  session: Session | null;
  selectedSlot: {
    date: Date;
    startTime: Date;
    endTime: Date;
  } | null;
  selectedReservation: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReservationModal({
  resource,
  session,
  selectedSlot,
  selectedReservation,
  onClose,
  onSuccess,
}: ReservationModalProps) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reservationType, setReservationType] = useState('STANDARD');
  const [userName, setUserName] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEdit = !!selectedReservation;
  const canEdit = true; // Everyone can edit all reservations

  useEffect(() => {
    if (selectedSlot) {
      setDate(format(selectedSlot.date, 'yyyy-MM-dd'));
      setStartTime(format(selectedSlot.startTime, 'HH:mm'));
      setEndTime(format(selectedSlot.endTime, 'HH:mm'));
      setReservationType('STANDARD');
      setUserName('');
      setDescription('');
      setNotes('');
    } else if (selectedReservation) {
      const startDate = new Date(selectedReservation.startTime);
      const endDate = new Date(selectedReservation.endTime);
      setDate(format(startDate, 'yyyy-MM-dd'));
      setStartTime(format(startDate, 'HH:mm'));
      setEndTime(format(endDate, 'HH:mm'));
      setReservationType(selectedReservation.reservationType);
      setUserName(selectedReservation.user?.name || '');
      setDescription(selectedReservation.description || '');
      setNotes(selectedReservation.notes || '');
    }
  }, [selectedSlot, selectedReservation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      // Handle overnight bookings
      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      const data = {
        resourceId: resource.id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        reservationType,
        userName: userName || undefined,
        description: description || undefined,
        notes: notes || undefined,
      };

      let response;
      if (isEdit) {
        response = await fetch(`/api/reservations/${selectedReservation.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        response = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'An error occurred');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/reservations/${selectedReservation.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'An error occurred');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {isEdit
              ? canEdit
                ? 'Edit Reservation'
                : 'Reservation Details'
              : `Reserve ${resource.name}`}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!isEdit || canEdit ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Start Time *</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Time *</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  If end time is before start time, it will be treated as next day
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Your Name *</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reservation Type</label>
                <select
                  value={reservationType}
                  onChange={(e) => setReservationType(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="LONG_TERM">Long-term</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="TRAINING">Training</option>
                  <option value="CALIBRATION">Calibration</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Experiment / Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="2-cell embryo live imaging"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : isEdit ? 'Update Reservation' : 'Create Reservation'}
                </button>
              </div>

              {isEdit && canEdit && !showDeleteConfirm && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  disabled={loading}
                >
                  Delete Reservation
                </button>
              )}

              {showDeleteConfirm && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <p className="text-sm mb-2">
                    Are you sure you want to delete this reservation?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                      disabled={loading}
                    >
                      Keep Reservation
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Deleting...' : 'Delete Reservation'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-600">Resource</div>
                <div>{resource.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">User</div>
                <div>{selectedReservation.user.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Date</div>
                <div>{formatDate(new Date(selectedReservation.startTime))}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Start</div>
                <div>{formatTime(new Date(selectedReservation.startTime))}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">End</div>
                <div>{formatTime(new Date(selectedReservation.endTime))}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Type</div>
                <div>{getReservationTypeLabel(selectedReservation.reservationType)}</div>
              </div>
              {selectedReservation.description && (
                <div>
                  <div className="text-sm font-medium text-gray-600">Description</div>
                  <div>{selectedReservation.description}</div>
                </div>
              )}
              {selectedReservation.notes && (
                <div>
                  <div className="text-sm font-medium text-gray-600">Notes</div>
                  <div className="whitespace-pre-wrap">{selectedReservation.notes}</div>
                </div>
              )}
              <button
                onClick={onClose}
                className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 mt-4"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
