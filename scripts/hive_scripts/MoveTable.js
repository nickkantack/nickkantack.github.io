
function addMoveToTable(moveString) {

    // Check if the move is a passing move

    let playerIndex = (moves.length - 1) % 2;

    if (playerIndex === 0) {
        // A new row is needed
        let row = document.createElement("tr");
        let cell1 = document.createElement("td");
        cell1.innerHTML = "" + (snapshotIndex / 2 + 0.5);
        row.appendChild(cell1);
        let cell2 = document.createElement("td");
        cell2.innerHTML = getMoveShorthand(moveString);
        row.appendChild(cell2);
        let cell3 = document.createElement("td");
        row.appendChild(cell3);
        moveTable.appendChild(row);
    } else {
        // Just add to the last row
        let row = moveTable.rows[moveTable.rows.length - 1];
        row.lastChild.innerHTML = getMoveShorthand(moveString);
    }
    // Scroll to bottom
    moveTableDiv.scrollTop = moveTableDiv.scrollHeight;
    updateTableHighlighting();
}

function getMoveShorthand(moveString) {
    if (moveString === Hive.MUST_PASS) {
        return "Must pass";
    }
    let oldPiece = Move.getOldPieceString(moveString);
    let newPiece = Move.getNewPieceString(moveString);
    let oldPoint = Piece.getPointString(oldPiece);
    let newPoint = Piece.getPointString(newPiece);
    return Piece.getType(newPiece) +
        (Point.getA(oldPoint) === Point.OFFBOARD ? ""
            : " <sub>" + Point.getA(oldPoint) + "</sub><sup>" + Point.getB(oldPoint) + "</sup>&#8594;") +
        "<sub>" + Point.getA(newPoint) + "</sub><sup>" + Point.getB(newPoint) + "</sup>";
}

function updateTableHighlighting() {
    // r = 1 to start since we skip the header row
    for (let r = 1; r < moveTable.rows.length; r++) {
        let row = moveTable.rows[r];
        for (let c = 0; c < row.children.length; c++) {
            let cell = row.children[c];
            cell.classList.remove("highlightedCell");
            // If this cell is in the future, fade the cell
            if (2 * (r - 1) + c > snapshotIndex) {
                cell.classList.add("fadedCell");
            } else {
                cell.classList.remove("fadedCell");
            }
        }
    }
    let rowIndex = Math.floor((snapshotIndex - 1) / 2) + 1;
    let cellIndex = 2 - snapshotIndex % 2;
    if (snapshotIndex > 0) {
        moveTable.rows[rowIndex].children[cellIndex].classList.add("highlightedCell");
    }
}