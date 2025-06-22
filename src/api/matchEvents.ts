import axiosInstance from './axios';
import type { 
  MatchEvent, 
  CreateMatchEventRequest, 
  UpdateMatchEventRequest 
} from '../types/matchEvents';

// Backend response types based on the API documentation
interface MatchEventApiResponse {
  id: number;
  matchId: number;
  playerId: number;
  playerName: string;
  type: string; // GOAL, YELLOW_CARD, etc.
  minute: number;
}

interface MatchEventsListApiResponse {
  events: MatchEventApiResponse[];
}

export const matchEventsApi = {
  // Create a new match event
  createMatchEvent: async (data: CreateMatchEventRequest): Promise<MatchEvent | null> => {
    try {
      const requestBody = {
        matchId: data.matchId,
        playerId: data.playerId || 0, // Backend requires playerId, use 0 if not provided
        type: data.eventType,
        minute: data.eventTime
      };
      
      const response = await axiosInstance.post<MatchEventApiResponse>('/match-events', requestBody);
      
      // Transform backend response to our MatchEvent type
      return {
        id: response.data.id,
        matchId: response.data.matchId,
        playerId: response.data.playerId,
        teamId: data.teamId,
        eventType: response.data.type as any,
        eventTime: response.data.minute,
        description: data.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        playerFullName: response.data.playerName,
        teamName: undefined // Backend doesn't return team name in this endpoint
      };
    } catch (error) {
      console.error('Error creating match event:', error);
      throw error;
    }
  },

  // Get match event by ID (public endpoint)
  getMatchEventById: async (id: number): Promise<MatchEvent | null> => {
    try {
      const response = await axiosInstance.get<MatchEventApiResponse>(`/match-events/public/${id}`);
      
      // Transform backend response to our MatchEvent type
      return {
        id: response.data.id,
        matchId: response.data.matchId,
        playerId: response.data.playerId,
        teamId: undefined,
        eventType: response.data.type as any,
        eventTime: response.data.minute,
        description: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        playerFullName: response.data.playerName,
        teamName: undefined
      };
    } catch (error) {
      console.error('Error fetching match event:', error);
      throw error;
    }
  },

  // Get all events for a specific match (public endpoint)
  getMatchEventsByMatchId: async (matchId: number): Promise<MatchEvent[]> => {
    try {
      const response = await axiosInstance.get<MatchEventsListApiResponse>(`/match-events/public/match/${matchId}`);
      
      // Transform backend response to our MatchEvent array
      return response.data.events.map(event => ({
        id: event.id,
        matchId: event.matchId,
        playerId: event.playerId,
        teamId: undefined,
        eventType: event.type as any,
        eventTime: event.minute,
        description: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        playerFullName: event.playerName,
        teamName: undefined
      }));
    } catch (error) {
      console.error('Error fetching match events:', error);
      throw error;
    }
  },

  // Update match event (if available)
  updateMatchEvent: async (id: number, data: UpdateMatchEventRequest): Promise<MatchEvent | null> => {
    try {
      const requestBody = {
        playerId: data.playerId || 0,
        type: data.eventType,
        minute: data.eventTime
      };
      
      const response = await axiosInstance.put<MatchEventApiResponse>(`/match-events/${id}`, requestBody);
      
      // Transform backend response to our MatchEvent type
      return {
        id: response.data.id,
        matchId: response.data.matchId,
        playerId: response.data.playerId,
        teamId: data.teamId,
        eventType: response.data.type as any,
        eventTime: response.data.minute,
        description: data.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        playerFullName: response.data.playerName,
        teamName: undefined
      };
    } catch (error) {
      console.error('Error updating match event:', error);
      throw error;
    }
  },

  // Delete match event (if available)
  deleteMatchEvent: async (id: number): Promise<boolean> => {
    try {
      await axiosInstance.delete(`/match-events/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting match event:', error);
      throw error;
    }
  }
};
