// src/controllers/mapActions.js
import { highlightTiles } from '../renderers/highlightRenderer.js';

export function bindMapActions(actApi, clearUi, onRefresh) {
    const map = document.getElementById('tiles-layer');
    if (!map) return;

    map.addEventListener('click', async ev => {
        /* ---------- 若自己超限，禁止一切地图操作 ---------- */
        if (window.isOverLimit &&
            window.gs?.currentPlayerIndex === window.myPlayerIndex) {
            return;
        }

        const act = actApi.getCurrentAction();
        if (!['MOVE', 'SHORE_UP', 'COLLECT_TREASURE'].includes(act)) return;

        const tileEl = ev.target.closest('.tile');
        if (!tileEl) return;

        /* ---------- 安全取得当前玩家与坐标 ---------- */
        const gs = window.gs;
        const curPlayer = gs?.players?.[gs.currentPlayerIndex];  // ← 兼容 currentPlayer 为 null
        const curTile   = curPlayer?.currentTile;
        if (!curTile) return;                                    // 后端还没推送完，先忽略点击

        const { x: cx, y: cy } = curTile;
        const tx = +(tileEl.dataset.x ?? tileEl.dataset.col);
        const ty = +(tileEl.dataset.y ?? tileEl.dataset.row);
        if (Number.isNaN(tx) || Number.isNaN(ty)) return;

        /* ---------- 按动作类型发送请求 ---------- */
        if (act === 'MOVE') {
            if (Math.abs(tx - cx) + Math.abs(ty - cy) !== 1) return;
            const state = gs.board[ty][tx].state.toLowerCase();
            if (state === 'sink') return;
            await window.api.sendAction({ action: 'MOVE', x: tx, y: ty });
        } else if (act === 'SHORE_UP') {
            if (Math.abs(tx - cx) + Math.abs(ty - cy) > 1) return;
            if (gs.board[ty][tx].state.toLowerCase() !== 'flooded') return;
            await window.api.sendAction({ action: 'SHORE_UP', x: tx, y: ty });
        } else if (act === 'COLLECT_TREASURE') {
            const treasureType = tileEl.dataset.treasureType;
            if (!treasureType) return;
            await window.api.sendAction({ action: 'COLLECT_TREASURE', treasureType });
        }

        clearUi();
        onRefresh?.();
    });
}
