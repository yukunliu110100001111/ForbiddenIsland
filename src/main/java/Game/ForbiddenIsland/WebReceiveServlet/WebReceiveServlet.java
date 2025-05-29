package Game.ForbiddenIsland.WebReceiveServlet;

import Game.ForbiddenIsland.controller.GameController;
import Game.ForbiddenIsland.controller.PlayerController;
import Game.ForbiddenIsland.model.GameState;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import com.alibaba.fastjson.JSON;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/data")
public class WebReceiveServlet extends HttpServlet {

    /* 只保留房间全局状态，不再把 GameController 放到 Servlet 字段 */
    private int maxPeopleCount;
    private int readyNumber;
    private int currentPeopleCount = 0;
    private int difficultyLevel;
    private boolean hasRoom   = false;

    @Override protected void doGet (HttpServletRequest  req,
                                    HttpServletResponse resp) throws IOException {
        handleRequest(req, resp);
    }
    @Override protected void doPost(HttpServletRequest  req,
                                    HttpServletResponse resp) throws IOException {
        handleRequest(req, resp);
    }

    /** 统一处理 */
    private void handleRequest(HttpServletRequest request,
                               HttpServletResponse response) throws IOException {

        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        String type = request.getParameter("type");
        if (type == null) {
            out.println("{\"error\":\"Missing request type.\"}");
            return;
        }

        try {
            switch (type) {

                /* ---------- 1. 创建房间：只保存参数 ---------- */
                case "create_room": {
                    if (hasRoom) {
                        out.println("{\"message\":\"Room already created.\"}");
                        break;
                    }

                    try {
                        difficultyLevel = Integer.parseInt(request.getParameter("hardLevel"));
                        maxPeopleCount  = Integer.parseInt(request.getParameter("playerNumber"));
                    } catch (Exception e) {
                        out.println("{\"error\":\"Invalid parameters.\"}");
                        return;
                    }
                    if (maxPeopleCount < 1 || maxPeopleCount > 4) {
                        out.println("{\"error\":\"Player number must be between 1 and 4.\"}");
                        break;
                    }

                    readyNumber         = 0;   // 房主默认 ready
                    currentPeopleCount  = 1;
                    hasRoom             = true;

                    HttpSession sess = request.getSession();
                    sess.setAttribute("difficultyLevel", difficultyLevel);
                    sess.setAttribute("maxPeopleCount",  maxPeopleCount);

                    out.println("{\"message\":\"Room created successfully.\"}");
                    break;
                }

                /* ---------- 2. 加入/退出/准备 ---------- */
                case "join_room": {
                    if (!hasRoom) { out.println("{\"error\":\"Room not created yet.\"}"); break; }
                    if (currentPeopleCount >= maxPeopleCount) {
                        out.println("{\"error\":\"Room is full.\"}");
                    } else {
                        currentPeopleCount++;
                        out.println("{\"message\":\"Player joined successfully.\",\"current\":"+currentPeopleCount+"}");
                    }
                    break;
                }
                case "exit_room": {
                    if (!hasRoom) { out.println("{\"error\":\"Room not created yet.\"}"); break; }
                    currentPeopleCount--;
                    out.println("{\"message\":\"Room left successfully.\"}");
                    break;
                }
                case "destroy_room": {
                    if (!hasRoom) { out.println("{\"error\":\"Room not created yet.\"}"); break; }
                    hasRoom            = false;
                    currentPeopleCount = 0;
                    readyNumber        = 0;
                    request.getSession().invalidate();     // 清空 session
                    out.println("{\"message\":\"Room destroyed successfully.\"}");
                    break;
                }
                case "is_ready":   readyNumber++; break;
                case "is_unready": readyNumber--; break;

                case "get_room_status": {
                    out.println("{\"players\":"+currentPeopleCount+","+
                            "\"max\":"+maxPeopleCount+","+
                            "\"ready\":"+readyNumber+"}");
                    break;
                }

                /* ---------- 3. start_game：此时才真正 new GameController 并初始化地图 ---------- */
                case "start_game": {
                    if (currentPeopleCount < maxPeopleCount) {
                        out.println("{\"error\":\"Not enough players to start the game.\"}");
                        break;
                    }
                    if (readyNumber < maxPeopleCount) {
                        out.println("{\"error\":\"Not enough players are ready.\"}");
                        break;
                    }

                    HttpSession sess = request.getSession();
                    Integer lvl   = (Integer) sess.getAttribute("difficultyLevel");
                    Integer count = (Integer) sess.getAttribute("maxPeopleCount");
                    if (lvl == null || count == null) {
                        out.println("{\"error\":\"Session missing parameters.\"}");
                        break;
                    }

                    // 只 new，**不要**调用 initializeIfNeeded()！
                    GameController gc = new GameController(count, lvl);
                    sess.setAttribute("gameController", gc);
                    sess.setAttribute("playerController", new PlayerController(gc));

                    out.println("{\"message\":\"Game started successfully.\"}");
                    break;
                }

                /* ---------- 4. in-game：玩家操作 ---------- */
                case "player_action": {
                    HttpSession sess = request.getSession();
                    GameController  gc = (GameController)  sess.getAttribute("gameController");
                    PlayerController pc = (PlayerController) sess.getAttribute("playerController");
                    if (gc == null || pc == null) {
                        out.println("{\"error\":\"Game not started.\"}");
                        break;
                    }

                    StringBuilder sb = new StringBuilder();
                    try (BufferedReader r = request.getReader()) {
                        String line; while ((line = r.readLine()) != null) sb.append(line);
                    }
                    pc.receiveAndAllocate(sb.toString());
                    out.println("{\"message\":\"Action received.\"}");
                    break;
                }

                /* ---------- 5. update_element：前端轮询游戏状态 ---------- */
                case "update_element": {
                    HttpSession sess = request.getSession();
                    GameController gc = (GameController) sess.getAttribute("gameController");
                    if (gc == null) {
                        out.println("{\"error\":\"Game not started.\"}");
                        break;
                    }

                    // 只需这行，不需要 isInitialized 判断
                    gc.initializeIfNeeded();
                    out.println(gc.getGameStateJson());
                    break;
                }



                /* ---------- 6. 其它 ---------- */
                case "useSpecialAbility": {
                    HttpSession sess = request.getSession();
                    GameController gc = (GameController) sess.getAttribute("gameController");
                    if (gc != null) {
                        gc.useSpecialAbility(gc.getCurrentPlayer());
                        out.println("{\"message\":\"Special ability used.\"}");
                    } else {
                        out.println("{\"error\":\"Game not started.\"}");
                    }
                    break;
                }

                case "get_player_num": {
                    out.println("{\"players\":"+currentPeopleCount+",\"max\":"+maxPeopleCount+"}");
                    break;
                }

                default:
                    out.println("{\"error\":\"Unknown type: "+type+"\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();  // 后台打印堆栈
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            String msg = e.getClass().getSimpleName()+": "+e.getMessage();
            msg = msg.replace("\"","\\\"");
            out.println("{\"error\":\"Internal server error: "+msg+"\"}");
        }
    }
}
