package Game.ForbiddenIsland.controller;

import Game.ForbiddenIsland.model.ActionLogger;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.cardCategory.ActionCard;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.GameState;
import Game.ForbiddenIsland.model.Players.Player;
import Game.ForbiddenIsland.model.Players.PlayerChoice;
import Game.ForbiddenIsland.model.TreasureType;
import Game.ForbiddenIsland.util.ActionContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletContext;

import java.util.ArrayList;
import java.util.List;

/**
 * PlayerController handles player actions and interactions in the Forbidden Island game.
 * It processes player choices and delegates actions to the GameController.
 */
public class PlayerController {
    // 1. Properties
    private final GameController gameController;

    // 2. Constructor
    /**
     * Creates a new PlayerController with the specified GameController
     * @param gameController The game controller to delegate actions to
     */
    public PlayerController(GameController gameController) {
        this.gameController = gameController;
    }

    // 3. Action Processing Methods
    /**
     * Receives and processes player actions from JSON input
     * @param json JSON string containing the action details
     * @param ctx ServletContext for logging
     */
    public void receiveAndAllocate(String json, ServletContext ctx) {
        ActionContext actionContext = parseJsonToActionContext(json);
        ActionLogger logger = (ActionLogger) ctx.getAttribute("actionLogger");
        
        if (actionContext == null) {
            System.err.println("[PlayerController] Failed to parse ActionContext, received json: " + json);
            return;
        }

        System.out.println("[PlayerController] Received action: " + actionContext.getPlayerChoice()
                + " | Player: " + (actionContext.getTargetPlayers().isEmpty() ? "-" : actionContext.getTargetPlayers().get(0).getType())
                + " | Target tile: " + (actionContext.getTargetTile() == null ? "null" :
                actionContext.getTargetTile().getX() + "," + actionContext.getTargetTile().getY())
                + " | Other card/treasure: " + actionContext.getTargetCard() + "/" + actionContext.getTreasureType()
        );

        switch (actionContext.getPlayerChoice()) {
            case MOVE:
                if (movePlayer(actionContext)) {
                    decAction();
                    logger.log("Player " + actionContext.getTargetPlayers().isEmpty() + "-" + actionContext.getTargetPlayers().get(0).getType() + " moved");
                }
                break;
            case SHORE_UP:
                if (shoreUp(actionContext)) {
                    decAction();
                    logger.log("Player " + actionContext.getTargetPlayers().isEmpty() + "-" + actionContext.getTargetPlayers().get(0).getType() + " shore up");
                }
                break;
            case COLLECT_TREASURE:
                if (collectTreasure(actionContext)) {
                    decAction();
                    logger.log("Player " + actionContext.getTargetPlayers().isEmpty() + "-" + actionContext.getTargetPlayers().get(0).getType() + " collect treasure");
                }
                break;
            case GIVE_CARD:
                if (giveCard(actionContext)) {
                    decAction();
                    logger.log("Player " + actionContext.getTargetPlayers().isEmpty() + "-" + actionContext.getTargetPlayers().get(0).getType() + " give card");
                }
                break;
            case USE_CARD:
                useCard(actionContext);
                logger.log("Player " + actionContext.getTargetPlayers().isEmpty() + "-" + actionContext.getTargetPlayers().get(0).getType() + " use card");
                break;
            case END_TURN:
                endTurn();
                logger.log("Player " + actionContext.getTargetPlayers().isEmpty() + "-" + actionContext.getTargetPlayers().get(0).getType() + " end turn");
                break;
            default:
                System.err.println("[PlayerController] Unknown action: " + actionContext.getPlayerChoice());
        }
    }

    // 4. Action Implementation Methods
    /**
     * Decreases the action count and automatically ends turn if no actions remain
     */
    private void decAction() {
        GameState gs = gameController.getGameState();
        int left = gs.getActionsLeft() - 1;
        gs.setActionsLeft(left);
        System.out.println("[PlayerController] Actions -1, remaining: " + left);
        if (left <= 0) {
            System.out.println("[PlayerController] No actions remaining, ending turn automatically");
            endTurn();
        }
    }

    /**
     * Moves a player to a target tile
     * @param actionContext Context containing move details
     * @return true if move was successful
     */
    public boolean movePlayer(ActionContext actionContext) {
        if (gameController.getGameState().getActionsLeft() <= 0) {
            System.out.println("[PlayerController] No actions remaining, skipping move");
            return false;
        }
        Player player = actionContext.getTargetPlayers().get(0);
        Tile targetTile = actionContext.getTargetTile();
        System.out.println("[PlayerController] Executing movePlayer: "
                + player.getType() + " -> (" + targetTile.getX() + "," + targetTile.getY() + ")");
        return gameController.movePlayer(player, targetTile);
    }

