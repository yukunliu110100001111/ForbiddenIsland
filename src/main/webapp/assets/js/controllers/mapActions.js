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
        // ① 不再硬性只允许 MOVE / SHORE_UP / COLLECT_TREASURE
        // if (!['MOVE', 'SHORE_UP', 'COLLECT_TREASURE'].includes(act)) return;
        if (!['MOVE', 'SHORE_UP', 'COLLECT_TREASURE'].includes(act)) {
            // 这里我们只对这三类动作做处理，其他动作不做任何事
            return;
        }

        const tileEl = ev.target.closest('.tile');
        if (!tileEl) return;

        /* ---------- 安全取得当前玩家与坐标 ---------- */
        const gs = window.gs;
        const curPlayer = gs?.players?.[gs.currentPlayerIndex];
        const curTile   = curPlayer?.currentTile;
        if (!curTile) return;

        const { x: cx, y: cy } = curTile;
        const tx = +(tileEl.dataset.x ?? tileEl.dataset.col);
        const ty = +(tileEl.dataset.y ?? tileEl.dataset.row);
        if (Number.isNaN(tx) || Number.isNaN(ty)) return;

        /* ---------- 按动作类型发送请求，但不在前端硬性限制距离 ---------- */
        if (act === 'MOVE') {
            // 旧版写法（只允许正交一步）——要去掉：
            // if (Math.abs(tx - cx) + Math.abs(ty - cy) !== 1) return;
            // 新版：只要目标 tile 不是“下沉”就发送请求，让后端根据角色来判定是否合法。
            const state = gs.board[ty][tx].state.toLowerCase();
            if (state === 'sink') {
                return; // 下沉格子都不让走
            }
            await window.api.sendAction({
                action: 'MOVE',
                x: tx,
                y: ty
            });

        } else if (act === 'SHORE_UP') {
            // 旧版写法（只允许正交一步）——要去掉：
            // if (Math.abs(tx - cx) + Math.abs(ty - cy) > 1) return;
            // 新版：只要 tile 是 flooded，就让后端去判断谁能修复它
            const tileState = gs.board[ty][tx].state.toLowerCase();
            if (tileState !== 'flooded') {
                return;
            }
            await window.api.sendAction({
                action: 'SHORE_UP',
                x: tx,
                y: ty
            });

        } else if (act === 'COLLECT_TREASURE') {
            const treasureType = tileEl.dataset.treasureType;
            if (!treasureType) return;
            await window.api.sendAction({
                action: 'COLLECT_TREASURE',
                treasureType
            });
        }

        clearUi();
        onRefresh?.();
    });
}
