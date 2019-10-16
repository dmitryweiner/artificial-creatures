'use strict';

const TRAINING_MODE = 'training';
const LIVE_MODE = 'live';

document.addEventListener('DOMContentLoaded', function () {
    let currentMode = TRAINING_MODE;
    let isPaused = false;
    const liveGameField = document.getElementById(GAME_FIELD_ID);
    const trainingGameFieldsHolder = document.getElementById('trainingGameFieldsHolder');
    let liveGame;
    let trainingGames = [];

    for (let i = 0; i < POPULATION_SIZE; i++) {
        const trainingGameField = document.createElement('div');
        trainingGameField.setAttribute('id', 'trainingGameField' + i);
        trainingGameField.setAttribute('class', 'training-game-field');
        trainingGameFieldsHolder.appendChild(trainingGameField);
        const trainingGame = new Game(trainingGameField, 1);
        trainingGame.start();
        trainingGames.push(trainingGame);
    }
    let neat = new neataptic.Neat(
        SECTORS_OF_VISION + 4, // inputs: sectors around + edge detection
        2, // output channels: angle and speed
        null, // ranking function
        {
            popsize: POPULATION_SIZE,
            elitism: ELITISM,
            mutationRate: MUTATION_RATE,
            mutationAmount: MUTATION_AMOUNT,
        }
    );
    neataptic.Config.warnings = false;
    for (let i = 0; i < neat.popsize; i++) {
        neat.population[i].score = 0;
    }

    window.setInterval(() => {
        if (isPaused) {
            return;
        }

        if (currentMode === TRAINING_MODE) {
            // if not all died do run
            if (trainingGames.some((game) => game.currentState === RUN_STATE)) {
                trainingGames.map((game) => game.run());
            } else { // else mutate
                //TODO: gather population from training games
                neat.population = trainingGames.map((game) => game.neat.population[0]);
                neat = mutate(neat);

                trainingGames.map((game) => game.removeAll());
                trainingGames = [];
                for (let i = 0; i < POPULATION_SIZE; i++) {
                    const newGame = new Game(
                        document.getElementById('trainingGameField' + i),
                        1,
                        [neat.population[i]]
                    );
                    trainingGames[i] = newGame;
                    newGame.start();
                }
            }
        } else {
            if (liveGame.currentState === RUN_STATE) {
                liveGame.run();
            } else {
                liveGame.mutate(); // next generation
                liveGame.start();
            }
        }
    }, DELAY);

    window.setInterval(() => {
        if (isPaused) {
            return;
        }

        if (currentMode === TRAINING_MODE) {
            trainingGames.map((game) => {
                if(game.currentState === RUN_STATE) {
                    game.addFood();
                }
            });
            displayStatistics(
                trainingGames.map((game) => game.neat.population[0].score),
                trainingGames.filter((game) => game.currentState === RUN_STATE).length,
                neat.generation
            );
        } else {
            if (liveGame.currentState === RUN_STATE) {
                liveGame.addFood();
                displayStatistics(
                    liveGame.neat.population.map((brain) => brain.score),
                    liveGame.creatures.length,
                    liveGame.neat.generation
                );
            }
        }
    }, FOOD_DELAY);

    liveGameField.addEventListener('click', (event) => {
        liveGame.addFood(event.clientX, event.clientY);
    });

    document.getElementById('trainingSelector').addEventListener('change', (event) => {
        if(event.target.checked) {
            currentMode = TRAINING_MODE;

            // TODO: init training games
        }
    });

    document.getElementById('liveSelector').addEventListener('change', (event) => {
        if(event.target.checked) {
            currentMode = LIVE_MODE;

            //TODO: gather population from training games
            let population = [];

            liveGame = new Game(liveGameField, POPULATION_SIZE, population);
            liveGame.start();
        }
    });

    document.getElementById('pauseCheckbox').addEventListener('change', (event) => {
        if(event.target.checked) {
            isPaused = true;
        } else {
            isPaused = false;
        }
    });
});

function mutate(neat) {
    neat.sort();

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
    return neat;
}

/**
 *
 * @param {number[]} scores
 */
function displayStatistics(scores, aliveCount, generation) {
    const sum = scores.reduce((sum, x) => sum + x);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const avg = sum / scores.length;

    document.getElementById('min').innerHTML = '' + min;
    document.getElementById('max').innerHTML = '' + max;
    document.getElementById('avg').innerHTML = '' + avg;
    document.getElementById('alive').innerHTML = '' + aliveCount;
    document.getElementById('generation').innerHTML = '' + generation;
}
