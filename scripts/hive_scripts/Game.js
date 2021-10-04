
class Game {

    static UNINITIALIZED = "UNINITIALIZED"
    static NO_WINNER_PLAYER_INDEX = -1

    /**
     * The index of the player who can make the next move. This should be reset in {@link reset} and is only referenced
     * in this base class, never managed.
     * @type {int}
     */
    playerTurnIndex = Game.UNINITIALIZED

    treeSearchMaxDepth = 1;

    constructor () {
        if (this.constructor === Game) {
            Game.baseClassWarn();
        }
    }

    static baseClassWarn() {
        Base.baseClassWarn();
    }

    /**
     * Reinitializes the game so that an immediate call to {@link getMoves} would return opening moves that
     * the first player could make.
     */
    reset () {
        Game.baseClassWarn();
    }

    /**
     * Consider caching possible moves in the derived class if calculating possible moves is computationally expensive.
     * Also, it is critically important that this method return an empty list when the game is over.
     *
     * @returns a list of moves which are valid arguments for {@link makeMove}
     */
    getMoves() {
        Game.baseClassWarn();
    }

    /**
     * Evolve the gameState according to the current player making the move passed in
     * @param move - the move the current player makes
     */
    makeMove(move) {
        Game.baseClassWarn();
    }

    /**
     * Evolve the gameState according to the non-current player unmaking the move passed in
     * @param move - the move the other player should unmake
     */
    unmakeMove(move) {
        Game.baseClassWarn();
    }

    /**
     * @returns an equivalent copy of the game instance on which this method is called
     */
    copy() {
        Game.baseClassWarn();
    }

    /**
     * @returns the winning player index, or, {@link Game.NO_WINNER_PLAYER_INDEX} if stalemate or the game is ongoing
     */
    getWinningPlayerIndex() {
        Game.baseClassWarn();
    }

    /**
     * This method should be a FAST estimation of a player's winning probability.
     * @returns the probability that player playerIndex will win, as estimated from the current state of the game.
     * @param playerIndex
     */
    getEstimatedWinningProbability(playerIndex) {
        Game.baseClassWarn();
    }

    /**
     * This method changes the tree search max depth to the specified value. Without this method, a default is used.
     * @param depth - the max depth for the tree search.
     */
    setTreeSearchMaxDepth(depth) {
        this.treeSearchMaxDepth = depth;
    }

    /**
     * Method to be called after doing a tree search. Good for things like updating caches
     */
    cleanup() {
        Game.baseClassWarn();
    }

    getBestNMoves(n) {

        let bestMoves = [];
        let winProbabilities = [];
        for (let i = 0; i < n; i++) {
            bestMoves.push("");
            winProbabilities.push(-1);
        }

        let getLowestWinProbability = function() {
            let result = 2;
            let index = -1;
            for (let i = 0; i < n; i++) {
                let winProb = winProbabilities[i];
                if (winProb < result) {
                    result = winProb;
                    index = i;
                }
            }
            return [result, index];
        }

        let maxDepth = this.treeSearchMaxDepth;
        let indexOfPlayerContemplatingMove = this.playerTurnIndex;
        let possibleMoves = this.getMoves();
        if (Object.keys(possibleMoves).length === 0) {
            console.log("Call to Game.getBestMove() when there are no possible moves to make. Returning default.");
            return [null, null];
        }
        let result = getLowestWinProbability();
        let lowestWinProbability = result[0];
        let lowestWinIndex = result[1];
        for (let move in possibleMoves) {
            this.makeMove(move);
            let candidateMoveWinProbability = this.getWinProbabilityKernel(indexOfPlayerContemplatingMove, 1, maxDepth, lowestWinProbability);
            if (candidateMoveWinProbability > lowestWinProbability) {
                bestMoves[lowestWinIndex] = move;
                winProbabilities[lowestWinIndex] = candidateMoveWinProbability;
                result = getLowestWinProbability();
                lowestWinProbability = result[0];
                lowestWinIndex = result[1];
            }
            this.unmakeMove(move);
        }

        // Sort the best moves on win probability, if desired
        let listToReturn = [];
        for (let i = 0; i < n; i++) {
            listToReturn.push({ "move": bestMoves[i], "prob": winProbabilities[i] });
        }
        listToReturn.sort(function(a, b) {
            return a.prob === b.prob ? 0 : a.prob > b.prob;
        });

        // Make a list that has just the moves
        bestMoves = [];
        for (let i = 0; i < n; i++) {
            let listLine = listToReturn[i];
            bestMoves[i] = [listLine.move, listLine.prob];
        }
        this.cleanup();
        return bestMoves;
    }

