import fs from 'fs';
import * as constants from './const.mjs';
import Game from './game.mjs';
import { RUN_STATE } from './game.mjs';
import population from './population.mjs';
import neataptic from 'neataptic';

let savedPopulation = null;
let lastCycleTime = new Date();

if (typeof process.argv[2] !== 'undefined' && process.argv[2] === 'continue') {
    console.log('Loading trained population.');
    savedPopulation = population.map((brain) => neataptic.Network.fromJSON(brain));
}

const trainingGameField = generateFakeDOMElement('trainingGameField', constants.TRAINING_CELL_SIZE, constants.TRAINING_CELL_SIZE);
let trainingGame = new Game(trainingGameField, constants.POPULATION_SIZE, savedPopulation);
trainingGame.start();

setInterval(() => {
    // if not all died do run
    if (trainingGame.currentState === RUN_STATE) {
        if (trainingGame.foodStore.length < trainingGame.creatures.length * constants.FOOD_RATE_COEFFICIENT) {
            trainingGame.addFood();
        }
        trainingGame.run();
    } else { // else mutate
        displayStatistics(
            trainingGame.neat.population.map((brain) => brain.score),
            trainingGame.neat.generation,
            new Date() - lastCycleTime
        );
        savePopulation(trainingGame.neat.population);
        trainingGame.mutate();
        trainingGame.start();
        lastCycleTime = new Date();
    }
}, 0);

function displayStatistics(scores, generation, time) {
    const sum = scores.reduce((sum, x) => sum + x);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const avg = sum / scores.length;

    console.log({
        generation,
        min: min.toFixed(2),
        avg: avg.toFixed(2),
        max: max.toFixed(2),
        time,
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
    population.sort((a,b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0)); // reverse sorting by score (best first)
    const json = 'export default ' + JSON.stringify(population) + ';';
    fs.writeFile('src/scripts/population.mjs', json, 'utf8', (err, data) => {
        if (err) {
            console.log('Error writing file: ', err);
        }
    });
}
