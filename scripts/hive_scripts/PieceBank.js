

function createPieceBank(paintStackManager, mouseManager) {
    mouseManager.registerClickAction(function(piece) {

        // Create another piece in the start location
        let indices = board.getBoardIndicesFromPixelCoordinates(piece.centerPoint);
        if (!board.isOver(piece.centerPoint)) {
            heldPiecePreviousCoordinates = UiPoint.create(Point.OFFBOARD, Point.OFFBOARD);
            heldPiecePreviousLevel = piece.level;

            if (!isPieceTypeMaxedOut(piece.type, piece.color)) {
                createAPiece(paintStackManager, mouseManager, piece.type, piece.color,
                    indices.getX(), indices.getY(), piece.level);
            }
        } else {
            heldPiecePreviousCoordinates = piece.centerPoint.copy();
            heldPiecePreviousLevel = piece.level;
        }
    });

    repaintBank();

}

function repaintBank() {

    // Remove all pieces from the bank
    for (let i = pieces.length - 1; i >= 0; i--) {
        let piece = pieces[i];
        if (!board.isOver(piece.centerPoint)) {
            deletePiece(piece);
        }
    }

    // Now replace each piece if it's not maxed out
    let bankPositionByPieceTypeWide = {
        "Q": UiPoint.create(9, 4),
        "H": UiPoint.create(11, 4),
        "A": UiPoint.create(10, 2),
        "S": UiPoint.create(12, 2),
        "L": UiPoint.create(11, 0),
        "P": UiPoint.create(13, 0),
        "M": UiPoint.create(12, -2),
        "B": UiPoint.create(14, -2),
    }
    let bankPositionByPieceTypeNarrow = {
        "Q": UiPoint.create(1, -10),
        "H": UiPoint.create(-1, -9),
        "A": UiPoint.create(2, -9),
        "S": UiPoint.create(5, -9),
        "L": UiPoint.create(8, -9),
        "P": UiPoint.create(7, -10),
        "M": UiPoint.create(10, -10),
        "B": UiPoint.create(4, -10),
    }

    // Set piece bank location based on screen width
    let bankPositionByPieceType = screen.width < transitionScreenWidth ? bankPositionByPieceTypeNarrow : bankPositionByPieceTypeWide;

    for (let pieceType of Piece.PIECE_TYPES) {
        if (!isPieceTypeMaxedOut(pieceType, currentColor)) {
            let bankPoint = bankPositionByPieceType[pieceType];
            createAPiece(paintStackManager, mouseManager, pieceType, currentColor, bankPoint.getX(), bankPoint.getY(), 0);
        }
    }
    paintStackManager.paint();

}