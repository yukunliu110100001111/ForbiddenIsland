package Game.ForbiddenIsland.WebReceiveServlet;

import Game.ForbiddenIsland.controller.GameController;
import Game.ForbiddenIsland.controller.PlayerController;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.TreasureType;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

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

            case "player_action": {
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

            // allocate number to player
            case "get_player_num": {
                out.println("{\"players\": " + currentPeopleCount + ", \"max\": " + maxPeopleCount + "}");
                break;
            }

            case "useSpecialAbility": {
                gameController.useSpecialAbility(gameController.getCurrentPlayer());
                break;
            }

            // Update everything to frontend
            case "update_element": {
                GameState state = gameController.getGameState();
                StringBuilder json = new StringBuilder();
                json.append("{");

                // Tiles
                json.append("\"tiles\":[");
                for (Tile tile : state.getMap().getAllTiles()) {
                    json.append("{\"x\":").append(tile.getX())
                            .append(",\"y\":").append(tile.getY())
                            .append(",\"treasureType\":\"").append(tile.getTreasureType()).append("\"")
                            .append(",\"isFoolsLanding\":").append(tile.isFoolsLanding())
                            .append(",\"tileState\":\"").append(tile.getState()).append("\"},");
                }
                if (json.charAt(json.length() - 1) == ',') json.setLength(json.length() - 1);
                json.append("],");

                // Players
                json.append("\"players\":[");
                for (Player p : state.getPlayers()) {
                    json.append("{\"x\":").append(p.getPosition().getX())
                            .append(",\"y\":").append(p.getPosition().getY())
                            .append(",\"type\":\"").append(p.getType()).append("\"")
                            .append(",\"color\":\"").append(p.getColor()).append("\"},");
                }
                if (json.charAt(json.length() - 1) == ',') json.setLength(json.length() - 1);
                json.append("],");

                // Current Player
                Player curr = state.getCurrentPlayer();
                json.append("\"currentPlayer\":{");
                json.append("\"x\":").append(curr.getPosition().getX())
                        .append(",\"y\":").append(curr.getPosition().getY())
                        .append(",\"type\":\"").append(curr.getType()).append("\"")
                        .append(",\"color\":\"").append(curr.getColor()).append("\"")
                        .append(",\"actionRemain\":").append(gameController.getActionsRemaining())
                        .append(",\"hand\":[");
                for (Card card : curr.getHands()) {
                    json.append("{\"id\":").append(card.getCardId())
                            .append(",\"name\":\"").append(card.getCardName())
                            .append(",\"type\":\"").append(card.getCardType()).append("\"},");
                }
                if (json.charAt(json.length() - 1) == ',') json.setLength(json.length() - 1);
                json.append("]},");

                // Treasure Collected
                Map<TreasureType, Boolean> treasureCollected = state.getCollectedTreasures();
                json.append("\"treasureCollected\":[");
                for (Map.Entry<TreasureType, Boolean> entry : treasureCollected.entrySet()) {
                    json.append("[")
                            .append("{\"type\":").append(entry.getKey()).append("}")
                            .append("{\"isGet\":").append(entry.getValue()).append("}");
                }
                json.append("],");

                // Water Level
                json.append("\"currentWaterLevel\":{").append(state.getWaterLevel()).append("},");

                // Is Game Over
                json.append("\"isGameWon\":{").append(state.isGameWon()).append("},");
                json.append("\"isGameLost\":{").append(state.isGameLost()).append("},");

                // Game Result?
                json.append("\"gameResult\":{").append(gameController.getGameResult()).append("}");

                json.append("}");
                out.println(json);
                break;
            }

            default: {
                out.println("{\"error\": \"Unknown type: " + type + "\"}");
                break;
            }
        }
    }
}
