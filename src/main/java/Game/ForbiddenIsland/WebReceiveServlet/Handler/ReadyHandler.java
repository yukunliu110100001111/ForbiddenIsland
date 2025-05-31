package Game.ForbiddenIsland.WebReceiveServlet.Handler;

import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import Game.ForbiddenIsland.model.RoomState;

public class ReadyHandler implements RequestHandler {
    private final RoomState roomState;
    private final boolean isReady;

    public ReadyHandler(RoomState roomState, boolean isReady) {
        this.roomState = roomState;
        this.isReady = isReady;
    }

    // Whether all player is ready
    @Override
    public void handle(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws IOException {
        if (isReady) roomState.incrementReady();
        else roomState.decrementReady();
        out.println("{\"message\":\"Ready state updated.\"}");
    }
}
