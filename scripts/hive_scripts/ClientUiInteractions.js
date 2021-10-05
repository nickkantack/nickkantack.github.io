/**
 *
 * @param moveString - a String of the form "Q,0,0,1,0" which has comma separated elements representing the
 *                          piece type,
 * @returns - a String of similar form that specifies the move the AI makes
 */
function sendMoveToAi(moveString) {

    // Wrap in an async structure because getting the AI response could take a bit
    if (useBackend) {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let moveString = xhttp.responseText;
                makeMove(moveString, false);
            }
        };
        xhttp.open("POST", "/", true);
        xhttp.send(moveString);
    } else {
        // Check if the move is legal
        // console.log(hive.getMoves());
        hive.updateCaches();
        let byHuman = false;
        if (moveString === "MAKE_MOVE_FOR_ME") {
            // alert("Before making the move, the current player index was " + hive.playerTurnIndex);

            // Don't waste time getting the best move if there is already one available
            let moveFound = false;
            if (suggestedMovesByStrength.length !== 0) {
                // Currently, we'll tolerate a temporary block
                // TODO consider some UI indication that the AI is thinking
                for (let bundle of suggestedMovesByStrength) {
                    let move = bundle[0];
                    if (hive.getMoves().hasOwnProperty(move)) {
                        moveString = move;
                        moveFound = true;
                        break;
                    }
                }
            }
            if (!moveFound) {
                // Just generate a decent move on the fly
                hive.setTreeSearchMaxDepth(2);
                moveString = hive.getBestMove()[0];
            } else {
                console.log("Found a good cached move");
            }
        }
        if (!hive.getMoves().hasOwnProperty(moveString)) {
            byHuman = true;
            let listString = "";
            for (let move in hive.getMoves()) {
                listString += move + "</br>";
            }
            let pieceString = "";
            for (let piece in hive.pieces) {
                pieceString += piece + "\n";
            }
            if (moveString === Hive.MUST_PASS) {
                newNotification("Passing is not an option provided there are other legal moves you could make.", true);
            } else {
                newNotification("That is not a legal move.", true);
                // Need to recreate the piece in the old location, since by now it has been destroyed in anticipation of
                // being moved to a new location.
                let oldPiece = Move.getOldPieceString(moveString);
                let oldPoint = Piece.getPointString(oldPiece);
                createAPiece(paintStackManager, mouseManager, Piece.getType(oldPiece), Piece.getPlayerIndex(oldPiece), Point.getA(oldPoint),
                    Point.getB(oldPoint), Piece.getLevel(oldPiece));
                repaint();
            }
            // TODO could prompt for whether to freeze the AI and allow editing, or to just tell the AI
            //  to consider the new board state.
            return Hive.MUST_PASS;
        } else {
            hive.makeMove(moveString);
            makeMove(moveString, byHuman);
            // Check if we should notify the user that the next player must pass
            hive.updateCaches();
            if (Object.keys(hive.getMoves()).length === 1) {
                newNotification("The current player has no legal moves and must pass.", false);
            }

            // Check if the game is won
            if (hive.getWinningPlayerIndex() !== Game.NO_WINNER_PLAYER_INDEX) {
                console.log("Winner! player " + hive.getWinningPlayerIndex());
                updateProb(1 - hive.getWinningPlayerIndex());
            } else {
                console.log("No winner yet");
                scheduleAiAppraisal();
            }

        }
    }
}

/**
 * A move from the server has a piece type, player index, old x, old y, old level, new x, new y, new level
 * all in that order.
 * @param moveString
 */
function makeMove(moveString, byHuman) {

    moveString = decodeURIComponent(moveString);
    if (moveString !== Hive.MUST_PASS) {
        let parts = moveString.split(",");
        let type = parts[0];
        let playerIndex = parseInt(parts[1]);
        let oldX = parseInt(parts[2]);
        let oldY = parseInt(parts[3]);
        let oldLevel = parseInt(parts[4]);
        let newX = parseInt(parts[5]);
        let newY = parseInt(parts[6]);
        let newLevel = parseInt(parts[7]);

        //  deleted before we create a piece at the new location
        if (!byHuman) {
            for (let i = 0; i < pieces.length; i++) {
                let piece = pieces[i];
                let point = piece.centerPoint;
                let pieceCoordinates = board.getBoardIndicesFromPixelCoordinates(point);
                if (pieceCoordinates.getX() === oldX && pieceCoordinates.getY() === oldY && piece.level === oldLevel) {
                    // console.log("Deleting a piece");
                    // (piece);
                    deletePiece(piece);
                    // console.log("Piece deleted");
                }
            }
            createAPiece(paintStackManager, mouseManager, type, playerIndex, newX, newY, newLevel);
        }
    }

    // Remove all future snapshots (starting a new tree)
    snapshots.splice(snapshotIndex + 1, snapshots.length - snapshotIndex);
    // Note that snapshots has now changed length!
    moves.splice(snapshotIndex, moves.length - snapshotIndex);

    // Remove table rows of purely future moves and clear the right cell if appropriate
    let startingRowIndexToRemove = Math.floor((snapshotIndex + 1) / 2) + 1;
    while (moveTable.rows.length > startingRowIndexToRemove) {
        moveTable.removeChild(moveTable.rows[startingRowIndexToRemove]);
    }

    // Record all current pieces as a snapshot
    let snapshot = [];
    for (let i = 0; i < pieces.length; i++) {
        if (board.isOver(pieces[i].centerPoint)) {
            snapshot.push(pieces[i].copy());
        }
    }
    snapshots.push(snapshot);
    moves.push(moveString);
    snapshotIndex++;
    addMoveToTable(moveString);
    currentColor = hive.playerTurnIndex;
    repaint();
}

