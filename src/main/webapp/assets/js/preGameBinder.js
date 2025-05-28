// assets/js/preGameBinder.js

import * as api     from './api/preGameApi.js';
import { loadView } from './app.js';

let roomInterval = null;

export function bindPreGame(view) {
    // 切换视图前清除上一次的轮询
    if (roomInterval) {
        clearInterval(roomInterval);
        roomInterval = null;
    }

    switch (view) {
        // 1) COVER 视图
        case 'cover': {
            const startBtn = document.getElementById('start-btn');
            startBtn?.addEventListener('click', () => loadView('lobby'));
            break;
        }

        // 2) LOBBY 视图
        case 'lobby': {
            const createBtn = document.getElementById('go-create-room');
            const joinBtn   = document.getElementById('go-join-room');

            // 初始化：如果已有人创建房间，就禁用“创建房间”
            (async () => {
                try {
                    const { players } = await api.getPlayerCount();
                    if (players > 0) {
                        createBtn.disabled    = true;
                        createBtn.textContent = 'The room has been created.';
                    }
                } catch (e) {
                    console.error('Failed to obtain room status.', e);
                }
            })();

            createBtn?.addEventListener('click', () => {
                if (!createBtn.disabled) loadView('creation');
            });
            joinBtn?.addEventListener('click', async () => {
                try {
                    await api.joinRoom();
                    loadView('room');
                } catch (e) {
                    alert(e.message);
                }
            });
            break;
        }

        // 3) CREATION 视图
        case 'creation': {
            const sliderP   = document.getElementById('players');
            const labelP    = document.getElementById('player-count');
            const sliderD   = document.getElementById('difficulty');
            const labelD    = document.getElementById('difficulty-label');
            const createBtn = document.getElementById('create-room');

            // 滑块→文本 同步
            if (sliderP && labelP) {
                labelP.textContent = sliderP.value;
                sliderP.oninput    = () => labelP.textContent = sliderP.value;
            }
            if (sliderD && labelD) {
                labelD.textContent = sliderD.value;
                sliderD.oninput    = () => labelD.textContent = sliderD.value;
            }

            // 确认创建
            createBtn?.addEventListener('click', async () => {
                const count = sliderP ? +sliderP.value : 0;
                const level = sliderD ? +sliderD.value : 1;
                try {
                    await api.createRoom(level, count);
                    localStorage.setItem('playerCount', count);
                    localStorage.setItem('difficulty', level);
                    loadView('room');
                } catch (e) {
                    alert(e.message);
                }
            });
            break;
        }

        // 4) ROOM 视图
        case 'room': {
            const container = document.getElementById('slots-container');
            const status    = document.getElementById('room-status');
            const startBtn  = document.getElementById('btn-room-start');
            const prevBtn   = document.getElementById('btn-map-prev');
            const nextBtn   = document.getElementById('btn-map-next');
            const randBtn   = document.getElementById('btn-map-random');

            // ① 首次渲染“空槽”
            if (container && container.children.length === 0) {
                const maxCount = +localStorage.getItem('playerCount') || 0;
                for (let i = 0; i < maxCount; i++) {
                    const slot = document.createElement('div');
                    slot.className   = 'slot';
                    slot.textContent = `P${i+1}`;
                    container.appendChild(slot);
                }
            }

            // ② 平滑轮询并更新 occupied 状态
            roomInterval = setInterval(async () => {
                try {
                    const { players, max } = await api.getPlayerCount();
                    status && (status.textContent = `Waiting ${players}/${max}`);
                    if (container) {
                        container.querySelectorAll('.slot').forEach((slot, idx) => {
                            slot.classList.toggle('occupied', idx < players);
                        });
                    }
                } catch (e) {
                    console.error('轮询玩家数失败', e);
                }
            }, 1000);

            // ③ 开始游戏
            startBtn?.addEventListener('click', async () => {
                try {
                    await api.startGame();
                    window.location.href = `${window.contextPath}page/game.html`;
                } catch (e) {
                    alert(e.message);
                }
            });

            // ④ 地图导航（可选）
            prevBtn?.addEventListener('click', () => mapLoader.prev());
            nextBtn?.addEventListener('click', () => mapLoader.next());
            randBtn?.addEventListener('click', () => mapLoader.random());
            break;
        }

        default:
            break;
    }
}
