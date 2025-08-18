import { Offering } from '../types/program';

export interface CalendarEvent {
  offeringId: string;
  date: Date;
  instructor: string;
  location: string;
  isVirtual: boolean;
}

export const calendarService = {
  generateEvents(offering: Offering): CalendarEvent[] {
    return offering.classDates
      .filter(date => date >= offering.startDate)
      .map(date => ({
        offeringId: offering.id,
        date,
        instructor: offering.instructor,
        location: offering.deliveryMethod === 'onsite' ? offering.location ?? '' : 'Virtual',
        isVirtual: offering.deliveryMethod === 'virtual',
      }));
  },
};
