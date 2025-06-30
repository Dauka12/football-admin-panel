import { create } from 'zustand';
import { matchEventsApi } from '../api/matchEvents';
import type { MatchEvent, CreateMatchEventRequest } from '../types/matchEvents';

interface MatchEventState {
  events: MatchEvent[];
  currentEvent: MatchEvent | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchEventsByMatchId: (matchId: number) => Promise<void>;
  fetchEventById: (id: number) => Promise<void>;
  createEvent: (data: CreateMatchEventRequest) => Promise<boolean>;
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
          events: [...currentEvents, newEvent].sort((a, b) => a.minute - b.minute),
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

  clearEvents: () => {
    set({ events: [], currentEvent: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));
