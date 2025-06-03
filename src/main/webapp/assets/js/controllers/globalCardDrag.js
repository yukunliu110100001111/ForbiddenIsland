// src/controllers/globalCardDrag.js

import { sendAction } from '../api/inGameApi.js';

/**
 * 全局跟踪当前拖拽的卡片信息（cardType, cardId）
 */
window.currentDragData = null;

/**
 * 判断 tileView 是否是合法的放置目标（用于“使用卡”）
 * - 直升机卡（cardType === 'ACTION'）可以放到任何非下沉（sink）的 tile
 * - 沙袋卡      （cardType === 'EVENT'）只能放到已淹没（flooded）的 tile
 */
function isLegalTile(tileView, cardType) {
    const state = tileView.state.toLowerCase();
    if (cardType === 'ACTION') return state !== 'sink';
    if (cardType === 'EVENT')  return state === 'flooded';
    return false;
}

/**
 * 在页面顶部显示临时状态消息
 * @param {string} msg      - 要显示的提示文本
 * @param {number} duration - 持续时间（毫秒），然后自动淡出
 */
function showStatusMessage(msg, duration = 1500) {
    let bar = document.getElementById('status-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'status-bar';
        Object.assign(bar.style, {
            position: 'fixed',
            top:    '8px',
            left:   '50%',
            transform: 'translateX(-50%)',
            padding: '6px 12px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            borderRadius: '4px',
            fontSize: '0.9rem',
            zIndex: '9999',
            pointerEvents: 'none',
            opacity: '0',
            transition: 'opacity 0.3s'
        });
        document.body.appendChild(bar);
    }
    bar.textContent = msg;
    bar.style.opacity = '1';
    setTimeout(() => {
        bar.style.opacity = '0';
    }, duration);
}

/**
 * 把一张手牌卡设为可拖拽，并绑定 dragstart/dragend
 * @param {HTMLElement} cardEl
 */
function makeCardDraggable(cardEl) {
    const cardType = cardEl.dataset.cardType;
    const cardId   = parseInt(cardEl.dataset.cardId, 10);
    if (!cardType || isNaN(cardId)) return;

    // 只有 ACTION 或 EVENT 可以拖到地图／弃牌／给卡
    cardEl.setAttribute('draggable', 'true');
    cardEl.style.cursor = 'grab';

    cardEl.addEventListener('dragstart', e => {
        // 把卡片信息存在全局
        window.currentDragData = { cardType, cardId };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify({ cardType, cardId }));
        e.dataTransfer.setData('text/plain', String(cardId));
    });

    cardEl.addEventListener('dragend', () => {
        window.currentDragData = null;
    });
}

/**
 * 统一给卡绑定拖拽：手牌<>地图<>给牌区<>弃牌区。
 * onRefresh: 任何操作成功后，调用它来拉最新状态并刷新 UI
 */
