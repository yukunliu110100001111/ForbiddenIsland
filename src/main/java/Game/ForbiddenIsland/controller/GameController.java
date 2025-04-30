package Game.ForbiddenIsland.controller;

import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.Players.PlayerType;
import Game.ForbiddenIsland.util.factory.PlayerFactory;

import java.util.ArrayList;
import java.util.List;

public class GameController {
    private GameState gameState;
    private int currentPlayerIndex = 0;

    public GameController(int playerCount, int difficultyLevel) {
        //this.gameState = new GameState();
        initializePlayers(playerCount);
        initializeBoard();
        initializeWaterLevel(difficultyLevel);
    }

    private void initializePlayers(int playerCount) {
        List<Player> players = new ArrayList<>();
        PlayerType[] availableTypes = PlayerType.values();
        for (int i = 0; i < playerCount; i++) {
            PlayerType type = availableTypes[i % availableTypes.length];
            Player player = PlayerFactory.createPlayer(type);
            players.add(player);
        }
        gameState.setPlayers(players);
    }

    private void initializeBoard() {

    }

    private void initializeWaterLevel(int difficultyLevel) {
        gameState.setWaterLevel(difficultyLevel);
    }

    public Player getCurrentPlayer() {
        return gameState.getPlayers().get(currentPlayerIndex);
    }

    public void nextTurn() {
        currentPlayerIndex = (currentPlayerIndex + 1) % gameState.getPlayers().size();
    }

    public GameState getGameState() {
        return gameState;
    }
}
