
let Board = {
    DEFAULT_SIZE_PIXELS: 50,
    BORDER_MARGIN_PIXELS: 0,
    COLOR_1_ACCESS_COLOR: "#665522",
    COLOR_2_ACCESS_COLOR: "#773333",
    create: function(centerPoint, canvas) {
        let result = {
            xVector: UiPoint.create(1, 0).scale(Board.DEFAULT_SIZE_PIXELS),
            yVector: UiPoint.create(0.5, Math.sqrt(3) / 2).setLength(Board.DEFAULT_SIZE_PIXELS),
            hexColor: "#444444",
            mouseManager: null,
            centerPoint: centerPoint,
            seed: 10,
            isOver: function(position) {
                let indices = this.getBoardIndicesFromPixelCoordinates(position);
                return Math.abs(indices.getX()) < this.seed &&
                 Math.abs(indices.getY()) < this.seed && Math.abs(indices.getX() + indices.getY()) < this.seed;
            },
            getPixelCoordinatesRelativeToBoard: function(position) {
                let point = this.getBoardIndicesFromPixelCoordinates(position);
                return this.getScreenCoordinatesFromIndices(point.getX(), point.getY());
            },
            getBoardIndicesFromPixelCoordinates: function(position) {
                let px = position.getX() - this.centerPoint.getX();
                let py = position.getY() - this.centerPoint.getY();
                let xIndex = (px - py / Math.sqrt(3)) / Board.DEFAULT_SIZE_PIXELS;
                let yIndex = 2 / Math.sqrt(3) * py / Board.DEFAULT_SIZE_PIXELS;
                xIndex = this.round(xIndex);
                yIndex = this.round(yIndex);
                return UiPoint.create(xIndex, yIndex);
            },
            getScreenCoordinatesFromIndices(squaresFromLeft, squaresFromBottom) {
                return this.centerPoint.add(this.xVector.setLength(squaresFromLeft * Board.DEFAULT_SIZE_PIXELS)).add(
                this.yVector.setLength(squaresFromBottom * Board.DEFAULT_SIZE_PIXELS));
            },
            paint: function(canvas, ctx) {

                // Paint all of the squares
                for (let x = -this.seed + 1; x < this.seed; x++) {
                    for (let y = -Math.abs(x + this.seed) + 1; y < Math.abs(x - this.seed); y++) {

                        if (Math.abs(y) >= this.seed) {
                            continue;
                        }

                        let hexCenter = this.centerPoint.add(this.xVector.scale(x).add(this.yVector.scale(y)));
                        this.paintHexAt(hexCenter, canvas, ctx);

                    }
                }

            },
            paintHexAt: function(centerPoint, canvas, ctx) {

                // Pick color based on access
                ctx.fillStyle = this.hexColor;
                let code = this.hexAccessCode(centerPoint);
                if (code === 1) {
                    ctx.fillStyle = Board.COLOR_1_ACCESS_COLOR;
                }
                if (code === 2) {
                    ctx.fillStyle = Board.COLOR_2_ACCESS_COLOR;
                }

                let smallerLength = Board.DEFAULT_SIZE_PIXELS / 2;
                for (let theta = Math.PI / 6; theta < 2 * Math.PI; theta += Math.PI / 3) {
                    let destination = centerPoint.add(this.xVector.rotate(theta).setLength(smallerLength));
                    if (theta === Math.PI / 6) {
                        ctx.beginPath();
                        ctx.moveTo(destination.getX(), canvas.offsetHeight - destination.getY());
                    } else {
                        ctx.lineTo(destination.getX(), canvas.offsetHeight - destination.getY());
                    }
                }
                ctx.closePath();
                ctx.fill();

            },
            round: function(x) {
                return (x > 0 ? 1 : -1) * (Math.floor(Math.abs(x) + 0.5));
            },
			hexAccessCode(centerPoint) {
				// This function uses pieces from hiveBoard.html
                let color1access = this.hexHasNeighbor(centerPoint, 0);
                let color2access = this.hexHasNeighbor(centerPoint, 1);

                if (color1access && !color2access) {
                    return 1;
                }
                if (!color1access && color2access) {
                    return 2;
                }
                return 0;

			},
			hexHasNeighbor(centerPoint, color) {
			    let indices = this.getBoardIndicesFromPixelCoordinates(centerPoint);
			    let x = indices.getX();
			    let y = indices.getY();
			    for (let i = 0; i < 6; i++) {
			        let nx = x;
			        let ny = y;
			        switch(i) {
			            case 0:
                            nx = x + 1;
			            break;
			            case 1:
                            ny = y + 1;
			            break;
			            case 2:
                            nx = x - 1;
                            ny = y + 1;
			            break;
			            case 3:
                            nx = x - 1;
			            break;
			            case 4:
                            ny = y - 1;
			            break;
			            case 5:
			                nx = x + 1;
                            ny = y - 1;
			            break;
			        }

                    let neighborCenterPoint = this.getScreenCoordinatesFromIndices(nx, ny);

                    for (let i = 0; i < pieces.length; i++) {
                        let piece = pieces[i];
                        if (piece.color === color) {
                            if (piece.centerPoint.matches(neighborCenterPoint)) {

                                // We need to make sure this piece is not underneath another, otherwise it doesn't count
                                let foundAPieceAbove = false;
                                for (let j = 0; j < pieces.length; j++) {
                                    if (j !== i) {
                                        let anotherPiece = pieces[j];
                                        if (anotherPiece.centerPoint.matches(piece.centerPoint) &&
                                        anotherPiece.level > piece.level) {
                                            // Then this piece cannot count as a neighbor
                                            foundAPieceAbove = true;
                                            break;
                                        }
                                    }
                                }
                                if (!foundAPieceAbove) {
                                    return true;
                                }
                            }
                        }
                    }
			    }

                return false;

			}
        }

        return result;

    }
}
