package Game.ForbiddenIsland.WebReceiveServlet.Handler;

import Game.ForbiddenIsland.controller.GameController;
import Game.ForbiddenIsland.controller.PlayerController;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.Handler;

public class DeckHandler implements RequestHandler {
    @Override
    public void handle(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws IOException {
        ServletContext ctx = req.getServletContext();
        GameController gc = (GameController) ctx.getAttribute("gameController");
        PlayerController pc = (PlayerController) ctx.getAttribute("playerController");

        if (gc == null || pc == null) {
            out.println("{\"error\":\"Game not started.\"}");
            return;
        }

        out.println("{\"treasure deck remaining\": " + gc.getGameState().getTreasureDeckRemaining() + "}");
        out.println("{\"flood deck remaining\": " +   gc.getGameState().getFloodDeckRemaining()+ "}");
    }
}
