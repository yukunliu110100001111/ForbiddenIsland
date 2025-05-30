package Game.ForbiddenIsland.WebReceiveServlet1234;

import Game.ForbiddenIsland.controller.GameController;
import Game.ForbiddenIsland.controller.PlayerController;
import jakarta.servlet.ServletContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

/// //////////////////////////////////////////
@WebServlet("/dataTEST")
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
                    if (!hasRoom) {
                        out.println("{\"error\":\"Room not created yet.\"}");
                        break;
                    }
                    if (currentPeopleCount >= maxPeopleCount) {
                        out.println("{\"error\":\"Room is full.\"}");
                    } else {
                        currentPeopleCount++;
                        // 计算并保存本次加入玩家的索引（从 0 开始）
                        HttpSession sess = request.getSession();
                        int assignedIndex = currentPeopleCount - 1;
                        sess.setAttribute("playerIndex", assignedIndex);
                        sess.setAttribute("difficultyLevel", this.difficultyLevel);
                        sess.setAttribute("maxPeopleCount",  this.maxPeopleCount);
                        System.out.println("Session " + sess.getId() + " has playerIndex=" + sess.getAttribute("playerIndex"));

                        // 返回当前人数和分配给前端的 playerIndex
                        out.println("{"
                                + "\"message\":\"Player joined successfully.\","
                                + "\"current\":" + currentPeopleCount + ","
                                + "\"playerIndex\":" + assignedIndex
                                + "}");
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
                    System.out.println("Session " + sess.getId() + " has playerIndex=" + sess.getAttribute("playerIndex"));

                    if (lvl == null || count == null) {
                        out.println("{\"error\":\"Session missing parameters.\"}");
                        break;
                    }

                    // 确保房主也有 playerIndex，默认 0
                    if (sess.getAttribute("playerIndex") == null) {
                        sess.setAttribute("playerIndex", 0);
                    }
                    int myIdx = (Integer) sess.getAttribute("playerIndex");

                    // **改动：把 GameController 放到应用级别，而不是 Session**
                    GameController gc = new GameController(count, lvl);
                    ServletContext ctx = request.getServletContext();
                    ctx.setAttribute("gameController", gc);
                    ctx.setAttribute("playerController", new PlayerController(gc));

                    // 返回时仍然告诉前端它自己的 playerIndex
                    out.println("{\"message\":\"Game started successfully.\",\"playerIndex\":" + myIdx + "}");
                    break;
                }




                /* ---------- 4. in-game：玩家操作 ---------- */
                case "player_action": {
                    HttpSession sess = request.getSession();
                    ServletContext ctx = request.getServletContext();
                    GameController  gc = (GameController)  ctx.getAttribute("gameController");
                    PlayerController pc = (PlayerController) ctx.getAttribute("playerController");
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
                    ServletContext ctx = request.getServletContext();
                    GameController gc = (GameController) ctx.getAttribute("gameController");
                    if (gc == null) {
                        out.println("{\"error\":\"Game not started.\"}");
                        break;
                    }

                    // 确保游戏数据已初始化
                    gc.initializeIfNeeded();

                    // 获取当前 session 的玩家索引
                    Integer myIdx = (Integer) sess.getAttribute("playerIndex");
                    if (myIdx == null) {
                        // 如果没有，说明是非法访问或未正常 join_room，默认兜底 0
                        myIdx = 0;
                    }

                    // 获取游戏状态 JSON
                    String gsJson = gc.getGameStateJson();

                    // 在最外层插入 myPlayerIndex 字段（防止多次插入/空对象兼容性更好）
                    String withMine;
                    int braceIdx = gsJson.indexOf('{');
                    if (braceIdx >= 0) {
                        withMine = gsJson.substring(0, braceIdx + 1)
                                + "\"myPlayerIndex\":" + myIdx + ","
                                + gsJson.substring(braceIdx + 1);
                    } else {
                        // 绝不会发生，除非代码出错
                        withMine = "{\"myPlayerIndex\":" + myIdx + "}";
                    }

                    out.println(withMine);
                    break;
                }

                case "reset_game": {
                    // 从 session 或全局 context 里取出原来的玩家数和难度
                    HttpSession sess = request.getSession();
                    Integer lvl   = (Integer) sess.getAttribute("difficultyLevel");
                    Integer cnt   = (Integer) sess.getAttribute("maxPeopleCount");
                    if (lvl == null || cnt == null) {
                        out.println("{\"error\":\"Session parameters missing, cannot reset.\"}");
                        break;
                    }
                    // 重建 GameController，并覆盖全局 context
                    GameController newGc = new GameController(cnt, lvl);
                    ServletContext ctx = request.getServletContext();
                    ctx.setAttribute("gameController", newGc);
                    ctx.setAttribute("playerController", new PlayerController(newGc));
                    // 返回 ok
                    out.println("{\"message\":\"Game has been reset.\"}");
                    break;
                }



                /* ---------- 6. 其它 ---------- */
                case "useSpecialAbility": {
                    ServletContext ctx = request.getServletContext();
                    GameController gc = (GameController) ctx.getAttribute("gameController");
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
