
class Hive extends Game {

    playerTurnIndex = 0;
    numberOfPlayers = 2;

    // Helpful references for fast computation
    queensByPlayer = [Piece.UNINITIALIZED_QUEEN, Piece.UNINITIALIZED_QUEEN];

    /**
     * A list of {@link Move} which, if executed in order, result in the current game state
     * @type {*[]}
     */
    moveHistory = [];

    static MUST_PASS = "MUST_PASS";
    static SURROUNDING_POINTS_COUNT = 6;
    static PRACTICALLY_INFINITY = 999999;

    /**
     * A list of {@link Piece} that contains all the pieces on the board
     * @type {*[]}
     */
    pieces = {};

    /**
     * One dictionary per player, keys are piece type, values are the number played
     * @type {*[]}
     */
    pieceCountsByPlayerByType = [];

    pieceCountByPlayer = [0, 0];

    /**
     * A 2D array that serves as a lookup for pieces by indices
     * @type {PieceGrid}
     */
    pieceGrid = new PieceGrid();

    cachedPossibleMoves = {};
    cachedEmpties = {};
    cachedEmptiesByPlayer = {};
    cachedMobilePieceCountByPlayer = {};
    cachedPieceCountByPlayer = {};
    cachedPointsContainingPieces = {};
    cachedPiecePointsTouchingEmpty = {};
    cachedPiecesThatArentBridges = {};
    /**
     * Use the cache below as infrequently as possible. It is really a helper to calculate the one above.
     * @type {{}}
     */
    cachedPiecesThatAreBridges = {};

    constructor() {
        super();
        this.reset();
    }

    reset () {
        this.queensByPlayer = [Piece.UNINITIALIZED_QUEEN, Piece.UNINITIALIZED_QUEEN];
        this.moveHistory = [];
        this.pieces = {};
        this.playerTurnIndex = 0;
        this.pieceGrid = new PieceGrid();
        this.pieceCountByPlayer = [0, 0];
        this.pieceCountsByPlayerByType = [{}, {}];
        for (let i = 0; i < 2; i++) {
            for (let pieceType of Piece.PIECE_TYPES) {
                this.pieceCountsByPlayerByType[i][pieceType] = 0;
            }
        }
        this.updateCaches();
    }

    getMoves() {
        return this.cachedPossibleMoves;
    }

    /**
     *
     * @param move - The move made, as a string
     */
    unmakeMove(move) {

        let otherPlayerIndex = Math.abs(1 - this.playerTurnIndex);

        if (move === Hive.MUST_PASS && this.moveHistory[this.moveHistory.length - 1] === Hive.MUST_PASS) {
            this.playerTurnIndex = otherPlayerIndex;
            this.moveHistory.splice(this.moveHistory.length - 1, 1);
            return;
        }

        // Out with the old
        let newPiece = Move.getNewPieceString(move);
        let oldPiece = Move.getOldPieceString(move);
        delete this.pieces[newPiece];
        let newPoint = Piece.getPointString(newPiece);
        let oldPoint = Piece.getPointString(oldPiece);
        this.pieceGrid.removeTopPieceAt(newPoint);
        if (oldPoint !== Point.OFFBOARD_POINT) {
            this.pieceGrid.putPieceAt(oldPiece, oldPoint);
            // This is intentional. Place in the pieceGrid first (auto sets the level), THEN take from the piece grid
            // to add to the pieces list.
            this.pieces[this.pieceGrid.getTopPieceAt(oldPoint)] = "";
        } else {
            let oldPlayerIndex = Piece.getPlayerIndex(oldPiece);
            this.pieceCountsByPlayerByType[oldPlayerIndex][Piece.getType(oldPiece)] -= 1;
            this.pieceCountByPlayer[oldPlayerIndex] -= 1;
        }
        if (move !== this.moveHistory[this.moveHistory.length - 1]) {
            console.log(this.moveHistory);
            console.log(move);
            throw new Error("Tried to unmake move " + move + ", but it was not the most recent move made. " +
                (this.moveHistory.length > 1 ? ("Last move was " + this.moveHistory[this.moveHistory.length - 1]) : "Move history was empty") +
                ".");
        }
        this.moveHistory.splice(this.moveHistory.length - 1, 1);

        // Update the handles on the queens if this move moved a queen
        // Note that the unmade move was originally made by the other player
        if (Piece.getType(oldPiece) === Piece.QUEEN) {
            if (oldPoint === Point.OFFBOARD_POINT) {
                this.queensByPlayer[otherPlayerIndex] = Piece.UNINITIALIZED_QUEEN;
            } else {
                this.queensByPlayer[otherPlayerIndex] = oldPiece;
            }
        }

        this.playerTurnIndex = otherPlayerIndex;

        // DON'T update caches, since this would lead to a lot of waste in the tree search. It is up to the caller of
        // this method to update caches if they do not intend to immediately make a new move.
    }

