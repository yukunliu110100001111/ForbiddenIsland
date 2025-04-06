package Game.ForbiddenIsland.model;


import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.Players.Player;

import java.util.List;

public class ActionContext {
    private List<Player> targetPlayers;
    private Tile targetTile;
    private Card targetCard;


    public ActionContext(Tile targetTile) {
        this.targetTile = targetTile;
    }
    public ActionContext(Card targetCard) {
        this.targetCard = targetCard;
    }
    public ActionContext(List<Player> players) {
        this.targetPlayers = players;
    }

    public ActionContext(List<Player> players, Tile tile) {
        this.targetPlayers = players;
        this.targetTile = tile;
    }

    public ActionContext(List<Player> targetPlayers, Tile targetTile, Card targetCard) {
        this.targetPlayers = targetPlayers;
        this.targetTile = targetTile;
        this.targetCard = targetCard;
    }

    public List<Player> getTargetPlayers() {
        return targetPlayers;
    }

    public Tile getTargetTile() {
        return targetTile;
    }

    public Card getTargetCard() {
        return targetCard;
    }
}