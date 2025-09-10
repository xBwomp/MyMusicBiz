import { Offering } from '../types/program';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  extendedProps: {
    offering: Offering;
    teacherId: string;
    location: string;
    isVirtual: boolean;
  };
}

/**
 * Generate calendar events from an offering's recurring schedule
 */
export const generateCalendarEvents = (offering: Offering): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  
  if (!offering.daysOfWeek || offering.daysOfWeek.length === 0) {
    return events;
  }

  const startDate = new Date(offering.startDate);
  const endDate = new Date(offering.stopDate);
  
  // Parse start and end times
  const [startHours, startMinutes] = offering.startTime.split(':').map(Number);
  const [endHours, endMinutes] = offering.endTime.split(':').map(Number);

  // Generate events for each day of the week in the offering
  offering.daysOfWeek.forEach(dayOfWeek => {
    let currentDate = new Date(startDate);

    // Find the first occurrence of this day of week on or after start date
    const dayDifference = (dayOfWeek - currentDate.getDay() + 7) % 7;
    currentDate.setDate(currentDate.getDate() + dayDifference);

    // Generate recurring events for this day of week
    while (currentDate <= endDate) {
      const eventStart = new Date(currentDate);
      eventStart.setHours(startHours, startMinutes, 0, 0);
      
      const eventEnd = new Date(currentDate);
      eventEnd.setHours(endHours, endMinutes, 0, 0);

      events.push({
        id: `${offering.id}-${currentDate.toISOString().split('T')[0]}`,
        title: offering.className,
        start: eventStart,
        end: eventEnd,
        extendedProps: {
          offering,
          teacherId: offering.teacherId,
          location: offering.deliveryMethod === 'virtual' ? 'Virtual' : offering.location || 'On Site',
          isVirtual: offering.deliveryMethod === 'virtual',
        }
      });

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }
  });

  return events;
};

/**
 * Get all class dates for an offering
 */
export const getOfferingClassDates = (offering: Offering): Date[] => {
  const dates: Date[] = [];
  
  if (!offering.daysOfWeek || offering.daysOfWeek.length === 0) {
    return dates;
  }

  const startDate = new Date(offering.startDate);
  const endDate = new Date(offering.stopDate);

  offering.daysOfWeek.forEach(dayOfWeek => {
    let currentDate = new Date(startDate);

    // Find the first occurrence of this day of week on or after start date
    const dayDifference = (dayOfWeek - currentDate.getDay() + 7) % 7;
    currentDate.setDate(currentDate.getDate() + dayDifference);

    // Generate recurring dates for this day of week
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7);
    }
  });

  return dates.sort((a, b) => a.getTime() - b.getTime());
};

/**
 * Format days of week for display
 */
export const formatDaysOfWeek = (daysOfWeek: number[]): string => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return daysOfWeek
    .sort((a, b) => a - b)
    .map(day => dayNames[day])
    .join(', ');
};

/**
 * Format time for display
 */
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Calculate total class sessions for an offering
 */
export const calculateTotalSessions = (offering: Offering): number => {
  return getOfferingClassDates(offering).length;
};