import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';

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
  { id: '1', title: 'Team Standup', date: new Date(), time: '10:00 AM', color: 'bg-blue-400/80' },
  { id: '2', title: 'Lunch with Sarah', date: new Date(), time: '12:30 PM', color: 'bg-emerald-400/80' },
  { id: '3', title: 'Product Review', date: new Date(), time: '3:00 PM', color: 'bg-violet-400/80' },
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
      <div className="flex h-full bg-black/60 backdrop-blur-2xl">
        {/* Sidebar - Mini Calendar */}
        <div className="w-64 bg-white/[0.03] border-r border-white/[0.08] p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={prevMonth} 
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-white/70" />
            </button>
            <span className="text-white/90 font-medium text-sm tracking-wide">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button 
              onClick={nextMonth} 
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95"
            >
              <ChevronRight className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-white/40 text-[10px] font-medium py-1 uppercase tracking-wider">
                {day.charAt(0)}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-all duration-200 ${
                    isToday(day)
                      ? 'bg-red-500/90 text-white font-semibold shadow-lg shadow-red-500/30'
                      : isSelected(day)
                      ? 'bg-white/20 text-white font-medium backdrop-blur-sm border border-white/20'
                      : 'text-white/60 hover:bg-white/10 hover:text-white/90'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Calendars List */}
          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <h3 className="text-white/40 text-[10px] uppercase tracking-widest font-medium mb-3">Calendars</h3>
            {['Personal', 'Work', 'Family'].map((cal, i) => (
              <label key={cal} className="flex items-center gap-2.5 py-1.5 text-white/70 text-sm cursor-pointer hover:text-white/90 transition-colors">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/30 focus:ring-offset-0"
                />
                <span className={`w-2 h-2 rounded-full ${['bg-blue-400', 'bg-emerald-400', 'bg-violet-400'][i]}`} />
                {cal}
              </label>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-white/[0.02]">
            <h2 className="text-white/90 text-lg font-medium tracking-tight">
              {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/[0.08] text-white/90 rounded-lg transition-all duration-200 backdrop-blur-sm active:scale-[0.98]">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Event</span>
            </button>
          </div>

          {/* Events */}
          <div className="flex-1 overflow-y-auto p-4">
            {mockEvents.length > 0 ? (
              <div className="space-y-2">
                {mockEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-sm group"
                  >
                    <div className={`w-1 h-12 rounded-full ${event.color} group-hover:h-14 transition-all duration-200`} />
                    <div className="flex-1">
                      <p className="text-white/90 font-medium text-sm">{event.title}</p>
                      <p className="text-white/40 text-xs mt-0.5">{event.time}</p>
                    </div>
                    <div className="text-white/30 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      View
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/30">
                <CalendarIcon className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">No events for this day</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Calendar app manifest
 */
export const CalendarManifest = {
  identifier: 'ai.hanzo.calendar',
  name: 'Calendar',
  version: '1.0.0',
  description: 'Calendar app for zOS',
  category: 'productivity' as const,
  permissions: ['storage', 'notifications'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 800, height: 550 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Calendar menu bar configuration
 */
export const CalendarMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newEvent', label: 'New Event', shortcut: '⌘N' },
        { type: 'item' as const, id: 'newCalendar', label: 'New Calendar', shortcut: '⌥⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'import', label: 'Import...', shortcut: '⌘I' },
        { type: 'item' as const, id: 'export', label: 'Export...' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'undo', label: 'Undo', shortcut: '⌘Z' },
        { type: 'item' as const, id: 'redo', label: 'Redo', shortcut: '⇧⌘Z' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'cut', label: 'Cut', shortcut: '⌘X' },
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: '⌘C' },
        { type: 'item' as const, id: 'paste', label: 'Paste', shortcut: '⌘V' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'delete', label: 'Delete', shortcut: '⌘⌫' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showDay', label: 'Day', shortcut: '⌘1' },
        { type: 'item' as const, id: 'showWeek', label: 'Week', shortcut: '⌘2' },
        { type: 'item' as const, id: 'showMonth', label: 'Month', shortcut: '⌘3' },
        { type: 'item' as const, id: 'showYear', label: 'Year', shortcut: '⌘4' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'goToToday', label: 'Go to Today', shortcut: '⌘T' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showSidebar', label: 'Show Sidebar' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: '⌘M' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'calendarHelp', label: 'Calendar Help' },
      ],
    },
  ],
};

/**
 * Calendar dock configuration
 */
export const CalendarDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newEvent', label: 'New Event' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Calendar App definition for registry
 */
export const CalendarApp = {
  manifest: CalendarManifest,
  component: CalendarWindow,
  icon: CalendarIcon,
  menuBar: CalendarMenuBar,
  dockConfig: CalendarDockConfig,
};

export default CalendarWindow;