export function bindGlobalCardDrag(onRefresh) {
    // —— 1. 把“当前玩家”的所有手牌里可用卡都设为 draggable ——
    const handArea = document.querySelector(`.player[data-player-index="${window.myPlayerIndex}"] .hand`);
    if (handArea) {
        [...handArea.children].forEach(cardEl => {
            makeCardDraggable(cardEl);
        });
    }

    // 以下假设：renderTiles(...) 里已经给每个 tile 设了 data-x/data-y/state/name，并在渲染后调用 bindGlobalCardDrag 。
    // 但由于 tile 会被反复重绘，我们需要让地图上的 drop 每次都生效，所以在每次 renderTiles 之后，也要重复给 tile 们绑一次。
    // 例如，在 mapRenderer.js 里每轮渲染后：
    // board.forEach(row => {
    //   row.forEach(tileView => {
    //     const tileEl = layer.querySelector(`.tile[data-x="${tileView.x}"][data-y="${tileView.y}"]`);
    //     if (tileEl) bindTileListeners(tileEl, tileView, onRefresh);
    //   });
    // });

    // 我们把这个“给每个 tile 绑监听”的逻辑拆出来，命名为 bindTileListeners。
    function bindTileListeners(tileEl, tileView) {
        // dragenter: 强制让浏览器显示“可放置”手型
        tileEl.addEventListener('dragenter', e => {
            if (!window.currentDragData) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            tileEl.style.cursor = 'pointer';
            tileEl.classList.add('tile-droppable');
        });
        // dragover: 保持“可放置”状态
        tileEl.addEventListener('dragover', e => {
            if (!window.currentDragData) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            tileEl.style.cursor = 'pointer';
            tileEl.classList.add('tile-droppable');
        });
        // dragleave: 恢复
        tileEl.addEventListener('dragleave', () => {
            tileEl.style.cursor = '';
            tileEl.classList.remove('tile-droppable');
        });
        // drop: 真正的“使用卡”逻辑
        tileEl.addEventListener('drop', async e => {
            e.stopPropagation();
            e.preventDefault();
            tileEl.style.cursor = '';
            tileEl.classList.remove('tile-droppable');

            let dragData = {};
            try {
                dragData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
            } catch {
                dragData = {};
            }
            if (!dragData.cardType && window.currentDragData) {
                dragData = window.currentDragData;
            }

            // 检查是否合法
            if (!isLegalTile(tileView, dragData.cardType)) {
                showStatusMessage(`无法在 [${tileView.x},${tileView.y}] 使用此卡`, 2000);
                tileEl.classList.add('tile-invalid-drop');
                setTimeout(() => tileEl.classList.remove('tile-invalid-drop'), 300);
                return;
            }

            // 合法就发给后端
            await sendAction({
                action:      'USE_CARD',
                playerIndex: window.myPlayerIndex,
                cardId:      dragData.cardId,
                x:           tileView.x,
                y:           tileView.y
            });
            window.currentDragData = null;
            await onRefresh?.();
        });
    }

    // —— 2. 给“玩家手牌区（给牌用）”绑 dragover/drop ——
    // 只要 mouseover 到 .player 区域，就认为是“给牌给该玩家”
    const footer = document.getElementById('players-footer');
    if (footer) {
        footer.addEventListener('dragover', e => {
            // 如果在 tile 上，就让 tile 先处理
            if (e.target.closest('.tile')) return;
            const p = e.target.closest('.player');
            if (!p) return;
            const targetIdx = +p.dataset.playerIndex;
            if (targetIdx === window.myPlayerIndex) return;
            e.preventDefault();
            p.classList.add('player-droppable');
        });
        footer.addEventListener('dragleave', e => {
            e.target.closest('.player')?.classList.remove('player-droppable');
        });
        footer.addEventListener('drop', async e => {
            // 如果 drop 在 tile 上，就让 tile 处理
            if (e.target.closest('.tile')) return;
            const p = e.target.closest('.player');
            if (!p) return;
            p.classList.remove('player-droppable');

            const targetIdx = +p.dataset.playerIndex;
            if (targetIdx === window.myPlayerIndex) {
                showStatusMessage('不能给自己牌', 1500);
                return;
            }
            if (window.isOverLimit) {
                showStatusMessage('手牌超限，先丢弃或使用再给牌', 1500);
                return;
            }

            e.stopPropagation();
            e.preventDefault();

            let data = {};
            try {
                data = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
            } catch {
                const cardIdNum = parseInt(e.dataTransfer.getData('text/plain'), 10);
                if (!isNaN(cardIdNum)) {
                    data = { cardId: cardIdNum };
                }
            }
            if (!data.cardId && window.currentDragData) {
                data = window.currentDragData;
            }
            if (!data.cardId) {
                showStatusMessage('拖拽时未获取到卡牌 ID', 1500);
                return;
            }

            console.log(`[DEBUG] GIVE_CARD 玩家 ${window.myPlayerIndex} → ${targetIdx} | 卡牌ID=${data.cardId}`);
            const success = await sendAction({
                action:        'GIVE_CARD',
                cardId:        data.cardId,
                targetPlayers: [window.myPlayerIndex, targetIdx]
            });
            if (success) {
                window.currentDragData = null;
                await onRefresh?.();
            }
        });
    }

    // —— 3. 给“弃牌区”绑 dragover/drop ——
    const discardZone = document.getElementById('treasure-discard');
    if (discardZone) {
        discardZone.style.pointerEvents = 'auto';
        discardZone.addEventListener('dragover', e => {
            if (e.target.closest('.tile')) return;
            e.preventDefault();
            discardZone.classList.add('discard-droppable');
        });
        discardZone.addEventListener('dragleave', () => {
            discardZone.classList.remove('discard-droppable');
        });
        discardZone.addEventListener('drop', async e => {
            if (e.target.closest('.tile')) return;
            e.preventDefault();
            discardZone.classList.remove('discard-droppable');

            let dragData = {};
            try {
                dragData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
            } catch {
                dragData = {};
            }
            const { cardType, cardId } = dragData;
            if (!cardId) {
                showStatusMessage('拖拽时未获取到卡牌 ID', 1500);
                return;
            }

            console.log('[DEBUG] DISCARD_CARD cardId=', cardId);
            if (cardType === 'ACTION') {
                await sendAction({ action: 'USE_CARD',    cardId });
                await sendAction({ action: 'DISCARD_CARD', cardId });
            } else {
                await sendAction({ action: 'DISCARD_CARD', cardId });
            }
            window.currentDragData = null;
            await onRefresh?.();
        });
    }

    // —— 4. 暴露给外部用来绑定每个 tile 的函数，让 mapRenderer.js 调用 ——
    return bindTileListeners;
}
