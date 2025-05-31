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
 * Executes special ability for current player
 * @returns {Promise<Object>} Resolves with ability execution result
 */
export function useSpecialAbility() {
    const url = `${BASE}?type=useSpecialAbility`;
    return callApi(url);
}

/**
 * Resets current game session
 * @returns {Promise<Object>} Resolves with reset operation status
 */
export function resetGame() {
    const url = `${BASE}?type=reset_game`;
    return callApi(url, { method: 'POST' });
}

/**
 * 使用特殊牌（比如直升机、沙袋等）。
 * @param {string} cardType - 卡牌类型（"ACTION"）
 * @param {number} cardId   - 卡牌ID
 * @param {number} x        - 目标地块X
 * @param {number} y        - 目标地块Y
 * @returns {Promise<Object>} 返回最新游戏状态
 */
export function useSpecialCard(cardType, cardId, x, y) {
    const actionObj = {
        action: 'USE_CARD',
        cardType: cardType,
        cardId: cardId,
        x: x,
        y: y
    };
    return sendAction(actionObj);
}
