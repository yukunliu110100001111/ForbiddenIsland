package Game.ForbiddenIsland.WebReceiveServlet.Handler;

import Game.ForbiddenIsland.model.RoomState;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

public class ResetRoomHandler implements RequestHandler{

    private final RoomState roomState;

    public ResetRoomHandler(RoomState roomState) {
        this.roomState = roomState;
    }

    // Reset the room state(for testing)
    @Override
    public void handle(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws IOException {
        if (!roomState.hasRoom()) {
            out.println("{\"error\":\"Room not created yet.\"}");
            return;
        }

        String type= req.getParameter("type");
        switch (type) {
            case "reset": roomState.hasRoom = false;
            break;
        }
        out.println("{\"message\":\"Room destroyed successfully.\"}");
    }
}
