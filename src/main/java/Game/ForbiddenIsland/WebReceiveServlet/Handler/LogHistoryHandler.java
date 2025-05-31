package Game.ForbiddenIsland.WebReceiveServlet.Handler;

import Game.ForbiddenIsland.model.RoomState;
import Game.ForbiddenIsland.model.GameState;
import com.alibaba.fastjson.JSON;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

public class LogHistoryHandler implements RequestHandler {
    private final RoomState roomState;
    public LogHistoryHandler(RoomState roomState) {
        this.roomState = roomState;
    }

    // log and return all player actions
    @Override
    public void handle(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) {
        GameState gameState = roomState.getGameState();
        if (gameState == null) {
            out.println("{\"error\":\"No game started.\"}");
            return;
        }
        out.println(JSON.toJSONString(gameState));
    }
}
