'use strict';

function SimpleObject(x, y) {
    this.id = generateId();
    this.x = x;
    this.y = y;
    this.size = SimpleObject.prototype.SIZE;
    this.needDelete = false;
}

SimpleObject.prototype = {
    SIZE: 10,
    createDOMElement: function() {
        const element = document.createElement('div');
        const gameField = document.getElementById(GAME_FIELD_ID);
        element.setAttribute('id', this.id);
        gameField.appendChild(element);
    },
    deleteElement: function() {
        const element = document.getElementById(this.id);
        element.parentNode.removeChild(element);
    },
};
