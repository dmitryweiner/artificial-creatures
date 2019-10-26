import Creature from './creature.mjs';
import Food from './food.mjs';
import { createNeatapticObject, mutate } from './utils.mjs';

export const STOP_STATE = 0;
export const RUN_STATE = 1;

export default class Game {

    constructor(gameField, popSize, population) {
        this.gameField = gameField;
        this.popSize = popSize;
        this.currentState = STOP_STATE;
        this.maxX = this.gameField.clientWidth;
        this.maxY = this.gameField.clientHeight;

        this.creatures = [];
        this.foodStore = [];

        this.neat = createNeatapticObject(popSize);
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

    stop() {
        this.removeAll();
        this.currentState = STOP_STATE;
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
            this.creatures[i].doTurn(this.foodStore);
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
        this.neat = mutate(this.neat);
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
            foodX = Food.SIZE + (this.maxX - Food.SIZE * 2) * Math.random();
            foodY = Food.SIZE + (this.maxY - Food.SIZE * 2) * Math.random();
        }

        const food = new Food(foodX, foodY, this.gameField);
        food.createDOMElement();
        this.foodStore.push(food);
    }
}
