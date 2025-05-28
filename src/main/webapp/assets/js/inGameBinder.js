// assets/js/preGameBinder.js
import * as api from './api/inGameApi.js';

let gameInterval = null;

/** 只渲染一次地图格子，并在后续更新时切换背景 */
function renderMap(tiles) {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) return;

  // 首次：创建网格 & 格子元素
  if (mapContainer.children.length === 0) {
    mapContainer.style.display = 'grid';
    mapContainer.style.gridTemplateColumns = 'repeat(6, 100px)';
    mapContainer.style.gridGap = '4px';
    tiles.forEach(t => {
      const cell = document.createElement('div');
      cell.id = `tile-${t.x}-${t.y}`;
      cell.className = 'tile';
      // 可选：精确定位
      cell.style.gridColumnStart = t.x + 1;
      cell.style.gridRowStart    = t.y + 1;
      mapContainer.appendChild(cell);
    });
  }

  // 更新：根据 tileState 切换背景图、fools-landing 样式
  tiles.forEach(t => {
    const cell = document.getElementById(`tile-${t.x}-${t.y}`);
    if (cell) {
      cell.style.backgroundImage =
          `url("${window.contextPath}assets/images/tiles/${t.tileState}.png")`;
      cell.classList.toggle('fools-landing', t.isFoolsLanding);
    }
  });
}

/** 在每个格子里渲染玩家 token */
function renderPlayers(players) {
  // 先清除旧的 token
  document.querySelectorAll('.player-token').forEach(el => el.remove());

  players.forEach((p, idx) => {
    const cell = document.getElementById(`tile-${p.x}-${p.y}`);
    if (!cell) return;
    const token = document.createElement('div');
    token.className = 'player-token';
    token.textContent = p.type[0];            // 用角色首字母表示
    token.title = p.type;                     // hover 显示全名
    token.style.backgroundColor = p.color;    // 用后端 color 字符串
    cell.appendChild(token);
  });
}

/** 渲染当前玩家的手牌 */
function renderHand(hand) {
  const handContainer = document.getElementById('hand-container');
  if (!handContainer) return;
  handContainer.innerHTML = '';
  hand.forEach(card => {
    const div = document.createElement('div');
    div.className = 'card';
    div.textContent = card.name;  // 或者用 <img> 引入卡牌图
    handContainer.appendChild(div);
  });
}

/** 把后端下发的整个 state 渲染到页面 */
function renderGame(state) {
  // 1) 水位
  const waterLevelEl = document.getElementById('water-level');
  if (waterLevelEl) {
    waterLevelEl.textContent = `Water Level: ${state.currentWaterLevel}`;
  }

  // 2) 宝物状态
  state.treasureCollected.forEach(item => {
    const type = item[0].type.toLowerCase();
    const got  = item[1].isGet;
    const el   = document.getElementById(`treasure-${type}`);
    if (el) el.classList.toggle('collected', got);
  });

  // 3) 地图 & 玩家 & 手牌
  renderMap(state.tiles);
  renderPlayers(state.players);
  renderHand(state.currentPlayer.hand);

  // 4) 当前玩家信息
  const currEl = document.getElementById('current-player');
  if (currEl) {
    currEl.textContent =
        `Current: ${state.currentPlayer.type} (${state.currentPlayer.actionRemain} actions left)`;
  }
}

export function bindInGame() {
  // 清理旧定时器
  if (gameInterval) clearInterval(gameInterval);

  // 定时拉最新状态并渲染
  gameInterval = setInterval(async () => {
    try {
      const state = await api.updateGameState();
      renderGame(state);
    } catch (e) {
      console.error('更新游戏状态失败', e);
    }
  }, 1000);

  // 操作按钮绑定示例
  document.getElementById('btn-move')?.addEventListener('click', async () => {
    // 例：向上移动
    await api.sendAction({ action:'MOVE', dir:'UP' });
  });
  document.getElementById('btn-shore')?.addEventListener('click', async () => {
    // 例：补给坐标
    await api.sendAction({ action:'SHORE', x:2, y:3 });
  });
  document.getElementById('btn-capture')?.addEventListener('click', async () => {
    await api.sendAction({ action:'CAPTURE', treasureType:'EARTH' });
  });
  document.getElementById('btn-give')?.addEventListener('click', async () => {
    await api.sendAction({ action:'GIVE', targetPlayerIndex:1, cardId:5 });
  });
  document.getElementById('btn-skill')?.addEventListener('click', async () => {
    await api.useSpecialAbility();
  });
  document.getElementById('btn-return')?.addEventListener('click', () => {
    window.location.href = `${window.contextPath}page/index.html`;
  });
}