    makeMove(moveString, isLight) {

        if (typeof isLight === "undefined") {
            isLight = false;
        }

        if (moveString === Hive.MUST_PASS) {
            this.playerTurnIndex = Math.abs(1 - this.playerTurnIndex);
            this.moveHistory.push(Hive.MUST_PASS);
            return;
        }

        // Out with the old
        let oldPiece = Move.getOldPieceString(moveString);
        let oldPoint = Piece.getPointString(oldPiece);
        let oldPieceType = Piece.getType(oldPiece);
        delete this.pieces[oldPiece];
        if (oldPoint !== Point.OFFBOARD_POINT) {
            this.pieceGrid.removeTopPieceAt(oldPoint);
        } else {
            this.pieceCountsByPlayerByType[this.playerTurnIndex][oldPieceType] += 1;
            this.pieceCountByPlayer[this.playerTurnIndex] += 1;
        }

        // In with the new
        // Edit the new piece in the move to ensure its level puts it above the stack
        let newPieceUnvettedString = Move.getNewPieceString(moveString);
        let newPointString = Piece.getPointString(newPieceUnvettedString);
        // TODO this could be sped up if putPieceAt returned a piece count and you caught that here for level setting.
        this.pieceGrid.putPieceAt(newPieceUnvettedString, newPointString);
        // Ensure that the new piece level in moveString is correct.
        let newPieceVettedString = this.pieceGrid.getTopPieceAt(newPointString);
        moveString = Move.setNewPieceString(moveString, newPieceVettedString);
        this.moveHistory.push(moveString);
        this.pieces[newPieceVettedString] = "";
        // Update the handles on the queens if this move moved a queen
        if (oldPieceType === Piece.QUEEN) {
            this.queensByPlayer[this.playerTurnIndex] = newPieceVettedString;
        }

        this.playerTurnIndex = Math.abs(1 - this.playerTurnIndex);

        this.updateCaches(isLight);
    }
    /*
    copy() {
        let newHive = new Hive();
        newHive.queensByPlayer = [this.queensByPlayer[0].copy(), this.queensByPlayer[1].copy()];
        for (let i = 0; i < this.moveHistory.length; i++) {
            newHive.moveHistory.push(this.moveHistory[i].copy());
        }
        for (let i = 0; i < this.pieces.length; i++) {
            newHive.pieces.push(this.pieces[i].copy());
        }
        newHive.playerTurnIndex = this.playerTurnIndex;
        let newPieceGrid = new PieceGrid();
        for (let i = 0; i < newHive.pieces.length; i++) {
            let piece = newHive.pieces[i];
            newPieceGrid.putPieceAt(piece, piece.getPoint());
        }
        newHive.pieceGrid = newPieceGrid;
        newHive.updateCaches();
        return newHive;
    }
    */
    getWinningPlayerIndex() {

        // If either player doesn't have a queen on the board, neither player could have won.
        if (this.queensByPlayer[0] === Piece.UNINITIALIZED_QUEEN || this.queensByPlayer[1] === Piece.UNINITIALIZED_QUEEN) {
            return Game.NO_WINNER_PLAYER_INDEX;
        }

        // TODO consult the cached liberties of the queen, don't recalculate them here
        let isPlayerQueenSurrounded = [true, true];
        for (let playerIndex = 0; playerIndex < 2; playerIndex++) {
            let surroundingPoints = Object.keys(Hive.getSurroundingPoints(Piece.getPointString(this.queensByPlayer[playerIndex])));
            for (let i = 0; i < Hive.SURROUNDING_POINTS_COUNT; i++) {
                if (this.pieceGrid.getTopPieceAt(surroundingPoints[i]) === PieceGrid.NO_PIECE) {
                    isPlayerQueenSurrounded[playerIndex] = false;
                    break;
                }
            }
        }

        if (isPlayerQueenSurrounded[0]) {
            if (isPlayerQueenSurrounded[1]) {
                return Game.NO_WINNER_PLAYER_INDEX;
            } else {
                return 1;
            }
        } else {
            if (isPlayerQueenSurrounded[1]) {
                return 0;
            } else {
                return Game.NO_WINNER_PLAYER_INDEX;
            }
        }

    }

    isOneHive() {
        let empties = {};
        let emptiesPlayer0 = {};
        let emptiesPlayer1 = {};
        let piecesVisited = [];
        this.cachedPiecePointsTouchingEmpty = {};
        this.cachedPiecesThatArentBridges = {};
        this.cachedPiecesThatAreBridges = {};

        let keys = Object.keys(this.pieces);

        if (keys.length > 0) {
            // Just need any piece to start from (but not the comment below)
            let seedPieceString = keys[0];

            // Make sure we start with the TOP piece at this point, since this algorithm should only visit top pieces.
            seedPieceString = this.getTopPieceAt(Piece.getPointString(seedPieceString));

            // console.log("Starting algorithm with these pieces:");
            // console.log(this.pieces);

            this.getEmptyBorderPointsKernel(seedPieceString, empties, emptiesPlayer0,
                emptiesPlayer1, piecesVisited, Hive.PRACTICALLY_INFINITY);
        }

        // Make sure any pieces flagged as definite bridges are removed from the cached of piece's that aren't
        // console.log("Finally, removing these definite bridge pieces");
        // console.log(this.cachedPiecesThatAreBridges);
        for (let bridgePiece in this.cachedPiecesThatAreBridges) {
            delete this.cachedPiecesThatArentBridges[bridgePiece];
        }

        // console.log("Ending algorithm with these non-bridges");
        // console.log(this.cachedPiecesThatArentBridges);

        // If any piece in pieces is a top piece and not in the visited pieces, oneHive is broken
        for (let piece of this.pieces) {
            if (!piecesVisited.hasOwnProperty(piece) && piece !== this.getTopPieceAt(Piece.getPointString(piece))) {
                return false;
            }
        }
        return true;
    }

    /**
     * Empty border points are those on the board that are adjacent to pieces but are themselves empty.
     * @param seedPiece
     * @returns a 4 element array
     *      element 0 - a list of all empty border points
     *      element 1 - a list of all empty border points adjacent to only player 0 pieces
     *      element 2 - a list of all empty border points adjacent to only player 1 pieces
     *      element 3 - the number of pieces that are attached to the same block as seedPiece. The purpose of this
     *                  result is that it can quickly determine if the game board has disconnected blocks (by checking
     *                  if this element is less than the number of pieces on the board).
     */
    getEmptyBorderPoints() {

        let empties = {};
        let emptiesPlayer0 = {};
        let emptiesPlayer1 = {};
        let piecesVisited = [];
        this.cachedPiecePointsTouchingEmpty = {};
        this.cachedPiecesThatArentBridges = {};
        this.cachedPiecesThatAreBridges = {};

        let keys = Object.keys(this.pieces);

        if (keys.length > 0) {
            // Just need any piece to start from (but not the comment below)
            let seedPieceString = keys[0];

            // Make sure we start with the TOP piece at this point, since this algorithm should only visit top pieces.
            seedPieceString = this.getTopPieceAt(Piece.getPointString(seedPieceString));

            // console.log("Starting algorithm with these pieces:");
            // console.log(this.pieces);

            this.getEmptyBorderPointsKernel(seedPieceString, empties, emptiesPlayer0,
                emptiesPlayer1, piecesVisited, Hive.PRACTICALLY_INFINITY);
        }

        // Make sure any pieces flagged as definite bridges are removed from the cached of piece's that aren't
        // console.log("Finally, removing these definite bridge pieces");
        // console.log(this.cachedPiecesThatAreBridges);
        for (let bridgePiece in this.cachedPiecesThatAreBridges) {
            delete this.cachedPiecesThatArentBridges[bridgePiece];
        }

        // console.log("Ending algorithm with these non-bridges");
        // console.log(this.cachedPiecesThatArentBridges);

        return [empties, emptiesPlayer0, emptiesPlayer1, Object.keys(piecesVisited).length];

    }

