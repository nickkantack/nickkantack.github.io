
class QuantumDiagram {

    static DEFAULT_QUBIT_SEPARATION = 30;

    #mainSvg;
    #numberOfQubits;
    #stageWidths;
    #qubitSeparationProfile;
    #color;

    constructor(mainSvg, numberOfQubits, qubitSeparationProfile, color) {
        this.#mainSvg = mainSvg;
        this.#stageWidths = [];
        this.#numberOfQubits = numberOfQubits;
        this.#qubitSeparationProfile = qubitSeparationProfile || Array(numberOfQubits).fill(QuantumDiagram.DEFAULT_QUBIT_SEPARATION);
        let totalHeight = 0;
        for (let i = 0; i < this.#qubitSeparationProfile.length; i++) {
            totalHeight += this.#qubitSeparationProfile[i];
        }
        this.#mainSvg.setAttribute(`height`, totalHeight + 2);
        this.#color = color;
    }

    setWidths(widths) {
        this.#stageWidths = widths;
        let totalWidth = 0;
        for (let i = 0; i < this.#stageWidths.length; i++) {
            totalWidth += this.#stageWidths[i];
        }
        let yCursor = 0;
        for (let i = 0; i < this.#numberOfQubits; i++) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute(`d`, `M0 ${yCursor + this.#qubitSeparationProfile[i] / 2} H${totalWidth}`);
            path.setAttribute(`stroke`, this.#color || `#000`)
            this.#mainSvg.appendChild(path);
            yCursor += this.#qubitSeparationProfile[i];
        }
        this.#mainSvg.setAttribute(`width`, totalWidth);
    }

    addGate(gate, stage, description) {
        if (stage > this.#stageWidths.length) {
            throw Error(`Cannot add gate to stage ${stage} for circuit with ${this.#stageWidths.length} stages`);
        }

        gate.render(this.#mainSvg, this.#stageWidths, this.#qubitSeparationProfile, stage);

        if (description) {
            const parentDiv = this.#mainSvg.parentNode;
            const gateDiv = document.createElement("div");
            let xStart = QuantumDiagram.getXOriginForStage(this.#stageWidths, stage);
            const xMargin = 4;
            const yMargin = 20;
            gateDiv.style = `position: absolute; top: ${this.#mainSvg.height.baseVal.value + yMargin}px; left: ${xStart + xMargin}px; height: 300px; writing-mode: vertical-rl; text-orientation: mixed; background: #fff;`;
            gateDiv.innerHTML = description;
            parentDiv.appendChild(gateDiv);
        }
    }

    addBox(startStage, endStage, minQubit, maxQubit, labelText, color, borderColor) {
        const startX = QuantumDiagram.getXOriginForStage(this.#stageWidths, startStage);
        const endX = QuantumDiagram.getXOriginForStage(this.#stageWidths, endStage >= this.#stageWidths.length ? endStage : endStage + 1) + (endStage >= this.#stageWidths.length ? QuantumDiagram.DEFAULT_QUBIT_SEPARATION : 0);
        const startY = QuantumDiagram.getYOriginForQubit(this.#qubitSeparationProfile, minQubit);
        const endY = QuantumDiagram.getYOriginForQubit(this.#qubitSeparationProfile, maxQubit >= this.#qubitSeparationProfile.length ? maxQubit : maxQubit + 1) + (maxQubit > this.#qubitSeparationProfile.length ? QuantumDiagram.DEFAULT_QUBIT_SEPARATION : 0);
        const box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        box.setAttribute(`stroke`, borderColor || `none`);
        box.setAttribute(`stroke-dasharray`, `6 6 6 6`);
        box.setAttribute(`fill`, color || `none`);
        box.setAttribute(`x`, startX);
        box.setAttribute(`y`, startY + 3);
        box.setAttribute(`width`, endX - startX - 3);
        box.setAttribute(`height`, endY - startY - 3);
        this.#mainSvg.appendChild(box);
        if (labelText) {
            const labelDiv = document.createElement("div");
            const xOffset = (this.#mainSvg.parentNode.offsetWidth - this.#mainSvg.getAttribute(`width`)) / 2;
            labelDiv.style = `position: absolute; top: -20px; left: ${xOffset + (startX + endX) / 2}px; transform: translate(-50%, -50%); width: ${endX - startX}px; text-align: center; background: #fff;`;
            labelDiv.innerHTML = labelText;
            this.#mainSvg.parentNode.appendChild(labelDiv);
        }
    }

    static getXOriginForStage(stageWidths, stage) {
        let xStart = 0;
        for (let i = 0; i < stage; i++) {
            xStart += stageWidths[i];
        }
        return xStart;
    }

    static getYOriginForQubit(qubitSeparationProfile, qubit) {
        let yStart = 0;
        for (let i = 0; i < qubit; i++) {
            yStart += qubitSeparationProfile[i];
        }
        return yStart;
    }

}

class LetterGate {

    #qubit;
    #text;
    #color;
    #backgroundColor;

    constructor(qubit, text, color, backgroundColor) {
        this.#qubit = qubit;
        this.#text = text;
        this.#color = color;
        this.#backgroundColor = backgroundColor;
    }

    render(mainSvg, stageWidths, qubitSeparationProfile, stage) {

        const parentDiv = mainSvg.parentNode;
        const gateDiv = document.createElement("div");
        let xStart = QuantumDiagram.getXOriginForStage(stageWidths, stage);
        let yStart = QuantumDiagram.getYOriginForQubit(qubitSeparationProfile, this.#qubit);
        const xMargin = 4;
        const width = stageWidths[stage];
        const xOffset = (parentDiv.offsetWidth - mainSvg.getAttribute(`width`)) / 2;
        gateDiv.style = `position: absolute; display: block; z-index: 9; top: ${yStart + qubitSeparationProfile[this.#qubit] / 2}px; left: ${xOffset + xStart}px; transform: translate(${xMargin / 2}px, -50%); width: ${width - xMargin}px; border: 1px solid ${this.#color || "#000"}; text-align: center; background: ${this.#backgroundColor || "#fff"}; color: ${this.#color || "#000"}; font-size: ${width / 2.5}px`;
        gateDiv.innerHTML = this.#text;
        parentDiv.appendChild(gateDiv);
    }
}

class X extends LetterGate {

    constructor(qubit, color, backgroundColor) {
        super(qubit, "\\(X\\)", color, backgroundColor);
    }

}

class X2 {

    #qubit;
    #color;

    constructor(qubit, color) {
        this.#qubit = qubit;
        this.#color = color;
    }

    render(mainSvg, stageWidths, qubitSeparationProfile, stage) {

        let centerX = QuantumDiagram.getXOriginForStage(stageWidths, stage) + stageWidths[stage] / 2;
        const xCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        let centerY = QuantumDiagram.getYOriginForQubit(qubitSeparationProfile, this.#qubit);
        xCircle.setAttribute(`r`, `10`);
        xCircle.setAttribute(`cx`, centerX);
        xCircle.setAttribute(`cy`, centerY + qubitSeparationProfile[this.#qubit] / 2);
        xCircle.setAttribute(`stroke`, this.#color || `#000`);
        xCircle.setAttribute(`fill`, `none`);
        const verticalLineToMakeCross = document.createElementNS("http://www.w3.org/2000/svg", "path");
        verticalLineToMakeCross.setAttribute(`stroke`, this.#color || `#000`);
        verticalLineToMakeCross.setAttribute(`d`, `M ${centerX} ${centerY + qubitSeparationProfile[this.#qubit] / 2 - 10} V${centerY + qubitSeparationProfile[this.#qubit] / 2 + 10}`);
        const horizontalLineToMakeCross = document.createElementNS("http://www.w3.org/2000/svg", "path");
        horizontalLineToMakeCross.setAttribute(`stroke`, this.#color || `#000`);
        horizontalLineToMakeCross.setAttribute(`d`, `M ${centerX - 10} ${centerY + qubitSeparationProfile[this.#qubit] / 2} H${centerX + 10}`);
        mainSvg.appendChild(xCircle);
        mainSvg.appendChild(verticalLineToMakeCross);
        mainSvg.appendChild(horizontalLineToMakeCross);

    }
}

class Ry extends LetterGate {

    constructor(qubit, color, backgroundColor) {
        super(qubit, "\\(R_{y}^\\alpha\\)", color, backgroundColor);
    }

}

class H extends LetterGate {

    constructor(qubit, color, backgroundColor) {
        super(qubit, "\\(H\\)", color, backgroundColor);
    }

}

class Z extends LetterGate {

    constructor(qubit, color, backgroundColor) {
        super(qubit, "\\(Z\\)", color, backgroundColor);
    }

}

class Cnot {

    #controlQubits;
    #controlQubitSigns;
    #targetQubit;
    #xGate;
    #color;
    #backgroundColor;

    constructor(controlQubits, controlQubitSigns, targetQubit, color, backgroundColor) {
        this.#controlQubits = controlQubits;
        this.#controlQubitSigns = controlQubitSigns;
        this.#targetQubit = targetQubit;
        // this.#xGate = new X(targetQubit);
        this.#xGate = new X2(targetQubit, color);
        this.#color = color;
        this.#backgroundColor = backgroundColor;
    }

    render(mainSvg, stageWidths, qubitSeparationProfile, stage) {

        let centerX = QuantumDiagram.getXOriginForStage(stageWidths, stage) + stageWidths[stage] / 2;

        // Vertical Bar - render first so things go over it
        let minControlQubit = null;
        let maxControlQubit = null;
        for (let qubit of this.#controlQubits) {
            if (minControlQubit === null || qubit < minControlQubit) {
                minControlQubit = qubit;
            }
            if (maxControlQubit === null || qubit > maxControlQubit) {
                maxControlQubit = qubit;
            }
        }
        if (this.#targetQubit > maxControlQubit) {
            maxControlQubit = this.#targetQubit;
        }
        if (this.#targetQubit < minControlQubit) {
            minControlQubit = this.#targetQubit;
        }
        let minVerticalReach = QuantumDiagram.getYOriginForQubit(qubitSeparationProfile, minControlQubit);
        let maxVerticalReach = QuantumDiagram.getYOriginForQubit(qubitSeparationProfile, maxControlQubit);
        const verticalPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        verticalPath.setAttribute(`stroke`, this.#color || `#000`);
        verticalPath.setAttribute(`d`, `M${centerX} ${minVerticalReach + qubitSeparationProfile[minControlQubit] / 2} V${maxVerticalReach + qubitSeparationProfile[maxControlQubit] / 2}`);
        mainSvg.appendChild(verticalPath);

        // Dot
        for (let j = 0; j < this.#controlQubits.length; j++) {
            const controlQubit = this.#controlQubits[j];
            const dotPath = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            let centerY = QuantumDiagram.getYOriginForQubit(qubitSeparationProfile, controlQubit);
            dotPath.setAttribute(`r`, `5`);
            dotPath.setAttribute(`cx`, centerX);
            dotPath.setAttribute(`cy`, centerY + qubitSeparationProfile[controlQubit] / 2);
            dotPath.setAttribute(`stroke`, this.#color || `#000`);
            dotPath.setAttribute(`fill`, this.#controlQubitSigns[j] ? (this.#color || `#000`) : (this.#backgroundColor || `#fff`));
            mainSvg.appendChild(dotPath);
        }

        this.#xGate.render(mainSvg, stageWidths, qubitSeparationProfile, stage);

    }

}

class Cswap {

    #controlQubits;
    #controlQubitSigns;
    #targetQubits;
    #color;
    #backgroundColor;

    constructor(controlQubits, controlQubitSigns, targetQubits, color, backgroundColor) {
        this.#controlQubits = controlQubits;
        this.#controlQubitSigns = controlQubitSigns;
        if (targetQubits.length !== 2) {
            throw Error(`Cswap must have exactly 2 target qubits but you gave ${targetQubits.length}`);
        }
        this.#targetQubits = targetQubits;
        this.#color = color;
        this.#backgroundColor = backgroundColor;
    }

    render(mainSvg, stageWidths, qubitSeparationProfile, stage) {

        let centerX = QuantumDiagram.getXOriginForStage(stageWidths, stage) + stageWidths[stage] / 2;

        // Vertical Bar - render first so things go over it
        let minControlQubit = null;
        let maxControlQubit = null;
        for (let qubit of this.#controlQubits) {
            if (minControlQubit === null || qubit < minControlQubit) {
                minControlQubit = qubit;
            }
            if (maxControlQubit === null || qubit > maxControlQubit) {
                maxControlQubit = qubit;
            }
        }
        for (let targetQubit of this.#targetQubits) {
            if (targetQubit > maxControlQubit) {
                maxControlQubit = targetQubit;
            }
            if (targetQubit < minControlQubit) {
                minControlQubit = targetQubit;
            }
        }
        let minVerticalReach = QuantumDiagram.getYOriginForQubit(qubitSeparationProfile, minControlQubit);
        let maxVerticalReach = QuantumDiagram.getYOriginForQubit(qubitSeparationProfile, maxControlQubit);
        const verticalPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        verticalPath.setAttribute(`stroke`, this.#color || `#000`);
        verticalPath.setAttribute(`d`, `M${centerX} ${minVerticalReach + qubitSeparationProfile[minControlQubit] / 2} V${maxVerticalReach + qubitSeparationProfile[maxControlQubit] / 2}`);
        mainSvg.appendChild(verticalPath);

        // Dot
        for (let j = 0; j < this.#controlQubits.length; j++) {
            const controlQubit = this.#controlQubits[j];
            const dotPath = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            let centerY = QuantumDiagram.getYOriginForQubit(qubitSeparationProfile, controlQubit);
            dotPath.setAttribute(`r`, `5`);
            dotPath.setAttribute(`cx`, centerX);
            dotPath.setAttribute(`cy`, centerY + qubitSeparationProfile[controlQubit] / 2);
            dotPath.setAttribute(`stroke`, this.#color || `#000`);
            dotPath.setAttribute(`fill`, this.#controlQubitSigns[j] ? (this.#color || `#000`) : (this.#backgroundColor || `#fff`));
            mainSvg.appendChild(dotPath);
        }
        
        // Swap x's
        for (let j = 0; j < this.#targetQubits.length; j++) {
            const targetQubit = this.#targetQubits[j];
            const dotPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            let centerY = QuantumDiagram.getYOriginForQubit(qubitSeparationProfile, targetQubit);
            let offsetY = centerY + qubitSeparationProfile[targetQubit] / 2;
            dotPath.setAttribute(`d`, `M${centerX - 10} ${offsetY - 10}L${centerX + 10} ${offsetY + 10}M${centerX - 10} ${offsetY + 10}L${centerX + 10} ${offsetY - 10}`);
            dotPath.setAttribute(`stroke`, this.#color || `#000`);
            mainSvg.appendChild(dotPath);
        }

    }

}