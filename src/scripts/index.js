import '../styles/index.scss';
import * as constants from './const.mjs';
import Game from './game.mjs';
import { RUN_STATE } from './game.mjs';
import { mutate } from './utils.mjs';
import population from './population.mjs';
import neataptic from 'neataptic';
import { createNeatapticObject } from './utils.mjs';

const TRAINING_MODE = 'training';
const LIVE_MODE = 'live';

document.addEventListener('DOMContentLoaded', function () {
    let currentMode = LIVE_MODE;
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

    if (currentMode === TRAINING_MODE) {
        liveGameField.style.display = 'none';
        trainingGameFieldsHolder.style.display = 'flex';
        initTrainingGames(population.map((brain) => neataptic.Network.fromJSON(brain)));
    } else {
        liveGameField.style.display = 'block';
        trainingGameFieldsHolder.style.display = 'none';
        initLiveGame(population.map((brain) => neataptic.Network.fromJSON(brain)));
    }

    let chartData = getInitialChartData();
    const chart = new Chart('#chart', {
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
                    if (game.foodStore.length < 3) {
                        game.addFood();
                    }
                    game.run();
                });
            } else { // else mutate
                updateGraph(
                    trainingGames.map((game) => game.neat.population[0].score),
                    neat.generation
                );

                // gather population from training games
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
                if (liveGame.foodStore.length < liveGame.creatures.length) {
                    liveGame.addFood();
                }
                liveGame.run();
            } else {
                updateGraph(
                    liveGame.neat.population.map((brain) => brain.score),
                    liveGame.neat.generation
                );
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
            displayStatistics(
                trainingGames.map((game) => game.neat.population[0].score),
                trainingGames.filter((game) => game.currentState === RUN_STATE).length,
                neat.generation
            );
        } else { // Live mode
            if (liveGame.currentState === RUN_STATE) {
                displayStatistics(
                    liveGame.neat.population.map((brain) => brain.score),
                    liveGame.creatures.length,
                    liveGame.neat.generation
                );
            }
        }
    }, constants.STATISTICS_DELAY);

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

            chartData = getInitialChartData();
            chart.update(chartData);

            // init training games
            initTrainingGames(liveGame.neat.population);
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

            chartData = getInitialChartData();
            chart.update(chartData);

            initLiveGame(population);
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
            toggleView.value = '[-]';
            fullPanel.style.display = 'block';
            shortPanel.style.display = 'none';
        } else {
            toggleView.value = '[+]';
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

    function initTrainingGames(population = null) {

        neat = createNeatapticObject();

        if (population) {
            neat.population = population;
        }

        for (let i = 0; i < neat.popsize; i++) {
            neat.population[i].score = 0;
        }

        trainingGames = [];

        for (let i = 0; i < constants.POPULATION_SIZE; i++) {
            const trainingGameField = document.getElementById('trainingGameField' + i);
            const trainingGame = new Game(trainingGameField, 1, [neat.population[i]]);
            trainingGame.start();
            trainingGames.push(trainingGame);
        }
    }

    function initLiveGame(population) {
        liveGame = new Game(liveGameField, constants.POPULATION_SIZE, population);
        liveGame.start();
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