    getEmptyBorderPointsKernel(seedPieceString, empties, emptiesPlayer0, emptiesPlayer1, piecesVisited, discountThreshold) {
        let thisPieceVisitIndex = piecesVisited.length;
        piecesVisited.push(seedPieceString);
        let seedPiecePointString = Piece.getPointString(seedPieceString);
        let surroundingPointStrings = Hive.getSurroundingPoints(seedPiecePointString);
        // console.log("We're at piece " + seedPiecePointString + " with a discountThreshold of " + discountThreshold);
        function accountForDiscount(index) {
            if (discountThreshold === Hive.PRACTICALLY_INFINITY) {
                return index;
            } else {
                return index <= discountThreshold ? -index : index - discountThreshold;
            }
        }
        let myOldestRevisit = accountForDiscount(thisPieceVisitIndex);
        // console.log("I'm at");
        // console.log(seedPieceString);
        // console.log("My visited pieces, in order are");
        // console.log(piecesVisited);
        // console.log("And I'm multiplying by negative one any visited piece index equal to or below " + discountThreshold);
        let thisIsStartingPointAndItHasOnlyOneChild = false;
        // In order to properly handle the starting point, we need to peek ahead just for the starting piece and see
        // if it has only one child
        if (piecesVisited.length === 1) {
            // console.log("This is my starting piece");
            let childCount = 0;
            for (let point in surroundingPointStrings) {
                let piece = this.pieceGrid.getTopPieceAt(point);
                if (piece !== PieceGrid.NO_PIECE) {
                    childCount++;
                }
            }
            if (childCount === 1) {
                thisIsStartingPointAndItHasOnlyOneChild = true;
                // console.log("The starting point has only one child so it better show up in the non-bridge list");
            }
        }
        let foundAnyUnvisitedChild = false;
        for (let point in surroundingPointStrings) {
            let piece = this.pieceGrid.getTopPieceAt(point);
            if (piece === PieceGrid.NO_PIECE) {
                // Regardless of whether this empty has been encountered before, cache that this piece is touching this
                // empty.
                if (this.cachedPiecePointsTouchingEmpty.hasOwnProperty(point)) {
                    this.cachedPiecePointsTouchingEmpty[point].push(seedPiecePointString);
                } else {
                    this.cachedPiecePointsTouchingEmpty[point] = [seedPiecePointString];
                }
                // Now do things based on whether the empty is a new one.
                if (!empties.hasOwnProperty(point)) {
                    empties[point] = "";
                    // This could be any empty for the player who owns seedPiece, but it CANNOT be an empty for the player
                    // that does not own seedPiece.
                    if (Piece.getPlayerIndex(seedPieceString) === 0) {
                        emptiesPlayer0[point] = "";
                    } else {
                        emptiesPlayer1[point] = "";
                    }
                } else {
                    // Then this empty has previously been counted. See if it should be removed
                    // from either player list on account of the player that owns seedPiece
                    if (Piece.getPlayerIndex(seedPieceString) === 0) {
                        delete emptiesPlayer1[point];
                    } else {
                        delete emptiesPlayer0[point];
                    }
                }
            } else {
                // Check if it's a unique piece
                let pieceString = piece.toString();
                // console.log("I'm carrying an oldest visited non-parent ancestor of ");
                // console.log(myOldestRevisit);
                // console.log("Hit another piece:");
                // console.log(pieceString);
                let isUnvisited = !piecesVisited.includes(pieceString);
                let rivalIndex = -333;
                if (isUnvisited) {
                    // console.log("This is an unvisited child.");
                    foundAnyUnvisitedChild = true;
                    rivalIndex = this.getEmptyBorderPointsKernel(pieceString, empties, emptiesPlayer0, emptiesPlayer1, piecesVisited, discountThreshold);
                    // console.log("Returning to perspective from parent:");
                    // console.log(seedPieceString);
                    // console.log("Who currently has an oldest revisit of " + myOldestRevisit + " and an index of " + accountForDiscount(thisPieceVisitIndex));
                    // console.log("I just got an oldest revisited ancestor index of " + rivalIndex);
                    // console.log("Adjusting for discount, that's " + rivalIndex);
                    // For children pieces, any rival index better than this piece's index is acceptable
                    if (rivalIndex >= accountForDiscount(thisPieceVisitIndex)) {
                        // This piece is a bridge UNLESS it is the first in the visited list. Then it might not be a bridge.
                        // If this is the original piece and it only has 1 neighbor, could mark this piece now as a non-bridge.
                        // console.log("This rival index is above my parent's index, so my child did not independently" +
                        // " connect to their grandparent or earlier.");
                        if (thisIsStartingPointAndItHasOnlyOneChild) {
                            // console.log("Since this is the starting piece and it only has one child, this does not"
                            // + " disqualify it from being a non bridge, so I can now add it as a non-bridge");
                            this.cachedPiecesThatArentBridges[seedPieceString] = "";
                        } else if (discountThreshold !== Hive.PRACTICALLY_INFINITY || seedPieceString !== piecesVisited[0]) {
                            // console.log("Probably should mark this piece (" + seedPieceString + ") as a definite bridge now.");
                            this.cachedPiecesThatAreBridges[seedPieceString] = "";
                        }
                        // Else, do nothing since it will be revealed as a bridge later in this algorithm after the
                        // discount is applied.
                    } else if (rivalIndex < myOldestRevisit) {
                        // console.log("Child connected to an older ancestor (" + rivalIndex + ") than I was previously" +
                        // " able to (" + myOldestRevisit + ") while avoiding my parent. This is my new oldest ancestor visited.");
                        // Then my child seedPieceString found a chain through it's non-me children back to me.
                        myOldestRevisit = rivalIndex;
                    }
                } else {
                    let rivalIndex = piecesVisited.indexOf(pieceString);
                    // console.log("This piece with index (" + rivalIndex + ") was previously visited. Check in case it's a grandparent or higher");
                    // Account for discountThreshold if appropriate
                    rivalIndex = accountForDiscount(rivalIndex);
                    // console.log("After possible reflection the index is " + rivalIndex);
                    if (rivalIndex < accountForDiscount(thisPieceVisitIndex) - 1 && rivalIndex < myOldestRevisit) {
                        // console.log("Updating my oldest revisited ancestor from " + myOldestRevisit + " to " + rivalIndex);
                        myOldestRevisit = rivalIndex;
                    }
                }

                // If we've only branched off from one neighbor of the starting piece,
                // then activate a discount where indices below the current length of visitedPieces
                // will in the future be multiplied by -1. This has the effect of reversing the previously studied
                // chain and treating it like history leading up to the point where we originally started.
                if (discountThreshold === Hive.PRACTICALLY_INFINITY && thisPieceVisitIndex === 0) {
                    // console.log("We're done with the first chain from the starting point. Applying discount: " + (piecesVisited.length - 1));
                    discountThreshold = piecesVisited.length - 1;
                }

            }
        }
        // myOldestRevisit is designed to == thisPieceVisitIndex unless there is a non-direct path from this piece
        // to its parent.
        if (myOldestRevisit < accountForDiscount(thisPieceVisitIndex) || !foundAnyUnvisitedChild) {
            // console.log("At the end, I (" + seedPieceString + ") had a non-parent path to an ancestor " + myOldestRevisit + " or no children, so I'm not a bridge.");
            this.cachedPiecesThatArentBridges[seedPieceString] = "";
        }
        return myOldestRevisit;
    }

