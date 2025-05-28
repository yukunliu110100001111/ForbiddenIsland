package Game.ForbiddenIsland.WebReceiveServlet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.InputStream;

@WebServlet("/test-resource")
public class ResourceTestServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String file = req.getParameter("file");
        if (file == null) file = "model/map_layout_classical.json";
        InputStream in = getClass().getClassLoader().getResourceAsStream(file);
        if (in == null) {
            resp.setStatus(404);
            resp.getWriter().write("NOT FOUND");
        } else {
            resp.setContentType("application/json;charset=UTF-8");
            resp.getWriter().write(new String(in.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8));
        }
    }
}
