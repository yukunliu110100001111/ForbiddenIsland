package Game.ForbiddenIsland.model.Cards;

import Game.ForbiddenIsland.model.ActionContext;
import Game.ForbiddenIsland.model.Cards.Card;
import Game.ForbiddenIsland.model.Cards.CardActions.CardAction;
import Game.ForbiddenIsland.model.GameState;

public class ActionCard extends Card {
    CardAction action;
    public void use(GameState gameState, ActionContext context) {
        this.action.execute(gameState, context);
    }
}