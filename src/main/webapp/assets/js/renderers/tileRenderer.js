// src/renderers/tileRenderer.js
import { checkImageExists } from '../helpers/imageHelper.js';

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

            // 标记是否为Fool's Landing
            if (t.foolsLanding) {
                el.dataset.foolsLanding = 'true';
            }

            const fixedName = t.name.replace(/\u00A0/g, ' ')  // 去除不可见空格
                .replace(/\s+/g, ' ')    // 压缩多空格
                .replace(/’/g, "'")      // 替换花式引号
                .trim();                // 去除首尾空格
            const imgPath = `assets/Images/tiles/${encodeURI(fixedName)}.png`;

            // 设置图片背景
            el.style.backgroundImage = `url('${imgPath}')`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';

            // 为Fool's Landing添加图片错误处理
            if (t.foolsLanding) {
                const img = new Image();
                img.onload = () => console.log('成功加载Fool\'s Landing图片');
                img.onerror = () => {
                    console.log('Fool\'s Landing图片加载失败，使用备用方案');
                    // 尝试备用方案1：不同的文件名
                    const altPath = 'assets/Images/tiles/FoolsLanding.png';
                    el.style.backgroundImage = `url('${altPath}')`;

                    // 再次尝试检查，如果依然失败，使用纯色方案
                    const altImg = new Image();
                    altImg.onload = () => console.log('备用图片加载成功');
                    altImg.onerror = () => {
                        console.log('所有图片加载失败，使用纯色背景');
                        el.style.backgroundColor = '#3F51B5';
                        el.style.backgroundImage = 'none';

                        // 增加可见性
                        const fLabel = document.createElement('div');
                        fLabel.textContent = "Fool's Landing";
                        fLabel.style.cssText = 'color:white;font-weight:bold;font-size:14px;text-align:center;';
                        el.appendChild(fLabel);
                    };
                    altImg.src = altPath;
                };
                img.src = imgPath;
            }

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
                    width: '30px', height: '30px',
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
