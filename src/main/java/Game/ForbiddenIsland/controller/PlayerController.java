package Game.ForbiddenIsland.controller;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.CardActions.Helicopter;
import Game.ForbiddenIsland.model.Cards.cardCategory.ActionCard;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.TreasureType;
import Game.ForbiddenIsland.util.ActionContext;

public class PlayerController {
    GameController  gameController;
    StringHandler stringHandler;
    public PlayerController(GameController gameController)
    {
        this.gameController = gameController;
    }
    private ActionContext HandleStrng(String str){
        return stringHandler.HandleStrng(str);
    }
    public boolean movePlayer(ActionContext actionContext)
    {
        Player player = actionContext.getTargetPlayers().get(0);
        Tile targetTile = actionContext.getTargetTile();
        return gameController.movePlayer(player, targetTile);
    }
    public boolean shoreUp(ActionContext actionContext)
    {
        gameController.shoreUp(actionContext.getTargetTile());
        return true;
    }
    public boolean collectTreasure(ActionContext actionContext)
    {
        TreasureType treasureType = actionContext.getTreasureType();
        return  gameController.collectTreasure(gameController.getCurrentPlayer(), treasureType);
    }
    public boolean giveCard(ActionContext actionContext)
    {
        Player giver = actionContext.getTargetPlayers().get(0);
        Player receiver = actionContext.getTargetPlayers().get(1);
        Card card = actionContext.getTargetCard();
        return gameController.giveCard(giver, receiver, card);
    }
    public boolean useCard(ActionContext actionContext,ActionCard card)
    {
        card.use(gameController.getGameState(), actionContext);
        return true;
    }
}
