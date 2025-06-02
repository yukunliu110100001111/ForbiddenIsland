// src/renderers/tileRenderer.js

/**
 * renderTilesBase(board, layer)
 *
 * 负责把每个 TileView 数据“画”成对应的 <div class="tile">，
 * 并放到 layer（#tiles-layer）里。仅处理静态渲染，不绑定任何拖放或棋子逻辑。
 * **注意：只移除已有的 .tile 节点，不会清空整个 layer，以便保留 pawn DOM。**
 *
 * @param {Array<Array>} board   - 2D 数组，元素格式为 TileView 对象
 * @param {HTMLElement} layer    - 容器 DOM 节点（#tiles-layer）
 */
export function renderTilesBase(board = [], layer) {
    if (!layer) return;

    // —— 只移除已有的 .tile 节点，不清空其他元素（比如 pawn） ——
    layer.querySelectorAll('.tile').forEach(el => el.remove());

    if (!Array.isArray(board) || board.length === 0 || !Array.isArray(board[0])) {
        console.error('renderTilesBase: board 不是有效的二维数组', board);
        return;
    }

    const rows = board.length;
    const cols = board[0].length;
    const gap = 8;
    const parentW = layer.offsetWidth;
    const parentH = layer.offsetHeight;
    const tileW = (parentW - (cols - 1) * gap) / cols;
    const tileH = (parentH - (rows - 1) * gap) / rows;
    const tileSize = Math.min(tileW, tileH);
    const offsetX = (parentW - (cols * tileSize + (cols - 1) * gap)) / 2;
    const offsetY = (parentH - (rows * tileSize + (rows - 1) * gap)) / 2;

    // 用一个 Set 记录已经“下沉”的 tile，这样就不再渲染
    const exitedTiles = new Set();

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const t = board[r][c];
            if (!t) continue;

            // 如果已经下沉，跳过渲染
            if (t.state.toLowerCase() === 'sink') {
                const key = `${t.x}-${t.y}`;
                if (!exitedTiles.has(key)) {
                    exitedTiles.add(key);
                }
                continue;
            }

            // 创建 tile 元素
            const el = document.createElement('div');
            el.className = `tile ${t.state.toLowerCase()}`;  // e.g. "tile flooded" 或 "tile safe"
            el.id = `tile-${t.x}-${t.y}`;
            el.dataset.x = t.x;
            el.dataset.y = t.y;
            if (t.treasureType) {
                el.dataset.treasureType = t.treasureType; // 捕获后端要用
            }

            // 背景图
            const imgPath = `assets/Images/tiles/${encodeURI(t.name)}.png`;
            el.style.backgroundImage    = `url('${imgPath}')`;
            el.style.backgroundSize     = 'cover';
            el.style.backgroundPosition = 'center';

            // 如果是 flooded，给它一个小动画
            if (t.state.toLowerCase() === 'flooded') {
                el.classList.add('anim-flood');
            }

            // 位置和大小
            Object.assign(el.style, {
                position: 'absolute',
                width:  `${tileSize}px`,
                height: `${tileSize}px`,
                left:   `${offsetX + c * (tileSize + gap)}px`,
                top:    `${offsetY + r * (tileSize + gap)}px`,
            });

            // 如果有 treasure，在右上角再加一个小 icon
            if (t.treasureType) {
                const icon = document.createElement('img');
                icon.src = `assets/Images/icons/treasure/treasure-${t.treasureType.toLowerCase()}.png`;
                icon.className = 'treasure-icon';
                Object.assign(icon.style, {
                    position: 'absolute',
                    width: '24px', height: '24px',
                    top: '4px', right: '4px',
                    pointerEvents: 'none'
                });
                el.appendChild(icon);
            }

            // tile 名称标签
            const label = document.createElement('div');
            label.className = 'tile-label';
            label.textContent = t.name;
            label.style.fontFamily = 'Righteous, cursive';
            el.appendChild(label);

            // 把 tile 放进 layer（不会影响之前已经存在的 pawn 元素）
            layer.appendChild(el);
        }
    }
}
