package Game.ForbiddenIsland.controller;

import Game.ForbiddenIsland.model.*;
import Game.ForbiddenIsland.factory.PlayerFactory;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.Players.PlayerType;

import java.util.ArrayList;
import java.util.List;

public class GameController {
    private GameState gameState;
    private int currentPlayerIndex = 0;

    public GameController(int playerCount, int difficultyLevel) {
        this.gameState = new GameState();
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
        // 简单示例：创建 24 个 Tile 并设为 SAFE
        List<Tile> board = new ArrayList<>();
        for (int i = 0; i < 24; i++) {
            board.add(new SimpleTile()); // 你需要有一个 SimpleTile 实现类
        }
        gameState.setBoard(board);
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
