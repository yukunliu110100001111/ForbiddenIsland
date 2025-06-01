package Game.ForbiddenIsland.WebReceiveServlet.Handler;

import Game.ForbiddenIsland.model.RoomState;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;

public class CreateRoomHandler implements RequestHandler {

    private final RoomState roomState;

    public CreateRoomHandler(RoomState roomState) {
        this.roomState = roomState;
    }

    // Create session for the room creator and create room
    @Override
    public void handle(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws IOException {
        if (roomState.hasRoom()) {
            out.println("{\"message\":\"Room already created.\"}");
            return;
        }

        try {
            int difficultyLevel = Integer.parseInt(req.getParameter("hardLevel"));
            int maxPeopleCount = Integer.parseInt(req.getParameter("playerNumber"));

            if (maxPeopleCount < 1 || maxPeopleCount > 4) {
                out.println("{\"error\":\"Player number must be between 1 and 4.\"}");
                return;
            }

            roomState.createRoom(difficultyLevel, maxPeopleCount);

            HttpSession session = req.getSession();
            session.setAttribute("difficultyLevel", difficultyLevel);
            session.setAttribute("maxPeopleCount", maxPeopleCount);

            out.println("{\"message\":\"Room created successfully.\"}");

        } catch (Exception e) {
            out.println("{\"error\":\"Invalid parameters.\"}");
        }
    }
}
