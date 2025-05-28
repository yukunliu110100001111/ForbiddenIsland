// assets/js/app.js
import { bindPreGame }  from './preGameBinder.js';
import { bindInGame }   from './inGameBinder.js';

// 从 <base> 标签读取上下文路径（如 "/ForbiddenIsland_war_exploded/"）
const contextPath = document.querySelector('base')?.getAttribute('href') || '';
// 暴露给 binder 脚本使用
window.contextPath = contextPath;

const app     = document.getElementById('app');
const blurBar = document.querySelector('.blur-bar');

/** 控制 .blur-bar 的状态变换（中心横幅 ⇄ 全屏模糊） */
function updateBlurBar(view) {
    const isCover = view === 'cover';
    requestAnimationFrame(() => {
        document.body.classList.toggle('cover', isCover);
    });
}

/** 卡片退场动画（放大爆炸消失） */
function animateCardExit() {
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('entering');
        card.classList.add('exiting');
    });
}

/**
 * 页面切换主函数
 * @param {string} view 视图名：cover ／ lobby ／ creation ／ room ／ game
 * @param {boolean} push 是否要把 hash 推入历史（默认 true）
 */
async function loadView(view, push = true) {
    animateCardExit();

    if (push) window.location.hash = view;
    updateBlurBar(view);

    // 等待退场动画先跑一段
    await new Promise(r => setTimeout(r, 300));

    // 根据不同视图选择 HTML 路径
    let url;
    if (view === 'game') {
        // game.html 放在 page 根目录
        url = `${contextPath}page/game.html`;
    } else {
        // cover/lobby/creation/room 放在 page/sub 下
        url = `${contextPath}page/sub/${view}.html`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`加载视图失败：${url} （${res.status}）`);
    const html = await res.text();

    // 注入视图
    app.innerHTML = html;

    // 入场动画
    requestAnimationFrame(() => {
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('exiting');
            card.classList.add('entering');
        });
    });

    // 根据 view 调用对应的绑定函数
    if (['cover', 'lobby', 'creation', 'room'].includes(view)) {
        bindPreGame(view);
    } else if (view === 'game') {
        bindInGame();
    }
}

// 监听地址栏 hash 变化
window.addEventListener('hashchange', () => {
    const view = window.location.hash.slice(1) || 'cover';
    loadView(view, false);
});

// 首次页面加载
window.addEventListener('DOMContentLoaded', () => {
    const start = window.location.hash.slice(1) || 'cover';
    loadView(start, false);
});

export { loadView };