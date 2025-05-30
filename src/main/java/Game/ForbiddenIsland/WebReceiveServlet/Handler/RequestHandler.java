package Game.ForbiddenIsland.WebReceiveServlet.Handler;

import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;

public interface RequestHandler {
    void handle(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws IOException;
}
