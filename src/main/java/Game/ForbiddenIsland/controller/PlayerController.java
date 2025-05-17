package Game.ForbiddenIsland.controller;

import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.cardCategory.ActionCard;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.Players.PlayerChoice;
import Game.ForbiddenIsland.model.TreasureType;
import Game.ForbiddenIsland.util.ActionContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

public class PlayerController {
    GameController  gameController;

    public PlayerController(GameController gameController)
    {
        this.gameController = gameController;
    }
    public void receiveAndAllocate (String json)
    {
        ActionContext actionContext = parseJsonToActionContext(json);
        switch (actionContext.getPlayerChoice()){
            case MOVE:
                movePlayer(actionContext);
                break;
            case SHORE_UP:
                shoreUp(actionContext);
                break;
            case COLLECT_TREASURE:
                collectTreasure(actionContext);
                break;
            case GIVE_CARD:
                giveCard(actionContext);
                break;
            case USE_CARD:
                useCard(actionContext);
                break;
            case END_TURN:
                endTurn();
        }
    }
    public ActionContext parseJsonToActionContext(String json) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            JsonNode root = mapper.readTree(json);
            //  0. Choice
            PlayerChoice choice = PlayerChoice.valueOf(root.get("playerChoice").asText());
            // 1. Players. the 0 position will be the player who start the action
            List<Player> players = new ArrayList<>();
            for (JsonNode nameNode : root.get("targetPlayers")) {
                Player p = gameController.getGameState().findPlayerByName(nameNode.asInt());
                if (p != null) players.add(p);
            }

            // 2. Tile
            String string = root.get("targetTile").asText();
            Tile tile;
            if (!string.equals("null")) {
                String[] parts = string.split(",");
                int x = Integer.parseInt(parts[0].trim());
                int y = Integer.parseInt(parts[1].trim());
                tile = gameController.getGameState().getTileAt(x, y);
            } else tile = null;

            // 3. Card
            Card card;
            if (!string.equals("null")) {
                card = gameController.getGameState().getCardById(root.get("targetCard").asInt());
            } else card = null;
            // 4. TreasureType
            TreasureType treasureType;
            if (root.get("treasureType") == null) {
                treasureType = null;
            } else {
                treasureType = TreasureType.valueOf(root.get("treasureType").asText());
            }

            return new ActionContext.Builder()
                    .setPlayerChoice(choice)
                    .setTargetPlayers(players)
                    .setTargetTile(tile)
                    .setTargetCard(card)
                    .setTreasureType(treasureType)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
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
    public boolean useCard(ActionContext actionContext)
    {
        ActionCard card = (ActionCard) actionContext.getTargetCard();
        gameController.useCards(card, actionContext);
        return true;
    }
    public boolean endTurn()
    {
        gameController.endTurn();
        return true;
    }
}
