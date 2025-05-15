package Game.ForbiddenIsland.model.Cards.cardCategory;

import Game.ForbiddenIsland.model.Cards.CardName;
import Game.ForbiddenIsland.model.Cards.CardType;

//This is an abstract of card class, every card has a name and a type
public class Card {
    int cardId;
    CardName cardName;
    CardType cardType;
    public Card(int id,CardName name, CardType cardType) {
        this.cardId = id;
        this.cardName = name;
        this.cardType = cardType;
    }

    public int getCardId() {
        return cardId;
    }
    public CardName getCardName() {
        return cardName;
    }
    public CardType getCardType() {
        return cardType;
    }
}
