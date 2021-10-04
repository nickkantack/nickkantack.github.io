
let PaintStackManager = {
    create: function(parentCanvas, backgroundColor) {
        let result = {
            paintableObjects: [],
            parentCanvas: parentCanvas,
            ctx: parentCanvas.getContext("2d"),
            backgroundColor: backgroundColor,
            postPaint: (canvas, ctx) => {},
            register: function(object, paintMethod) {
                if (!object.hasOwnProperty("z")) {
                    object.z = this.paintableObjects.length;
                }
                object.getZ = function() {
                    return object.z;
                };
                object.setZ = function(newZ) {
                    object.z = newZ;
                };
                object.paintMethod = paintMethod;
                this.paintableObjects.push(object);
            },
            unregister: function(object) {
                this.paintableObjects.splice(this.paintableObjects.indexOf(object), 1);
            },
            paint: function() {

                // Paint background
                this.ctx.fillStyle = this.backgroundColor;
                this.ctx.fillRect(0, 0, this.parentCanvas.width, this.parentCanvas.height);

                // Calculate the paint order for the this.paintableObjects
                let paintOrder = [];
                for (let i = this.paintableObjects.length - 1; i >= 0; i--) {
                    paintOrder[i] = i;
                }

                // Sort on z, with higher z being painted last
                let outOfOrder = true;
                while (outOfOrder) {
                    outOfOrder = false;
                    for (let i = this.paintableObjects.length - 1; i >= 1; i--) {
                        if (this.paintableObjects[paintOrder[i]].getZ() > this.paintableObjects[paintOrder[i - 1]].getZ()) {
                            let buffer = paintOrder[i];
                            paintOrder[i] = paintOrder[i - 1];
                            paintOrder[i - 1] = buffer;
                            outOfOrder = true;
                            i = -1; // Short circuit to save time
                        }
                    }
                }

                // Paint every object
                for (let i = this.paintableObjects.length - 1; i >= 0; i--) {
                    this.paintableObjects[paintOrder[i]].paintMethod(this.parentCanvas, this.ctx);
                }

                let str = "";
                for (let i = this.paintableObjects.length - 1; i >= 0; i--) {
                    str += this.paintableObjects[paintOrder[i]].getZ();
                }

                this.postPaint(this.parentCanvas, this.ctx);

            },
            setPostPaint: function(postPaint) {
                this.postPaint = postPaint;
            }
        }

        // Perform the initial scaling needed to prevent canvas distortion
        result.parentCanvas.width  = result.parentCanvas.offsetWidth;
        result.parentCanvas.height = result.parentCanvas.offsetHeight;

        // Set a listener for the window resizing that will trigger canvas rescaling and repainting
        window.addEventListener("resize", function() {
            result.parentCanvas.width  = result.parentCanvas.offsetWidth;
            result.parentCanvas.height = result.parentCanvas.offsetHeight;
            result.paint();
        });

        return result;

    }
}
