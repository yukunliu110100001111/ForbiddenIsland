package Game.ForbiddenIsland.model.Cards.cardCategory;

import Game.ForbiddenIsland.model.Cards.CardName;
import Game.ForbiddenIsland.model.Cards.CardType;
import lombok.Getter;
import lombok.Setter;

//This is an abstract of card class, every card has a name and a type
@Getter
@Setter
public class Card {
    int cardId;
    CardName cardName;
    CardType cardType;
    public Card(CardName name, CardType cardType) {
        this.cardName = name;
        this.cardType = cardType;
    }

}
