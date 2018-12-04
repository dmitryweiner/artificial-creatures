'use strict';

const Game = (function () {
    let score;
    let currentState = 0;
    let maxX = 0, maxY = 0;
    let creatures = [];

    function init(newMaxX, newMaxY) {
        maxX = newMaxX;
        maxY = newMaxY;
        score = 0;
        creatures = createCreatures();
        currentState = 1;
    }

    function createCreatures() {
        let result = [];
        for (let i = 0; i < 10; i++) {
            const creature = new Creature(
                (maxX - Creature.prototype.SIZE) * Math.random(),
                (maxY - Creature.prototype.SIZE) * Math.random()
            );
            creature.createDOMElement();
            result.push(creature);
        }
        return result;
    }

    function handleCreatures() {
        for (let i = 0; i < creatures.length; i++) {
            creatures[i].doTurn(maxX, maxY);
            if (creatures[i].needDelete) {
                creatures.splice(i, 1);
            }
        }
    }

    function checkIfGameOver() {
        return false;
    }

    function run() {
        if (currentState == 1) {
            handleCreatures();
            if (checkIfGameOver()) {
                currentState = 2;
            }
        }
    }

    return {
        DELAY: DELAY,
        init: init,
        getCurrentState: function() { return currentState;},
        run: run
    }
})();