function getHiveCopy() {
    let hiveCopy = new Hive();
    for (let piece in hive.pieces) {
        hiveCopy.forcePiece(piece);
    }
    hiveCopy.playerTurnIndex = hive.playerTurnIndex;
    for (let move of hive.moveHistory) {
        hiveCopy.moveHistory.push(move);
    }
    hiveCopy.updateCaches();
    return hiveCopy;
}

function scheduleAiAppraisal() {

    // TODO broadcast hive.moveHistory.length and have Game listen on the periodic await and to terminate the current
    //  search if it is behind. This is a way to try to stop in-progress evaluation of old games staes in favor of
    //  starting evaluation of the current state.

    suggestedMovesByStrength = [];
    repaint();

    // TODO make a copy of hive to evaluate so that UI actions that change the hive don't conflict with the changes
    //  to the hive made by Game.js. Use this copy in all of the promises below.
    let hiveCopy;
    let promise = new Promise((resolve, reject) => {
        // Quick depth 2 search
        hiveCopy = getHiveCopy();
        hiveCopy.setTreeSearchMaxDepth(2);
        setTimeout(async function() {
            let resultHolder = [0];
            await hiveCopy.getBestNMovesAsync(numberOfMovesToSuggest, resultHolder);
            console.log("Low level: ");
            console.log(resultHolder[0]);
            resolve(resultHolder[0]);
        }, 0);
    });

    setTimeout(() => {
        promise.then(
            function(topMoves) {
                // Need to check if the hiveCopy and hive are at different states. If so, the UI has moved beyond
                // the state we just evaluated, so these move suggestions are not viable.
                if (hiveCopy.moveHistory.length === hive.moveHistory.length) {
                    // Don't update the probability if a player has won
                    if (hive.getWinningPlayerIndex() === Game.NO_WINNER_PLAYER_INDEX) {
                        updateProb(hive.playerTurnIndex ? 1 - topMoves[0][1] : topMoves[0][1]);
                        suggestedMovesByStrength = topMoves;
                        repaint();
                    }
                }

                doAsyncTreesearch3(false);

            }, handlePromiseError
        );
    }, 0);
}

function doAsyncTreesearch3(terminal) {
    // Initiate a deeper search
    let hiveCopy = getHiveCopy();
    let deeperPromise = new Promise((resolve, reject) => {
        hiveCopy.setTreeSearchMaxDepth(3);
        setTimeout(async function() {
            let resultHolder = [0];
            await hiveCopy.getBestNMovesAsync(numberOfMovesToSuggest, resultHolder);
            let topMoves = resultHolder[0];
            console.log("Top level: " + topMoves);
            resolve(topMoves);
        }, 100);
    });

    setTimeout(() => {
        deeperPromise.then(
            function(topMoves2) {
                if (hiveCopy.moveHistory.length === hive.moveHistory.length) {
                    // Don't show any updates if a player has won
                    if (hive.getWinningPlayerIndex() === Game.NO_WINNER_PLAYER_INDEX) {
                        updateProb(hive.playerTurnIndex ? 1 - topMoves2[0][1] : topMoves2[0][1]);
                        suggestedMovesByStrength = topMoves2;
                        repaint();
                    }
                } else {
                    // We'll try one more time to do the 3-deep tree search, otherwise we'll give it up
                    // since the UI is changing too quickly.
                    if (!terminal) {
                        doAsyncTreesearch3(true);
                    }

                }
            }, handlePromiseError
        );
    }, 0);
}

function pass() {
    sendMoveToAi(Hive.MUST_PASS);
}

function handlePromiseError(error) {
    console.log("Received error from AI appraisal promise. " + error);
}