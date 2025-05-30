package Game.ForbiddenIsland.model;

import lombok.Getter;
import lombok.Setter;

public class RoomState {
    @Getter
    private int maxPeopleCount;
    @Setter
    @Getter
    private int readyNumber;
    @Getter
    private int currentPeopleCount = 0;
    @Getter
    private int difficultyLevel;
    public boolean hasRoom = false;
    @Getter @Setter
    private GameState gameState;

    public void createRoom(int difficultyLevel, int maxPeopleCount) {
        this.difficultyLevel = difficultyLevel;
        this.maxPeopleCount = maxPeopleCount;
        this.currentPeopleCount = 1;
        this.readyNumber = 0;
        this.hasRoom = true;
    }

    // getters and setters
    public boolean hasRoom() { return hasRoom; }

    public void incrementPeople() { currentPeopleCount++; }
    public void decrementPeople() { currentPeopleCount--; }

    public void incrementReady() { readyNumber++; }
    public void decrementReady() { readyNumber--; }

    public void reset() {
        this.hasRoom = false;
        this.currentPeopleCount = 0;
        this.readyNumber = 0;
    }

}
