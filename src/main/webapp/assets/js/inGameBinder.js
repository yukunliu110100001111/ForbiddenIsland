/* 路径修正：binder → ../api */
import * as api from '../js/api/inGameApi.js';

let gameInterval = null;
let currentAction = null;

export async function bindInGame() {
    // 清除旧轮询
    if (gameInterval) clearInterval(gameInterval);

    /* DOM 引用 */
    const mapContainer = document.getElementById('map-container');
    const tilesLayer = document.getElementById('tiles-layer');
    const handContainer = document.getElementById('hand-container');
    const statusEl = document.getElementById('action-status');

    const controls = {
        moveBtn: document.getElementById('btn-move'),
        shoreBtn: document.getElementById('btn-shore'),
        takeBtn: document.getElementById('btn-take'),
        specialBtn: document.getElementById('btn-special'),
        endTurnBtn: document.getElementById('btn-end-turn'),
    };

    // 地图点击
    mapContainer?.addEventListener('click', async (e) => {
        if (!currentAction) return;
        const tileEl = e.target.closest('.tile');
        if (!tileEl) return;
        const x = +tileEl.dataset.x;
        const y = +tileEl.dataset.y;
        await doAction({ action: currentAction, x, y });
        currentAction = null;
        updateCtrlHL();
    });

    // 控制按钮
    controls.moveBtn?.addEventListener('click', () => sel('MOVE'));
    controls.shoreBtn?.addEventListener('click', () => sel('SHORE'));
    controls.takeBtn?.addEventListener('click', () => sel('TAKE'));
    controls.specialBtn?.addEventListener('click', async () => {
        sel(null);
        await api.useSpecialAbility();
        await refresh();
    });
    controls.endTurnBtn?.addEventListener('click', async () => {
        sel(null);
        await doAction({ action: 'END_TURN' });
    });

    function sel(a) {
        currentAction = a;
        updateCtrlHL();
    }

    function updateCtrlHL() {
        Object.entries(controls).forEach(([k, btn]) => {
            btn?.classList.toggle('active', k.toUpperCase().includes(currentAction || ''));
        });
    }

    async function doAction(obj) {
        try {
            const res = await api.sendAction(obj);
            if (res.error) alert(res.error);
        } finally {
            await refresh();
        }
    }

    /* ---------- 渲染 ---------- */
    function render(state) {
        if (state.error) {
            alert(state.error);
            return;
        }
        renderTiles(state.map?.allTiles ?? []);
        renderPlayers(state.players ?? []);
        renderHand(state.currentPlayer?.hand ?? []);
        statusEl.textContent = `玩家${state.currentPlayerIndex + 1} 剩余行动:${state.actionsLeft}`;
    }

    /** 核心：自适应渲染地图格子 **/
    function renderTiles(tiles) {
        if (!tilesLayer) return;
        tilesLayer.innerHTML = '';

        // tiles = tiles.filter(t =>
        //     t && typeof t.x === 'number' && typeof t.y === 'number' && t.name
        // );

        // 1. 动态确定行列数
        const xs = tiles.map(t => +t.x);
        const ys = tiles.map(t => +t.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const cols = maxX - minX + 1;
        const rows = maxY - minY + 1;

        // 2. 获取父容器大小
        const parentW = tilesLayer.offsetWidth;
        const parentH = tilesLayer.offsetHeight;
        const gap = 8;
        const tileW = (parentW - (cols - 1) * gap) / cols;
        const tileH = (parentH - (rows - 1) * gap) / rows;
        const tileSize = Math.min(tileW, tileH);

        // 3. 居中偏移
        const offsetX = (parentW - (cols * tileSize + (cols - 1) * gap)) / 2;
        const offsetY = (parentH - (rows * tileSize + (rows - 1) * gap)) / 2;

        // 4. 渲染每个 tile
        tiles.forEach(t => {
            const x = +t.x, y = +t.y;
            const d = document.createElement('div');
            d.className = `tile ${t.state || ''}`;
            d.dataset.x = x;
            d.dataset.y = y;
            d.textContent = t.name || '';
            d.style.width  = `${tileSize}px`;
            d.style.height = `${tileSize}px`;
            d.style.left   = `${offsetX + (x - minX) * (tileSize + gap)}px`;
            d.style.top    = `${offsetY + (y - minY) * (tileSize + gap)}px`;
            tilesLayer.appendChild(d);
        });

        console.log(tiles.map(t => ({x: t.x, y: t.y, name: t.name})));
    }



    function renderPlayers(players) { /* 省略，和之前一样… */ }
    function renderHand(hand) { /* 省略 … */ }

    /* -------- 轮询 -------- */
    async function refresh() {
        try {
            const state = await api.updateGameState();
            // 保存 tiles 给 resize 用
            window._tiles = state.map?.allTiles ?? [];
            render(state);
        } catch (e) {
            console.error("updateGameState 失败", e);
        }
    }

    // 首次渲染
    await refresh();

    // 每秒刷新
    gameInterval = setInterval(refresh, 1000);

    // 自适应缩放（如窗口变化时）
    window.addEventListener('resize', () => {
        if (window._tiles) renderTiles(window._tiles);
    });
}
