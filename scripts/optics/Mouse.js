let mouseIsDown = false;
let mousePos = VectorFactory.create(0, 0);
let selectedObject;
let anObjectIsSelected = true;

let executeMouseDown = function(e) {
	if (!mouseIsDown){
		mouseIsDown = true;
	}
	let rect = canvas.getBoundingClientRect();
	let x = e.clientX || e.targetTouches[0].pageX;
	let y = e.clientY || e.targetTouches[0].pageY;
	mousePos.x = x - rect.left;
	mousePos.y = y - rect.top;
	// Select an object if necessary
	for (opticIndex in optics){
		if (mousePos.distanceTo(optics[opticIndex].pos) < optics[opticIndex].radius){
			anObjectIsSelected = true;
			selectedObject = optics[opticIndex];
			break;
		}
	}
	if (!anObjectIsSelected){
		for (sourceIndex in sources){
			if (mousePos.distanceTo(sources[sourceIndex].pos) < 10){
				anObjectIsSelected = true;
				selectedObject = sources[sourceIndex];
			}
		}
	}
}
canvas.addEventListener('mousedown', executeMouseDown);
canvas.addEventListener('touchstart', executeMouseDown);

let executeMouseUp = function(e) {
	if (mouseIsDown){
		mouseIsDown = false;
	}
	anObjectIsSelected = false;
}
canvas.addEventListener('mouseup', executeMouseUp);
canvas.addEventListener('touchend', executeMouseUp);

let executeMouseMove = function(e) {
	if (mouseIsDown){
		let rect = canvas.getBoundingClientRect();
		e.preventDefault();
		let x = e.clientX || e.targetTouches[0].pageX;
		let y = e.clientY || e.targetTouches[0].pageY;
		let newMousePosition = VectorFactory.create(x - rect.left, y - rect.top);
		let changeVector = newMousePosition.sub(mousePos);
		mousePos = newMousePosition;
		// If an object is selected, move its pos by the changeVector
		if (anObjectIsSelected){
			selectedObject.pos = selectedObject.pos.add(changeVector);
		}
		repaint(ctx);
	}
}
canvas.addEventListener('mousemove', executeMouseMove);
canvas.addEventListener('touchmove', executeMouseMove);