    canPieceMove(piece, numberOfPointsContainingPieces) {

        // console.log(piece);

        let point = Piece.getPointString(piece);

        // This piece must be the top most piece at the point specified
        if (piece !== this.pieceGrid.getTopPieceAt(point)) {
            // console.log("Cannot move on account of not being the top of the stack");
            return false;
        }

        // This player must have played their queen before moving any piece
        if (this.queensByPlayer[Piece.getPlayerIndex(piece)] === "") {
            // console.log("Cannot move on account of player " + this.playerTurnIndex + " not having played a queen yet.");
            return false;
        }

        // If this piece is on top of others, we don't need to check if it is a bridge.
        if (this.pieceGrid.getPiecesAt(point).length > 1) {
            // console.log("Can move cause it's on top of other pieces");
            return true;
        }

        // Our recursion is not desired for only two piece. If all other conditions are met, both are moveable.
        if (Object.keys(this.pieces).length === 2) {
            // console.log("Can move because there are only two pieces");
            return true;
        }
        // Starting with one of this piece's neighbors (and ignoring this piece) determine if all remaining pieces
        // on the board are connected.
        // console.log("Can move? It's down to whether it's a bridge: " + this.cachedPiecesThatArentBridges.hasOwnProperty(piece));
        return this.cachedPiecesThatArentBridges.hasOwnProperty(piece);

    }

    getEmptiesARollAway(startPoint) {

        // Some empties might only be borders while the piece at the start point is unmoved. If there is a piece at the
        // start point, it needs to be removed temporarily for calculation of empties
        let empties = this.getEmptyBorderPointsOmitting(startPoint);
        let emptiesARollAway = {};

        this.getEmptiesARollAwayNewKernel(startPoint, emptiesARollAway, empties, 0, 0, true, startPoint);

        return emptiesARollAway;
    }

    getEmptyBorderPointsOmitting(pointString) {
        // Use the cached empties touching pieces to build a dictionary of pieces
        let empties = {};
        for (const candidateEmpty in this.cachedPiecePointsTouchingEmpty) {
            let touchingPieces = this.cachedPiecePointsTouchingEmpty[candidateEmpty];
            // If multiple pieces touch this empty, removing the piece at the specified point won't remove this empty
            if (touchingPieces.length > 1) {
                empties[candidateEmpty] = "";
            }
            // If there is only one touching piece but it's some other piece than the one we're omitting, this empty will stay
            if (touchingPieces.length > 0 && !(touchingPieces[0] === pointString)) {
                empties[candidateEmpty] = "";
            }
        }
        return empties;
    }

