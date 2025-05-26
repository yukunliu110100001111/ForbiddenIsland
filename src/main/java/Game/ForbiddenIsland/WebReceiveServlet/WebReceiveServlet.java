package Game.ForbiddenIsland.WebReceiveServlet;

import Game.ForbiddenIsland.controller.GameController;
import Game.ForbiddenIsland.controller.PlayerController;
import Game.ForbiddenIsland.model.GameState;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/data")
public class WebReceiveServlet extends HttpServlet {

    private GameController gameController;
    private PlayerController playerController;

    private int maxPeopleCount;
    private int currentPeopleCount = 0;
    private int difficultyLevel;
    private boolean hasRoom = false;
    private boolean gameStarted = false;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        handleRequest(request, response, "GET");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        handleRequest(request, response, "POST");
    }

    private void handleRequest(HttpServletRequest request, HttpServletResponse response, String method) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        String type = request.getParameter("type");
        if (type == null) {
            out.println("{\"error\": \"Missing request type.\"}");
            return;
        }

        switch (type) {
            case "create_room": {
                if (hasRoom) {
                    out.println("{\"message\": \"Room already created.\"}");
                    break;
                }
                try {
                    difficultyLevel = Integer.parseInt(request.getParameter("hardLevel"));
                    maxPeopleCount = Integer.parseInt(request.getParameter("playerNumber"));
                } catch (Exception e) {
                    out.println("{\"error\": \"Invalid parameters.\"}");
                    return;
                }

                if (maxPeopleCount > 4 || maxPeopleCount < 1) {
                    out.println("{\"error\": \"Player number must be between 1 and 4.\"}");
                    break;
                }

                hasRoom = true;
                currentPeopleCount = 1;
                out.println("{\"message\": \"Room created successfully.\"}");
                break;
            }

            case "join_room": {
                if (!hasRoom) {
                    out.println("{\"error\": \"Room not created yet.\"}");
                    break;
                }

                if (currentPeopleCount < maxPeopleCount) {
                    currentPeopleCount++;
                    out.println("{\"message\": \"Player joined successfully.\", \"current\": " + currentPeopleCount + "}");
                } else {
                    out.println("{\"error\": \"Room is full.\"}");
                }
                break;
            }

            case "start_game": {
                if (currentPeopleCount < maxPeopleCount) {
                    out.println("{\"error\": \"Not enough players to start the game.\"}");
                    break;
                }

                gameController = new GameController(maxPeopleCount, difficultyLevel);
                playerController = new PlayerController(gameController);
                gameController.startTurn();
                gameStarted = true;

                out.println("{\"message\": \"Game started successfully.\"}");
                break;
            }

            /*
            case "get_game_state": {
                if (!gameStarted || gameController == null) {
                    out.println("{\"error\": \"Game not started.\"}");
                    break;
                }

                String gameStateJson = gameController.getGameStateJson();
                out.println(gameStateJson);
                break;
            }

             */

            case "send_action": {
                if (!gameStarted || playerController == null) {
                    out.println("{\"error\": \"Game not started or controller unavailable.\"}");
                    break;
                }

                StringBuilder jsonBuilder = new StringBuilder();
                try (BufferedReader reader = request.getReader()) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        jsonBuilder.append(line);
                    }
                } catch (Exception e) {
                    out.println("{\"error\": \"Failed to read JSON input.\"}");
                    return;
                }

                String actionJson = jsonBuilder.toString();
                playerController.receiveAndAllocate(actionJson);
                out.println("{\"message\": \"Action received.\"}");
                break;
            }

            // 分配玩家number
            case "get_player_num": {
                out.println("{\"players\": " + currentPeopleCount + ", \"max\": " + maxPeopleCount + "}");
                break;
            }

            case "get_current_round": {
                out.println("{\"current\":"+gameController.getGameState().getCurrentPlayerIndex()+"}");
            }

            case "get_action_remaining": {

            }

            case "get_result": {

            }

            case "get_game_isOver": {

            }

            case "useSpecialAbility": {
                gameController.useSpecialAbility(gameController.getCurrentPlayer());
            }

            default: {
                out.println("{\"error\": \"Unknown type: " + type + "\"}");
                break;
            }
        }
    }
}
