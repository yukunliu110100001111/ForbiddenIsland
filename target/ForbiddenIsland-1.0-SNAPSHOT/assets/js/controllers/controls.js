// controllers/controls.js
import * as api from '../api/inGameApi.js';

let currentAction = null;

/**
 * 获取当前操作类型（供其它模块调用，比如用于高亮按钮）
 */
export function getCurrentAction() {
    return currentAction;
}

/**
 * 绑定所有游戏控制按钮及地图点击逻辑
 * @param {Object} btns    - 按钮元素集合（move, shore, take, use, give, end, reset）
 * @param {Function} onRefresh - 每次操作后刷新UI的回调
 */
export function wireControls(btns, onRefresh) {

    /* ---------- 清除所有 UI 高亮状态 ---------- */
    const clearUi = () => {
        currentAction = null;
        document.querySelectorAll('.color-btn.active')
            .forEach(b => b.classList.remove('active'));
    };

    /**
     * 设置当前操作类型，并高亮对应按钮
     * @param {string} act - 操作名（MOVE、SHORE_UP、COLLECT_TREASURE、USE_CARD 等）
     */
    const setAct = act => {
        clearUi();
        currentAction = act;
        const map = {
            MOVE:   'move',
            SHORE_UP: 'shore',
            COLLECT_TREASURE: 'take',
            USE_CARD: 'use',
            // 不再需要 GIVE_CARD
        };
        Object.entries(btns).forEach(([k, b]) => {
            if (!b) return;
            b.classList.toggle('active', map[act] === k);
        });
    };

    /* ---------- 绑定顶部控制按钮点击事件 ---------- */
    if (btns.move)  btns.move.onclick  = () => setAct('MOVE');
    if (btns.shore) btns.shore.onclick = () => setAct('SHORE_UP');
    if (btns.take)  btns.take.onclick  = () => setAct('COLLECT_TREASURE');
    if (btns.use)   btns.use.onclick   = () => setAct('USE_CARD');
    // 不再对 GIVE_CARD 按钮设置 onclick

    // 结束回合
    if (btns.end) {
        btns.end.onclick = async () => {
            clearUi();
            await api.sendAction({ action: 'END_TURN' });
            onRefresh();
        };
    }
    // 重置游戏（可选）
    if (btns.reset) {
        btns.reset.onclick = async () => {
            clearUi();
            await api.resetGame();
            onRefresh();
        };
    }

    /* ---------- 地图区域的点击事件处理 (MOVE / SHORE_UP / COLLECT_TREASURE) ---------- */
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        mapContainer.addEventListener('click', async ev => {
            if (!currentAction) return;
            if (!['MOVE', 'SHORE_UP', 'COLLECT_TREASURE'].includes(currentAction)) return;
            const tile = ev.target.closest('.tile');
            if (!tile) return;
            await api.sendAction({
                action: currentAction,
                x: +tile.dataset.x,
                y: +tile.dataset.y
            });
            clearUi();
            onRefresh();
        });
    }

    /* ---------- 拖拽给玩家的逻辑（只加这段，其它不变） ---------- */
    const playersFooter = document.getElementById('players-footer');
    if (playersFooter) {
        // 允许拖拽进入所有 .player 区域，无条件 e.preventDefault()
        playersFooter.addEventListener('dragover', e => {
            const playerEl = e.target.closest('.player');
            if (!playerEl) return;
            e.preventDefault();  // 必须先调用，否则鼠标是禁止符号，drop 事件无法触发
            playerEl.classList.add('player-droppable');
        });

        playersFooter.addEventListener('dragleave', e => {
            const playerEl = e.target.closest('.player');
            if (playerEl) playerEl.classList.remove('player-droppable');
        });

        // drop 事件中再判断类型和执行给卡逻辑
        playersFooter.addEventListener('drop', async e => {
            const playerEl = e.target.closest('.player');
            if (!playerEl) return;
            playerEl.classList.remove('player-droppable');
            let dragData;
            try {
                dragData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
            } catch {
                dragData = {};
            }
            // 只有普通卡可拖给其他人
            if (!dragData.cardId || dragData.cardType === 'ACTION' || dragData.cardType === 'EVENT') return;
            const targetIdx = +playerEl.dataset.playerIndex;
            await api.sendAction({
                action: 'GIVE_CARD',
                cardId: dragData.cardId,
                targetPlayer: targetIdx,
                targetPlayers: [targetIdx]
            });
            clearUi();
            onRefresh();
        });
    }
}
