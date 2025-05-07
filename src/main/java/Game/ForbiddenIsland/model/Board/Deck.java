package Game.ForbiddenIsland.model.Board;

import Game.ForbiddenIsland.model.Cards.cardCategory.Card;

import java.util.List;

public interface Deck {
    void initialize(List<Card> initialCards);
    Card drawCard();
    void discard(Card card);
    void reshuffleDiscardsIntoDrawPile();
}
