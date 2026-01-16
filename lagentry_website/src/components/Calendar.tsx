import React, { useState, useEffect } from 'react';
import './Calendar.css';

interface CalendarProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  theme?: 'dark' | 'light';
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  theme = 'dark',
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'time'>('calendar');
  const [userTimezone, setUserTimezone] = useState<string>('');

  useEffect(() => {
    // Detect user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(timezone);
  }, []);

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM',
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const handleDateClick = (date: Date | null) => {
    if (date && !isPast(date)) {
      onDateSelect(date);
      setView('time');
    }
  };

  const handleTimeClick = (time: string) => {
    onTimeSelect(time);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={`calendar-container ${theme === 'light' ? 'light-theme' : ''}`}>
      {view === 'calendar' ? (
        <>
          <div className="calendar-header">
            <button
              className="calendar-nav-btn"
              onClick={() => navigateMonth('prev')}
              aria-label="Previous month"
            >
              ←
            </button>
            <h3 className="calendar-month-year">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              className="calendar-nav-btn"
              onClick={() => navigateMonth('next')}
              aria-label="Next month"
            >
              →
            </button>
          </div>

          <div className="calendar-grid">
            {dayNames.map((day) => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}
            {days.map((date, index) => (
              <button
                key={index}
                className={`calendar-day ${
                  date === null
                    ? 'calendar-day-empty'
                    : isPast(date)
                    ? 'calendar-day-past'
                    : isSelected(date)
                    ? 'calendar-day-selected'
                    : isToday(date)
                    ? 'calendar-day-today'
                    : ''
                }`}
                onClick={() => handleDateClick(date)}
                disabled={date === null || isPast(date)}
              >
                {date ? date.getDate() : ''}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="time-selector-header">
            <button
              className="calendar-back-btn"
              onClick={() => setView('calendar')}
            >
              ← Back to Calendar
            </button>
            <h3 className="time-selector-title">Select Time</h3>
            {selectedDate && (
              <p className="selected-date-text">
                {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
              </p>
            )}
            {userTimezone && (
              <p className="timezone-context-text">
                Times shown in your timezone: {userTimezone}
              </p>
            )}
          </div>
          <div className="time-slots-grid">
            {timeSlots.map((time) => (
              <button
                key={time}
                className={`time-slot ${selectedTime === time ? 'time-slot-selected' : ''}`}
                onClick={() => handleTimeClick(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;

