// assets/js/api/inGame.js
const BASE = 'data';

/** 拉取最新游戏状态 */
export async function updateGameState() {
    const res = await fetch(`${BASE}?type=update_element`);
    return res.json(); // 完整的 GameState JSON
}

/**
 * 发送玩家操作
 * @param {object} actionObj 动作描述，如 { action:'MOVE', x:1, y:2 }
 */
export async function sendAction(actionObj) {
    const res = await fetch(`${BASE}?type=player_action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionObj)
    });
    return res.json(); // { message } or { error }
}

/** 使用特殊技能 */
export async function useSpecialAbility() {
    const res = await fetch(`${BASE}?type=useSpecialAbility`);
    return res.json(); // 如果后端返回内容，可在 Servlet 中补充
}
