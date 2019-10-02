'use strict';

const STOP_STATE = 0;
const RUN_STATE = 1;

const Game = (function () {
    let currentState = STOP_STATE;
    let maxX = 0, maxY = 0;
    let creatures = [];
    let foodStore = [];
    const neat = new neataptic.Neat(
        SECTORS_OF_VISION, // inputs: 16 sectors around
        4, // outputs: 4 directions
        null, // ranking function
        {
            popsize: POPULATION_SIZE,
            elitism: ELITISM,
            mutationRate: MUTATION_RATE,
            mutationAmount: MUTATION_AMOUNT,
        }
    );
    neataptic.Config.warnings = false;
    neat.mutate();
    for (let i = 0; i < neat.popsize; i++) {
        neat.population[i].score = 0;
    }

    function init(newMaxX, newMaxY) {
        maxX = newMaxX;
        maxY = newMaxY;
        creatures = createCreatures(neat.population);
        currentState = RUN_STATE;
    }

    function createCreatures(brains) {
        let result = [];
        for (let i = 0; i < POPULATION_SIZE; i++) {
            const creature = new Creature(
                (maxX - Creature.prototype.SIZE) * Math.random(),
                (maxY - Creature.prototype.SIZE) * Math.random(),
                brains[i]
            );
            creature.createDOMElement();
            result.push(creature);
        }
        return result;
    }

    function handleCreatures() {
        for (let i = 0; i < creatures.length; i++) {
            creatures[i].doTurn(maxX, maxY, foodStore);
            creatures[i].checkIntersect(foodStore);
            if (creatures[i].needDelete) {
                creatures[i].deleteElement();
                creatures.splice(i, 1);
            }
        }
        for (let i = 0; i < foodStore.length; i++) {
            if (foodStore[i].needDelete) {
                foodStore[i].deleteElement();
                foodStore.splice(i, 1);
            }
        }
    }

    function removeAll() {
        for (let i = 0; i < creatures.length; i++) {
            creatures[i].deleteElement();
        }
        creatures = [];
        for (let i = 0; i < foodStore.length; i++) {
            foodStore[i].deleteElement();
        }
        foodStore = [];
    }

    function mutate() {
        neat.sort();

        console.log({
            generation: neat.generation,
            max: neat.getFittest().score,
            avg: Math.round(neat.getAverage()),
            min: neat.population[neat.popsize - 1].score
        });

        const newGeneration = [];
        for (let i = 0; i < neat.elitism; i++) {
            newGeneration.push(neat.population[i]);
        }
        for (let i = 0; i < neat.popsize - neat.elitism; i++) {
            const offspring = neat.getOffspring();
            offspring.score = 0;
            newGeneration.push(offspring);
        }
        neat.population = newGeneration;
        neat.mutate();

        neat.generation++;
        removeAll();
        creatures = createCreatures(neat.population);
    }

    function checkIfGameOver() {
        return false;
    }

    function run() {
        if (currentState == 1) {
            handleCreatures();
            if (checkIfGameOver()) {
                currentState = Game.STOP_STATE;
            }
        }
    }

    function addFood(x, y) {
        const food = new Food(x - Food.prototype.SIZE / 2, y - Food.prototype.SIZE / 2);
        food.createDOMElement();
        foodStore.push(food);
    }

    return {
        DELAY: DELAY,
        FOOD_DELAY: FOOD_DELAY,
        STOP_STATE: STOP_STATE,
        RUN_STATE: RUN_STATE,
        init: init,
        getCurrentState: function() { return currentState; },
        addFood: addFood,
        run: run,
        mutate: mutate,
    }
})();
