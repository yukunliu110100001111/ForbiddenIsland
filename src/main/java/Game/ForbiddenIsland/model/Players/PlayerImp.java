package Game.ForbiddenIsland.model.Players;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;

import java.util.List;

//This class is the player model, contain the player type, position, and hands
public class PlayerImp implements Player{
    //This method is an action that the player can do
    private PlayerType type;
    private Tile position;
    private List<Card> hands;
    private int handsSize = 5;
    public PlayerImp(PlayerType type, Tile position, List<Card> hands) {
        this.type = type;
        this.position = position;
        this.hands = hands;
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

    public int getHandsSize() {
        return handsSize;
    }

    public void removeCard(Card card){
        this.hands.remove(card);
    }
    public void addCard(Card card){
        this.hands.add(card);
    }

}
