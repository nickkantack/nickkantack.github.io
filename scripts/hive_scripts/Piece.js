
class Piece {

    static QUEEN = "Q";
    static BEETLE = "B";
    static ANT = "A";
    static MOSQUITO = "M";
    static GRASSHOPPER = "H";
    static LADYBUG = "L";
    static SPIDER = "S";
    static PILLBUG = "P";

    static PIECE_TYPES = [Piece.QUEEN, Piece.BEETLE, Piece.ANT, Piece.MOSQUITO, Piece.GRASSHOPPER, Piece.LADYBUG, Piece.SPIDER, Piece.PILLBUG];

    static PIECE_COUNTS_BY_TYPE = {
        "Q": 1,
        "B": 2,
        "A": 3,
        "M": 1,
        "G": 3,
        "L": 1,
        "S": 2,
        "P": 1,
    }

    // Expanded
    static PIECE_COUNTS = [1, 2, 3, 1, 3, 1, 2, 1]
    // Simple
    // static PIECE_COUNTS = [1, 2, 3, 0, 3, 0, 2, 0];

    static PIECE_MATCH_POINT_ERROR_MESSAGE = "It looks like you're checking if a point matches a piece. This is probably a mistake.";
    static PLAYER_INDEX_POINT_SWAP_ERROR_MESSAGE = "Player index should not be string. Did you pass a point as the second argument to Piece.build?";

    static UNINITIALIZED_QUEEN = "";

    static build(type, playerIndex, point, level) {
        if (typeof level === "undefined") {
            level = 0;
        }
        if (typeof playerIndex === "string") {
            throw new Error(Piece.PLAYER_INDEX_POINT_SWAP_ERROR_MESSAGE);
        }
        return type + "," + playerIndex + "," + point + "," + level;
    }

    static getPointString(pieceString) {
        return StringParser.getMthThruNthCsv(pieceString, 2, 3);
    }

    static setPointString(pieceString, pointString) {
        return StringParser.setMthTruNthCsv(pieceString, 2, 3, pointString);
    }

    static getType(pieceString) {
        return StringParser.getNthCsv(pieceString, 0);
    }

    static getPlayerIndex(pieceString) {
        return StringParser.getNthCsvInt(pieceString, 1);
    }

    static getLevel(pieceString) {
        return StringParser.getNthCsvInt(pieceString, 4);
    }

    static setLevel(pieceString, level) {
        return StringParser.setNthCsv(pieceString, 4, level);
    }

    static matchWithoutLevel(piece1, piece2) {
        return Piece.getType(piece1) === Piece.getType(piece2) &&
            Piece.getPlayerIndex(piece1) === Piece.getPlayerIndex(piece2) &&
            Piece.getPointString(piece1) === Piece.getPointString(piece2);
    }

}