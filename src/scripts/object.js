import { generateId } from './utils';

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
        const element = document.createElement('div');
        element.setAttribute('id', this.id);
        this.gameField.appendChild(element);
    }

    deleteDOMElement() {
        const element = document.getElementById(this.id);
        element.parentNode.removeChild(element);
    }
}
