package Game.ForbiddenIsland.WebReceiveServlet;

import Game.ForbiddenIsland.WebReceiveServlet.Handler.*;
import Game.ForbiddenIsland.model.RoomState;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;

@WebServlet("/data")
public class WebReceiveServlet extends HttpServlet {

    // This map can get and use different "handle" function in class according to different keys
    private final RoomState roomState = new RoomState();
    private final HashMap<String, RequestHandler> handlerMap = new HashMap<>();


    // all class and functions
    @Override
    public void init() {
        handlerMap.put("create_room", new CreateRoomHandler(roomState));
        handlerMap.put("join_room", new JoinRoomHandler(roomState));
        handlerMap.put("exit_room", new ExitRoomHandler(roomState));
        handlerMap.put("destroy_room", new DestroyRoomHandler(roomState));
        handlerMap.put("start_game", new StartGameHandler(roomState));
        handlerMap.put("player_action", new PlayerActionHandler());
        handlerMap.put("update_element", new UpdateElementHandler());
        handlerMap.put("useSpecialAbility", new UseSpecialAbilityHandler());
        handlerMap.put("get_player_num", new GetPlayerNumHandler(roomState));
        handlerMap.put("get_room_status", new GetRoomStatusHandler(roomState));
        handlerMap.put("is_ready", new ReadyHandler(roomState, true));
        handlerMap.put("is_unready", new ReadyHandler(roomState, false));
        handlerMap.put("log_history", new LogHistoryHandler(roomState));
        handlerMap.put("DeckHandler", new DeckHandler());
        handlerMap.put("reset_room", new ResetRoomHandler(roomState));
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        dispatch(req, resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        dispatch(req, resp);
    }

    // use functions
    private void dispatch(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String type = req.getParameter("type");
        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        if (type == null || !handlerMap.containsKey(type)) {
            out.println("{\"error\":\"Unknown or missing type: " + type + "\"}");
            return;
        }

        try {
            handlerMap.get(type).handle(req, resp, out);
        } catch (Exception e) {
            e.printStackTrace();
            out.println("{\"error\":\"Internal server error: " + e.getMessage() + "\"}");
        }
    }
}