    /**
     * This method performs a tree search with alpha beta pruning to find the best move from the current player's
     * perspective (i.e. the move in the current list of possible moves that maximizes the current player's probability)
     * of winning.
     *
     * @returns a 2 element array with the first being the best move and the second being the probability of winning.
     */
    getBestMove() {
        let maxDepth = this.treeSearchMaxDepth;
        let indexOfPlayerContemplatingMove = this.playerTurnIndex;
        let possibleMoves = this.getMoves();
        let possibleMovesString = "";
        for (let move in possibleMoves) {
            possibleMovesString += move + "<br/>";
        }
        // debug.innerHTML = possibleMovesString;
        // alert("Check again");
        if (Object.keys(possibleMoves).length === 0) {
            console.log("Call to Game.getBestMove() when there are no possible moves to make. Returning default.");
            return [null, null];
        }
        let bestMove = null;
        let winProbability = -1;
        for (let move in possibleMoves) {
            // let piecesString = "";
            // for (let piece in hive.pieces)
            //     piecesString += piece + "<br/>";
            this.makeMove(move);
            let playerIndexBeforeRecursion = this.playerTurnIndex;
            let candidateMoveWinProbability = this.getWinProbabilityKernel(indexOfPlayerContemplatingMove, 1, maxDepth, winProbability);
            if (playerIndexBeforeRecursion !== this.playerTurnIndex) {
                console.log("Returned from recursion with a new player index");
            }
            if (candidateMoveWinProbability > winProbability) {
                winProbability = candidateMoveWinProbability;
                bestMove = move;
            }
            if (this.playerTurnIndex === indexOfPlayerContemplatingMove) {
                console.log("Looks like I made a move (" + move + ") without the player index rolling");
                // let possibleMovesString = "";
                // for (let move in possibleMoves) {
                //     possibleMovesString += move + "<br/>";
                // }
                // possibleMovesString += "<br/><br/>Pieces<br/>" + piecesString;
                // alert(possibleMovesString);
            }
            this.unmakeMove(move);
            // if (this.playerTurnIndex !== indexOfPlayerContemplatingMove) {
            //     alert("Oh No! Unmaking a move didn't set the correct player index");
            // }
        }
        this.cleanup();
        return [bestMove, winProbability];
    }

