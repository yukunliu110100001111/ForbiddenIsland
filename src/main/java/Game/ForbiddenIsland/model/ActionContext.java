package Game.ForbiddenIsland.model;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.Players.PlayerImp;

import java.util.List;

public class ActionContext {
    private final List<PlayerImp> targetPlayers;
    private final Tile targetTile;
    private final Card targetCard;

    private ActionContext(Builder builder) {
        this.targetPlayers = builder.targetPlayers;
        this.targetTile = builder.targetTile;
        this.targetCard = builder.targetCard;
    }

    public List<PlayerImp> getTargetPlayers() {
        return targetPlayers;
    }

    public Tile getTargetTile() {
        return targetTile;
    }

    public Card getTargetCard() {
        return targetCard;
    }

    // Builder class
    public static class Builder {
        private List<PlayerImp> targetPlayers;
        private Tile targetTile;
        private Card targetCard;

        public Builder setTargetPlayers(List<PlayerImp> players) {
            this.targetPlayers = players;
            return this;
        }

        public Builder setTargetTile(Tile tile) {
            this.targetTile = tile;
            return this;
        }

        public Builder setTargetCard(Card card) {
            this.targetCard = card;
            return this;
        }

        public ActionContext build() {
            return new ActionContext(this);
        }
    }
}
