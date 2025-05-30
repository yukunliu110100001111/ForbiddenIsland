// assets/js/api/inGame.js（注意：文件名保持不变）

import { getDataUrl, callApi } from './preGameApi.js';

const BASE = getDataUrl();

/**
 * 拉取最新游戏状态
 * @returns {Promise<GameState>} 完整的 GameState JSON
 */
export function updateGameState() {
    const url = `${BASE}?type=update_element`;
    return callApi(url);
}

/**
 * 发送玩家操作
 * @param {object} actionObj 动作描述，如 { action:'MOVE', x:1, y:2 }
 * @returns {Promise<{ message?: string, error?: string }>}
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
 * 使用特殊技能
 * @returns {Promise<any>}
 */
export function useSpecialAbility() {
    const url = `${BASE}?type=useSpecialAbility`;
    return callApi(url);
}

// assets/js/api/inGameApi.js

export function resetGame() {
    const url = `${BASE}?type=reset_game`;
    return callApi(url, { method: 'POST' });
}
