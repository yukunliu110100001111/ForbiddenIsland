package Game.ForbiddenIsland.model.Cards;

public class Card {
    CardName CardName;
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
