
let UiPiece = {
    COLOR_1: "#FFEEBB",
    COLOR_1_TEXT: "#776633",
    COLOR_2: "#DD4444",
    COLOR_2_TEXT: "#FFFFFF",
    LEVEL_DECREMENT_PIXELS: 4,
    create: function(color, type, position, level) {
        let result = {
            type: type,
            centerPoint: position,
            color: color,
            sizePixels: 50,
            xVector: UiPoint.create(1, 0).scale(80),
            yVector: UiPoint.create(0.5, Math.sqrt(3) / 2).setLength(80),
            z: 0,
            level: level,
            paint: function (canvas, ctx) {

                ctx.strokeStyle = this.color === 0 ? UiPiece.COLOR_1_TEXT : UiPiece.COLOR_2_TEXT;
                ctx.fillStyle = this.color === 0 ? UiPiece.COLOR_1 : UiPiece.COLOR_2;

                let smallerLength = this.sizePixels / 2 - this.level * UiPiece.LEVEL_DECREMENT_PIXELS;
                for (let theta = Math.PI / 6; theta < 2 * Math.PI; theta += Math.PI / 3) {
                    let destination = this.centerPoint.add(this.xVector.rotate(theta).setLength(smallerLength));
                    if (theta === Math.PI / 6) {
                        ctx.beginPath();
                        ctx.moveTo(destination.getX(), canvas.offsetHeight - destination.getY());
                    } else {
                        ctx.lineTo(destination.getX(), canvas.offsetHeight - destination.getY());
                    }
                }
                ctx.closePath();
                ctx.fill();
                if (this.level > 0) { ctx.stroke(); }

                // Add the text of the type

                // Write the string
                ctx.fillStyle = this.color === 0 ? UiPiece.COLOR_1_TEXT : UiPiece.COLOR_2_TEXT;
                ctx.font = "25px Verdana";
                ctx.fontWeight = "bold"
                let leftPadPixels = this.sizePixels / 5;
                let topPadPixels = this.sizePixels / 6;
                ctx.fillText(this.type, this.centerPoint.getX() - leftPadPixels,
                    canvas.offsetHeight - this.centerPoint.getY() + topPadPixels);

            },
            copy: function() {
                return UiPiece.create(this.color, this.type, this.centerPoint, this.level);
            },
            toPieceString() {
                let coordinates = board.getBoardIndicesFromPixelCoordinates(this.centerPoint);
                return this.type + "," + this.color + "," + coordinates.getX() + "," + coordinates.getY() + "," + this.level;
            }
        }

        // Adjust for screen
        if (screen.width < transitionScreenWidth) {
            result.sizePixels = 80;
            result.xVector = UiPoint.create(1, 0).scale(110);
            result.yVector = UiPoint.create(0.5, Math.sqrt(3) / 2).setLength(110);
        }

        return result;
    }
}

