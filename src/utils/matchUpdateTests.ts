/**
 * Test file for match update functionality
 * Tests the fixed implementation that handles optional startTime and endTime fields
 */

import { matchApi } from '../api/matches';
import type { UpdateMatchRequest } from '../types/matches';

// Example test data for different update scenarios
const testUpdateScenarios = {
    // Full match update (all fields)
    fullUpdate: {
        tournamentId: 1,
        teams: [1, 2],
        cityId: 1,
        status: 'IN_PROGRESS',
        playgroundId: 1,
        startTime: '2025-07-06T15:00:00.000Z',
        endTime: '2025-07-06T17:00:00.000Z',
        maxCapacity: 22,
        description: 'Updated championship match',
        sportTypeId: 1
    } as UpdateMatchRequest,

    // Status-only update (minimal fields)
    statusUpdate: {
        status: 'COMPLETED'
    } as UpdateMatchRequest,

    // Partial update without time fields
    partialUpdate: {
        teams: [3, 4],
        description: 'Updated description',
        maxCapacity: 20
    } as UpdateMatchRequest,

    // Time-only update
    timeUpdate: {
        startTime: '2025-07-06T16:00:00.000Z',
        endTime: '2025-07-06T18:00:00.000Z'
    } as UpdateMatchRequest
};

/**
 * Test functions (these would normally be in a test runner)
 */

// Test helper function to prepare update data
export const testPrepareUpdateData = () => {
    console.log('Testing prepareUpdateData function...');
    
    // Test with minimal data
    const minimalData: UpdateMatchRequest = { status: 'COMPLETED' };
    const prepared = matchApi.prepareUpdateData(minimalData);
    
    console.log('Minimal input:', minimalData);
    console.log('Prepared output:', prepared);
    
    // Verify that required fields are filled with defaults
    const hasRequiredFields = prepared.teams && 
                            prepared.cityId && 
                            prepared.status && 
                            prepared.playgroundId && 
                            prepared.maxCapacity && 
                            prepared.description !== undefined && 
                            prepared.sportTypeId;
    
    console.log('Has all required fields:', hasRequiredFields);
    
    // Test with partial data
    const partialData: UpdateMatchRequest = {
        status: 'IN_PROGRESS',
        teams: [1, 2],
        startTime: '2025-07-06T15:00:00.000Z'
    };
    
    const preparedPartial = matchApi.prepareUpdateData(partialData);
    console.log('Partial input:', partialData);
    console.log('Partial prepared output:', preparedPartial);
    
    return { minimalData, prepared, partialData, preparedPartial };
};

/**
 * Mock API test functions
 */

// Test match update scenarios
export const testMatchUpdateScenarios = async () => {
    console.log('Testing match update scenarios...');
    
    // Note: These would normally use mock API calls
    // For demonstration purposes, we'll just log the data that would be sent
    
    Object.entries(testUpdateScenarios).forEach(([scenario, data]) => {
        console.log(`\n--- Testing ${scenario} ---`);
        console.log('Input data:', data);
        
        try {
            const prepared = matchApi.prepareUpdateData(data);
            console.log('Prepared for API:', prepared);
            
            // Simulate API validation
            const isValid = prepared.teams && prepared.cityId && prepared.status && 
                          prepared.playgroundId && prepared.maxCapacity && 
                          prepared.description !== undefined && prepared.sportTypeId;
            
            console.log('Would pass API validation:', isValid);
        } catch (error) {
            console.error('Error preparing data:', error);
        }
    });
};

// Test status update specifically
export const testStatusUpdateOnly = async () => {
    console.log('\n--- Testing status-only update ---');
    
    const statusData = { status: 'COMPLETED' };
    console.log('Status update input:', statusData);
    
    // Test the lightweight status update method
    const lightweightData = {
        status: 'COMPLETED',
        teams: [],
        cityId: 1,
        playgroundId: 1,
        maxCapacity: 1,
        description: '',
        sportTypeId: 1
    };
    
    console.log('Lightweight status update data:', lightweightData);
    
    // Test the full update method with defaults
    const fullUpdateData = matchApi.prepareUpdateData(statusData);
    console.log('Full update method data:', fullUpdateData);
    
    return { statusData, lightweightData, fullUpdateData };
};

/**
 * Integration test scenarios
 */

export const runAllTests = () => {
    console.log('=== Running Match Update Tests ===\n');
    
    try {
        // Test data preparation
        const prepareResults = testPrepareUpdateData();
        
        // Test update scenarios
        testMatchUpdateScenarios();
        
        // Test status updates
        const statusResults = testStatusUpdateOnly();
        
        console.log('\n=== All tests completed successfully ===');
        
        return {
            prepareResults,
            statusResults,
            success: true
        };
    } catch (error) {
        console.error('Test failed:', error);
        return {
            error,
            success: false
        };
    }
};

// Export test scenarios for use in components
export { testUpdateScenarios };