    /**
     * Returns an array of information about rolling from this point
     * @param point - the point relative to which roll points should be found
     * @param point - a point that should be treated as if it has no pieces even if pieces are there in the pieceGrid
     * @returns a 3 element array where
     *          element 1 - boolean, whether rolling is even defined for this piece (if false, can't roll). Importantly,
     *                      true does NOT mean the piece necessarily can move, only that if the piece CAN move, there are
     *                      clearly defined clockwise and counter clockwise roll points. This is a requirement for
     *                      rollability, but not sufficient for rollability (e.g. piece could still be a bridge holding
     *                      the gameboard together).
     *          element 2 - the clockwise roll point, if it exists
     *          element 3 - the counterclockwise roll point, if it exists
     */
    getRollPointsAndFreedom(point, ignorePoint) {
        // If roll points are defined, this piece has two neighbor empties that are also mutual neighbors. Starting
        // with either of these, cycling through surrounding points until you hit a point with a game piece will
        // produce the clockwise roll point (point just before hitting a piece), and cycling through surrounding points
        // the other direction until a game piece is hit will produce the counterclockwise roll point in a similar fashion.
        let previousPointWasEmpty = false;
        let previousPointIndex = -1; // Will be updated before it will be expected to be a point
        let clockwiseStartPointIndex = -1;
        let counterclockwiseStartPointIndex = -1;
        let surroundingPoints = Hive.getSurroundingPoints(point);
        let surroundingPointsList = Object.keys(surroundingPoints);
        for (let i = 0; i < Hive.SURROUNDING_POINTS_COUNT + 2; i++) {
            let index = i < Hive.SURROUNDING_POINTS_COUNT ? i : i - Hive.SURROUNDING_POINTS_COUNT; // Allowing wrap around
            let point = surroundingPointsList[index];
            let topPieceHere = this.pieceGrid.getTopPieceAt(point)
            let pointIsEmpty = topPieceHere === PieceGrid.NO_PIECE || point === ignorePoint;
            if (pointIsEmpty && previousPointWasEmpty) {
                clockwiseStartPointIndex = index;
                counterclockwiseStartPointIndex = previousPointIndex;
                // We found what this loop is looking for. We're done.
                break;
            }
            previousPointWasEmpty = pointIsEmpty;
            previousPointIndex = index;
        }
        // It's possible we never found two neighboring empty points, in which case we can return
        if (clockwiseStartPointIndex === -1 && counterclockwiseStartPointIndex === -1) {
            return [false, "", ""];
        }

        let clockwiseRollPoint = "";
        let counterclockwiseRollPoint = "";
        // If we're here, then both start points are valid and the piece does have roll points
        for (let i = clockwiseStartPointIndex; i < clockwiseStartPointIndex + Hive.SURROUNDING_POINTS_COUNT; i++) {
            let index = i < Hive.SURROUNDING_POINTS_COUNT ? i : i - Hive.SURROUNDING_POINTS_COUNT;
            let point = surroundingPointsList[index];
            let topPieceHere = this.pieceGrid.getTopPieceAt(point)
            if (topPieceHere !== PieceGrid.NO_PIECE && point !== ignorePoint) {
                break;
            }
            clockwiseRollPoint = point;
        }
        for (let i = counterclockwiseStartPointIndex; i > clockwiseStartPointIndex - Hive.SURROUNDING_POINTS_COUNT; i--) {
            let index = i >= 0 ? i : i + Hive.SURROUNDING_POINTS_COUNT;
            let point = surroundingPointsList[index];
            let topPieceHere = this.pieceGrid.getTopPieceAt(point)
            if (topPieceHere !== PieceGrid.NO_PIECE && point !== ignorePoint) {
                break;
            }
            counterclockwiseRollPoint = point;
        }
        return [true, clockwiseRollPoint, counterclockwiseRollPoint];
    }

    getEmptiesARollAwayNewKernel(currentPointString, emptiesARollAway, empties, maxDepth, currentDepth, clockwise, originPoint) {
        currentDepth++;
        let result = this.getRollPointsAndFreedom(currentPointString, originPoint);
        if (!result[0]) {
            return false;
        }
        let nextRollPoint = clockwise ? result[1] : result[2];
        // Check if the next roll point is unvisited and not the origin point
        if (!emptiesARollAway.hasOwnProperty(nextRollPoint) && nextRollPoint !== originPoint) {
            // If this connection is through a pinch point, continue (don't jump to it)
            if (maxDepth === 0 || currentDepth === maxDepth) {
                emptiesARollAway[nextRollPoint] = "";
            }
            if (maxDepth === 0 || currentDepth < maxDepth) {
                this.getEmptiesARollAwayNewKernel(nextRollPoint, emptiesARollAway, empties, maxDepth, currentDepth, clockwise, originPoint);
            }
        }
    }

    getEmptiesNRollsAway(startPoint, n) {
        let empties = this.getEmptyBorderPointsOmitting(startPoint);
        let emptiesARollAwayClockwise = {};
        this.getEmptiesARollAwayNewKernel(startPoint, emptiesARollAwayClockwise, empties, n, 0, true, startPoint);
        let emptiesARollAwayCounterclockwise = {};
        this.getEmptiesARollAwayNewKernel(startPoint, emptiesARollAwayCounterclockwise, empties, n, 0, false, startPoint);
        let result = {};
        // TODO below is not the correct way to pack the results into the result object
        for (const pointString in emptiesARollAwayCounterclockwise) {
            result[pointString] = "";
        }
        for (const pointString in emptiesARollAwayClockwise) {
            result[pointString] = "";
        }
        return result;
    }

    getEmptiesAJumpAway(point, empties) {
        let emptiesAJumpAway = {};
        let shifts = [
            Point.build(1, 0),
            Point.build(-1, 0),
            Point.build(1, -1),
            Point.build(-1, 1),
            Point.build(0, 1),
            Point.build(0, -1),
        ];
        for (let shift of shifts) {
            let pointOfConsideration = point;
            for (let step = 0; step < 100; step++) {
                pointOfConsideration = Point.shift(pointOfConsideration, shift);
                let hitAnEmpty = empties.hasOwnProperty(pointOfConsideration);
                if (hitAnEmpty) {
                    if (step > 0) {
                        emptiesAJumpAway[pointOfConsideration] = "";
                        break;
                    }
                    if (step === 0) {
                        // There are no pieces immediately in this direction
                        // TODO unit test for this!
                        break;
                    }
                } else {
                    // Quit this direction if there is no piece here
                    if (this.pieceGrid.getTopPieceAt(pointOfConsideration) === PieceGrid.NO_PIECE) {
                        break;
                    }
                }
            }
        }
        return emptiesAJumpAway;
    }

    /*
    getConnectedPiecesKernel(seedPiece, seedPieceString, visitedPieces, ignorePiece) {
        visitedPieces[seedPieceString] = "";
        let surroundingPoints = Hive.getSurroundingPoints(seedPiece.getPoint());
        for (let i = 0; i < Hive.SURROUNDING_POINTS_COUNT; i++) {
            let point = surroundingPoints[i];
            let piece = this.pieceGrid.getTopPieceAt(point);
            if (piece !== PieceGrid.NO_PIECE && !piece.matches(ignorePiece)) {
                let pieceString = piece.toString();
                let isUnvisited = !visitedPieces.hasOwnProperty(pieceString);
                if (isUnvisited) {
                    this.getConnectedPiecesKernel(piece, pieceString, visitedPieces, ignorePiece);
                }
            }
        }
    }
     */

    getLadyBugMoves(point) {
        let empties = this.getEmptyBorderPointsOmitting(point);
        let ladyBugMoves = {};
        this.getLadyBugMovesKernel(point, point.toString(), empties, ladyBugMoves, 0, point);
        return ladyBugMoves;
    }

