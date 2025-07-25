package Game.ForbiddenIsland.WebReceiveServlet.Handler;

import Game.ForbiddenIsland.controller.GameController;
import Game.ForbiddenIsland.controller.PlayerController;
import Game.ForbiddenIsland.model.ActionLogger;
import Game.ForbiddenIsland.model.RoomState;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;

public class StartGameHandler implements RequestHandler {

    private final RoomState roomState;

    public StartGameHandler(RoomState roomState) {
        this.roomState = roomState;
    }

    // create game controller and player controller and add it as an attributes of request
    @Override
    public void handle(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws IOException {
        if (roomState.getCurrentPeopleCount() < roomState.getMaxPeopleCount()) {
            out.println("{\"error\":\"Not enough players to start the game.\"}");
            return;
        }
        if (roomState.getReadyNumber() < roomState.getMaxPeopleCount()) {
            out.println("{\"error\":\"Not enough players are ready.\"}");
            return;
        }

        HttpSession session = req.getSession();
        Integer lvl = (Integer) session.getAttribute("difficultyLevel");
        Integer count = (Integer) session.getAttribute("maxPeopleCount");

        if (lvl == null || count == null) {
            out.println("{\"error\":\"Session missing parameters.\"}");
            return;
        }

        // prevent the room creator do not have playerIndex
        if (session.getAttribute("playerIndex") == null) {
            session.setAttribute("playerIndex", 0);
        }
        int myIdx = (Integer) session.getAttribute("playerIndex");

        GameController gc = new GameController(count, lvl);
        PlayerController pc = new PlayerController(gc);

        ServletContext ctx = req.getServletContext();
        ctx.setAttribute("gameController", gc);
        ctx.setAttribute("playerController", pc);
        ctx.setAttribute("actionLogger", new ActionLogger());

        out.println("{\"message\":\"Game started successfully.\",\"playerIndex\":" + myIdx + "}");
    }
}
