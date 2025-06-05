import { CalendarEvent, CreateCalendarEventDto, UpdateCalendarEventDto } from '@/types/calendar';

// Mock data for development
const mockEvents: CalendarEvent[] = [
  {
    id: 1,
    title: 'チームミーティング',
    description: '週次の進捗確認会議',
    startDate: new Date(2025, 5, 10, 9, 0).toISOString(),
    endDate: new Date(2025, 5, 10, 10, 0).toISOString(),
    allDay: false,
    color: 'blue',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'プロジェクト締切',
    description: '新機能のリリース予定日',
    startDate: new Date(2025, 5, 15).toISOString(),
    endDate: new Date(2025, 5, 15).toISOString(),
    allDay: true,
    color: 'red',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'プレゼンテーション',
    description: '四半期レビュー発表',
    startDate: new Date(2025, 5, 20, 14, 0).toISOString(),
    endDate: new Date(2025, 5, 20, 15, 30).toISOString(),
    allDay: false,
    color: 'green',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let events = [...mockEvents];
let nextId = 4;

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const calendarService = {
  async getEvents(year: number, month: number): Promise<CalendarEvent[]> {
    await delay(300);
    
    // Filter events for the specified month
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  },

  async getAllEvents(): Promise<CalendarEvent[]> {
    await delay(300);
    return [...events];
  },

  async getEvent(id: number): Promise<CalendarEvent | null> {
    await delay(200);
    return events.find(event => event.id === id) || null;
  },

  async createEvent(data: CreateCalendarEventDto): Promise<CalendarEvent> {
    await delay(500);
    
    const newEvent: CalendarEvent = {
      id: nextId++,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    events.push(newEvent);
    return newEvent;
  },

  async updateEvent(id: number, data: UpdateCalendarEventDto): Promise<CalendarEvent> {
    await delay(500);
    
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    const updatedEvent: CalendarEvent = {
      ...events[eventIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    events[eventIndex] = updatedEvent;
    return updatedEvent;
  },

  async deleteEvent(id: number): Promise<void> {
    await delay(300);
    
    const eventIndex = events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    events.splice(eventIndex, 1);
  },

  // Get events for a specific date range
  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    await delay(300);
    
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      return (eventStart >= startDate && eventStart <= endDate) ||
             (eventEnd >= startDate && eventEnd <= endDate) ||
             (eventStart <= startDate && eventEnd >= endDate);
    });
  },

  // Get today's events
  async getTodaysEvents(): Promise<CalendarEvent[]> {
    await delay(200);
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return this.getEventsByDateRange(startOfDay, endOfDay);
  },
};