    getLadyBugMovesKernel(seedPoint, seedPointString, empties, ladybugMoves, depth, ignorePoint) {
        depth++;
        let surroundingPoints = Hive.getSurroundingPoints(seedPoint);
        for (let point in surroundingPoints) {
            let piece = this.getTopPieceAt(point);
            let pointString = point.toString();
            let validStep = false;
            if (depth < 3 && piece !== PieceGrid.NO_PIECE && point !== ignorePoint) {
                validStep = true;
            }
            if (depth === 3 && piece === PieceGrid.NO_PIECE && empties.hasOwnProperty(pointString) && point !== ignorePoint) {
                validStep = true;
            }
            if (validStep) {
                if (depth === 3 && !ladybugMoves.hasOwnProperty(pointString)) {
                    ladybugMoves[pointString] = "";
                }
                this.getLadyBugMovesKernel(point, pointString, empties, ladybugMoves, depth, ignorePoint);
            }
        }
    }

    updateCaches(isLight) {

        if (typeof isLight === "undefined") {
            isLight = false;
        }

        // Update possible moves
        let placeablePoints = {};
        let placeableTypes = {};
        if (!isLight) {
            this.cachedPossibleMoves = {};
            placeablePoints = {};
            placeableTypes = this.getPlaceableTypes();
        }
        let playerTurnIndex = this.playerTurnIndex;

        this.cachedEmpties = {};
        this.cachedEmptiesByPlayer = [{}, {}];
        this.cachedMobilePieceCountByPlayer = [0, 0];
        let numberOfPointsContainingPieces = 0;

        let pieceCount = this.pieceCountByPlayer[0] + this.pieceCountByPlayer[1];
        if (pieceCount === 0) {
            // This is the opening. The only placeable point is the origin
            placeablePoints["0,0"] = "";
        } else if (pieceCount === 1) {
            // This is the second player opening. The only placeable point is shifted 1, 0 from the origin
            placeablePoints["1,0"] = "";
        } else {
            // The placeable points are dictated by the border hexes.
            let result = this.getEmptyBorderPoints();
            this.cachedEmpties = result[0];
            this.cachedEmptiesByPlayer[0] = result[1];
            this.cachedEmptiesByPlayer[1] = result[2];
            numberOfPointsContainingPieces = result[3];
            placeablePoints = this.cachedEmptiesByPlayer[this.playerTurnIndex];
        }

        // Add all of the placement moves
        if (!isLight) {
            for (const type in placeableTypes) {
                for (const pointString in placeablePoints) {
                    // let point = Point.fromString(pointString);
                    // let oldPiece = new Piece(type, Point.getOffboardPoint(), this.playerTurnIndex);
                    // let newPiece = new Piece(type, point, this.playerTurnIndex);
                    // let move = new Move(oldPiece, newPiece);
                    // let moveString = move.toString();
                    // Try direct string construction since it's liable to be faster
                    let moveString = type + "," + this.playerTurnIndex + ",99,99,0," + pointString + ",0";
                    this.cachedPossibleMoves[moveString] = "";
                }
            }
        }

        // Count pieces for winning probability estimation
        this.cachedPieceCountByPlayer = [0, 0];
        for (let pieceString in this.pieces) {
            // let piece = Piece.fromString(pieceString);
            // Avoid object creation when a string parse will do, for speed reasons
            this.cachedPieceCountByPlayer[Piece.getPlayerIndex(pieceString)]++;
        }

        // If the queen is not yet placed for this player, there are no crawl moves allowed
        let isQueenPlaced = this.queensByPlayer[this.playerTurnIndex] !== Piece.UNINITIALIZED_QUEEN

        if (isQueenPlaced) {
            // Add all of the crawl moves
            for (const pieceString in this.pieces) {

                let pointsToMoveTo = {};

                let pieceType = Piece.getType(pieceString);
                let thisPiecePoint = Piece.getPointString(pieceString);
                let thisPiecePlayerIndex = Piece.getPlayerIndex(pieceString);

                // If this is the other player's piece, skip it
                if (playerTurnIndex !== thisPiecePlayerIndex) {
                    // Still check if the piece is mobile for counting purposes (to estimate win probabilities) but then continue
                    if (this.canPieceMove(pieceString, numberOfPointsContainingPieces)) {
                        this.cachedMobilePieceCountByPlayer[thisPiecePlayerIndex]++;
                    }
                    continue;
                }

                // Store a list of neighboring piece types in case this is a mosquito
                let neighboringTypes = {};
                if (!isLight) {
                    if (pieceType === Piece.MOSQUITO) {
                        let surroundingPoints = Hive.getSurroundingPoints(Piece.getPointString(pieceString));
                        for (let point in surroundingPoints) {
                            let neighborPiece = this.getTopPieceAt(point);
                            if (neighborPiece !== PieceGrid.NO_PIECE) {
                                let type = Piece.getType(neighborPiece);
                                if (!neighboringTypes.hasOwnProperty(type)) {
                                    neighboringTypes[type] = "";
                                }
                            }
                        }
                    }
                }

                // Make sure the piece can move before considering points to which it could move
                if (this.canPieceMove(pieceString, numberOfPointsContainingPieces)) {

                    // Count that another piece for this player is mobile
                    this.cachedMobilePieceCountByPlayer[this.playerTurnIndex]++;

                    // If we are not exploring this gamestate to deeper moves, don't build a list of moves
                    if (isLight) {
                        continue;
                    }

                    // Ant moves
                    if (pieceType === Piece.ANT || (pieceType === Piece.MOSQUITO && neighboringTypes.hasOwnProperty(Piece.ANT) && Piece.getLevel(pieceString) === 0)) {
                        let emptiesOneRollAway = this.getEmptiesARollAway(thisPiecePoint);
                        for (let pointString in emptiesOneRollAway) {
                            pointsToMoveTo[pointString] = "";
                        }
                    }

                    // beetle moves
                    if (pieceType === Piece.BEETLE ||
                        pieceType === Piece.MOSQUITO &&
                        (Piece.getLevel(pieceString) > 0 || neighboringTypes.hasOwnProperty(Piece.BEETLE))) {
                        let surroundingPoints = Hive.getSurroundingPoints(thisPiecePoint);
                        let emptiesWithoutThisPiece = this.getEmptiesNRollsAway(thisPiecePoint, 1);
                        for (let pointString in surroundingPoints) {
                            if (emptiesWithoutThisPiece.hasOwnProperty(pointString) || this.getTopPieceAt(pointString) !== PieceGrid.NO_PIECE) {
                                pointsToMoveTo[pointString] = "";
                            }
                        }
                    }

                    // Spider moves
                    if (pieceType === Piece.SPIDER ||
                        (pieceType === Piece.MOSQUITO && neighboringTypes.hasOwnProperty(Piece.SPIDER) && !neighboringTypes.hasOwnProperty(Piece.ANT) && Piece.getLevel(pieceString) === 0)) {
                        let emptiesOneRollAway = this.getEmptiesNRollsAway(thisPiecePoint, 3);
                        for (let pointString in emptiesOneRollAway) {
                            pointsToMoveTo[pointString] = "";
                        }
                    }

                    // Grasshopper moves
                    if (pieceType === Piece.GRASSHOPPER || (pieceType === Piece.MOSQUITO && neighboringTypes.hasOwnProperty(Piece.GRASSHOPPER) && Piece.getLevel(pieceString) === 0)) {
                        let emptiesAJumpAway = this.getEmptiesAJumpAway(thisPiecePoint, this.cachedEmpties);
                        for (let pointString in emptiesAJumpAway) {
                            pointsToMoveTo[pointString] = "";
                        }
                    }

                    // Ladybug moves
                    if (pieceType === Piece.LADYBUG || (pieceType === Piece.MOSQUITO && neighboringTypes.hasOwnProperty(Piece.LADYBUG) && Piece.getLevel(pieceString) === 0)) {
                        let ladybugMoves = this.getLadyBugMoves(thisPiecePoint);
                        for (let pointString in ladybugMoves) {
                            pointsToMoveTo[pointString] = "";
                        }
                    }

                    // Queen moves and pillbug moves that aren't flipping another piece
                    if (pieceType === Piece.QUEEN || Piece.getType(pieceString) === Piece.PILLBUG ||
                        (pieceType === Piece.MOSQUITO && !neighboringTypes.hasOwnProperty(Piece.ANT) &&
                            (neighboringTypes.hasOwnProperty(Piece.QUEEN) || neighboringTypes.hasOwnProperty(Piece.PILLBUG) && Piece.getLevel(pieceString) === 0))) {
                        let emptiesOneRollAway = this.getEmptiesNRollsAway(thisPiecePoint, 1);
                        for (let pointString in emptiesOneRollAway) {
                            pointsToMoveTo[pointString] = "";
                        }
                    }
                }

                // Create moves from the points
                for (let pointString in pointsToMoveTo) {
                    let move = Move.build(pieceString, pointString);
                    // Make sure the new piece in the move has a level that puts it on top
                    let newPiece = Move.getNewPieceString(move);
                    newPiece = Piece.setLevel(newPiece, this.pieceGrid.getPiecesAt(pointString).length);
                    move = Move.setNewPieceString(move, newPiece);
                    this.cachedPossibleMoves[move] = "";
                }

                // Pillbug flips (moving a neighboring piece to a neighboring empty)
                if (Piece.getLevel(pieceString) === 0 && (pieceType === Piece.PILLBUG || (pieceType === Piece.MOSQUITO && neighboringTypes.hasOwnProperty(Piece.PILLBUG)))) {
                    let neighboringPiecesThatDidntJustMove = {};
                    let neighboringEmpties = {}
                    let surroundingPointStrings = Hive.getSurroundingPoints(thisPiecePoint);
                    for (let pointString in surroundingPointStrings) {
                        let neighboringPieceString = this.getTopPieceAt(pointString);
                        if (neighboringPieceString === PieceGrid.NO_PIECE) {
                            neighboringEmpties[pointString] = "";
                        } else {
                            if (this.moveHistory.length === 0 || neighboringPieceString !== Move.getNewPieceString(this.moveHistory[this.moveHistory.length - 1])) {
                                neighboringPiecesThatDidntJustMove[neighboringPieceString] = "";
                            }
                        }
                    }

                    for (let neighboringPieceString in neighboringPiecesThatDidntJustMove) {
                        // Remember, this.cachedPiecesThatAreBridges is not guaranteed to have all bridges, but
                        // this.cachedPiecesThatArentBridges is guaranteed to have all non-bridges
                        if (!this.cachedPiecesThatArentBridges.hasOwnProperty(neighboringPieceString)) {
                            continue;
                        }
                        for (let emptyPointString in neighboringEmpties) {
                            // Need to make sure the neighboring piece is not a bridge
                            let move = Move.buildString(
                                neighboringPieceString,
                                Piece.setPointString(neighboringPieceString, emptyPointString)
                            );
                            this.cachedPossibleMoves[move] = "";
                        }
                    }
                }
            }
        }

        // If there are no legal moves, manually add the MUST_PASS move
        if (Object.keys(this.cachedPossibleMoves).length === 0) {
            this.cachedPossibleMoves[Hive.MUST_PASS] = "";
        }
    }

