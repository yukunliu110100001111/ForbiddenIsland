package Game.ForbiddenIsland.model.Board;

import Game.ForbiddenIsland.model.Cards.cardCategory.Card;

import java.util.List;

public interface Deck<T extends Card> {
    //this class is used to manage the cards in the deck
    void initialize(List<T> initialCards);
    T drawCard();
    void discard(T card);
    void reshuffleDiscardsIntoDrawPile();
}
