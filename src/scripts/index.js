import '../styles/index.scss';
import * as constants from './const';
import Game from './game';
import { RUN_STATE } from './game';

const TRAINING_MODE = 'training';
const LIVE_MODE = 'live';

document.addEventListener('DOMContentLoaded', function () {
    let currentMode = TRAINING_MODE;
    let isPaused = false;
    let isFullPanelMode = true;
    const liveGameField = document.getElementById(constants.GAME_FIELD_ID);
    const trainingGameFieldsHolder = document.getElementById('trainingGameFieldsHolder');
    let liveGame;
    let trainingGames = [];
    let neat;

    for (let i = 0; i < constants.POPULATION_SIZE; i++) {
        const trainingGameField = document.createElement('div');
        trainingGameField.setAttribute('id', 'trainingGameField' + i);
        trainingGameField.setAttribute('class', 'training-game-field');
        const statistics = document.createElement('div');
        statistics.setAttribute('id', 'statistics' + i);
        statistics.setAttribute('class', 'field-statistics');
        trainingGameField.appendChild(statistics);
        trainingGameFieldsHolder.appendChild(trainingGameField);
    }
    initTrainingGames();

    let chartData = getInitialChartData();
    const chart = new Chart('#chart', {
        title: 'generation score history',
        type: 'line',
        height: 200,
        data: chartData
    });

    window.setInterval(() => {
        if (isPaused) {
            return;
        }

        if (currentMode === TRAINING_MODE) {
            // if not all died do run
            if (trainingGames.some((game) => game.currentState === RUN_STATE)) {
                trainingGames.map((game) => {
                    if (game.foodStore.length === 0) {
                        game.addFood();
                    }
                    game.run();
                });
            } else { // else mutate
                //TODO: gather population from training games
                updateGraph(
                    trainingGames.map((game) => game.neat.population[0].score),
                    neat.generation
                );
                neat.population = trainingGames.map((game) => game.neat.population[0]);
                neat = mutate(neat);

                trainingGames.map((game) => game.removeAll());
                trainingGames = [];
                for (let i = 0; i < constants.POPULATION_SIZE; i++) {
                    const newGame = new Game(
                        document.getElementById('trainingGameField' + i),
                        1,
                        [neat.population[i]]
                    );
                    trainingGames[i] = newGame;
                    newGame.start();
                }
            }
        } else { // Live mode
            if (liveGame.currentState === RUN_STATE) {
                liveGame.run();
            } else {
                liveGame.mutate(); // next generation
                liveGame.start();
            }
        }
    }, constants.DELAY);

    window.setInterval(() => {
        if (isPaused) {
            return;
        }

        if (currentMode === TRAINING_MODE) {
            trainingGames.map((game) => {
                if(game.currentState === RUN_STATE) {
                    //game.addFood();
                }
            });
            displayStatistics(
                trainingGames.map((game) => game.neat.population[0].score),
                trainingGames.filter((game) => game.currentState === RUN_STATE).length,
                neat.generation
            );
        } else { // Live mode
            if (liveGame.currentState === RUN_STATE) {
                liveGame.addFood();
                displayStatistics(
                    liveGame.neat.population.map((brain) => brain.score),
                    liveGame.creatures.length,
                    liveGame.neat.generation
                );
            }
        }
    }, constants.FOOD_DELAY);

    liveGameField.addEventListener('click', (event) => {
        liveGame.addFood(event.clientX, event.clientY);
    });

    document.getElementById('trainingSelector').addEventListener('change', (event) => {
        if(event.target.checked) {
            liveGameField.style.display = 'none';
            trainingGameFieldsHolder.style.display = 'flex';
            currentMode = TRAINING_MODE;

            if (liveGame) {
                liveGame.stop();
            }

            // init training games
            initTrainingGames();
        }
    });

    document.getElementById('liveSelector').addEventListener('change', (event) => {
        if(event.target.checked) {
            liveGameField.style.display = 'block';
            trainingGameFieldsHolder.style.display = 'none';

            trainingGames.forEach((game) => game.stop());
            currentMode = LIVE_MODE;

            // gather population from training games
            let population = trainingGames.map((game) => game.neat.population[0]);

            liveGame = new Game(liveGameField, constants.POPULATION_SIZE, population);
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

    const toggleView = document.getElementById('toggleView');
    toggleView.addEventListener('click', (event) => {
        const shortPanel = document.getElementById('shortPanel');
        const fullPanel = document.getElementById('fullPanel');

        isFullPanelMode = !isFullPanelMode;
        if (isFullPanelMode) {
            toggleView.innerHTML = '[-]';
            fullPanel.style.display = 'block';
            shortPanel.style.display = 'none';
        } else {
            toggleView.innerHTML = '[+]';
            fullPanel.style.display = 'none';
            shortPanel.style.display = 'block';
        }
    });

    /**
     *
     * @param {number[]} scores
     */
    function displayStatistics(scores, aliveCount, generation) {
        const sum = scores.reduce((sum, x) => sum + x);
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        const avg = sum / scores.length;

        document.querySelectorAll('.min').forEach((element) => element.innerHTML = '' + min.toFixed(2));
        document.querySelectorAll('.max').forEach((element) => element.innerHTML = '' + max.toFixed(2));
        document.querySelectorAll('.avg').forEach((element) => element.innerHTML = '' + avg.toFixed(2));
        document.querySelectorAll('.alive').forEach((element) => element.innerHTML = '' + aliveCount);
        document.querySelectorAll('.generation').forEach((element) => element.innerHTML = '' + generation);

        for (let i = 0; i < scores.length; i++) {
            document.getElementById('statistics' + i).innerHTML = '' + scores[i].toFixed(2);
        }
    }

    function updateGraph(scores, generation) {
        const sum = scores.reduce((sum, x) => sum + x);
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        const avg = sum / scores.length;

        chartData.labels.push(generation.toString());
        chartData.datasets[0].values.push(max.toFixed(2));
        chartData.datasets[1].values.push(avg.toFixed(2));
        chartData.datasets[2].values.push(min.toFixed(2));

        if (chartData.labels.length > 10) {
            chartData.labels.shift();
            chartData.datasets.forEach(d => d.values.shift());
        }
        chart.update(chartData);
    }

    function initTrainingGames() {

        trainingGames = [];

        for (let i = 0; i < constants.POPULATION_SIZE; i++) {
            const trainingGameField = document.getElementById('trainingGameField' + i);
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
    }

    function getInitialChartData() {
        return {
            labels: [],
            datasets: [
                {
                    name: 'Max',
                    values: []
                },
                {
                    name: 'Average',
                    values: []
                },
                {
                    name: 'Min',
                    values: []
                }
            ]
        };
    }
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
