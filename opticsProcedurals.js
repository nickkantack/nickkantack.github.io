
// Fix the canvas
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
canvas.width  = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

function E(a){
	return document.getElementById(a);
}

function repaint(ctx){
	
	// Clear everything
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	
	for (opticIndex in optics){
		optics[opticIndex].paint(ctx);
	}
	for (sourceIndex in sources){
		sources[sourceIndex].paint(ctx);
		sources[sourceIndex].paintRay(ctx);
	}
	
	// Write instructions at the top
	ctx.fillStyle = '#FFFFFF';
	ctx.setFont = '20px Arial';
	ctx.fillText('Click and drag optical elements into the light rays to observer their influence', 10, 30);
	
}