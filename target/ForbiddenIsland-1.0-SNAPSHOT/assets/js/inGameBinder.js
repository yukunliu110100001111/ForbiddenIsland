// assets/js/binder/inGameBinder.js

import * as api from './api/inGameApi.js';

let gameInterval = null;
let currentAction = null; // 当前等待执行的行动类型

export async function bindInGame(view) {
  if (view !== 'game') return;

  // 清除之前的轮询
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }

  // 容器引用
  const mapContainer    = document.getElementById('map-container');
  const handContainer   = document.getElementById('hand-container');
  const statusContainer = document.getElementById('action-status');
  const controls        = {
    moveBtn:   document.getElementById('btn-move'),
    shoreBtn:  document.getElementById('btn-shore'),
    takeBtn:   document.getElementById('btn-take'),
    specialBtn:document.getElementById('btn-special'),
    endTurnBtn:document.getElementById('btn-end-turn'),
  };

  // 点击地图执行当前 action
  mapContainer.addEventListener('click', async e => {
    if (!currentAction) return;
    const tileEl = e.target.closest('.tile');
    if (!tileEl) return;

    const x = parseInt(tileEl.dataset.x, 10);
    const y = parseInt(tileEl.dataset.y, 10);
    await doAction({ action: currentAction, x, y });
    currentAction = null;
    updateControlHighlight();
  });

  // 绑定控制面板按钮
  controls.moveBtn.addEventListener('click', () => selectAction('MOVE'));
  controls.shoreBtn.addEventListener('click', () => selectAction('SHORE'));
  controls.takeBtn.addEventListener('click', () => selectAction('TAKE'));
  controls.specialBtn.addEventListener('click', async () => {
    selectAction(null);
    await api.useSpecialAbility();
    await refreshGameState();
  });
  controls.endTurnBtn.addEventListener('click', async () => {
    selectAction(null);
    await doAction({ action: 'END_TURN' });
  });

  // 选中某个操作模式，更新 UI 高亮
  function selectAction(action) {
    currentAction = action;
    updateControlHighlight();
  }
  function updateControlHighlight() {
    Object.entries(controls).forEach(([key, btn]) => {
      const matches = key.toUpperCase().includes(currentAction);
      btn.classList.toggle('active', matches);
    });
  }

  // 发送动作，然后立即刷新状态
  async function doAction(actionObj) {
    try {
      const res = await api.sendAction(actionObj);
      if (res.error) {
        alert(`操作失败：${res.error}`);
      }
    } catch (err) {
      console.error('sendAction 出错', err);
    } finally {
      await refreshGameState();
    }
  }

  // 渲染整个游戏界面
  function render(state) {
    renderTiles(state.board.tiles);
    renderPlayers(state.players);
    renderHand(state.players.find(p => p.id === state.currentPlayer).hand);
    statusContainer.textContent =
        `玩家${state.currentPlayer + 1} 回合，剩余行动点：${state.actionsLeft}`;
  }

  // 地图渲染
  function renderTiles(tiles) {
    tilesLayer.innerHTML = '';
    tiles.forEach(t => {
      const div = document.createElement('div');
      div.className = `tile ${t.state}`;
      div.style.left = `${t.x * TILE_SIZE}px`;
      div.style.top  = `${t.y * TILE_SIZE}px`;
      tilesLayer.appendChild(div);
    });
  }

  // 玩家渲染（在地图上加 pawn）
  function renderPlayers(players) {
    // 先移除旧的 pawn
    mapContainer.querySelectorAll('.pawn').forEach(el => el.remove());
    players.forEach(p => {
      const el = document.createElement('div');
      el.className = `pawn pawn-role-${p.role.toLowerCase()}`;
      el.style.left = `${p.x * TILE_SIZE + 10}px`;
      el.style.top  = `${p.y * TILE_SIZE + 10}px`;
      mapContainer.appendChild(el);
    });
  }

  // 手牌渲染
  function renderHand(hand) {
    handContainer.innerHTML = '';
    hand.forEach(card => {
      const el = document.createElement('div');
      el.className = `card card-${card.type.toLowerCase()}`;
      el.textContent = card.type;
      handContainer.appendChild(el);
    });
  }

  // 刷新游戏状态
  async function refreshGameState() {
    try {
      const state = await api.updateGameState();
      render(state);
    } catch (err) {
      console.error('updateGameState 出错', err);
    }
  }

  // 立刻刷新一次，然后每 1s 自动轮询
  await refreshGameState();
  gameInterval = setInterval(refreshGameState, 1000);
}
