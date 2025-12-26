import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  color: string;
}

const mockEvents: CalendarEvent[] = [
  { id: '1', title: 'Team Standup', date: new Date(), time: '10:00 AM', color: 'bg-blue-500' },
  { id: '2', title: 'Lunch with Sarah', date: new Date(), time: '12:30 PM', color: 'bg-green-500' },
  { id: '3', title: 'Product Review', date: new Date(), time: '3:00 PM', color: 'bg-purple-500' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CalendarWindow: React.FC<CalendarWindowProps> = ({ onClose, onFocus }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear();
  };

  return (
    <ZWindow
      title="Calendar"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 150, y: 90 }}
      initialSize={{ width: 800, height: 550 }}
      windowType="system"
    >
      <div className="flex h-full bg-[#1e1e1e]">
        {/* Sidebar - Mini Calendar */}
        <div className="w-64 bg-[#2c2c2e] border-r border-white/10 p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-white/70" />
            </button>
            <span className="text-white font-medium">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-white/40 text-xs py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className={`aspect-square flex items-center justify-center text-sm rounded-full transition-colors ${
                    isToday(day)
                      ? 'bg-red-500 text-white'
                      : isSelected(day)
                      ? 'bg-blue-500 text-white'
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Calendars List */}
          <div className="mt-6">
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-2">Calendars</h3>
            {['Personal', 'Work', 'Family'].map((cal, i) => (
              <label key={cal} className="flex items-center gap-2 py-1 text-white/70 text-sm">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-white/30 bg-transparent text-blue-500 focus:ring-blue-500/50"
                />
                <span className={`w-2 h-2 rounded-full ${['bg-blue-500', 'bg-green-500', 'bg-purple-500'][i]}`} />
                {cal}
              </label>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-white text-xl font-semibold">
              {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span>New Event</span>
            </button>
          </div>

          {/* Events */}
          <div className="flex-1 overflow-y-auto p-4">
            {mockEvents.length > 0 ? (
              <div className="space-y-3">
                {mockEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className={`w-1 h-12 rounded-full ${event.color}`} />
                    <div>
                      <p className="text-white font-medium">{event.title}</p>
                      <p className="text-white/50 text-sm">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-white/30">
                No events for this day
              </div>
            )}
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

export default CalendarWindow;
