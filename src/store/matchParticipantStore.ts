import { create } from 'zustand';
import { matchParticipantApi } from '../api/matchParticipants';
import type {
    CreateMatchParticipantRequest,
    MatchParticipant,
    MatchParticipantFilters,
    MatchParticipantPaymentRequest,
    MatchParticipantStatus,
    MatchParticipantStatusRequest,
    OrganizedMatchParticipant,
    ParticipationCheckResponse,
    UpdateMatchParticipantRequest
} from '../types/matchParticipants';
import { apiService } from '../utils/apiService';
import { ErrorHandler } from '../utils/errorHandler';
import { showToast } from '../utils/toast';

interface MatchParticipantState {
    participants: MatchParticipant[];
    currentParticipant: MatchParticipant | null;
    organizedMatches: OrganizedMatchParticipant[];
    isLoading: boolean;
    error: string | null;
    
    // Filter state
    filters: MatchParticipantFilters;
    
    // Actions
    fetchParticipants: (matchId: number) => Promise<void>;
    fetchParticipantsAdmin: (matchId: number) => Promise<void>;
    fetchParticipantsByStatus: (matchId: number, status: MatchParticipantStatus) => Promise<void>;
    fetchParticipant: (id: number) => Promise<MatchParticipant | null>;
    fetchOrganizedMatches: () => Promise<void>;
    checkParticipation: (matchId: number) => Promise<ParticipationCheckResponse | null>;
    createParticipant: (data: CreateMatchParticipantRequest) => Promise<boolean>;
    updateParticipant: (id: number, data: UpdateMatchParticipantRequest) => Promise<boolean>;
    deleteParticipant: (id: number) => Promise<boolean>;
    processPayment: (id: number, paymentData: MatchParticipantPaymentRequest) => Promise<boolean>;
    updateStatus: (id: number, statusData: MatchParticipantStatusRequest) => Promise<boolean>;
    
    // Utility actions
    setFilters: (filters: MatchParticipantFilters) => void;
    clearError: () => void;
    resetState: () => void;
}

