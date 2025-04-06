package Game.ForbiddenIsland.model.Cards.cardCategory;

import Game.ForbiddenIsland.model.ActionContext;
import Game.ForbiddenIsland.model.Cards.CardActions.CardAction;
import Game.ForbiddenIsland.model.Cards.CardType;
import Game.ForbiddenIsland.model.GameState;

public class ActionCard extends Card {
    CardAction action;

    public ActionCard(Game.ForbiddenIsland.model.Cards.CardName name, CardType cardType, CardAction action) {
        super(name, cardType);
        this.action = action;
    }

    public void use(GameState gameState, ActionContext context) {
        this.action.execute(gameState, context);
    }
}