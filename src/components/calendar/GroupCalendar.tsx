import { useMemo, useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import type { Slot } from '../../types';
import { getSlotStatus, SLOT_STATUS_COLOR } from '../../types';

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

interface GroupCalendarProps {
  slots: Slot[];
  onSelectRange: (start: Date, end: Date) => void;
  onSelectSlot: (slot: Slot) => void;
}

export function GroupCalendar({ slots, onSelectRange, onSelectSlot }: GroupCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const isMobile = useIsMobile();

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

  // Single click on empty cell in month view: default to a 1h30 slot.
  const handleDateClick = (arg: DateClickArg) => {
    if (!arg.view.type.startsWith('dayGrid')) return;
    const start = new Date(arg.date);
    start.setHours(19, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1, start.getMinutes() + 30);
    onSelectRange(start, end);
  };

  const handleEventClick = (arg: EventClickArg) => {
    onSelectSlot(arg.event.extendedProps.slot as Slot);
  };

  // Switch to a single-day view on small screens: a full week grid is too
  // cramped to read or tap accurately on a phone.
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    api.changeView(isMobile ? 'timeGridDay' : 'timeGridWeek');
  }, [isMobile]);

  // Month view always uses short weekday labels ("lun", "mar"...) so the
  // header never wraps onto two lines, on phone or desktop.
  const monthViewOptions = { dayHeaderFormat: { weekday: 'short' as const } };

  return (
    <div className="rounded-2xl border border-court-700 bg-court-900 p-2.5 sm:p-5">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        views={{
          dayGridMonth: monthViewOptions,
        }}
        headerToolbar={
          isMobile
            ? { left: 'prev,next', center: 'title', right: 'today' }
            : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }
        }
        footerToolbar={
          isMobile ? { left: '', center: 'dayGridMonth,timeGridDay', right: '' } : undefined
        }
        initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
        locale="fr"
        firstDay={1}
        height="auto"
        contentHeight="auto"
        aspectRatio={isMobile ? 0.75 : 1.6}
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
        dayHeaderFormat={isMobile ? { weekday: 'long', day: 'numeric', month: 'short' } : undefined}
        buttonText={{ today: "aujourd'hui", month: 'mois', week: 'semaine', day: 'jour' }}
      />
    </div>
  );
}
