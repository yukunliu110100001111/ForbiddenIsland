/**
 * Fetch the complete game state, including the action history/log.
 * Updates the #action-log element if logs are present in the response.
 */
async function fetchGameStateWithHistory() {
    fetch("/data?type=update_element")
        .then(res => res.json())
        .then(data => {
            if (data.logs) {
                document.getElementById("action-log").innerHTML = data.logs;
            }
        });
}
