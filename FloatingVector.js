function createFloatingVector(origin, direction, length, color){
	
	var floatingVector = {
		
		origin: origin,
		direction: direction,
		length: length,
		color: color
	}
	
	return floatingVector;
}
//--------------------------------------------------------------------------
function paintFloatingVector(floatingVector, c, ctx){
	
		var projections = getXYProjection(floatingVector.origin, yob, XFOVangle, YFOVangle);
		var projections2 = getXYProjection(add(scale(unit(floatingVector.direction), floatingVector.length), floatingVector.origin), yob, XFOVangle, YFOVangle);

		ctx.beginPath();
		ctx.strokeStyle = floatingVector.color;
		ctx.moveTo(projections[0] * c.width, projections[1] * c.height);
		ctx.lineTo(projections2[0] * c.width, projections2[1] * c.height);
		ctx.stroke();

}
//--------------------------------------------------------------------------
function rotateFloatingVector(floatingVector, rotationAxisPoint, rotationAxisDirection, angle){

	var coordinateOrigin = [0, 0, 0];
	
	var newOrigin = rotate3D(floatingVector.origin, rotationAxisPoint, rotationAxisDirection, angle);
	var newDirection = rotate3D(floatingVector.direction, coordinateOrigin, rotationAxisDirection, angle);
	return createFloatingVector(newOrigin, newDirection, floatingVector.length, floatingVector.color);
	
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
