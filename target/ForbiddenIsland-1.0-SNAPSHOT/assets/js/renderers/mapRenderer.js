// src/renderers/mapRenderer.js
import { ROLE_INFO } from '../constants/roleInfo.js';
import { useSpecialCard } from '../api/inGameApi.js';

/**
 * mapRenderer.js
 * Render the board (2D array) to a specified layer. Calculates tile positions, renders background images,
 * treasure icons, and player pawns, and adds flood/sink animations as needed. Also handles drag-and-drop
 * for special cards (helicopter and sandbag).
 *
 * @param {Array<Array>} board             - 2D array of TileView objects
 * @param {Array}        players           - Array of player objects, each with currentTile.x/y and type
 * @param {HTMLElement}  layer             - Container element for the tiles
 * @param {number}       currentPlayerIndex - Index of the current acting player (for highlighting)
 */
const exitedTiles = new Set();

/**
 * Maintain a map of playerIndex → pawn DOM element.
 * So that pawn elements persist between renders and can animate.
 */
const pawnMap = new Map();

/**
 * Determine if a tile can accept a dropped special card.
 * - Helicopter card (cardType === 'ACTION'): allowed on any non-sunk tile.
 * - Sandbag card (cardType === 'EVENT'): allowed only on flooded tiles.
 *
 * @param {Object} tileView - The tile data model (board[r][c])
 * @param {string} cardType - The dragged card type ('ACTION' or 'EVENT')
 * @returns {boolean}
 */
function isLegalTarget(tileView, cardType) {
    const state = (tileView.state || '').toLowerCase();
    if (cardType === 'ACTION') {
        // Helicopter: any tile not sunk
        return state !== 'sink';
    }
    if (cardType === 'EVENT') {
        // Sandbag: only flooded
        return state === 'flooded';
    }
    return false;
}

/**
 * Render the entire board (tiles) and update pawn positions with animation.
 *
 * @param {Array<Array>} board              - 2D array of TileView objects
 * @param {Array}        players            - Array of player objects ({ currentTile: { x, y }, type, ... })
 * @param {HTMLElement}  layer              - Container element (#tiles-layer)
 * @param {number}       currentPlayerIndex - Index of the player whose turn it is (for highlighting)
 */
export function renderTiles(board = [], players = [], layer, currentPlayerIndex = null) {
    if (!layer) return;

    // 1. Remove only existing tiles, keep pawn DOM elements intact
    layer.querySelectorAll('.tile').forEach(el => el.remove());

    // 2. Validate board
    if (!Array.isArray(board) || board.length === 0 || !Array.isArray(board[0])) {
        console.error('renderTiles: board is not a valid 2D array', board);
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

    // 3. Render each tile
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const t = board[r][c];
            if (!t) continue;

            // Skip sunk tiles
            if (t.state.toLowerCase() === 'sink') {
                const key = `${t.x}-${t.y}`;
                if (!exitedTiles.has(key)) {
                    exitedTiles.add(key);
                }
                continue;
            }

            // Create tile element
            const el = document.createElement('div');
            el.className = `tile ${t.state.toLowerCase()}`; // e.g., "tile flooded" or "tile safe"
            el.id = `tile-${t.x}-${t.y}`;
            el.dataset.x = t.x;
            el.dataset.y = t.y;

            // Set background image
            const imgPath = `assets/Images/tiles/${encodeURI(t.name)}.png`;
            el.style.backgroundImage = `url('${imgPath}')`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';

            // If flooded, add animation class
            if (t.state.toLowerCase() === 'flooded') {
                el.classList.add('anim-flood');
            }

            // Position and size
            Object.assign(el.style, {
                position: 'absolute',
                width: `${tileSize}px`,
                height: `${tileSize}px`,
                left: `${offsetX + c * (tileSize + gap)}px`,
                top: `${offsetY + r * (tileSize + gap)}px`,
            });

            // Render treasure icon if exists
            if (t.treasureType) {
                const icon = document.createElement('img');
                icon.src = `assets/Images/icons/treasure/treasure-${t.treasureType.toLowerCase()}.png`;
                icon.className = 'treasure-icon';
                Object.assign(icon.style, {
                    position: 'absolute',
                    width: '24px',
                    height: '24px',
                    top: '4px',
                    right: '4px',
                    pointerEvents: 'none',
                });
                el.appendChild(icon);
            }

            // Render tile name label
            const label = document.createElement('div');
            label.className = 'tile-label';
            label.textContent = t.name;
            label.style.fontFamily = 'Righteous, cursive';
            el.appendChild(label);

            // Bind drag events for special cards on this tile
            el.addEventListener('dragover', e => {
                e.preventDefault();         // 必须无条件先调用，否则鼠标禁用、无法 drop
                el.classList.add('tile-droppable');
            });

// dragleave 和 drop 逻辑不变，drop 事件里再做合法性校验

            el.addEventListener('dragleave', () => {
                el.classList.remove('tile-droppable');
            });
            el.addEventListener('drop', async e => {
                el.classList.remove('tile-droppable');
                let dragData;
                try {
                    dragData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
                } catch {
                    dragData = {};
                }
                if (isLegalTarget(t, dragData.cardType)) {
                    // Use the special card on this tile
                    await useSpecialCard(dragData.cardType, dragData.cardId, t.x, t.y);
                    // Refresh game state
                    if (typeof window.refreshGame === 'function') {
                        window.refreshGame();
                    }
                } else {
                    el.classList.add('tile-invalid-drop');
                    setTimeout(() => el.classList.remove('tile-invalid-drop'), 500);
                }
            });

            // Append tile to layer
            layer.appendChild(el);
        }
    }

    // 4. Render or update player pawns with smooth movement
    const pawnSize = tileSize / 3;

    players.forEach((p, idx) => {
        const curr = p.currentTile || {};
        const x = curr.x;
        const y = curr.y;
        const tileEl = layer.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);

        if (!tileEl) {
            // Tile no longer exists (possibly sunk). Hide pawn if it's on pawnMap.
            if (pawnMap.has(idx)) {
                pawnMap.get(idx).style.display = 'none';
            }
            return;
        }

        // Compute target position (centered on tile)
        const targetLeft = tileEl.offsetLeft + (tileSize - pawnSize) / 2;
        const targetTop  = tileEl.offsetTop  + (tileSize - pawnSize) / 2;

        if (pawnMap.has(idx)) {
            // Pawn already exists: update position to animate
            const pawnEl = pawnMap.get(idx);
            pawnEl.style.display = 'block';
            pawnEl.style.width  = `${pawnSize}px`;
            pawnEl.style.height = `${pawnSize}px`;
            pawnEl.style.left   = `${targetLeft}px`;
            pawnEl.style.top    = `${targetTop}px`;

            // Highlight current player
            if (idx === currentPlayerIndex) {
                pawnEl.classList.add('my-turn-glow');
            } else {
                pawnEl.classList.remove('my-turn-glow');
            }
        } else {
            // Create a new pawn element
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
                transition: 'left 0.3s ease, top 0.3s ease',
            });

            // Highlight if current player
            if (idx === currentPlayerIndex) {
                pawnEl.classList.add('my-turn-glow');
            }

            layer.appendChild(pawnEl);
            pawnMap.set(idx, pawnEl);
        }
    });
}
