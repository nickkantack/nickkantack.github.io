
function getProbString(probability) {
    return (100 * probability).toFixed(1) + "%";
}

function updateProb(probability) {

    // Provided the probability is not 1 or 0, we're going to smooth it out by averaging with 0.5 if the game is fresh
    let bias = 5;
    if (probability !== 0 && probability !== 1) {
        probability = probability * (snapshotIndex) / (snapshots.length + bias) + 0.5 * bias / (snapshots.length + bias);
    }

    let probString = getProbString(probability);
    prob.innerHTML = probString;
    whiteBar.style.width = probString;
    redBar.style.width = getProbString(1 - probability);
}
