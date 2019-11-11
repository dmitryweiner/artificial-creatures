import SimpleObject from './object.mjs';

export default class MovingObject extends SimpleObject {

    constructor(x, y, gameField) {
        super(x, y, gameField);
        this.direction = 0;
        this.speed = 0;
        this.maxX = this.gameField.clientWidth;
        this.maxY = this.gameField.clientHeight;
    }

    doTurn() {

        this.vx = this.speed * Math.cos(this.direction) * this.step;
        this.vy = this.speed * Math.sin(this.direction) * this.step;

        this.x += this.vx;
        this.y += this.vy;

        //check borders
        if (this.x < 0) {
            this.x = this.maxX - this.size;
        }

        if (this.y < 0) {
            this.y = this.maxY - this.size;
        }

        if (this.x > (this.maxX - this.size)) {
            this.x = 0;
        }

        if (this.y > (this.maxY - this.size)) {
            this.y = 0;
        }
    }

    redraw() {
        if (this.gameField.isFake) {
            return;
        }

        const element = document.getElementById(this.id);
        element.style.left = this.x + 'px';
        element.style.top = this.y + 'px';
        element.style.transform = 'rotate(' + (this.direction + Math.PI) + 'rad)';
    }
}