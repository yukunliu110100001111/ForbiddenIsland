package Game.ForbiddenIsland.util.factory;

import Game.ForbiddenIsland.model.Board.Deck;
import Game.ForbiddenIsland.model.Board.DeckImp;
import Game.ForbiddenIsland.model.Board.Tiles.Tile;
import Game.ForbiddenIsland.model.Cards.CardActions.CardAction;
import Game.ForbiddenIsland.model.Cards.CardActions.Helicopter;
import Game.ForbiddenIsland.model.Cards.CardActions.SandBag;
import Game.ForbiddenIsland.model.Cards.CardActions.WaterRise;
import Game.ForbiddenIsland.model.Cards.CardName;
import Game.ForbiddenIsland.model.Cards.CardType;
import Game.ForbiddenIsland.model.Cards.cardCategory.ActionCard;
import Game.ForbiddenIsland.model.Cards.cardCategory.Card;
import Game.ForbiddenIsland.model.Cards.cardCategory.FloodCard;
import Game.ForbiddenIsland.model.Cards.cardCategory.TreasureCard;
import Game.ForbiddenIsland.model.TreasureType;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

public class CardFactory {

    private static final Map<CardName, CardAction> actionRegistry = Map.of(
            CardName.HELICOPTER, new Helicopter(),
            CardName.SANDBAG, new SandBag(),
            CardName.WATERRISE, new WaterRise()
    );

    public static List<Card> loadTreasureCard() throws IOException {
        String path = "model/cards.json";  // same as map factory
        InputStream is = CardFactory.class.getClassLoader().getResourceAsStream(path);
        if (is == null) {
            throw new IOException("can't find  " + path + "，make sure it is in resources/model/ ！");
        }
        ObjectMapper mapper = new ObjectMapper();
        List<CardData> cardDefinitions = mapper.readValue(is, new TypeReference<>() {});
        List<Card> cards = new ArrayList<>();

        for (CardData def : cardDefinitions) {
            CardName name = CardName.valueOf(def.name());
            CardType type = CardType.valueOf(def.type());

            for (int i = 1; i <= def.quantity(); i++) {
                Card card;
                switch (type) {
                    case TREASURE -> {
                        TreasureType treasureType = TreasureType.valueOf(def.treasure());
                        card = new TreasureCard(treasureType);
                    }
                    case ACTION, EVENT -> {
                        CardAction action = actionRegistry.getOrDefault(name, null);
                        card = new ActionCard(name, type, action);
                    }
                    default -> throw new IllegalArgumentException("Unsupported card type: " + type);
                }
                cards.add(card);
            }
        }
        for  (Card card : cards) {
            card.setCardId(cards.indexOf(card));
        }
        return cards;
    }


    public static Deck<FloodCard> loadFloodCard(List<Tile> tiles) {
        List<FloodCard> cards = new ArrayList<>(tiles.stream()
                .map(FloodCard::new)
                .toList());
         for (FloodCard card : cards) {
            card.setCardId(cards.indexOf(card));
        }
        Collections.shuffle(cards, new Random());

        Deck<FloodCard> deck = new DeckImp<>();
        deck.initialize(cards);
        return deck;
    }

    // JSON data model for JSON analysis
    public record CardData(
            String name,
            String type,
            String treasure,
            int quantity
    ) {}
}
