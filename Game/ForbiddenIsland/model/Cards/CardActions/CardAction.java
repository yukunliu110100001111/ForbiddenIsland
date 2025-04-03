package Game.ForbiddenIsland.model.Cards.CardActions;

import Game.ForbiddenIsland.model.ActionContext;
import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.model.Players.Player;

public interface CardAction {
    void execute(GameState gameState, ActionContext context);
}