    getPlaceableTypes() {

        let placeableTypes = {};

        let playerTurnIndex = this.playerTurnIndex;
        let queenIsUninitialized = this.queensByPlayer[playerTurnIndex] === Piece.UNINITIALIZED_QUEEN;
        if (queenIsUninitialized && this.pieceCountByPlayer[playerTurnIndex] === 3) {
            placeableTypes[Piece.QUEEN] = "";
        } else {
            for (let i = 0; i < Piece.PIECE_TYPES.length; i++) {
                let pieceType = Piece.PIECE_TYPES[i];
                let maxCount = Piece.PIECE_COUNTS[i];
                if (this.pieceCountsByPlayerByType[playerTurnIndex][pieceType] < maxCount) {
                    placeableTypes[pieceType] = "";
                }
            }
        }
        return placeableTypes;
    }

    getEstimatedWinningProbability(winningPlayerIndex, verbose) {

        if (typeof verbose === "undefined") {
            verbose = false;
        }

        let valuePerLiberty = 1;
        let valuePerMobilePiece = 1;
        let valuePerImmobilePiece = -1;
        let valuePerPieceCountAdvantage = 7.5;
        let valuePerSpawnPoint = 0.5;
        let noSpawnPointPenalty = -10;

        let playerValues = [0, 0];

        let totalPieceCount = this.cachedPieceCountByPlayer[0] + this.cachedPieceCountByPlayer[1];

        let queenLibertiesByPlayer = this.getQueenLibertiesByPlayerIndex();
        for (let playerIndex = 0; playerIndex < 2; playerIndex++) {

            let otherPlayerIndex = 1 - playerIndex;

            if (verbose) {
                console.log("I am player " + playerIndex);
            }
            let newPlayerValue = 0;
            // Queen liberties
            if (this.queensByPlayer[playerIndex] === Piece.UNINITIALIZED_QUEEN) {
                // console.log("Since queen is uninitialized, adding value of " + valuePerLiberty * 5 + " for player " + playerIndex);
                if (verbose) {
                    console.log("Since my queen is uninitialized, I get no liberty based bonus");
                }
            } else {
                // console.log("Since queen is initialized, adding value of " +
                //     valuePerLiberty * Math.pow(6 - queenLibertiesByPlayer[playerIndex], 2) + " for player " + playerIndex);
                // The use of -= here is intentional, since having fewer than 5 liberties on the queen is modeled as a penalty,
                // one which should be more severe the further from 5 the liberties count falls.
                let increment = -valuePerLiberty * Math.pow(5 - queenLibertiesByPlayer[playerIndex], 2);
                if (verbose) {
                    console.log("Since my queen is placed and I have " + queenLibertiesByPlayer[playerIndex] + " liberties, I get a value change "
                    + "of " + increment);
                }
                newPlayerValue += increment;
            }

            // Mobile piece counts
            let increment = valuePerMobilePiece * this.cachedMobilePieceCountByPlayer[playerIndex];
            if (verbose) {
                console.log("Since I have " + this.cachedMobilePieceCountByPlayer[playerIndex] + " mobile pieces, I get " + increment);
            }
            newPlayerValue += increment;

            // Immobile pieces
            let immobilePieceCount = this.pieceCountByPlayer[playerIndex] - this.cachedMobilePieceCountByPlayer[playerIndex];
            increment = this.pieceCountByPlayer[playerIndex] - this.cachedMobilePieceCountByPlayer[playerIndex];
            increment *= valuePerImmobilePiece;
            if (verbose) {
                console.log("Since I have " + immobilePieceCount + " immobile pieces, I get " + increment);
            }
            newPlayerValue += increment;

            // Piece count advantage
            let pieceCountAdvantage = this.cachedPieceCountByPlayer[playerIndex] - this.cachedPieceCountByPlayer[otherPlayerIndex];
            increment = valuePerPieceCountAdvantage * pieceCountAdvantage / totalPieceCount;
            if (verbose) {
                console.log("Since I have " + pieceCountAdvantage + " more pieces than my opponent, I get " + increment);
            }
            newPlayerValue += increment;

            // Spawn point count
            let playerSpawnPointCount = Object.keys(this.cachedEmptiesByPlayer[playerIndex]).length;
            increment = playerSpawnPointCount < 6 ? valuePerSpawnPoint * Math.sqrt(playerSpawnPointCount) : 0;
            if (verbose) {
                console.log("Since I have " + playerSpawnPointCount + " spawn points, I get " + increment);
            }
            newPlayerValue += increment;
            if (playerSpawnPointCount === 0) {
                increment = noSpawnPointPenalty;
                if (verbose) {
                    console.log("Since I have no spawn points, applying a penalty " + increment);
                }
                newPlayerValue += increment;
            }

            playerValues[playerIndex] = newPlayerValue;

        }
        // console.log("Working with these player values");
        // console.log(playerValues);
        // Apply model for winning probability
        let playerWhoseProbWeWantValue = playerValues[winningPlayerIndex];
        let otherPlayerValue = playerValues[1 - winningPlayerIndex];
        let scale = 0.5;
        let prob = 1 / (1 + Math.exp(-scale * (playerWhoseProbWeWantValue - otherPlayerValue)));
        if (prob === 0) {
            console.log("Found a game state I've definitely lost");
        }
        return prob;

    }

