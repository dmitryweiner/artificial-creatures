'use strict';

function Creature(x, y) {
    MovingObject.call(this, x, y); // parent constructor
    this.ttl = 120000 - Math.random() * 6000;
    this.size = Creature.prototype.SIZE;
    this.sign = getEmojiForCreature();
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

            this.need_delete = false;
            if (this.ttl < 0) {
                this.needDelete = true;
            }

            if (this.needDelete) {
                MovingObject.prototype.deleteElement.call(this);
            } else {
                MovingObject.prototype.redraw.call(this);
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
                if ((Math.abs(food.x - this.x) < food.size)
                    && (Math.abs(food.y - this.y) < food.size)) {
                    foodStore[i].needDelete = true;
                    this.ttl += 10000; // TODO: const?
                }
            }
        },
        enumerable: true,
        configurable: true,
        writable: true
    },
});

Creature.prototype.constructor = Creature;
