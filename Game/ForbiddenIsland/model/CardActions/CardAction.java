package Game.ForbiddenIsland.model.CardActions;

import Game.ForbiddenIsland.model.GameState;

public interface CardAction {
    void execute(GameState gameState);
}
