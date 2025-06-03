// src/renderers/mapRenderer.js

import { renderTilesBase } from './tileRenderer.js';
import { updatePawns      } from './pawnRenderer.js';
import { bindTileDrag     } from '../controllers/useCardDrag.js'; // 新增导入

/**
 * renderTiles(board, players, layer, currentPlayerIndex, onRefresh)
 *
 *   1. renderTilesBase(board, layer)：静态渲染所有 .tile（并不清空 pawn）
 *   2. updatePawns(players, layer, currentPlayerIndex)：把 pawn 放到正确位置
 *   3. bindTileDrag(tileEl, tileView, onRefresh)：给每个 tile 绑定拖放特殊卡的能力
 *
 * @param {Array<Array>}  board              - 2D 数组，每项是 TileView
 * @param {Array}         players            - 所有玩家数据（用于 updatePawns）
 * @param {HTMLElement}   layer              - 地图容器 DOM (#tiles-layer)
 * @param {number|null}   currentPlayerIndex - 当前操作玩家索引
 * @param {Function}      onRefresh          - 地图上 drop 卡片后要调用的刷新回调
 */
export function renderTiles(
    board = [],
    players = [],
    layer,
    currentPlayerIndex = null,
    onRefresh
) {
    if (!layer) return;

    // —— 第一步：渲染静态 .tile 元素，不移除 pawn ——
    renderTilesBase(board, layer);

    // —— 第二步：把 pawn 放到各自格子中央（带动画） ——
    updatePawns(players, layer, currentPlayerIndex);

    // —— 第三步：遍历所有刚渲染的 tile DOM，给它们绑定“使用卡”拖放逻辑 ——
    board.forEach(row => {
        row.forEach(tileView => {
            if (!tileView || tileView.state.toLowerCase() === 'sink') return;
            // 找到对应的 DOM，到时要用 data-x、data-y 属性匹配
            const selector = `.tile[data-x="${tileView.x}"][data-y="${tileView.y}"]`;
            const tileEl = layer.querySelector(selector);
            if (tileEl) {
                bindTileDrag(tileEl, tileView, onRefresh);
            }
        });
    });
}
