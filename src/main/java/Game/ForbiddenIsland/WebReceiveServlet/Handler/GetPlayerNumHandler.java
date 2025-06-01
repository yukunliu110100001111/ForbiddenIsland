package Game.ForbiddenIsland.WebReceiveServlet.Handler;

import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import Game.ForbiddenIsland.model.RoomState;

public class GetPlayerNumHandler implements RequestHandler {

    private final RoomState roomState;

    public GetPlayerNumHandler(RoomState roomState) {
        this.roomState = roomState;
    }

    // allocate number to player
    @Override
    public void handle(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws IOException {
        out.println("{\"players\":" + roomState.getCurrentPeopleCount()
                + ",\"max\":" + roomState.getMaxPeopleCount() + "}");
    }
}
