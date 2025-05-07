package Game.ForbiddenIsland.model.Cards.cardCategory;

import Game.ForbiddenIsland.util.ActionContext;
import Game.ForbiddenIsland.model.Cards.CardActions.CardAction;
import Game.ForbiddenIsland.model.Cards.CardName;
import Game.ForbiddenIsland.model.Cards.CardType;
import Game.ForbiddenIsland.model.GameState;

public class ActionCard extends Card {
    CardAction action;

    public ActionCard(CardName name, CardType cardType, CardAction action) {
        super(name, cardType);
        this.action = action;
    }

    public void use(GameState gameState, ActionContext context) {
        this.action.execute(gameState, context);
    }
}