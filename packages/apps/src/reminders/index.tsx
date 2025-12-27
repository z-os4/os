import React, { useState, useEffect } from 'react';
import { ZWindow } from '@z-os/ui';
import { Plus, Circle, CheckCircle2, Trash2, Calendar, Flag, Bell } from 'lucide-react';

interface RemindersWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Reminder {
  id: string;
  text: string;
  completed: boolean;
  priority: 'none' | 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: Date;
}

interface ReminderList {
  id: string;
  name: string;
  color: string;
  reminders: Reminder[];
}

const STORAGE_KEY = 'zos-reminders';

const defaultLists: ReminderList[] = [
  {
    id: '1',
    name: 'Today',
    color: 'bg-blue-500',
    reminders: [
      { id: '1', text: 'Review pull requests', completed: false, priority: 'high', createdAt: new Date() },
      { id: '2', text: 'Update documentation', completed: true, priority: 'medium', createdAt: new Date() },
      { id: '3', text: 'Team standup meeting', completed: false, priority: 'low', dueDate: '10:00 AM', createdAt: new Date() },
    ],
  },
  {
    id: '2',
    name: 'Work',
    color: 'bg-orange-500',
    reminders: [
      { id: '4', text: 'Finish feature implementation', completed: false, priority: 'high', createdAt: new Date() },
      { id: '5', text: 'Write unit tests', completed: false, priority: 'medium', createdAt: new Date() },
    ],
  },
  {
    id: '3',
    name: 'Personal',
    color: 'bg-green-500',
    reminders: [
      { id: '6', text: 'Go to gym', completed: false, priority: 'none', createdAt: new Date() },
      { id: '7', text: 'Buy groceries', completed: true, priority: 'low', createdAt: new Date() },
    ],
  },
];