export const useMatchParticipantStore = create<MatchParticipantState>()((set, get) => ({
    participants: [],
    currentParticipant: null,
    organizedMatches: [],
    isLoading: false,
    error: null,
    
    // Filter state
    filters: {},
    
    fetchParticipants: async (matchId: number) => {
        set({ isLoading: true, error: null });
        
        try {
            const participants = await apiService.execute(
                () => matchParticipantApi.getByMatchId(matchId),
                `fetchParticipants_${matchId}`,
                { enableCache: true, cacheTTL: 2 * 60 * 1000 } // Cache for 2 minutes
            );
            
            // Validate and clean data
            const cleanedParticipants = Array.isArray(participants) 
                ? participants.map(participant => ({
                    ...participant,
                    playerFullName: participant.playerFullName || '',
                    teamName: participant.teamName || '',
                    firstName: participant.firstName || '',
                    lastName: participant.lastName || ''
                }))
                : [];
            
            set({ 
                participants: cleanedParticipants,
                isLoading: false 
            });
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false,
                participants: []
            });
        }
    },

    fetchParticipantsAdmin: async (matchId: number) => {
        set({ isLoading: true, error: null });
        
        try {
            const participants = await apiService.execute(
                () => matchParticipantApi.getByMatchIdAdmin(matchId),
                `fetchParticipantsAdmin_${matchId}`,
                { enableCache: true, cacheTTL: 2 * 60 * 1000 }
            );
            
            set({ 
                participants,
                isLoading: false 
            });
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false,
                participants: []
            });
        }
    },

    fetchParticipantsByStatus: async (matchId: number, status: MatchParticipantStatus) => {
        set({ isLoading: true, error: null });
        
        try {
            const participants = await apiService.execute(
                () => matchParticipantApi.getByMatchIdAndStatus(matchId, status),
                `fetchParticipantsByStatus_${matchId}_${status}`,
                { enableCache: true, cacheTTL: 2 * 60 * 1000 }
            );
            
            set({ 
                participants,
                isLoading: false 
            });
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false,
                participants: []
            });
        }
    },

    fetchParticipant: async (id: number) => {
        set({ isLoading: true, error: null });
        
        try {
            const participant = await apiService.execute(
                () => matchParticipantApi.getById(id),
                `fetchParticipant_${id}`,
                { enableCache: true, cacheTTL: 2 * 60 * 1000 }
            );
            
            set({ 
                currentParticipant: participant,
                isLoading: false 
            });
            return participant;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return null;
        }
    },

    fetchOrganizedMatches: async () => {
        set({ isLoading: true, error: null });
        
        try {
            const organizedMatches = await apiService.execute(
                () => matchParticipantApi.getOrganizedMatches(),
                'fetchOrganizedMatches',
                { enableCache: true, cacheTTL: 5 * 60 * 1000 } // Cache for 5 minutes
            );
            
            // Validate and clean data
            const cleanedMatches = Array.isArray(organizedMatches) 
                ? organizedMatches.map(match => ({
                    ...match,
                    playerFullName: match.playerFullName || '',
                    teamName: match.teamName || '',
                    firstName: match.firstName || '',
                    lastName: match.lastName || ''
                }))
                : [];
            
            set({ 
                organizedMatches: cleanedMatches,
                isLoading: false 
            });
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false,
                organizedMatches: []
            });
        }
    },

    checkParticipation: async (matchId: number) => {
        try {
            const result = await apiService.execute(
                () => matchParticipantApi.checkParticipation(matchId),
                `checkParticipation_${matchId}`,
                { enableCache: true, cacheTTL: 1 * 60 * 1000 } // Cache for 1 minute
            );
            return result;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({ error: errorMessage.message });
            return null;
        }
    },

    createParticipant: async (data: CreateMatchParticipantRequest) => {
        set({ isLoading: true, error: null });
        
        try {
            await apiService.execute(
                () => matchParticipantApi.create(data),
                'createParticipant'
            );
            
            // Clear cache and refresh participants for the match
            apiService.clearCache([`fetchParticipants_${data.matchId}`, `fetchParticipantsAdmin_${data.matchId}`]);
            await get().fetchParticipants(data.matchId);
            
            set({ isLoading: false });
            showToast('Participant added successfully!', 'success');
            return true;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    updateParticipant: async (id: number, data: UpdateMatchParticipantRequest) => {
        set({ isLoading: true, error: null });
        
        try {
            const updatedParticipant = await apiService.execute(
                () => matchParticipantApi.update(id, data),
                `updateParticipant_${id}`
            );
            
            // Clear relevant cache entries
            apiService.clearCache([`fetchParticipant_${id}`]);
            
            // Update current participant if it matches
            if (get().currentParticipant?.id === id) {
                set({ currentParticipant: updatedParticipant });
            }
            
            // Update participant in the list
            set(state => ({
                participants: state.participants.map(p => 
                    p.id === id ? updatedParticipant : p
                ),
                isLoading: false
            }));
            
            showToast('Participant updated successfully!', 'success');
            return true;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    deleteParticipant: async (id: number) => {
        set({ isLoading: true, error: null });
        
        try {
            await apiService.execute(
                () => matchParticipantApi.delete(id),
                `deleteParticipant_${id}`
            );
            
            // Clear relevant cache entries
            apiService.clearCache([`fetchParticipant_${id}`]);
            
            // Remove from local state
            set(state => ({
                participants: state.participants.filter(p => p.id !== id),
                currentParticipant: state.currentParticipant?.id === id ? null : state.currentParticipant,
                isLoading: false
            }));
            
            showToast('Participant removed successfully!', 'success');
            return true;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    processPayment: async (id: number, paymentData: MatchParticipantPaymentRequest) => {
        set({ isLoading: true, error: null });
        
        try {
            const updatedParticipant = await apiService.execute(
                () => matchParticipantApi.processPayment(id, paymentData),
                `processPayment_${id}`
            );
            
            // Update participant in the store
            set(state => ({
                participants: state.participants.map(p => 
                    p.id === id ? updatedParticipant : p
                ),
                currentParticipant: state.currentParticipant?.id === id ? updatedParticipant : state.currentParticipant,
                isLoading: false
            }));
            
            showToast('Payment processed successfully!', 'success');
            return true;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    updateStatus: async (id: number, statusData: MatchParticipantStatusRequest) => {
        set({ isLoading: true, error: null });
        
        try {
            const updatedParticipant = await apiService.execute(
                () => matchParticipantApi.updateStatus(id, statusData),
                `updateStatus_${id}`
            );
            
            // Update participant in the store
            set(state => ({
                participants: state.participants.map(p => 
                    p.id === id ? updatedParticipant : p
                ),
                currentParticipant: state.currentParticipant?.id === id ? updatedParticipant : state.currentParticipant,
                isLoading: false
            }));
            
            showToast('Status updated successfully!', 'success');
            return true;
        } catch (error: any) {
            const errorMessage = ErrorHandler.handle(error);
            set({
                error: errorMessage.message,
                isLoading: false
            });
            return false;
        }
    },

    // Utility actions
    setFilters: (filters: MatchParticipantFilters) => {
        set({ filters });
    },

    clearError: () => {
        set({ error: null });
    },

    resetState: () => {
        set({
            participants: [],
            currentParticipant: null,
            organizedMatches: [],
            isLoading: false,
            error: null,
            filters: {}
        });
    }
}));
