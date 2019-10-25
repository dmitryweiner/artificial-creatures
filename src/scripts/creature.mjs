import * as constants from './const.mjs';
import MovingObject from './moving-object.mjs';
import Food from './food.mjs';
import { getEmojiForCreature, sigmoidize, distance, angleToPoint } from './utils.mjs';

export default class Creature extends MovingObject {

    static SIZE = 20;

    constructor(x, y, gameField, brain) {
        super(x, y, gameField);
        this.ttl = constants.MAX_TTL - Math.random() * constants.MAX_TTL / 2;
        this.size = convertTtlToSize(this.ttl);
        this.sign = getEmojiForCreature();
        this.needDelete = false;
        this.step = 1;
        this.brain = brain;
    }

    doTurn(food) {

        //life pass
        this.ttl -= constants.DELAY;
        this.size = convertTtlToSize(this.ttl);

        //steps
        let distanceToFoodBefore = getVisibleFood(this.x, this.y, food, constants.MAX_SEEKING_DISTANCE);
        const edgeDetectionResults = this.distanceToEdge();
        const activationResult = this.brain.activate([...sigmoidize(distanceToFoodBefore), ...sigmoidize(edgeDetectionResults)]);

        this.direction = activationResult[0] > 1 ? 1 : activationResult[0] < 0 ? 0 : activationResult[0];
        this.direction = this.direction * 2 * Math.PI;
        this.speed = activationResult[1] > 1 ? 1 : activationResult[1] < 0 ? 0 : activationResult[1];

        MovingObject.prototype.doTurn.apply(this, arguments); // call super

        // moving to food reward
        let distanceToFoodAfter = getVisibleFood(this.x, this.y, food, constants.MAX_SEEKING_DISTANCE);
        distanceToFoodAfter = distanceToFoodAfter.filter((e) => e > 0); // delete zeroes
        distanceToFoodBefore = distanceToFoodBefore.filter((e) => e > 0); // delete zeroes
        if (distanceToFoodBefore.length > 0 && distanceToFoodAfter.length > 0) {
            const minDistanceAfter = Math.min(...distanceToFoodAfter);
            const minDistanceBefore = Math.min(...distanceToFoodBefore);

            const reward = (minDistanceAfter > 0) ? constants.CLOSER_TO_FOOD_COEFFICIENT / minDistanceAfter : 0;
            if (minDistanceAfter < minDistanceBefore) {
                this.brain.score += reward;
            } else if (minDistanceAfter > minDistanceBefore) {
                this.brain.score -= reward;
            }
        }

        // punish close to edge moving
        const edgeKillingResults = this.edgeDetection();
        if (edgeKillingResults.some((e) => e === 1)) {
            this.needDelete = true;
            this.brain.score -= constants.CLOSE_TO_EDGE_SCORE;
        }

        if (this.ttl < 0) {
            this.needDelete = true;
            this.brain.score -= constants.DEATH_SCORE; // punish death
        }

        if (!this.needDelete) {
            this.redraw();
        }
    }

    createDOMElement() {
        if (this.gameField.isFake) {
            return;
        }

        const element = document.createElement('div');
        element.setAttribute('id', this.id);
        element.innerHTML = this.sign;
        element.setAttribute('class', 'creature');
        element.style.left = this.x + 'px';
        element.style.top = this.y + 'px';
        this.gameField.appendChild(element);
    }

    checkIntersect(foodStore) {
        for (let i = 0; i < foodStore.length; i++) {
            const food = foodStore[i];
            if (distance(food.x, food.y, this.x, this.y) < (Food.SIZE + this.size) / 2) {
                foodStore[i].needDelete = true;
                this.ttl += 10000; // TODO: const?
                this.brain.score += constants.FOUND_FOOD_SCORE;
            }
        }
    }

    /**
     *
     * @returns {number[]}
     */
    edgeDetection() {
        let result = [0, 0, 0, 0];

        if (Math.floor(this.x) <= 0) {
            result[3] = 1;
        }
        if (Math.abs(Math.ceil(this.x - this.maxX + this.size)) <= 0) {
            result[1] = 1;
        }
        if (Math.floor(this.y) <= 0) {
            result[0] = 1;
        }
        if (Math.abs(Math.ceil(this.y - this.maxY + this.size)) <= 0) {
            result[2] = 1;
        }
        return result;
    }

    /**
     *
     * @returns {number[]} 1 / dist
     */
    distanceToEdge() {
        let result = [0, 0, 0, 0];

        if (this.x > 0) {
            result[3] = 1 / this.x;
        }
        if (Math.abs(this.x - this.maxX + this.size) > 0) {
            result[1] = 1 / Math.abs(this.x - this.maxX + this.size);
        }
        if (this.y  > 0) {
            result[0] = 1 / this.y;
        }
        if (Math.abs(this.y - this.maxY + this.size) > 0) {
            result[2] = 1 / Math.abs(this.y - this.maxY + this.size);
        }
        return result;
    }


    redraw() {
        if (this.gameField.isFake) {
            return;
        }

        MovingObject.prototype.redraw.apply(this, arguments);
        const element = document.getElementById(this.id);

        element.style.height = convertTtlToSize(this.ttl) + 'px';
        element.style.width = convertTtlToSize(this.ttl) + 'px';
        element.style.fontSize = convertTtlToFontSize(this.ttl) + 'px';
    }
}

/**
 * Converts ttl to screen siz
 *
 * @param {number} ttl
 * @returns {number}
 */
function convertTtlToSize(ttl) {
    return Creature.SIZE;

    const result = Creature.SIZE * (ttl / constants.MAX_TTL);
    return result < 10 ? 10 : result;
}

function convertTtlToFontSize(ttl) {
    return 18;
    
    const result = 18 * (ttl / constants.MAX_TTL);
    return result < 10 ? 10 : result;
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {[]} food
 * @param {number} seekingDistance
 * @return {array} [0, 0, 20, 0 ... ]
 */
function getVisibleFood(x, y, food, seekingDistance) {
    const result = [];
    let nearestFood = [];

    for (const foodItem of food) {
        if (distance(x, y, foodItem.x, foodItem.y) <= seekingDistance) {
            nearestFood.push(foodItem);
        }
    }

    for (let i = 0; i < constants.SECTORS_OF_VISION; i++) {
        let angleBegin, angleEnd;
        result[i] = 0;
        angleBegin = i * 2 * Math.PI / constants.SECTORS_OF_VISION;
        angleEnd = (i + 1) * 2 * Math.PI / constants.SECTORS_OF_VISION;
        for (const foodItem of nearestFood) {
            const angle = angleToPoint(x, y, foodItem.x, foodItem.y);
            const foodDistance = distance(x, y, foodItem.x, foodItem.y);
            if (angle >= angleBegin && angle < angleEnd) {
                if (result[i] < foodDistance) {
                    result[i] = foodDistance;
                }
            }
        }
    }

    //return normalize(result);
    return result;
}
