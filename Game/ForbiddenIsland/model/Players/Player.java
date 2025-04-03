package Game.ForbiddenIsland.model.Players;

import Game.ForbiddenIsland.model.Cards.Card;
import Game.ForbiddenIsland.model.Players.PlayerActions.PlayerAction;
import Game.ForbiddenIsland.model.Tile;

import java.util.List;

public class Player {
    //This method is an action that the player can do
    private final PlayerAction action;
    private PlayerType type;
    private Tile position;
    private List<Card> hands;
    public Player(PlayerType type, Tile position, List<Card> hands, PlayerAction action) {
        this.type = type;
        this.position = position;
        this.hands = hands;
        this.action = action;
    }

    public PlayerAction getAction() {
        return action;
    }
    public PlayerType getType() {
        return type;
    }
    public void setType(PlayerType type) {
        this.type = type;
    }
    public Tile getPosition() {
        return position;
    }
    public void setPosition(Tile position) {
        this.position = position;
    }
    public List<Card> getHands() {
        return hands;
    }
    public void setHands(List<Card> hands) {
        this.hands = hands;
    }
}
