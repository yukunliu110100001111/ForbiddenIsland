import { sendAction } from '../api/inGameApi.js';

// 全局变量跟踪当前拖拽的卡片信息
// 放到window对象上以便其他模块访问
window.currentDragData = null;

/**
 * 判断某张卡能否放置到这个 tileView 上：
 * - 直升机卡（cardType === 'ACTION'）可以放到任何非 sunk 的格子
 * - 沙袋卡      （cardType === 'EVENT'）只能放到 flooded 格子
 *
 * @param {Object} tileView  - 单个地块数据 { x, y, state, ... }
 * @param {string} cardType  - 拖拽时传过来的 card.cardType，如 "ACTION"、"EVENT"
 * @returns {boolean}
 */

function isLegalTarget(tileView, cardType) {
    const state = tileView.state.toLowerCase();

    if (cardType === 'ACTION') {
        return state !== 'sink'; // 直升机卡：不能放置到已经下沉的 tile
    }
    if (cardType === 'EVENT') {
        return state === 'flooded'; // 沙袋卡：只能放置到淹没的 tile
    }
    return false;
}


/**
 * 为已渲染好的 <div class="tile"> 元素，绑定所有的拖放事件：
 * - dragenter / dragover：做合法性检测并阻止默认，然后加高亮样式
 * - dragleave：移除高亮
 * - drop：再做一次合法性判断，合法则发后端 sendAction({action:'USE_CARD', cardId, x, y})
 *         不合法则抖动提示
 *
 * @param {HTMLElement} tileEl   - 实际的 DOM 节点 <div class="tile"> …
 * @param {Object}      tileView - 对应的 TileView 数据模型，与 renderTilesBase 一致
 */
export function bindTileDrag(tileEl, tileView) {
    // 判断卡片是否合法放置在该 tile 上
    tileEl.addEventListener('dragenter', e => {
        // 使用全局变量而不是从 dataTransfer 获取数据
        if (!window.currentDragData) return;

        // 判断目标 tile 和拖拽卡片是否合法
        if (isLegalTarget(tileView, window.currentDragData.cardType)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            tileEl.classList.add('tile-droppable'); // 高亮目标
        }
    });

    tileEl.addEventListener('dragover', e => {
        // 使用全局变量而不是从 dataTransfer 获取数据
        if (!window.currentDragData) return;

        if (isLegalTarget(tileView, window.currentDragData.cardType)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            tileEl.classList.add('tile-droppable'); // 高亮目标
        }
    });

    tileEl.addEventListener('dragleave', () => {
        tileEl.classList.remove('tile-droppable');
    });

    // drop：松手时，执行卡片使用逻辑
    tileEl.addEventListener('drop', async e => {
        tileEl.classList.remove('tile-droppable');
        let dragData;
        try {
            dragData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
        } catch {
            dragData = {};
        }

        // 如果从 dataTransfer 获取不到数据，使用全局变量
        if (!dragData.cardType && window.currentDragData) {
            dragData = window.currentDragData;
        }

        // 如果目标不合法，执行失败的抖动效果
        if (!isLegalTarget(tileView, dragData.cardType)) {
            tileEl.classList.add('tile-invalid-drop');
            setTimeout(() => tileEl.classList.remove('tile-invalid-drop'), 500);
            return;
        }

        // 合法的卡片拖拽到目标 tile
        await window.api.sendAction({
            action: 'USE_CARD',
            cardId: dragData.cardId,
            x: tileView.x,
            y: tileView.y
        });

        // 更新 UI，刷新后续操作
        if (typeof window.refreshGame === 'function') {
            window.refreshGame();
        }

        // 清除全局拖拽数据
        currentDragData = null;
    });
}

// 暴露设置当前拖拽数据的方法
export function setCurrentDragData(data) {
    window.currentDragData = data;
}

// 暴露清除当前拖拽数据的方法
export function clearCurrentDragData() {
    window.currentDragData = null;
}

// 同时绑定到window对象上，方便其他模块直接使用
window.setCurrentDragData = setCurrentDragData;
window.clearCurrentDragData = clearCurrentDragData;