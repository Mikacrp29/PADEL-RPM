import { useMemo, useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Slot } from '../../types';
import { getSlotStatus, SLOT_STATUS_HEX, SLOT_STATUS_RANGE } from '../../types';
import { lighten } from '../../lib/color';
import { useLanguage } from '../../contexts/LanguageContext';
import { DaySlotList } from './DaySlotList';

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
  const [activeView, setActiveView] = useState<ViewKey>('timeGridDay');
  function startOfWeek(d: Date) {
    const date = new Date(d);
    const day = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  const todayMidnight = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [selectedDay, setSelectedDay] = useState(todayMidnight);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(todayMidnight));
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

  const shiftMonth = (delta: number) => {
    setSelectedDay((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + delta);
      setWeekStart(startOfWeek(next));
      return next;
    });
  };

  const shiftWeek = (delta: number) => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta * 7);
      setSelectedDay((prevSelected) => {
        const shifted = new Date(prevSelected);
        shifted.setDate(shifted.getDate() + delta * 7);
        return shifted;
      });
      return next;
    });
  };

  const visibleDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart]
  );

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const monthLabel = selectedDay.toLocaleDateString(language === 'en' ? 'en-GB' : 'fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const slotsForSelectedDay = useMemo(
    () =>
      slots.filter((slot) => {
        const d = slot.start.toDate();
        return (
          d.getFullYear() === selectedDay.getFullYear() &&
          d.getMonth() === selectedDay.getMonth() &&
          d.getDate() === selectedDay.getDate()
        );
      }),
    [slots, selectedDay]
  );

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

      <div style={{ display: activeView === 'timeGridDay' ? 'none' : 'block' }}>
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

      {activeView === 'timeGridDay' && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              onClick={() => shiftMonth(-1)}
              aria-label={t('calendar.previousDay')}
              className="rounded-lg p-1.5 text-mist-300 hover:bg-court-800 hover:text-mist-100"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-display text-sm font-semibold capitalize text-mist-100">
              {monthLabel}
            </span>
            <button
              onClick={() => shiftMonth(1)}
              aria-label={t('calendar.nextDay')}
              className="rounded-lg p-1.5 text-mist-300 hover:bg-court-800 hover:text-mist-100"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mb-4 flex items-center gap-1">
            <button
              onClick={() => shiftWeek(-1)}
              aria-label={t('calendar.previousDay')}
              className="shrink-0 rounded-lg p-1 text-mist-500 hover:bg-court-800 hover:text-mist-100"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex flex-1 gap-1.5 overflow-x-auto">
              {visibleDays.map((d) => {
                const selected = isSameDay(d, selectedDay);
                const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                const hasSlots = datesWithSlots.has(key);
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDay(d)}
                    className={`flex min-w-[52px] shrink-0 flex-col items-center gap-1 rounded-xl border px-2 py-2 transition-colors ${
                      selected
                        ? 'border-ball bg-ball text-court-950'
                        : 'border-court-700 bg-court-800 text-mist-100 hover:border-court-600'
                    }`}
                  >
                    <span
                      className={`text-[11px] capitalize ${selected ? 'text-court-950/70' : 'text-mist-500'}`}
                    >
                      {d.toLocaleDateString(language === 'en' ? 'en-GB' : 'fr-FR', {
                        weekday: 'short',
                      })}
                    </span>
                    <span className="text-base font-bold leading-none">{d.getDate()}</span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        hasSlots ? (selected ? 'bg-court-950' : 'bg-ball') : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => shiftWeek(1)}
              aria-label={t('calendar.nextDay')}
              className="shrink-0 rounded-lg p-1 text-mist-500 hover:bg-court-800 hover:text-mist-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <DaySlotList
            slots={slotsForSelectedDay}
            onSelectSlot={onSelectSlot}
            onCreateDefault={() => {
              const start = new Date(selectedDay);
              start.setHours(19, 0, 0, 0);
              const end = new Date(start);
              end.setHours(20, 30, 0, 0);
              onSelectRange(start, end);
            }}
          />
        </div>
      )}
    </div>
  );
}