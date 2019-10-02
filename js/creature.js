'use strict';

function Creature(x, y, brain) {
    MovingObject.call(this, x, y); // parent constructor
    this.ttl = MAX_TTL - Math.random() * MAX_TTL / 2;
    this.size = convertTtlToSize(this.ttl);
    this.sign = getEmojiForCreature();
    this.needDelete = false;
    this.step = 1;
    this.brain = brain;
}

Creature.prototype = Object.create(MovingObject.prototype, {
    SIZE: {
        value: 20,
        enumerable: true,
        configurable: true,
        writable: false
    },
    doTurn: {
        value: function(maxX, maxY, food){

            //life pass
            this.ttl -= DELAY;

            //steps
            const distanceToFoodBefore = getVisibleFood(this.x, this.y, food, MAX_SEEKING_DISTANCE);
            const minDistanceBefore = Math.min(...distanceToFoodBefore.filter((e) => e > 0));
            const activationResult = this.brain.activate(distanceToFoodBefore);
            let maxActivationResultItem = 0;
            for (let i = 0; i < 4; i++) {
                if (activationResult[i] > maxActivationResultItem) {
                    maxActivationResultItem = activationResult[i];
                    this.direction = i + 1;
                }
            }

            MovingObject.prototype.doTurn.apply(this, arguments); // call super

            const distanceToFoodAfter = getVisibleFood(this.x, this.y, food, MAX_SEEKING_DISTANCE);
            const minDistanceAfter = Math.min(...distanceToFoodAfter.filter((e) => e > 0));

            if (minDistanceAfter < minDistanceBefore) {
                this.brain.score += CLOSER_TO_FOOD_SCORE;
            } else {
                this.brain.score -= CLOSER_TO_FOOD_SCORE;
            }

            if (this.ttl < 0) {
                this.needDelete = true;
                this.brain.score -= DEATH_SCORE;
            }

            if (!this.needDelete) {
                this.redraw();
            }
        },
        enumerable: true,
        configurable: true,
        writable: true
    },
    createDOMElement: {
        value: function() {
            const element = document.createElement('div');
            const gameField = document.getElementById(GAME_FIELD_ID);
            element.setAttribute('id', this.id);
            element.innerHTML = this.sign;
            element.setAttribute('class', 'creature');
            gameField.appendChild(element);
        },
        enumerable: true,
        configurable: true,
        writable: true
    },
    checkIntersect: {
        value: function(foodStore) {
            for (let i = 0; i < foodStore.length; i++) {
                const food = foodStore[i];
                if ((Math.abs(food.x - this.x) < (food.size + this.size) / 2)
                    && (Math.abs(food.y - this.y) < (food.size + this.size) / 2)) {
                    foodStore[i].needDelete = true;
                    this.ttl += 10000; // TODO: const?
                    this.brain.score += FOUND_FOOD_SCORE;
                }
            }
        },
        enumerable: true,
        configurable: true,
        writable: true
    },
    redraw: {
        value: function() {
            MovingObject.prototype.redraw.apply(this, arguments);
            const element = document.getElementById(this.id);

            element.style.height = convertTtlToSize(this.ttl) + 'px';
            element.style.width = convertTtlToSize(this.ttl) + 'px';
            element.style.fontSize = convertTtlToFontSize(this.ttl) + 'px';
        },
        enumerable: true,
        configurable: true,
        writable: true
    },
});

Creature.prototype.constructor = Creature;

/**
 * Converts ttl to screen siz
 *
 * @param {number} ttl
 * @returns {number}
 */
function convertTtlToSize(ttl) {
    return Creature.prototype.SIZE * (ttl / MAX_TTL);
}

function convertTtlToFontSize(ttl) {
    return 18 * (ttl / MAX_TTL);
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

    for (let i = 0; i < SECTORS_OF_VISION; i++) {
        let angleBegin, angleEnd;
        result[i] = 0;
        angleBegin = i * 2 * Math.PI / SECTORS_OF_VISION;
        angleEnd = (i + 1) * 2 * Math.PI / SECTORS_OF_VISION;
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

    const maxDistance = Math.max(...result);
    // normalize
    return result.map((e) => maxDistance > 0 ? e / maxDistance : e);
}


/** Get the angle from one point to another */
function angleToPoint(x1, y1, x2, y2){
    const d = distance(x1, y1, x2, y2);
    const dx = (x2-x1) / d;
    const dy = (y2-y1) / d;

    let a = Math.acos(dx);
    a = dy < 0 ? 2 * Math.PI - a : a;
    return a;
}

/** Calculate distance between two points */
function distance(x1, y1, x2, y2){
    const dx = x1 - x2;
    const dy = y1 - y2;

    return Math.sqrt(dx * dx + dy * dy);
}
