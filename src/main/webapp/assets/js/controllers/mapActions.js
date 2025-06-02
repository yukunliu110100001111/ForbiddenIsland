// controls/mapActions.js
import { highlightTiles } from '../renderers/highlightRenderer.js';

export function bindMapActions(actApi, clearUi, onRefresh) {
    // 请注意：这里绑定在 #tiles-layer 而不是 #map-container
    const mapContainer = document.getElementById('tiles-layer');
    if (!mapContainer) return;

    mapContainer.addEventListener('click', async ev => {
        // 1. 如果本地玩家手牌超限，屏蔽地图操作
        if (window.isOverLimit && window.gs.currentPlayerIndex === window.gs.myPlayerIndex) {
            return;
        }
        // 2. 普通流程：判断当前动作、tile 合法性
        const currentAction = actApi.getCurrentAction();
        if (!currentAction) return;
        if (!['MOVE', 'SHORE_UP', 'COLLECT_TREASURE'].includes(currentAction)) return;

        const tileEl = ev.target.closest('.tile');
        if (!tileEl) return;

        // 3. 判空，获取全局状态
        const gs = window.gs;
        if (!gs || !gs.currentPlayer || !gs.currentPlayer.currentTile || !gs.board) return;
        const { x: cx, y: cy } = gs.currentPlayer.currentTile;
        const tx = +(tileEl.dataset.x ?? tileEl.dataset.col);
        const ty = +(tileEl.dataset.y ?? tileEl.dataset.row);
        if (Number.isNaN(tx) || Number.isNaN(ty)) return;

        // 4. 根据动作判断并发送请求
        if (currentAction === 'COLLECT_TREASURE') {
            const treasureType = tileEl.dataset.treasureType || '';
            if (!treasureType) {
                alert('这里没有可收集的宝藏');
                return;
            }
            await window.api.sendAction({
                action: 'COLLECT_TREASURE',
                treasureType
            });
        } else if (currentAction === 'MOVE') {
            if (Math.abs(tx - cx) + Math.abs(ty - cy) !== 1) return;
            const tileData = gs.board[ty][tx];
            if (!tileData || tileData.state.toLowerCase() === 'sink') return;
            await window.api.sendAction({ action: 'MOVE', x: tx, y: ty });
        } else if (currentAction === 'SHORE_UP') {
            if (Math.abs(tx - cx) + Math.abs(ty - cy) > 1) return;
            const tileData = gs.board[ty][tx];
            if (!tileData || tileData.state.toLowerCase() !== 'flooded') return;
            await window.api.sendAction({ action: 'SHORE_UP', x: tx, y: ty });
        }

        clearUi();
        if (typeof onRefresh === 'function') onRefresh();
    });
}
