import { useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import type { Slot } from '../../types';
import { getSlotStatus, SLOT_STATUS_COLOR } from '../../types';

interface GroupCalendarProps {
  slots: Slot[];
  onSelectRange: (start: Date, end: Date) => void;
  onSelectSlot: (slot: Slot) => void;
}

export function GroupCalendar({ slots, onSelectRange, onSelectSlot }: GroupCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);

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

  return (
    <div className="rounded-2xl border border-court-700 bg-court-900 p-3 sm:p-5">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        initialView="timeGridWeek"
        locale="fr"
        firstDay={1}
        height="auto"
        selectable
        selectMirror
        select={handleSelect}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        events={events}
        slotMinTime="07:00:00"
        slotMaxTime="23:00:00"
        allDaySlot={false}
        nowIndicator
        eventDisplay="block"
        buttonText={{ today: "aujourd'hui", month: 'mois', week: 'semaine', day: 'jour' }}
      />
    </div>
  );
}
