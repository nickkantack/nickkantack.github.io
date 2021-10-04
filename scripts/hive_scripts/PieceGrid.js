
class PieceGrid {

    static NO_PIECE = "";

    /**
     * Keys are points, values are lists of piece strings
     */
    grid = {};

    constructor() {
        this.initializeGrid();
    }

    initializeGrid() {
        this.grid = {};
    }


    getPiecesAt(pointString) {
        if (this.grid.hasOwnProperty(pointString)) {
            return this.grid[pointString];
        } else {
            return [];
        }
    }

    /**
     * This method leverages the fact that piece string lists are in top-to-bottom order, so if there are any pieces
     * at this point, the first in the list is the top most.
     * @param pointString
     * @returns {string|*}
     */
    getTopPieceAt(pointString) {
        let pieces = this.getPiecesAt(pointString);
        if (pieces.length === 0) {
            return PieceGrid.NO_PIECE;
        } else {
            return pieces[0];
        }
    }

    removeTopPieceAt(pointString) {
        let pieces = this.getPiecesAt(pointString);
        if (pieces.length > 0) {
            pieces.splice(0, 1);
        }
        if (pieces.length === 0) {
            delete this.grid[pointString];
        }
    }

    /**
     * This method adds a piece to the grid and sorts existing pieces at that point so they are in top-to-bottom order
     * @param piece
     * @param pointString
     */
    putPieceAt(pieceString, pointString) {
        // Add the point and also sort on level so that the first index is the highest piece
        if (!this.grid.hasOwnProperty(pointString)) {
            this.grid[pointString] = [pieceString];
            // Nothing more to do
        } else {
            // Force the level of the piece string to conform to the number of pieces in this point prior to adding
            let pieceList = this.grid[pointString];
            pieceString = Piece.setLevel(pieceString, pieceList.length);
            pieceString = Piece.setPointString(pieceString, pointString);
            pieceList.unshift(pieceString);
        }
    }
}