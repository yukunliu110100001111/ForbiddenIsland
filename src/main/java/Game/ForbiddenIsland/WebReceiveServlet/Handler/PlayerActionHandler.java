package Game.ForbiddenIsland.WebReceiveServlet.Handler;

import Game.ForbiddenIsland.controller.GameController;
import Game.ForbiddenIsland.controller.PlayerController;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

public class PlayerActionHandler implements RequestHandler {

    @Override
    public void handle(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws IOException {
        ServletContext ctx = req.getServletContext();
        GameController gc = (GameController) ctx.getAttribute("gameController");
        PlayerController pc = (PlayerController) ctx.getAttribute("playerController");

        if (gc == null || pc == null) {
            out.println("{\"error\":\"Game not started.\"}");
            return;
        }

        StringBuilder sb = new StringBuilder();
        try (BufferedReader r = req.getReader()) {
            String line;
            while ((line = r.readLine()) != null) {
                sb.append(line);
            }
        }

        pc.receiveAndAllocate(sb.toString(),ctx);
        out.println("{\"message\":\"Action received.\"}");
    }
}
