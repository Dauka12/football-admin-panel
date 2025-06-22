import { create } from 'zustand';
import { matchEventsApi } from '../api/matchEvents';
import type { MatchEvent, CreateMatchEventRequest, UpdateMatchEventRequest } from '../types/matchEvents';

interface MatchEventState {
  events: MatchEvent[];
  currentEvent: MatchEvent | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchEventsByMatchId: (matchId: number) => Promise<void>;
  fetchEventById: (id: number) => Promise<void>;
  createEvent: (data: CreateMatchEventRequest) => Promise<boolean>;
  updateEvent: (id: number, data: UpdateMatchEventRequest) => Promise<boolean>;
  deleteEvent: (id: number) => Promise<boolean>;
  clearEvents: () => void;
  clearError: () => void;
}

export const useMatchEventStore = create<MatchEventState>((set, get) => ({
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,

  fetchEventsByMatchId: async (matchId: number) => {
    set({ isLoading: true, error: null });
    try {
      const events = await matchEventsApi.getMatchEventsByMatchId(matchId);
      set({ events, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch match events',
        isLoading: false 
      });
    }
  },

  fetchEventById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const event = await matchEventsApi.getMatchEventById(id);
      set({ currentEvent: event, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch match event',
        isLoading: false 
      });
    }
  },

  createEvent: async (data: CreateMatchEventRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newEvent = await matchEventsApi.createMatchEvent(data);
      if (newEvent) {
        const currentEvents = get().events;
        set({ 
          events: [...currentEvents, newEvent].sort((a, b) => a.eventTime - b.eventTime),
          isLoading: false 
        });
        return true;
      }
      return false;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create match event',
        isLoading: false 
      });
      return false;
    }
  },

  updateEvent: async (id: number, data: UpdateMatchEventRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedEvent = await matchEventsApi.updateMatchEvent(id, data);
      if (updatedEvent) {
        const currentEvents = get().events;
        set({ 
          events: currentEvents.map(event => 
            event.id === id ? updatedEvent : event
          ).sort((a, b) => a.eventTime - b.eventTime),
          currentEvent: get().currentEvent?.id === id ? updatedEvent : get().currentEvent,
          isLoading: false 
        });
        return true;
      }
      return false;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update match event',
        isLoading: false 
      });
      return false;
    }
  },

  deleteEvent: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const success = await matchEventsApi.deleteMatchEvent(id);
      if (success) {
        const currentEvents = get().events;
        set({ 
          events: currentEvents.filter(event => event.id !== id),
          currentEvent: get().currentEvent?.id === id ? null : get().currentEvent,
          isLoading: false 
        });
        return true;
      }
      return false;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete match event',
        isLoading: false 
      });
      return false;
    }
  },

  clearEvents: () => {
    set({ events: [], currentEvent: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));
