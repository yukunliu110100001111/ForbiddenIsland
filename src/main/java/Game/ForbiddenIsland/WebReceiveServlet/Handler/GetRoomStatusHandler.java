package Game.ForbiddenIsland.WebReceiveServlet.Handler;

import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import Game.ForbiddenIsland.model.RoomState;

public class GetRoomStatusHandler implements RequestHandler {

    private final RoomState roomState;

    public GetRoomStatusHandler(RoomState roomState) {
        this.roomState = roomState;
    }

    // return number of ready people and current people to decide whether room can be started
    @Override
    public void handle(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws IOException {
        out.println("{\"players\":" + roomState.getCurrentPeopleCount()
                + ",\"max\":" + roomState.getMaxPeopleCount()
                + ",\"ready\":" + roomState.getReadyNumber() + "}");
    }
}
