import fs from 'fs';
import * as constants from './const.mjs';
import Game from './game.mjs';
import { RUN_STATE } from './game.mjs';
import { mutate } from './utils.mjs';
import { createNeatapticObject } from './utils.mjs';

let trainingGames = [];
let neat;

for (let i = 0; i < constants.POPULATION_SIZE; i++) {
    const trainingGameField = generateFakeDOMElement('trainingGameField' + i, constants.TRAINING_CELL_SIZE, constants.TRAINING_CELL_SIZE);
    const trainingGame = new Game(trainingGameField, 1);
    trainingGame.start();
    trainingGames.push(trainingGame);
}

neat = createNeatapticObject();
for (let i = 0; i < neat.popsize; i++) {
    neat.population[i].score = 0;
}

setInterval(() => {
    // if not all died do run
    if (trainingGames.some((game) => game.currentState === RUN_STATE)) {
        trainingGames.map((game) => {
            if (game.foodStore.length === 0) {
                game.addFood();
            }
            game.run();
        });
    } else { // else mutate
        displayStatistics(
            trainingGames.map((game) => game.neat.population[0].score),
            neat.generation
        );
        neat.population = trainingGames.map((game) => game.neat.population[0]);
        savePopulation(neat.population);
        neat = mutate(neat);

        trainingGames.map((game) => game.removeAll());
        trainingGames = [];
        for (let i = 0; i < constants.POPULATION_SIZE; i++) {
            const newGame = new Game(
                generateFakeDOMElement('trainingGameField' + i, constants.TRAINING_CELL_SIZE, constants.TRAINING_CELL_SIZE),
                1,
                [neat.population[i]]
            );
            trainingGames[i] = newGame;
            newGame.start();
        }
    }
}, 0);

function displayStatistics(scores, generation) {
    const sum = scores.reduce((sum, x) => sum + x);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const avg = sum / scores.length;

    console.log({
        generation,
        min: min.toFixed(2),
        avg: avg.toFixed(2),
        max: max.toFixed(2)
    });
}

function generateFakeDOMElement(id, clientWidth, clientHeight) {
    return {
        id,
        clientHeight,
        clientWidth,
        isFake: true,
    };
}

function savePopulation(population) {
    const json = 'export default ' + JSON.stringify(population) + ';';
    fs.writeFile('src/scripts/population.mjs', json, 'utf8', (err, data) => {
        if (err) {
            console.log('Error writing file: ', err);
        }
    });
}
