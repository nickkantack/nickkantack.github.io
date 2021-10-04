
let UiPiece = {
    COLOR_1: "#FFEEBB",
    COLOR_1_TEXT: "#776633",
    COLOR_2: "#DD4444",
    COLOR_2_TEXT: "#FFFFFF",
    LEVEL_DECREMENT_PIXELS: 4,
    create: function(color, type, position, level) {
        return {
            type: type,
            centerPoint: position,
            color: color,
            xVector: UiPoint.create(1, 0).scale(canonicalScale),
            yVector: UiPoint.create(0.5, Math.sqrt(3) / 2).setLength(canonicalScale),
            z: 0,
            level: level,
            paint: function (canvas, ctx) {

                ctx.strokeStyle = this.color === 0 ? UiPiece.COLOR_1_TEXT : UiPiece.COLOR_2_TEXT;
                ctx.fillStyle = this.color === 0 ? UiPiece.COLOR_1 : UiPiece.COLOR_2;

                let smallerLength = canonicalSize / 2 - this.level * UiPiece.LEVEL_DECREMENT_PIXELS;
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
                let leftPadPixels = canonicalSize / 5;
                let topPadPixels = canonicalSize / 6;
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
    }
}

