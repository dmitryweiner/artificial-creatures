"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const gameField = document.getElementById("gameField");
    const welcomeScreen = document.getElementById("welcomeScreen");
    const playButton = document.getElementById("playButton");

    function startGame() {
        welcomeScreen.style.display = 'none';
        gameField.style.display = 'block';
        Game.init(
            "gameField",
            gameField.clientWidth,
            gameField.clientHeight
        );

        window.setInterval(function () {
            if (Game.getCurrentState() == 1) {
                Game.run();
            }
        }, Game.DELAY);
    }
    playButton.addEventListener("click", startGame);
});
