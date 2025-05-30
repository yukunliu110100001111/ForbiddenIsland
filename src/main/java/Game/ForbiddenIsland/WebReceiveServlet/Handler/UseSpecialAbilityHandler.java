package Game.ForbiddenIsland.WebReceiveServlet.Handler;

import Game.ForbiddenIsland.controller.GameController;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;

public class UseSpecialAbilityHandler implements RequestHandler {

    @Override
    public void handle(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws IOException {
        ServletContext ctx = req.getServletContext();
        GameController gc = (GameController) ctx.getAttribute("gameController");

        if (gc == null) {
            out.println("{\"error\":\"Game not started.\"}");
        } else {
            gc.useSpecialAbility(gc.getCurrentPlayer());
            out.println("{\"message\":\"Special ability used.\"}");
        }
    }
}
