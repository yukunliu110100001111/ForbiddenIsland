package Game.ForbiddenIsland.WebReceiveServlet.Handler;

import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import Game.ForbiddenIsland.model.RoomState;

public class DestroyRoomHandler implements RequestHandler {

    private final RoomState roomState;

    public DestroyRoomHandler(RoomState roomState) {
        this.roomState = roomState;
    }

    // Clear the session and reset the room when the room creator exit the room
    @Override
    public void handle(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws IOException {
        if (!roomState.hasRoom()) {
            out.println("{\"error\":\"Room not created yet.\"}");
            return;
        }

        roomState.reset();
        req.getSession().invalidate();
        out.println("{\"message\":\"Room destroyed successfully.\"}");
    }
}
