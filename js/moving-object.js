'use strict';

function MovingObject(x, y) {
    SimpleObject.call(this, x, y);
    this.direction = 0;
    this.speed = 0;
    this.size = MovingObject.prototype.SIZE; // get from image
}

MovingObject.prototype = Object.create(SimpleObject.prototype, {
    doTurn: {
        value: function(maxX, maxY) {

            this.vx = this.speed * Math.cos(this.direction) * this.step;
            this.vy = this.speed * Math.sin(this.direction) * this.step;

            this.x += this.vx;
            this.y += this.vy;

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
        enumerable: true,
        configurable: true,
        writable: false
    },
    redraw: {
        value: function() {
            const element = document.getElementById(this.id);
            element.style.left = this.x + 'px';
            element.style.top = this.y + 'px';
            element.style.transform =  'rotate(' + (this.direction + Math.PI) + 'rad)';
        },
        enumerable: true,
        configurable: true,
        writable: false
    },
});

MovingObject.prototype.constructor = MovingObject;
