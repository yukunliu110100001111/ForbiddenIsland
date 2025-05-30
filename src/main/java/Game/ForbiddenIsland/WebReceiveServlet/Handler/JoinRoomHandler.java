package Game.ForbiddenIsland.WebReceiveServlet.Handler;

import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import Game.ForbiddenIsland.model.RoomState;

public class JoinRoomHandler implements RequestHandler {

    private final RoomState roomState;

    public JoinRoomHandler(RoomState roomState) {
        this.roomState = roomState;
    }

    @Override
    public void handle(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws IOException {
        if (!roomState.hasRoom()) {
            out.println("{\"error\":\"Room not created yet.\"}");
            return;
        }
        if (roomState.getCurrentPeopleCount() >= roomState.getMaxPeopleCount()) {
            out.println("{\"error\":\"Room is full.\"}");
            return;
        }

        roomState.incrementPeople();
        int assignedIndex = roomState.getCurrentPeopleCount() - 1;

        HttpSession sess = req.getSession();
        sess.setAttribute("playerIndex", assignedIndex);
        sess.setAttribute("difficultyLevel", roomState.getDifficultyLevel());
        sess.setAttribute("maxPeopleCount", roomState.getMaxPeopleCount());

        out.println("{"
                + "\"message\":\"Player joined successfully.\","
                + "\"current\":" + roomState.getCurrentPeopleCount() + ","
                + "\"playerIndex\":" + assignedIndex
                + "}");
    }
}
