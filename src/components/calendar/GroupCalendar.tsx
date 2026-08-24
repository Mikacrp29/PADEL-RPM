import { useMemo, useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import type { Slot } from '../../types';
import { getSlotStatus, SLOT_STATUS_COLOR } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 640
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

type ViewKey = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

interface GroupCalendarProps {
  slots: Slot[];
  onSelectRange: (start: Date, end: Date) => void;
  onSelectSlot: (slot: Slot) => void;
}

export function GroupCalendar({ slots, onSelectRange, onSelectSlot }: GroupCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<ViewKey>('dayGridMonth');
  const { t, language } = useLanguage();

  const viewOptions: { key: ViewKey; label: string }[] = [
    { key: 'dayGridMonth', label: t('calendar.month') },
    { key: 'timeGridWeek', label: t('calendar.week') },
    { key: 'timeGridDay', label: t('calendar.day') },
  ];

  const events = useMemo(
    () =>
      slots.map((slot) => {
        const status = getSlotStatus(slot.participants.length);
        return {
          id: slot.id,
          title: `${slot.participants.length}/4 · ${slot.participants
            .map((p) => p.name)
            .join(', ')}`,
          start: slot.start.toDate(),
          end: slot.end.toDate(),
          backgroundColor: SLOT_STATUS_COLOR[status],
          borderColor: SLOT_STATUS_COLOR[status],
          textColor: status === 'empty' ? '#eef5f4' : '#071a1a',
          extendedProps: { slot },
        };
      }),
    [slots]
  );

  const handleSelect = (arg: DateSelectArg) => {
    onSelectRange(arg.start, arg.end);
    arg.view.calendar.unselect();
  };

  // A simple tap/click always creates a default 1h30 slot — in month view
  // there's no time-of-day on the clicked cell, so it defaults to 19:00;
  // in week/day view the exact time tapped is already known, so that's
  // used directly. Previously this only handled month view, leaving
  // week/day with no click-to-create at all (only drag-to-select, which
  // isn't obvious or reliable as a touch gesture on a phone).
  const handleDateClick = (arg: DateClickArg) => {
    const start = new Date(arg.date);
    if (arg.view.type.startsWith('dayGrid')) {
      start.setHours(19, 0, 0, 0);
    }
    const end = new Date(start);
    end.setHours(start.getHours() + 1, start.getMinutes() + 30);
    onSelectRange(start, end);
  };

  const handleEventClick = (arg: EventClickArg) => {
    onSelectSlot(arg.event.extendedProps.slot as Slot);
  };

  const changeView = (view: ViewKey) => {
    setActiveView(view);
    calendarRef.current?.getApi().changeView(view);
  };

  // Month view always uses short weekday labels ("lun"/"Mon"...) so the
  // header never wraps onto two lines, on phone or desktop, in either
  // language.
  const monthViewOptions = { dayHeaderFormat: { weekday: 'short' as const } };

  return (
    <div className="rounded-2xl border border-court-700 bg-court-900 p-2.5 sm:p-5">
      <div className="mb-3 flex justify-center gap-1 rounded-xl bg-court-800 p-1">
        {viewOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => changeView(key)}
            className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
              activeView === key
                ? 'bg-ball text-court-950 font-semibold'
                : 'text-mist-300 hover:text-mist-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        views={{
          dayGridMonth: monthViewOptions,
        }}
        headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
        initialView="dayGridMonth"
        locale={language === 'en' ? 'en' : 'fr'}
        firstDay={1}
        height="auto"
        contentHeight="auto"
        aspectRatio={isMobile ? 0.85 : 1.6}
        selectable
        selectMirror
        select={handleSelect}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        events={events}
        slotMinTime="07:00:00"
        slotMaxTime="23:00:00"
        slotDuration="00:30:00"
        slotLabelInterval="01:00:00"
        allDaySlot={false}
        nowIndicator
        eventDisplay="block"
        buttonText={{ today: t('calendar.today') }}
      />
    </div>
  );
}