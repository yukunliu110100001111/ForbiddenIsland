package Game.ForbiddenIsland.model.Cards.CardActions;

import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.util.ActionContext;

public class Helicopter implements CardAction {
    @Override
    public void execute(GameState gameState, ActionContext context) {
        Player player = context.getTargetPlayers().get(1);
        player.setPosition(context.getTargetTile());
    }
}
