// gameStateStore.js
import * as api from '../api/inGameApi.js';

let currentGameState = null;
let previousGameState = null;
const listeners = new Set();

/**
 * 拉取最新游戏状态，更新 local cache 并通知所有订阅者。
 * 如果拉取失败，返回 null，不会清空之前的 currentGameState。
 * @param {number} [retries=2] 重试次数（默认 2 次）
 * @returns {Promise<Object|null>} 最新的游戏状态对象，失败时返回 null
 */
export async function pull(retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // 下面这一行可能会抛出，因为后端失败或网络问题
            const fresh = await api.updateGameState();
            previousGameState = currentGameState;
            currentGameState = fresh;
            notifyAll(previousGameState, currentGameState);
            return fresh;
        } catch (err) {
            console.warn(`[gameStateStore] pull attempt ${attempt + 1} failed:`, err);
            if (attempt === retries) {
                console.error('[gameStateStore] all retries failed');
                return null;
            }
            // 等待 200ms 再重试
            await new Promise(res => setTimeout(res, 200));
        }
    }
    return null;
}

/**
 * 订阅游戏状态更新事件。每当 pull() 成功并且 currentGameState 发生改变时，
 * listener(oldState, newState) 会被调用一次。
 * @param {function(Object|null, Object): void} listener - 回调，接收 (oldState, newState)
 * @returns {function(): void} 退订函数，调用后会移除该 listener
 */
export function subscribe(listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/**
 * 返回最近一次拉取到的 gameState。如果还没有成功 pull 过，返回 null。
 * @returns {Object|null}
 */
export function get() {
    return currentGameState;
}

/**
 * 通知所有注册的订阅者 state 发生了变化。
 * @param {Object|null} oldState
 * @param {Object|null} newState
 */
function notifyAll(oldState, newState) {
    listeners.forEach(fn => {
        try {
            fn(oldState, newState);
        } catch (e) {
            console.error('[gameStateStore] listener error:', e);
        }
    });
}