    /**
     * This method is used only by {@link getBestMove} and performs the recursive tree search for the best move.
     *
     * @param playerIndex
     * @param game
     * @param depth
     * @param maxDepth
     *
     * @returns the probability of the current player winning the passed in game state
     */
    getWinProbabilityKernel(playerIndex, depth, maxDepth, uncleProbability) {

        // console.log("I'm at depth " + depth + " with the current player being " + this.playerTurnIndex + " and the " +
        //     "player whose win probability we're estimating is " + playerIndex);

        let playerIndexWhenIStarted = this.playerTurnIndex;

        if (this.isGameOver() || depth === maxDepth) {
            let probabilityOfWinning = 0;
            let winningPlayerIndex = this.getWinningPlayerIndex();
            if (winningPlayerIndex === Game.NO_WINNER_PLAYER_INDEX) {
                probabilityOfWinning = this.getEstimatedWinningProbability(playerIndex);
            }
            if (winningPlayerIndex === playerIndex) {
                probabilityOfWinning = 1;
            }
            this.playerTurnIndex !== playerIndexWhenIStarted ? console.log("3 - I'm returning a changed state") : "";
            return probabilityOfWinning;
        } else {
            // Handle non-max depth recursion

            // Select the min winning probability if player turn isn't player index, otherwise select max
            let playerIndexBeforeTrialMoves = this.playerTurnIndex;
            let isAPreferredToB = (a, b) => playerIndex === playerIndexBeforeTrialMoves ? a > b : b > a;

            let possibleMoves = this.getMoves();

            if (possibleMoves.length === 1) {
                console.log("Had to pass");
            }

            let winningProbability = -1;
            for (let move in possibleMoves) {
                // If making this move will land at the max depth, then do a "light" makeMove that skips calculating legal
                // subsequent moves.
                this.makeMove(move, depth === maxDepth - 1);
                let candidateWinningProbability = this.getWinProbabilityKernel(playerIndex, depth + 1, maxDepth, winningProbability);
                if (winningProbability === -1 || isAPreferredToB(candidateWinningProbability, winningProbability)) {
                    winningProbability = candidateWinningProbability;
                }
                this.unmakeMove(move);

                if (this.playerTurnIndex !== playerIndexWhenIStarted) {
                    console.log("I tried testing a move but came back with a different player index.");
                }

                // Alpha beta pruning
                if (uncleProbability !== -1 && isAPreferredToB(winningProbability, uncleProbability)) {
                    this.playerTurnIndex !== playerIndexWhenIStarted ? console.log("1 - I'm returning a changed state") : "";
                    return winningProbability;
                }
                this.playerTurnIndex !== playerIndexWhenIStarted ? console.log("After appraising move " + move + ", working with an altered state.") : "";
            }
            // TODO looks like we can get here with the player index permanently changed
            this.playerTurnIndex !== playerIndexWhenIStarted ? console.log("2 - I'm returning a changed state") : "";
            return winningProbability;
        }
    }

    isGameOver() {
        return (Object.keys(this.getMoves()).length === 0) || (this.getWinningPlayerIndex() !== Game.NO_WINNER_PLAYER_INDEX);
    }

    async getBestNMovesAsync(n, mainResultHolder) {

        let bestMoves = [];
        let winProbabilities = [];
        for (let i = 0; i < n; i++) {
            bestMoves.push("");
            winProbabilities.push(-1);
        }

        let getLowestWinProbability = function() {
            let result = 2;
            let index = -1;
            for (let i = 0; i < n; i++) {
                let winProb = winProbabilities[i];
                if (winProb < result) {
                    result = winProb;
                    index = i;
                }
            }
            return [result, index];
        }

        let maxDepth = this.treeSearchMaxDepth;
        let indexOfPlayerContemplatingMove = this.playerTurnIndex;
        let possibleMoves = this.getMoves();
        if (Object.keys(possibleMoves).length === 0) {
            console.log("Call to Game.getBestMove() when there are no possible moves to make. Returning default.");
            return [null, null];
        }
        let result = getLowestWinProbability();
        let lowestWinProbability = result[0];
        let lowestWinIndex = result[1];
        for (let move in possibleMoves) {
            this.makeMove(move);
            let resultHolder = [0];
            await this.getWinProbabilityKernelAsync(indexOfPlayerContemplatingMove, 1, maxDepth, lowestWinProbability, resultHolder);
            let candidateMoveWinProbability = resultHolder[0];
            if (candidateMoveWinProbability > lowestWinProbability) {
                bestMoves[lowestWinIndex] = move;
                winProbabilities[lowestWinIndex] = candidateMoveWinProbability;
                result = getLowestWinProbability();
                lowestWinProbability = result[0];
                lowestWinIndex = result[1];
            }
            this.unmakeMove(move);
        }

        // Sort the best moves on win probability, if desired
        let listToReturn = [];
        for (let i = 0; i < n; i++) {
            listToReturn.push({ "move": bestMoves[i], "prob": winProbabilities[i] });
        }
        listToReturn.sort(function(a, b) {
            return a.prob === b.prob ? 0 : a.prob > b.prob;
        });

        // Make a list that has just the moves
        bestMoves = [];
        for (let i = 0; i < n; i++) {
            let listLine = listToReturn[i];
            bestMoves[i] = [listLine.move, listLine.prob];
        }
        this.cleanup();
        mainResultHolder[0] = bestMoves;
    }

