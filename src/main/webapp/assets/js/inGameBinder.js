// assets/js/inGameBinder.js
import * as api from './api/inGameApi.js';

let gameInterval = null;

/**
 * 把后端拉到的游戏状态渲染到界面
 * @param {object} state 完整的 GameState JSON
 */
function renderGame(state) {
  // ==== 这里示例一个简单刷新方式，按你实际需求来实现 ====
  // 1) 刷新水位
  const waterLevelEl = document.getElementById('water-level');
  if (waterLevelEl) waterLevelEl.textContent = `Water: ${state.currentWaterLevel}`;

  // 2) 刷新宝物状态
  state.treasureCollected.forEach(item => {
    // item = [ {type:"EARTH"}, {isGet:true} ]
    const type = item[0].type;
    const got  = item[1].isGet;
    const el   = document.querySelector(`#treasure-${type.toLowerCase()}`);
    if (el) el.classList.toggle('collected', got);
  });

  // 3) 刷新地图格子、玩家、手牌……（按你的 HTML 结构写 DOM 操作）
  //    例如：
  //    state.tiles.forEach(tile => { … })
  //    state.players.forEach(p => { … })
  //    state.currentPlayer.hand.forEach(card => { … })
}
// ———————————————————————————————————————————————

/**
 * 绑定“游戏内”视图的所有交互
 */
export function bindInGame() {
  // 1. 清理上一次的定时器
  if (gameInterval) clearInterval(gameInterval);

  // 2. 1s 拉一次最新状态并渲染
  gameInterval = setInterval(async () => {
    try {
      const state = await api.updateGameState();
      renderGame(state);
    } catch (err) {
      console.error('updateGameState 失败：', err);
    }
  }, 1000);

  // 3. 操作按钮绑定
  document.getElementById('btn-move')?.addEventListener('click', async () => {
    // 示例：向上移动。请替换成你的实际参数获取逻辑
    await api.sendAction({ action: 'MOVE', dir: 'UP' });
  });

  document.getElementById('btn-shore')?.addEventListener('click', async () => {
    // 示例：补给 (shore up)，参数需按实际格子坐标传
    await api.sendAction({ action: 'SHORE', x: 2, y: 3 });
  });

  document.getElementById('btn-give')?.addEventListener('click', async () => {
    // 示例：给卡，参数示例
    await api.sendAction({ action: 'GIVE', targetPlayerIndex: 1, cardId: 5 });
  });

  document.getElementById('btn-capture')?.addEventListener('click', async () => {
    // 示例：捕获宝物
    await api.sendAction({ action: 'CAPTURE', treasureType: 'EARTH' });
  });

  // 4. 特殊技能（如果有按钮）
  document.getElementById('btn-skill')?.addEventListener('click', async () => {
    await api.useSpecialAbility();
  });

  // 5. 返回菜单
  document.getElementById('btn-return')?.addEventListener('click', () => {
    window.location.href = `${window.contextPath}page/index.html`;
  });
}
