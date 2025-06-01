package Game.ForbiddenIsland.WebReceiveServlet.Handler;

import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import Game.ForbiddenIsland.model.RoomState;

public class ExitRoomHandler implements RequestHandler {

    private final RoomState roomState;

    public ExitRoomHandler(RoomState roomState) {
        this.roomState = roomState;
    }

    // decrease current people in room state when someone out
    @Override
    public void handle(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws IOException {
        if (!roomState.hasRoom()) {
            out.println("{\"error\":\"Room not created yet.\"}");
            return;
        }
        roomState.decrementPeople();
        out.println("{\"message\":\"Room left successfully.\"}");
    }
}
