import * as api from '../api/inGameApi.js';

let cache=null;
export async function pull() {
    const fresh = await api.updateGameState();
    cache = fresh;                // 简单存一份；可做深比较返回 diff
    return fresh;
}
export function get() { return cache; }