    /**
     * Shores up a target tile
     * @param actionContext Context containing shore up details
     * @return true if action was successful
     */
    public boolean shoreUp(ActionContext actionContext) {
        System.out.println("[PlayerController] shoreUp: " + actionContext.getTargetTile());
        gameController.shoreUp(actionContext.getTargetTile());
        return true;
    }

    /**
     * Collects treasure from the current tile
     * @param actionContext Context containing treasure collection details
     * @return true if collection was successful
     */
    public boolean collectTreasure(ActionContext actionContext) {
        System.out.println("[PlayerController] collectTreasure: " + actionContext.getTreasureType());
        return gameController.collectTreasure(gameController.getCurrentPlayer(), actionContext.getTreasureType());
    }

    /**
     * Gives a card from one player to another
     * @param actionContext Context containing card giving details
     * @return true if action was successful
     */
    public boolean giveCard(ActionContext actionContext) {
        Player receiver = actionContext.getTargetPlayers().get(0);
        Player giver = gameController.getGameState().getCurrentPlayer();
        Card card = actionContext.getTargetCard();

        System.out.println("[PlayerController] giveCard: "
                + giver.getType() + "->" + receiver.getType() + " card=" + card);

        return gameController.giveCard(giver, receiver, card);
    }

    /**
     * Uses a special action card
     * @param actionContext Context containing card usage details
     * @return true if card was used successfully
     */
    public boolean useCard(ActionContext actionContext) {
        Card raw = actionContext.getTargetCard();
        if (!(raw instanceof ActionCard)) {
            System.err.println("[PlayerController] useCard: Not a special card, cannot use → " + raw);
            return false;
        }
        ActionCard card = (ActionCard) raw;
        System.out.println("[PlayerController] useCard: " + card);
        gameController.useCards(card, actionContext);
        return true;
    }

    /**
     * Ends the current player's turn
     * @return true if turn was ended successfully
     */
    public boolean endTurn() {
        System.out.println("[PlayerController] Triggering endTurn");
        gameController.endTurn();
        return true;
    }

    // 5. Utility Methods
    /**
     * Parses JSON input into an ActionContext object
     * @param json JSON string to parse
     * @return ActionContext object or null if parsing fails
     */
    public ActionContext parseJsonToActionContext(String json) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            JsonNode root = mapper.readTree(json);

            String choiceStr = root.has("action") ? root.get("action").asText() :
                    root.has("playerChoice") ? root.get("playerChoice").asText() : null;
            if (choiceStr == null) return null;
            PlayerChoice choice = PlayerChoice.valueOf(choiceStr.toUpperCase());

            Tile tile = null;
            if (root.has("x") && root.has("y")) {
                int x = root.get("x").asInt();
                int y = root.get("y").asInt();
                tile = gameController.getGameState().getTileAt(x, y);
            } else if (root.has("targetTile")) {
                String str = root.get("targetTile").asText();
                if (!"null".equals(str)) {
                    String[] parts = str.split(",");
                    int x = Integer.parseInt(parts[0].trim());
                    int y = Integer.parseInt(parts[1].trim());
                    tile = gameController.getGameState().getTileAt(x, y);
                }
            }

            List<Player> players = new ArrayList<>();
            if (root.has("playerIndex")) {
                int idx = root.get("playerIndex").asInt();
                players.add(gameController.getGameState().getPlayers().get(idx));
            } else if (root.has("targetPlayers")) {
                for (JsonNode nameNode : root.get("targetPlayers")) {
                    Player p = gameController.getGameState().findPlayerByName(nameNode.asInt());
                    if (p != null) players.add(p);
                }
            }

            if (players.isEmpty()) {
                players.add(gameController.getGameState().getCurrentPlayer());
            }

            Card card = null;
            if (root.has("cardId")) {
                card = gameController.getGameState().getCardById(root.get("cardId").asInt());
            } else if (root.has("targetCard")) {
                card = gameController.getGameState().getCardById(root.get("targetCard").asInt());
            }

            TreasureType treasureType = null;
            if (root.has("treasureType") && !root.get("treasureType").isNull()) {
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
            System.err.println("[PlayerController] parseJsonToActionContext parsing failed: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}
