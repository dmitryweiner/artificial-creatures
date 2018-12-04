'use strict';

document.addEventListener('DOMContentLoaded', function () {
    const gameField = document.getElementById(GAME_FIELD_ID);

    Game.init(
        gameField.clientWidth,
        gameField.clientHeight
    );

    window.setInterval(function () {
        if (Game.getCurrentState() == 1) {
            Game.run();
        }
    }, Game.DELAY);
});
