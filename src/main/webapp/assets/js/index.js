const app = document.getElementById('app');
const blurBar = document.querySelector('.blur-bar');

/**
 * 控制 .blur-bar 的状态变换（中心横幅 ⇄ 全屏模糊）
 */
function updateBlurBar(name) {
    const isCover = name === 'cover';
    requestAnimationFrame(() => {
        document.body.classList.toggle('cover', isCover);
    });
}

/**
 * 卡片退场动画（放大爆炸消失）
 */
function animateCardExit() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.remove('entering');
        card.classList.add('exiting');
    });
}

/**
 * 页面切换主函数
 */
async function loadView(name, push = true) {
    animateCardExit(); // 在当前页面执行退场动画

    if (push) window.location.hash = name;
    updateBlurBar(name);

    // 等待前一帧退出动画完成一部分
    await new Promise(r => setTimeout(r, 300));

    // 加载页面 HTML
    const html = await fetch(`sub/${name}.html`).then(r => r.text());
    app.innerHTML = html;

    // 入场动画：下一帧执行
    requestAnimationFrame(() => {
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('exiting');
            card.classList.add('entering');
        });
    });

    bindViewEvents(name);
}

/**
 * 各页面按钮绑定
 */
function bindViewEvents(name) {
    if (name === 'cover') {
        const btn = document.getElementById('start-btn');
        const title = document.querySelector('.view-cover h1');

        btn.onclick = () => {
            title.classList.add('explode');         // 标题放大爆炸
            document.body.classList.remove('cover'); // blur-bar 变为全屏

            setTimeout(() => {
                loadView('lobby');
            }, 0); // 与 explode 动画时长匹配
        };
    }

    if (name === 'lobby') {
        document.getElementById('go-create-room')
            ?.addEventListener('click', () => loadView('creation'));
        document.getElementById('go-join-room')
            ?.addEventListener('click', () => loadView('room'));
    }

    if (name === 'creation') {
        document.getElementById('create-room')
            ?.addEventListener('click', () => {
                // 1. 读取滑块值
                const count = document.getElementById('players').value;
                // 2. 存储玩家数
                localStorage.setItem('playerCount', count);
                // 3. 跳转到 room 视图
                loadView('room');
            });
    }

    if (name === 'room') {
        // 保留原“开始游戏”按钮
        document.getElementById('btn-room-start')
            ?.addEventListener('click', () => {
                window.location.href = 'game.html';
            });

        // 新增：根据 playerCount 渲染卡片
        const count = parseInt(localStorage.getItem('playerCount'), 10) || 0;
        const container = document.getElementById('slots-container');
        // 先清空，防止重复渲染
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const slot = document.createElement('div');
            slot.classList.add('slot');
            // 可选：显示玩家序号
            // slot.textContent = `P${i + 1}`;
            container.appendChild(slot);
        }
    }

    // …如有更多页面按钮继续添加
}

window.addEventListener('hashchange', () => {
    const view = window.location.hash.slice(1) || 'cover';
    loadView(view, false);
});

/**
 * 首次进入加载
 */
window.addEventListener('DOMContentLoaded', () => {
    const start = window.location.hash.slice(1) || 'cover';
    loadView(start, false);
});
