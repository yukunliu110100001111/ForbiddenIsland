// 获取整个游戏状态（含日志）的接口
async function fetchGameStateWithHistory() {
    fetch("/data?type=update_element")
        .then(res => res.json())
        .then(data => {
            if (data.logs) {
                document.getElementById("action-log").innerHTML = data.logs;
            }
        });
}
