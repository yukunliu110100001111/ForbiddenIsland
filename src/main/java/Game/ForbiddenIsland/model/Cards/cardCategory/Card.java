package Game.ForbiddenIsland.model.Cards.cardCategory;

import Game.ForbiddenIsland.model.Cards.CardName;
import Game.ForbiddenIsland.model.Cards.CardType;

//This is an abstract of card class, every card has a name and a type
public class Card {
    Game.ForbiddenIsland.model.Cards.CardName CardName;
    CardType cardType;
    public Card(CardName name, CardType cardType) {
        this.CardName = name;
        this.cardType = cardType;
    }

    public CardName getCardName() {
        return CardName;
    }
    public CardType getCardType() {
        return cardType;
    }
}
