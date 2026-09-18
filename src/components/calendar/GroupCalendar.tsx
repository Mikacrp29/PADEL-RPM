import { useMemo, useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import type { Slot } from '../../types';
import { getSlotStatus, SLOT_STATUS_HEX, SLOT_STATUS_RANGE } from '../../types';
import { lighten } from '../../lib/color';
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
        const count = slot.participants.length;
        const status = getSlotStatus(count);

        const { min, max } = SLOT_STATUS_RANGE[status];
        const span = max - min;
        const progress = span === 0 ? 0 : (count - min) / span;
        const fillColor = lighten(SLOT_STATUS_HEX[status], progress * 0.28);

        // Month-view cells are narrow, especially on phone, so a full
        // "3/4 · Marc, Julie, Sam" string wraps or gets clipped. The count
        // alone is enough to scan the month at a glance; the full roster is
        // still one tap away in SlotDetailsModal. Week/day cells have much
        // more room, so names stay there.
        const title =
          activeView === 'dayGridMonth'
            ? `${count}/4`
            : `${count}/4 · ${slot.participants.map((p) => p.name).join(', ')}`;

        return {
          id: slot.id,
          title,
          start: slot.start.toDate(),
          end: slot.end.toDate(),
          backgroundColor: fillColor,
          borderColor: SLOT_STATUS_HEX[status],
          textColor: status === 'empty' ? '#eef5f4' : '#071a1a',
          extendedProps: { slot },
        };
      }),
    [slots, activeView]
  );

    // Used to show a subtle '+' hint on days that have no slot yet.
  const datesWithSlots = useMemo(() => {
    const set = new Set<string>();
    slots.forEach((slot) => {
      const d = slot.start.toDate();
      set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    return set;
  }, [slots]);

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
    const monthViewOptions = {
    dayHeaderFormat: { weekday: 'short' as const },
    displayEventTime: false,
  };

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
                        dayCellContent={(arg) => {
          const key = `${arg.date.getFullYear()}-${arg.date.getMonth()}-${arg.date.getDate()}`;
          const showHint = !arg.isOther && !datesWithSlots.has(key);
          return (
            <div className="flex min-h-[64px] w-full flex-col">
              <div className="flex w-full items-center justify-between px-0.5">
                <span>{arg.dayNumberText}</span>
              </div>
              {showHint && (
                <div className="flex flex-1 items-center justify-center">
                    <span className="text-3xl font-bold text-ball/50">+</span>
                </div>
              )}
            </div>
          );
        }}
               eventContent={(arg) => {
          const slot = arg.event.extendedProps.slot as Slot;
          const full = slot.participants.length >= 4;
          return (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-0.5">
              <span className="truncate">{arg.event.title}</span>
              {!full && (
                <span className="pointer-events-none absolute right-0 top-0 text-[9px] font-bold leading-none text-court-950/70">
                  +
                </span>
              )}
            </div>
          );
        }}
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