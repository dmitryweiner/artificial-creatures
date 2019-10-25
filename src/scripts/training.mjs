import neataptic from 'neataptic';
import fs from 'fs';
import * as constants from './const.mjs';
import Game from './game.mjs';
import { RUN_STATE } from './game.mjs';
import { mutate } from './utils.mjs';

let trainingGames = [];
let neat;

for (let i = 0; i < constants.POPULATION_SIZE; i++) {
    const trainingGameField = generateFakeDOMElement('trainingGameField' + i, 100, 100);
    const trainingGame = new Game(trainingGameField, 1);
    trainingGame.start();
    trainingGames.push(trainingGame);
}

neat = new neataptic.Neat(
    constants.SECTORS_OF_VISION + 4, // inputs: sectors around + edge detection
    2, // output channels: angle and speed
    null, // ranking function
    {
        popsize: constants.POPULATION_SIZE,
        elitism: constants.ELITISM,
        mutationRate: constants.MUTATION_RATE,
        mutationAmount: constants.MUTATION_AMOUNT,
    }
);
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
                generateFakeDOMElement('trainingGameField' + i, 100, 100),
                1,
                [neat.population[i]]
            );
            trainingGames[i] = newGame;
            newGame.start();
        }
    }
}, constants.DELAY / 10);

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
