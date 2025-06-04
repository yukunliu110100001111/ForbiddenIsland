// API service for in-game operations and state management

// Import shared API utilities
import { getDataUrl, callApi } from './preGameApi.js';

// Base API endpoint URL from configuration
const BASE = getDataUrl();

/**
 * Fetches current game state from server
 * @returns {Promise<Object>} Resolves with complete game state object
 */
export function updateGameState() {
    const url = `${BASE}?type=update_element`;
    return callApi(url);
}

/**
 * Submits player action to server
 * @param {Object} actionObj - Action parameters (type, coordinates, etc.)
 * @returns {Promise<Object>} Resolves with server response
 */
export function sendAction(actionObj) {
    const url = `${BASE}?type=player_action`;
    return callApi(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionObj),
    });
}


/**
 * Resets current game session
 * @returns {Promise<Object>} Resolves with reset operation status
 */
export function resetGame() {
    const url = `${BASE}?type=reset_game`;
    return callApi(url, { method: 'POST' });
}

