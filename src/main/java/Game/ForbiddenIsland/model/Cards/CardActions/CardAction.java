package Game.ForbiddenIsland.model.Cards.CardActions;

import Game.ForbiddenIsland.util.ActionContext;
import Game.ForbiddenIsland.model.GameState;


//This interface extract the common behaviour of all the card actions
public interface CardAction {
    void execute(GameState gameState, ActionContext context);
}