const RemindersWindow: React.FC<RemindersWindowProps> = ({ onClose, onFocus }) => {
  const [lists, setLists] = useState<ReminderList[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((list: ReminderList) => ({
          ...list,
          reminders: list.reminders.map(r => ({
            ...r,
            createdAt: new Date(r.createdAt)
          }))
        }));
      }
    } catch (e) {
      console.error('Failed to load reminders:', e);
    }
    return defaultLists;
  });
  const [selectedList, setSelectedList] = useState<string>(lists[0]?.id || '');
  const [newReminder, setNewReminder] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    } catch (e) {
      console.error('Failed to save reminders:', e);
    }
  }, [lists]);

  const currentList = lists.find(l => l.id === selectedList);

  const toggleReminder = (reminderId: string) => {
    setLists(lists.map(list => ({
      ...list,
      reminders: list.reminders.map(r =>
        r.id === reminderId ? { ...r, completed: !r.completed } : r
      )
    })));
  };

  const addReminder = () => {
    if (!newReminder.trim() || !selectedList) return;

    const reminder: Reminder = {
      id: Date.now().toString(),
      text: newReminder.trim(),
      completed: false,
      priority: 'none',
      createdAt: new Date(),
    };

    setLists(lists.map(list =>
      list.id === selectedList
        ? { ...list, reminders: [reminder, ...list.reminders] }
        : list
    ));
    setNewReminder('');
  };

  const deleteReminder = (reminderId: string) => {
    setLists(lists.map(list => ({
      ...list,
      reminders: list.reminders.filter(r => r.id !== reminderId)
    })));
  };

  const cyclePriority = (reminderId: string) => {
    const priorities: Array<'none' | 'low' | 'medium' | 'high'> = ['none', 'low', 'medium', 'high'];
    setLists(lists.map(list => ({
      ...list,
      reminders: list.reminders.map(r => {
        if (r.id === reminderId) {
          const currentIndex = priorities.indexOf(r.priority);
          const nextIndex = (currentIndex + 1) % priorities.length;
          return { ...r, priority: priorities[nextIndex] };
        }
        return r;
      })
    })));
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      none: 'text-white/30',
      low: 'text-blue-400',
      medium: 'text-orange-400',
      high: 'text-red-400',
    };
    return colors[priority] || colors.none;
  };

  const completedCount = currentList?.reminders.filter(r => r.completed).length || 0;
  const totalCount = currentList?.reminders.length || 0;

  return (
    <ZWindow
      title="Reminders"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 150, y: 85 }}
      initialSize={{ width: 600, height: 480 }}
      windowType="system"
    >
      <div className="flex h-full bg-black/60 backdrop-blur-xl">
        {/* Sidebar - Dark glass with transparency */}
        <div className="w-52 bg-black/40 backdrop-blur-md border-r border-white/[0.08] p-3">
          <div className="space-y-1">
            {lists.map(list => (
              <button
                key={list.id}
                onClick={() => setSelectedList(list.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  selectedList === list.id 
                    ? 'bg-white/[0.12] backdrop-blur-sm border border-white/[0.1] shadow-lg shadow-black/20' 
                    : 'hover:bg-white/[0.06] border border-transparent'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${list.color} shadow-lg`} />
                <span className="flex-1 text-left text-white/90 text-sm font-medium">{list.name}</span>
                <span className="text-white/40 text-xs font-medium bg-white/[0.06] px-1.5 py-0.5 rounded">
                  {list.reminders.filter(r => !r.completed).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Glass panel */}
        <div className="flex-1 flex flex-col bg-black/20">
          {currentList && (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/[0.08] bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${currentList.color} shadow-lg`} />
                  <h2 className="text-white text-xl font-semibold tracking-tight">{currentList.name}</h2>
                </div>
                <p className="text-white/40 text-sm mt-1.5 font-medium">
                  {completedCount} of {totalCount} completed
                </p>
              </div>

              {/* Add Reminder - Glass input */}
              <div className="p-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3 bg-white/[0.06] backdrop-blur-sm rounded-lg px-3 py-2.5 border border-white/[0.08] focus-within:border-white/[0.15] focus-within:bg-white/[0.08] transition-all duration-200">
                  <Plus className="w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={newReminder}
                    onChange={(e) => setNewReminder(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addReminder()}
                    placeholder="Add a reminder..."
                    className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Reminders List */}
              <div className="flex-1 overflow-y-auto p-2">
                {currentList.reminders.map(reminder => (
                  <div
                    key={reminder.id}
                    className="group flex items-start gap-3 px-3 py-3 mb-1.5 rounded-lg bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all duration-200"
                  >
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className="mt-0.5 transition-transform duration-200 hover:scale-110"
                    >
                      {reminder.completed ? (
                        <CheckCircle2 className={`w-5 h-5 ${currentList.color.replace('bg-', 'text-')} drop-shadow-lg`} />
                      ) : (
                        <Circle className="w-5 h-5 text-white/30 hover:text-white/50" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${reminder.completed ? 'text-white/40 line-through' : 'text-white/90'}`}>
                        {reminder.text}
                      </p>
                      {reminder.dueDate && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-white/40 text-xs">
                          <Calendar className="w-3 h-3" />
                          <span className="font-medium">{reminder.dueDate}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => cyclePriority(reminder.id)}
                        className={`p-1.5 rounded-md hover:bg-white/[0.1] ${getPriorityColor(reminder.priority)} transition-all duration-200`}
                        title={`Priority: ${reminder.priority}`}
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="p-1.5 rounded-md hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}

                {currentList.reminders.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-white/30">
                    <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm">
                      <CheckCircle2 className="w-12 h-12 mb-4 mx-auto text-white/20" />
                      <p className="text-lg font-medium text-white/50">No reminders</p>
                      <p className="text-sm mt-1 text-white/30">Add a reminder above to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Reminders app manifest
 */
export const RemindersManifest = {
  identifier: 'ai.hanzo.reminders',
  name: 'Reminders',
  version: '1.0.0',
  description: 'Task and reminder app for zOS',
  category: 'productivity' as const,
  permissions: ['storage', 'notifications'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 600, height: 480 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Reminders menu bar configuration
 */
export const RemindersMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newReminder', label: 'New Reminder', shortcut: '⌘N' },
        { type: 'item' as const, id: 'newList', label: 'New List', shortcut: '⇧⌘N' },
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
        { type: 'item' as const, id: 'showCompleted', label: 'Show Completed' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'sortByDueDate', label: 'Sort by Due Date' },
        { type: 'item' as const, id: 'sortByPriority', label: 'Sort by Priority' },
        { type: 'item' as const, id: 'sortByTitle', label: 'Sort by Title' },
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
        { type: 'item' as const, id: 'remindersHelp', label: 'Reminders Help' },
      ],
    },
  ],
};

/**
 * Reminders dock configuration
 */
export const RemindersDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newReminder', label: 'New Reminder' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Reminders App definition for registry
 */
export const RemindersApp = {
  manifest: RemindersManifest,
  component: RemindersWindow,
  icon: Bell,
  menuBar: RemindersMenuBar,
  dockConfig: RemindersDockConfig,
};

export default RemindersWindow;
