'use strict';

function Creature(x, y) {
    MovingObject.call(this, x, y); // parent constructor
    this.ttl = MAX_TTL - Math.random() * MAX_TTL / 2;
    this.size = convertTtlToSize(this.ttl);
    this.sign = getEmojiForCreature();
    this.needDelete = false;
    this.step = 1;
}

Creature.prototype = Object.create(MovingObject.prototype, {
    SIZE: {
        value: 20,
        enumerable: true,
        configurable: true,
        writable: false
    },
    doTurn: {
        value: function(maxX, maxY){

            //life pass
            this.ttl -= DELAY;

            //steps
            if (Math.random() > 0.7) {
                this.direction = Math.round(1 + Math.random() * 3); // here should be artificial intelligence
            }

            MovingObject.prototype.doTurn.apply(this, arguments); // call super

            if (this.ttl < 0) {
                this.needDelete = true;
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
                if ((Math.abs(food.x - this.x) < (food.size + this.size))
                    && (Math.abs(food.y - this.y) < (food.size + this.size))) {
                    foodStore[i].needDelete = true;
                    this.ttl += 10000; // TODO: const?
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
