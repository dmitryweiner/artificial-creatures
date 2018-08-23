'use strict';

const Game = (function () {
    const DELAY = 250;

    let score;
    let currentState = 0;
    let gameFieldId;
    let maxX = 0, maxY = 0;
    const pigeons = [];

    function MovingObject(x, y) {
        this.id = generateId();
        this.x = x;
        this.y = y;
        this.direction = 0;
        this.mass = 1;
        this.size = MovingObject.prototype.SIZE; // get from image
        this.needDelete = false;

        this.createElement();
    }

    MovingObject.prototype = {
        SIZE: 10,
        doTurn: function() {
            switch(this.direction) {
                case 1:
                    this.y -= this.step;
                    break;
                case 2:
                    this.x += this.step;
                    break;
                case 3:
                    this.y += this.step;
                    break;
                case 4:
                    this.x -= this.step;
                    break;
                default:
                    break;
            }

            //check borders
            if (this.x < 0) {
                this.x = 0;
            }

            if (this.y < 0) {
                this.y = 0;
            }

            if (this.x > (maxX - this.size)) {
                this.x = maxX - this.size;
            }

            if (this.y > (maxY - this.size)) {
                this.y = (maxY - this.size);
            }
        },
        createElement: function() {
            const element = document.createElement("div");
            const gameField = document.getElementById(gameFieldId);
            element.setAttribute("id", this.id);
            gameField.appendChild(element);
        },
        deleteElement: function() {
            const element = document.getElementById(this.id);
            element.parentNode.removeChild(element);
        },
        redraw: function() {
            const element = document.getElementById(this.id);
            const angle = (this.direction - 1) * 90;

            element.style.left = this.x + 'px';
            element.style.top = this.y + 'px';
            element.style.transform =  'rotate(' + angle + 'deg)';
        },
    };

    function Pigeon(x, y) {
        MovingObject.call(this, x, y);
        this.ttl = 120000 - Math.random() * 6000;
        this.size = Pigeon.prototype.SIZE; // TODO: get from image
        this.step = 1;
    }

    Pigeon.prototype = Object.create(MovingObject.prototype, {
        SIZE: {
            value: 100, // TODO: get from image
            enumerable: true,
            configurable: true,
            writable: false
        },
        doTurn: {
            value: function(){

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
        createElement: {
            value: function() {
                const element = document.createElement("div");
                const gameField = document.getElementById(gameFieldId);
                element.setAttribute("id", this.id);
                element.setAttribute("class", "pigeon");
                gameField.appendChild(element);
            },
            enumerable: true,
            configurable: true,
            writable: true
        },
    });
    Pigeon.prototype.constructor = Pigeon;

    /* ============= /MODELS =============== */

    function init(id, newMaxX, newMaxY) {
        maxX = newMaxX;
        maxY = newMaxY;
        gameFieldId = id;
        score = 0;
        createPigeons();
        currentState = 1;
    }

    function createPigeons() {
        for (let i = 0; i < 10; i++) {
            const pigeon = new Pigeon(
                (maxX - Pigeon.prototype.SIZE) * Math.random(),
                (maxY - Pigeon.prototype.SIZE) * Math.random()
            );
            pigeons.push(pigeon);
        }
    }

    function handlePigeons() {
        for (let i = 0; i < pigeons.length; i++) {
            pigeons[i].doTurn();
            if (pigeons[i].needDelete) {
                pigeons.splice(i, 1);
            }
        }
    }

    function checkIfGameOver() {
        return false;
    }

    function run() {
        if (currentState == 1) {
            handlePigeons();
            if (checkIfGameOver()) {
                currentState = 2;
            }
        }
    }

    return {
        DELAY: DELAY,
        init: init,
        getCurrentState: function() { return currentState;},
        run: run
    }
})();