    /**
     * This method is used only by {@link getBestMove} and performs the recursive tree search for the best move.
     *
     * @param playerIndex
     * @param game
     * @param depth
     * @param maxDepth
     *
     * @returns the probability of the current player winning the passed in game state
     */
    async getWinProbabilityKernelAsync(playerIndex, depth, maxDepth, uncleProbability, mainResultHolder) {

        // console.log("I'm at depth " + depth + " with the current player being " + this.playerTurnIndex + " and the " +
        //     "player whose win probability we're estimating is " + playerIndex);

        let playerIndexWhenIStarted = this.playerTurnIndex;

        if (this.isGameOver() || depth === maxDepth) {
            let probabilityOfWinning = 0;
            let winningPlayerIndex = this.getWinningPlayerIndex();
            if (winningPlayerIndex === Game.NO_WINNER_PLAYER_INDEX) {
                probabilityOfWinning = this.getEstimatedWinningProbability(playerIndex);
            }
            if (winningPlayerIndex === playerIndex) {
                probabilityOfWinning = 1;
            }
            this.playerTurnIndex !== playerIndexWhenIStarted ? console.log("3 - I'm returning a changed state") : "";
            mainResultHolder[0] = probabilityOfWinning;
        } else {
            // Handle non-max depth recursion

            // Select the min winning probability if player turn isn't player index, otherwise select max
            let playerIndexBeforeTrialMoves = this.playerTurnIndex;
            let isAPreferredToB = (a, b) => playerIndex === playerIndexBeforeTrialMoves ? a > b : b > a;

            let possibleMoves = this.getMoves();

            if (possibleMoves.length === 1) {
                console.log("Had to pass");
            }

            let winningProbability = -1;
            let moveCount = 0;
            let checkPeriod = 30;
            for (let move in possibleMoves) {
                moveCount++;
                // If making this move will land at the max depth, then do a "light" makeMove that skips calculating legal
                // subsequent moves.
                this.makeMove(move, depth === maxDepth - 1);
                let resultHolder = [0];
                await this.getWinProbabilityKernelAsync(playerIndex, depth + 1, maxDepth, winningProbability, resultHolder);
                let candidateWinningProbability = resultHolder[0];
                if (winningProbability === -1 || isAPreferredToB(candidateWinningProbability, winningProbability)) {
                    winningProbability = candidateWinningProbability;
                }
                this.unmakeMove(move);

                if (moveCount % checkPeriod === 0 && depth === maxDepth - 1) {
                    await this.allowUpdate();
                }

                if (this.playerTurnIndex !== playerIndexWhenIStarted) {
                    console.log("I tried testing a move but came back with a different player index.");
                }

                // Alpha beta pruning
                if (uncleProbability !== -1 && isAPreferredToB(winningProbability, uncleProbability)) {
                    this.playerTurnIndex !== playerIndexWhenIStarted ? console.log("1 - I'm returning a changed state") : "";
                    mainResultHolder[0] = winningProbability;
                    return;
                }
                this.playerTurnIndex !== playerIndexWhenIStarted ? console.log("After appraising move " + move + ", working with an altered state.") : "";
            }
            // TODO looks like we can get here with the player index permanently changed
            this.playerTurnIndex !== playerIndexWhenIStarted ? console.log("2 - I'm returning a changed state") : "";
            mainResultHolder[0] =  winningProbability;
        }
    }

    allowUpdate() {
        return new Promise((f) => {
            setTimeout(f, 0);
        });
    }

}