    getQueenLibertiesByPlayerIndex() {
        let result = [0, 0];
        for (let playerIndex = 0; playerIndex < 2; playerIndex++) {
            if (this.queensByPlayer[playerIndex] === Piece.UNINITIALIZED_QUEEN) {
                continue;
            }
            let surroundingPoints = Hive.getSurroundingPoints(Piece.getPointString(this.queensByPlayer[playerIndex]));
            for (let point in surroundingPoints) {
                if (this.pieceGrid.getTopPieceAt(point) === PieceGrid.NO_PIECE) {
                    result[playerIndex]++;
                }
            }
        }
        return result;
    }

    getTopPieceAt(point) {
        return this.pieceGrid.getTopPieceAt(point);
    }

    /**
     * This is a shorthand to force a game state without having to make valid moves to get there.
     * @param piece
     */
    forcePiece(piece) {
        let point = Piece.getPointString(piece);
        let playerIndex = Piece.getPlayerIndex(piece);
        let type = Piece.getType(piece);
        this.pieceGrid.putPieceAt(piece, point);
        // This order is important, since the line above will determine the level of the piece, which should be determined
        // before the piece is added to the hive's list of pieces.
        this.pieces[this.pieceGrid.getTopPieceAt(point)] = "";
        if (type === Piece.QUEEN) {
            this.queensByPlayer[playerIndex] = piece;
        }
        this.pieceCountsByPlayerByType[playerIndex][type] += 1;
        this.pieceCountByPlayer[playerIndex] += 1;
    }

    static getSurroundingPoints(centerPointString) {
        let points = {};
        let a = Point.getA(centerPointString);
        let b = Point.getB(centerPointString);
        points[(a + 1) + "," + b] = "";
        points[(a + 1) + "," + (b - 1)] = "";
        points[a + "," + (b - 1)] = "";
        points[(a - 1) + "," + b] = "";
        points[(a - 1) + "," + (b + 1)] = "";
        points[a + "," + (b + 1)] = "";
        return points;
    }

    cleanup() {
        this.updateCaches();
    }

}