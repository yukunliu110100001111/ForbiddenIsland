package Game.ForbiddenIsland.WebReceiveServlet;

import Game.ForbiddenIsland.controller.GameController;
import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.Players.PlayerImp;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;

@WebServlet("/data")
public class WebReceiveServlet extends HttpServlet {


    int maxPeopleCount;
    int currentPeopleCount = 1;
    int difficultyLevel;
    boolean hasRoom = false;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        handleRequest(request, response, "GET1");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        handleRequest(request, response, "POST");
    }

    private void handleRequest(HttpServletRequest request, HttpServletResponse response, String method) throws IOException {
        response.setContentType("text/plain;charset=UTF-8");
        response.getWriter().println("Request Method: " + method);

        PrintWriter out = response.getWriter();

        String type = request.getParameter("type");
        switch (type) {
            case "creat_room": {
                // Case that room is created
                if (hasRoom) {
                    out.println("Room already created");
                    break;
                }
                hasRoom = true;

                difficultyLevel = Integer.parseInt(request.getParameter("hardLevel"));
                maxPeopleCount = Integer.parseInt(request.getParameter("playerNumber"));
                if (maxPeopleCount >4) {
                    out.println("Too many people");
                    break;
                }
                out.println("creat successfully");
                break;
            }
            case "change_map": {
                String mapType = request.getParameter("mapType");   // 地图相关算法未完善
                break;
            }
            case "join_room": {
                if (currentPeopleCount < maxPeopleCount) {
                    currentPeopleCount++;
                } else {
                    out.println("people full");
                }
                break;
            }
            case "start_game": {
                if (currentPeopleCount == maxPeopleCount) {
                    GameController gameController = new GameController(maxPeopleCount,difficultyLevel);
                } else {
                    out.println("people doesn't full");
                }
                break;
            }
            default: {
                break;
            }
        }
    }
}
