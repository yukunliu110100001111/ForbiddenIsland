package Game.ForbiddenIsland.util;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.Players.PlayerChoice;
import Game.ForbiddenIsland.model.TreasureType;

import java.util.List;

//  ActionContext class, which contains the context information for an action
public class ActionContext {
    private final PlayerChoice playerChoice;
    private final List<Player> targetPlayers;
    private final Tile targetTile;
    private final Card targetCard;
    private final TreasureType treasureType;

    private ActionContext(Builder builder) {
        this.playerChoice = builder.playerChoice;
        this.targetPlayers = builder.targetPlayers;
        this.targetTile = builder.targetTile;
        this.targetCard = builder.targetCard;
        this.treasureType = builder.treasureType;
    }
    public PlayerChoice getPlayerChoice() {
        return playerChoice;
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

    public TreasureType getTreasureType() {
        return treasureType;
    }

    // Builder class
    public static class Builder {
        private PlayerChoice playerChoice;
        private List<Player> targetPlayers;
        private Tile targetTile;
        private Card targetCard;
        private TreasureType treasureType;

        public Builder setPlayerChoice(PlayerChoice playerChoice) {
            this.playerChoice = playerChoice;
            return this;
        }
        public Builder setTargetPlayers(List<Player> players) {
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
        public Builder setTreasureType( TreasureType treasureType) {
            this.treasureType = treasureType;
            return this;
        }

        public ActionContext build() {
            return new ActionContext(this);
        }
    }
}
