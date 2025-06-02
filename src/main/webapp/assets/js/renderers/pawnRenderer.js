// src/renderers/pawnRenderer.js

/**
 * pawnRenderer.js
 * 接收 players[]、当前图层 layer 以及 currentPlayerIndex，
 * 维护一个全局 pawnMap：Map<playerIndex, pawnElement>，
 * 如果棋子已经存在，就直接调整 left/top，利用 CSS transition 平滑移动；否则新建一个 <img>，放到合适位置。
 *
 * @param {Array}       players            - 每个玩家对象，至少包含 currentTile: {x, y}
 * @param {HTMLElement} layer              - #tiles-layer 容器，用于插入/更新 pawn 元素
 * @param {number|null} currentPlayerIndex - 用于给当前轮到的玩家的 pawn 加高亮
 */
const pawnMap = new Map();

export function updatePawns(players = [], layer, currentPlayerIndex = null) {
    if (!layer) return;

    players.forEach((p, idx) => {
        const tileX = p.currentTile?.x;
        const tileY = p.currentTile?.y;
        const tileEl = layer.querySelector(`.tile[data-x="${tileX}"][data-y="${tileY}"]`);

        if (!tileEl) {
            // 目标 tile 不存在（可能 sunk），就隐藏原来的棋子
            if (pawnMap.has(idx)) {
                pawnMap.get(idx).style.display = 'none';
            }
            return;
        }

        // 计算出中心点坐标
        const tileRect = tileEl.getBoundingClientRect();
        const pawnSize = tileRect.width / 3; // 直接用 tileRect.width 的三分之一
        const targetLeft = tileEl.offsetLeft + (tileRect.width - pawnSize) / 2;
        const targetTop  = tileEl.offsetTop  + (tileRect.height - pawnSize) / 2;

        if (pawnMap.has(idx)) {
            // 已有 pawn 元素：平滑移动到 targetLeft/targetTop
            const pawnEl = pawnMap.get(idx);
            pawnEl.style.display = 'block';
            pawnEl.style.width  = `${pawnSize}px`;
            pawnEl.style.height = `${pawnSize}px`;
            pawnEl.style.left   = `${targetLeft}px`;
            pawnEl.style.top    = `${targetTop}px`;

            // 根据是否是当前玩家添加/移除高亮
            if (idx === currentPlayerIndex) {
                pawnEl.classList.add('my-turn-glow');
            } else {
                pawnEl.classList.remove('my-turn-glow');
            }
        } else {
            // 首次创建 pawn
            const pawnEl = document.createElement('img');
            pawnEl.src = `assets/Images/icons/player.png`;
            pawnEl.className = 'pawn';
            Object.assign(pawnEl.style, {
                position: 'absolute',
                width:  `${pawnSize}px`,
                height: `${pawnSize}px`,
                left:   `${targetLeft}px`,
                top:    `${targetTop}px`,
                zIndex: 10,
                transition: 'left 0.3s ease, top 0.3s ease'
            });
            if (idx === currentPlayerIndex) {
                pawnEl.classList.add('my-turn-glow');
            }
            layer.appendChild(pawnEl);
            pawnMap.set(idx, pawnEl);
        }
    });
}
