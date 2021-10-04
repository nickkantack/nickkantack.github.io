
class Move {

    static build(oldPiece, newLocation, newLevel) {
        return oldPiece + "," + newLocation + "," + newLevel;
    }

    /**
     * Create a move that moves a piece from the offboard position to the specified location. <br><b>Warning:</b> Only
     * use this method to place a piece at level 0, since the level will be assumed to be 0.
     * @param type
     * @param location
     * @param playerIndex
     * @returns {string}
     */
    static spawn(type, playerIndex, location) {
        return Move.build(Piece.build(type, playerIndex, Point.OFFBOARD_POINT), location, 0);
    }

    static list(moves) {
        let result = "";
        for (let i = 0; i < moves.length; i++) {
            result += moves[i].toString();
            if (i < moves.length - 1) {
                result += ",\n";
            }
        }
        console.log(result);
        return result;
    }

    static doMoveStringsMatch(moveString1, moveString2) {
        let parts1 = moveString1.split(",");
        let parts2 = moveString2.split(",");
        let partsToMatch = [0, 1, 2, 3, 5, 6];
        for (let index of partsToMatch) {
            if (parts1[index] !== parts2[index]) {
                return false;
            }
        }
        return true;
    }

    static getOldPieceString(moveString) {
        return StringParser.getMthThruNthCsv(moveString, 0, 4);
    }

    static getNewPieceString(moveString) {
        return StringParser.getMthThruNthCsv(moveString, 0, 1) + "," + StringParser.getMthThruNthCsv(moveString, 5, 7);
    }

    static setNewPieceString(moveString, newPieceString) {
        return StringParser.setMthTruNthCsv(moveString, 5, 7, StringParser.getMthThruNthCsv(newPieceString, 2, 4));
    }

    static buildString(oldPieceString, newPieceString) {
        // TODO room for speed improvement in this method
        return oldPieceString + "," + Piece.getPointString(newPieceString) + "," + Piece.getLevel(newPieceString);
    }

}
