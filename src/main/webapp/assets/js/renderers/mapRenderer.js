import { ROLE_INFO } from '../constants/roleInfo.js';

/**
 * mapRenderer.js
 * Render the board (2D array) to a specified layer. Calculates tile positions, renders background images,
 * treasure icons, and player pawns, and adds flood/sink animations as needed.
 * @param {Array<Array>} board   - 2D array of TileView objects
 * @param {Array}        players - Array of player objects, each with currentTile.x/y and type
 * @param {HTMLElement}  layer   - Container element for the tiles
 * @param {number}       currentPlayerIndex - Optional, used to highlight the current player
 */

const exitedTiles = new Set();

export function renderTiles(board = [], players = [], layer, currentPlayerIndex = null) {
    if (!layer) return;
    layer.innerHTML = '';

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

    // Render each tile
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const t = board[r][c];
            if (!t) continue;

            if (t.state.toLowerCase() === 'sink') {
                const key = `${t.x}-${t.y}`;
                if (!exitedTiles.has(key)) {
                    exitedTiles.add(key);
                }
                continue;
            }

            const el = document.createElement('div');
            el.className = `tile ${t.state.toLowerCase()}`;
            el.id = `tile-${t.x}-${t.y}`;
            el.dataset.x = t.x;
            el.dataset.y = t.y;

            // Set tile background image
            const imgPath = `assets/Images/tiles/${encodeURI(t.name)}.png`;
            el.style.backgroundImage    = `url('${imgPath}')`;
            el.style.backgroundSize     = 'cover';
            el.style.backgroundPosition = 'center';

            // Add flood animation if needed
            if (t.state.toLowerCase() === 'flooded') {
                el.classList.add('anim-flood');
            }

            Object.assign(el.style, {
                position: 'absolute',
                width:  `${tileSize}px`,
                height: `${tileSize}px`,
                left:   `${offsetX + c * (tileSize + gap)}px`,
                top:    `${offsetY + r * (tileSize + gap)}px`,
            });

            // Render treasure icon if present
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

            // Tile name label (with custom font)
            const label = document.createElement('div');
            label.className = 'tile-label';
            label.textContent = t.name;
            label.style.fontFamily = 'Righteous, cursive';
            el.appendChild(label);

            layer.appendChild(el);
        }
    }

    // Render player pawns on their current tile
    const pawnSize = tileSize / 3;
    players.forEach((p, idx) => {
        const { x, y, type } = p.currentTile || {};
        const tileEl = layer.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);
        if (!tileEl) return;
        const pawnImg = document.createElement('img');
        pawnImg.src = `assets/Images/icons/player.png`;
        pawnImg.className = 'pawn';

        // Highlight the current player's pawn
        if (typeof currentPlayerIndex === 'number' && idx === currentPlayerIndex) {
            pawnImg.classList.add('my-turn-glow');
        }

        Object.assign(pawnImg.style, {
            position: 'absolute',
            width:  `${pawnSize}px`,
            left:   `${tileEl.offsetLeft + (tileSize - pawnSize) / 2 + idx * 4}px`,
            top:    `${tileEl.offsetTop  + (tileSize - (pawnSize * 2) / 3) / 2 + idx * 4}px`,
            zIndex: 10,
        });
        layer.appendChild(pawnImg);
    });
}
