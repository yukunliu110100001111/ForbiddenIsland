package Game.ForbiddenIsland.util;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.view.GameStateView;
import Game.ForbiddenIsland.model.view.PlayerView;
import Game.ForbiddenIsland.model.view.TileView;

import java.util.ArrayList;
import java.util.List;

public class GameStateMapper {
    public static TileView fromTile(Tile tile) {
        if (tile == null) return null;
        TileView view = new TileView();
        view.setName(tile.getName());
        view.setFoolsLanding(tile.isFoolsLanding());
        view.setX(tile.getX());
        view.setY(tile.getY());
        view.setState(tile.getState().name());
        view.setTreasureType(tile.getTreasureType());
        return view;
    }

    public static GameStateView fromGameState(GameState state) {
        GameStateView view = new GameStateView();

        view.setWaterLevel(state.getWaterLevel());
        view.setCurrentPlayerIndex(state.getPlayers().indexOf(state.getCurrentPlayer()));

        // 转换地图
        Tile[][] srcBoard = state.getMap().getBoard();
        int w = srcBoard.length, h = srcBoard[0].length;
        TileView[][] board = new TileView[w][h];
        for (int i = 0; i < w; i++) {
            for (int j = 0; j < h; j++) {
                if (srcBoard[i][j] != null)
                    board[i][j] = fromTile(srcBoard[i][j]);
            }
        }
        view.setBoard(board);

        view.setCollectedTreasures(state.getCollectedTreasures());

        // 转换玩家列表
        List<Player> players = state.getPlayers();
        List<PlayerView> playerViews = new ArrayList<>();

        for (int i = 0; i < players.size(); i++) {
            Player p = players.get(i);
            PlayerView pv = new PlayerView();

            pv.setPlayerIndex(i);
            pv.setType(p.getType());
            pv.setCurrentTile(p.getPosition());
            pv.setHand(p.getHands());

            playerViews.add(pv);
        }

        view.setPlayers(playerViews);
        view.setCurrentPlayerIndex(state.getCurrentPlayerIndex()); // index-based

        // 获取两个弃牌堆（你需要在 DeckImp 中添加 getDiscardPile 方法）
        view.setTreasureDiscardPile(state.getTreasureDeck().getDiscardPile());
        view.setFloodDiscardPile(state.getFloodDeck().getDiscardPile());

        return view;
    }
}
