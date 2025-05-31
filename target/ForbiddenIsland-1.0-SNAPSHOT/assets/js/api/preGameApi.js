// assets/js/api/preGameApi.js

/**
 * Constructs the base URL for backend API endpoints
 * @returns {string} The formatted base API URL
 */
export function getDataUrl() {
    const baseHref = document.querySelector('base')?.getAttribute('href') || '/';
    const ctx = baseHref.endsWith('/') ? baseHref.slice(0, -1) : baseHref;
    return `${ctx}/data`;
}

/**
 * Universal API caller with JSON parsing
 * - Throws error for non-2xx responses
 * - Returns empty object for empty responses
 * - Returns empty object for invalid JSON
 * @param {string} url - API endpoint URL
 * @param {Object} [options] - Fetch options
 * @returns {Promise<Object>} Parsed JSON response
 */
export async function callApi(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${errText}`);
    }
    const text = await res.text();
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch {
        console.warn(`Invalid JSON from ${url}:`, text);
        return {};
    }
}

/**
 * Creates a new game room
 * @param {number} hardLevel - Difficulty level
 * @param {number} playerNumber - Number of players
 * @returns {Promise<Object>} Room creation result
 */
export function createRoom(hardLevel, playerNumber) {
    const url = `${getDataUrl()}?type=create_room&hardLevel=${hardLevel}&playerNumber=${playerNumber}`;
    return callApi(url);
}

/**
 * Joins an existing game room
 * @returns {Promise<Object>} Join operation result
 */
export function joinRoom() {
    const url = `${getDataUrl()}?type=join_room`;
    return callApi(url);
}

/**
 * Leaves current game room
 * @returns {Promise<Object>} Exit operation result
 */
export function exitRoom() {
    const url = `${getDataUrl()}?type=exit_room`;
    return callApi(url);
}

/**
 * Destroys current game room (room owner only)
 * @returns {Promise<Object>} Destruction result
 */
export function destroyRoom() {
    const url = `${getDataUrl()}?type=destroy_room`;
    return callApi(url);
}

/**
 * Gets current and maximum player counts
 * @returns {Promise<Object>} Player count information
 */
export function getPlayerCount() {
    const url = `${getDataUrl()}?type=get_player_num`;
    return callApi(url);
}

/**
 * Marks current player as ready
 * @returns {Promise<Object>} Ready status result
 */
export function setReady() {
    const url = `${getDataUrl()}?type=is_ready`;
    return callApi(url);
}

/**
 * Marks current player as not ready
 * @returns {Promise<Object>} Unready status result
 */
export function setUnready() {
    const url = `${getDataUrl()}?type=is_unready`;
    return callApi(url);
}

/**
 * Gets current room status
 * @returns {Promise<Object>} Room status information
 */
export function getRoomStatus() {
    const url = `${getDataUrl()}?type=get_room_status`;
    return callApi(url);
}

/**
 * Starts the game (when all players are ready)
 * @returns {Promise<Object>} Game start result
 */
export function startGame() {
    const url = `${getDataUrl()}?type=start_game`;
    return callApi(url);
}
