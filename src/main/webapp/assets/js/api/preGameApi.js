// assets/js/api/preGameApi.js

function getDataUrl() {
    const baseHref = document.querySelector('base')?.getAttribute('href') || '/';
    const ctx = baseHref.endsWith('/') ? baseHref.slice(0, -1) : baseHref;
    return `${ctx}/data`;
}


export async function createRoom(hardLevel, playerNumber) {
    const url = `${getDataUrl()}?type=create_room&hardLevel=${hardLevel}&playerNumber=${playerNumber}`;
    const res = await fetch(url);
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`创建房间失败 ${res.status}: ${err}`);
    }
    return res.json();
}

export async function joinRoom() {
    const url = `${getDataUrl()}?type=join_room`;
    const res = await fetch(url);
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`加入房间失败 ${res.status}: ${err}`);
    }
    return res.json();
}

export async function getPlayerCount() {
    const url = `${getDataUrl()}?type=get_player_num`;
    const res = await fetch(url);
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`查询玩家数失败 ${res.status}: ${err}`);
    }
    return res.json();
}

export async function startGame() {
    const url = `${getDataUrl()}?type=start_game`;
    const res = await fetch(url);
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`启动游戏失败 ${res.status}: ${err}`);
    }
    return res.json();
}
