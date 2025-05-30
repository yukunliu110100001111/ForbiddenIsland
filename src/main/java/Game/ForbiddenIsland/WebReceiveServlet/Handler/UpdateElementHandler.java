package Game.ForbiddenIsland.WebReceiveServlet.Handler;

import Game.ForbiddenIsland.controller.GameController;
import Game.ForbiddenIsland.model.ActionLogger;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;

public class UpdateElementHandler implements RequestHandler {

    @Override
    public void handle(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws IOException {
        HttpSession session = req.getSession();
        ServletContext ctx = req.getServletContext();
        GameController gc = (GameController) ctx.getAttribute("gameController");

        if (gc == null) {
            out.println("{\"error\":\"Game not started.\"}");
            return;
        }

        gc.initializeIfNeeded();

        Integer myIdx = (Integer) session.getAttribute("playerIndex");
        if (myIdx == null) myIdx = 0;

        ActionLogger logger = (ActionLogger) ctx.getAttribute("actionLogger");


        String logHtml = (logger != null) ? logger.getLogsAsHtml() : "";
        String gameJson = gc.getGameStateJson();
        int braceIdx = gameJson.indexOf('{');

        String result = braceIdx >= 0
                ? gameJson.substring(0, braceIdx + 1)
                + "\"myPlayerIndex\":" + myIdx + ",\"logs\":\"" + escape(logHtml) + "\","
                + gameJson.substring(braceIdx + 1)
                : "{\"myPlayerIndex\":" + myIdx + ",\"logs\":\"" + escape(logHtml) + "\"}";

        out.println(result);
    }
    private String escape(String input) {
        return input.replace("\"", "\\\"").replace("\n", "").replace("\r", "");
    }
}
