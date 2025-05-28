// assets/js/api/preGame.js
const BASE = `${window.contextPath}data`

/**
 * 创建房间
 * @param {number} hardLevel 难度等级
 * @param {number} playerNumber 玩家数量
 * @returns {Promise<object>} { message } or { error }
 */
export async function createRoom(hardLevel, playerNumber) {
    const res = await fetch(`${BASE}?type=create_room&hardLevel=${hardLevel}&playerNumber=${playerNumber}`);
    return res.json();
}

/** 加入房间 */
export async function joinRoom() {
    const res = await fetch(`${BASE}?type=join_room`);
    return res.json();
}

/** 开始游戏 */
export async function startGame() {
    const res = await fetch(`${BASE}?type=start_game`);
    return res.json();
}

/** 查询当前房间人数 */
export async function getPlayerCount() {
    const res = await fetch(`${BASE}?type=get_player_num`);
    return res.json(); // { players: n, max: m }
}
