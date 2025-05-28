// room.js（已在 page/sub/room.html 中通过 <script> 引入）
// … 上面省略 init preview 逻辑 …

document.getElementById('btn-room-start')
    .addEventListener('click', async () => {
        // 保存选中的地图索引
        sessionStorage.setItem('selectedMapIndex', preview.currentIndex);

        // 退场动画（可选）
        animateCardExit();
        updateBlurBar('game');
        await new Promise(r => setTimeout(r, 300));

        const html = await fetch('/ForbiddenIsland_war_exploded/page/game.html')
            .then(r => {
                if (!r.ok) throw new Error(`加载失败: ${r.status}`);
                return r.text();
            });
        // 渲染并绑定事件
        app.innerHTML = html;
        requestAnimationFrame(() => {
            document.querySelectorAll('.card').forEach(c => {
                c.classList.remove('exiting');
                c.classList.add('entering');
            });
        });
        bindViewEvents('game');
    });
