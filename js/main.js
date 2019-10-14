'use strict';

document.addEventListener('DOMContentLoaded', function () {
    let isSettingsPanelOpened = false;
    const gameField = document.getElementById(GAME_FIELD_ID);
    const game = new Game(gameField, POPULATION_SIZE);
    game.start();

    window.setInterval(() => {
        if (game.currentState === RUN_STATE) {
            game.run();
        }
    }, DELAY);

    gameField.addEventListener('click', (event) => {
        game.addFood(event.clientX, event.clientY);
    });

    window.setInterval(() => {
        if (game.currentState === RUN_STATE) {
            game.addFood((gameField.clientWidth - Food.SIZE) * Math.random(),
            (gameField.clientHeight - Food.SIZE) * Math.random()
            );
        } else {
            game.mutate(); // next generation
            game.start();
        }
    }, FOOD_DELAY);

    document.getElementById('mutateButton').addEventListener('click', () => {
       game.mutate();
       game.start();
    });
});
