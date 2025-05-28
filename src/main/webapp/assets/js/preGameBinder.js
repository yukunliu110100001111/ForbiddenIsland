// assets/js/preGameBinder.js
import * as api     from './api/preGameApi.js';
import { loadView } from './app.js';

let roomInterval = null;

export function bindPreGame(view) {
    // 每次切页先清除上一次的轮询
    if (roomInterval) {
        clearInterval(roomInterval);
        roomInterval = null;
    }

    // 1) COVER 视图
    if (view === 'cover') {
        document.getElementById('start-btn')
            ?.addEventListener('click', () => loadView('lobby'));
    }

// assets/js/preGameBinder.js

    if (view === 'lobby') {
        const createBtn = document.getElementById('go-create-room');
        const joinBtn   = document.getElementById('go-join-room');

        // 先拉一次当前房间人数
        api.getPlayerCount().then(({ players, max }) => {
            if (players > 0) {
                // 房间已被创建，禁用或隐藏“创建房间”按钮
                if (createBtn) {
                    createBtn.disabled = true;
                    createBtn.textContent = 'The room has been created.';
                }
            }
        }).catch(console.error);

        // 绑定加入房间
        joinBtn?.addEventListener('click', async () => {
            const res = await api.joinRoom();
            if (res.error) return alert(res.error);
            loadView('room');
        });

        // 绑定前往创建房间视图（只有 players===0 时才有效）
        createBtn?.addEventListener('click', () => {
            if (createBtn.disabled) return;  // 双保险
            loadView('creation');
        });
    }


    // 3) CREATION 视图：处理滑块 & 发 create_room 请求
    if (view === 'creation') {
        // 滑块同步显示
        const sliderP = document.getElementById('players');
        const labelP  = document.getElementById('player-count');
        sliderP?.addEventListener('input', () => {
            labelP.textContent = sliderP.value;
        });

        const sliderD = document.getElementById('difficulty');
        const labelD  = document.getElementById('difficulty-label');
        sliderD?.addEventListener('input', () => {
            labelD.textContent = sliderD.value;
        });

        // 点击确认创建
        document.getElementById('create-room')
            ?.addEventListener('click', async () => {
                const count = +sliderP.value;
                const level = +sliderD.value;
                const res   = await api.createRoom(level, count);
                if (res.error) return alert(res.error);
                // 保存到 localStorage 以备 room 视图取用
                localStorage.setItem('playerCount', count);
                localStorage.setItem('difficulty', level);
                loadView('room');
            });
    }

// preGameBinder.js 里的 ROOM 分支
    if (view === 'room') {
        // 1) 渲染卡槽（依据创建时选择的最大玩家数）
        const container = document.getElementById('slots-container');
        if (container) {
            container.innerHTML = '';
            const maxCount = +localStorage.getItem('playerCount') || 0;
            for (let i = 0; i < maxCount; i++) {
                const slot = document.createElement('div');
                slot.className = 'slot';
                slot.textContent = `P${i + 1}`;  // 可选：显示玩家编号
                container.appendChild(slot);
            }
        }

        // 2) 轮询房间状态并更新 UI
        const status = document.getElementById('room-status');
        roomInterval = setInterval(async () => {
            try {
                const { players, max } = await api.getPlayerCount();
                // 更新等待人数文字
                if (status) {
                    status.textContent = `Waiting ${players}/${max}`;
                }
                // 根据当前玩家数高亮前面几个槽位
                if (container) {
                    const slots = container.querySelectorAll('.slot');
                    slots.forEach((slot, idx) => {
                        if (idx < players) {
                            slot.classList.add('occupied');
                        } else {
                            slot.classList.remove('occupied');
                        }
                    });
                }
            } catch (err) {
                console.error('轮询玩家数失败', err);
            }
        }, 1000);

        // 3) “开始游戏”按钮
        document.getElementById('btn-room-start')
            ?.addEventListener('click', async () => {
                const res = await api.startGame();
                if (res.error) return alert(res.error);
                // 跳转到主游戏页面
                window.location.href = `${window.contextPath}page/game.html`;
            });

        // 4) 地图导航按钮（如果有）
        document.getElementById('btn-map-prev')
            ?.addEventListener('click', () => mapLoader.prev());
        document.getElementById('btn-map-next')
            ?.addEventListener('click', () => mapLoader.next());
        document.getElementById('btn-map-random')
            ?.addEventListener('click', () => mapLoader.random());
    }

}
