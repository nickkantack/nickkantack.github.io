function paintLattice(lattice, c, ctx){
	for (var i = 0; i < lattice.length; i++){
		var projections = getXYProjection(lattice[i], 3, Math.PI / 2, Math.PI / 2);
		paintPoint(projections[0], projections[1], 10, c, ctx);
	}
}
//--------------------------------------------------------------------------
function paintPoint(X, Y, size, c, ctx){
	//paint
	ctx.fillStyle = "#0000FF";
	ctx.strokeStyle = "#0000FF";
	ctx.beginPath();
	ctx.arc(X * c.width, Y * c.height, size, 0, 2 * Math.PI);
	ctx.fill();
	ctx.closePath();
}
//--------------------------------------------------------------------------
function rotateLattice(lattice, rotationAxisPoint, rotationAxisDirection, angle){
	for (var i = 0; i < lattice.length; i++){
		lattice[i] = rotate3D(lattice[i], rotationAxisPoint, rotationAxisDirection, angle);
	}
	return lattice;
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
