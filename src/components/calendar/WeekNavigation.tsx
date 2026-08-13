'use client';

import { addWeeks, subWeeks, startOfWeek } from 'date-fns';
import { formatWeekLabel } from '@/lib/utils';

interface WeekNavigationProps {
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
}

export default function WeekNavigation({ currentWeek, onWeekChange }: WeekNavigationProps) {
  const goToToday = () => {
    onWeekChange(new Date());
  };

  const goToPreviousWeek = () => {
    onWeekChange(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    onWeekChange(addWeeks(currentWeek, 1));
  };

  const getWeeksList = () => {
    const weeks: Date[] = [];
    for (let i = -4; i <= 4; i++) {
      weeks.push(addWeeks(startOfWeek(currentWeek, { weekStartsOn: 1 }), i));
    }
    return weeks;
  };

  const isCurrentWeek = (date: Date) => {
    const current = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const compare = startOfWeek(date, { weekStartsOn: 1 });
    return current.getTime() === compare.getTime();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goToPreviousWeek}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          ← Previous Week
        </button>
        <button
          onClick={goToToday}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-medium"
        >
          Today
        </button>
        <button
          onClick={goToNextWeek}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Next Week →
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
        {getWeeksList().map((week, index) => (
          <button
            key={index}
            onClick={() => onWeekChange(week)}
            className={`px-2 py-1 ${
              isCurrentWeek(week)
                ? 'font-bold text-gray-900'
                : 'text-blue-600 hover:text-blue-800 hover:underline'
            }`}
          >
            {formatWeekLabel(week)}
          </button>
        ))}
      </div>
    </div>
  );
}
