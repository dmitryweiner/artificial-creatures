import { generateId } from './utils.mjs';

export default class SimpleObject {

    static SIZE = 10;

    constructor(x, y, gameField) {
        this.id = generateId();
        this.gameField = gameField;
        this.x = x;
        this.y = y;
        this.size = SimpleObject.SIZE;
        this.needDelete = false;
    }

    createDOMElement() {
        if (this.gameField.isFake) {
            return;
        }

        const element = document.createElement('div');
        element.setAttribute('id', this.id);
        this.gameField.appendChild(element);
    }

    deleteDOMElement() {
        if (this.gameField.isFake) {
            return;
        }

        const element = document.getElementById(this.id);
        element.parentNode.removeChild(element);
    }
}
