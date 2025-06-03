// src/controllers/useCardDrag.js

import { sendAction } from '../api/inGameApi.js';

/**
 * 全局变量：跟踪当前拖拽的卡片信息（cardType, cardId）
 */
window.currentDragData = null;

/**
 * 判断 tileView 是否是合法的放置目标
 * - 直升机卡（cardType === 'ACTION'）可以放到任何非下沉（sink）的 tile
 * - 沙袋卡      （cardType === 'EVENT'）只能放到已淹没（flooded）的 tile
 */
function isLegalTarget(tileView, cardType) {
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
            top: '8px',
            left: '50%',
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
 * 绑定单个 tile 的拖放“使用卡”逻辑
 * @param {HTMLElement} tileEl    - <div class="tile" data-x="…" data-y="…">
 * @param {Object}      tileView  - TileView 数据 { x, y, state, name, … }
 * @param {Function}    onRefresh - 使用卡后调用以拉取并刷新游戏状态
 */
export function bindTileDrag(tileEl, tileView, onRefresh) {
    // dragenter：无论合法与否，都先阻止默认让浏览器显示“可放置”光标
    tileEl.addEventListener('dragenter', e => {
        if (!window.currentDragData) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        tileEl.style.cursor = 'pointer';
        tileEl.classList.add('tile-droppable');
    });

    // dragover：保持“可放置”状态
    tileEl.addEventListener('dragover', e => {
        if (!window.currentDragData) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        tileEl.style.cursor = 'pointer';
        tileEl.classList.add('tile-droppable');
    });

    // dragleave：移出 tile 区域时 restore
    tileEl.addEventListener('dragleave', () => {
        tileEl.style.cursor = '';
        tileEl.classList.remove('tile-droppable');
    });

    // drop：真正执行“使用卡”逻辑
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

        const legal = isLegalTarget(tileView, dragData.cardType);
        if (!legal) {
            showStatusMessage(`无法在 [${tileView.x},${tileView.y}] 使用此卡`, 2000);
            tileEl.classList.add('tile-invalid-drop');
            setTimeout(() => tileEl.classList.remove('tile-invalid-drop'), 300);
            return;
        }

        // 合法 -> 发送 USE_CARD 请求
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

/**
 * 绑定“使用卡拖放”与“丢弃卡片”逻辑
 * 调用位置：在 bindInGame 初始化阶段，传入 refresh 回调即可
 *   bindUseCardDrag(refresh);
 *
 * 它会：
 *  - 将当前玩家手牌中可用的卡（ACTION / EVENT）设为 draggable，并绑定 dragstart/dragend
 *  - 监听“弃牌区” dragover/drop，用于丢弃卡片
 *
 * @param {Function} onRefresh - 卡片使用/丢弃成功后调用的刷新函数
 */
export function bindUseCardDrag(onRefresh) {
    window.currentDragData = null;
    const handArea    = document.querySelector(`.player[data-player-index="${window.myPlayerIndex}"] .hand`);
    const discardZone = document.getElementById('treasure-discard');
    if (!handArea || !discardZone) return;

    // 1. 绑定手牌中的可拖拽卡片
    [...handArea.children].forEach(cardEl => {
        const cardType = cardEl.dataset.cardType;
        const cardId   = parseInt(cardEl.dataset.cardId, 10);
        if (cardType !== 'ACTION' && cardType !== 'EVENT') return;

        cardEl.setAttribute('draggable', 'true');
        cardEl.style.cursor = 'grab';

        // dragstart：设置全局 currentDragData，并给弃牌区高亮
        cardEl.addEventListener('dragstart', e => {
            const payload = { cardType, cardId };
            window.currentDragData = payload;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/json', JSON.stringify(payload));
            e.dataTransfer.setData('text/plain', String(cardId));
            discardZone.classList.add('highlight-zone');
        });

        // dragend：清理高亮并清空 currentDragData
        cardEl.addEventListener('dragend', () => {
            discardZone.classList.remove('highlight-zone');
            window.currentDragData = null;
        });
    });

    // 2. 监听弃牌区的 dragover/drop，用于“丢弃卡片”
    discardZone.addEventListener('dragover', e => {
        // 如果鼠标在地图 tile 上，就让 tile 先处理
        if (e.target.closest('.tile')) return;
        e.preventDefault();
        discardZone.classList.add('discard-droppable');
    });
    discardZone.addEventListener('dragleave', () => {
        discardZone.classList.remove('discard-droppable');
    });
    discardZone.addEventListener('drop', async e => {
        // 如果 drop 在 tile 上，就绕过弃牌区
        if (e.target.closest('.tile')) return;
        e.preventDefault();
        discardZone.classList.remove('discard-droppable');

        let dragData;
        try {
            dragData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
        } catch {
            dragData = {};
        }
        const { cardType, cardId } = dragData;
        if (!cardId) return;

        // 如果是“行动卡”（ACTION），先执行 USE_CARD 再 DISCARD_CARD
        if (cardType === 'ACTION') {
            await sendAction({ action: 'USE_CARD',    cardId });
            await sendAction({ action: 'DISCARD_CARD', cardId });
        } else {
            // 普通宝物 / EVENT 直接丢弃
            await sendAction({ action: 'DISCARD_CARD', cardId });
        }

        window.currentDragData = null;
        await onRefresh?.();
    });
}
