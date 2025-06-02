package Game.ForbiddenIsland.model.Players;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;

import java.awt.*;
import java.util.List;

public interface Player {
    PlayerType getType();
    void setType(PlayerType type);

    Tile getPosition();
    void setPosition(Tile position);

    List<Card> getHands();
    void setHands(List<Card> hands);


    void addCard(Card card);
    void removeCard(Card card);

    Color getColor();
    void setColor(Color color);
}
