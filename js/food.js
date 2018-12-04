'use strict';

function Food(x, y) {
    SimpleObject.call(this, x, y); // parent constructor
    this.size = Creature.prototype.SIZE;
    this.sign = getEmojiForFood();
}

Food.prototype = Object.create(SimpleObject.prototype, {
    SIZE: {
        value: 20,
        enumerable: true,
        configurable: true,
        writable: false
    },
    createDOMElement: {
        value: function() {
            const element = document.createElement('div');
            const gameField = document.getElementById(GAME_FIELD_ID);
            element.setAttribute('id', this.id);
            element.innerHTML = this.sign;
            element.setAttribute('class', 'food');
            element.style.left = this.x + 'px';
            element.style.top = this.y + 'px';
            gameField.appendChild(element);
        },
        enumerable: true,
        configurable: true,
        writable: true
    },
});

Food.prototype.constructor = Food;

