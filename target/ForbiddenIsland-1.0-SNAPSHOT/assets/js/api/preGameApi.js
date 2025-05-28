// assets/js/api/preGameApi.js

/**
 * 构造后端数据接口根 URL
 */
export function getDataUrl() {
    const baseHref = document.querySelector('base')?.getAttribute('href') || '/';
    const ctx = baseHref.endsWith('/') ? baseHref.slice(0, -1) : baseHref;
    return `${ctx}/data`;
}

/**
 * 通用的 fetch + JSON 解析
 * - 非 2xx 会抛错
 * - 空响应返回 {}
 * - 非法 JSON 返回 {}
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

/** 创建房间 */
export function createRoom(hardLevel, playerNumber) {
    const url = `${getDataUrl()}?type=create_room&hardLevel=${hardLevel}&playerNumber=${playerNumber}`;
    return callApi(url);
}

/** 加入房间 */
export function joinRoom() {
    const url = `${getDataUrl()}?type=join_room`;
    return callApi(url);
}

/** 退出房间 */
export function exitRoom() {
    const url = `${getDataUrl()}?type=exit_room`;
    return callApi(url);
}

/** 销毁房间（仅限房主） */
export function destroyRoom() {
    const url = `${getDataUrl()}?type=destroy_room`;
    return callApi(url);
}

/** 获取当前玩家数 & 最大玩家数 */
export function getPlayerCount() {
    const url = `${getDataUrl()}?type=get_player_num`;
    return callApi(url);
}

/** 标记自己为 Ready */
export function setReady() {
    const url = `${getDataUrl()}?type=is_ready`;
    return callApi(url);
}

/** 取消 Ready */
export function setUnready() {
    const url = `${getDataUrl()}?type=is_unready`;
    return callApi(url);
}

/** 获取房间状态（当前玩家数、最大人数、准备人数） */
export function getRoomStatus() {
    const url = `${getDataUrl()}?type=get_room_status`;
    return callApi(url);
}

/** 启动游戏（仅在所有人都 Ready 后可调用） */
export function startGame() {
    const url = `${getDataUrl()}?type=start_game`;
    return callApi(url);
}
