'use strict';

document.addEventListener('DOMContentLoaded', function () {
    let isSettingsPanelOpened = false;
    const gameField = document.getElementById(GAME_FIELD_ID);

    Game.init(
        gameField.clientWidth,
        gameField.clientHeight
    );

    window.setInterval(() => {
        if (Game.getCurrentState() == Game.RUN_STATE) {
            Game.run();
        }
    }, Game.DELAY);

    gameField.addEventListener('click', (event) => {
        Game.addFood(event.clientX, event.clientY);
    });

    window.setInterval(() => {
        if (Game.getCurrentState() == Game.RUN_STATE) {
            Game.addFood((gameField.clientWidth - Food.prototype.SIZE) * Math.random(),
            (gameField.clientHeight - Food.prototype.SIZE) * Math.random()
            );
        }
    }, Game.FOOD_DELAY);

    document.getElementById('mutateButton').addEventListener('click', () => {
       Game.mutate();
    });
});
