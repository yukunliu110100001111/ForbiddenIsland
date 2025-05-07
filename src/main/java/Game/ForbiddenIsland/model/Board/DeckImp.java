package Game.ForbiddenIsland.model.Board;

import Game.ForbiddenIsland.model.Cards.cardCategory.Card;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class DeckImp implements Deck{
    private final List<Card> drawPile = new ArrayList<>();
    private final List<Card> discardPile = new ArrayList<>();
    public void initialize(List<Card> initialCards) {
        drawPile.clear();
        discardPile.clear();
        drawPile.addAll(initialCards);
        shufflePile(drawPile);
    }
    //Draw one card from the head of the draw pile
    public Card drawCard() {
        if (drawPile.isEmpty()) {
            reshuffleDiscardsIntoDrawPile();
        }

        if (!drawPile.isEmpty()) {
            return drawPile.remove(0);
        }

        return null;
    }
    //shuffle the DrawPile
    private void shufflePile(List<Card> Pile) {
        Collections.shuffle(Pile);
    }

    // Discard a card into the discard pile
    public void discard(Card card) {
        if (card != null) {
            discardPile.add(card);
        }
    }

    // Move all discard cards back into the draw pile and shuffle
    public void reshuffleDiscardsIntoDrawPile() {
        shufflePile(discardPile);
        drawPile.addAll(0,discardPile);
        discardPile.clear();
    }

}
