var mouseIsDown = false;
var mousePos = VectorFactory.create(0, 0);
var selectedObject;
var anObjectIsSelected = true;

canvas.addEventListener('mousedown', function(e){
	if (!mouseIsDown){
		mouseIsDown = true;
	}
	var rect = canvas.getBoundingClientRect();
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
		var rect = canvas.getBoundingClientRect();
		var newMousePosition = VectorFactory.create(e.clientX - rect.left, e.clientY - rect.top);
		var changeVector = newMousePosition.sub(mousePos);
		mousePos = newMousePosition;
		// If an object is selected, move its pos by the changeVector
		if (anObjectIsSelected){
			selectedObject.pos = selectedObject.pos.add(changeVector);
		}
		repaint(ctx);
	}
});