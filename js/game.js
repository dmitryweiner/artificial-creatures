'use strict';

const STOP_STATE = 0;
const RUN_STATE = 1;

class Game {

    constructor(gameField, popSize, population) {
        this.gameField = gameField;
        this.popSize = popSize;
        this.currentState = STOP_STATE;
        this.maxX = this.gameField.clientWidth;
        this.maxY = this.gameField.clientHeight;

        this.creatures = [];
        this.foodStore = [];
        this.neat = new neataptic.Neat(
            SECTORS_OF_VISION + 4, // inputs: sectors around + edge detection
            2, // output channels: angle and speed
            null, // ranking function
            {
                popsize: popSize,
                elitism: ELITISM,
                mutationRate: MUTATION_RATE,
                mutationAmount: MUTATION_AMOUNT,
            }
        );
        neataptic.Config.warnings = false;
        if (population) {
            this.neat.population = population;
        }
        for (let i = 0; i < this.neat.popsize; i++) {
            this.neat.population[i].score = 0;
        }
    }

    start() {
        this.removeAll();
        this.creatures = this.createCreatures(this.neat.population);
        this.currentState = RUN_STATE;
    }

    createCreatures(brains) {
        let result = [];
        for (let i = 0; i < this.popSize; i++) {
            const creature = new Creature(
                (this.maxX - Creature.SIZE) * Math.random(),
                (this.maxY - Creature.SIZE) * Math.random(),
                this.gameField,
                brains[i]
            );
            creature.createDOMElement();
            result.push(creature);
        }
        return result;
    }

    handleCreatures() {
        for (let i = 0; i < this.creatures.length; i++) {
            this.creatures[i].doTurn(this.maxX, this.maxY, this.foodStore);
            this.creatures[i].checkIntersect(this.foodStore);
            if (this.creatures[i].needDelete) {
                this.creatures[i].deleteDOMElement();
                this.creatures.splice(i, 1);
            }
        }
        for (let i = 0; i < this.foodStore.length; i++) {
            if (this.foodStore[i].needDelete) {
                this.foodStore[i].deleteDOMElement();
                this.foodStore.splice(i, 1);
            }
        }
    }

    removeAll() {
        for (let i = 0; i < this.creatures.length; i++) {
            this.creatures[i].deleteDOMElement();
        }
        this.creatures = [];
        for (let i = 0; i < this.foodStore.length; i++) {
            this.foodStore[i].deleteDOMElement();
        }
        this.foodStore = [];
    }

    mutate() {
        this.neat.sort();

        console.log({
            generation: this.neat.generation,
            max: this.neat.getFittest().score,
            avg: Math.round(this.neat.getAverage()),
            min: this.neat.population[this.neat.popsize - 1].score
        });

        const newGeneration = [];
        for (let i = 0; i < this.neat.elitism; i++) {
            newGeneration.push(this.neat.population[i]);
        }
        for (let i = 0; i < this.neat.popsize - this.neat.elitism; i++) {
            const offspring = this.neat.getOffspring();
            offspring.score = 0;
            newGeneration.push(offspring);
        }
        this.neat.population = newGeneration;
        this.neat.mutate();

        this.neat.generation++;
        this.removeAll();
        this.creatures = this.createCreatures(this.neat.population);
    }

    checkIfGameOver() {
        return this.creatures.length === 0; // everybody died
    }

    run() {
        if (this.currentState === RUN_STATE) {
            this.handleCreatures();
            if (this.checkIfGameOver()) {
                this.currentState = STOP_STATE;
            }
        }
    }

    addFood(x, y) {
        let foodX, foodY;
        if (x && y) {
            foodX = x;
            foodY = y;
        } else {
            foodX = (this.maxX - Food.SIZE) * Math.random();
            foodY = (this.maxY - Food.SIZE) * Math.random();
        }

        const food = new Food(foodX, foodY, this.gameField);
        food.createDOMElement();
        this.foodStore.push(food);
    }
}
