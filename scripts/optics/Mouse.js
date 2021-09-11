let mouseIsDown = false;
let mousePos = VectorFactory.create(0, 0);
let selectedObject;
let anObjectIsSelected = true;

canvas.addEventListener('mousedown', function(e){
	if (!mouseIsDown){
		mouseIsDown = true;
	}
	let rect = canvas.getBoundingClientRect();
	mousePos.x = e.clientX - rect.left;
	mousePos.y = e.clientY - rect.top;
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
});

canvas.addEventListener('mouseup', function(e){
	if (mouseIsDown){
		mouseIsDown = false;
	}
	anObjectIsSelected = false;
});

canvas.addEventListener('mousemove', function(e){
	if (mouseIsDown){
		let rect = canvas.getBoundingClientRect();
		let newMousePosition = VectorFactory.create(e.clientX - rect.left, e.clientY - rect.top);
		let changeVector = newMousePosition.sub(mousePos);
		mousePos = newMousePosition;
		// If an object is selected, move its pos by the changeVector
		if (anObjectIsSelected){
			selectedObject.pos = selectedObject.pos.add(changeVector);
		}
		repaint(ctx);
	}
});