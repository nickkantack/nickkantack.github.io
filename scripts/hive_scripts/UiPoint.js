/**
 * This class is designed to never change the original point. All
 * transformations on the original point are provided as standalone
 * copies that do not alter the original point.
 */

let UiPoint = {
    create: function(x, y) {
        return {
            x: x,
            y: y,
            getX() {
                return this.x;
            },

            getY() {
                return this.y;
            },

            setX(newX) {
                this.x = newX;
            },

            setY(newY) {
                this.y = newY;
            },

            add(translationPoint) {
                return UiPoint.create(translationPoint.getX() + this.x, translationPoint.getY() + this.y);
            },

            sub(subPoint) {
                return UiPoint.create(this.x - subPoint.getX(), this.y - subPoint.getY());
            },

            rotate(centerPoint, angleRad) {
                let centerToPoint = this.sub(centerPoint);
                let newCenterToPoint = UiPoint.create(centerToPoint.getX() * Math.cos(angleRad) - centerToPoint.getY * Math.sin(angleRad),
                    centerToPoint.getY() * Math.cos(angleRad) + centerToPoint.getX() * Math.sin(angleRad));
                return centerPoint.add(newCenterToPoint);
            },

            rotate(angleRad) {
                return UiPoint.create(this.x * Math.cos(angleRad) - this.y * Math.sin(angleRad),
                    this.y * Math.cos(angleRad) + this.x * Math.sin(angleRad));
            },

            CP(otherPoint) {
                return this.x * otherPoint.getY() - this.y * otherPoint.getX();
            },

            mag() {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            },

            scale(factor) {
                return UiPoint.create(this.x * factor, this.y * factor);
            },

            setLength(length) {
                if (this.mag() === 0) { return UiPoint.create(0, 0); }
                return this.scale(length / this.mag());
            },

            print() {
                return this.x + ", " + this.y;
            },
            matches(point) {
                return this.x === point.getX() && this.y === point.getY();
            },
            copy() {
                return UiPoint.create(this.x, this.y);
            }
        }
    }
}
