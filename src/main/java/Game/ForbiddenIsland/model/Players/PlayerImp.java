package Game.ForbiddenIsland.model.Players;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;

//This class is the player model, contain the player type, position, and hands
public class PlayerImp implements Player{
    //This method is an action that the player can do
    private PlayerType type;
    private Tile position;
    private List<Card> hands;
    private Color color;
    public PlayerImp(PlayerType type) {
        this.type = type;
        this.position = null;
        this.hands = new ArrayList<Card>();
    }

    public PlayerImp() {

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

    public void removeCard(Card card){
        this.hands.remove(card);
    }

    public void addCard(Card card){
        this.hands.add(card);
    }

    public Color getColor() {
        return color;
    }

    public void setColor(Color color) {
        this.color = color;
    }


}

