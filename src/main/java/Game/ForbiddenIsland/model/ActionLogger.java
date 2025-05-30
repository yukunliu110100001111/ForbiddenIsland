package Game.ForbiddenIsland.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ActionLogger implements Serializable {
    private final List<String> logs = new ArrayList<>();
    private final int MAX_LOGS = 100;



    public synchronized void log(String msg) {
        if (msg != null && !msg.isBlank()) {
            logs.add(msg);
            if (logs.size() > MAX_LOGS) {
                logs.remove(0);  // 删除最早的
            }
        }
    }

    public synchronized List<String> getLogs() {
        return Collections.unmodifiableList(logs);
    }

    public synchronized String getLogsAsHtml() {
        StringBuilder sb = new StringBuilder();
        for (String log : logs) {
            sb.append("<div class='log-line'>").append(log).append("</div>");
        }
        return sb.toString();
    }

    public synchronized void clear() {
        logs.clear();
    }
}
